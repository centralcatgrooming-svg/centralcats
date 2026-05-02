# CLAUDE.md — Central Cat's Website

> File ini wajib dibaca tiap session. Berisi konteks proyek, tech stack,
> design system, SEO constraints, dan task list yang sedang berjalan.

---

## 1. Konteks Proyek

- **Nama:** Central Cat's — Petshop & Grooming Kucing
- **Domain:** https://centralcats.id (production, sudah live)
- **Bisnis:** Petshop + jasa grooming kucing + cat hotel di Tangerang
- **Cabang (2 lokasi):**
  - **Pasar Kemis** — Bumi Indah RMR 03 (Union Square), Kec. Pasar Kemis,
    Kab. Tangerang
  - **Rajeg** — Rajeg Gardenia E11, Kec. Rajeg, Kab. Tangerang
- **Jam buka:** Setiap hari 08.00–21.00 WIB
  (Grooming 08.00–18.00, reservasi maksimal 16.00)
- **WhatsApp:** 0821-1182-7798 (`+6282111827798`)
- **Email:** customercare@central-cats.com

### Catatan Penting
Website ini **sudah ranking page one Google** untuk keyword utama. Semua
perubahan harus berhati-hati supaya tidak merusak SEO existing.

---

## 2. Tech Stack

- **Frontend:** HTML5 + CSS3 + vanilla JavaScript (statis, no framework,
  no build tool)
- **Hosting:** Static (CNAME ada di root → kemungkinan GitHub Pages /
  Cloudflare Pages / Vercel static)
- **CSS source of truth:** Inline `<style>` di `index.html` (baris 48–482)
  — satu-satunya CSS yang aktif, bukan file eksternal
- **JS source of truth:** Inline `<script>` di `index.html`
  (baris 1125–1351) — satu-satunya JS yang aktif
- **Catatan history:** Folder `assets/css/` (berisi `style.css` rose-gold
  theme) dan `assets/js/` (berisi `main.js`) telah dihapus pada
  **2026-05-02** karena tidak ter-link di file HTML mana pun. Git history
  tetap menyimpan isinya kalau suatu saat butuh reference. Namespace
  `.cc-*` sekarang bebas konflik.

### Struktur Folder
```
/
├── index.html              ← halaman utama (yang sedang di-redesign)
├── tentang.html            ← halaman terpisah, sudah aktif
├── layanan.html            ← halaman terpisah, sudah aktif
├── google4120ad7b9c49fdb9.html   ← Google site verification
├── CNAME                   ← custom domain
├── robots.txt
├── sitemap.xml
├── README.md
├── CLAUDE.md               ← file ini
└── assets/
    ├── logo/
    │   └── logo-horizontal.png
    ├── images/maskot/
    │   └── maskot-about.webp
    ├── icons/
    │   ├── favicon.ico, favicon-*.png, apple-touch-icon.png,
    │   │   site.webmanifest
    │   ├── maskot-mandi-transparent.webp
    │   ├── maskot-treatmentkutu-transparent.webp
    │   ├── maskot-cathottel-transparent.webp
    │   ├── food-aluminium-3d.webp
    │   ├── accessories-aluminium-3d.webp
    │   └── groomingkit-aluminium-3d.webp
    ├── music/
    └── video/
```

### Halaman terpisah yang BELUM ada (link sudah ada di nav)
`karir.html`, `kerjasama.html`, `supplier.html`, `waralaba.html` — link
sudah ada di nav header `index.html` tapi file-nya belum dibuat. Akan
diisi di fase lain. **Jangan disentuh** dalam scope redesign saat ini.

---

## 3. Tugas yang Sedang Berjalan

**Scope: Redesign konten & layanan section di `index.html` saja.**

### ✅ Sudah selesai
- **Audit struktur** `index.html` (1425 baris) — mapping section, ID/class,
  identifikasi locked area, dependency JS, font existing.
- **Execution plan 7 fase** (FASE 0–7) — preparation, hero, trust strip,
  why-us, about, services, paket, verification.
- **`style.css` orphan dihapus** (2026-05-02) bersama `main.js` orphan;
  namespace `.cc-*` sekarang aman dipakai untuk redesign.

### 🟡 Pending
- **Approval markup proposal** untuk setiap fase (preview file
  `centralcats-redesign-preview.html` yang disebut sebelumnya tidak ada
  di repo — markup di plan dibangun dari spek CLAUDE.md).
- **Eksekusi FASE 0** (preparation: inject Google Fonts + tambah CSS
  variables + override font tanpa sentuh selector `*`).
- FASE 1–7 (eksekusi bertahap, satu per satu dengan approval gate).

### ⏳ Section yang BELUM masuk scope sekarang (fase berikutnya)
- Galeri Before/After grooming
- Section tim groomer
- Testimoni diperluas (6–8 dengan rating bintang)
- FAQ section dipromosikan dari footer ke body
- Section promo/paket spesial

---

## 4. Design System (LOCKED)

Gunakan nilai persis ini di semua section baru. Jangan improvisasi.

### Color Palette
```css
:root {
  --cream:       #F7F1E5;   /* background utama */
  --cream-deep:  #EFE6D2;   /* border, divider */
  --paper:       #FFFCF5;   /* card background */
  --ink:         #1F1810;   /* text utama */
  --ink-soft:    #524539;   /* body text */
  --ink-muted:   #8B7E6E;   /* caption, label */
  --coral:       #E07856;   /* aksen utama */
  --coral-deep:  #B8512E;   /* aksen text/hover */
  --coral-soft:  #FAD6C7;   /* background lembut */
  --sage:        #6F8A6B;   /* aksen sekunder */
  --sage-soft:   #D9E3D5;
  --gold:        #C9962F;   /* rating star */
}
```

### Typography
- **Display (Fraunces):** semua heading, angka besar, statistik. Italic
  untuk emphasis kata yang ingin di-highlight.
- **Body (Plus Jakarta Sans):** body text, button, label, navigation
  internal section baru.
- **Existing (Poppins):** **DIPERTAHANKAN** untuk header, footer, FAQ
  popup, dan section yang tidak di-redesign (Produk, Ulasan, Lokasi).
  Selector global `*{font-family:'Poppins'}` di baris 58 **tidak boleh
  diubah** — override font baru WAJIB pakai class spesifik (`.cc-section`
  dst) supaya specificity menang.

```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Plus+Jakarta+Sans:wght@300..800&display=swap" rel="stylesheet">
```

### Spacing & Layout
- Section padding: `100px 0` desktop, `64px 0` mobile
- Container max-width: `1240px`
- Grid gap default: `24px`–`60px`

### Border Radius
- Card: `24px` atau `28px`
- Button: `100px` (pill)
- Image frame organic: `50% 50% 50% 50% / 60% 60% 40% 40%`

### Class Naming (LOCKED)
- **Prefix `.cc-*`** untuk semua selector baru di redesign
  (mis. `.cc-hero`, `.cc-container`, `.cc-btn`, `.cc-section`).
- Namespace bebas konflik sejak `assets/css/style.css` orphan dihapus
  (2026-05-02).

---

## 5. SEO Constraints — JANGAN DIRUSAK

### Keyword utama yang HARUS tetap ada di markup body
- "grooming kucing Tangerang"
- "mandi kucing" / "mandi kucing Tangerang"
- "petshop Tangerang"
- "Pasar Kemis"
- "Rajeg"
- "treatment kutu kucing"
- "cat hotel"
- "penitipan kucing Tangerang"
- "grooming kucing profesional"

### Hierarchy heading harus dijaga
- 1× `<h1>` (di hero — tidak boleh ada H1 kedua di section lain)
- `<h2>` untuk judul section
- `<h3>` untuk sub-item

### Meta tags & Structured Data — TIDAK BOLEH diubah
- `<title>`, `<meta name="description">`, `<meta name="keywords">`,
  `<link rel="canonical">`, `<meta name="robots">`
- `<meta name="theme-color" content="#1e3a8a">` — **tetap biru**
  (untuk PWA & browser theming, tidak terkait redesign visual section)
- Open Graph & Twitter Card tags — **og:image tetap pakai
  logo-horizontal.png biru/gold** (untuk social share, bukan brand visual
  baru)
- Geo SEO meta (`geo.region`, `geo.placename`, `geo.position`, `ICBM`)
- Favicon set lengkap
- **JSON-LD structured data baris 485–668** — Organization, 2× PetStore,
  FAQPage. Jangan diubah tanpa diskusi eksplisit.

---

## 6. Yang BOLEH vs TIDAK BOLEH Diubah

### ✅ BOLEH diubah / dibuat ulang
- Section hero (baris 762–781), about (783–806), services (808–845)
- Tambah section baru: `#why-us`, `#paket-grooming`, trust strip
- CSS styling section yang sedang di-redesign (lewat blok `.cc-*` baru
  yang ditambahkan ke akhir `<style>` existing)
- Microcopy di section yang di-redesign

### ❌ TIDAK BOLEH diubah (out of scope / locked)
- **Header & navigasi** (baris 672–760) — ada komentar
  `<!-- HEADER LOCKED - FINAL STRUCTURE DO NOT MODIFY -->`
- **Footer** (baris 1006–1122)
- **FAQ Popup** (baris 1352–end + overlay) — terhubung ke FAQ trigger
  di footer
- **Inline JavaScript** (baris 1125–1351) — scroll handler, scrollspy,
  hamburger, mobile dropdown accordion, review slider, FAQ popup,
  swipe-close, console message
- **Class `.hero` dan `.hero-mascot` pada element hero baru** — harus
  dipertahankan supaya parallax JS di baris 1129
  (`document.querySelector('.hero img')`) tidak break dan rule mobile
  `.hero-mascot{max-width:320px}` tetap apply
- **Halaman terpisah** (`tentang.html`, `layanan.html`) — kecuali diminta
  eksplisit
- **Asset folder structure & nama file** — pakai path yang sudah ada
- **WhatsApp number, email, alamat cabang** — verifikasi dulu kalau mau
  ganti
- **Schema markup / structured data** existing
- **Analytics scripts** (Google Analytics, Facebook Pixel, dll) — kalau
  ada di production tapi belum tampak di repo ini
- **Selector global `*{font-family:'Poppins'}`** di baris 58
- **Halaman terpisah yang belum diisi** (`karir.html`, `kerjasama.html`,
  `supplier.html`, `waralaba.html`) — link di nav biarkan, file akan diisi
  fase lain

---

## 7. Halaman Terpisah (Status)

| Halaman           | Status di repo | Link di nav |
|-------------------|----------------|-------------|
| tentang.html      | ✅ ada         | aktif       |
| layanan.html      | ✅ ada         | aktif       |
| karir.html        | ❌ belum dibuat | aktif (broken) |
| kerjasama.html    | ❌ belum dibuat | aktif (broken) |
| supplier.html     | ❌ belum dibuat | aktif (broken) |
| waralaba.html     | ❌ belum dibuat | aktif (broken) |

Link di nav untuk halaman yang belum dibuat **biarkan utuh** — akan diisi
di fase lain. Jangan menghapus link dari nav.

---

## 8. Data Placeholder Pending Konfirmasi User

Tandai di markup dengan komentar `<!-- TODO: PLACEHOLDER -->`. Jangan
mengisi data ngarang — tunggu user supply data real.

| Item                                                  | Status         |
|-------------------------------------------------------|----------------|
| Harga "Mulai dari" Grooming                           | 🟡 Placeholder |
| Harga "Mulai dari" Treatment Kutu                     | 🟡 Placeholder |
| Harga "Mulai dari" Cat Hotel                          | 🟡 Placeholder |
| Harga 3 paket (Basic, Premium, Treatment)             | 🟡 Placeholder |
| Bullet inclusion per tier paket grooming              | 🟡 Placeholder |
| Trust strip — tahun pengalaman (default: 5+)          | 🟡 Verify      |
| Trust strip — anabul terlayani (default: 10K+)        | 🟡 Verify      |
| Trust strip — rating Google (default: 4.9★)           | 🟡 Verify      |
| Trust strip — jumlah ulasan (default: 500+)           | 🟡 Verify      |

---

## 9. Workflow & Komunikasi

### Sebelum mulai edit
1. Baca file yang akan diubah dulu (jangan langsung overwrite)
2. Konfirmasi ke user kalau ada keraguan struktur folder atau scope
3. Eksekusi **per fase** dengan approval gate — jangan batch beberapa
   fase sekaligus tanpa konfirmasi

### Saat editing
- Commit per logical change (jangan satu commit besar)
- Pesan commit pakai format conventional: `feat:`, `fix:`, `style:`,
  `refactor:`, `docs:`, `chore:`
- **Jangan auto-deploy** — user yang akan deploy via hosting

### Saat selesai per fase
- Verifikasi visual (screenshot / preview lokal)
- Pastikan tidak ada console error
- Cek responsive di Chrome DevTools (320px, 375px, 768px, 1024px, 1440px)
- Cek scrollspy nav highlight masih bekerja
- Cek FAQ popup masih bisa dibuka & accordion bekerja
- Lapor ke user, tunggu approval untuk fase berikutnya

### Format komunikasi default
- **Bahasa Indonesia** untuk komunikasi dengan user
- Boleh campur English untuk istilah teknis (component, props, deploy,
  selector, dst)
- Concise — to the point, tidak bertele-tele
- Saat melaporkan finding/audit: pakai struktur (heading, bullet, table)
  supaya mudah di-scan

---

## 10. Brand Voice

- **Hangat tapi profesional** — bukan korporat kaku, bukan juga lebay
- Pakai istilah "**anabul**" (anak bulu) untuk merujuk kucing pelanggan
- Pakai "**Anda**" formal, bukan "kamu" — pelanggan Central Cat's beragam
  usia
- Hindari clickbait & hype words ("revolusioner", "terbaik se-Indonesia",
  "wajib coba!", dll)
- Tone editorial-warm, bukan e-commerce flash-sale
- Heading boleh pakai italic (Fraunces italic) untuk highlight kata kunci
  emotif (mis. "Perawatan *penuh kasih* untuk anabul")

---

_Last updated: 2026-05-02 — orphan `assets/css/style.css` & `assets/js/main.js`
dihapus, namespace `.cc-*` aman, siap eksekusi FASE 0._
