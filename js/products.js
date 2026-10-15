/* ── products.js: Product catalog, search, filter, sort, AJAX loader, product card factory ── */
'use strict';

/* ────────── Product Data (inline, also fetched via AJAX) ────────── */
const PRODUCTS = [
  { id:'P001', name:'Apple MacBook Air M3', category:'Laptops', brand:'Apple', price:114900, originalPrice:124900, discount:8, rating:4.8, reviews:2341, stock:15, badge:'hot', image:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', description:'Apple M3 chip, 8GB RAM, 256GB SSD, 15.3-inch Liquid Retina.' },
  { id:'P002', name:'Apple MacBook Pro 16" M3 Max', category:'Laptops', brand:'Apple', price:249900, originalPrice:269900, discount:7, rating:4.9, reviews:1104, stock:9, badge:'new', image:'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80', description:'M3 Max 16-core CPU, 36GB unified RAM, 1TB SSD, 16.2" XDR display.' },
  { id:'P003', name:'Dell XPS 15 OLED', category:'Laptops', brand:'Dell', price:159900, originalPrice:179900, discount:11, rating:4.6, reviews:987, stock:8, badge:'', image:'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80', description:'Intel Core i9, 32GB RAM, 1TB SSD, 15.6" 3.5K OLED, RTX 4070.' },
  { id:'P004', name:'ASUS ROG Zephyrus G14', category:'Laptops', brand:'ASUS', price:134990, originalPrice:149990, discount:10, rating:4.7, reviews:1120, stock:12, badge:'hot', image:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80', description:'AMD Ryzen 9 8945H, RTX 4070, 16GB RAM, 1TB SSD, 14" 3K OLED 120Hz.' },
  { id:'P005', name:'Lenovo ThinkPad X1 Carbon Gen 12', category:'Laptops', brand:'Lenovo', price:142500, originalPrice:158900, discount:10, rating:4.8, reviews:640, stock:14, badge:'', image:'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80', description:'Intel Core Ultra 7 155H, 32GB RAM, 1TB SSD, 2.8K OLED screen.' },
  { id:'P006', name:'HP Spectre x360 2-in-1', category:'Laptops', brand:'HP', price:119990, originalPrice:134990, discount:11, rating:4.6, reviews:810, stock:11, badge:'', image:'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', description:'Intel Core Ultra 7, 16GB RAM, 1TB SSD, 14" OLED touchscreen + stylus.' },

  { id:'P007', name:'Apple iPhone 16 Pro Max', category:'Smartphones', brand:'Apple', price:144900, originalPrice:154900, discount:6, rating:4.9, reviews:4510, stock:25, badge:'hot', image:'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80', description:'A18 Pro Bionic, Grade 5 Titanium, 48MP Fusion 5x Telephoto, 6.9" Super Retina.' },
  { id:'P008', name:'Samsung Galaxy S25 Ultra', category:'Smartphones', brand:'Samsung', price:124999, originalPrice:134999, discount:7, rating:4.7, reviews:3892, stock:28, badge:'new', image:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80', description:'200MP camera, built-in S-Pen, Snapdragon 8 Elite, 5000mAh, Galaxy AI.' },
  { id:'P009', name:'Google Pixel 9 Pro XL', category:'Smartphones', brand:'Google', price:109999, originalPrice:124999, discount:12, rating:4.7, reviews:1820, stock:18, badge:'new', image:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80', description:'Google Tensor G4, Gemini Nano AI, 16GB RAM, 50MP triple pro cameras.' },
  { id:'P010', name:'OnePlus 13R 5G', category:'Smartphones', brand:'OnePlus', price:39999, originalPrice:44999, discount:11, rating:4.5, reviews:1456, stock:55, badge:'', image:'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=80', description:'Snapdragon 8 Gen 3, 12GB RAM, 256GB, 6000mAh battery, 100W SUPERVOOC.' },
  { id:'P011', name:'Xiaomi 14 Ultra Leica', category:'Smartphones', brand:'Xiaomi', price:89999, originalPrice:99999, discount:10, rating:4.6, reviews:920, stock:14, badge:'', image:'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80', description:'Leica 1-inch quad camera, variable aperture, Snapdragon 8 Gen 3, WQHD+.' },
  { id:'P012', name:'Redmi Note 13 Pro+', category:'Smartphones', brand:'Redmi', price:29999, originalPrice:33999, discount:12, rating:4.4, reviews:6520, stock:88, badge:'', image:'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80', description:'200MP OIS camera, Dimensity 7200 Ultra, curved AMOLED 120Hz, 120W charging.' },

  { id:'P013', name:'Sony WH-1000XM6 Wireless ANC', category:'Audio', brand:'Sony', price:29990, originalPrice:34990, discount:14, rating:4.9, reviews:5120, stock:42, badge:'hot', image:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', description:'Industry-leading QN1 noise cancelling, 30-hour battery, speak-to-chat, LDAC.' },
  { id:'P014', name:'Apple AirPods Max', category:'Audio', brand:'Apple', price:59900, originalPrice:64900, discount:8, rating:4.8, reviews:2400, stock:19, badge:'hot', image:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80', description:'Apple H1 computational audio, custom acoustic drivers, personalized spatial audio.' },
  { id:'P015', name:'Apple AirPods Pro 2 (USB-C)', category:'Audio', brand:'Apple', price:24900, originalPrice:26900, discount:7, rating:4.8, reviews:8700, stock:65, badge:'hot', image:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80', description:'H2 chip, 2x noise cancellation, Adaptive Audio, USB-C MagSafe case with speaker.' },
  { id:'P016', name:'Bose QuietComfort Ultra', category:'Audio', brand:'Bose', price:34900, originalPrice:39900, discount:13, rating:4.7, reviews:1640, stock:26, badge:'', image:'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop&q=80', description:'Legendary noise cancellation, spatial audio immersion, CustomTune sound calibration.' },
  { id:'P017', name:'Sennheiser Momentum 4 Wireless', category:'Audio', brand:'Sennheiser', price:27990, originalPrice:34990, discount:20, rating:4.8, reviews:1280, stock:30, badge:'', image:'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&auto=format&fit=crop&q=80', description:'Audiophile 42mm transducer system, huge 60-hour battery, adaptive ANC.' },
  { id:'P018', name:'boAt Rockerz 550 Pro', category:'Audio', brand:'boAt', price:1999, originalPrice:3999, discount:50, rating:4.2, reviews:8912, stock:200, badge:'hot', image:'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80', description:'70-hour battery, 50mm bass drivers, physical EQ bass boost, Bluetooth 5.3.' },

  { id:'P019', name:'Apple Watch Series 10 Titanium', category:'Wearables', brand:'Apple', price:46900, originalPrice:49900, discount:6, rating:4.9, reviews:3200, stock:22, badge:'new', image:'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80', description:'Wide-angle OLED, sleep apnea notifications, ECG, depth & water temp gauge.' },
  { id:'P020', name:'Samsung Galaxy Watch Ultra LTE', category:'Wearables', brand:'Samsung', price:59999, originalPrice:69999, discount:14, rating:4.7, reviews:1180, stock:17, badge:'hot', image:'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', description:'Titanium cushion case, 100m water resistance, dual-frequency GPS, 100h battery.' },
  { id:'P021', name:'Garmin Fenix 8 Solar Sapphire', category:'Wearables', brand:'Garmin', price:84990, originalPrice:94990, discount:11, rating:4.9, reviews:640, stock:10, badge:'', image:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80', description:'Solar charging lens, built-in LED flashlight, offline topo maps, 28 days battery.' },
  { id:'P022', name:'Google Pixel Watch 3 45mm', category:'Wearables', brand:'Google', price:39900, originalPrice:44900, discount:11, rating:4.5, reviews:850, stock:24, badge:'', image:'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80', description:'45mm Actua AMOLED 2000 nits, Fitbit cardio readiness scores, Wear OS 5.0.' },
  { id:'P023', name:'boAt Wave Call Pro Smartwatch', category:'Wearables', brand:'boAt', price:1799, originalPrice:3999, discount:55, rating:4.3, reviews:7820, stock:150, badge:'', image:'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80', description:'1.83" HD display, Bluetooth calling with keypad, 100+ sports modes, 7-day battery.' },

  { id:'P024', name:'Apple iPad Pro M4 11-inch', category:'Tablets', brand:'Apple', price:99900, originalPrice:109900, discount:9, rating:4.8, reviews:2100, stock:20, badge:'new', image:'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80', description:'Ultra Retina XDR tandem OLED, M4 chip with hardware ray tracing, 5.3mm thin.' },
  { id:'P025', name:'Samsung Galaxy Tab S9 Ultra', category:'Tablets', brand:'Samsung', price:108999, originalPrice:119999, discount:9, rating:4.7, reviews:940, stock:15, badge:'', image:'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80', description:'14.6" Dynamic AMOLED 2X, IP68 water resistance, Snapdragon 8 Gen 2, S-Pen.' },
  { id:'P026', name:'Apple iPad Air M2 13-inch', category:'Tablets', brand:'Apple', price:79900, originalPrice:84900, discount:6, rating:4.7, reviews:1620, stock:25, badge:'', image:'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop&q=80', description:'13" Liquid Retina, Apple M2 chip, landscape 12MP Center Stage camera.' },
  { id:'P027', name:'Microsoft Surface Pro 11 Copilot+', category:'Tablets', brand:'Microsoft', price:116990, originalPrice:129990, discount:10, rating:4.6, reviews:510, stock:13, badge:'new', image:'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80', description:'Snapdragon X Elite, 14h battery, OLED 120Hz PixelSense Flow touchscreen, Copilot AI.' },

  { id:'P028', name:'Logitech MX Master 3S Mouse', category:'Accessories', brand:'Logitech', price:9995, originalPrice:11495, discount:13, rating:4.9, reviews:4230, stock:100, badge:'hot', image:'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', description:'8000 DPI track-on-glass, Quiet Clicks, MagSpeed electromagnetic scroll wheel.' },
  { id:'P029', name:'Keychron Q1 Pro Mechanical Keyboard', category:'Accessories', brand:'Keychron', price:16499, originalPrice:18999, discount:13, rating:4.8, reviews:890, stock:35, badge:'', image:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', description:'CNC aluminum body, double-gasket mount, Bluetooth 5.1, hot-swap QMK/VIA.' },
  { id:'P030', name:'Dell UltraSharp 27" 4K USB-C Monitor', category:'Accessories', brand:'Dell', price:48990, originalPrice:56990, discount:14, rating:4.8, reviews:1140, stock:18, badge:'', image:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', description:'IPS Black 2000:1 contrast, 4K UHD, 98% DCI-P3, 90W USB-C hub connectivity.' },
  { id:'P031', name:'Sony DualSense Wireless Controller', category:'Accessories', brand:'Sony', price:5990, originalPrice:6490, discount:8, rating:4.7, reviews:5100, stock:70, badge:'', image:'https://images.unsplash.com/photo-1606318801954-d46846fe3ecd?w=600&auto=format&fit=crop&q=80', description:'Adaptive triggers, haptic feedback, built-in mic array, PC & PS5 Bluetooth.' },
  { id:'P032', name:'Anker 737 Power Bank (24,000mAh)', category:'Accessories', brand:'Anker', price:12999, originalPrice:14999, discount:13, rating:4.8, reviews:2340, stock:45, badge:'', image:'https://images.unsplash.com/photo-1609592426508-cc8b9f078d1f?w=600&auto=format&fit=crop&q=80', description:'Two-way 140W PD 3.1 ultra-fast charging with smart digital OLED status display.' },

  { id:'P033', name:'Samsung 55" Neo QLED 4K Smart TV', category:'Televisions', brand:'Samsung', price:79990, originalPrice:109990, discount:27, rating:4.6, reviews:761, stock:6, badge:'', image:'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80', description:'Quantum Mini LED, 144Hz VRR gaming mode, Dolby Atmos 3D sound, Tizen OS.' },
  { id:'P034', name:'Mi Smart Air Purifier 4 Pro', category:'Smart Home', brand:'Xiaomi', price:14999, originalPrice:17999, discount:17, rating:4.3, reviews:3400, stock:70, badge:'', image:'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80', description:'3-in-1 HEPA filtration, covers 60 sqm, OLED touchscreen, Alexa/Google Home.' },
  { id:'P035', name:'Amazon Echo Dot 5th Gen with Alexa', category:'Smart Home', brand:'Amazon', price:4499, originalPrice:5499, discount:18, rating:4.5, reviews:11200, stock:180, badge:'hot', image:'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&auto=format&fit=crop&q=80', description:'Front-firing speaker with rich bass, motion & temperature sensors, hands-free Alexa.' }
];

window.PRODUCTS = PRODUCTS;

/* ────────── Helpers ────────── */
function stars(rating) {
  const full = Math.floor(rating), half = rating % 1 >= 0.4;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '½';
  for (let i = Math.ceil(rating); i < 5; i++) s += '☆';
  return s;
}
function rupees(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
function getWishlist() { return JSON.parse(localStorage.getItem('shopai-wishlist') || '[]'); }
function getCart()     { return JSON.parse(localStorage.getItem('shopai-cart')     || '[]'); }

/* ────────── Product Card HTML ────────── */
function productCardHTML(p) {
  const wl   = getWishlist().includes(p.id);
  const badge = p.badge ? `<div class="product-badge ${p.badge === 'new' ? 'new' : p.badge === 'hot' ? 'hot' : ''}">${p.badge === 'new' ? '🆕 New' : '🔥 Hot'}</div>` : '';
  return `
  <article class="product-card draggable"
    id="prod-${p.id}"
    data-product-id="${p.id}"
    data-category="${p.category}"
    data-price="${p.price}"
    data-brand="${p.brand}"
    data-rating="${p.rating}"
    data-stock="${p.stock}"
    draggable="true"
    aria-label="${p.name}">
    <div class="product-img-wrap">
      ${badge}
      <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://picsum.photos/seed/placeholder/400/300'" />
      <button class="wishlist-btn ${wl ? 'active' : ''}" data-id="${p.id}" data-action="wishlist-toggle" aria-label="Toggle wishlist">${wl ? '❤️' : '🤍'}</button>
    </div>
    <div class="product-body">
      <div class="product-brand">${p.brand} · ${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-desc">${p.description}</div>
      <div class="product-meta">
        <div>
          <span class="product-price">${rupees(p.price)}</span>
          <span class="product-price original">${rupees(p.originalPrice)}</span>
        </div>
        <span class="product-discount">${p.discount}% off</span>
      </div>
      <div class="flex" style="align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
        <div><span class="stars">${stars(p.rating)}</span><span class="rating-count">(${p.reviews.toLocaleString()})</span></div>
        <span class="availability ${p.stock > 0 ? 'in-stock' : 'out-stock'}">${p.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}</span>
      </div>
      <div class="product-actions">
        <button class="btn-cart" data-id="${p.id}" data-action="add-to-cart">🛒 Add to Cart</button>
        <button class="btn-compare" data-id="${p.id}" data-action="add-to-compare" data-tooltip="Compare">⚖️</button>
      </div>
    </div>
    <div class="product-preview">
      <strong style="font-size:0.8rem; color:var(--text-strong);">Quick Look</strong>
      <p style="font-size:0.75rem; margin-top:0.25rem;">${p.description}</p>
      <a href="product-detail.html?id=${p.id}" style="font-size:0.78rem; color:var(--primary); font-weight:600; display:inline-block; margin-top:0.4rem;">View Full Details →</a>
    </div>
  </article>`;
}

/* ────────── Render Products ────────── */
function renderProducts(list, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>No products found</h3><p>Try adjusting your search or filters.</p></div>'; return; }
  el.innerHTML = list.map(productCardHTML).join('');
  bindProductEvents(el);
}

/* ────────── Product Events (delegation) ────────── */
function bindProductEvents(container) {
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const id     = btn.dataset.id;
    const prod   = PRODUCTS.find(p => p.id === id);
    if (!prod) return;

    if (action === 'add-to-cart') {
      addToCart(prod);
      btn.textContent = '✅ Added!';
      btn.style.background = 'var(--success)';
      setTimeout(() => { btn.textContent = '🛒 Add to Cart'; btn.style.background = ''; }, 1800);
    }
    if (action === 'wishlist-toggle') {
      toggleWishlist(id, btn.closest('.product-card'));
    }
    if (action === 'add-to-compare') {
      const compare = JSON.parse(sessionStorage.getItem('shopai-compare') || '[]');
      if (compare.includes(id)) { window.showToast && showToast('Already in compare list', 'info'); return; }
      if (compare.length >= 4)  { window.showToast && showToast('Compare list full (max 4)', 'warning'); return; }
      compare.push(id);
      sessionStorage.setItem('shopai-compare', JSON.stringify(compare));
      window.showToast && showToast(`${prod.name} added to compare`, 'success');
    }
  });

  /* Product selection highlight on click */
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card || e.target.closest('[data-action]')) return;
    container.querySelectorAll('.product-card.selected').forEach(c => c.classList.remove('selected'));
    card.classList.toggle('selected');
  });

  /* Mouseover preview */
  container.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.product-card');
    if (card) card.querySelector('.product-preview')?.style && null;
  });
}

/* ────────── Cart ────────── */
function addToCart(prod, qty = 1) {
  let cart = getCart();
  const existing = cart.find(i => i.id === prod.id);
  if (existing) { existing.qty += qty; }
  else { cart.push({ id:prod.id, name:prod.name, price:prod.price, image:prod.image, qty }); }
  localStorage.setItem('shopai-cart', JSON.stringify(cart));
  updateCartBadge();
  window.showToast && showToast(`${prod.name} added to cart 🛒`, 'success');
}
window.addToCart = addToCart;

function updateCartBadge() {
  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = total);
}

/* ────────── Wishlist ────────── */
function toggleWishlist(id, card) {
  let wl = getWishlist();
  const btn = card?.querySelector('[data-action="wishlist-toggle"]');
  if (wl.includes(id)) {
    wl = wl.filter(i => i !== id);
    if (btn) { btn.textContent = '🤍'; btn.classList.remove('active'); }
    window.showToast && showToast('Removed from wishlist', 'info');
  } else {
    wl.push(id);
    if (btn) { btn.textContent = '❤️'; btn.classList.add('active'); }
    window.showToast && showToast('Added to wishlist ❤️', 'success');
  }
  localStorage.setItem('shopai-wishlist', JSON.stringify(wl));
  updateWishlistBadge();
}
window.toggleWishlist = toggleWishlist;

function updateWishlistBadge() {
  const wl = getWishlist();
  document.querySelectorAll('#wishlist-count').forEach(el => el.textContent = wl.length);
}

/* ────────── Search & Filter (inline products page) ────────── */
let filteredProducts = [...PRODUCTS];

function applyFilters() {
  const search   = (document.getElementById('product-search')?.value || '').toLowerCase();
  const catFilter = [...(document.querySelectorAll('.filter-cat:checked'))].map(el => el.value);
  const brandFilter = [...(document.querySelectorAll('.filter-brand:checked'))].map(el => el.value);
  const maxPrice = parseInt(document.getElementById('price-range')?.value || 999999);
  const minRating = parseFloat(document.getElementById('filter-rating')?.value || 0);
  const sortBy = document.getElementById('sort-select')?.value || '';

  filteredProducts = PRODUCTS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search) || p.category.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
    const matchCat    = !catFilter.length   || catFilter.includes(p.category);
    const matchBrand  = !brandFilter.length || brandFilter.includes(p.brand);
    const matchPrice  = p.price <= maxPrice;
    const matchRating = p.rating >= minRating;
    return matchSearch && matchCat && matchBrand && matchPrice && matchRating;
  });

  if (sortBy === 'price-asc')  filteredProducts.sort((a,b) => a.price - b.price);
  if (sortBy === 'price-desc') filteredProducts.sort((a,b) => b.price - a.price);
  if (sortBy === 'rating')     filteredProducts.sort((a,b) => b.rating - a.rating);
  if (sortBy === 'discount')   filteredProducts.sort((a,b) => b.discount - a.discount);
  if (sortBy === 'reviews')    filteredProducts.sort((a,b) => b.reviews - a.reviews);
  if (sortBy === 'price-low')  filteredProducts.sort((a,b) => a.price - b.price);

  renderProducts(filteredProducts, 'product-grid');
  const info = document.getElementById('products-info');
  if (info) info.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} match your selected criteria.`;
}

/* Register filter / search listeners */
['product-search','sort-select','price-range','filter-rating'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', applyFilters);
});
document.querySelectorAll('.filter-cat, .filter-brand').forEach(cb => cb.addEventListener('change', applyFilters));

/* ────────── AJAX Product Loader ────────── */
function loadAjaxProducts() {
  const container = document.getElementById('ajax-products');
  const status    = document.getElementById('ajax-status');
  const btn       = document.getElementById('ajax-load-btn');
  if (!container) return;
  if (status) status.innerHTML = '<div class="spinner"></div><div class="loading-text">Loading products via AJAX...</div>';
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Loading...'; }

  $.ajax({
    url: 'data/products.json',
    method: 'GET',
    dataType: 'json',
    success: function(data) {
      if (status) status.innerHTML = `<div class="success-msg" style="margin-bottom:1rem;">✅ Successfully loaded ${data.length} products via AJAX!</div>`;
      renderProducts(data, 'ajax-products');
      if (btn) { btn.disabled = false; btn.textContent = '🔄 Reload (AJAX)'; }
    },
    error: function(xhr, status, err) {
      if (document.getElementById('ajax-status')) {
        document.getElementById('ajax-status').innerHTML =
          `<div class="error-msg" style="font-size:0.9rem; margin-bottom:1rem;">❌ Failed to load products. ${err || 'Check network connection.'} <button class="btn btn-danger btn-sm" id="ajax-retry" style="margin-left:1rem;">🔄 Retry</button></div>`;
        document.getElementById('ajax-retry')?.addEventListener('click', loadAjaxProducts);
      }
      if (btn) { btn.disabled = false; btn.textContent = '🔄 Load Products (AJAX)'; }
    }
  });
}

const ajaxBtn = document.getElementById('ajax-load-btn');
if (ajaxBtn) ajaxBtn.addEventListener('click', loadAjaxProducts);

/* ────────── Initial Render ────────── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateWishlistBadge();

  /* Home page product grid */
  const homeGrid = document.getElementById('home-product-grid');
  if (homeGrid) {
    renderProducts(PRODUCTS.slice(0, 8), 'home-product-grid');
    /* Home search */
    const homeSearch = document.getElementById('home-search');
    if (homeSearch) {
      homeSearch.addEventListener('input', () => {
        const q = homeSearch.value.toLowerCase();
        const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        renderProducts(filtered.slice(0, 8), 'home-product-grid');
        const info = document.getElementById('home-products-info');
        if (info) info.textContent = q ? `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found for "${homeSearch.value}"` : '';
      });
    }
    /* Recommendation tabs */
    const trending = PRODUCTS.filter(p => p.badge === 'hot' || p.reviews > 2000).slice(0, 4);
    const budget   = [...PRODUCTS].sort((a,b) => a.price - b.price).slice(0, 4);
    const newest   = PRODUCTS.filter(p => p.badge === 'new').slice(0, 4);
    const toprated = [...PRODUCTS].sort((a,b) => b.rating - a.rating).slice(0, 4);
    renderProducts(trending, 'rec-trending');
    renderProducts(budget,   'rec-budget');
    renderProducts(newest,   'rec-new');
    renderProducts(toprated, 'rec-toprated');
  }

  /* Products page grid */
  const productGrid = document.getElementById('product-grid');
  if (productGrid) {
    renderProducts(PRODUCTS, 'product-grid');
    const info = document.getElementById('products-info');
    if (info) info.textContent = `${PRODUCTS.length} products match your selected criteria.`;
  }
});
