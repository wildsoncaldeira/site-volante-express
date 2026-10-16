// ---- HERO SLIDER ----
const heroImgs = ["images/hero-slide-1.jpg", "images/hero-slide-2.jpg", "images/hero-slide-3.jpg", "images/hero-slide-4.jpg"];
let curSlide = 0;
let autoSlide;

function initSlider(){
  startAuto();
}
function slideTo(n){
  curSlide = (n + heroImgs.length) % heroImgs.length;
  document.getElementById('sliderTrack').style.transform = 'translateX(-' + (curSlide * 100) + '%)';
  document.querySelectorAll('.slider-dot').forEach((d,i) => d.classList.toggle('active', i===curSlide));
}
function slideMove(dir){ clearInterval(autoSlide); slideTo(curSlide+dir); startAuto(); }
function startAuto(){ autoSlide = setInterval(() => slideTo(curSlide+1), 4000); }
initSlider();

// ---- GALERIA COM PAGINAÇÃO ----
const volantes = [
  {marca:"Chevrolet",src:"images/volante-1.jpg"},
  {marca:"Chevrolet",src:"images/volante-2.jpg"},
  {marca:"Chevrolet",src:"images/volante-3.jpg"},
  {marca:"Chevrolet",src:"images/volante-4.jpg"},
  {marca:"Chevrolet",src:"images/volante-5.jpg"},
  {marca:"Citroën",src:"images/volante-6.jpg"},
  {marca:"Citroën",src:"images/volante-7.jpg"},
  {marca:"Fiat",src:"images/volante-8.jpg"},
  {marca:"Fiat",src:"images/volante-9.jpg"},
  {marca:"Fiat",src:"images/volante-10.jpg"},
  {marca:"Fiat",src:"images/volante-11.jpg"},
  {marca:"Fiat",src:"images/volante-12.jpg"},
  {marca:"Fiat",src:"images/volante-13.jpg"},
  {marca:"Fiat",src:"images/volante-14.jpg"},
  {marca:"Fiat",src:"images/volante-15.jpg"},
  {marca:"Fiat",src:"images/volante-16.jpg"},
  {marca:"Ford",src:"images/volante-17.jpg"},
  {marca:"Ford",src:"images/volante-18.jpg"},
  {marca:"Ford",src:"images/volante-19.jpg"},
  {marca:"Honda",src:"images/volante-20.jpg"},
  {marca:"Honda",src:"images/volante-21.jpg"},
  {marca:"Honda",src:"images/volante-22.jpg"},
  {marca:"Hyundai",src:"images/volante-23.jpg"},
  {marca:"Hyundai",src:"images/volante-24.jpg"},
  {marca:"Hyundai",src:"images/volante-25.jpg"},
  {marca:"Toyota",src:"images/volante-26.jpg"},
  {marca:"Toyota",src:"images/volante-27.jpg"},
  {marca:"Toyota",src:"images/volante-28.jpg"},
  {marca:"Volkswagen",src:"images/volante-29.jpg"},
  {marca:"Volkswagen",src:"images/volante-30.jpg"},
  {marca:"Volkswagen",src:"images/volante-31.jpg"},
  {marca:"Volkswagen",src:"images/volante-32.jpg"},
  {marca:"Volkswagen",src:"images/volante-33.jpg"},
  {marca:"Hyundai",src:"images/volante-34.jpg"}
];
const PER_PAGE = 6;
let currentMarca = '';
let currentPage = 1;

function filtrarMarca(marca, pill){
  document.querySelectorAll('.marca-pill').forEach(p=>p.classList.remove('active'));
  pill.classList.add('active');
  currentMarca = marca;
  currentPage = 1;
  renderGaleria();
}

function getFiltered(){
  if(!currentMarca) return volantes;
  return volantes.filter(v=>v.marca===currentMarca);
}

function renderGaleria(){
  const filtered = getFiltered();
  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const start = (currentPage-1)*PER_PAGE;
  const pageItems = filtered.slice(start, start+PER_PAGE);

  const grid = document.getElementById('galeriaGrid');
  grid.innerHTML = pageItems.map(v => `
    <div class="galeria-item">
      <img src="${v.src}" alt="Volante ${v.marca} antes e depois" loading="lazy">
      <div class="galeria-item-label">${v.marca}</div>
    </div>
  `).join('');

  // Paginação
  const pag = document.getElementById('paginacao');
  if(totalPages <= 1){ pag.innerHTML=''; return; }

  let html = `<button class="pag-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>&#8249;</button>`;
  for(let i=1;i<=totalPages;i++){
    html += `<button class="pag-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="pag-btn" onclick="goPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>&#8250;</button>`;
  html += `<span class="pag-info">${start+1}–${Math.min(start+PER_PAGE,total)} de ${total}</span>`;
  pag.innerHTML = html;
}

function goPage(n){
  const filtered = getFiltered();
  const totalPages = Math.ceil(filtered.length/PER_PAGE);
  if(n<1||n>totalPages) return;
  currentPage = n;
  renderGaleria();
  document.getElementById('galeriaGrid').scrollIntoView({behavior:'smooth',block:'start'});
}

renderGaleria();


// ---- MAPA LEAFLET COM CARREGAMENTO CONDICIONAL (INTERSECTION OBSERVER) ----
(function(){
  var S=14,SH=22;
  var C=[
    {n:'Belo Horizonte',r:'Grande BH',          c:'#e8c430',rb:'#fefce8',rt:'#92400e',la:-19.9167,lo:-43.9345},
    {n:'Contagem',      r:'Grande BH',          c:'#e8c430',rb:'#fefce8',rt:'#92400e',la:-19.9317,lo:-44.0536},
    {n:'Nova Lima',     r:'Grande BH',          c:'#e8c430',rb:'#fefce8',rt:'#92400e',la:-19.9844,lo:-43.8481},
    {n:'Santa Luzia',   r:'Grande BH',          c:'#e8c430',rb:'#fefce8',rt:'#92400e',la:-19.7700,lo:-43.8514},
    {n:'Betim',         r:'Grande BH',          c:'#e8c430',rb:'#fefce8',rt:'#92400e',la:-19.9680,lo:-44.1986},
    {n:'Sabará',        r:'Grande BH',          c:'#e8c430',rb:'#fefce8',rt:'#92400e',la:-19.8864,lo:-43.8056},
    {n:'Sete Lagoas',   r:'Central e Vetor Norte',c:'#4a74b4',rb:'#eff6ff',rt:'#1e40af',la:-19.4658,lo:-44.2469},
    {n:'Pedro Leopoldo',r:'Central e Vetor Norte',c:'#4a74b4',rb:'#eff6ff',rt:'#1e40af',la:-19.6189,lo:-44.0439},
    {n:'Matozinhos',    r:'Central e Vetor Norte',c:'#4a74b4',rb:'#eff6ff',rt:'#1e40af',la:-19.5561,lo:-44.0814},
    {n:'Lagoa Santa',   r:'Central e Vetor Norte',c:'#4a74b4',rb:'#eff6ff',rt:'#1e40af',la:-19.6289,lo:-43.8972},
    {n:'Paraopeba',     r:'Central e Vetor Norte',c:'#4a74b4',rb:'#eff6ff',rt:'#1e40af',la:-19.2681,lo:-44.4044},
    {n:'Vespasiano',    r:'Central e Vetor Norte',c:'#4a74b4',rb:'#eff6ff',rt:'#1e40af',la:-19.6875,lo:-43.9240},
    {n:'Curvelo',       r:'Central e Vetor Norte',c:'#4a74b4',rb:'#eff6ff',rt:'#1e40af',la:-18.7556,lo:-44.4317},
    {n:'Divinópolis',           r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.1389,lo:-44.8839},
    {n:'Itaúna',                r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.0739,lo:-44.5753},
    {n:'Pará de Minas',         r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-19.8608,lo:-44.6097},
    {n:'Nova Serrana',          r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-19.8800,lo:-44.9878},
    {n:'Bom Despacho',          r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-19.7261,lo:-45.2556},
    {n:'Formiga',               r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.4639,lo:-45.4264},
    {n:'Cláudio',               r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.4444,lo:-44.7706},
    {n:'Lagoa da Prata',       r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.0222,lo:-45.5439},
    {n:'Santo Antônio do Monte', r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.0869,lo:-45.2931},
    {n:'Pitangui',              r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-19.6800,lo:-44.8928},
    {n:'Carmo do Cajuru',       r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.1864,lo:-44.7708},
    {n:'Oliveira',              r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.6964,lo:-44.8269},
    {n:'Itapecerica',           r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.4731,lo:-45.1256},
    {n:'Carmo da Mata',         r:'Centro-Oeste',c:'#93c5fd',rb:'#eff6ff',rt:'#1e40af',la:-20.5564,lo:-44.8711},
    {n:'Conselheiro Lafaiete',  r:'Alto Paraopeba',c:'#f97316',rb:'#fff7ed',rt:'#c2410c',la:-20.6606,lo:-43.7853}
  ];

  var mapEl = document.getElementById('mapa-cobertura');
  if(!mapEl) return;

  var map = null;
  var M = {};
  var isLoaded = false;
  var isLoading = false;
  var pendingHover = null;

  function mkI(cor,sz,hl){
    var sh=hl?'0 0 0 4px '+cor+'55,0 3px 14px rgba(0,0,0,0.35)':'0 2px 8px rgba(0,0,0,0.25)';
    return L.divIcon({className:'',html:'<div style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;background:'+cor+';border:2.5px solid rgba(255,255,255,0.95);box-shadow:'+sh+';transition:all .2s"></div>',iconSize:[sz,sz],iconAnchor:[sz/2,sz/2],popupAnchor:[0,-(sz/2+10)]});
  }

  function initMap(){
    if (map || !window.L) return;
    map = L.map('mapa-cobertura', {center:[-19.92,-44.45], zoom:8, scrollWheelZoom:false});
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
      maxZoom: 16
    }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16
    }).addTo(map);

    var wSvg='<svg viewBox="0 0 24 24" style="width:16px;height:16px;flex-shrink:0;fill:#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.178.584 4.22 1.6 5.98L0 24l6.187-1.573A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.373l-.36-.214-3.724.946.981-3.608-.236-.371A9.818 9.818 0 1112 21.818z"/></svg>';

    C.forEach(function(c){
      var wa='https://wa.me/5531996294103?text='+encodeURIComponent('Olá! Quero agendar meu horário em '+c.n+'.');
      var pop='<div class="pop-inner"><div class="pop-regiao" style="background:'+c.rb+';color:'+c.rt+'">'+c.r+'</div><div class="pop-cidade">'+c.n+'</div><a class="pop-btn" href="'+wa+'" target="_blank">'+wSvg+'Agendar em '+c.n+'</a></div>';
      var mk=L.marker([c.la,c.lo],{icon:mkI(c.c,S,false)}).bindPopup(L.popup({closeButton:false,maxWidth:240}).setContent(pop)).addTo(map);
      M[c.n]={marker:mk,cor:c.c};
    });

    if (pendingHover && M[pendingHover]) {
      var ph = M[pendingHover];
      ph.marker.setIcon(mkI(ph.cor,SH,true));
      ph.marker.setZIndexOffset(1000);
      map.panTo(ph.marker.getLatLng(),{animate:true,duration:0.35});
    }
  }

  function loadLeaflet(callback){
    if (isLoaded) { if (callback) callback(); return; }
    if (isLoading) {
      if (callback) {
        var prev = window.__onLeafletLoaded;
        window.__onLeafletLoaded = function(){ if(prev) prev(); callback(); };
      }
      return;
    }
    isLoading = true;
    if (callback) window.__onLeafletLoaded = callback;

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    var script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = function(){
      isLoaded = true;
      isLoading = false;
      initMap();
      if (window.__onLeafletLoaded) {
        window.__onLeafletLoaded();
        window.__onLeafletLoaded = null;
      }
    };
    document.head.appendChild(script);
  }

  // IntersectionObserver para carregar o mapa quando chegar perto da tela
  var mapaSection = document.getElementById('mapa-section');
  if ('IntersectionObserver' in window && mapaSection) {
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          loadLeaflet();
          observer.disconnect();
        }
      });
    }, { rootMargin: '350px' });
    observer.observe(mapaSection);
  } else {
    loadLeaflet();
  }

  document.querySelectorAll('.cidade-tag').forEach(function(tag){
    var nome=tag.dataset.cidade,cor=tag.dataset.cor,text=tag.dataset.text;
    tag.addEventListener('mouseenter',function(){
      tag.style.background=cor;tag.style.color=text;tag.style.borderColor='transparent';
      pendingHover = nome;
      if (!isLoaded) {
        loadLeaflet();
      } else {
        var m=M[nome];if(!m)return;
        m.marker.setIcon(mkI(m.cor,SH,true));m.marker.setZIndexOffset(1000);
        map.panTo(m.marker.getLatLng(),{animate:true,duration:0.35});
      }
    });
    tag.addEventListener('mouseleave',function(){
      tag.style.background='';tag.style.color='';tag.style.borderColor='';
      if (pendingHover === nome) pendingHover = null;
      if (isLoaded) {
        var m=M[nome];if(!m)return;
        m.marker.setIcon(mkI(m.cor,S,false));m.marker.setZIndexOffset(0);
      }
    });
    // O clique é um link nativo <a> para a página de cidade
  });
})();

// ---- FAQ ----
function toggleFaq(btn){
  btn.closest('.faq-item').classList.toggle('open');
}