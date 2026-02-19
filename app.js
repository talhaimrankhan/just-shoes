/* ═══════════════════════════════════════════════
   JUST/SHOES — app.js
═══════════════════════════════════════════════ */

'use strict';

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const CONFIG = {
  API_ENDPOINT: '/.netlify/functions/get-images',
  FIELDS: {
    imageUrl:    'Image',
    title:       'Title',
    description: 'Description',
    date:        'Created Date',
  }
};

const RATIO_MAP = { tall: '130%', wide: '65%', square: '100%' };

function randomRatio() {
  return ['tall', 'wide', 'square', 'tall', 'wide'][Math.floor(Math.random() * 5)];
}

function fixImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/'))  return 'https://justshoes.info' + url;
  return url;
}

// ─────────────────────────────────────────────
//  CUSTOM CURSOR
// ─────────────────────────────────────────────
function initCursor() {
  const cursor     = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');
  if (!cursor || !cursorRing) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .masonry-item, .collection-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); cursorRing.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); cursorRing.classList.remove('hover'); });
  });
}

function initCursorHover() {
  const cursor     = document.querySelector('.cursor');
  const cursorRing = document.querySelector('.cursor-ring');
  if (!cursor || !cursorRing) return;
  document.querySelectorAll('.masonry-item, .collection-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); cursorRing.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); cursorRing.classList.remove('hover'); });
  });
}

// ─────────────────────────────────────────────
//  SCROLL REVEAL
// ─────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─────────────────────────────────────────────
//  FETCH FROM NETLIFY FUNCTION
// ─────────────────────────────────────────────
async function fetchImages() {
  const res = await fetch(CONFIG.API_ENDPOINT);
  if (!res.ok) throw new Error('Function returned ' + res.status);
  const json = await res.json();

  return json.response.results.map(item => ({
    id:          item._id,
    imageUrl:    fixImageUrl(item[CONFIG.FIELDS.imageUrl]),
    title:       item[CONFIG.FIELDS.title]       || 'Untitled',
    description: item[CONFIG.FIELDS.description] || '',
    category:    'Featured',
    date:        item[CONFIG.FIELDS.date]
                   ? new Date(item[CONFIG.FIELDS.date]).toLocaleDateString('en-US', { month:'short', year:'numeric' })
                   : '',
    link:        '#',
    aspectRatio: randomRatio(),
  }));
}

// ─────────────────────────────────────────────
//  RENDER MASONRY GRID
// ─────────────────────────────────────────────
let allImages    = [];
let currentIndex = 0;

function renderGrid(images) {
  const grid    = document.getElementById('masonryGrid');
  const loading = document.getElementById('gridLoading');
  const count   = document.getElementById('imageCount');
  if (!grid) return;

  grid.innerHTML = '';
  if (loading) loading.style.display = 'none';
  if (count)   count.textContent = images.length + ' images';

  images.forEach((img, i) => {
    const paddingBottom = RATIO_MAP[img.aspectRatio] || '100%';
    const item = document.createElement('div');
    item.className = 'masonry-item';
    item.dataset.index = i;
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View ' + img.title);

    item.innerHTML =
      '<div class="masonry-img-wrap">' +
        '<div style="padding-bottom:' + paddingBottom + ';position:relative;overflow:hidden;">' +
          '<img data-src="' + img.imageUrl + '" src="" alt="' + img.title + '" class="loading"' +
          ' style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />' +
        '</div>' +
        '<div class="masonry-overlay">' +
          '<div class="overlay-title">' + img.title + '</div>' +
          '<div class="overlay-meta">' + img.category + ' &middot; ' + img.date + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="masonry-footer">' +
        '<span class="masonry-tag">' + img.category + '</span>' +
        '<span class="masonry-date">' + img.date + '</span>' +
      '</div>';

    grid.appendChild(item);
    setTimeout(() => item.classList.add('visible'), 60 + i * 35);
    item.addEventListener('click',   () => openLightbox(i));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); });
  });

  // Lazy load
  const imgs = grid.querySelectorAll('img[data-src]');
  const lazyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.src = el.dataset.src;
      el.onload = () => el.classList.remove('loading');
      lazyObs.unobserve(el);
    });
  }, { rootMargin: '200px' });
  imgs.forEach(img => lazyObs.observe(img));

  initCursorHover();
}

// ─────────────────────────────────────────────
//  MARQUEE
// ─────────────────────────────────────────────
function buildMarquee(images) {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const titles = images.map(i => i.title);
  const items  = [...titles, ...titles];
  track.innerHTML = items.map(t =>
    '<span class="marquee-item">' + t + ' <span>&middot;</span></span>'
  ).join('');
}

// ─────────────────────────────────────────────
//  LIGHTBOX
// ─────────────────────────────────────────────
function openLightbox(index) {
  currentIndex = index;
  const img = allImages[index];
  const lb  = document.getElementById('lightbox');
  if (!lb) return;

  document.getElementById('lbImg').src           = img.imageUrl;
  document.getElementById('lbImg').alt           = img.title;
  document.getElementById('lbTag').textContent   = img.category;
  document.getElementById('lbTitle').textContent = img.title;
  document.getElementById('lbDesc').textContent  = img.description;
  document.getElementById('lbLink').href         = img.link;
  document.getElementById('lbMeta').innerHTML =
    '<div class="lb-meta-item"><span class="lb-meta-key">Date</span><span class="lb-meta-val">' + img.date + '</span></div>' +
    '<div class="lb-meta-item"><span class="lb-meta-key">Category</span><span class="lb-meta-val">' + img.category + '</span></div>' +
    '<div class="lb-meta-item"><span class="lb-meta-key">ID</span><span class="lb-meta-val">#' + img.id.slice(0,8) + '</span></div>';

  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentIndex = (currentIndex + dir + allImages.length) % allImages.length;
  openLightbox(currentIndex);
}

function initLightboxEvents() {
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
//  NEWSLETTER
// ─────────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (input && input.value) {
      showToast('You\'re on the list. Welcome to JUST/SHOES.');
      input.value = '';
    }
  });
}

// ─────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─────────────────────────────────────────────
//  DEMO FALLBACK IMAGES
// ─────────────────────────────────────────────
const DEMO_IMAGES = [
  { id:'1',  imageUrl:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', title:'Air Force One',     category:'Featured', description:'Classic white leather upper, clean silhouette.', date:'Feb 2025', link:'#', aspectRatio:'tall'   },
  { id:'2',  imageUrl:'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600', title:'Runner Pro Black', category:'Featured', description:'Lightweight mesh construction.', date:'Feb 2025', link:'#', aspectRatio:'wide'   },
  { id:'3',  imageUrl:'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', title:'Leather Oxford',  category:'Featured', description:'Premium grain leather with brogue detailing.', date:'Jan 2025', link:'#', aspectRatio:'square' },
  { id:'4',  imageUrl:'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600', title:'Court Classic',    category:'Featured', description:'Tennis heritage meets street style.', date:'Jan 2025', link:'#', aspectRatio:'tall'   },
  { id:'5',  imageUrl:'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', title:'Suede Chelsea',   category:'Featured', description:'Supple suede with elastic side panels.', date:'Feb 2025', link:'#', aspectRatio:'square' },
  { id:'6',  imageUrl:'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', title:'Trail Blazer',    category:'Featured', description:'Rugged outsole for outdoor terrain.', date:'Jan 2025', link:'#', aspectRatio:'wide'   },
  { id:'7',  imageUrl:'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=600', title:'Minimalist Low',  category:'Featured', description:'Zero-clutter design. Pure form.', date:'Feb 2025', link:'#', aspectRatio:'tall'   },
  { id:'8',  imageUrl:'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600', title:'Velocity X',     category:'Featured', description:'Carbon fibre plate. Record-breaking.', date:'Jan 2025', link:'#', aspectRatio:'wide'   },
  { id:'9',  imageUrl:'https://images.unsplash.com/photo-1584735175315-9d5df23be4be?w=600', title:'Desert Boot',    category:'Featured', description:'Crepe sole, sand suede. Icon status.', date:'Dec 2024', link:'#', aspectRatio:'square' },
  { id:'10', imageUrl:'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=600', title:'Platform Drift', category:'Featured', description:'Chunky sole on a slim upper.', date:'Feb 2025', link:'#', aspectRatio:'tall'   },
  { id:'11', imageUrl:'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600', title:'High Rise',      category:'Featured', description:'Ankle support meets luxury finish.', date:'Jan 2025', link:'#', aspectRatio:'wide'   },
  { id:'12', imageUrl:'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600', title:'Canvas Low',     category:'Featured', description:'The original. Unbeatable.', date:'Dec 2024', link:'#', aspectRatio:'square' },
  { id:'13', imageUrl:'https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=600', title:'Neoprene Slip',  category:'Featured', description:'Sock-like fit with sculpted midsole.', date:'Feb 2025', link:'#', aspectRatio:'tall'   },
  { id:'14', imageUrl:'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', title:'Heritage Runner', category:'Featured', description:'Archival colourways reissued for 2025.', date:'Jan 2025', link:'#', aspectRatio:'wide'   },
  { id:'15', imageUrl:'https://images.unsplash.com/photo-1536520002442-39284f4d4bfd?w=600', title:'Loafer Noir',    category:'Featured', description:'Horsebit hardware on calfskin.', date:'Dec 2024', link:'#', aspectRatio:'square' },
  { id:'16', imageUrl:'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600', title:'Foam Runner',    category:'Featured', description:'One-piece injected foam. Incredibly light.', date:'Feb 2025', link:'#', aspectRatio:'tall'   },
  { id:'17', imageUrl:'https://images.unsplash.com/photo-1516478177764-9fe5bd7e9717?w=600', title:'Woven Mule',     category:'Featured', description:'Artisan woven upper, leather sole.', date:'Jan 2025', link:'#', aspectRatio:'wide'   },
  { id:'18', imageUrl:'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600', title:'Tabi Split',     category:'Featured', description:'Architectural split-toe in matte leather.', date:'Feb 2025', link:'#', aspectRatio:'square' },
  { id:'19', imageUrl:'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600', title:'Sock Racer',      category:'Featured', description:'Knit upper fused to responsive foam sole.', date:'Jan 2025', link:'#', aspectRatio:'tall'   },
  { id:'20', imageUrl:'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600', title:'Stacked Mule',   category:'Featured', description:'Square toe, stacked wood heel.', date:'Dec 2024', link:'#', aspectRatio:'wide'   },
  { id:'21', imageUrl:'https://images.unsplash.com/photo-1518894781321-630e638d0742?w=600', title:'Slip On Pro',    category:'Featured', description:'Vulcanised sole on premium canvas.', date:'Feb 2025', link:'#', aspectRatio:'square' },
  { id:'22', imageUrl:'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600', title:'Gore-Tex Hiker', category:'Featured', description:'Waterproof membrane with Vibram outsole.', date:'Jan 2025', link:'#', aspectRatio:'tall'   },
  { id:'23', imageUrl:'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600', title:'Creeper Sole',   category:'Featured', description:'Elevated sole on punk-inspired upper.', date:'Dec 2024', link:'#', aspectRatio:'wide'   },
  { id:'24', imageUrl:'https://images.unsplash.com/photo-1562183241-840b8af0721e?w=600', title:'Lug Sole Boot',   category:'Featured', description:'Military-grade lug sole on waxed suede.', date:'Feb 2025', link:'#', aspectRatio:'square' },
  { id:'25', imageUrl:'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=600', title:'Drift Low White', category:'Featured', description:'All-white court shoe, minimal branding.', date:'Jan 2025', link:'#', aspectRatio:'tall'   },
];

// ─────────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Cursor and scroll reveal run on every page
  initCursor();
  initScrollReveal();

  // These only apply to the landing page (index.html)
  const isLandingPage = !!document.getElementById('masonryGrid');
  if (!isLandingPage) return;

  initLightboxEvents();
  initNewsletter();

  try {
    allImages = await fetchImages();
    renderGrid(allImages);
  } catch (err) {
    console.warn('Bubble fetch failed, showing demo data:', err.message);
    allImages = DEMO_IMAGES;
    renderGrid(allImages);
    showToast('Could not load images from server. Showing demo data.');
  }
});
