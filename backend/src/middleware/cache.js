// Cache in-memory untuk GET publik; dibersihkan otomatis saat ada mutasi admin.
const cache = new Map();

export function cachePublik(req, res, next) {
  if (req.method !== 'GET') return next();
  const kunci = req.originalUrl;
  const entri = cache.get(kunci);
  if (entri) {
    res.set('X-Cache', 'HIT');
    return res.status(entri.status).json(entri.body);
  }
  const jsonAsli = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400) cache.set(kunci, { status: res.statusCode, body });
    return jsonAsli(body);
  };
  next();
}

export function invalidasiCache(req, res, next) {
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode < 400) {
      cache.clear();
    }
  });
  next();
}
