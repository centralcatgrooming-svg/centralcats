// Keseragaman 8/8 — kiblat = index.html.
// Ini menegakkan aturan CLAUDE.md: header & footer identik di semua halaman,
// drift = bug. Sebelum ada tes ini, pengecekan dilakukan manual tiap sesi.

import { describe, it, expect } from 'vitest'
import { PAGES, readAllPages, navBlock, anchorLabels } from './helpers.js'

const pages = readAllPages()

/** Urutan label nav lengkap (top-level + isi dropdown), kiblat index.html. */
const NAV_HARAPAN = [
  'Home',
  'Tentang', 'Profil', 'Visi &amp; Misi',
  'Layanan', 'Paket Grooming', 'Treatment Kutu', 'Cat Hotel',
  'Lokasi',
  'Toko Online',
  'Karir',
  'Kerjasama', 'Supplier', 'Waralaba',
  'Artikel',
]

describe('Nav header seragam 8/8', () => {
  for (const marker of ['class="desktop-nav"', 'id="mobileMenu"']) {
    describe(`nav ${marker}`, () => {
      it.each(PAGES)('%s punya urutan menu persis sama dengan index', (page) => {
        expect(anchorLabels(navBlock(pages[page], marker, page))).toEqual(NAV_HARAPAN)
      })
    })
  }

  it('nav desktop & mobile isinya identik di tiap halaman', () => {
    for (const page of PAGES) {
      const d = anchorLabels(navBlock(pages[page], 'class="desktop-nav"', page))
      const m = anchorLabels(navBlock(pages[page], 'id="mobileMenu"', page))
      expect(m, `nav mobile != desktop di ${page}`).toEqual(d)
    }
  })
})

describe('Aset bersama dimuat 8/8', () => {
  it.each(PAGES)('%s memuat main.css', (page) => {
    expect(pages[page]).toContain('/assets/css/main.css')
  })

  it.each(PAGES)('%s memuat main.js dengan defer', (page) => {
    expect(pages[page]).toMatch(/<script[^>]*\bdefer\b[^>]*src="\/assets\/js\/main\.js"/)
  })

  // Aturan ekstraksi: <link main.css> HARUS sebelum <style> inline sisa,
  // supaya CSS unik per-halaman menang atas rule universal.
  it.each(PAGES)('%s menaruh main.css sebelum <style> inline', (page) => {
    const html = pages[page]
    expect(html.indexOf('/assets/css/main.css')).toBeLessThan(html.indexOf('<style'))
  })
})

describe('Komponen footer seragam 8/8', () => {
  const wajib = {
    'link Syarat & Ketentuan': 'syarat.html',
    'tahun otomatis #year': 'id="year"',
    'Facebook di footer-social': 'facebook.com/Centralcatsofficial',
    'email ter-obfuscate': 'js-email',
    'GA4': 'G-SGYPJC015Y',
    'link blog Artikel': 'blog.centralcats.id',
  }

  for (const [nama, jarum] of Object.entries(wajib)) {
    it.each(PAGES)(`%s punya ${nama}`, (page) => {
      expect(pages[page]).toContain(jarum)
    })
  }

  // Penjaga khusus: alamat footer = KANTOR LEGAL PT (Balaraja), sengaja BUKAN
  // alamat cabang. Sudah pernah "diperbaiki" keliru jadi Pasar Kemis.
  it.each(PAGES)('%s memakai alamat kantor legal PT (Balaraja), bukan cabang', (page) => {
    expect(pages[page]).toContain('Balaraja')
  })
})
