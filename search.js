/* ═══════════════════════════════════════════════
   JUST/SHOES — search.js
   Search page logic
═══════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────
//  DEMO DATA (25 shoe images — replace with
//  real Bubble fetch when backend is ready)
// ─────────────────────────────────────────────
const SEARCH_DEMO = [
  { id:'1',  imageUrl:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',  title:'Air Force One',      brand:'Nike',    gender:'men',   colour:'white', category:'Sneakers', date:'Feb 2025', aspectRatio:'tall'   },
  { id:'2',  imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600', title:'Runner Pro Black',  brand:'Adidas',  gender:'men',   colour:'black', category:'Running',  date:'Feb 2025', aspectRatio:'wide'   },
  { id:'3',  imageUrl:'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', title:'Leather Oxford',   brand:'Church\'s',gender:'men',  colour:'tan',   category:'Formal',   date:'Jan 2025', aspectRatio:'square' },
  { id:'4',  imageUrl:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600',  title:'Court Classic',     brand:'Vans',    gender:'women', colour:'white', category:'Sneakers', date:'Jan 2025', aspectRatio:'tall'   },
  { id:'5',  imageUrl:'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', title:'Suede Chelsea',    brand:'Clarks',  gender:'men',   colour:'tan',   category:'Boots',    date:'Feb 2025', aspectRatio:'square' },
  { id:'6',  imageUrl:'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', title:'Trail Blazer',     brand:'Salomon', gender:'women', colour:'grey',  category:'Outdoor',  date:'Jan 2025', aspectRatio:'wide'   },
  { id:'7',  imageUrl:'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600',  title:'Minimalist Low',    brand:'Common Projects', gender:'men', colour:'white', category:'Sneakers', date:'Feb 2025', aspectRatio:'tall' },
  { id:'8',  imageUrl:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600', title:'Velocity X',       brand:'Nike',    gender:'women', colour:'black', category:'Running',  date:'Jan 2025', aspectRatio:'wide'   },
  { id:'9',  imageUrl:'https://images.unsplash.com/photo-1584735175315-9d5df23be4be?w=600', title:'Desert Boot',      brand:'Clarks',  gender:'men',   colour:'tan',   category:'Boots',    date:'Dec 2024', aspectRatio:'square' },
  { id:'10', imageUrl:'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600', title:'Platform Drift',   brand:'Balenciaga', gender:'women', colour:'white', category:'Sneakers', date:'Feb 2025', aspectRatio:'tall' },
  { id:'11', imageUrl:'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600', title:'High Rise',        brand:'Converse',gender:'women', colour:'black', category:'Boots',    date:'Jan 2025', aspectRatio:'wide'   },
  { id:'12', imageUrl:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600', title:'Canvas Low',       brand:'Converse',gender:'men',   colour:'white', category:'Sneakers', date:'Dec 2024', aspectRatio:'square' },
  { id:'13', imageUrl:'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=600', title:'Neoprene Slip',    brand:'Maison Margiela', gender:'women', colour:'black', category:'Loafers', date:'Feb 2025', aspectRatio:'tall' },
  { id:'14', imageUrl:'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',  title:'Heritage Runner',   brand:'New Balance', gender:'men', colour:'grey', category:'Running', date:'Jan 2025', aspectRatio:'wide'   },
  { id:'15', imageUrl:'https://images.unsplash.com/photo-1536520002442-39284f4d4bfd?w=600', title:'Loafer Noir',      brand:'Gucci',   gender:'women', colour:'black', category:'Loafers',  date:'Dec 2024', aspectRatio:'square' },
  { id:'16', imageUrl:'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600', title:'Foam Runner',      brand:'Adidas',  gender:'men',   colour:'tan',   category:'Sneakers', date:'Feb 2025', aspectRatio:'tall'   },
  { id:'17', imageUrl:'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=600', title:'Woven Mule',       brand:'Bottega Veneta', gender:'women', colour:'tan', category:'Mules', date:'Jan 2025', aspectRatio:'wide' },
  { id:'18', imageUrl:'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600', title:'Tabi Split Toe',   brand:'Maison Margiela', gender:'women', colour:'black', category:'Boots', date:'Feb 2025', aspectRatio:'square' },
  { id:'19', imageUrl:'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600',  title:'Sock Racer',        brand:'Nike',    gender:'men',   colour:'black', category:'Running',  date:'Jan 2025', aspectRatio:'tall'   },
  { id:'20', imageUrl:'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600', title:'Stacked Mule',     brand:'Rejina Pyo', gender:'women', colour:'tan', category:'Mules', date:'Dec 2024', aspectRatio:'wide'   },
  { id:'21', imageUrl:'https://images.unsplash.com/photo-1518894781321-630e638d0742?w=600', title:'Slip On Pro',      brand:'Vans',    gender:'men',   colour:'black', category:'Sneakers', date:'Feb 2025', aspectRatio:'square' },
  { id:'22', imageUrl:'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600', title:'Gore-Tex Hiker',   brand:'Salomon', gender:'men',   colour:'grey',  category:'Outdoor',  date:'Jan 2025', aspectRatio:'tall'   },
  { id:'23', imageUrl:'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600', title:'Creeper Sole',     brand:'Rick Owens', gender:'women', colour:'black', category:'Sneakers', date:'Dec 2024', aspectRatio:'wide' },
  { id:'24', imageUrl:'https://images.unsplash.com/photo-1562183241-840b8af0721e?w=600',  title:'Lug Sole Boot',     brand:'Dr. Martens', gender:'women', colour:'black', category:'Boots', date:'Feb 2025', aspectRatio:'square' },
  { id:'25', imageUrl:'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600',  title:'Drift Low White',   brand:'Common Projects', gender:'men', colour:'white', category:'Sneakers', date:'Jan 2025', aspectRatio:'tall' },
];

const RATIO_MAP = { tall:'130%', wide:'65%', square:'100%' };

// ─────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────
let allItems     = [...SEARCH_DEMO];
let filteredItems= [...SEARCH_DEMO];
let activeFilters = {
  gender: [],
  colour: [],
  sort:   'latest'
};
let currentLbIndex = 0;

// ─────────────────────────────────────────────
//  READ URL PARAMS
// ─────────────────────────────────────────────
function getUrlQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
}

// ─────────────────────────────────────────────
//  FILTER + SORT LOGIC
// ─────────────────────────────────────────────
function applyFiltersAndSearch(keyword) {
  let results = [...allItems];

  // Keyword search across title, brand, category, colour
  if (keyword) {
    const kw = keyword.toLowerCase();
    results = results.filter(item =>
      (item.title    && item.title.toLowerCase().includes(kw))    ||
      (item.brand    && item.brand.toLowerCase().includes(kw))    ||
      (item.category && item.category.toLowerCase().includes(kw)) ||
      (item.colour   && item.colour.toLowerCase().includes(kw))   ||
      (item.gender   && item.gender.toLowerCase().includes(kw))
    );
  }

  // Gender filter
  if (activeFilters.gender.length > 0) {
    results = results.filter(item => activeFilters.gender.includes(item.gender));
  }

  // Colour filter
  if (activeFilters.colour.length > 0) {
    results = results.filter(item => activeFilters.colour.includes(item.colour));
  }

  // Sort
  if (activeFilters.sort === 'oldest') {
    results = results.slice().reverse();
  }

  filteredItems = results;
  return results;
}

// ─────────────────────────────────────────────
//  RENDER GRID
// ─────────────────────────────────────────────
function renderResults(items, keyword) {
  const grid    = document.getElementById('searchGrid');
  const countEl = document.getElementById('resultsCount');
  const emptyEl = document.getElementById('searchEmpty');
  if (!grid) return;

  // Update count
  if (countEl) {
    if (keyword) {
      countEl.innerHTML = '<strong>' + items.length + '</strong> results for <span class="search-keyword">"' + keyword + '"</span>';
    } else {
      countEl.innerHTML = 'Showing <strong>' + items.length + '</strong> items';
    }
  }

  // Empty state
  if (items.length === 0) {
    grid.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  grid.innerHTML = '';
  items.forEach((item, i) => {
    const paddingBottom = RATIO_MAP[item.aspectRatio] || '100%';
    const el = document.createElement('div');
    el.className = 'masonry-item';
    el.dataset.index = i;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'View ' + item.title);

    el.innerHTML =
      '<div class="masonry-img-wrap">' +
        '<div style="padding-bottom:' + paddingBottom + ';position:relative;overflow:hidden;">' +
          '<img data-src="' + item.imageUrl + '" src="" alt="' + item.title + '" class="loading"' +
          ' style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />' +
        '</div>' +
        '<div class="masonry-overlay">' +
          '<div class="overlay-title">' + item.title + '</div>' +
          '<div class="overlay-meta">' + (item.brand || item.category) + ' &middot; ' + item.date + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="masonry-footer">' +
        '<span class="masonry-tag">' + (item.brand || item.category) + '</span>' +
        '<span class="masonry-date">' + item.date + '</span>' +
      '</div>';

    grid.appendChild(el);
    setTimeout(() => el.classList.add('visible'), 40 + i * 30);
    el.addEventListener('click',   () => openLightbox(i));
    el.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') openLightbox(i); });
  });

  // Lazy load
  const imgs = grid.querySelectorAll('img[data-src]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const imgEl = entry.target;
      imgEl.src = imgEl.dataset.src;
      imgEl.onload = () => imgEl.classList.remove('loading');
      observer.unobserve(imgEl);
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => observer.observe(img));
}

// ─────────────────────────────────────────────
//  ACTIVE FILTER TAGS (below sidebar header)
// ─────────────────────────────────────────────
function renderActiveTags() {
  const container = document.getElementById('activeTags');
  if (!container) return;
  const tags = [...activeFilters.gender, ...activeFilters.colour];
  if (tags.length === 0) { container.innerHTML = ''; return; }
  container.innerHTML = tags.map(tag =>
    '<button class="active-filter-tag" data-tag="' + tag + '">' +
      tag +
      '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
    '</button>'
  ).join('');

  container.querySelectorAll('.active-filter-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      activeFilters.gender = activeFilters.gender.filter(t => t !== tag);
      activeFilters.colour = activeFilters.colour.filter(t => t !== tag);
      syncCheckboxes();
      renderActiveTags();
      refresh();
    });
  });
}

function syncCheckboxes() {
  document.querySelectorAll('.filter-option input[type="checkbox"], .filter-colour-option input[type="checkbox"]').forEach(cb => {
    const type = cb.dataset.type;
    const val  = cb.dataset.value;
    if (type === 'gender') cb.checked = activeFilters.gender.includes(val);
    if (type === 'colour') cb.checked = activeFilters.colour.includes(val);
  });
}

// ─────────────────────────────────────────────
//  REFRESH — re-filter and re-render
// ─────────────────────────────────────────────
function refresh() {
  const keyword = document.getElementById('searchInput')
    ? document.getElementById('searchInput').value.trim()
    : getUrlQuery();
  const results = applyFiltersAndSearch(keyword);
  renderResults(results, keyword);
}

// ─────────────────────────────────────────────
//  FILTER ACCORDION
// ─────────────────────────────────────────────
function initFilterAccordions() {
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.closest('.filter-group');
      group.classList.toggle('open');
    });
  });
}

// ─────────────────────────────────────────────
//  FILTER CHECKBOXES
// ─────────────────────────────────────────────
function initFilterCheckboxes() {
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const type = cb.dataset.type;
      const val  = cb.dataset.value;
      if (type === 'gender') {
        if (cb.checked) activeFilters.gender.push(val);
        else activeFilters.gender = activeFilters.gender.filter(v => v !== val);
      }
      renderActiveTags();
      refresh();
    });
  });

  document.querySelectorAll('.filter-colour-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const val = cb.dataset.value;
      if (cb.checked) activeFilters.colour.push(val);
      else activeFilters.colour = activeFilters.colour.filter(v => v !== val);
      renderActiveTags();
      refresh();
    });
  });
}

// ─────────────────────────────────────────────
//  SORT
// ─────────────────────────────────────────────
function initSort() {
  const select = document.getElementById('sortSelect');
  if (!select) return;
  select.addEventListener('change', () => {
    activeFilters.sort = select.value;
    refresh();
  });
}

// ─────────────────────────────────────────────
//  CLEAR ALL FILTERS
// ─────────────────────────────────────────────
function initClearAll() {
  const btn = document.getElementById('clearAllFilters');
  if (!btn) return;
  btn.addEventListener('click', () => {
    activeFilters.gender = [];
    activeFilters.colour = [];
    activeFilters.sort   = 'latest';
    document.getElementById('sortSelect').value = 'latest';
    syncCheckboxes();
    renderActiveTags();
    refresh();
  });
}

// ─────────────────────────────────────────────
//  SEARCH BAR IN HEADER
// ─────────────────────────────────────────────
function initSearchBar() {
  const input   = document.getElementById('searchInput');
  const clearBtn= document.getElementById('searchClear');
  const form    = document.getElementById('searchForm');
  if (!input) return;

  // Pre-fill with URL query
  const q = getUrlQuery();
  if (q) { input.value = q; if (clearBtn) clearBtn.classList.add('visible'); }

  input.addEventListener('input', () => {
    if (clearBtn) clearBtn.classList.toggle('visible', input.value.length > 0);
    // Live filter as you type
    refresh();
    // Update URL without reload
    const url = new URL(window.location);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('visible');
      refresh();
      const url = new URL(window.location);
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
      input.focus();
    });
  }

  if (form) {
    form.addEventListener('submit', e => { e.preventDefault(); refresh(); });
  }
}

// ─────────────────────────────────────────────
//  MOBILE FILTER TOGGLE
// ─────────────────────────────────────────────
function initMobileFilter() {
  const toggle  = document.getElementById('filterToggle');
  const content = document.getElementById('filterContent');
  if (!toggle || !content) return;
  toggle.addEventListener('click', () => {
    content.classList.toggle('open');
    toggle.textContent = content.classList.contains('open') ? '✕ Hide filters' : '⊞ Filters';
  });
}

// ─────────────────────────────────────────────
//  LIGHTBOX
// ─────────────────────────────────────────────
function openLightbox(index) {
  currentLbIndex = index;
  const item = filteredItems[index];
  const lb   = document.getElementById('lightbox');
  if (!lb) return;

  document.getElementById('lbImg').src           = item.imageUrl;
  document.getElementById('lbImg').alt           = item.title;
  document.getElementById('lbTag').textContent   = item.category || 'Featured';
  document.getElementById('lbTitle').textContent = item.title;
  document.getElementById('lbDesc').textContent  = item.brand ? 'By ' + item.brand : '';
  document.getElementById('lbLink').href         = '#';
  document.getElementById('lbMeta').innerHTML    =
    '<div class="lb-meta-item"><span class="lb-meta-key">Brand</span><span class="lb-meta-val">'  + (item.brand    || '—') + '</span></div>' +
    '<div class="lb-meta-item"><span class="lb-meta-key">Gender</span><span class="lb-meta-val">' + (item.gender   || '—') + '</span></div>' +
    '<div class="lb-meta-item"><span class="lb-meta-key">Colour</span><span class="lb-meta-val">' + (item.colour   || '—') + '</span></div>' +
    '<div class="lb-meta-item"><span class="lb-meta-key">Date</span><span class="lb-meta-val">'   + (item.date     || '—') + '</span></div>';

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentLbIndex = (currentLbIndex + dir + filteredItems.length) % filteredItems.length;
  openLightbox(currentLbIndex);
}

function initLightbox() {
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');
  const lb      = document.getElementById('lightbox');

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click',  () => navigateLightbox(-1));
  if (lbNext)  lbNext.addEventListener('click',  () => navigateLightbox(1));
  if (lb)      lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  });
}

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // shared cursor from app.js is loaded too
  initFilterAccordions();
  initFilterCheckboxes();
  initSort();
  initClearAll();
  initSearchBar();
  initMobileFilter();
  initLightbox();

  // Initial render with URL keyword
  const keyword = getUrlQuery();
  const results = applyFiltersAndSearch(keyword);
  renderResults(results, keyword);

  // Open all filter groups by default
  document.querySelectorAll('.filter-group').forEach(g => g.classList.add('open'));
});
