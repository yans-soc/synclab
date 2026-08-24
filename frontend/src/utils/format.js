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
