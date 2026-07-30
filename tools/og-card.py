#!/usr/bin/env python3
"""Pembuat kartu share (og:image) Central Cat's — 1200x630.

Situs ini statis tanpa build step; skrip ini TIDAK dijalankan saat deploy.
Jalankan manual hanya ketika kartu share perlu dibuat ulang, lalu commit
hasilnya. Kebutuhan: Pillow (`python -m pip install pillow`).

    python tools/og-card.py                                  # grafis
    python tools/og-card.py --foto assets/images/toko/x.jpg  # otomatis
    python tools/og-card.py --foto f.jpg --layout split --anchor 0
    python tools/og-card.py --judul "Cat Hotel|Tangerang" --out /tmp/coba.jpg

Tiga tata letak:
  grafis  badge lingkaran di kanan, teks di kiri. Tanpa foto.
  penuh   foto memenuhi kanvas + scrim gelap di kiri, teks di atasnya.
          Dipilih otomatis untuk foto LANSKAP (rasio >= 1,5).
  split   foto di panel kiri, teks di panel navy kanan.
          Dipilih otomatis untuk foto POTRET — foto potret tidak bisa
          memenuhi kanvas lanskap tanpa kehilangan hampir seluruh isinya.

SELALU periksa berkas `*-pratinjau-260.png` yang ikut dihasilkan: itu lebar
preview WhatsApp sungguhan di HP, dan satu-satunya ukuran yang menentukan
apakah kartunya berhasil. Kartu yang bagus pada 1200 px sering gagal di 260 px.

Catatan: jangan menyunting berkas ini lewat `Get-Content | Set-Content` di
PowerShell 5.1 — pembacaan default memakai codepage ANSI, sehingga em-dash
dan karakter non-ASCII lain rusak jadi mojibake.
"""
import argparse
import pathlib
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow belum terpasang. Jalankan: python -m pip install pillow")

REPO = pathlib.Path(__file__).resolve().parent.parent

W, H = 1200, 630
NAVY_A, NAVY_B = (30, 58, 138), (36, 60, 148)   # --primary -> gradien hero
GOLD = (212, 175, 55)                            # --accent
PUTIH = (255, 255, 255)
ABU = (226, 232, 240)

BADGE = REPO / "assets/logo/badge-512.webp"
KELUAR = REPO / "assets/og/share-card.jpg"

# Poppins (font situs) dimuat dari Google Fonts saat runtime, jadi tidak
# tersedia untuk render gambar. Segoe UI Black bentuknya paling dekat.
# Kalau Poppins terpasang, path-nya sudah didahulukan di daftar ini.
FONT_TEBAL = [r"C:\Windows\Fonts\poppins-black.ttf", r"C:\Windows\Fonts\seguibl.ttf"]
FONT_SEDANG = [r"C:\Windows\Fonts\poppins-semibold.ttf", r"C:\Windows\Fonts\segoeuib.ttf"]


def font_ada(kandidat):
    for p in kandidat:
        if pathlib.Path(p).exists():
            return p
    sys.exit(f"Tidak ada font yang cocok dari: {kandidat}")


def gradien(w, h, a=NAVY_A, b=NAVY_B):
    """Gradien diagonal: dirakit kecil lalu di-resize — mulus dan cepat."""
    kw, kh = 60, 32
    kecil = Image.new("RGB", (kw, kh))
    px = kecil.load()
    for y in range(kh):
        for x in range(kw):
            t = (x / (kw - 1) + y / (kh - 1)) / 2
            px[x, y] = tuple(round(p + (q - p) * t) for p, q in zip(a, b))
    return kecil.resize((w, h), Image.BICUBIC)


def cover_crop(im, tw, th, anchor_y=0.0):
    """Potong ke rasio target TANPA distorsi, lalu skalakan.

    Ini yang dulu salah: me-resize langsung ke (tw, th) membuat foto lanskap
    gepeng saat dipasang di panel potret.

    anchor_y membiaskan potongan vertikal: 0 = dari atas, 0.5 = tengah,
    1 = dari bawah. Default 0 karena pada foto toko papan nama ada di atas
    dan bagian bawah biasanya cuma lantai/paving kosong — memotong dari
    tengah bisa memangkas papan namanya. Hanya berpengaruh kalau sumbernya
    lebih "tinggi" daripada rasio target.
    """
    sa, ta = im.width / im.height, tw / th
    if sa > ta:
        w = round(im.height * ta)
        x = (im.width - w) // 2
        im = im.crop((x, 0, x + w, im.height))
    else:
        h = round(im.width / ta)
        y = round((im.height - h) * anchor_y)
        im = im.crop((0, y, im.width, y + h))
    upscale = tw > im.width
    return im.resize((tw, th), Image.LANCZOS), upscale


def scrim(w, h, lebar_pudar=980, dasar=248, kurva=1.05):
    """Overlay gelap kiri->kanan supaya teks putih terbaca di atas foto.

    Disetel setelah percobaan: dengan pudar 740 px & kurva 1,35, kata kedua
    judul ("Kucing") jatuh di atas kaca pintu yang terang dan kontrasnya
    lemah (latar rata-rata 98/255). Pudar dilebarkan dan kurvanya
    dilandaikan sampai latar di belakang judul turun ke ~75/255.
    """
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for x in range(w):
        t = min(1.0, x / lebar_pudar)
        a = round(dasar * (1 - t) ** kurva)
        if a:
            d.line([(x, 0), (x, h)], fill=(13, 26, 64, a))
    return ov


def teks_spasi(d, xy, teks, font, fill, tracking=0):
    """Letter-spacing manual — Pillow tidak punya tracking."""
    x, y = xy
    for ch in teks:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + tracking


def muat_pas(path, maks, baris, batas):
    """Turunkan ukuran font sampai baris terpanjang masuk `batas` piksel."""
    ukur = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    for size in range(maks, 20, -2):
        f = ImageFont.truetype(path, size)
        if max(ukur.textlength(t, font=f) for t in baris) <= batas:
            return f, size
    return ImageFont.truetype(path, 22), 22


def pilih_layout(args):
    if not args.foto:
        return "grafis"
    if args.layout:
        return args.layout
    im = Image.open(args.foto)
    rasio = im.width / im.height
    pilih = "penuh" if rasio >= 1.5 else "split"
    print(f"  foto {im.size} rasio {rasio:.2f} -> tata letak '{pilih}' (otomatis)")
    return pilih


def buat(args):
    f_tebal, f_sedang = font_ada(FONT_TEBAL), font_ada(FONT_SEDANG)
    baris = args.judul.split("|")
    layout = pilih_layout(args)

    if layout == "grafis":
        kanvas = gradien(W, H)
        if not BADGE.exists():
            sys.exit(f"Aset badge hilang: {BADGE}")
        badge = Image.open(BADGE).convert("RGBA")
        s = 400 / badge.height
        badge = badge.resize((round(badge.width * s), 400), Image.LANCZOS)
        kanvas.paste(badge, (W - 60 - badge.width, (H - badge.height) // 2), badge)
        X, maks, batas = 84, 76, W - 84 - 400 - 60 - 40

    elif layout == "penuh":
        foto, up = cover_crop(Image.open(args.foto).convert("RGB"), W, H, args.anchor)
        if up:
            print("  ! PERINGATAN: foto di-upscale untuk mengisi 1200x630 — hasilnya "
                  "buram. Pakai foto lanskap sisi panjang >= 1600 px.")
        kanvas = Image.alpha_composite(foto.convert("RGBA"), scrim(W, H)).convert("RGB")
        X, maks, batas = 84, 76, 660

    else:  # split
        LP = 520
        panel, up = cover_crop(Image.open(args.foto).convert("RGB"), LP, H, args.anchor)
        if up:
            print(f"  ! PERINGATAN: foto di-upscale untuk panel {LP}x{H} — buram.")
        kanvas = gradien(W, H)
        kanvas.paste(panel, (0, 0))
        ImageDraw.Draw(kanvas).rectangle([LP - 4, 0, LP, H], fill=GOLD)
        X, maks, batas = LP + 56, 70, W - (LP + 56) - 56

    d = ImageDraw.Draw(kanvas)
    f_judul, sz = muat_pas(f_tebal, maks, baris, batas)
    f_eye = ImageFont.truetype(f_sedang, 24 if layout == "split" else 26)
    f_sub = ImageFont.truetype(f_sedang, 28 if layout == "split" else 31)
    print(f"  font judul: {sz}px (batas {batas}px)")

    lh = round(sz * 1.21)
    # +34 sebelum garis emas: descender 'g' turun jauh; kalau mepet, garisnya
    # terbaca seperti underline yang salah.
    tinggi = 48 + lh * len(baris) + 34 + 5 + 34 + 30
    y = (H - tinggi) // 2

    teks_spasi(d, (X, y), args.eyebrow, f_eye, GOLD, tracking=4.5)
    y += 48
    for b in baris:
        d.text((X, y), b, font=f_judul, fill=PUTIH)
        y += lh
    y += 34
    d.rectangle([X, y, X + 90, y + 5], fill=GOLD)
    y += 34
    d.text((X, y), args.sub, font=f_sub, fill=ABU)

    d.rectangle([0, H - 7, W, H], fill=GOLD)   # meniru border-top footer situs

    out = pathlib.Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    kanvas.save(out, "JPEG", quality=90, optimize=True, progressive=True)
    kb = out.stat().st_size / 1024
    print(f"  {out.name}  {W}x{H}  {kb:.1f} KB"
          f"  {'OK' if kb < 300 else '! >300 KB, preview WhatsApp bisa lambat'}")

    pra = out.with_name(out.stem + "-pratinjau-260.png")
    kanvas.resize((260, round(260 * H / W)), Image.LANCZOS).save(pra)
    print(f"  pratinjau 260px: {pra.name}  <- PERIKSA INI sebelum commit")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--foto", help="path foto; lanskap sisi panjang >= 1600 px paling ideal")
    p.add_argument("--layout", choices=["grafis", "penuh", "split"],
                   help="paksa tata letak (default: otomatis dari rasio foto)")
    p.add_argument("--anchor", type=float, default=0.0,
                   help="bias potongan vertikal 0=atas .. 1=bawah (default: 0)")
    p.add_argument("--judul", default="Grooming Kucing|Tangerang",
                   help="judul; pisahkan baris dengan | (default: %(default)s)")
    p.add_argument("--eyebrow", default="CENTRAL CAT'S")
    p.add_argument("--sub", default="Pasar Kemis  ·  Rajeg")
    p.add_argument("--out", default=str(KELUAR))
    buat(p.parse_args())
