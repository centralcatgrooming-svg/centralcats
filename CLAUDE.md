# CLAUDE.md — Panduan Repo Central Cat's

## Tentang
Website **statis** Central Cat's (petshop & grooming kucing, Tangerang).
Domain: **www.centralcats.id** — di-deploy via **GitHub Pages dari branch `main`, folder root**.
⚠️ **Situs ini SUDAH page-one Google.** Struktur & konten yang memengaruhi SEO tidak boleh berubah tanpa pertimbangan.

## Ekosistem (penting — sering disalahpahami)
Central Cat's punya 3 properti di subdomain berbeda:
- centralcats.id — website ini (company profile). Repo INI.
- app.centralcats.id — POS, sudah dibangun. BUKAN bagian repo ini.
- shop.centralcats.id — toko online, AKAN dibangun. BUKAN bagian repo ini.

`toko.html` di repo ini = halaman placeholder "Segera Hadir", JEMBATAN sementara
yang nanti mengarah ke shop.centralcats.id. JANGAN hapus, JANGAN isi dengan toko
sungguhan — toko dibangun terpisah di subdomain. Halaman karir/kerjasama/toko =
placeholder "Segera Hadir" yang sengaja belum diisi konten; biarkan apa adanya.

Sebelum menyimpulkan suatu halaman ada/tidak: selalu cek `git ls-tree -r origin/main`
— branch lokal bisa tertinggal dari produksi.

## Navigasi header (SERAGAM 8/8 — transisi landing→multi-halaman)
Nav header **identik di 8 halaman**: Home · Tentang · Layanan · Lokasi · Toko Online · Karir · Kerjasama.
- **Tentang → `tentang.html`**, **Layanan → `layanan.html`**, **Lokasi → `lokasi.html`** (link halaman, bukan anchor section — Lokasi jadi halaman di TAHAP 5).
- **Produk & Ulasan SUDAH DIBUANG dari nav** (dulu `#products`/`#reviews`). Section `#products`/`#reviews` di body index **tetap ada** — hanya entri nav-nya yang dihapus.
- **Home** menunjuk homepage: di **index** pakai `#home` (same-page anchor); di **7 halaman lain** pakai `index.html#home` (cross-page, valid). Beda href ini **benar per-konteks**, bukan drift.
- **Lokasi → `lokasi.html`** di **8/8** (dulu `#location`/`index.html#location` ke section homepage; kini halaman sendiri — lihat TAHAP 5). `#location` di index kini **section RINGKAS** (alamat singkat 2 cabang + tombol "Lihat Lokasi & Peta" → lokasi.html); maps penuh pindah ke lokasi.html.
- **`class="active"`** statik menandai halaman aktif tiap halaman (kecuali syarat — tak ada entri nav; dicapai via link `Syarat & Ketentuan` di footer-bottom yang kini ada di 7/7, lihat TAHAP 4). Jangan hapus.
- **Scrollspy index DIBUANG** (dulu blok JS yang memindah `.active` saat scroll). `nav a:hover::after` (garis hover) & `nav a.active::after` (penanda statik) **tetap** di main.css.
- Tombol hero index: dulu anchor `#services` ("Lihat Layanan Kami"). **TAHAP 5**: diganti CTA ganda `📅 Booking Sekarang` (→ app.centralcats.id/booking) + `✂️ Lihat Paket Grooming` (→ `layanan.html#paket-grooming`) + baris trust.

## Animasi & UX mobile (shared via main.css + main.js)
- **(a) Animasi entrance fade+slide-up** — `.fade-section` (di main.css, **di-scope `.js`** yang di-set main.js → tanpa JS konten tampil normal, no LCP/SEO risk). `IntersectionObserver` (`_fadeObserver`) di main.js menambah `.show` saat masuk viewport. Hanya `transform`+`opacity` → **no CLS**. Dipasang di elemen **below-fold** (section/h2); **hero/h1 pertama tiap halaman DIKECUALIKAN** (LCP). karir/toko tanpa fade (placeholder LCP-only).
- **(b) Nav mobile parent navigasi** — handler `#mobileMenu .nav-item > a` di main.js **tanpa `preventDefault`** lagi → tap Tentang/Layanan/Kerjasama di hamburger **pindah ke halaman** (sub-item dropdown mobile dikorbankan, Opsi 1).
- **(c) Drawer nav mobile** — `.mobile-nav` (di `@media(max-width:768px)` inline 7 halaman) = drawer **`width:var(--drawer-w)` (default 50%, setel di main.css `:root`)** slide dari kanan via `transform:translateX(100%→0)`, `position:fixed` (halaman diam). **Overlay** `.mobile-overlay` dibuat **dinamis di main.js** (tanpa edit markup) + helper `openMenu()/closeMenu()` sinkronkan `.open`(drawer)+`.show`(overlay)+`.active`(hamburger); klik overlay/link/luar = tutup. z-index: overlay 1400 < drawer 1500.
- **Logo mobile pojok kiri** — `.logo-area` di `@media` 7 halaman = `position:absolute;left:20px` (dulu center). **Desktop logo (main.css) tak berubah** (kiri-natural via space-between). Hamburger tetap kanan.
- ⚠️ **Dikecualikan desktop**: semua di atas hanya ubah `@media(max-width:768px)` inline atau JS null-safe; rule desktop di main.css tak disentuh.

## Stack & Struktur
- HTML + CSS/JS. Tidak ada build tool, package manager, framework, atau CI.
- 8 halaman konten: `index.html`, `tentang.html`, `layanan.html`, `lokasi.html`, `karir.html`, `kerjasama.html`, `toko.html`, `syarat.html`.
- Config: `CNAME`, `robots.txt`, `sitemap.xml`, `assets/icons/site.webmanifest`, `google4120ad7b9c49fdb9.html` (verifikasi GSC).
- Aset di `assets/` (icons, images, logo, video, music).
- Path aset pakai **absolut dari root** (`/assets/...`) karena GitHub Pages dari root.
- File ber-**CRLF** (autocrlf). Pertahankan CRLF saat mengedit HTML.

## Refactor CSS/JS bersama (TAHAP 3 — sedang berjalan)
- `assets/css/main.css` — rule **universal (identik di 7/7 halaman)**: reset, `:root`, nav/dropdown, footer-social, **4 class footer-contact** (`.footer-ico/-divider/-label/-row` — lihat TAHAP 4), **blok FAQ popup LENGKAP** (top-level diangkat dari index — lihat TAHAP 4), `@keyframes`. (Dulu 54 rule; kini +4 footer +12 FAQ.)
- `assets/js/main.js` — inti interaksi 7/7: hamburger, dropdown mobile, FAQ chat popup, `getNow()`, scroll-header (null-safe).
- Aturan ekstraksi (WAJIB demi tampilan identik):
  - Hanya migrasikan rule **top-level yang identik di 7/7**. Rule drift & **seluruh `@media` tetap inline** per halaman (mencegah urutan cascade terbalik).
  - CSS unik per-halaman tetap inline.
  - `<link main.css>` ditempatkan **sebelum** `<style>` inline sisa.
  - Setiap halaman: verifikasi **lossless** — `(main.css) ∪ (inline-sisa) == rule asli halaman` (tanpa hilang/dobel/berubah).

### Status Tahap 3
- ✅ **karir.html + kerjasama.html — SELESAI** (pakai main.css + main.js bersama, lossless verified, browser OK).
- ✅ **toko.html + syarat.html — SELESAI** (main.css + main.js bersama; 53 rule lossless + 1 box-shadow hover medsos diselaraskan ke index; footer legal DJKI syarat tetap inline; browser OK).
- ✅ **layanan.html — SELESAI** (54 rule lossless 0 drift; interaksi → main.js; CSS unik [hero-banner, .layanan-section, .card, footer-contact hover] tetap inline; SEO/JSON-LD/h1/h2 utuh; console.log inline dihapus, pakai pesan keamanan main.js).
- ✅ **tentang.html — SELESAI** (54 rule lossless 0 drift; interaksi → main.js; CSS unik [galeri, stats-card, profil-split @media, footer-contact hover] tetap inline; 2 console.log inline dihapus → pesan keamanan dari main.js; SEO/JSON-LD AboutPage/h1 "Profil Central Cat's"/4 h2 utuh; browser OK).
- ✅ **index.html — SELESAI** (hybrid penuh, halaman terakhir & paling berisiko). CSS: adopsi main.css, 54 rule lossless **0 drift** via tokenizer **brace-aware** (memisah baris glued `#faqTrigger:hover{...}@media(max-width:768px){`); CSS unik (~87: hero transparan, slider/review-dot, location, reel/stats, faq-unik) + 2 `@media` tetap inline. JS-penuh: load main.js, **hapus** blok C(dropdown)/D(hamburger)/G(click-outside)/I(FAQ incl getNow)/K(6 console.log), **keep** A(scroll+parallax+scrollspy)/B(resize)/E(mobile-smooth)/F(slider)/H(touch-swipe)/J(fade-observer). **R1 const-clash=0** (tak ada deklarasi top-level kembar dgn main.js); slider/parallax/scrollspy/fade utuh; 2 JSON-LD (LocalBusiness @graph + FAQPage)/h1/6 h2/width-height **byte-identik**; browser OK (console 6 pesan dari main.js, no SyntaxError).
- ✅ **Pesan console keamanan dipindah ke main.js** (standar semua halaman yang load main.js).
- 🎉 **TAHAP 3 SELESAI — 7/7 halaman** memakai main.css + main.js bersama (lossless verified, browser OK).

## TAHAP 4 — Footer & FAQ ke sumber tunggal (SELESAI & SUDAH di `origin/main` produksi — branch `fix/tahap-1-konten-seo` == `origin/main`, commit `bc33029`)
Lanjutan Tahap 3, pola sama (kiblat = **index**, lossless/render-identik, **@media tetap inline**, per-halaman + verifikasi browser). Cek cascade dulu sebelum tiap pemindahan.
- **(a) Footer inline-style → 4 class** (di main.css): `.footer-ico` (lingkaran 44px **putih** ×3/hal), `.footer-divider` (`<hr>` ×3), `.footer-label` (label Email/WA/SMS/FAQ ×4), `.footer-row` (baris kontak Email/WA, `+margin-bottom:10px` ×2). Diterapkan **7/7** (−12 inline/hal). ⚠️ **Varian SENGAJA tetap inline**: baris SMS (gap tanpa margin-bottom), `#faqTrigger` (cursor:pointer), **ikon FAQ EMAS** (`rgba(212,175,55,.25)`+border — beda dari putih). 4 elemen yg dikonversi tak punya selector penyaing (hover-svg `.footer-contact div:hover svg` menarget `svg`, bukan div) → render identik.
- **(b) Facebook ditambah ke `.footer-social` 7/7** — item ke-4 **SETELAH TikTok** (grid jadi 2×2: IG·YT / TikTok·FB). `href=https://www.facebook.com/Centralcatsofficial/`, `<span>Central Cats Official</span>`, path SVG `fill="white" viewBox="0 0 24 24"` (match 3 ikon lain). Format whitespace **ikut tiap halaman** (index/tentang multiline, 5 lainnya single-line).
- **(c) footer-bottom SERAGAM 7/7** — `© <span id="year">2026</span> Central Cat's. All Rights Reserved. · <a href="syarat.html" …>Syarat & Ketentuan</a>`. **Link Syarat kini di SEMUA halaman** (dulu cuma self-link di syarat → **perbaiki halaman yatim**). **DJKI dilepas dari footer-bottom syarat** (tetap ada di **body poin 7 "Hak Kekayaan Intelektual"** — `IDM001047956`; jangan hapus). **Tahun otomatis**: fallback `2026` di HTML + main.js null-safe `var _y=getElementById('year'); if(_y) _y.textContent=new Date().getFullYear();`.
- **(d) FAQ CSS → main.css sumber tunggal 7/7** — 12 rule FAQ **top-level** (`.faq-popup` #ece5dd / `.faq-chat-body`+**doodle SVG** / `::-webkit-scrollbar(-thumb)` / `.faq-date-divider span` / `.faq-bubble-bot`(+`::before` ekor) / `.faq-bubble-user`(+`::after` ekor) / `.faq-typing` / `.faq-chip:active`) **diangkat byte-exact dari inline index → main.css**, inline top-level dihapus dari **7/7** (−130 baris). **@media FAQ TETAP inline** tapi **diseragamkan ke index**: `.faq-chip` `+padding:6px 11px`, tambah `.faq-quick-replies{…overflow-y:auto;max-height:130px}`. Dulu **4 varian drift** (index full · tentang/layanan medium · karir/kerjasama/toko/syarat polos) → kini **identik 7/7** (popup krem #ece5dd + doodle + ekor balon WA-style + scrollbar). Render index tak berubah (rule identik). ⚠️ `#dfe7ec` = warna **`.faq-chat-body`** (area pesan, dominan, BENAR); `#ece5dd` cuma trim `.faq-popup`.
- **(e) Hover-zoom ikon kontak footer → main.css (universal 7/7)** — `.footer-contact svg{transition:transform .2s ease}` + `.footer-contact div:hover svg{transform:scale(1.15)}`. Dulu hanya index/tentang/layanan; kini diangkat ke main.css, inline 3 halaman itu dihapus → ikon Email/WA/SMS/FAQ membesar saat hover di **semua halaman**.
- **(f) Konten FAQ diseragamkan ke index 7/7 (Opsi A, owner approved)** — karir/kerjasama/toko/syarat: **4 → 8 chip** byte-identik index + **sapaan bot awal** disamakan. ⚠️ Konsekuensi Opsi A: jawaban "Biaya" kini versi index (vague) → **harga eksplisit "Rp 100–200k" DIHILANGKAN** dari placeholder (disetujui owner). FAQ kini **identik 7/7** (CSS via main.css + chip + sapaan).

## TAHAP 5 — Konten marketing index + halaman Lokasi + performa mobil + privasi email (branch `fix/tahap-1-konten-seo`)
Kiblat tetap index; jangkar SEO (title/meta/canonical/teks h1+h2/JSON-LD) **TIDAK digeser**; CRLF dijaga; @media tetap inline.
- **(a) Index lebih "marketing"**: hero **CTA ganda** (Booking + Lihat Paket Grooming → `layanan.html#paket-grooming`) + baris trust "⭐4.9 · 500+ · buka tiap hari"; **section baru `#keunggulan` "Kenapa Central Cat's?"** (4 benefit: Antar-Jemput/Home service, Groomer Bersertifikat, Higienis & Aman, Buka Setiap Hari — h2 baru, klaim didukung ulasan asli); **grid 4 KPI dihapus dari index** (duplikat `tentang.html`); **irama background** diselang-seling (about light→keunggulan soft→services light→nilai soft→products light→reviews soft); CSS yatim `.stats-card*` dibersihkan.
- **(b) Tipografi**: Fraunces (heading) + Poppins (body) site-wide — lihat polish (a).
- **(c) Fix video reel index**: `.reel-box` `aspect-ratio:3/4`→`9/16` (+`max-width:300px;margin:14px auto`) — ke-3 video sumber **portrait 9:16** (sebelumnya ke-crop & terasa melebihi layar HP).
- **(d) Halaman BARU `lokasi.html`** (disalin dari karir → header/footer/FAQ identik): head SEO lokal + **JSON-LD LocalBusiness 2 cabang**, h1 "Lokasi & Cabang Central Cat's" + 2 cabang (h2) + maps + section "Area Layanan & Antar-Jemput". Nav "Lokasi" → `lokasi.html` **8/8** (active di lokasi.html). `#location` index **diringkas** (maps pindah; alamat singkat + tombol). **sitemap.xml** + entri lokasi.html (priority 0.8). ⚠️ JSON-LD 2 cabang **tetap juga di index** (entitas sama `@id`).
- **(e) Performa mobil** (aman SEO): video index `preload="metadata"→"none"`; Google Fonts **non-render-blocking** (preload + `media="print" onload` + `<noscript>`) 8/8; `main.js` `defer` 8/8; **hapus ±6.4 MB aset MATI** (`logo/logo.png` 4MB + 6 maskot PNG tak-direferensi; `logo-horizontal.png` & `maskot-about.webp` dipertahankan). Catatan: skor PSI baru berubah **setelah deploy**; win terbesar = 2 embed Maps keluar dari index.
- **(f) Privasi email (anti-scraper)**: email footer (8/8) + body syarat → `.js-email` + `data-u`/`data-d`, dirakit `main.js`. JSON-LD `"email"` **sengaja tetap plaintext** (SEO). ⚠️ **Inline `style=""` (±250×) SENGAJA DILEWATI** — nilai ranking nol, risiko regresi tinggi, bertentangan arsitektur (sekadar checkbox audit generik).

## Larangan (PENTING)
- **JANGAN push ke `main`** tanpa persetujuan eksplisit. Kerja di branch fitur; commit ≠ push.
- **JANGAN ubah struktur/konten/SEO** (judul, meta, heading, link, structured data) tanpa pertimbangan — situs page-one.
- **JANGAN tulis skrip generator yang rapuh** ("semoga jalan"). Gunakan assertion fail-fast, tampilkan isi/diff & tunggu persetujuan sebelum menulis, satu file pada satu waktu lalu verifikasi.
- **JANGAN refactor dengan memindah rule `@media`** ke file bersama bila membalik urutan cascade — @media tetap inline.
- **Pesan console keamanan = STANDAR semua halaman via `main.js`.** ASCII art "Central Cat's" + 5 peringatan anti-social-engineering (sumber kebenaran: blok di `index.html`) sudah dipindah ke `assets/js/main.js` (6 `console.log`), jadi setiap halaman yang load main.js otomatis menampilkannya. Ini fitur perlindungan pengunjung yang disengaja — **jangan hapus/ubah** isinya. ~~Saat refactor index: hapus 6 console.log inline~~ **SUDAH DILAKUKAN** — `index.html` kini load main.js & 6 `console.log` inline-nya sudah dihapus (tak ada lagi yang dobel). Sumber kebenaran teks pesan = blok di `main.js`.
- **Header & footer kiblatnya ke `index.html`** (rancangan asli). Halaman lain yang beda = drift → **luruskan ke index**. Kalau ada ambiguitas (mis. index punya rule tak relevan untuk halaman itu), **bahas dengan pemilik dulu, jangan otomatis ikut**.

## Item polish tertunda (dikerjakan SETELAH refactor Tahap 3 selesai, terpisah)
Bukan bagian ekstraksi CSS/JS; jangan dicampur ke commit refactor.
- ✅ **(a) Tipografi — DITANGANI di TAHAP 5**: heading **Fraunces** (serif) + body **Poppins** site-wide (rule `h1,h2,h3` di main.css + `<link>` Fraunces 8/8, non-render-blocking); h1 index 2.6→3rem. Teks heading TIDAK diubah.
- **(b) Logo `<img>` belum punya `width`/`height`** di `tentang.html` & halaman lain; **index sudah punya** (`width="200" height="44"` di header & footer). Selaraskan ke index untuk cegah CLS (layout shift). Perubahan HTML kecil, di luar scope ekstraksi.

## Roadmap (rencana, belum dikerjakan — bahas fresh tiap proyek)
- Ekosistem subdomain (keluarga centralcats, BUKAN PBN — saling taut natural):
  centralcats.id (profil, ini) · app.centralcats.id (POS, ada) ·
  shop.centralcats.id (toko online, AKAN dibangun) · blog (AKAN dibangun).
- Blog: static site generator (mis. Astro/11ty/Hugo — putuskan nanti), berita
  kucing/hewan. Index tampilkan ~5 berita terbaru (potongan/teaser) → "read more"
  ke artikel blog. Tetap statis (cocok GitHub Pages). Keputusan arsitektur (integrasi
  build vs situs statis sekarang) dibahas terpisah.
- toko.html = placeholder, nanti diarahkan ke shop.centralcats.id (jangan isi toko
  sungguhan).
- Strategi SEO ke #1 (urutan): fondasi (SELESAI: on-page A, perf A+, struktur rapi)
  → perbaikan/perkaya KONTEN → backlink (Tautan=F, penahan terbesar). Target ganda:
  keyword luas "grooming kucing tangerang" (untuk home service) + keyword lokal
  "pasar kemis/rajeg" (toko fisik).
- PRINSIP DIJAGA: JANGAN sentuh meta/canonical/heading/JSON-LD (baseline SEO,
  dikalibrasi & dipantau owner di Search Console). Boleh perkaya isi konten asalkan
  jangkar SEO tak digeser. Backlink HARUS natural/eksternal — JANGAN skema PBN/tukar
  link antar domain sendiri.

## Catatan lain
- Email kontak resmi: **admin@central-cats.com**. ⚠️ Di HTML terlihat **di-obfuscate** anti-scraper (`.js-email` + `data-u`/`data-d`, dirakit `main.js`; tanpa JS tampil "admin [at] central-cats.com"). **JSON-LD `"email"` SENGAJA tetap plaintext** (SEO/structured data — jangan obfuscate). Lihat TAHAP 5.
- GA4 terpasang di semua halaman: **G-SGYPJC015Y**.
- `supplier`/`waralaba` bukan file — anchor `#supplier`/`#waralaba` di dalam `kerjasama.html`.
