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

## Navigasi header (SERAGAM 7/7 — transisi landing→multi-halaman)
Nav header **identik di 7 halaman**: Home · Tentang · Layanan · Lokasi · Toko Online · Karir · Kerjasama.
- **Tentang → `tentang.html`**, **Layanan → `layanan.html`** (link halaman, bukan anchor section).
- **Produk & Ulasan SUDAH DIBUANG dari nav** (dulu `#products`/`#reviews`). Section `#products`/`#reviews` di body index **tetap ada** — hanya entri nav-nya yang dihapus.
- **Home & Lokasi** menunjuk homepage: di **index** pakai `#home`/`#location` (same-page anchor); di **6 halaman lain** pakai `index.html#home`/`index.html#location` (cross-page, valid). Beda href ini **benar per-konteks**, bukan drift.
- **`class="active"`** statik menandai halaman aktif tiap halaman (kecuali syarat — dicapai via link footer). Jangan hapus.
- **Scrollspy index DIBUANG** (dulu blok JS yang memindah `.active` saat scroll). `nav a:hover::after` (garis hover) & `nav a.active::after` (penanda statik) **tetap** di main.css.
- Tombol hero index `#services` ("Lihat Layanan Kami") **tetap anchor** (same-page CTA) — bukan nav.

## Animasi & UX mobile (shared via main.css + main.js)
- **(a) Animasi entrance fade+slide-up** — `.fade-section` (di main.css, **di-scope `.js`** yang di-set main.js → tanpa JS konten tampil normal, no LCP/SEO risk). `IntersectionObserver` (`_fadeObserver`) di main.js menambah `.show` saat masuk viewport. Hanya `transform`+`opacity` → **no CLS**. Dipasang di elemen **below-fold** (section/h2); **hero/h1 pertama tiap halaman DIKECUALIKAN** (LCP). karir/toko tanpa fade (placeholder LCP-only).
- **(b) Nav mobile parent navigasi** — handler `#mobileMenu .nav-item > a` di main.js **tanpa `preventDefault`** lagi → tap Tentang/Layanan/Kerjasama di hamburger **pindah ke halaman** (sub-item dropdown mobile dikorbankan, Opsi 1).
- **(c) Drawer nav mobile** — `.mobile-nav` (di `@media(max-width:768px)` inline 7 halaman) = drawer **`width:var(--drawer-w)` (default 50%, setel di main.css `:root`)** slide dari kanan via `transform:translateX(100%→0)`, `position:fixed` (halaman diam). **Overlay** `.mobile-overlay` dibuat **dinamis di main.js** (tanpa edit markup) + helper `openMenu()/closeMenu()` sinkronkan `.open`(drawer)+`.show`(overlay)+`.active`(hamburger); klik overlay/link/luar = tutup. z-index: overlay 1400 < drawer 1500.
- **Logo mobile pojok kiri** — `.logo-area` di `@media` 7 halaman = `position:absolute;left:20px` (dulu center). **Desktop logo (main.css) tak berubah** (kiri-natural via space-between). Hamburger tetap kanan.
- ⚠️ **Dikecualikan desktop**: semua di atas hanya ubah `@media(max-width:768px)` inline atau JS null-safe; rule desktop di main.css tak disentuh.

## Stack & Struktur
- HTML + CSS/JS. Tidak ada build tool, package manager, framework, atau CI.
- 7 halaman konten: `index.html`, `tentang.html`, `layanan.html`, `karir.html`, `kerjasama.html`, `toko.html`, `syarat.html`.
- Config: `CNAME`, `robots.txt`, `sitemap.xml`, `assets/icons/site.webmanifest`, `google4120ad7b9c49fdb9.html` (verifikasi GSC).
- Aset di `assets/` (icons, images, logo, video, music).
- Path aset pakai **absolut dari root** (`/assets/...`) karena GitHub Pages dari root.
- File ber-**CRLF** (autocrlf). Pertahankan CRLF saat mengedit HTML.

## Refactor CSS/JS bersama (TAHAP 3 — sedang berjalan)
- `assets/css/main.css` — 54 rule **universal (identik di 7/7 halaman)**: reset, `:root`, nav/dropdown, footer-social, blok FAQ popup, `@keyframes`.
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

## Larangan (PENTING)
- **JANGAN push ke `main`** tanpa persetujuan eksplisit. Kerja di branch fitur; commit ≠ push.
- **JANGAN ubah struktur/konten/SEO** (judul, meta, heading, link, structured data) tanpa pertimbangan — situs page-one.
- **JANGAN tulis skrip generator yang rapuh** ("semoga jalan"). Gunakan assertion fail-fast, tampilkan isi/diff & tunggu persetujuan sebelum menulis, satu file pada satu waktu lalu verifikasi.
- **JANGAN refactor dengan memindah rule `@media`** ke file bersama bila membalik urutan cascade — @media tetap inline.
- **Pesan console keamanan = STANDAR semua halaman via `main.js`.** ASCII art "Central Cat's" + 5 peringatan anti-social-engineering (sumber kebenaran: blok di `index.html`) sudah dipindah ke `assets/js/main.js` (6 `console.log`), jadi setiap halaman yang load main.js otomatis menampilkannya. Ini fitur perlindungan pengunjung yang disengaja — **jangan hapus/ubah** isinya. ~~Saat refactor index: hapus 6 console.log inline~~ **SUDAH DILAKUKAN** — `index.html` kini load main.js & 6 `console.log` inline-nya sudah dihapus (tak ada lagi yang dobel). Sumber kebenaran teks pesan = blok di `main.js`.
- **Header & footer kiblatnya ke `index.html`** (rancangan asli). Halaman lain yang beda = drift → **luruskan ke index**. Kalau ada ambiguitas (mis. index punya rule tak relevan untuk halaman itu), **bahas dengan pemilik dulu, jangan otomatis ikut**.

## Item polish tertunda (dikerjakan SETELAH refactor Tahap 3 selesai, terpisah)
Bukan bagian ekstraksi CSS/JS; jangan dicampur ke commit refactor.
- **(a) Tipografi situs terasa flat** — tinjau hierarki font di **SEMUA halaman**: `h1` & `h2` sama-sama `2rem`, body seragam. Pertimbangkan skala/berat yang lebih berjenjang. ⚠️ Hati-hati: situs page-one — uji dampak visual & jangan ubah konten/heading text.
- **(b) Logo `<img>` belum punya `width`/`height`** di `tentang.html` & halaman lain; **index sudah punya** (`width="200" height="44"` di header & footer). Selaraskan ke index untuk cegah CLS (layout shift). Perubahan HTML kecil, di luar scope ekstraksi.

## Catatan lain
- Email kontak resmi: **admin@central-cats.com**.
- GA4 terpasang di semua halaman: **G-SGYPJC015Y**.
- `supplier`/`waralaba` bukan file — anchor `#supplier`/`#waralaba` di dalam `kerjasama.html`.
