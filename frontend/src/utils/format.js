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

export function formatAngka(n) {
  const nilai = Number(n) || 0;
  if (nilai >= 1000000) return `${(nilai / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
  if (nilai >= 1000) return `${(nilai / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} rb`;
  return nilai.toLocaleString('id-ID');
}
