// Konvensi repo yang mudah dilanggar tanpa sadar (terutama oleh tooling/agent).

import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { PAGES, ROOT, read, readRaw, stripCssComments } from './helpers.js'

describe('CRLF dipertahankan', () => {
  it.each([...PAGES, 'sitemap.xml', 'robots.txt'])('%s tidak punya LF telanjang', (f) => {
    const buf = readRaw(f)
    const crlf = (buf.toString('binary').match(/\r\n/g) || []).length
    const lf = (buf.toString('binary').match(/\n/g) || []).length
    expect(lf - crlf, `${f} tercampur LF — editor/tool mengubah line ending`).toBe(0)
  })
})

describe('Aturan cascade: @media dimensi TIDAK boleh pindah ke main.css', () => {
  // Bug aslinya spesifik: @media berbasis LEBAR VIEWPORT di file bersama
  // membalik urutan cascade (main.css dimuat SEBELUM <style> inline halaman,
  // dan media query tidak menambah specificity) -> tampilan mobile hancur.
  //
  // Yang dilarang karena itu adalah media query DIMENSI, bukan semua @media.
  // Media query KAPABILITAS (hover/pointer/prefers-*) tidak ikut menentukan
  // layout sama sekali, jadi tidak bisa memicu bug yang sama. Dipakai sejak
  // 2026-08-02 untuk mematikan efek :hover di perangkat sentuh — di sana
  // :hover nyangkut sampai elemen lain disentuh.
  //
  // Komentar dibuang dulu supaya kata "@media" di dalam catatan tidak
  // salah dihitung.
  const css = () => stripCssComments(read('assets/css/main.css'))
  const DIMENSI = /@media[^{]*\b(?:min-|max-)?(?:width|height|aspect-ratio|orientation|resolution)\b/gi

  it('main.css bebas dari @media berbasis dimensi viewport', () => {
    const nakal = css().match(DIMENSI)
    expect(nakal, `@media dimensi di main.css membalik cascade mobile: ${nakal}`).toBeNull()
  })

  it('setiap @media di main.css adalah media query kapabilitas', () => {
    // Jaring pengaman: fitur baru yang tak dikenal ditolak, bukan diam-diam
    // lolos hanya karena bukan dimensi.
    for (const q of css().match(/@media[^{]*/g) || []) {
      expect(q.trim(), `@media tak dikenal di main.css: ${q.trim()}`)
        .toMatch(/\b(?:hover|any-hover|pointer|any-pointer|prefers-[a-z-]+)\b/)
    }
  })
})

describe('Referensi aset tidak menggantung', () => {
  const lokal = (u) =>
    u &&
    !/^(https?:|mailto:|tel:|data:|#|\/\/)/i.test(u) &&
    !u.startsWith('{')

  it.each(PAGES)('%s: semua aset lokal yang dirujuk benar-benar ada', (page) => {
    // Blok <script> dibuang dulu: di dalamnya ada string HTML yang dirakit saat
    // runtime (mis. src="'+esc(p.image)+'"), bukan referensi file statis.
    const html = read(page).replace(/<script\b[\s\S]*?<\/script>/gi, '')
    const rujukan = [
      ...html.matchAll(/\b(?:src|href)="([^"]+)"/g),
    ].map((m) => m[1])

    const hilang = []
    for (const r of rujukan) {
      if (!lokal(r)) continue
      const bersih = r.split('#')[0].split('?')[0]
      if (!bersih) continue
      // Absolut-dari-root ('/assets/..') maupun relatif ('assets/..') keduanya
      // di-resolve dari root repo, karena Pages menyajikan dari root.
      const p = join(ROOT, bersih.replace(/^\//, ''))
      if (!existsSync(p)) hilang.push(r)
    }
    expect(hilang, `aset tidak ditemukan dirujuk dari ${page}`).toEqual([])
  })
})

describe('Halaman placeholder dibiarkan apa adanya', () => {
  // karir/kerjasama/toko sengaja "Segera Hadir". Kalau ada yang mengisinya
  // dengan konten sungguhan (mis. toko beneran), itu melanggar rencana
  // ekosistem — toko dibangun di shop.centralcats.id, bukan di sini.
  it.each(['karir.html', 'kerjasama.html', 'toko.html'])('%s masih placeholder', (page) => {
    expect(read(page)).toMatch(/Segera Hadir/i)
  })
})
