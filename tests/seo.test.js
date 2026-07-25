// Jangkar SEO. Situs ini page-one — tes di sini menjaga hal-hal yang kalau
// rusak baru ketahuan berminggu-minggu kemudian lewat Search Console.

import { describe, it, expect } from 'vitest'
import { PAGES, read, readAllPages } from './helpers.js'

const pages = readAllPages()
const sitemap = read('sitemap.xml')
const robots = read('robots.txt')

const BASE = 'https://www.centralcats.id/'

describe('sitemap.xml', () => {
  const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])

  it('memuat persis 8 URL', () => {
    expect(locs).toHaveLength(PAGES.length)
  })

  // Bug yang berulang: menambah halaman baru tapi lupa mendaftarkannya.
  it('isinya sama persis dengan daftar halaman konten', () => {
    const dari = (p) => (p === 'index.html' ? BASE : BASE + p)
    expect([...locs].sort()).toEqual(PAGES.map(dari).sort())
  })

  it('semua URL absolut https + www (samakan dengan kanonikal)', () => {
    for (const l of locs) expect(l.startsWith(BASE)).toBe(true)
  })

  it('setiap lastmod berformat YYYY-MM-DD', () => {
    const mods = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map((m) => m[1])
    expect(mods).toHaveLength(PAGES.length)
    for (const d of mods) expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('robots.txt', () => {
  it('mendeklarasikan sitemap dengan URL absolut', () => {
    expect(robots).toContain(`Sitemap: ${BASE}sitemap.xml`)
  })

  it('tidak memblokir crawler', () => {
    expect(robots).not.toMatch(/^\s*Disallow:\s*\/\s*$/m)
  })
})

describe('Jangkar per halaman', () => {
  it.each(PAGES)('%s punya <title> tidak kosong', (page) => {
    const m = pages[page].match(/<title>([\s\S]*?)<\/title>/)
    expect(m, `title hilang di ${page}`).toBeTruthy()
    expect(m[1].trim().length).toBeGreaterThan(10)
  })

  it.each(PAGES)('%s punya meta description', (page) => {
    expect(pages[page]).toMatch(/<meta[^>]+name="description"[^>]+content="[^"]{50,}"/)
  })

  it.each(PAGES)('%s punya canonical absolut', (page) => {
    const m = pages[page].match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)
    expect(m, `canonical hilang di ${page}`).toBeTruthy()
    expect(m[1].startsWith(BASE)).toBe(true)
  })

  it('judul & deskripsi unik antar halaman (cegah duplicate content)', () => {
    const ambil = (re) => PAGES.map((p) => pages[p].match(re)?.[1]?.trim())
    const judul = ambil(/<title>([\s\S]*?)<\/title>/)
    const desc = ambil(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)
    expect(new Set(judul).size).toBe(PAGES.length)
    expect(new Set(desc).size).toBe(PAGES.length)
  })

  it.each(PAGES)('%s punya tepat satu <h1>', (page) => {
    expect((pages[page].match(/<h1\b/g) || []).length).toBe(1)
  })
})

describe('Structured data', () => {
  it('setiap blok JSON-LD adalah JSON valid', () => {
    for (const page of PAGES) {
      const blok = [
        ...pages[page].matchAll(
          /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
        ),
      ]
      for (const [i, b] of blok.entries()) {
        expect(
          () => JSON.parse(b[1]),
          `JSON-LD blok ke-${i + 1} di ${page} tidak valid`,
        ).not.toThrow()
      }
    }
  })

  it('index.html punya LocalBusiness dan FAQPage', () => {
    expect(pages['index.html']).toContain('LocalBusiness')
    expect(pages['index.html']).toContain('FAQPage')
  })

  // Email di JSON-LD SENGAJA plaintext (SEO) walau di body di-obfuscate.
  it('email JSON-LD tetap plaintext', () => {
    expect(pages['index.html']).toContain('admin@central-cats.com')
  })
})
