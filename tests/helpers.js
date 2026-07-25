// Helper bersama untuk tes invarian repo.
// Prinsip repo: fail-fast. Kalau sesuatu tak ditemukan, LEMPAR error keras —
// jangan diam-diam mengembalikan array kosong yang bikin tes "hijau palsu".

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** 8 halaman konten. Placeholder ikut — header/footer wajib seragam juga di sana. */
export const PAGES = [
  'index.html',
  'tentang.html',
  'layanan.html',
  'lokasi.html',
  'karir.html',
  'kerjasama.html',
  'toko.html',
  'syarat.html',
]

/** Baca file sebagai buffer mentah (untuk cek byte, mis. CRLF). */
export function readRaw(rel) {
  const p = join(ROOT, rel)
  if (!existsSync(p)) throw new Error(`File wajib tidak ada: ${rel}`)
  return readFileSync(p)
}

/** Baca file sebagai teks UTF-8. */
export function read(rel) {
  return readRaw(rel).toString('utf8')
}

/** Peta { 'index.html': '<isi>' } untuk seluruh halaman. */
export function readAllPages() {
  return Object.fromEntries(PAGES.map((p) => [p, read(p)]))
}

/** Buang komentar CSS supaya pencarian rule tidak tertipu teks di komentar. */
export function stripCssComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * Ambil isi satu blok <nav ...> ... </nav> berdasarkan atribut penanda.
 * Melempar kalau blok tak ketemu — struktur berubah = tes harus merah, bukan lolos.
 */
export function navBlock(html, marker, page) {
  const re = new RegExp(`<nav[^>]*${marker}[^>]*>([\\s\\S]*?)</nav>`, 'i')
  const m = html.match(re)
  if (!m) throw new Error(`Blok <nav> "${marker}" tidak ditemukan di ${page}`)
  return m[1]
}

/** Daftar label anchor (teks tampak) dalam sebuah potongan HTML, urut kemunculan. */
export function anchorLabels(fragment) {
  return [...fragment.matchAll(/<a\b[^>]*>([^<]+)<\/a>/gi)]
    .map((m) => m[1].trim())
    .filter(Boolean)
}
