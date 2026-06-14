/* =============================================================
   Central Cat's — assets/js/main.js  (shared interactions, dipakai 7/7 halaman)
   Inti: guard .js (entrance) + console keamanan; hamburger + drawer mobile
   (openMenu/closeMenu + overlay .mobile-overlay dinamis); dropdown mobile; FAQ
   chat popup (getNow); scroll-header (.scrolled null-safe); IntersectionObserver
   fade-section (_fadeObserver). Di-load sebelum </body>; semua akses null-safe.
============================================================= */
/* entrance animation guard: tandai JS aktif supaya .fade-section hanya tersembunyi bila JS jalan (tanpa .js -> konten tampil normal, no LCP/SEO risk) */
document.documentElement.classList.add('js');

/* ================= CONSOLE MESSAGE ================= */
console.log(
  "%c  /\\_/\\\n ( o.o )   Central Cat's\n  > ^ <    Petshop & Grooming Tangerang",
  "color:#d4af37;font-weight:bold;font-size:13px;line-height:1.8;"
);
console.log("%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "color:#d4af37;font-size:10px;");
console.log("%cHai 👋, kelihatannya kamu membuka Developer Tools.", "color:#60a5fa;font-size:14px;font-weight:600;");
console.log("%c⚠️  Harap berhati‑hati saat menempelkan kode di sini.", "color:#f59e0b;font-size:13px;");
console.log("%cJika seseorang menyuruhmu menempelkan sesuatu di console,\nbisa jadi itu adalah penipuan (Social Engineering Attack).", "color:#ef4444;font-size:13px;");
console.log("%cCentral Cat's Website  •  https://www.centralcats.id", "color:#22c55e;font-size:13px;font-weight:600;");

const burger = document.getElementById('hamburger');
const menu = document.getElementById('mobileMenu');
/* overlay drawer mobile: dibuat dinamis (tanpa edit markup 7 halaman) */
let _menuOverlay = null;
if(menu){
  _menuOverlay = document.createElement('div');
  _menuOverlay.className = 'mobile-overlay';
  document.body.appendChild(_menuOverlay);
}
function openMenu(){
  if(burger) burger.classList.add('active');
  if(menu) menu.classList.add('open');
  if(_menuOverlay) _menuOverlay.classList.add('show');
}
function closeMenu(){
  if(burger) burger.classList.remove('active');
  if(menu) menu.classList.remove('open');
  if(_menuOverlay) _menuOverlay.classList.remove('show');
}
if(burger && menu){
  burger.addEventListener('click', () => { menu.classList.contains('open') ? closeMenu() : openMenu(); });
}
if(_menuOverlay) _menuOverlay.addEventListener('click', closeMenu);
document.querySelectorAll('#mobileMenu .nav-item > a').forEach(btn => {
  btn.addEventListener('click', function() {
    const drop = this.parentElement.querySelector('.nav-dropdown');
    if(!drop) return;
    drop.style.display = drop.style.display === 'flex' ? 'none' : 'flex';
  });
});
document.querySelectorAll('#mobileMenu a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
document.addEventListener('click', e => {
  if(menu && burger && !menu.contains(e.target) && !burger.contains(e.target)){
    closeMenu();
  }
});
const faqTrigger = document.getElementById('faqTrigger');
const faqPopup   = document.getElementById('faqPopup');
const faqOverlay = document.getElementById('faqOverlay');
const faqClose   = document.getElementById('faqClose');
const faqChatBody = document.getElementById('faqChatBody');
const openFaq  = () => { faqPopup.classList.add('show'); faqOverlay.classList.add('show'); };
const closeFaq = () => { faqPopup.classList.remove('show'); faqOverlay.classList.remove('show'); };
if(faqTrigger) faqTrigger.addEventListener('click', openFaq);
if(faqClose)   faqClose.addEventListener('click', closeFaq);
if(faqOverlay) faqOverlay.addEventListener('click', closeFaq);
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeFaq(); });
function getNow(){ return new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}); }
document.querySelectorAll('.faq-chip').forEach(chip => {
  chip.addEventListener('click', function(){
    const q = this.dataset.q, a = this.dataset.a, t = getNow();
    const userMsg = document.createElement('div');
    userMsg.className = 'faq-msg-user';
    userMsg.innerHTML = `<div><div class="faq-bubble-user">${q}</div><div class="faq-bubble-time" style="text-align:right;">${t}</div></div>`;
    faqChatBody.appendChild(userMsg);
    faqChatBody.scrollTop = faqChatBody.scrollHeight;
    const typing = document.createElement('div');
    typing.className = 'faq-msg-bot';
    typing.innerHTML = `<div class="faq-msg-bot-avatar">🐱</div><div class="faq-typing"><span></span><span></span><span></span></div>`;
    faqChatBody.appendChild(typing);
    faqChatBody.scrollTop = faqChatBody.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const botMsg = document.createElement('div');
      botMsg.className = 'faq-msg-bot';
      botMsg.innerHTML = `<div class="faq-msg-bot-avatar">🐱</div><div><div class="faq-bubble-bot">${a}</div><div class="faq-bubble-time">${t}</div></div>`;
      faqChatBody.appendChild(botMsg);
      faqChatBody.scrollTop = faqChatBody.scrollHeight;
    }, 900);
  });
});

/* scroll header: tambah/lepas .scrolled (null-safe).
   karir/kerjasama TIDAK punya rule header.scrolled -> efek visual NOL. */
const _hdr = document.querySelector('header');
if (_hdr) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) _hdr.classList.add('scrolled');
    else _hdr.classList.remove('scrolled');
  }, { passive: true });
}

/* entrance fade+slide-up: tambah .show saat elemen .fade-section masuk viewport (null-safe; no-op bila halaman tak punya .fade-section) */
const _fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-section').forEach(el => _fadeObserver.observe(el));

/* footer: tahun otomatis (HTML berisi fallback 2026 bila JS mati); null-safe */
var _y = document.getElementById('year'); if(_y) _y.textContent = new Date().getFullYear();

/* email anti-scraper: rakit alamat dari data-u/data-d (tak ada email mentah di HTML); set mailto bila elemen <a>. null-safe */
document.querySelectorAll('.js-email').forEach(function(el){
  var u = el.getAttribute('data-u'), d = el.getAttribute('data-d');
  if(!u || !d) return;
  var addr = u + '@' + d;
  el.textContent = addr;
  if(el.tagName === 'A') el.setAttribute('href', 'mailto:' + addr);
});

/* tombol mailto tersembunyi: set href mailto (+subject opsional) TANPA menampilkan alamat (label tombol tetap). null-safe */
document.querySelectorAll('.js-mailto').forEach(function(el){
  var u = el.getAttribute('data-u'), d = el.getAttribute('data-d');
  if(!u || !d) return;
  var href = 'mailto:' + u + '@' + d;
  var s = el.getAttribute('data-subj'); if(s) href += '?subject=' + encodeURIComponent(s);
  el.setAttribute('href', href);
});
