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
- ✅ **Pesan console keamanan dipindah ke main.js** (standar semua halaman yang load main.js).
- ⏳ Sisa: **tentang**, dan **index (TERAKHIR — paling berisiko: 90 rule unik, JS terkaya, hero transparan, halaman utama SEO; saat itu hapus console.log inline index)**.

## Larangan (PENTING)
- **JANGAN push ke `main`** tanpa persetujuan eksplisit. Kerja di branch fitur; commit ≠ push.
- **JANGAN ubah struktur/konten/SEO** (judul, meta, heading, link, structured data) tanpa pertimbangan — situs page-one.
- **JANGAN tulis skrip generator yang rapuh** ("semoga jalan"). Gunakan assertion fail-fast, tampilkan isi/diff & tunggu persetujuan sebelum menulis, satu file pada satu waktu lalu verifikasi.
- **JANGAN refactor dengan memindah rule `@media`** ke file bersama bila membalik urutan cascade — @media tetap inline.
- **Pesan console keamanan = STANDAR semua halaman via `main.js`.** ASCII art "Central Cat's" + 5 peringatan anti-social-engineering (sumber kebenaran: blok di `index.html`) sudah dipindah ke `assets/js/main.js` (6 `console.log`), jadi setiap halaman yang load main.js otomatis menampilkannya. Ini fitur perlindungan pengunjung yang disengaja — **jangan hapus/ubah** isinya. **Saat refactor index nanti: HAPUS 6 `console.log` inline di `index.html` (sekitar baris 1147–1156)** agar tidak dobel dengan main.js (index akan load main.js).
- **Header & footer kiblatnya ke `index.html`** (rancangan asli). Halaman lain yang beda = drift → **luruskan ke index**. Kalau ada ambiguitas (mis. index punya rule tak relevan untuk halaman itu), **bahas dengan pemilik dulu, jangan otomatis ikut**.

## Catatan lain
- Email kontak resmi: **admin@central-cats.com**.
- GA4 terpasang di semua halaman: **G-SGYPJC015Y**.
- `supplier`/`waralaba` bukan file — anchor `#supplier`/`#waralaba` di dalam `kerjasama.html`.
