// Public content cache invalidation abstraction.
// Today: clears the app in-memory cache.
// Later, when a CDN is active: set env CDN_PURGE_HOOK (URL endpoint purge internal)
// or extend purgeCdn() to call the CDN provider purge API.
// The app does NOT depend on a CDN — this hook is optional and fail-safe.
const cache = new Map();

const CDN_PURGE_HOOK = process.env.CDN_PURGE_HOOK || '';

async function purgeCdn(relatedPaths) {
  if (!CDN_PURGE_HOOK) return;
  try {
    await fetch(CDN_PURGE_HOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: relatedPaths }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // A CDN purge failure must not disrupt the app response.
  }
}

// Called after content mutations (publish/update/remove articles, categories, etc).
export function invalidatePublicContent(relatedPaths = []) {
  cache.clear();
  purgeCdn(['/', '/articles', ...relatedPaths]);
}

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry;
}

export function setCache(key, entry, ttlMs = null) {
  // Cap the size so the cache never grows unbounded in memory.
  if (cache.size > 500) cache.clear();
  cache.set(key, { ...entry, expiresAt: ttlMs ? Date.now() + ttlMs : null });
}
