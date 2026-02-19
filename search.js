/* ═══════════════════════════════════════════════
   JUST/SHOES — search.js  v3
   Wrapped in IIFE to prevent scope conflicts
═══════════════════════════════════════════════ */
(function() {
'use strict';

/* ═══════════════════════════════════════════════
   JUST/SHOES — search.js  v2
   Real Bubble data, multi-image lightbox
═══════════════════════════════════════════════ */
var API_ENDPOINT = '/.netlify/functions/get-products';
var RATIO_CYCLE  = ['tall','wide','square','tall','square','wide'];
var RATIO_MAP    = { tall:'130%', wide:'68%', square:'100%' };

var allProducts      = [];
var filteredProducts = [];
var activeBrand      = [];
var activeCategory   = [];
var sortOrder        = 'latest';
var lbProductIndex   = 0;
var lbImageIndex     = 0;

/* ── UTILS ── */
function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function getUrlQuery() {
  return (new URLSearchParams(window.location.search).get('q')||'').trim();
}
function setUrlQuery(q) {
  var url=new URL(window.location);
  q ? url.searchParams.set('q',q) : url.searchParams.delete('q');
  window.history.replaceState({},'',url);
}

/* ── LOADING STATES ── */
function showLoading() {
  var el=document.getElementById('searchLoading'); if(el) el.style.display='flex';
  var g=document.getElementById('searchGrid'); if(g) g.innerHTML='';
  var e=document.getElementById('searchEmpty'); if(e) e.style.display='none';
}
function hideLoading() {
  var el=document.getElementById('searchLoading'); if(el) el.style.display='none';
}
function showErrorState(msg) {
  var e=document.getElementById('searchEmpty'); if(!e) return;
  e.style.display='block';
  var t=e.querySelector('.search-empty-title'); if(t) t.textContent='Something went wrong';
  var s=e.querySelector('.search-empty-sub');   if(s) s.textContent=msg;
}

/* ── FETCH ── */
async function loadProducts() {
  showLoading();
  try {
    console.log('[JustShoes] Fetching from', API_ENDPOINT);
    var res = await fetch(API_ENDPOINT);
    console.log('[JustShoes] Response status:', res.status);
    if (!res.ok) throw new Error('API returned ' + res.status);
    var data = await res.json();
    console.log('[JustShoes] Data received:', data);
    if (data.error) throw new Error(data.error);
    allProducts = data.products || [];
    console.log('[JustShoes] Products loaded:', allProducts.length);
    hideLoading();
  } catch(err) {
    console.error('[JustShoes] Load failed:', err);
    hideLoading();
    showErrorState('Could not load products: ' + err.message);
  }
}

/* ── DYNAMIC FILTERS from real data ── */
function buildFilterOptions(products) {
  var brands=[...new Set(products.map(p=>p.brand).filter(Boolean))].sort();
  var cats=[...new Set(products.map(p=>p.category).filter(Boolean))].sort();

  var bc=document.getElementById('filterBrands');
  if(bc) bc.innerHTML=brands.map(b=>
    '<label class="filter-option"><input type="checkbox" data-type="brand" data-value="'+esc(b)+'" onchange="onFilter()"><span class="filter-option-label">'+esc(b)+'</span></label>'
  ).join('');

  var cc=document.getElementById('filterCategories');
  if(cc) cc.innerHTML=cats.map(c=>
    '<label class="filter-option"><input type="checkbox" data-type="category" data-value="'+esc(c)+'" onchange="onFilter()"><span class="filter-option-label">'+esc(c)+'</span></label>'
  ).join('');
}

/* ── FILTER LOGIC ── */
function applyFilters(keyword) {
  var r=allProducts.slice();
  if(keyword){ var kw=keyword.toLowerCase(); r=r.filter(p=>p.searchText.includes(kw)); }
  if(activeBrand.length)    r=r.filter(p=>activeBrand.includes(p.brand));
  if(activeCategory.length) r=r.filter(p=>activeCategory.includes(p.category));
  if(sortOrder==='oldest')  r=r.slice().reverse();
  filteredProducts=r;
  return r;
}

function onFilter() {
  activeBrand    =[...document.querySelectorAll('[data-type=brand]:checked')].map(c=>c.dataset.value);
  activeCategory =[...document.querySelectorAll('[data-type=category]:checked')].map(c=>c.dataset.value);
  renderActiveTags();
  refresh();
}

function renderActiveTags() {
  var el=document.getElementById('activeTags'); if(!el) return;
  var tags=[...activeBrand.map(v=>({v,t:'brand'})),...activeCategory.map(v=>({v,t:'category'}))];
  if(!tags.length){el.innerHTML='';return;}
  el.innerHTML=tags.map(tag=>
    '<button class="active-filter-tag" data-val="'+esc(tag.v)+'" data-type="'+tag.t+'">'+esc(tag.v)+
    '<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>'
  ).join('');
  el.querySelectorAll('.active-filter-tag').forEach(function(btn){
    btn.addEventListener('click',function(){
      var v=btn.dataset.val,t=btn.dataset.type;
      if(t==='brand')    activeBrand=activeBrand.filter(x=>x!==v);
      if(t==='category') activeCategory=activeCategory.filter(x=>x!==v);
      var cb=document.querySelector('[data-type="'+t+'"][data-value="'+v+'"]');
      if(cb) cb.checked=false;
      renderActiveTags(); refresh();
    });
  });
}

function clearAllFilters() {
  activeBrand=[];activeCategory=[];sortOrder='latest';
  document.querySelectorAll('[data-type=brand],[data-type=category]').forEach(cb=>cb.checked=false);
  var s=document.getElementById('sortSelect'); if(s) s.value='latest';
  document.querySelectorAll('input[name=sort]').forEach(r=>r.checked=r.value==='latest');
  renderActiveTags(); refresh();
}

/* ── RENDER GRID ── */
function renderGrid(products, keyword) {
  var grid=document.getElementById('searchGrid');
  var empty=document.getElementById('searchEmpty');
  var c1=document.getElementById('resultsCount');
  var c2=document.getElementById('resultsCountInline');
  if(!grid) return;

  var countHtml=keyword
    ?'<strong>'+products.length+'</strong> results for <span class="search-keyword">"'+esc(keyword)+'"</span>'
    :'Showing <strong>'+products.length+'</strong> products';
  if(c1) c1.innerHTML=countHtml;
  if(c2) c2.innerHTML=countHtml;

  if(!products.length){
    grid.innerHTML='';
    if(empty){
      empty.style.display='block';
      var t=empty.querySelector('.search-empty-title');
      var s=empty.querySelector('.search-empty-sub');
      if(t) t.textContent='No products found';
      if(s) s.textContent=keyword?'Try a different keyword or adjust your filters.':'No products match your filters.';
    }
    return;
  }
  if(empty) empty.style.display='none';
  grid.innerHTML='';

  products.forEach(function(product,i){
    var ratio=RATIO_CYCLE[i%RATIO_CYCLE.length];
    var pb=RATIO_MAP[ratio];
    var img0=product.imageUrls[0]||'';
    var multi=product.imageUrls.length>1;

    var el=document.createElement('div');
    el.className='masonry-item';
    el.tabIndex=0;
    el.setAttribute('role','button');
    el.setAttribute('aria-label','View '+product.name);
    el.dataset.index=i;

    el.innerHTML=
      '<div class="masonry-img-wrap">'+
        '<div style="padding-bottom:'+pb+';position:relative;overflow:hidden;">'+
          '<img data-src="'+img0+'" src="" alt="'+esc(product.name)+'" class="loading"'+
          ' style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" />'+
        '</div>'+
        (multi?
          '<div class="multi-image-badge">'+
            '<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M3 3V2a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-1" stroke="currentColor" stroke-width="1.2"/></svg>'+
            product.imageUrls.length+
          '</div>':'')+
        '<div class="masonry-overlay">'+
          '<div class="overlay-title">'+esc(product.name)+'</div>'+
          '<div class="overlay-meta">'+
            (product.brand?esc(product.brand):'')+(product.brand&&product.category?' &middot; ':'')+
            (product.category?esc(product.category):'')+
          '</div>'+
        '</div>'+
      '</div>'+
      '<div class="masonry-footer">'+
        '<span class="masonry-tag">'+esc(product.category||product.brand||'Product')+'</span>'+
        (product.city?'<span class="masonry-date">'+esc(product.city)+'</span>':'')+
      '</div>';

    grid.appendChild(el);
    setTimeout(function(){el.classList.add('visible');},40+i*30);
    el.addEventListener('click',function(){openLightbox(i);});
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')openLightbox(i);});
  });

  /* lazy load */
  var imgs=grid.querySelectorAll('img[data-src]');
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      var img=entry.target;
      img.src=img.dataset.src;
      img.onload=function(){img.classList.remove('loading');};
      obs.unobserve(img);
    });
  },{rootMargin:'300px'});
  imgs.forEach(function(img){obs.observe(img);});
}

/* ── REFRESH ── */
function refresh() {
  var input=document.getElementById('searchInput');
  var kw=input?input.value.trim():getUrlQuery();
  var results=applyFilters(kw);
  renderGrid(results,kw);
  setUrlQuery(kw);
}

/* ── SEARCH BAR ── */
function initSearchBar() {
  var input=document.getElementById('searchInput');
  var clearBtn=document.getElementById('searchClear');
  var form=document.getElementById('searchForm');
  if(!input)return;
  var q=getUrlQuery();
  if(q){input.value=q;if(clearBtn)clearBtn.classList.add('visible');}
  input.addEventListener('input',function(){
    if(clearBtn)clearBtn.classList.toggle('visible',input.value.length>0);
    refresh();
  });
  if(clearBtn)clearBtn.addEventListener('click',function(){
    input.value='';clearBtn.classList.remove('visible');refresh();input.focus();
  });
  if(form)form.addEventListener('submit',function(e){e.preventDefault();refresh();});
}

/* ── SORT ── */
function initSort(){
  var sel=document.getElementById('sortSelect');
  if(!sel)return;
  sel.addEventListener('change',function(){
    sortOrder=sel.value;
    document.querySelectorAll('input[name=sort]').forEach(r=>r.checked=r.value===sortOrder);
    refresh();
  });
}

/* ── MOBILE FILTER ── */
function initMobileFilter(){
  var toggle=document.getElementById('filterToggle');
  var content=document.getElementById('filterContent');
  if(!toggle||!content)return;
  toggle.addEventListener('click',function(){
    content.classList.toggle('open');
    toggle.textContent=content.classList.contains('open')?'✕ Hide filters':'⊞ Filters';
  });
}

/* ── LIGHTBOX ── */
function openLightbox(idx){
  lbProductIndex=idx; lbImageIndex=0;
  renderLightbox();
  var lb=document.getElementById('lightbox');
  if(lb){lb.classList.add('open');document.body.style.overflow='hidden';}
}

function renderLightbox(){
  var product=filteredProducts[lbProductIndex]; if(!product)return;
  var images=product.imageUrls;

  var lbImg=document.getElementById('lbImg');
  if(lbImg){lbImg.src=images[lbImageIndex]||'';lbImg.alt=product.name;}

  var lbTag=document.getElementById('lbTag');     if(lbTag)   lbTag.textContent=product.category||'Product';
  var lbTitle=document.getElementById('lbTitle'); if(lbTitle) lbTitle.textContent=product.name;
  var lbDesc=document.getElementById('lbDesc');   if(lbDesc)  lbDesc.textContent=product.description||'';

  var lbMeta=document.getElementById('lbMeta');
  if(lbMeta){
    var rows=[
      product.brand?['Brand',product.brand]:null,
      product.category?['Category',product.category]:null,
      product.subCategory?['Type',product.subCategory]:null,
      product.storeName?['Store',product.storeName]:null,
      product.city?['City',product.city]:null,
      product.year?['Year',product.year]:null,
    ].filter(Boolean);
    lbMeta.innerHTML=rows.map(r=>
      '<div class="lb-meta-item"><span class="lb-meta-key">'+r[0]+'</span><span class="lb-meta-val">'+esc(String(r[1]))+'</span></div>'
    ).join('');
  }
  updateImageNav(images,lbImageIndex);
}

function updateImageNav(images,idx){
  var strip=document.getElementById('lbThumbs');
  var counter=document.getElementById('lbCounter');
  var prevBtn=document.getElementById('lbImgPrev');
  var nextBtn=document.getElementById('lbImgNext');
  var multi=images.length>1;

  if(counter){counter.style.display=multi?'block':'none';counter.textContent=(idx+1)+' / '+images.length;}
  if(prevBtn) prevBtn.style.display=multi?'flex':'none';
  if(nextBtn) nextBtn.style.display=multi?'flex':'none';

  if(strip){
    if(!multi){strip.innerHTML='';return;}
    strip.innerHTML=images.map(function(url,i){
      return '<button class="lb-thumb'+(i===idx?' active':'')+'" data-index="'+i+'">'+
        '<img src="'+url+'" alt="Photo '+(i+1)+'" />'+
      '</button>';
    }).join('');
    strip.querySelectorAll('.lb-thumb').forEach(function(btn){
      btn.addEventListener('click',function(){
        lbImageIndex=parseInt(btn.dataset.index);
        var lbImg=document.getElementById('lbImg');
        if(lbImg)lbImg.src=images[lbImageIndex];
        updateImageNav(images,lbImageIndex);
      });
    });
  }
}

function navigateImage(dir){
  var p=filteredProducts[lbProductIndex]; if(!p)return;
  lbImageIndex=(lbImageIndex+dir+p.imageUrls.length)%p.imageUrls.length;
  var lbImg=document.getElementById('lbImg');
  if(lbImg)lbImg.src=p.imageUrls[lbImageIndex];
  updateImageNav(p.imageUrls,lbImageIndex);
}

function navigateProduct(dir){
  lbProductIndex=(lbProductIndex+dir+filteredProducts.length)%filteredProducts.length;
  lbImageIndex=0; renderLightbox();
}

function closeLightbox(){
  var lb=document.getElementById('lightbox');
  if(lb)lb.classList.remove('open');
  document.body.style.overflow='';
}

function initLightbox(){
  var lbClose=document.getElementById('lbClose');
  var lbPrev=document.getElementById('lbPrev');
  var lbNext=document.getElementById('lbNext');
  var lbImgPrev=document.getElementById('lbImgPrev');
  var lbImgNext=document.getElementById('lbImgNext');
  var lb=document.getElementById('lightbox');

  if(lbClose)   lbClose.addEventListener('click',closeLightbox);
  if(lbPrev)    lbPrev.addEventListener('click',function(){navigateProduct(-1);});
  if(lbNext)    lbNext.addEventListener('click',function(){navigateProduct(1);});
  if(lbImgPrev) lbImgPrev.addEventListener('click',function(){navigateImage(-1);});
  if(lbImgNext) lbImgNext.addEventListener('click',function(){navigateImage(1);});
  if(lb)        lb.addEventListener('click',function(e){if(e.target===lb)closeLightbox();});

  document.addEventListener('keydown',function(e){
    var lb=document.getElementById('lightbox');
    if(!lb||!lb.classList.contains('open'))return;
    if(e.key==='Escape')     closeLightbox();
    if(e.key==='ArrowRight') navigateProduct(1);
    if(e.key==='ArrowLeft')  navigateProduct(-1);
    if(e.key==='ArrowUp')    navigateImage(-1);
    if(e.key==='ArrowDown')  navigateImage(1);
  });
}

/* ── FILTER ACCORDION ── */
function toggleGroup(btn){ btn.closest('.filter-group').classList.toggle('open'); }

/* ── INIT ── */
document.addEventListener('DOMContentLoaded',async function(){
  initSearchBar();
  initSort();
  initLightbox();
  initMobileFilter();

  document.querySelectorAll('.filter-group').forEach(g=>g.classList.add('open'));

  var clearBtn=document.getElementById('clearAllFilters');
  if(clearBtn)clearBtn.addEventListener('click',clearAllFilters);

  document.querySelectorAll('input[name=sort]').forEach(r=>{
    r.addEventListener('change',function(){
      sortOrder=r.value;
      var sel=document.getElementById('sortSelect');if(sel)sel.value=sortOrder;
      refresh();
    });
  });

  await loadProducts();
  buildFilterOptions(allProducts);

  var kw=getUrlQuery();
  if(kw){
    var inp=document.getElementById('searchInput');if(inp)inp.value=kw;
    var cl=document.getElementById('searchClear');if(cl)cl.classList.add('visible');
  }
  var results=applyFilters(kw);
  renderGrid(results,kw);
});

})();
