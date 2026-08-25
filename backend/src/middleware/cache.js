import { getCache, setCache, invalidatePublicContent } from '../utils/cache.js';

// In-memory cache for public GET requests; cleared automatically on admin mutations.
// Cache-Control headers are set so responses are also safe to cache in a CDN/browser.
//
// Strategy per category:
// - Public lists/static : public, max-age=60, s-maxage=300, stale-while-revalidate=600
// - Popular              : public but short-lived (ordering stays near-realtime)
// - Article/thread detail : no-store — responses carry per-visitor view tokens
// - Admin/auth           : private, no-store (set in the adminNoCache middleware)
// Detail pages carry per-visitor view tokens and per-user flags: never cached.
// Threads listing, trending and categories are cacheable like other lists.
const NO_CACHE =
  /^\/api\/v1\/(articles\/(?!trending(?:[/?]|$))[^/?]+|threads\/(?!trending(?:[/?]|$)|categories(?:[/?]|$))[^/?]+)/;
const HEADER_PUBLIC = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';
const HEADER_POPULAR = 'public, max-age=15, s-maxage=30, stale-while-revalidate=60';
const HEADER_TRENDING = 'public, max-age=30, s-maxage=60, stale-while-revalidate=120';
const TTL_TRENDING_MS = 60_000;

export function publicCache(req, res, next) {
  if (req.method !== 'GET') return next();
  if (NO_CACHE.test(req.originalUrl)) {
    // Article detail: do not cache at any layer
    // (visit tokens are per-visitor).
    res.set('Cache-Control', 'no-store');
    return next();
  }
  if (req.originalUrl.includes('sort=popular')) {
    res.set('Cache-Control', HEADER_POPULAR);
    return next();
  }
  // Trending & the composite homepage are cached briefly (60 seconds) in the app +
  // short CDN headers: the aggregation is not recomputed on every request,
  // yet ordering/counters stay near-realtime and never diverge permanently.
  const trending = /^\/api\/v1\/articles\/trending/.test(req.originalUrl);
  const komposit = req.originalUrl.includes('full=1');
  const ttl = trending || komposit ? TTL_TRENDING_MS : null;
  res.set('Cache-Control', trending ? HEADER_TRENDING : HEADER_PUBLIC);
  const key = req.originalUrl;
  const entry = getCache(key);
  if (entry) {
    res.set('X-Cache', 'HIT');
    return res.status(entry.status).json(entry.body);
  }
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode < 400) {
      setCache(key, { status: res.statusCode, body }, ttl);
      res.set('X-Cache', 'MISS');
    }
    return originalJson(body);
  };
  next();
}

export function adminNoCache(req, res, next) {
  res.set('Cache-Control', 'private, no-store');
  next();
}

export function invalidateCache(req, res, next) {
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode < 400) {
      invalidatePublicContent();
    }
  });
  next();
}
