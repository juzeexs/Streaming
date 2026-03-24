const API_KEY  = 'd51fec1a601f0d1c209761a719599c24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL  = 'https://image.tmdb.org/t/p/w500';
const WIDE_URL = 'https://image.tmdb.org/t/p/original';

const GENRE_NAMES = {
  28:'Ação', 12:'Aventura', 16:'Animação', 35:'Comédia', 80:'Crime',
  99:'Documentário', 18:'Drama', 10751:'Família', 14:'Fantasia',
  27:'Terror', 9648:'Mistério', 10749:'Romance', 878:'Sci-Fi',
  10765:'Fantasia', 53:'Thriller', 10759:'Ação & Aventura', 37:'Faroeste',
  10768:'Guerra'
};

// Config das categorias visuais
const CATEGORIES = [
  { name:'Ação',       id:28,    color:'#ff453a', img:'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=60' },
  { name:'Drama',      id:18,    color:'#30d158', img:'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&q=60' },
  { name:'Comédia',    id:35,    color:'#ffd60a', img:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=60' },
  { name:'Terror',     id:27,    color:'#bf5af2', img:'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=60' },
  { name:'Sci-Fi',     id:878,   color:'#0a84ff', img:'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&q=60' },
  { name:'Romance',    id:10749, color:'#ff375f', img:'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=60' },
  { name:'Animação',   id:16,    color:'#5ac8fa', img:'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=400&q=60' },
  { name:'Crime',      id:80,    color:'#ff9f0a', img:'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=60' },
  { name:'Documentário',id:99,   color:'#64d2ff', img:'https://images.unsplash.com/photo-1536240478700-b869ad10e2ab?w=400&q=60' },
  { name:'Thriller',   id:53,    color:'#c4a35a', img:'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=60' },
];

let allItems     = [];
let filteredItems = [];
let displayedCount = 0;
const PAGE_SIZE  = 40;

let currentGenre = 'todos'; // 'todos' ou id numérico como string
let currentType  = 'todos';
let currentSort  = 'popular';
let searchQuery  = '';
let searchTimer  = null;
let isSearchMode = false;
let genreCache   = {}; // cache por genre id

// ============================================================
// INIT
// ============================================================
async function init() {
  renderCategoryGrid();
  renderSkeletons(24);
  await loadPopular();
}

async function loadPopular() {
  try {
    const [mR1, mR2, tR1, tR2] = await Promise.all([
      fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`).then(r=>r.json()),
      fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=2`).then(r=>r.json()),
      fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`).then(r=>r.json()),
      fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=2`).then(r=>r.json()),
    ]);

    const movies = [...mR1.results, ...mR2.results].map(m => formatItem(m, 'filme'));
    const series = [...tR1.results, ...tR2.results].map(s => formatItem(s, 'serie'));

    const seen = new Set();
    allItems = [...movies, ...series].filter(i => {
      const k = i.type + i.id; if (seen.has(k)) return false; seen.add(k); return true;
    });

    // Pré-cache "todos"
    genreCache['todos'] = [...allItems];
    applyFilters();
  } catch(e) {
    console.error(e);
    document.getElementById('catalogGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Erro ao carregar</h3><p>Verifique sua conexão</p>
      </div>`;
  }
}

function formatItem(item, type) {
  const genreId = item.genre_ids?.[0];
  return {
    id: item.id, title: item.title || item.name || '—', type,
    genreIds: item.genre_ids || [],
    genre: GENRE_NAMES[genreId] || 'Outros',
    year: (item.release_date || item.first_air_date || '2024').split('-')[0],
    score: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0,
    desc: item.overview || 'Sinopse não disponível.',
    img: item.poster_path ? IMG_URL + item.poster_path : 'https://placehold.co/200x300/111/444?text=?',
    wide: item.backdrop_path ? WIDE_URL + item.backdrop_path : (item.poster_path ? IMG_URL + item.poster_path : ''),
    lang: (item.original_language || '—').toUpperCase(),
    votes: item.vote_count || 0,
    popularity: item.popularity || 0,
  };
}

// ============================================================
// CATEGORY GRID VISUAL
// ============================================================
function renderCategoryGrid() {
  const grid = document.getElementById('catHeroGrid');
  grid.innerHTML = CATEGORIES.map(c => `
    <div class="cat-hero-card" id="catCard_${c.id}" onclick="selectCategory(${c.id}, '${c.name}')">
      <img src="${c.img}" alt="${c.name}" loading="lazy">
      <div class="cat-hero-card-label">${c.name}</div>
      <div class="cat-hero-accent" style="background:${c.color}"></div>
    </div>`).join('');
}

async function selectCategory(id, name) {
  // Toggle — clicar duas vezes deseleciona
  if (currentGenre === String(id)) {
    currentGenre = 'todos';
    document.querySelectorAll('.cat-hero-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('pageTitle').textContent = ' CATEGORIAS';
    document.getElementById('pageSubtitle').textContent = 'Explore o catálogo completo por gênero';
    document.getElementById('catalogSectionTitle').textContent = 'Todo o Catálogo';
    applyFilters();
    return;
  }

  currentGenre = String(id);
  document.querySelectorAll('.cat-hero-card').forEach(c => c.classList.remove('selected'));
  const el = document.getElementById(`catCard_${id}`);
  if (el) el.classList.add('selected');

  document.getElementById('pageTitle').textContent = ` ${name.toUpperCase()}`;
  document.getElementById('pageSubtitle').textContent = `Filmes e séries de ${name}`;
  document.getElementById('catalogSectionTitle').textContent = `Resultados para "${name}"`;

  // Se já tem em cache usa direto, senão busca na API
  if (genreCache[id]) {
    applyFilters();
    return;
  }

  renderSkeletons(16);
  try {
    const [mRes, tRes] = await Promise.all([
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=pt-BR&with_genres=${id}&sort_by=popularity.desc&page=1`).then(r=>r.json()),
      fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${id}&sort_by=popularity.desc&page=1`).then(r=>r.json()),
    ]);

    const newItems = [
      ...mRes.results.map(m => formatItem(m, 'filme')),
      ...tRes.results.map(s => formatItem(s, 'serie')),
    ];

    // Mescla com allItems sem duplicar
    const seen = new Set(allItems.map(i => i.type + i.id));
    newItems.filter(i => !seen.has(i.type + i.id)).forEach(i => allItems.push(i));

    genreCache[id] = newItems;
    applyFilters();
  } catch(e) { applyFilters(); }
}

// ============================================================
// FILTROS & RENDER
// ============================================================
function applyFilters() {
  let list = [...allItems];

  if (currentType !== 'todos') list = list.filter(i => i.type === currentType);

  if (currentGenre !== 'todos') {
    const gId = parseInt(currentGenre);
    list = list.filter(i => i.genreIds.includes(gId));
  }

  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    list = list.filter(i => i.title.toLowerCase().includes(q));
  }

  if (currentSort === 'rating')  list.sort((a,b) => b.score - a.score);
  if (currentSort === 'year')    list.sort((a,b) => parseInt(b.year) - parseInt(a.year));
  if (currentSort === 'popular') list.sort((a,b) => b.popularity - a.popularity);

  filteredItems  = list;
  displayedCount = 0;
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('catalogGrid');
  document.getElementById('countDisplay').textContent = filteredItems.length;

  if (filteredItems.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"></div>
        <h3>Nenhum título encontrado</h3>
        <p>Tente outros filtros ou termos de busca</p>
      </div>`;
    document.getElementById('loadMoreWrap').style.display = 'none';
    return;
  }

  const slice = filteredItems.slice(0, displayedCount + PAGE_SIZE);
  displayedCount = slice.length;

  grid.innerHTML = slice.map((item, idx) => `
    <div class="cat-item" onclick="openModal(${idx})">
      <img class="cat-item-poster" src="${item.img}" loading="lazy" alt="${item.title}">
      <span class="cat-item-badge">${item.type === 'filme' ? 'Filme' : 'Série'}</span>
      <span class="cat-item-score"> ${item.score}</span>
      <div class="cat-item-overlay">
        <div class="cat-item-title">${item.title}</div>
        <div class="cat-item-meta">${item.year} · ${item.genre}</div>
      </div>
      <div class="cat-item-info">
        <div class="cat-item-name">${item.title}</div>
        <div class="cat-item-sub">${item.year} · ${item.genre}</div>
      </div>
    </div>`).join('');

  document.getElementById('loadMoreWrap').style.display =
    displayedCount < filteredItems.length ? 'block' : 'none';
}

function loadMore() { renderGrid(); }

// ============================================================
// BUSCA GLOBAL
// ============================================================
function handleSearch(value) {
  document.getElementById('searchClear').classList.toggle('visible', value.length > 0);
  clearTimeout(searchTimer);

  if (value.trim().length === 0) {
    searchQuery = ''; isSearchMode = false;
    // Mostra de novo a grade de categorias
    document.getElementById('catHeroSection').style.display = 'block';
    document.getElementById('pageTitle').textContent = currentGenre === 'todos' ? ' CATEGORIAS' : document.getElementById('pageTitle').textContent;
    document.getElementById('pageSubtitle').textContent = 'Explore o catálogo completo por gênero';
    applyFilters(); return;
  }

  searchTimer = setTimeout(async () => {
    searchQuery = value.trim();
    isSearchMode = true;
    // Esconde grade de categorias durante busca
    document.getElementById('catHeroSection').style.display = 'none';
    document.getElementById('pageTitle').textContent = ` "${searchQuery.toUpperCase()}"`;
    document.getElementById('pageSubtitle').textContent = 'Resultados da busca no catálogo';
    document.getElementById('catalogSectionTitle').textContent = 'Resultados da busca';

    applyFilters(); // resultado local imediato

    try {
      const res = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(searchQuery)}&page=1`
      );
      const data = await res.json();
      const results = data.results.filter(r => r.media_type !== 'person' && (r.poster_path || r.backdrop_path));

      results.forEach(r => {
        const type = r.media_type === 'movie' ? 'filme' : 'serie';
        if (!allItems.some(i => i.id === r.id && i.type === type)) {
          allItems.push(formatItem(r, type));
        }
      });
      applyFilters();
    } catch(e) { /* mantém resultado local */ }
  }, 360);
}

function clearSearch() {
  document.getElementById('globalSearch').value = '';
  document.getElementById('searchClear').classList.remove('visible');
  searchQuery = ''; isSearchMode = false;
  document.getElementById('catHeroSection').style.display = 'block';
  if (currentGenre === 'todos') {
    document.getElementById('pageTitle').textContent = ' CATEGORIAS';
    document.getElementById('pageSubtitle').textContent = 'Explore o catálogo completo por gênero';
    document.getElementById('catalogSectionTitle').textContent = 'Todo o Catálogo';
  }
  applyFilters();
}

function setType(type, el) {
  currentType = type;
  document.querySelectorAll('.type-pill').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  applyFilters();
}

function setSort(val) { currentSort = val; applyFilters(); }

// ============================================================
// MODAL
// ============================================================
function openModal(idx) {
  const item = filteredItems[idx];
  if (!item) return;
  document.getElementById('modalImg').src = item.wide || item.img;
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalDesc').textContent = item.desc;
  document.getElementById('modalYear').textContent = item.year;
  document.getElementById('modalType').textContent = item.type === 'filme' ? 'Filme' : 'Série';
  document.getElementById('modalScore').textContent = ' ' + item.score;
  document.getElementById('modalLang').textContent = item.lang;
  document.getElementById('modalGenre').textContent = item.genre;
  document.getElementById('modalVotes').textContent = item.votes.toLocaleString('pt-BR');
  document.getElementById('modalMeta').innerHTML = `
    <span class="m-badge">${item.type === 'filme' ? 'Filme' : 'Série'}</span>
    <span>${item.year}</span><span>·</span>
    <span>${item.genre}</span><span>·</span>
    <span class="m-star"> ${item.score}</span>`;
  const trailerBtn = document.getElementById('modalTrailerBtn');
  trailerBtn.onclick = () => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' trailer oficial')}`, '_blank');
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }
function closeModalOnOverlay(e) { if (e.target.id === 'modalOverlay') closeModal(); }

// ============================================================
// SKELETON
// ============================================================
function renderSkeletons(n) {
  document.getElementById('catalogGrid').innerHTML = Array(n).fill(`
    <div style="border-radius:14px;overflow:hidden;background:var(--surface);">
      <div class="skeleton" style="aspect-ratio:2/3;"></div>
      <div style="padding:10px 11px;">
        <div class="skeleton" style="height:12px;border-radius:6px;margin-bottom:6px;width:78%;"></div>
        <div class="skeleton" style="height:10px;border-radius:6px;width:45%;"></div>
      </div>
    </div>`).join('');
}

// ============================================================
// NAV DRAWER
// ============================================================
function toggleDrawer() {
  const d = document.getElementById('navDrawer');
  const i = document.getElementById('menuIcon');
  const open = d.classList.toggle('open');
  i.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
}
function closeDrawer() {
  document.getElementById('navDrawer').classList.remove('open');
  document.getElementById('menuIcon').className = 'fa-solid fa-bars';
}

document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

// Pré-seleciona categoria via URL (?categoria=Ação)
const urlCat = new URLSearchParams(location.search).get('categoria');
if (urlCat) {
  const cat = CATEGORIES.find(c => c.name === urlCat);
  if (cat) {
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => selectCategory(cat.id, cat.name), 600);
    });
  }
}

init();