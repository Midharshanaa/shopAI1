/* ── main.js: Core JS — theme, clock, slider, nav, notifications, stats counter, storage UI ── */
'use strict';

/* ────────── Theme Switcher ────────── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('theme-icon');
const html        = document.documentElement;

const savedTheme = localStorage.getItem('shopai-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('shopai-theme', next);
    updateThemeIcon(next);
    showToast(`Switched to ${next} mode`, 'info');
  });
}
function updateThemeIcon(theme) {
  if (!themeIcon) return;
  themeIcon.className = theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon';
}

/* ────────── Live Clock ────────── */
function updateClock() {
  const now  = new Date();
  const time = document.getElementById('live-time');
  const date = document.getElementById('live-date');
  const full = document.getElementById('full-datetime');
  if (time) time.textContent = now.toLocaleTimeString('en-IN');
  if (date) date.textContent = now.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' });
  if (full) full.textContent = now.toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' });
}
updateClock();
setInterval(updateClock, 1000);

/* ────────── Hamburger / Mobile Nav ────────── */
const hamburger = document.getElementById('hamburger');
const siteNav   = document.getElementById('site-nav');
if (hamburger && siteNav) {
  hamburger.addEventListener('click', () => {
    siteNav.classList.toggle('open');
    hamburger.innerHTML = siteNav.classList.contains('open')
      ? '<i class="fa fa-times"></i>'
      : '<i class="fa fa-bars"></i>';
  });
}

/* ────────── Hero Slider ────────── */
const slides    = document.querySelectorAll('.slide');
const dots      = document.querySelectorAll('.dot');
const slidePrev = document.getElementById('slidePrev');
const slideNext = document.getElementById('slideNext');
let currentSlide = 0;
let sliderTimer;

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dots[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dots[currentSlide].classList.add('active');
}
function startSlider() { sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 4500); }
function stopSlider()  { clearInterval(sliderTimer); }

if (slides.length) {
  startSlider();
  if (slidePrev) slidePrev.addEventListener('click', () => { stopSlider(); goToSlide(currentSlide - 1); startSlider(); });
  if (slideNext) slideNext.addEventListener('click', () => { stopSlider(); goToSlide(currentSlide + 1); startSlider(); });
  dots.forEach(dot => dot.addEventListener('click', () => { stopSlider(); goToSlide(parseInt(dot.dataset.slide)); startSlider(); }));
}

/* ────────── Notification Panel ────────── */
const notifBtn   = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');
let notifOpen    = false;
if (notifBtn && notifPanel) {
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifOpen = !notifOpen;
    notifPanel.classList.toggle('open', notifOpen);
  });
  document.addEventListener('click', (e) => {
    if (notifOpen && !notifPanel.contains(e.target) && e.target !== notifBtn) {
      notifOpen = false; notifPanel.classList.remove('open');
    }
  });
}
const markAllRead = document.getElementById('markAllRead');
if (markAllRead) {
  markAllRead.addEventListener('click', () => {
    document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
    const notifCount = document.getElementById('notif-count');
    if (notifCount) notifCount.textContent = '0';
    showToast('All notifications marked as read', 'success');
  });
}

/* ────────── Animated Stats Counter ────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();
  function step(time) {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(eased * target);
    el.textContent = prefix + (prefix === '₹' ? '₹' + val.toLocaleString('en-IN') : val.toLocaleString('en-IN'));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statsGrid = document.getElementById('stats-grid');
if (statsGrid) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('[data-target]').forEach(el => animateCounter(el));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(statsGrid);
}

/* ────────── Tabs ────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const container = this.closest('section') || document;
    container.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    this.setAttribute('aria-selected','true');
    const panel = document.getElementById('tab-' + this.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

/* ────────── Accordion ────────── */
document.querySelectorAll('.accordion-header').forEach(hdr => {
  hdr.addEventListener('click', function() {
    const item = this.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ────────── Web Storage Panel ────────── */
function setupStorage(prefix, storage) {
  const saveBtn  = document.getElementById(`${prefix}-save`);
  const getBtn   = document.getElementById(`${prefix}-get`);
  const clearBtn = document.getElementById(`${prefix}-clear`);
  const keyEl    = document.getElementById(`${prefix}-key`);
  const valEl    = document.getElementById(`${prefix}-val`);
  const output   = document.getElementById(`${prefix}-output`);
  if (!saveBtn) return;
  saveBtn.addEventListener('click', () => {
    const k = keyEl.value.trim(), v = valEl.value.trim();
    if (!k || !v) { output.textContent = '⚠️ Please enter both key and value.'; return; }
    storage.setItem(k, v);
    output.textContent = `✅ Saved: "${k}" = "${v}"`;
    showToast(`Saved to ${prefix === 'ls' ? 'localStorage' : 'sessionStorage'}`, 'success');
  });
  getBtn.addEventListener('click', () => {
    const k = keyEl.value.trim();
    if (!k) { output.textContent = '⚠️ Enter a key to retrieve.'; return; }
    const v = storage.getItem(k);
    output.textContent = v !== null ? `📦 "${k}" = "${v}"` : `❌ Key "${k}" not found.`;
  });
  clearBtn.addEventListener('click', () => {
    storage.clear();
    output.textContent = '🗑️ All data cleared.';
    showToast('Storage cleared', 'warning');
  });
}
setupStorage('ls', localStorage);
setupStorage('ss', sessionStorage);

/* ────────── Toast Notifications ────────── */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
window.showToast = showToast;

/* ────────── Home Chat (AI Teaser) ────────── */
const homeChatInput  = document.getElementById('home-chat-input');
const homeChatSend   = document.getElementById('home-chat-send');
const homeChatMsgs   = document.getElementById('home-chat-messages');
const homeQuickPrompts = document.getElementById('home-quick-prompts');

const AI_RESPONSES = {
  laptop: ['💻 For programming, I recommend **ASUS VivoBook 16X** (₹58,990) — Core i7, 16GB RAM, 512GB SSD. Great performance-to-price ratio! Also consider **Lenovo IdeaPad Slim 5** (₹54,990) for excellent battery life.'],
  phone: ['📱 Under ₹25,000 with great camera: **Redmi Note 13 Pro+** (₹24,999) — 200MP triple camera, AMOLED 120Hz display, 67W fast charging. Excellent choice!'],
  headphones: ['🎧 Budget noise-cancelling pick: **boAt Rockerz 550 Pro** (₹1,999) — 70-hour battery, Active Noise Cancellation, foldable design. Amazing value!'],
  gaming: ['🎮 For gaming, the **ASUS ROG Zephyrus G14** (₹1,34,990) is exceptional — RTX 4070, Ryzen 9, 2K OLED. High-budget option. Budget choice: **HP Victus 15** at ₹69,990!'],
  default: ['🛍️ I can help you find the perfect product! Tell me: **what category** you need, your **budget**, and any **brand preferences**. I\'ll match you with the best options! 🎯']
};

function getAIResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('laptop') || lower.includes('computer')) return AI_RESPONSES.laptop[0];
  if (lower.includes('phone') || lower.includes('mobile') || lower.includes('smartphone')) return AI_RESPONSES.phone[0];
  if (lower.includes('headphone') || lower.includes('earphone') || lower.includes('earbuds') || lower.includes('audio')) return AI_RESPONSES.headphones[0];
  if (lower.includes('gaming') || lower.includes('game')) return AI_RESPONSES.gaming[0];
  return AI_RESPONSES.default[0];
}

function appendMsg(content, role) {
  if (!homeChatMsgs) return;
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  homeChatMsgs.appendChild(div);
  homeChatMsgs.scrollTop = homeChatMsgs.scrollHeight;
}

function sendHomeChat(msg) {
  if (!msg.trim()) return;
  appendMsg(msg, 'user');
  if (homeChatInput) homeChatInput.value = '';
  const thinking = document.createElement('div');
  thinking.className = 'msg ai';
  thinking.innerHTML = '<span class="typing"></span> Analyzing your request...';
  if (homeChatMsgs) { homeChatMsgs.appendChild(thinking); homeChatMsgs.scrollTop = homeChatMsgs.scrollHeight; }
  setTimeout(() => {
    if (thinking.parentNode) thinking.remove();
    appendMsg(getAIResponse(msg), 'ai');
  }, 1200);
}

if (homeChatSend) homeChatSend.addEventListener('click', () => { if (homeChatInput) sendHomeChat(homeChatInput.value); });
if (homeChatInput) {
  homeChatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendHomeChat(homeChatInput.value); } });
}
if (homeQuickPrompts) {
  homeQuickPrompts.addEventListener('click', (e) => {
    const prompt = e.target.closest('.quick-prompt');
    if (prompt) sendHomeChat(prompt.dataset.msg);
  });
}

/* ────────── Scroll Reveal ────────── */
const revealEls = document.querySelectorAll('.card, .stat-card, .product-card');
if ('IntersectionObserver' in window) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeIn 0.5s ease both';
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));
}

/* ────────── Keyboard shortcut: Ctrl+K → focus search ────────── */
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const search = document.getElementById('home-search') || document.getElementById('product-search');
    if (search) { search.focus(); search.select(); }
  }
});
