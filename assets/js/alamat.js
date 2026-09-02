/* Alamat bertingkat: Provinsi -> Kota/Kab -> Kecamatan -> Kode Pos.
   Port dari komponen POS (components/AddressFields.tsx + lib/kodePos.ts) ke JS
   klasik, karena situs ini statis: nol build step, nol type="module".

   ATURAN KODE POS (jangan diringkas!) - kode pos Indonesia melekat pada
   KELURAHAN/DESA, bukan kecamatan. Karena itu nilainya bisa tiga rupa:
     string   -> tunggal (82,4% kecamatan) => boleh diisi OTOMATIS
     string[] -> bercabang => WAJIB dipilih orangnya, JANGAN ditebak
     null     -> tidak diketahui => biarkan kosong, JANGAN mengarang
   Menebak 1 dari 10 = menulis alamat salah yang tampak benar.

   Data kecamatan ~213 KB dan hanya diunduh saat kota/kab dipilih. Gagal unduh
   SENGAJA jatuh ke isian teks biasa supaya formulir tak pernah buntu. */
(function () {
  'use strict';

  var URL_WILAYAH = '/assets/data/wilayah.js';
  var URL_KECAMATAN = '/assets/data/wilayah-kecamatan.js';

  /* Muat <script> sekali saja; panggilan berikutnya memakai janji yang sama. */
  var cache = {};
  function muat(url) {
    if (cache[url]) return cache[url];
    cache[url] = new Promise(function (selesai, gagal) {
      var s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = function () { selesai(true); };
      s.onerror = function () { gagal(new Error('gagal memuat ' + url)); };
      document.head.appendChild(s);
    });
    return cache[url];
  }

  /* --- aturan murni (cermin lib/kodePos.ts di POS) ----------------------- */

  function daftarKodePos(kp) {
    if (!kp) return [];
    return Array.isArray(kp) ? kp.slice() : [kp];
  }

  /* Otomatis HANYA kalau tunggal. Bercabang => null, wajib dipilih. */
  function kodePosOtomatis(kp) {
    return (typeof kp === 'string' && kp) ? kp : null;
  }

  function kodePosKecamatan(nama, daftar) {
    for (var i = 0; i < daftar.length; i++) {
      if (daftar[i][0] === nama) return daftar[i][1];
    }
    return null;
  }

  function bersihkanKodePos(v) {
    var t = String(v == null ? '' : v).replace(/\D/g, '');
    return t.length === 5 ? t : null;
  }

  /* --- pemasangan -------------------------------------------------------- */

  function isiOpsi(sel, daftar, kosong) {
    sel.innerHTML = '';
    var o = document.createElement('option');
    o.value = '';
    o.textContent = kosong;
    sel.appendChild(o);
    daftar.forEach(function (nama) {
      var x = document.createElement('option');
      x.value = nama;
      x.textContent = nama;
      sel.appendChild(x);
    });
  }

  /* Kalau data tak bisa diunduh, kontrol pilih diganti isian teks. Nama field
     tetap sama supaya sisi server tak perlu tahu bedanya. Yang disembunyikan
     WAJIB di-disable - kalau tidak, FormData mengirim dua-duanya. */
  function jatuhKeTeks(root, sebab) {
    console.error('[alamat] ' + sebab + ' - beralih ke isian teks');
    ['provinsi', 'kota', 'kecamatan'].forEach(function (nama) {
      var sel = root.querySelector('select[data-alamat="' + nama + '"]');
      var inp = root.querySelector('input[data-alamat-teks="' + nama + '"]');
      if (!sel || !inp) return;
      sel.hidden = true; sel.disabled = true;
      inp.hidden = false; inp.disabled = false;
    });
  }

  function pasang(root) {
    var selProv = root.querySelector('select[data-alamat="provinsi"]');
    var selKota = root.querySelector('select[data-alamat="kota"]');
    var selKec = root.querySelector('select[data-alamat="kecamatan"]');
    var inpPos = root.querySelector('input[data-alamat="kode_pos"]');
    var selPos = root.querySelector('select[data-alamat="kode_pos_pilih"]');
    var ket = root.querySelector('[data-alamat-ket]');
    if (!selProv || !selKota) return;

    var daftarKec = null;

    function setKet(teks) {
      if (!ket) return;
      ket.textContent = teks || '';
      ket.hidden = !teks;
    }

    /* Kode pos punya DUA kontrol: input (umum) dan select (saat bercabang).
       Yang tak dipakai di-disable supaya tidak ikut terkirim. */
    function pakaiInputPos(nilai) {
      if (selPos) { selPos.hidden = true; selPos.disabled = true; selPos.innerHTML = ''; }
      if (!inpPos) return;
      inpPos.hidden = false; inpPos.disabled = false;
      if (nilai != null) inpPos.value = nilai;
    }

    function pakaiSelectPos(pilihan) {
      if (!selPos || !inpPos) return;
      inpPos.hidden = true; inpPos.disabled = true; inpPos.value = '';
      isiOpsi(selPos, pilihan, '— Pilih kode pos —');
      selPos.hidden = false; selPos.disabled = false;
    }

    function terapkanKodePos(namaKec) {
      if (!daftarKec || !namaKec) { pakaiInputPos(null); setKet(''); return; }
      var kp = kodePosKecamatan(namaKec, daftarKec);
      var pilihan = daftarKodePos(kp);

      if (pilihan.length > 1) {
        /* Bercabang: WAJIB dipilih. Menebak satu dari sekian = alamat salah
           yang tampak benar. */
        pakaiSelectPos(pilihan);
        setKet('Kecamatan ini punya ' + pilihan.length +
          ' kode pos (berbeda per kelurahan/desa) — pilih yang sesuai.');
        return;
      }

      var auto = kodePosOtomatis(kp);
      pakaiInputPos(auto != null ? auto : '');
      setKet(auto != null ? '' :
        'Kode pos kecamatan ini tidak ada di data kami — silakan isi sendiri.');
    }

    function isiKecamatan(kota) {
      if (!selKec) return;
      selKec.disabled = true;
      pakaiInputPos('');
      setKet('');
      if (!kota) { isiOpsi(selKec, [], '— Pilih kota/kabupaten dulu —'); return; }

      isiOpsi(selKec, [], '— Memuat… —');
      muat(URL_KECAMATAN).then(function () {
        var peta = window.CC_KECAMATAN || {};
        daftarKec = peta[kota] || [];
        isiOpsi(selKec, daftarKec.map(function (k) { return k[0]; }), '— Pilih Kecamatan —');
        selKec.disabled = false;
      }).catch(function (e) {
        daftarKec = null;
        jatuhKeTeks(root, e.message);
      });
    }

    selProv.addEventListener('change', function () {
      var prov = selProv.value;
      var data = window.CC_WILAYAH || [];
      var cocok = null;
      for (var i = 0; i < data.length; i++) {
        if (data[i].name === prov) { cocok = data[i]; break; }
      }
      isiOpsi(selKota, cocok ? cocok.cities : [],
        cocok ? '— Pilih Kota/Kabupaten —' : '— Pilih provinsi dulu —');
      selKota.disabled = !cocok;
      isiKecamatan('');
    });

    selKota.addEventListener('change', function () { isiKecamatan(selKota.value); });
    if (selKec) selKec.addEventListener('change', function () { terapkanKodePos(selKec.value); });

    if (inpPos) {
      inpPos.addEventListener('blur', function () {
        if (!inpPos.value) return;
        var b = bersihkanKodePos(inpPos.value);
        inpPos.value = (b == null) ? '' : b;
      });
    }

    /* Data provinsi (13 KB) baru diunduh saat formulirnya mendekat ke layar,
       supaya pengunjung yang cuma membaca halaman tidak ikut menanggungnya. */
    function siapkan() {
      muat(URL_WILAYAH).then(function () {
        var data = window.CC_WILAYAH || [];
        isiOpsi(selProv, data.map(function (p) { return p.name; }), '— Pilih Provinsi —');
        selProv.disabled = false;
        isiOpsi(selKota, [], '— Pilih provinsi dulu —');
      }).catch(function (e) { jatuhKeTeks(root, e.message); });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entri) {
        var terlihat = entri.some(function (e) { return e.isIntersecting; });
        if (terlihat) { io.disconnect(); siapkan(); }
      }, { rootMargin: '400px' });
      io.observe(root);
    } else {
      siapkan();
    }
  }

  window.CCAlamat = {
    pasang: pasang,
    daftarKodePos: daftarKodePos,
    kodePosOtomatis: kodePosOtomatis,
    kodePosKecamatan: kodePosKecamatan,
    bersihkanKodePos: bersihkanKodePos
  };
})();
