// Abstraksi invalidasi cache konten publik.
// Hari ini: membersihkan cache in-memory aplikasi.
// Nanti saat CDN aktif: set env CDN_PURGE_HOOK (URL endpoint purge internal)
// atau perluas fungsi purgiCdn() untuk memanggil API purge milik provider CDN.
// Aplikasi TIDAK bergantung pada CDN — hook ini opsional dan gagal-aman.
const cache = new Map();

const CDN_PURGE_HOOK = process.env.CDN_PURGE_HOOK || '';

async function purgiCdn(jalurTerkait) {
  if (!CDN_PURGE_HOOK) return;
  try {
    await fetch(CDN_PURGE_HOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jalur: jalurTerkait }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Kegagalan purge CDN tidak boleh mengganggu respons aplikasi.
  }
}

// Dipanggil setelah mutasi konten (terbit/ubah/hapus artikel, kategori, dll).
export function invalidasiKontenPublik(jalurTerkait = []) {
  cache.clear();
  purgiCdn(['/', '/artikel', ...jalurTerkait]);
}

export function ambilCache(kunci) {
  const entri = cache.get(kunci);
  if (!entri) return null;
  if (entri.kedaluwarsa && entri.kedaluwarsa < Date.now()) {
    cache.delete(kunci);
    return null;
  }
  return entri;
}

export function simpanCache(kunci, entri, ttlMs = null) {
  // Batasi ukuran agar tidak ada cache tanpa kontrol di memori.
  if (cache.size > 500) cache.clear();
  cache.set(kunci, { ...entri, kedaluwarsa: ttlMs ? Date.now() + ttlMs : null });
}
