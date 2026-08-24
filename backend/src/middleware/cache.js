import { ambilCache, simpanCache, invalidasiKontenPublik } from '../utils/invalidasi.js';

// Cache in-memory untuk GET publik; dibersihkan otomatis saat ada mutasi admin.
// Header Cache-Control diset agar respons juga aman di-cache CDN/browser.
//
// Strategi per kategori:
// - Daftar/statik publik : public, max-age=60, s-maxage=300, stale-while-revalidate=600
// - Populer              : publik tapi singkat (urutan mendekati realtime)
// - Detail artikel       : no-store — respons membawa token kunjungan per-pengunjung
// - Admin/auth           : private, no-store (diset di middleware adminTanpaCache)
const TANPA_CACHE = /^\/api\/v1\/artikel\/(?!trending[/?])[^/?]+/;
const HEADER_PUBLIK = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';
const HEADER_POPULER = 'public, max-age=15, s-maxage=30, stale-while-revalidate=60';
const HEADER_TRENDING = 'public, max-age=30, s-maxage=60, stale-while-revalidate=120';
const TTL_TRENDING_MS = 60_000;

export function cachePublik(req, res, next) {
  if (req.method !== 'GET') return next();
  if (TANPA_CACHE.test(req.originalUrl)) {
    // Detail artikel: jangan di-cache di lapisan mana pun
    // (token kunjungan bersifat per-pengunjung).
    res.set('Cache-Control', 'no-store');
    return next();
  }
  if (req.originalUrl.includes('urutkan=populer')) {
    res.set('Cache-Control', HEADER_POPULER);
    return next();
  }
  // Trending & beranda komposit di-cache singkat (60 detik) di aplikasi +
  // header CDN singkat: agregasi tidak dihitung ulang di setiap request,
  // namun urutan/counter tetap mendekati realtime dan tak pernah divergen permanen.
  const trending = /^\/api\/v1\/artikel\/trending/.test(req.originalUrl);
  const komposit = req.originalUrl.includes('lengkap=1');
  const ttl = trending || komposit ? TTL_TRENDING_MS : null;
  res.set('Cache-Control', trending ? HEADER_TRENDING : HEADER_PUBLIK);
  const kunci = req.originalUrl;
  const entri = ambilCache(kunci);
  if (entri) {
    res.set('X-Cache', 'HIT');
    return res.status(entri.status).json(entri.body);
  }
  const jsonAsli = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400) {
      simpanCache(kunci, { status: res.statusCode, body }, ttl);
      res.set('X-Cache', 'MISS');
    }
    return jsonAsli(body);
  };
  next();
}

export function adminTanpaCache(req, res, next) {
  res.set('Cache-Control', 'private, no-store');
  next();
}

export function invalidasiCache(req, res, next) {
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode < 400) {
      invalidasiKontenPublik();
    }
  });
  next();
}
