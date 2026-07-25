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

describe('Aturan cascade: @media TIDAK boleh pindah ke main.css', () => {
  // Memindahkan @media ke file bersama membalik urutan cascade dan
  // menghancurkan tampilan mobile. Komentar dibuang dulu supaya kata
  // "@media" di dalam catatan tidak salah dihitung.
  it('main.css bebas dari rule @media', () => {
    expect(stripCssComments(read('assets/css/main.css'))).not.toContain('@media')
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
