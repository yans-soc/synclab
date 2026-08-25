import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import ThreadCard from '../../components/community/ThreadCard.jsx';

// Threads filtered by one community category, paginated.
export default function CommunityCategoryPage() {
  const { slug } = useParams();
  const [threads, setThreads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/threads?category=${slug}&sort=${sort}&page=${page}&limit=15`)
      .then((r) => {
        setThreads(r.data || []);
        setTotal(r.meta?.total || 0);
      })
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [slug, sort, page]);

  useEffect(() => {
    setPage(1);
    document.title = `${slug} - Community - SYNCLAB`;
  }, [slug]);

  const totalPages = Math.ceil(total / 15);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Category</p>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-headline text-2xl font-extrabold capitalize text-slate-900 dark:text-white">
            {slug.replaceAll('-', ' ')}
          </h1>
          <div className="flex gap-2">
            {['latest', 'trending', 'popular'].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  sort === s
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-slate-600 hover:bg-surface-container-high dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-container py-16 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500">No threads in this category yet.</p>
            <Link
              to="/community/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Start a Thread
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {threads.map((t) => (
                <ThreadCard key={t.id} thread={t} showCategory={false} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-surface-container px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-surface-container px-3 py-1.5 text-sm disabled:opacity-40 dark:border-slate-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
