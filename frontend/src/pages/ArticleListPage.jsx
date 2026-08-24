import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import SectionHeader from '../components/home/SectionHeader.jsx';
import { ArticleCard } from '../components/home/ArticleCard.jsx';

export default function ArticleListPage() {
  const [articles, setArticles] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [params] = useSearchParams();
  const sort = params.get('sort') === 'popular' ? 'popular' : null;

  useEffect(() => {
    setPage(1);
  }, [sort]);

  useEffect(() => {
    const q = new URLSearchParams({ page, limit: 9 });
    if (sort) q.set('sort', sort);
    api
      .get(`/articles?${q}`)
      .then((r) => {
        setArticles(r.data || []);
        setMeta(r.meta);
      })
      .catch(() => {});
  }, [page, sort]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        <SectionHeader
          title={sort ? 'Most Popular Articles' : 'All Articles'}
          subtitle={sort ? 'Most Read' : 'Content Catalog'}
        />
        {articles.length === 0 ? (
          <p className="py-16 text-center text-slate-500">No articles published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} {...a} />
            ))}
          </div>
        )}
        {meta && meta.total_pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((h) => h - 1)}
              className="rounded-lg border border-surface-container-high px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {meta.page} of {meta.total_pages}
            </span>
            <button
              disabled={page >= meta.total_pages}
              onClick={() => setPage((h) => h + 1)}
              className="rounded-lg border border-surface-container-high px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
