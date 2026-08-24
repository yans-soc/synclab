export function hitungWaktuBaca(konten) {
  const kataPerMenit = 200;
  const jumlahKata = (konten || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(jumlahKata / kataPerMenit));
}

export function formatTanggal(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

// Satu-satunya formatter view count untuk seluruh frontend.
// 999 -> "999", 1250 -> "1.2K", 12840 -> "12.8K", 1200000 -> "1.2M"
export function formatViewCount(n) {
  const nilai = Number(n) || 0;
  if (nilai >= 1000000) return `${(nilai / 1000000).toFixed(1)}M`;
  if (nilai >= 1000) return `${(nilai / 1000).toFixed(1)}K`;
  return String(nilai);
}

export function formatAngka(n) {
  const nilai = Number(n) || 0;
  if (nilai >= 1000000) return `${(nilai / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (nilai >= 1000) return `${(nilai / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`;
  return nilai.toLocaleString('id-ID');
}
