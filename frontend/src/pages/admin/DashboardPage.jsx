import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export default function DashboardPage() {
  const [stat, setStatss] = useState({ article: 0, category: 0, media: 0, views: 0 });

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/articles?limit=50'),
      api.get('/categories'),
      api.get('/admin/media'),
    ]).then(([a, k, m]) => {
      // Total views are summed from each article authoritative counter (same source)
      const articleList = a.status === 'fulfilled' ? a.value.data ?? [] : [];
      setStatss({
        article: a.status === 'fulfilled' ? a.value.meta?.total_itemss ?? 0 : 0,
        category: k.status === 'fulfilled' ? k.value.data?.length ?? 0 : 0,
        media: m.status === 'fulfilled' ? m.value.data?.length ?? 0 : 0,
        views: articleList.reduce((t, x) => t + (x.view_count ?? 0), 0),
      });
    });
  }, []);

  const cards = [
    { label: 'Total Articles', value: stat.article, icon: 'article', color: 'text-primary bg-primary/10' },
    { label: 'Categories', value: stat.category, icon: 'category', color: 'text-secondary bg-secondary/10' },
    { label: 'Media', value: stat.media, icon: 'perm_media', color: 'text-ai-purple bg-ai-purple/10' },
    { label: 'Total Views', value: stat.views, icon: 'visibility', color: 'text-primary bg-primary/10' },
  ];

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Dashboard
      </h1>
      <div className="grid gap-4 sm:grid-cols-4">
        {cards.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <span className={`inline-flex rounded-xl p-2.5 ${k.color}`}>
              <span className="material-symbols-outlined">{k.icon}</span>
            </span>
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">{k.value}</p>
            <p className="text-sm text-slate-500">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Article
          </Link>
          <Link
            to="/admin/homepage"
            className="inline-flex items-center gap-2 rounded-lg border border-surface-container-high px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            <span className="material-symbols-outlined text-base">home_app_logo</span>
            Manage Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
