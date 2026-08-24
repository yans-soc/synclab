// Abstraksi URL media yang siap CDN.
// - VITE_MEDIA_URL: origin penyaji media (kosong = origin yang sama).
//   Saat CDN aktif cukup set VITE_MEDIA_URL=https://cdn.example.com tanpa
//   mengubah kode aplikasi.
// - Berkas unggahan (/uploads/...): varian webp dibuat backend saat unggah
//   dengan konvensi <nama>-w<lebar>.webp; helper memilih ukuran terdekat.
// - URL eksternal (Unsplash dsb.): parameter resize/format disisipkan bila
//   penyedia mendukung.
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_URL || '').replace(/\/$/, '');

const LEBAR_VARIAN = { thumbnail: 400, small: 800, medium: 1280, large: 1920 };

export function urlMedia(url, ukuran = 'small') {
  if (!url) return '';
  const lebar = LEBAR_VARIAN[ukuran] ?? LEBAR_VARIAN.small;

  if (url.startsWith('/uploads/')) {
    const cocok = url.match(/^(\/uploads\/.+)\.(jpe?g|png|webp|avif|gif)$/i);
    if (cocok) return `${MEDIA_BASE}${cocok[1]}-w${lebar}.webp`;
    return `${MEDIA_BASE}${url}`;
  }

  if (/^https?:\/\/images\.unsplash\.com\//.test(url)) {
    const pemisah = url.includes('?') ? '&' : '?';
    return `${url}${pemisah}auto=format&fit=crop&w=${lebar}&q=75`;
  }

  return url;
}

// URL asli/original (mis. untuk pratinjau penuh atau unduhan).
export function urlMediaAsli(url) {
  if (!url) return '';
  return url.startsWith('/uploads/') ? `${MEDIA_BASE}${url}` : url;
}
