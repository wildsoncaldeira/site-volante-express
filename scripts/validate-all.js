const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const cidades = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/cidades.json'), 'utf8'));

console.log('=== INICIANDO VALIDAÇÃO COMPLETA ===\n');

let errors = 0;

// 1. Verificar se as 28 cidades têm .html e .md e canonicals corretos
console.log('1. Verificando páginas HTML e MD das 28 cidades...');
const titles = new Set();
const h1s = new Set();

cidades.forEach(c => {
  const htmlPath = path.join(rootDir, `revestimento-de-volante-${c.slug}.html`);
  const mdPath = path.join(rootDir, `revestimento-de-volante-${c.slug}.md`);

  if (!fs.existsSync(htmlPath)) {
    console.error(`ERRO: HTML ausente para ${c.nome} (${htmlPath})`);
    errors++;
    return;
  }
  if (!fs.existsSync(mdPath)) {
    console.error(`ERRO: MD ausente para ${c.nome} (${mdPath})`);
    errors++;
    return;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');

  // Canonical auto-referente
  const canonicalExpected = `https://volanteexpress.com.br/revestimento-de-volante-${c.slug}`;
  if (!html.includes(`<link rel="canonical" href="${canonicalExpected}">`)) {
    console.error(`ERRO: Canonical inválido em ${c.slug}. Esperado: ${canonicalExpected}`);
    errors++;
  }

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch) {
    console.error(`ERRO: Title ausente em ${c.slug}`);
    errors++;
  } else {
    const t = titleMatch[1].trim();
    if (titles.has(t)) {
      console.warn(`AVISO: Title duplicado: "${t}"`);
    }
    titles.add(t);
  }

  // H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1Match) {
    console.error(`ERRO: H1 ausente em ${c.slug}`);
    errors++;
  } else {
    const h = h1Match[1].replace(/<[^>]+>/g, '').trim();
    if (h1s.has(h)) {
      console.warn(`AVISO: H1 duplicado: "${h}"`);
    }
    h1s.add(h);
  }

  // JSON-LD válido
  const jsonLdMatches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  if (jsonLdMatches.length === 0) {
    console.error(`ERRO: JSON-LD ausente em ${c.slug}`);
    errors++;
  } else {
    jsonLdMatches.forEach((m, idx) => {
      try {
        JSON.parse(m[1]);
      } catch (e) {
        console.error(`ERRO: JSON-LD inválido (#${idx + 1}) em ${c.slug}: ${e.message}`);
        errors++;
      }
    });
  }

  // Links do footer
  cidades.forEach(other => {
    if (!html.includes(`/revestimento-de-volante-${other.slug}`)) {
      console.error(`ERRO: Link de ${other.slug} ausente no footer de ${c.slug}`);
      errors++;
    }
  });

  // Links de cidades próximas
  (c.vizinhas || []).forEach(vizSlug => {
    if (!html.includes(`/revestimento-de-volante-${vizSlug}`)) {
      console.error(`ERRO: Link vizinho ${vizSlug} ausente em ${c.slug}`);
      errors++;
    }
  });
});

console.log(`- 28 páginas validadas. Titles únicos: ${titles.size}. H1s únicos: ${h1s.size}.`);

// 2. Verificar sitemap.xml
console.log('\n2. Verificando sitemap.xml...');
const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');
cidades.forEach(c => {
  const url = `https://volanteexpress.com.br/revestimento-de-volante-${c.slug}`;
  if (!sitemap.includes(url)) {
    console.error(`ERRO: URL ${url} não encontrada no sitemap`);
    errors++;
  }
});
if (sitemap.includes('/divinopolis</loc>') || sitemap.includes('cidade-modelo')) {
  console.error('ERRO: Duplicatas /divinopolis ou cidade-modelo encontradas no sitemap!');
  errors++;
} else {
  console.log('- Nenhuma duplicata encontrada no sitemap.');
}

// 3. Verificar index.html
console.log('\n3. Verificando index.html...');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
let indexCityLinks = 0;
cidades.forEach(c => {
  const href = `/revestimento-de-volante-${c.slug}`;
  if (indexHtml.includes(href)) {
    indexCityLinks++;
  } else {
    console.error(`ERRO: Link para ${href} ausente em index.html`);
    errors++;
  }
});
console.log(`- Links para cidades em index.html: ${indexCityLinks} de 28`);

// 4. Verificar se há links internos quebrados em todas as páginas HTML
console.log('\n4. Verificando links internos em todos os HTMLs...');
const allHtmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));
allHtmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
  const hrefMatches = [...content.matchAll(/href="(\/[^"#?]*)"/gi)];
  hrefMatches.forEach(match => {
    const relPath = match[1];
    if (relPath === '/' || relPath === '') return;
    
    // Testa variações possíveis no sistema de arquivos
    const candidatePaths = [
      path.join(rootDir, relPath),
      path.join(rootDir, `${relPath}.html`),
      path.join(rootDir, relPath, 'index.html')
    ];
    const exists = candidatePaths.some(p => fs.existsSync(p));
    if (!exists) {
      console.error(`ERRO: Link quebrado em ${file} -> ${relPath}`);
      errors++;
    }
  });
});

console.log('\n5. Verificando JSON-LD de index.html...');
const indexJsonLdMatches = [...indexHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
indexJsonLdMatches.forEach((m, idx) => {
  try {
    JSON.parse(m[1]);
    console.log(`- JSON-LD index.html (#${idx + 1}) válido.`);
  } catch (e) {
    console.error(`ERRO: JSON-LD em index.html (#${idx + 1}) inválido: ${e.message}`);
    errors++;
  }
});

console.log(`\n=== VALIDAÇÃO CONCLUÍDA: ${errors} ERROS ENCONTRADOS ===`);
if (errors > 0) process.exit(1);
