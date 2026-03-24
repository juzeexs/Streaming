const API_KEY = 'd51fec1a601f0d1c209761a719599c24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL  = 'https://image.tmdb.org/t/p/w500';
const WIDE_URL = 'https://image.tmdb.org/t/p/original';

const GENRE_NAMES = {
  28:'Ação', 12:'Aventura', 16:'Animação', 35:'Comédia', 80:'Crime',
  99:'Documentário', 18:'Drama', 10751:'Família', 14:'Fantasia',
  27:'Terror', 10762:'Kids', 9648:'Mistério', 10749:'Romance',
  878:'Sci-Fi', 10765:'Fantasia', 53:'Thriller', 10759:'Ação & Aventura',
  10768:'Guerra', 37:'Faroeste'
};

let allItems     = [];
let filteredItems = [];
let displayedCount = 0;
const PAGE_SIZE  = 40;

let currentGenre = 'todos';
let currentType  = 'todos';
let currentSort  = 'popular';
let searchQuery  = '';
let searchTimer  = null;
let isSearchMode = false;

// ============================================================
// INICIALIZAÇÃO — carrega filmes e séries em paralelo
// ============================================================
async function init() {
  renderSkeletons(24);
  try {
    const [mR1, mR2, mR3, mR4, tR1, tR2, tR3] = await Promise.all([
      fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&page=1`).then(r=>r.json()),
      fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=pt-BR&page=2`).then(r=>r.json()),
      fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`).then(r=>r.json()),
      fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=2`).then(r=>r.json()),
      fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=pt-BR&page=1`).then(r=>r.json()),
      fetch(`${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=pt-BR&page=2`).then(r=>r.json()),
      fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`).then(r=>r.json()),
    ]);

    const movies = [...mR1.results, ...mR2.results, ...mR3.results, ...mR4.results]
      .map(m => formatItem(m, 'filme'));
    const series = [...tR1.results, ...tR2.results, ...tR3.results]
      .map(s => formatItem(s, 'serie'));

    // Deduplicar por id+tipo
    const seen = new Set();
    allItems = [...movies, ...series].filter(i => {
      const k = i.type + i.id;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });

    applyFilters();
  } catch(e) {
    console.error(e);
    document.getElementById('catalogGrid').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"></div>
        <h3>Erro ao carregar</h3>
        <p>Verifique sua conexão e recarregue a página</p>
      </div>`;
  }
}

function formatItem(item, type) {
  const genreId = item.genre_ids?.[0];
  return {
    id: item.id,
    title: item.title || item.name || '—',
    type,
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
// FILTROS
// ============================================================
function applyFilters() {
  let list = [...allItems];

  // Tipo
  if (currentType !== 'todos') list = list.filter(i => i.type === currentType);

  // Gênero
  if (currentGenre !== 'todos') {
    const gId = parseInt(currentGenre);
    list = list.filter(i => i.genreIds.includes(gId));
  }

  // Busca
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase();
    list = list.filter(i => i.title.toLowerCase().includes(q));
  }

  // Ordenação
  if (currentSort === 'rating')  list.sort((a,b) => b.score - a.score);
  if (currentSort === 'year')    list.sort((a,b) => parseInt(b.year) - parseInt(a.year));
  if (currentSort === 'popular') list.sort((a,b) => b.popularity - a.popularity);

  filteredItems = list;
  displayedCount = 0;
  renderGrid(true);
}

function renderGrid(reset = false) {
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

  const loadMoreWrap = document.getElementById('loadMoreWrap');
  loadMoreWrap.style.display = displayedCount < filteredItems.length ? 'block' : 'none';
}

function loadMore() {
  renderGrid(false);
}

// ============================================================
// BUSCA GLOBAL (com debounce + API TMDB)
// ============================================================
function handleSearch(value) {
  const clearBtn = document.getElementById('searchClear');
  clearBtn.classList.toggle('visible', value.length > 0);

  clearTimeout(searchTimer);

  if (value.trim().length === 0) {
    searchQuery = '';
    isSearchMode = false;
    updatePageTitle();
    applyFilters();
    return;
  }

  searchTimer = setTimeout(async () => {
    searchQuery = value.trim();

    // Primeiro filtra o que já temos localmente (rápido)
    isSearchMode = true;
    applyFilters();

    // Depois busca na API para pegar títulos que não estão no cache
    try {
      const res = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(searchQuery)}&page=1`
      );
      const data = await res.json();
      const results = data.results.filter(r => r.media_type !== 'person' && (r.poster_path || r.backdrop_path));

      // Adiciona ao allItems o que não está ainda
      results.forEach(r => {
        const type = r.media_type === 'movie' ? 'filme' : 'serie';
        const exists = allItems.some(i => i.id === r.id && i.type === type);
        if (!exists) allItems.push(formatItem(r, type));
      });

      applyFilters();
    } catch(e) { /* mantém resultado local */ }
  }, 380);
}

function clearSearch() {
  document.getElementById('globalSearch').value = '';
  document.getElementById('searchClear').classList.remove('visible');
  searchQuery = '';
  isSearchMode = false;
  updatePageTitle();
  applyFilters();
}

// ============================================================
// CONTROLES DE FILTRO
// ============================================================
function setGenre(genre, el) {
  currentGenre = genre;
  document.querySelectorAll('.genre-pill-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  updatePageTitle();
  applyFilters();
}

function setType(type, el) {
  currentType = type;
  document.querySelectorAll('.type-pill').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  applyFilters();
}

function setSort(val) {
  currentSort = val;
  applyFilters();
}

function updatePageTitle() {
  const titleEl = document.getElementById('pageTitle');
  const subEl   = document.getElementById('pageSubtitle');
  if (isSearchMode && searchQuery) {
    titleEl.textContent = ` RESULTADOS PARA "${searchQuery.toUpperCase()}"`;
    subEl.textContent   = 'Resultados da busca no catálogo completo';
  } else {
    titleEl.textContent = ' LANÇAMENTOS';
    subEl.textContent   = 'Os títulos mais recentes em cartaz e no ar';
  }
}

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
    <span>${item.year}</span>
    <span>·</span>
    <span>${item.genre}</span>
    <span>·</span>
    <span class="m-star"> ${item.score}</span>`;

  // Trailer YouTube search link
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
// NAV DRAWER MOBILE
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

// Lê parâmetro ?categoria= da URL para pré-filtrar
const urlGenre = new URLSearchParams(location.search).get('categoria');
if (urlGenre) {
  const pillMap = { 'Ação':'28','Drama':'18','Comédia':'35','Terror':'27','Sci-Fi':'878','Animação':'16','Crime':'80' };
  const id = pillMap[urlGenre];
  if (id) {
    currentGenre = id;
    const el = document.querySelector(`.genre-pill-btn[data-genre="${id}"]`);
    if (el) { document.querySelectorAll('.genre-pill-btn').forEach(b=>b.classList.remove('active')); el.classList.add('active'); }
  }
}

init();