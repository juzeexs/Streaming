// CONFIGURAÇÃO DA API TMDB
const API_KEY = 'd51fec1a601f0d1c209761a719599c24';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const WIDE_URL = 'https://image.tmdb.org/t/p/original';

let allContent = [];

// Flags de origem dos países para o card international
const countryFlags = {
  'KR': '🇰🇷', 'JP': '🇯🇵', 'ES': '🇪🇸', 'FR': '🇫🇷', 'DE': '🇩🇪',
  'IT': '🇮🇹', 'MX': '🇲🇽', 'BR': '🇧🇷', 'IN': '🇮🇳', 'US': '🇺🇸',
  'GB': '🇬🇧', 'AU': '🇦🇺', 'CA': '🇨🇦', 'TR': '🇹🇷', 'DK': '🇩🇰'
};

// ===== BUSCA DADOS REAIS DO TMDB =====
async function fetchTMDBData() {
  try {
    const [movieRes, tvRes, trendingRes] = await Promise.all([
      fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`),
      fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=pt-BR&page=1`),
      fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=pt-BR`)
    ]);

    const movieData = await movieRes.json();
    const tvData = await tvRes.json();
    const trendingData = await trendingRes.json();

    const formattedMovies = movieData.results.map(m => ({
      id: m.id,
      title: m.title,
      genre: 'Filme',
      year: m.release_date ? m.release_date.split('-')[0] : '2024',
      rating: m.vote_average.toFixed(1),
      stars: '⭐ ' + m.vote_average.toFixed(1),
      duration: 'Cinema',
      director: 'TMDB',
      desc: m.overview || 'Sinopse não disponível.',
      img: m.poster_path ? IMG_URL + m.poster_path : 'https://via.placeholder.com/200x300?text=No+Image',
      wide: m.backdrop_path ? WIDE_URL + m.backdrop_path : 'https://via.placeholder.com/1280x720?text=No+Image',
      origin: m.original_language ? m.original_language.toUpperCase() : 'US',
      progress: 0,
      type: 'filme'
    }));

    const formattedSeries = tvData.results.map(s => ({
      id: s.id,
      title: s.name,
      genre: 'Série',
      year: s.first_air_date ? s.first_air_date.split('-')[0] : '2024',
      rating: s.vote_average.toFixed(1),
      stars: '⭐ ' + s.vote_average.toFixed(1),
      duration: 'Várias Temporadas',
      director: 'TV',
      desc: s.overview || 'Sinopse não disponível.',
      img: s.poster_path ? IMG_URL + s.poster_path : 'https://via.placeholder.com/200x300?text=No+Image',
      wide: s.backdrop_path ? WIDE_URL + s.backdrop_path : 'https://via.placeholder.com/1280x720?text=No+Image',
      origin: s.origin_country ? s.origin_country[0] : 'US',
      progress: 0,
      type: 'serie'
    }));

    allContent = [...formattedMovies, ...formattedSeries];

    renderAllSections();
    updateHeroWithRealData(formattedMovies[0]);
    renderTrending(trendingData.results.slice(0, 8));

  } catch (err) {
    console.error('Erro ao conectar com TMDB:', err);
  }
}

// ===== RENDERIZAÇÃO DAS SEÇÕES =====
function renderAllSections() {
  const movies = allContent.filter(i => i.type === 'filme').slice(0, 10);

  // Top 10 filmes e séries
  const seriesItems = allContent.filter(i => i.type === 'serie').slice(0, 15);
  seriesCache['todas'] = seriesItems.map(item => ({ ...item, _idx: allContent.indexOf(item) }));

  document.getElementById('moviesRow').innerHTML =
    movies.map((item, idx) => renderCard(item, allContent.indexOf(item), true)).join('');
  document.getElementById('seriesRow').innerHTML =
    seriesItems.map((item) => renderCard(item, allContent.indexOf(item), true)).join('');

  // Continue Assistindo
  const continueItems = allContent.slice(5, 9);
  continueItems.forEach(i => i.progress = Math.floor(Math.random() * 80) + 15);
  document.getElementById('continueRow').innerHTML =
    continueItems.map(item => renderContinueCard(item, allContent.indexOf(item))).join('');

  // Lançamentos
  const newItems = [...allContent].sort(() => 0.5 - Math.random()).slice(0, 12);
  document.getElementById('newRow').innerHTML =
    newItems.map(item => renderCard(item, allContent.indexOf(item))).join('');

  // Spotlight — cards horizontais
  const spotlightItems = allContent.slice(2, 8);
  document.getElementById('spotlightRow').innerHTML =
    spotlightItems.map(item => renderSpotlightCard(item, allContent.indexOf(item))).join('');

  // Internacionais — wide com score
  const intItems = allContent.slice(8, 18);
  document.getElementById('internationalRow').innerHTML =
    intItems.map(item => renderWideScoreCard(item, allContent.indexOf(item))).join('');

  // Mini cards — grid compacto
  const miniItems = allContent.slice(0, 12);
  document.getElementById('miniCardsGrid').innerHTML =
    miniItems.map(item => renderMiniCard(item, allContent.indexOf(item))).join('');

  // Categorias
  renderCategories();
}

// ===== CARD PADRÃO (poster 2:3) =====
function renderCard(item, idx, showRank = false) {
  const rank = showRank ? (idx % 10) + 1 : null;
  return `
    <div class="card" onclick="openModal(${idx})">
      <img class="card-poster" src="${item.img}" alt="${item.title}" loading="lazy">
      ${rank ? `<div class="card-rank">${rank}</div>` : ''}
      <div class="card-badge">⭐ ${item.rating}</div>
      <div class="card-info">
        <div class="card-title">${item.title}</div>
        <div class="card-genre">${item.genre} · ${item.year}</div>
      </div>
    </div>`;
}

// ===== CARD CONTINUE WATCHING =====
function renderContinueCard(item, idx) {
  return `
    <div class="card-continue" onclick="openModal(${idx})">
      <div class="card-continue-thumb">
        <img src="${item.wide}" alt="${item.title}" loading="lazy">
        <div class="progress-bar"><div class="progress-fill" style="width:${item.progress}%"></div></div>
      </div>
      <div class="card-continue-info">
        <div class="card-continue-title">${item.title}</div>
        <div class="card-continue-sub">${item.progress}% assistido · ${item.genre}</div>
      </div>
    </div>`;
}

// ===== CARD SPOTLIGHT (horizontal) =====
function renderSpotlightCard(item, idx) {
  const tags = ['🔥 Em Alta', '⭐ Destaque', '🆕 Novo', '🏆 Top Avaliado', '🎬 Original', '✨ Exclusivo'];
  const tag = tags[idx % tags.length];
  return `
    <div class="card-spotlight" onclick="openModal(${idx})">
      <img src="${item.wide}" alt="${item.title}" loading="lazy">
      <div class="card-spotlight-content">
        <div class="card-spotlight-tag">${tag}</div>
        <div>
          <div class="card-spotlight-title">${item.title.length > 22 ? item.title.substring(0, 22) + '…' : item.title}</div>
          <div class="card-spotlight-meta">
            <div class="card-spotlight-info">${item.year} · ${item.genre}</div>
            <button class="card-spotlight-btn">
              <i class="fa-solid fa-play" style="font-size:9px"></i> Assistir
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// ===== CARD WIDE COM SCORE =====
function renderWideScoreCard(item, idx) {
  const flag = countryFlags[item.origin] || '🌍';
  return `
    <div class="card-wide-score" onclick="openModal(${idx})">
      <div class="card-wide-score-thumb">
        <img src="${item.wide}" alt="${item.title}" loading="lazy">
        <div class="card-wide-score-play">
          <i class="fa-solid fa-play" style="font-size:11px;margin-left:2px"></i>
        </div>
      </div>
      <div class="card-wide-score-body">
        <div class="card-wide-score-header">
          <div class="card-wide-score-title">${item.title}</div>
          <div class="score-badge">⭐ ${item.rating}</div>
        </div>
        <div class="card-wide-score-meta">
          <span class="card-wide-score-flag">${flag}</span>
          <span class="card-wide-score-dot"></span>
          <span>${item.year}</span>
          <span class="card-wide-score-dot"></span>
          <span>${item.genre}</span>
        </div>
      </div>
    </div>`;
}

// ===== CARD MINI =====
function renderMiniCard(item, idx) {
  return `
    <div class="card-mini" onclick="openModal(${idx})">
      <div class="card-mini-thumb">
        <img src="${item.img}" alt="${item.title}" loading="lazy">
      </div>
      <div class="card-mini-body">
        <div class="card-mini-title">${item.title}</div>
        <div class="card-mini-genre">${item.genre} · ${item.year}</div>
        <div class="card-mini-footer">
          <div class="card-mini-rating">⭐ ${item.rating}</div>
          <span class="card-mini-new">NOVO</span>
        </div>
      </div>
    </div>`;
}

// ===== CATEGORIAS =====
function renderCategories() {
  const cats = [
    { name: 'Ação', color: '#ff453a', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=70' },
    { name: 'Drama', color: '#30d158', img: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&q=70' },
    { name: 'Comédia', color: '#ffd60a', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=70' },
    { name: 'Terror', color: '#bf5af2', img: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=70' },
    { name: 'Sci-Fi', color: '#0a84ff', img: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&q=70' },
    { name: 'Romance', color: '#ff375f', img: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70' },
    { name: 'Documentário', color: '#ff9f0a', img: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=70' },
    { name: 'Animação', color: '#5ac8fa', img: 'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?w=400&q=70' },
  ];

  document.getElementById('catGrid').innerHTML = cats.map(c => `
    <div class="cat-card" onclick="searchByGenreAndClose('${c.name}')">
      <img src="${c.img}" alt="${c.name}" loading="lazy">
      <div class="cat-card-name">${c.name}</div>
      <div class="cat-accent" style="background:${c.color}"></div>
    </div>`).join('');
}

// ===== TRENDING (para a busca) =====
function renderTrending(items) {
  const container = document.getElementById('searchTrending');
  if (!container) return;

  container.innerHTML = items.map(item => {
    const title = item.title || item.name || 'Desconhecido';
    const img = item.poster_path ? IMG_URL + item.poster_path : '';
    return `
      <div class="trending-pill" onclick="searchQuery('${title.replace(/'/g, "\\'")}')">
        ${img ? `<img src="${img}" alt="${title}">` : ''}
        ${title}
      </div>`;
  }).join('');
}

// ===== ATUALIZA O HERO =====
function updateHeroWithRealData(movie) {
  if (!movie) return;
  document.getElementById('heroTitle').innerHTML = movie.title.toUpperCase().replace(/ /g, '<br>');
  document.getElementById('heroDesc').textContent =
    (movie.desc || '').substring(0, 160) + '...';
  const heroImg = document.querySelector('.hero-slide.active img');
  if (heroImg) heroImg.src = movie.wide;
}

// ===== MODAL =====
function openModal(idx) {
  const item = allContent[idx];
  if (!item) return;
  document.getElementById('modalImg').src = item.wide;
  document.getElementById('modalTitle').textContent = item.title;
  document.getElementById('modalDesc').textContent = item.desc;
  document.getElementById('modalGenre').textContent = item.genre;
  document.getElementById('modalYear').textContent = item.year;
  document.getElementById('modalStars').textContent = item.stars;
  document.getElementById('modalRating').textContent = item.rating;
  document.getElementById('modalDirector').textContent = item.director || '—';
  document.getElementById('modalDuration').textContent = item.duration || '—';
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); }

function closeModalOnOverlay(event) {
  if (event.target === document.getElementById('modalOverlay')) closeModal();
}

// ===== SEARCH =====
let searchTimeout = null;

function openSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  setTimeout(() => document.getElementById('searchInput').focus(), 100);
  document.body.style.overflow = 'hidden';
}

function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.body.style.overflow = '';
  clearSearch();
}

function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  showSearchDefault();
}

function showSearchDefault() {
  document.getElementById('searchDefault').style.display = 'block';
  document.getElementById('searchResults').style.display = 'none';
  document.getElementById('searchEmpty').style.display = 'none';
}

function handleSearch(query) {
  const clearBtn = document.getElementById('searchClear');
  clearBtn.style.display = query.length > 0 ? 'flex' : 'none';

  clearTimeout(searchTimeout);

  if (!query.trim()) {
    showSearchDefault();
    return;
  }

  searchTimeout = setTimeout(() => performSearch(query.trim()), 300);
}

function searchQuery(title) {
  document.getElementById('searchInput').value = title;
  document.getElementById('searchClear').style.display = 'flex';
  performSearch(title);
}

function searchByGenre(genre) {
  document.getElementById('searchInput').value = genre;
  document.getElementById('searchClear').style.display = 'flex';
  performSearch(genre);
}

function searchByGenreAndClose(genre) {
  openSearch();
  setTimeout(() => searchByGenre(genre), 150);
}

async function performSearch(query) {
  document.getElementById('searchDefault').style.display = 'none';
  document.getElementById('searchEmpty').style.display = 'none';
  document.getElementById('searchResults').style.display = 'block';
  document.getElementById('searchResultsMeta').textContent = 'Buscando...';
  document.getElementById('searchResultsGrid').innerHTML = renderSearchSkeletons();

  try {
    // Busca na TMDB
    const res = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1`
    );
    const data = await res.json();
    const results = data.results.filter(r => r.media_type !== 'person' && (r.poster_path || r.backdrop_path));

    if (results.length === 0) {
      document.getElementById('searchResults').style.display = 'none';
      document.getElementById('searchEmpty').style.display = 'block';
      return;
    }

    document.getElementById('searchResultsMeta').textContent =
      `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${query}"`;

    document.getElementById('searchResultsGrid').innerHTML = results.map(item => {
      const title = item.title || item.name || 'Sem título';
      const year = (item.release_date || item.first_air_date || '').split('-')[0];
      const rating = item.vote_average ? item.vote_average.toFixed(1) : '—';
      const genre = item.media_type === 'movie' ? 'Filme' : 'Série';
      const img = item.poster_path
        ? IMG_URL + item.poster_path
        : 'https://via.placeholder.com/200x300/111111/555555?text=?';

      // Adiciona ao allContent se ainda não existir
      let idx = allContent.findIndex(c => c.id === item.id);
      if (idx === -1) {
        const newItem = {
          id: item.id,
          title,
          genre,
          year,
          rating,
          stars: '⭐ ' + rating,
          duration: genre === 'Filme' ? 'Cinema' : 'Várias Temporadas',
          director: '—',
          desc: item.overview || 'Sinopse não disponível.',
          img,
          wide: item.backdrop_path ? WIDE_URL + item.backdrop_path : img,
          progress: 0,
          type: item.media_type === 'movie' ? 'filme' : 'serie'
        };
        allContent.push(newItem);
        idx = allContent.length - 1;
      }

      return `
        <div class="search-result-card" onclick="openModal(${idx}); closeSearch();">
          <img src="${img}" alt="${title}" loading="lazy">
          <div class="search-result-info">
            <div class="search-result-title">${title}</div>
            <div class="search-result-sub">
              <span>${genre} · ${year}</span>
              <span class="search-result-rating">⭐ ${rating}</span>
            </div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    document.getElementById('searchResultsMeta').textContent = 'Erro ao buscar. Tente novamente.';
    document.getElementById('searchResultsGrid').innerHTML = '';
    console.error(err);
  }
}

function renderSearchSkeletons() {
  return Array(8).fill('').map(() => `
    <div style="border-radius:14px;overflow:hidden;background:var(--surface);border:1px solid var(--border);">
      <div style="aspect-ratio:2/3;background:linear-gradient(90deg,#1a1a1a 25%,#222 50%,#1a1a1a 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>
      <div style="padding:10px 12px;">
        <div style="height:12px;background:#222;border-radius:6px;margin-bottom:6px;width:80%;animation:shimmer 1.5s infinite;"></div>
        <div style="height:10px;background:#1a1a1a;border-radius:6px;width:50%;animation:shimmer 1.5s infinite;"></div>
      </div>
    </div>`).join('');
}

// Shimmer animation via JS
const shimmerStyle = document.createElement('style');
shimmerStyle.textContent = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}`;
document.head.appendChild(shimmerStyle);

// Fechar search com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (document.getElementById('searchOverlay').classList.contains('open')) closeSearch();
    else closeModal();
  }
});

// ===== HERO SLIDER =====
let currentSlide = 0;

function goToSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  slides[n].classList.add('active');
  dots[n].classList.add('active');
  currentSlide = n;
  if (allContent[n]) updateHeroWithRealData(allContent[n]);
}

setInterval(() => {
  const next = (currentSlide + 1) % 3;
  goToSlide(next);
}, 6000);

// ===== NAV DRAWER MOBILE =====
function toggleDrawer() {
  const drawer = document.getElementById('navDrawer');
  const icon = document.getElementById('menuIcon');
  const isOpen = drawer.classList.toggle('open');
  icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
}
function closeDrawer() {
  document.getElementById('navDrawer').classList.remove('open');
  document.getElementById('menuIcon').className = 'fa-solid fa-bars';
}
// Fecha drawer ao clicar fora
document.addEventListener('click', e => {
  const drawer = document.getElementById('navDrawer');
  const nav = document.getElementById('navbar');
  if (drawer.classList.contains('open') && !nav.contains(e.target) && !drawer.contains(e.target)) {
    closeDrawer();
  }
});

// ===== TABS — FILTRO REAL POR GÊNERO (TMDB) =====
// Mapeamento de gênero de séries na TMDB
const GENRE_MAP_TV = {
  'todas':  null,
  'drama':  18,
  'comedia': 35,
  'acao':   10759,  // Action & Adventure
  'crime':  80,
  'sci-fi': 10765,  // Sci-Fi & Fantasy
};

let seriesCache = {}; // cache por gênero para não refazer fetch

async function switchTab(btn, genre) {
  // Atualiza visual dos botões
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const row = document.getElementById('seriesRow');

  // Skeleton enquanto carrega
  row.innerHTML = renderCardSkeletons(8);

  // Se já tem cache, usa direto
  if (seriesCache[genre]) {
    renderSeriesRow(seriesCache[genre]);
    return;
  }

  try {
    let items = [];
    const genreId = GENRE_MAP_TV[genre];

    if (!genreId) {
      // "Todas" — usa o que já temos
      items = allContent.filter(i => i.type === 'serie').slice(0, 15);
    } else {
      const res = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=pt-BR&with_genres=${genreId}&sort_by=popularity.desc&page=1`
      );
      const data = await res.json();

      items = data.results.map(s => {
        // Adiciona ao allContent se ainda não existir
        let idx = allContent.findIndex(c => c.id === s.id && c.type === 'serie');
        if (idx === -1) {
          const newItem = {
            id: s.id,
            title: s.name,
            genre: 'Série',
            year: s.first_air_date ? s.first_air_date.split('-')[0] : '2024',
            rating: s.vote_average.toFixed(1),
            stars: '⭐ ' + s.vote_average.toFixed(1),
            duration: 'Várias Temporadas',
            director: '—',
            desc: s.overview || 'Sinopse não disponível.',
            img: s.poster_path ? IMG_URL + s.poster_path : 'https://via.placeholder.com/200x300?text=N/A',
            wide: s.backdrop_path ? WIDE_URL + s.backdrop_path : 'https://via.placeholder.com/1280x720?text=N/A',
            origin: s.origin_country ? s.origin_country[0] : 'US',
            progress: 0,
            type: 'serie'
          };
          allContent.push(newItem);
          idx = allContent.length - 1;
        }
        return { ...allContent[idx], _idx: idx };
      });
    }

    seriesCache[genre] = items;
    renderSeriesRow(items);
  } catch (err) {
    row.innerHTML = `<p style="color:var(--muted);padding:20px">Erro ao carregar. Tente novamente.</p>`;
    console.error(err);
  }
}

function renderSeriesRow(items) {
  const row = document.getElementById('seriesRow');
  row.innerHTML = items.map((item, i) => {
    const idx = item._idx !== undefined ? item._idx : allContent.findIndex(c => c.id === item.id);
    return renderCard(item, idx, true);
  }).join('');
}

function renderCardSkeletons(count) {
  return Array(count).fill('').map(() => `
    <div style="flex:0 0 auto;width:200px;border-radius:14px;overflow:hidden;background:var(--surface);">
      <div style="aspect-ratio:2/3;background:linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;"></div>
      <div style="padding:12px;">
        <div style="height:12px;background:#222;border-radius:6px;margin-bottom:6px;width:75%;animation:shimmer 1.4s infinite;"></div>
        <div style="height:10px;background:#1a1a1a;border-radius:6px;width:45%;animation:shimmer 1.4s infinite;"></div>
      </div>
    </div>`).join('');
}

// ===== SCROLL COM SETAS =====
function scrollRow(rowId, direction) {
  const row = document.getElementById(rowId);
  if (!row) return;
  // Descobre a largura de um card (primeiro filho)
  const card = row.firstElementChild;
  const cardWidth = card ? card.offsetWidth + 14 : 220; // +gap
  const scrollAmount = cardWidth * 3; // avança 3 cards
  row.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// ===== PLAN SELECT =====
function selectPlan(plan) {
  alert(`Plano ${plan} selecionado! Redirecionando para pagamento...`);
}

// ===== NOTIF BAR =====
setTimeout(() => {
  const bar = document.getElementById('notifBar');
  if (bar) {
    bar.classList.add('show');
    setTimeout(() => bar.classList.remove('show'), 5000);
  }
}, 3000);

// ===== INIT =====
fetchTMDBData();