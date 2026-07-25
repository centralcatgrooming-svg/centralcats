// Penjaga keamanan.
// Feed blog di index.html menarik JSON dari sumber EKSTERNAL (blog.centralcats.id)
// lalu menyuntikkannya via innerHTML. Tambalan DOM XSS (commit 3b29825) memasang
// esc() + safeUrl(). Tes ini mencegah tambalan itu lepas diam-diam.

import { describe, it, expect } from 'vitest'
import { PAGES, read, readAllPages } from './helpers.js'

const index = read('index.html')
const mainJs = read('assets/js/main.js')
const pages = readAllPages()

/**
 * Ambil safeUrl() langsung DARI index.html lalu jalankan.
 * Sengaja tidak menyalin kodenya ke tes — kalau produksi diubah/dilemahkan,
 * tes ini ikut menguji versi barunya dan gagal.
 */
function ambilSafeUrl() {
  const m = index.match(/function\s+safeUrl\s*\(u\)\s*\{.*\}/)
  if (!m) throw new Error('safeUrl() tidak ditemukan di index.html — guard XSS hilang?')
  return new Function(`${m[0]}; return safeUrl;`)()
}

describe('safeUrl() — guard DOM XSS pada URL feed', () => {
  const safeUrl = ambilSafeUrl()

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
  ])('memblokir skema berbahaya: %s', (jahat) => {
    expect(safeUrl(jahat)).toBe('#')
  })

  it.each([
    'https://blog.centralcats.id/artikel-1',
    'http://example.com/x',
    '/relatif/halaman.html',
    '#anchor',
  ])('mengizinkan URL sah: %s', (baik) => {
    expect(safeUrl(baik)).toBe(baik)
  })

  it('menetralkan kutip ganda agar tak bisa keluar dari atribut href', () => {
    expect(safeUrl('https://x.test/a"onmouseover="alert(1)')).not.toContain('"')
  })

  it('menangani input kosong/null tanpa melempar', () => {
    for (const v of [null, undefined, '']) expect(safeUrl(v)).toBe('#')
  })
})

describe('esc() dipakai pada seluruh field feed', () => {
  it('esc() masih ada di index.html', () => {
    expect(index).toMatch(/function\s+esc\s*\(s\)/)
  })

  // Yang berbahaya adalah field feed yang DIRANGKAI langsung ke string HTML
  // (`'...'+ p.title +'...'`). Pemakaian lain — mis. cek truthiness
  // `p.image ? ... : ...` — tidak masuk ke output, jadi bukan risiko.
  it.each(['title', 'summary', 'category', 'image', 'url', 'date', 'dateText'])(
    'field p.%s tidak pernah dirangkai mentah ke HTML',
    (field) => {
      const mentah = index.match(new RegExp(`\\+\\s*p\\.${field}\\b`, 'g')) || []
      expect(mentah, `p.${field} dirangkai tanpa esc()/safeUrl()`).toEqual([])
    },
  )

  it.each(['title', 'summary', 'category', 'image'])(
    'field p.%s yang ditampilkan memang lewat esc()',
    (field) => {
      expect(index).toContain(`esc(p.${field})`)
    },
  )

  it('setiap href kartu artikel memakai esc(safeUrl(...))', () => {
    const hrefFeed = index.match(/href="'\+\s*esc\(safeUrl\(p\.url\)\)/g) || []
    expect(hrefFeed.length).toBe(2) // judul + "Baca selengkapnya"
    // Tidak boleh ada href yang memakai p.url tanpa safeUrl.
    expect(index).not.toMatch(/href="'\+\s*esc\(p\.url\)/)
  })
})

describe('Pesan console keamanan (fitur disengaja, jangan dihapus)', () => {
  it('main.js memuat 6 console.log peringatan', () => {
    expect((mainJs.match(/console\.log/g) || []).length).toBe(6)
  })

  it('index.html tidak lagi punya console.log inline (cegah dobel)', () => {
    expect(index).not.toContain('console.log')
  })
})

describe('Link keluar aman', () => {
  it.each(PAGES)('%s: semua target="_blank" punya rel noopener', (page) => {
    const nakal = (pages[page].match(/<a\b[^>]*target="_blank"[^>]*>/gi) || []).filter(
      (tag) => !/rel="[^"]*noopener/i.test(tag),
    )
    expect(nakal, `tautan tanpa rel=noopener di ${page}`).toEqual([])
  })
})
