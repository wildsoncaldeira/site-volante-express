/**
 * Gerador de Páginas Locais, Documentação Agentic e Sitemap para Volante Express
 * 
 * Lê os dados canônicos de data/cidades.json e gera:
 * 1. 28 páginas HTML locais (revestimento-de-volante-<slug>.html)
 * 2. 28 páginas Markdown para agentes (revestimento-de-volante-<slug>.md)
 * 3. sitemap.xml com lastmod real via git e sem tags obsoletas
 * 4. Listas sincronizadas em llms.txt, llms-full.txt e index.md
 * 
 * Execução: node scripts/generate-cities.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const cidadesPath = path.join(__dirname, '../data/cidades.json');
const cidades = JSON.parse(fs.readFileSync(cidadesPath, 'utf8'));

const totalCidades = cidades.length;
const outrasCidadesCount = totalCidades - 1;

// Agrupamento por região
const regioes = {
  'Grande BH': cidades.filter(c => c.regiao === 'Grande BH'),
  'Central e Vetor Norte': cidades.filter(c => c.regiao === 'Central e Vetor Norte'),
  'Centro-Oeste': cidades.filter(c => c.regiao === 'Centro-Oeste'),
  'Alto Paraopeba': cidades.filter(c => c.regiao === 'Alto Paraopeba')
};

function getFileLastmod(filePath) {
  try {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      const gitDate = execSync(`git log -1 --format=%cs -- "${filePath}"`, { cwd: rootDir, encoding: 'utf8' }).trim();
      if (gitDate && /^\d{4}-\d{2}-\d{2}$/.test(gitDate)) {
        return gitDate;
      }
    }
  } catch (e) {}
  return new Date().toISOString().split('T')[0];
}

function getCitySeo(cidade, index) {
  const isDiv = cidade.slug === 'divinopolis';
  const isBH = cidade.slug === 'belo-horizonte';
  const style = index % 4;

  let title = '';
  let desc = '';
  let heroH1 = '';
  let heroSub = '';
  let difTitle = '';

  if (isBH) {
    title = 'Revestimento de Volantes em Belo Horizonte — Sede Volante Express (45 min)';
    desc = 'Revestimento de volante em couro sintético em BH na sede Cidade Nova. Atendimento de segunda a sábado em 45 minutos sem retirar a peça e com airbag preservado.';
    heroH1 = `Revestimento de Volantes em Belo Horizonte — Sede Cidade Nova.<br><span class="accent">Tudo pronto em 45 minutos.</span>`;
    heroSub = `Atendimento diário de segunda a sábado na nossa sede no bairro Cidade Nova. Trabalho artesanal de precisão sem remover a barra de direção e com airbag 100% preservado.`;
    difTitle = `Sede própria em Belo Horizonte com especialistas e 1 ano de garantia`;
  } else if (isDiv) {
    title = 'Revestimento de Volante em Divinópolis MG — Atendimento Semanal aos Sábados';
    desc = 'Revestimento artesanal de volante em Divinópolis semanalmente aos sábados na Rodoviária. Feito em 45 min no carro com airbag preservado e 1 ano de garantia.';
    heroH1 = `Revestimento de Volante em Divinópolis MG — Atendimento Semanal.<br><span class="accent">Feito em 45 minutos no seu veículo.</span>`;
    heroSub = `Atendimento presencial semanalmente aos sábados no estacionamento da Rodoviária de Divinópolis. Trabalho artesanal individual com agendamento prévio, sem filas e com 1 ano de garantia total.`;
    difTitle = `Atendimento exclusivo aos sábados em Divinópolis MG`;
  } else if (style === 0) {
    title = `Revestimento de Volante em ${cidade.nome} MG — 45 Minutos | Volante Express`;
    desc = `Renove o volante do seu carro em ${cidade.nome} MG com o Volanteiro. Atendimento ${cidade.frequencia.toLowerCase()}${cidade.ponto_apoio ? ' no ' + cidade.ponto_apoio : ''} sem remover a peça e com 1 ano de garantia.`;
    heroH1 = `Revestimento de Volantes em ${cidade.nome} sem tirar a peça do carro.<br><span class="accent">Tudo em 45 minutos.</span>`;
    heroSub = `Você agenda seu horário pelo WhatsApp, comparece ao ponto de apoio credenciado em ${cidade.nome} e acompanha o serviço do início ao fim. Trabalho artesanal feito no veículo, sem mexer no airbag e com 1 ano de garantia total.`;
    difTitle = `O serviço do Volanteiro em ${cidade.nome}:<br>precisão artesanal, resultado de fábrica`;
  } else if (style === 1) {
    title = `Volanteiro em ${cidade.nome} MG — Revestimento em Couro Sintético na Hora`;
    desc = `Especialista em revestimento artesanal de volantes atendendo em ${cidade.nome} MG. Costura manual no veículo em 45 minutos com airbag 100% preservado. Reserve seu horário!`;
    heroH1 = `Volanteiro Profissional em ${cidade.nome}: couro sintético sob medida.<br><span class="accent">Pronto em 45 minutos.</span>`;
    heroSub = `Renove o volante do seu carro em ${cidade.nome} com atendimento individual e hora marcada. Nosso técnico executa o trabalho na sua presença, preservando totalmente a eletrônica e os comandos originais.`;
    difTitle = `Por que motoristas de ${cidade.nome} confiam no Volanteiro?`;
  } else if (style === 2) {
    title = `Capa de Volante Costurada em ${cidade.nome} MG — Sem Tirar a Peça`;
    desc = `Capa automotiva sob medida para o volante do seu carro em ${cidade.nome}. Acabamento fino, comandos de som preservados e garantia total de 1 ano. Atendimento com hora marcada.`;
    heroH1 = `Capa de Volante Costurada sob Medida em ${cidade.nome}.<br><span class="accent">Sem desmontar o volante do carro.</span>`;
    heroSub = `Diga adeus às capas universais que escorregam e desbotam. Em ${cidade.nome}, aplicamos acabamento automotivo justo ao aro, com cola PVA de alta fixação e costura manual milimétrica.`;
    difTitle = `Padrão de fábrica e conforto para o seu carro em ${cidade.nome}`;
  } else {
    title = `Reforma e Revestimento de Volante em ${cidade.nome} — Volante Express`;
    desc = `Serviço especializado de revestimento de volante em ${cidade.nome} MG. Pronto em 45 minutos na sua frente${cidade.ponto_apoio ? ' no ' + cidade.ponto_apoio : ''}, sem fila e sem burocracia. Agende pelo WhatsApp.`;
    heroH1 = `Reforma e Restauração de Volantes em ${cidade.nome} MG.<br><span class="accent">Acabamento impecável em 45 minutos.</span>`;
    heroSub = `Recupere a pegada original do volante desgastado pelo sol ou uso em ${cidade.nome}. Serviço prático, limpo e seguro realizado no próprio dia, acompanhado de certificado de 1 ano de garantia.`;
    difTitle = `Restauração técnica de volantes em ${cidade.nome} com garantia real`;
  }

  const keywords = `revestimento de volante ${cidade.nome.toLowerCase()}, capa de volante ${cidade.nome.toLowerCase()}, volanteiro ${cidade.nome.toLowerCase()}, volante couro ${cidade.nome.toLowerCase()}, reforma de volante ${cidade.nome.toLowerCase()}, volante express ${cidade.nome.toLowerCase()}`;

  return { title, desc, keywords, heroH1, heroSub, difTitle };
}

function generateCityHtml(cidade, index) {
  const isDivinopolis = cidade.nome === 'Divinópolis';
  const isBH = cidade.nome === 'Belo Horizonte';
  const seo = getCitySeo(cidade, index);

  const frequenciaBadge = isDivinopolis
    ? '📅 Atendimento Semanal aos Sábados em Divinópolis'
    : isBH
    ? '📅 Sede Central · Atendimento Diário em Belo Horizonte'
    : `📅 Atendimento ${cidade.frequencia} em ${cidade.nome}`;

  const ctaWaMsg = `Olá! Vim pelo site e gostaria de saber a próxima data de atendimento em ${cidade.nome}`;
  const ctaWaUrl = `https://wa.me/5531996294103?text=${encodeURIComponent(ctaWaMsg)}`;
  const btnHeroText = isDivinopolis ? 'Ver Próximo Sábado Disponível' : `Ver Próxima Data em ${cidade.nome}`;

  // Cidades vizinhas
  const vizinhasList = (cidade.vizinhas || [])
    .map(slug => cidades.find(c => c.slug === slug))
    .filter(Boolean);

  const vizinhasHtml = vizinhasList.map(v => `
        <a href="/revestimento-de-volante-${v.slug}" class="vizinha-card">
          <div class="vizinha-nome">${v.nome}</div>
          <div class="vizinha-freq">${v.frequencia} (${v.dias})</div>
          <div class="vizinha-ponto">${v.ponto_apoio ? v.ponto_apoio : 'Ponto credenciado sob agendamento'}</div>
          <span class="vizinha-arrow">&rarr; Ver detalhes</span>
        </a>`).join('');

  // Blocos opcionais
  let optionalHtml = '';
  if (cidade.fotos && cidade.fotos.length > 0) {
    optionalHtml += `
    <div class="cidade-fotos-custom">
      <h3>Trabalhos Realizados em ${cidade.nome}</h3>
      <div class="fotos-grid">
        ${cidade.fotos.map(f => `<img src="${f.src}" alt="${f.alt || 'Volante revestido em ' + cidade.nome}" loading="lazy">`).join('')}
      </div>
    </div>`;
  }
  if (cidade.depoimentos && cidade.depoimentos.length > 0) {
    optionalHtml += `
    <div class="cidade-depoimentos-custom">
      <h3>O que dizem os clientes de ${cidade.nome}</h3>
      <div class="depoimentos-grid">
        ${cidade.depoimentos.map(d => `
          <div class="depoimento-item">
            <p>"${d.texto}"</p>
            <strong>— ${d.autor} (${d.veiculo || cidade.nome})</strong>
          </div>`).join('')}
      </div>
    </div>`;
  }
  if (cidade.observacoes) {
    optionalHtml += `
    <div class="cidade-observacoes-custom">
      <p><strong>Aviso importante para ${cidade.nome}:</strong> ${cidade.observacoes}</p>
    </div>`;
  }

  // Footer - links das 28 cidades
  const footerCidadesHtml = `
    <div class="footer-cidades-block">
      <h3>Atendimento Volante Express em ${totalCidades} Cidades de Minas Gerais</h3>
      <div class="footer-regioes-grid">
        <div class="footer-regiao-col">
          <h4>Grande Belo Horizonte</h4>
          <ul>
            ${regioes['Grande BH'].map(c => `<li><a href="/revestimento-de-volante-${c.slug}">${c.nome}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer-regiao-col">
          <h4>Central e Vetor Norte</h4>
          <ul>
            ${regioes['Central e Vetor Norte'].map(c => `<li><a href="/revestimento-de-volante-${c.slug}">${c.nome}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer-regiao-col">
          <h4>Centro-Oeste</h4>
          <ul>
            ${regioes['Centro-Oeste'].map(c => `<li><a href="/revestimento-de-volante-${c.slug}">${c.nome}</a></li>`).join('')}
          </ul>
        </div>
        <div class="footer-regiao-col">
          <h4>Alto Paraopeba</h4>
          <ul>
            ${regioes['Alto Paraopeba'].map(c => `<li><a href="/revestimento-de-volante-${c.slug}">${c.nome}</a></li>`).join('')}
          </ul>
        </div>
      </div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NDS6R88');</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${seo.title}</title>

<!-- Favicon -->
<link rel="icon" type="image/png" href="/VOLANTE-EXPRESS-FAVICON-BRANCO.png">
<link rel="apple-touch-icon" href="/VOLANTE-EXPRESS-FAVICON-BRANCO.png">

<!-- SEO Local -->
<meta name="description" content="${seo.desc}">
<meta name="keywords" content="${seo.keywords}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://volanteexpress.com.br/revestimento-de-volante-${cidade.slug}">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://volanteexpress.com.br/revestimento-de-volante-${cidade.slug}">
<meta property="og:title" content="${seo.title}">
<meta property="og:description" content="${seo.desc}">
<meta property="og:image" content="https://volanteexpress.com.br/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Volante Express">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seo.title}">
<meta name="twitter:description" content="${seo.desc}">
<meta name="twitter:image" content="https://volanteexpress.com.br/og-image.jpg">

<!-- JSON-LD: Service & BreadcrumbList -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "name": "Revestimento de Volantes em ${cidade.nome}",
      "description": "${seo.desc}",
      "url": "https://volanteexpress.com.br/revestimento-de-volante-${cidade.slug}",
      "provider": {
        "@type": "LocalBusiness",
        "@id": "https://volanteexpress.com.br/#localbusiness",
        "name": "Volante Express",
        "url": "https://volanteexpress.com.br",
        "telephone": "+55-31-99629-4103"
      },
      "areaServed": {
        "@type": "City",
        "name": "${cidade.nome}",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Minas Gerais"
        }
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Preços de Revestimento em ${cidade.nome}",
        "itemListElement": [
          {
            "@type": "Offer",
            "name": "Revestimento de Volante — Carros de Passeio e SUVs (${cidade.nome})",
            "price": "149.00",
            "priceCurrency": "BRL"
          },
          {
            "@type": "Offer",
            "name": "Revestimento de Volante — Ônibus e Caminhões (${cidade.nome})",
            "price": "180.00",
            "priceCurrency": "BRL"
          }
        ]
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Início",
          "item": "https://volanteexpress.com.br/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Revestimento de Volante em ${cidade.nome}",
          "item": "https://volanteexpress.com.br/revestimento-de-volante-${cidade.slug}"
        }
      ]
    }
  ]
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Racing+Sans+One&family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:ital,wght@0,700;0,800;1,800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NDS6R88"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<nav>
  <div class="nav-logo">
    <a href="/" style="display:flex;align-items:center;text-decoration:none;">
      <img src="/images/logo-volante-express.png" alt="Volante Express"
        style="height:44px;width:auto;display:block;mix-blend-mode:screen;filter:brightness(1.1)">
    </a>
  </div>
  <a href="${ctaWaUrl}" class="nav-cta" target="_blank">Consultar Próxima Data</a>
</nav>

<!-- BREADCRUMB VISÍVEL -->
<nav class="breadcrumb-nav" aria-label="Breadcrumb">
  <div class="section-inner">
    <ol class="breadcrumb-list">
      <li><a href="/">Início</a></li>
      <li class="separator">&gt;</li>
      <li aria-current="page">Revestimento de Volante em ${cidade.nome}</li>
    </ol>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-content">
      <div class="badge-frequencia" style="display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--blue-900);font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em;padding:6px 14px;border-radius:20px;margin-bottom:14px;box-shadow:0 4px 12px rgba(232,196,48,0.35);">${frequenciaBadge}</div>
      <div class="hero-badge">Atendimento em ${cidade.nome} · MG</div>
      <h1>${seo.heroH1}</h1>
      <p class="hero-sub">${seo.heroSub}</p>
      
      <div class="hero-cta-group">
        <a href="${ctaWaUrl}" class="btn-primary" target="_blank">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.178.584 4.22 1.6 5.98L0 24l6.187-1.573A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.214-3.724.946.981-3.608-.236-.371A9.818 9.818 0 1112 21.818z"/></svg>
          ${btnHeroText}
        </a>
        <span class="hero-microcopy">Vagas limitadas por data. Atendimento individual com hora marcada.</span>
      </div>

      <div class="hero-stats">
        <div class="stat"><div class="stat-num">45min</div><div class="stat-label">Tempo de serviço</div></div>
        <div class="stat"><div class="stat-num">+400</div><div class="stat-label">Avaliações positivas</div></div>
        <div class="stat"><div class="stat-num">1 ano</div><div class="stat-label">Garantia total</div></div>
      </div>
    </div>

    <!-- SLIDER OTIMIZADO -->
    <div class="hero-slider" id="heroSlider">
      <div class="slider-track" id="sliderTrack">
        <img id="slide0" src="/images/hero-slide-1.jpg" alt="Antes e depois volante 1" width="900" height="1125" fetchpriority="high">
        <img id="slide1" src="/images/hero-slide-2.jpg" alt="Antes e depois volante 2" width="900" height="1125" loading="lazy">
        <img id="slide2" src="/images/hero-slide-3.jpg" alt="Antes e depois volante 3" width="900" height="1125" loading="lazy">
        <img id="slide3" src="/images/hero-slide-4.jpg" alt="Antes e depois volante 4" width="900" height="1125" loading="lazy">
      </div>
      <button class="slider-prev" onclick="slideMove(-1)" aria-label="Slide anterior">&#8249;</button>
      <button class="slider-next" onclick="slideMove(1)" aria-label="Próximo slide">&#8250;</button>
      <div class="slider-dots" id="sliderDots">
        <button class="slider-dot active" onclick="slideTo(0)" aria-label="Ir para slide 1"></button>
        <button class="slider-dot" onclick="slideTo(1)" aria-label="Ir para slide 2"></button>
        <button class="slider-dot" onclick="slideTo(2)" aria-label="Ir para slide 3"></button>
        <button class="slider-dot" onclick="slideTo(3)" aria-label="Ir para slide 4"></button>
      </div>
    </div>
  </div>
</section>

<!-- BLOCO ONDE FICA O PONTO DE APOIO -->
<section style="background:#0b1329;padding:48px 5% 0;">
  <div class="section-inner">
    <div class="ponto-apoio-card">
      <div class="ponto-apoio-header">
        <span class="ponto-tag">Local de Atendimento em ${cidade.nome}</span>
        <h2>Onde fica o ponto de apoio em ${cidade.nome}</h2>
        <p class="ponto-frequencia"><strong>Frequência da rota:</strong> ${cidade.frequencia} (${cidade.dias})</p>
      </div>
      <div class="ponto-apoio-body">
        <div class="ponto-info-item">
          <div class="ponto-icon">📍</div>
          <div>
            <strong>Ponto Credenciado:</strong>
            <p>${cidade.ponto_apoio ? cidade.ponto_apoio : 'Estacionamento comercial parceiro ou centro credenciado'}</p>
          </div>
        </div>
        ${cidade.endereco ? `
        <div class="ponto-info-item">
          <div class="ponto-icon">🗺️</div>
          <div>
            <strong>Endereço de Referência:</strong>
            <p>${cidade.endereco}</p>
          </div>
        </div>` : `
        <div class="ponto-info-item">
          <div class="ponto-icon">ℹ️</div>
          <div>
            <strong>Referência e Acesso:</strong>
            <p>Ponto central de fácil acesso com estacionamento amplo. A confirmação do local exato é enviada no ato da reserva pelo WhatsApp.</p>
          </div>
        </div>`}
        <div class="ponto-info-item">
          <div class="ponto-icon">⏱️</div>
          <div>
            <strong>Horário marcado e pontualidade:</strong>
            <p>Atendimento exclusivo de 45 minutos por veículo. Você não perde tempo em filas e assiste a todo o serviço no local.</p>
          </div>
        </div>
      </div>
      <div class="ponto-apoio-action">
        <a href="${ctaWaUrl}" class="btn-primary" target="_blank">
          ${cidade.ponto_apoio ? `Garantir Horário em ${cidade.nome}` : `Consultar Vagas em ${cidade.nome}`}
        </a>
      </div>
    </div>
  </div>
</section>

<!-- COMPARATIVO COMPACTO -->
<section class="inimigos-bg" style="padding-top:48px;">
  <div class="section-inner">
    <span class="section-tag">Comparativo prático</span>
    <h2 class="section-title" style="color:#fff">Por que escolher o Volanteiro em ${cidade.nome}?</h2>
    <p class="section-sub">Entenda por que a nossa técnica artesanal supera as soluções tradicionais disponíveis na região.</p>
    <div class="inimigos-grid-compact">
      <div class="inimigo-card-compact">
        <div class="inimigo-badge badge-tempo">Capotaria Tradicional</div>
        <p>Exige deixar o carro parado por 1 a 2 dias inteiros. Na Volante Express, você espera apenas <strong>45 minutos</strong>.</p>
      </div>
      <div class="inimigo-card-compact">
        <div class="inimigo-badge badge-seg">Capa de Semáforo</div>
        <p>Fica folgada, escorrega na curva e compromete sua segurança. Nosso acabamento é <strong>costurado à mão milimetricamente</strong>.</p>
      </div>
      <div class="inimigo-card-compact">
        <div class="inimigo-badge badge-bolso">Troca do Volante</div>
        <p>Custa caro e costuma acender a luz do airbag no painel. Nosso serviço é feito <strong>direto no veículo, com airbag 100% preservado</strong>.</p>
      </div>
    </div>
  </div>
</section>

<!-- DIFERENCIAIS -->
<section>
  <div class="section-inner">
    <span class="section-tag">Nossa solução</span>
    <h2 class="section-title">${seo.difTitle}</h2>
    <p class="section-sub">Não é uma oficina genérica. É um especialista focado em um único trabalho — executado com maestria.</p>
    <div class="dif-layout">
      <div class="diferenciais-grid">
        <div class="diferencial-card">
          <div class="dif-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="dif-content">
            <h3>45 minutos. Você espera.</h3>
            <p>Sem deixar o carro parado. Sem perder a mobilidade. O instalador trabalha e você acompanha cada etapa do processo.</p>
          </div>
        </div>
        <div class="diferencial-card">
          <div class="dif-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="dif-content">
            <h3>Airbag 100% preservado</h3>
            <p>O serviço inteiro é feito sem remover o volante. A fiação, a fita do airbag e os sensores originais não são tocados.</p>
          </div>
        </div>
        <div class="diferencial-card">
          <div class="dif-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 17l4-8 4 4 4-6 4 10"/><circle cx="7" cy="17" r="1" fill="#fff"/><circle cx="17" cy="17" r="1" fill="#fff"/>
            </svg>
          </div>
          <div class="dif-content">
            <h3>Feito à mão, na sua frente</h3>
            <p>Cola de alta fixação aplicada milimetricamente. Costura manual automotiva executada no ato.</p>
          </div>
        </div>
        <div class="diferencial-card">
          <div class="dif-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <div class="dif-content">
            <h3>Compatível com comandos no volante</h3>
            <p>Som, piloto automático e multimídia: o revestimento é embutido por baixo das molduras com visual original de fábrica.</p>
          </div>
        </div>
      </div>
      <div class="dif-video-wrap">
        <video src="https://assets.cdn.filesafe.space/QqoaFrd0Pf2gg1J0PDLR/media/6a0cb7aef18a99d9484eef46.mp4" autoplay loop muted playsinline
          style="aspect-ratio:1/1;object-fit:cover"></video>
        <div class="dif-video-label">Timelapse do serviço artesanal</div>
      </div>
    </div>
  </div>
</section>

${optionalHtml}

<!-- COMO FUNCIONA -->
<section class="como-bg">
  <div class="section-inner">
    <span class="section-tag">Passo a passo</span>
    <h2 class="section-title" style="color:#fff">Três passos para renovar seu volante<br>em ${cidade.nome}. Sem fila e sem burocracia.</h2>
    <div class="passos">
      <div class="passo">
        <div class="passo-num">1</div>
        <div class="passo-icon-svg">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            <line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/>
          </svg>
        </div>
        <h3>Consulte as Datas pelo WhatsApp</h3>
        <p>Fale conosco, informe o modelo do veículo e reserve seu horário para ${cidade.nome}.</p>
      </div>
      <div class="passo">
        <div class="passo-num">2</div>
        <div class="passo-icon-svg">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <h3>Vá ao Ponto de Apoio em ${cidade.nome}</h3>
        <p>No horário marcado, leve o veículo até ${cidade.ponto_apoio ? 'o ponto credenciado: <strong>' + cidade.ponto_apoio + '</strong>' + (cidade.endereco ? ' (' + cidade.endereco + ')' : '') : 'nosso ponto de apoio em ' + cidade.nome + ' (estacionamento de supermercado ou público central)'}. Sem fila.</p>
      </div>
      <div class="passo">
        <div class="passo-num">3</div>
        <div class="passo-icon-svg">
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
            <polyline points="9 17 12 20 15 17" stroke="rgba(232,196,48,0.9)" stroke-width="2"/>
          </svg>
        </div>
        <h3>Aguarde 45 min e Pronto!</h3>
        <p>O Volanteiro faz o acabamento artesanal na sua frente. Pague na maquininha ou no PIX e saia dirigindo.</p>
      </div>
    </div>
    <div class="como-cta">
      <a href="${ctaWaUrl}" class="btn-primary" target="_blank" style="display:inline-flex">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.178.584 4.22 1.6 5.98L0 24l6.187-1.573A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.214-3.724.946.981-3.608-.236-.371A9.818 9.818 0 1112 21.818z"/></svg>
        Consultar Próxima Data em ${cidade.nome}
      </a>
    </div>
  </div>
</section>

<!-- GALERIA -->
<section>
  <div class="section-inner">
    <span class="section-tag">Resultados reais</span>
    <div class="galeria-intro">
      <div>
        <h2 class="section-title">Antes e depois.<br>Veja o resultado por marca.</h2>
        <div class="galeria-marcas" id="marcaFiltros">
          <span class="marca-pill active" onclick="filtrarMarca('',this)">Todos</span>
          <span class="marca-pill" onclick="filtrarMarca('Chevrolet',this)">Chevrolet</span>
          <span class="marca-pill" onclick="filtrarMarca('Citroën',this)">Citroën</span>
          <span class="marca-pill" onclick="filtrarMarca('Fiat',this)">Fiat</span>
          <span class="marca-pill" onclick="filtrarMarca('Ford',this)">Ford</span>
          <span class="marca-pill" onclick="filtrarMarca('Honda',this)">Honda</span>
          <span class="marca-pill" onclick="filtrarMarca('Hyundai',this)">Hyundai</span>
          <span class="marca-pill" onclick="filtrarMarca('Toyota',this)">Toyota</span>
          <span class="marca-pill" onclick="filtrarMarca('Volkswagen',this)">Volkswagen</span>
        </div>
      </div>
    </div>
    <div class="galeria-grid" id="galeriaGrid"></div>
    <div class="galeria-paginacao" id="paginacao"></div>
  </div>
</section>

<!-- PREÇOS -->
<section>
  <div class="section-inner" style="text-align:center">
    <span class="section-tag">Preços e garantia em ${cidade.nome}</span>
    <h2 class="section-title">Preço justo, transparente<br>e sem surpresa</h2>
    <p class="section-sub" style="margin:0 auto 0">Sem orçamento escondido. Sem cobrar a mais na hora. O que você vê aqui é o que você paga no ponto de apoio de ${cidade.nome}.</p>
    <div class="precos-wrap">
      <div class="precos-grid">
        <div class="preco-card">
          <div class="preco-header">
            <h3>Carros Pequenos</h3>
            <p>Carros de passeio · SUVs · Pickups · Vans</p>
          </div>
          <div class="preco-body">
            <div class="preco-valor"><sup>R$</sup>149</div>
            <div class="preco-tipo">à vista — PIX ou dinheiro</div>
            <div class="preco-alt">ou <strong>R$ 160 no cartão</strong> — parcelado em até 2x</div>
            <a href="${ctaWaUrl}" class="preco-cta" target="_blank">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.178.584 4.22 1.6 5.98L0 24l6.187-1.573A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.214-3.724.946.981-3.608-.236-.371A9.818 9.818 0 1112 21.818z"/></svg> 
              Saber Data — Carros Pequenos
            </a>
          </div>
        </div>
        <div class="preco-card">
          <div class="preco-header" style="background:var(--blue-900)">
            <h3>Ônibus/Caminhões</h3>
            <p>Ônibus, Caminhões, Microônibus</p>
          </div>
          <div class="preco-body">
            <div class="preco-valor"><sup>R$</sup>180</div>
            <div class="preco-tipo">à vista — PIX ou dinheiro</div>
            <div class="preco-alt">ou <strong>R$ 190 no cartão</strong> — parcelado em até 2x</div>
            <a href="${ctaWaUrl}" class="preco-cta" target="_blank">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.178.584 4.22 1.6 5.98L0 24l6.187-1.573A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.214-3.724.946.981-3.608-.236-.371A9.818 9.818 0 1112 21.818z"/></svg> 
              Saber Data — Veículos Pesados
            </a>
          </div>
        </div>
      </div>
      <div class="garantia-banner">
        <div class="garantia-icon">🏅</div>
        <div class="garantia-text">
          <h3>1 ano de garantia completa</h3>
          <p>Cobre tanto a integridade do material sintético quanto a costura manual. Atendimento garantido para clientes de ${cidade.nome}.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- BLOCO CIDADES PRÓXIMAS -->
${vizinhasHtml ? `
<section class="vizinhas-secao">
  <div class="section-inner">
    <span class="section-tag" style="background:rgba(255,255,255,0.12);color:var(--accent);border-color:rgba(255,255,255,0.2);">Atendimento regional</span>
    <h2 class="section-title" style="color:#fff">Cidades Próximas com Atendimento Volante Express</h2>
    <p class="section-sub" style="color:rgba(255,255,255,0.75)">Também temos rotas e pontos de apoio credenciados nas cidades vizinhas a ${cidade.nome}:</p>
    <div class="vizinhas-grid">
      ${vizinhasHtml}
    </div>
  </div>
</section>` : ''}

<!-- COBERTURA E MAPA -->
<section class="cobertura-bg">
  <div class="section-inner">
    <span class="section-tag">Presença regional</span>
    <h2 class="section-title">Ponto de Apoio Credenciado<br>em ${cidade.nome}</h2>
    <p class="section-sub">A Volante Express está presente em <strong>${cidade.nome}</strong> e mais ${outrasCidadesCount} cidades de Minas Gerais. Localize nossa cobertura no mapa interativo abaixo.</p>
    <div class="cobertura-layout">
      <div class="lista-regioes">
        <div class="regiao-card" style="border:1.5px solid var(--accent);background:rgba(232,196,48,0.1)">
          <div class="regiao-header-l">
            <div class="regiao-dot-l" style="background:#e8c430"></div>
            <span class="regiao-nome-l" style="color:var(--accent)">Destaque: ${cidade.nome}</span>
            <span class="regiao-count-l" style="color:#fff;font-weight:700">${cidade.dias}</span>
          </div>
          <p style="color:rgba(255,255,255,0.85);font-size:0.85rem;line-height:1.5;margin-bottom:10px;">
            ${cidade.ponto_apoio ? 'Ponto: <strong>' + cidade.ponto_apoio + '</strong>' + (cidade.endereco ? ' (' + cidade.endereco + ')' : '') : 'Atendimento em ponto credenciado sob agendamento prévio.'}
          </p>
          <a href="${ctaWaUrl}" class="pop-btn" style="background:var(--accent);color:var(--blue-900)!important;font-weight:800;" target="_blank">
            Agendar em ${cidade.nome}
          </a>
        </div>

        <div class="regiao-card">
          <div class="regiao-header-l">
            <div class="regiao-dot-l" style="background:#93c5fd"></div>
            <span class="regiao-nome-l">Região: ${cidade.regiao}</span>
            <span class="regiao-count-l">${cidade.frequencia}</span>
          </div>
          <p style="color:rgba(255,255,255,0.75);font-size:0.82rem;line-height:1.4;">Atendemos também outras cidades vizinhas através da nossa rede itinerante de instaladores especializados.</p>
        </div>
      </div>
      <div class="mapa-sticky" id="mapa-section">
        <div id="mapa-cobertura"></div>
        <div class="mapa-leg">
          <div class="mapa-leg-item"><div class="mapa-leg-dot" style="background:var(--accent)"></div> Grande BH</div>
          <div class="mapa-leg-item"><div class="mapa-leg-dot" style="background:var(--blue-400)"></div> Central e Vetor Norte</div>
          <div class="mapa-leg-item"><div class="mapa-leg-dot" style="background:#93c5fd"></div> Centro-Oeste</div>
          <div class="mapa-leg-item"><div class="mapa-leg-dot" style="background:#f97316"></div> Alto Paraopeba</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section>
  <div class="section-inner" style="text-align:center">
    <span class="section-tag">Dúvidas frequentes</span>
    <h2 class="section-title">Dúvidas frequentes sobre o atendimento<br>em ${cidade.nome}</h2>
    <div class="faq-outer">
      <div class="faq-list">
        <div class="faq-item">
          <button class="faq-q" onclick="toggleFaq(this)">Qual a frequência de atendimento em ${cidade.nome} e onde fica o ponto? <span>+</span></button>
          <div class="faq-a">Em ${cidade.nome}, nosso atendimento ocorre <strong>${cidade.frequencia}</strong> (${cidade.dias}). ${cidade.ponto_apoio ? 'O ponto de apoio parceiro fica em <strong>' + cidade.ponto_apoio + '</strong>' + (cidade.endereco ? ', localizado na ' + cidade.endereco : '') + '.' : 'O ponto de apoio fica em local de fácil acesso (estacionamento de supermercado, estacionamento público ou centro automotivo credenciado).'} O agendamento prévio pelo WhatsApp é obrigatório para mantermos a pontualidade rigorosa de 45 minutos por veículo sem filas.</div>
        </div>
        <div class="faq-item">
          <button class="faq-q" onclick="toggleFaq(this)">Vocês precisam retirar o meu volante ou mexer no Airbag? <span>+</span></button>
          <div class="faq-a">Não! Esse é o nosso maior diferencial de segurança. Todo o procedimento é feito diretamente no carro, sem remover o volante original e sem tocar na estrutura ou nos sensores do Airbag. Seu painel continua 100% original e seguro.</div>
        </div>
        <div class="faq-item">
          <button class="faq-q" onclick="toggleFaq(this)">Quanto tempo demora o serviço? Preciso deixar o carro o dia todo? <span>+</span></button>
          <div class="faq-a">De jeito nenhum! O processo leva apenas 45 minutos para carros. Você agenda o seu horário, leva o veículo até o nosso ponto de apoio em ${cidade.nome} e espera confortavelmente enquanto o Volanteiro faz o trabalho artesanal na sua frente.</div>
        </div>
        <div class="faq-item">
          <button class="faq-q" onclick="toggleFaq(this)">Meu carro tem botões de comando no volante. Vocês fazem nele? <span>+</span></button>
          <div class="faq-a">Sim, perfeitamente! O nosso revestimento é embutido com acabamento profissional por baixo das molduras e dos botões de comando de som ou piloto automático. O visual fica impecável e não afeta em nada o funcionamento dos botões.</div>
        </div>
        <div class="faq-item">
          <button class="faq-q" onclick="toggleFaq(this)">Qual o valor e formas de pagamento em ${cidade.nome}? <span>+</span></button>
          <div class="faq-a">Para carros de passeio e SUVs: R$ 149 no PIX/Dinheiro ou R$ 160 no cartão (em até 2x). Para ônibus e caminhões: R$ 180 no PIX/Dinheiro ou R$ 190 no cartão (em até 2x). Todos os serviços contam com 1 ano de garantia completa.</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA FINAL -->
<section class="cta-final">
  <div style="max-width:800px;margin:0 auto">
    <h2>Seu volante novo em ${cidade.nome} está a um<br><span>agendamento de distância.</span></h2>
    <p>45 minutos. ${cidade.frequencia} em ${cidade.nome}. Sem tirar o volante do carro. Sem mexer no airbag. Feito à mão na sua frente com 1 ano de garantia.</p>
    <a href="${ctaWaUrl}" class="cta-final-btn" target="_blank">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.178.584 4.22 1.6 5.98L0 24l6.187-1.573A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.214-3.724.946.981-3.608-.236-.371A9.818 9.818 0 1112 21.818z"/></svg>
      Saber Próxima Data — (31) 99629-4103
    </a>
    <p class="cta-urgencia">Vagas limitadas por data de atendimento em ${cidade.nome}.</p>
    <p class="cta-garantia">Atendimento com hora marcada no ponto credenciado. <strong>Garantia de 1 ano inclusa.</strong></p>
  </div>
</section>

<footer>
  <div style="max-width:1100px;margin:0 auto;text-align:center;">
    <strong>Volante Express</strong> · ${cidade.nome} & Região · (31) 99629-4103 · @volante.express<br>
    <span style="font-size:0.85rem;opacity:0.75">O maior especialista em revestimento artesanal de volantes de Minas Gerais.</span>
    <div style="margin-top:12px;font-size:0.88rem;">
      <a href="/" style="color:var(--accent);margin:0 8px;text-decoration:none;">Início</a> ·
      <a href="/about" style="color:var(--accent);margin:0 8px;text-decoration:none;">Sobre Nós</a> ·
      <a href="/contact" style="color:var(--accent);margin:0 8px;text-decoration:none;">Contato</a> ·
      <a href="/privacy" style="color:var(--accent);margin:0 8px;text-decoration:none;">Privacidade</a> ·
      <a href="/sitemap.xml" style="color:var(--accent);margin:0 8px;text-decoration:none;">Sitemap</a>
    </div>

    ${footerCidadesHtml}
  </div>
</footer>

<script src="/js/main.js?v=2.1"></script>
<script>
window.addEventListener('load', function(){
  setTimeout(function(){
    var tagDiv = document.querySelector('.cidade-tag[data-cidade="${cidade.nome}"]');
    if(tagDiv) {
      tagDiv.click();
    }
  }, 1000);
});
</script>
</body>
</html>`;
}

function generateCityMd(cidade) {
  const ctaWaMsg = `Olá! Vim pelo site e gostaria de saber a próxima data de atendimento em ${cidade.nome}`;
  const ctaWaUrl = `https://wa.me/5531996294103?text=${encodeURIComponent(ctaWaMsg)}`;

  const vizinhasList = (cidade.vizinhas || [])
    .map(slug => cidades.find(c => c.slug === slug))
    .filter(Boolean);

  const vizinhasMd = vizinhasList.map(v => `- [Revestimento de Volante em ${v.nome}](https://volanteexpress.com.br/revestimento-de-volante-${v.slug}) — ${v.frequencia} (${v.ponto_apoio || 'Ponto credenciado'})`).join('\n');

  return `# Revestimento de Volante em ${cidade.nome} MG — Volante Express

> Atendimento especializado em revestimento artesanal de volante em couro sintético automotivo em ${cidade.nome}, MG. Serviço executado em 45 minutos no próprio veículo, sem retirar o volante do carro e com airbag 100% preservado. Acompanha 1 ano de garantia total.

---

## 📍 Local de Atendimento e Frequência em ${cidade.nome}
- **Cidade**: ${cidade.nome} - MG
- **Frequência de Atendimento**: ${cidade.frequencia} (${cidade.dias})
- **Ponto de Apoio Credenciado**: ${cidade.ponto_apoio || 'Ponto de apoio credenciado (estacionamento de supermercado ou público central)'}
${cidade.endereco ? `- **Endereço**: ${cidade.endereco}\n` : ''}- **Como Funciona**: Atendimento com hora marcada via WhatsApp para garantir atendimento individual de 45 minutos sem filas.

---

## 💰 Tabela de Preços e Pagamento em ${cidade.nome}
| Tipo de Veículo | À vista (PIX ou Dinheiro) | Cartão de Crédito |
| :--- | :--- | :--- |
| **Carros de Passeio, SUVs, Pickups e Vans** | **R$ 149,00** | R$ 160,00 (em até 2x) |
| **Ônibus, Caminhões e Microônibus** | **R$ 180,00** | R$ 190,00 (em até 2x) |

---

## ⚡ Diferenciais do Serviço
- **45 Minutos na sua frente**: Sem deixar o carro parado em oficinas. Você acompanha todo o processo.
- **Airbag 100% Seguro**: Procedimento realizado sem soltar a barra de direção ou tocar na fiação do airbag.
- **Costura Manual com Linha Automotiva**: Fixação precisa com acabamento embutido sob as molduras de comandos.
- **1 Ano de Garantia Completa**: Cobre a integridade do material e a costura manual.

---

## 📲 Agendamento em ${cidade.nome}
Para consultar as datas disponíveis e reservar o seu horário em ${cidade.nome}:
- **WhatsApp Direto**: [Agendar Horário em ${cidade.nome}](${ctaWaUrl})
- **Telefone**: +55 (31) 99629-4103
- **Mensagem Padrão**: \`${ctaWaMsg}\`

---

## 🗺️ Cidades Vizinhas Atendidas
${vizinhasMd}

---

- [Página Inicial](https://volanteexpress.com.br/)
- [Sobre a Volante Express](https://volanteexpress.com.br/about)
- [Contato e Pontos](https://volanteexpress.com.br/contact)
- [Política de Privacidade](https://volanteexpress.com.br/privacy)
- [Guia para Agentes (llms.txt)](https://volanteexpress.com.br/llms.txt)
`;
}

// 1. Gera HTML e MD de cada cidade
cidades.forEach((c, index) => {
  const htmlFileName = `revestimento-de-volante-${c.slug}.html`;
  const mdFileName = `revestimento-de-volante-${c.slug}.md`;

  fs.writeFileSync(path.join(rootDir, htmlFileName), generateCityHtml(c, index), 'utf8');
  fs.writeFileSync(path.join(rootDir, mdFileName), generateCityMd(c), 'utf8');
  console.log(`Gerado: ${htmlFileName} e ${mdFileName}`);
});

// 2. Gera sitemap.xml sem tags obsoletas (sem changefreq e sem priority) e com lastmod real via git
let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

const mainPages = [
  { url: 'https://volanteexpress.com.br/', file: 'index.html' },
  { url: 'https://volanteexpress.com.br/about', file: 'about.html' },
  { url: 'https://volanteexpress.com.br/contact', file: 'contact.html' },
  { url: 'https://volanteexpress.com.br/privacy', file: 'privacy.html' }
];

mainPages.forEach(p => {
  sitemapXml += `  <url>\n    <loc>${p.url}</loc>\n    <lastmod>${getFileLastmod(p.file)}</lastmod>\n  </url>\n`;
});

cidades.forEach(c => {
  const file = `revestimento-de-volante-${c.slug}.html`;
  sitemapXml += `  <url>\n    <loc>https://volanteexpress.com.br/revestimento-de-volante-${c.slug}</loc>\n    <lastmod>${getFileLastmod(file)}</lastmod>\n  </url>\n`;
});

sitemapXml += '</urlset>\n';
fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`Atualizado: sitemap.xml com ${mainPages.length + totalCidades} URLs limpas e lastmod dinâmico.`);

// 3. Atualiza llms.txt e llms-full.txt com a lista completa de cidades e pontos
function updateLlmsTxt() {
  const llmsPath = path.join(rootDir, 'llms.txt');
  let content = fs.readFileSync(llmsPath, 'utf8');

  const cityListMd = cidades.map(c => `- [${c.nome}](https://volanteexpress.com.br/revestimento-de-volante-${c.slug}): ${c.frequencia} (${c.ponto_apoio ? c.ponto_apoio : 'ponto credenciado'}${c.endereco ? ' - ' + c.endereco : ''})`).join('\n');

  const coverageHeader = '## Geographic Coverage & City Endpoints (Cidades Atendidas em MG)';
  const newCoverageSection = `${coverageHeader}\nVolante Express operates in ${totalCidades} cities in Minas Gerais:\n${cityListMd}\n`;

  if (content.includes(coverageHeader)) {
    content = content.replace(new RegExp(`${coverageHeader}[\\s\\S]*?(?=\\n## |$)`), newCoverageSection);
  } else {
    // Insere antes de Key Facts
    content = content.replace('## Key Facts & Specifications', `${newCoverageSection}\n## Key Facts & Specifications`);
  }

  // Atualiza menções de contagem
  content = content.replace(/26 cidades/g, `${totalCidades} cidades`);
  content = content.replace(/mais de 25 cidades/g, `mais de ${outrasCidadesCount} cidades`);
  content = content.replace(/\+25 cidades/g, `+${outrasCidadesCount} cidades`);

  fs.writeFileSync(llmsPath, content, 'utf8');
  console.log('Atualizado: llms.txt com lista de cidades.');
}

function updateLlmsFullTxt() {
  const llmsFullPath = path.join(rootDir, 'llms-full.txt');
  let content = fs.readFileSync(llmsFullPath, 'utf8');

  const cityListMd = cidades.map(c => `- [${c.nome}](https://volanteexpress.com.br/revestimento-de-volante-${c.slug}): ${c.frequencia} (${c.ponto_apoio ? c.ponto_apoio : 'ponto credenciado'}${c.endereco ? ' - ' + c.endereco : ''})`).join('\n');

  const coverageHeader = '## Geographic Coverage & City Directory (Cidades Atendidas)';
  const newCoverageSection = `${coverageHeader}\nAtendemos ${totalCidades} cidades em Minas Gerais:\n${cityListMd}\n`;

  if (content.includes(coverageHeader)) {
    content = content.replace(new RegExp(`${coverageHeader}[\\s\\S]*?(?=\\n## |$)`), newCoverageSection);
  } else {
    content = content.replace('## Tabela de Preços e Formas de Pagamento', `${newCoverageSection}\n## Tabela de Preços e Formas de Pagamento`);
  }

  content = content.replace(/26 cidades/g, `${totalCidades} cidades`);
  content = content.replace(/mais de 25 cidades/g, `mais de ${outrasCidadesCount} cidades`);
  content = content.replace(/\+25 cidades/g, `+${outrasCidadesCount} cidades`);

  fs.writeFileSync(llmsFullPath, content, 'utf8');
  console.log('Atualizado: llms-full.txt com diretório de cidades.');
}

function updateIndexMd() {
  const indexMdPath = path.join(rootDir, 'index.md');
  let content = fs.readFileSync(indexMdPath, 'utf8');

  const regioesTexto = [
    `- **Grande Belo Horizonte (${regioes['Grande BH'].length} cidades)**: ${regioes['Grande BH'].map(c => `[${c.nome}](https://volanteexpress.com.br/revestimento-de-volante-${c.slug})`).join(', ')}.`,
    `- **Central e Vetor Norte (${regioes['Central e Vetor Norte'].length} cidades)**: ${regioes['Central e Vetor Norte'].map(c => `[${c.nome}](https://volanteexpress.com.br/revestimento-de-volante-${c.slug})`).join(', ')}.`,
    `- **Centro-Oeste (${regioes['Centro-Oeste'].length} cidades)**: ${regioes['Centro-Oeste'].map(c => `[${c.nome}](https://volanteexpress.com.br/revestimento-de-volante-${c.slug})`).join(', ')}.`,
    `- **Alto Paraopeba (${regioes['Alto Paraopeba'].length} cidade)**: ${regioes['Alto Paraopeba'].map(c => `[${c.nome}](https://volanteexpress.com.br/revestimento-de-volante-${c.slug})`).join(', ')}.`
  ].join('\n');

  const coverageHeader = '## 📍 Cobertura Regional';
  const newCoverageSection = `${coverageHeader} (${totalCidades} Cidades em MG)\n${regioesTexto}\n`;

  content = content.replace(new RegExp(`${coverageHeader}[\\s\\S]*?(?=\\n## |$)`), newCoverageSection);
  content = content.replace(/26 cidades/g, `${totalCidades} cidades`);
  content = content.replace(/mais de 25 cidades/g, `mais de ${outrasCidadesCount} cidades`);
  content = content.replace(/\+25 cidades/g, `+${outrasCidadesCount} cidades`);

  fs.writeFileSync(indexMdPath, content, 'utf8');
  console.log('Atualizado: index.md com cobertura e links das cidades.');
}

updateLlmsTxt();
updateLlmsFullTxt();
updateIndexMd();

console.log(`\nSucesso total! Todas as ${totalCidades} cidades e arquivos auxiliares foram gerados e sincronizados.`);
