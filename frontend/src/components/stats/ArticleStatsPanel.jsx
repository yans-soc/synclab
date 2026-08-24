import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

// Per-article view stats from the same data source as the public site
// (valid article_visits + the authoritative article.view_count counter).
export default function ArticleStatsPanel({ articleId }) {
  const [stat, setStatss] = useState(null);

  useEffect(() => {
    if (!articleId) return undefined;
    api
      .get(`/visits/admin/${articleId}/stats`)
      .then((r) => setStatss(r.data))
      .catch(() => {});
    return undefined;
  }, [articleId]);

  if (!stat) return null;

  const metrics = [
    { label: 'Total Views', value: stat.total_view },
    { label: 'Unique Visitors', value: stat.unique_visitors },
    { label: 'Today', value: stat.views_today },
    { label: 'Last 7 Days', value: stat.views_7_days },
    { label: 'Last 30 Days', value: stat.views_30_days },
    { label: 'Popular Rank', value: `#${stat.popular_rank}` },
  ];
  const max = Math.max(...stat.daily.map((h) => h.view), 1);

  return (
    <section className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
        <span className="material-symbols-outlined text-base">monitoring</span>
        View Statistics
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-surface-container px-3 py-2.5 dark:bg-slate-900">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {typeof m.value === 'number' ? m.value.toLocaleString('en-US') : m.value}
            </p>
            <p className="text-xs text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
      {stat.daily.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-slate-400">Valid views per day (last 30 days)</p>
          <div className="flex h-20 items-end gap-1">
            {stat.daily.map((h) => (
              <div
                key={h.date}
                title={`${h.date}: ${h.view} view`}
                className="flex-1 rounded-t bg-primary/70"
                style={{ height: `${Math.max(6, (h.view / max) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
