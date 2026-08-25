import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';

const MIN_DURATION_SECONDS = 10;

// Validated view tracker: counts active seconds (page visible) then claims
// the view to the centralized validation service. Shared by article and
// thread detail pages — the resourceType binds to the server session.
// The page counter updates with the authoritative value returned by the
// server. Runs once per page load; the token is reused if the detail reloads.
export function useViewTracker(article, resourceType = 'post') {
  const [viewCount, setViewCount] = useState(Number(article?.view_count ?? 0));
  const claimed = useRef(false);
  const tokenRef = useRef(article?.visit_token || null);

  useEffect(() => {
    setViewCount(article?.view_count ?? 0);
    tokenRef.current = article?.visit_token || null;
    claimed.current = false;
  }, [article?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!article?.slug) return undefined;
    let activeSeconds = 0;
    let timer;
    const path =
      resourceType === 'thread'
        ? `/visits/thread/${article.slug}`
        : `/visits/${article.slug}`;

    const claim = () => {
      if (claimed.current || !tokenRef.current) return;
      claimed.current = true;
      clearInterval(timer);
      api
        .post(path, {
          token: tokenRef.current,
          duration_seconds: activeSeconds,
        })
        .then((r) => {
          if (typeof r.data?.view_count === 'number') {
            setViewCount(r.data.view_count);
          }
        })
        .catch(() => {});
    };

    timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      activeSeconds += 1;
      if (activeSeconds >= MIN_DURATION_SECONDS) claim();
    }, 1000);

    return () => clearInterval(timer);
  }, [article?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return viewCount;
}
