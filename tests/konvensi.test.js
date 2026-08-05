// Konvensi repo yang mudah dilanggar tanpa sadar (terutama oleh tooling/agent).

import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { PAGES, ROOT, read, readRaw, stripCssComments } from './helpers.js'

describe('LF dipertahankan', () => {
  // Konvensi repo = LF murni (Unix). Sebelumnya test ini mewajibkan CRLF, tapi
  // seluruh file sudah LF (tooling/editor otomatis menyimpan LF), jadi konvensi
  // dibalik ke LF agar sinkron dengan kenyataan & tidak kambuh. Pasangannya:
  // .gitattributes (eol=lf) yang menormalkan line ending di sisi Git.
  it.each([...PAGES, 'sitemap.xml', 'robots.txt'])('%s pakai LF murni (tanpa CRLF)', (f) => {
    const buf = readRaw(f)
    const crlf = (buf.toString('binary').match(/\r\n/g) || []).length
    expect(crlf, `${f} mengandung CRLF — normalkan ke LF`).toBe(0)
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

describe('Token tema: mode gelap tidak boleh pincang', () => {
  // Mode gelap (2026-08-04) memakai DUA blok token kembar di main.css:
  //   @media(prefers-color-scheme:dark){ :root:not([data-theme="light"]){...} }  <- ikut OS
  //   :root[data-theme="dark"]{...}                                             <- pilihan manual
  // Isinya wajib sama. Aturan @media dan aturan atribut tidak bisa digabung jadi
  // satu selector, jadi duplikasi ini disengaja -- dan justru karena disengaja
  // gampang lupa mengubah salah satunya. Itu sudah kejadian sekali: blok manual
  // ketinggalan 3 token abu, hasilnya teks abu gelap di atas latar gelap saat
  // pengguna menekan tombol tema (mode ikut-OS tetap benar, jadi lolos mata).
  const css = stripCssComments(read('assets/css/main.css'))

  /** Ambil pasangan token dari sebuah blok deklarasi CSS. */
  const tokenDari = (blok) =>
    Object.fromEntries(
      [...blok.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map((m) => [m[1], m[2].trim()])
    )

  /** Isi { ... } milik selector, dihitung dengan mencocokkan kurung.
      Selector tema muncul lebih dari sekali -- :root[data-theme="dark"] dipakai
      untuk color-scheme DAN untuk blok token -- jadi ambil blok pertama yang
      benar-benar berisi deklarasi custom property, bukan sekadar yang pertama. */
  function blokToken(penanda) {
    let dari = 0, i
    while ((i = css.indexOf(penanda, dari)) >= 0) {
      const buka = css.indexOf('{', i + penanda.length - 1)
      let depth = 0, tutup = -1
      for (let j = buka; j < css.length; j++) {
        if (css[j] === '{') depth++
        else if (css[j] === '}' && --depth === 0) { tutup = j; break }
      }
      if (tutup < 0) throw new Error(`Blok tidak tertutup: ${penanda}`)
      const isi = css.slice(buka + 1, tutup)
      if (isi.includes('--')) return isi
      dari = tutup + 1
    }
    throw new Error(`Blok token tema tidak ditemukan di main.css: ${penanda}`)
  }

  const ikutOS  = tokenDari(blokToken(':root:not([data-theme="light"])'))
  const manual  = tokenDari(blokToken(':root[data-theme="dark"]{'))
  const terang  = tokenDari(blokToken(':root{'))

  it('dua blok gelap mendeklarasikan token yang sama persis', () => {
    expect(manual, 'blok :root[data-theme="dark"] tidak sama dengan blok @media prefers-color-scheme')
      .toEqual(ikutOS)
  })

  it('setiap token gelap punya pasangan terang di :root', () => {
    const yatim = Object.keys(ikutOS).filter((t) => !(t in terang))
    expect(yatim, 'token gelap tanpa nilai terang -> pincang di mode terang').toEqual([])
  })

  // Sejak gate [data-cc-theme] dilepas, SETIAP warna di 8 halaman harus lewat
  // token. var(--x) yang tidak terdefinisi diam-diam jadi transparan/inherit,
  // bukan error -- browser tidak mengeluh, halamannya saja yang rusak.
  it('semua var(--token) yang dipakai 8 halaman terdefinisi di :root', () => {
    const dipakai = new Set()
    for (const page of PAGES) {
      for (const m of read(page).matchAll(/var\((--[a-z0-9-]+)/gi)) dipakai.add(m[1])
    }
    for (const m of css.matchAll(/var\((--[a-z0-9-]+)/gi)) dipakai.add(m[1])
    const hilang = [...dipakai].filter((t) => !(t in terang))
    expect(hilang, 'var(--token) tanpa definisi di :root main.css').toEqual([])
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
