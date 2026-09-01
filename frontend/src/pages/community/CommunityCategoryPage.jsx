import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import ThreadCard from '../../components/community/ThreadCard.jsx';

// Topic colors mirror the homepage Explore Topics palette; cycled per index.
const TOPIC_COLORS = ['primary', 'secondary', 'tertiary', 'ai-purple'];
const colorClasses = {
  primary: 'text-primary bg-primary/10 border-primary/20',
  secondary: 'text-secondary bg-secondary/10 border-secondary/20',
  tertiary: 'text-tertiary bg-tertiary/10 border-tertiary/20',
  'ai-purple': 'text-ai-purple bg-ai-purple/10 border-ai-purple/20',
};

const SORTS = [
  { key: 'latest', label: 'Latest' },
  { key: 'trending', label: 'Trending' },
  { key: 'popular', label: 'Most Viewed' },
];

// Threads filtered by one community category, paginated.
export default function CommunityCategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/threads/categories')
      .then((r) => {
        const found = (r.data || []).find((c) => c.slug === slug);
        if (found) setCategory(found);
      })
      .catch(() => {});
  }, [slug]);

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
    document.title = `${category?.name || slug} - Community - SYNCLAB`;
  }, [slug, category]);

  const totalPages = Math.ceil(total / 15);
  const colorClass = colorClasses[TOPIC_COLORS[(category?.position ?? 1) % TOPIC_COLORS.length]] || colorClasses.primary;
 // NOTE: category index-based color; keep in sync with CommunityPage topic chips.

  return (
    <AppLayout>
      {/* Compact atmospheric hero — same language as community/page home */}
      <section className="relative overflow-hidden bg-surface-container-lowest dark:bg-slate-950">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-0 h-56 w-56 rounded-full bg-ai-purple/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
          <Link
            to="/community"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Community
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${colorClass}`}
            >
              <span className="material-symbols-outlined text-2xl">{category?.icon || 'forum'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Category
              </p>
              <h1 className="mt-0.5 font-headline text-2xl font-extrabold capitalize leading-tight text-slate-900 dark:text-white sm:text-3xl">
                {category?.name || slug.replaceAll('-', ' ')}
              </h1>
              {category?.description && (
                <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                  {category.description}
                </p>
              )}
            </div>
            <div className="ml-auto hidden items-center gap-2 sm:flex">
              <span className="rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {total} thread{total === 1 ? '' : 's'}
              </span>
              <Link
                to="/community/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                New Thread
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Sort controls + mobile CTA row */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-1 dark:border-slate-800 dark:bg-slate-900">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                className={`rounded-xl px-3.5 py-1.5 text-sm font-semibold transition ${
                  sort === s.key
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-slate-600 hover:bg-surface-container hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <span className="rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {total} thread{total === 1 ? '' : 's'}
            </span>
            <Link
              to="/community/new"
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              New
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
          </div>
        ) : threads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-surface-container bg-surface-container-lowest/50 py-20 text-center dark:border-slate-700 dark:bg-slate-900/30">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
              forum
            </span>
            <p className="mt-3 font-headline text-lg font-bold text-slate-700 dark:text-slate-200">
              No threads in this category yet.

            </p>
            <p className="mt-1 text-sm text-slate-500">
              Be the first to start a discussion..
            </p>
            <Link
              to="/community/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-700"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Start a Thread
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {threads.map((t) => (
                <ThreadCard key={t.id} thread={t} showCategory={false} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center gap-1 rounded-xl border border-surface-container px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-surface-container disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                  Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = totalPages <= 5 ? 0 : page <=  3 ? 0 : page >= totalPages - 2 ? totalPages -  5 : page -  2;
                  const n = start + i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`min-w-9 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        n === page
                          ? 'bg-primary text-white shadow-sm shadow-primary/25'
                          : 'text-slate-600 hover:bg-surface-container dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center gap-1 rounded-xl border border-surface-container px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-surface-container disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
                >
                  Next
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}