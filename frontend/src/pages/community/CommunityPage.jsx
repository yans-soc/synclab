import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import ThreadCard from '../../components/community/ThreadCard.jsx';
import SectionHeader from '../../components/home/SectionHeader.jsx';

// Community landing: categories grid + trending + latest discussions.
// Cards display counts but never increment them.
export default function CommunityPage() {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Three parallel requests at mount; no waterfall per section.
    Promise.all([
      api.get('/threads/categories').catch(() => ({ data: [] })),
      api.get('/threads/trending?limit=5').catch(() => ({ data: [] })),
      api.get('/threads?sort=latest&limit=8').catch(() => ({ data: [] })),
    ]).then(([c, t, l]) => {
      setCategories(c.data || []);
      setTrending(t.data || []);
      setLatest(l.data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    document.title = 'Community - SYNCLAB';
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Discussion Hub
            </p>
            <h1 className="font-headline text-3xl font-extrabold text-slate-900 dark:text-white">
              Community
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Ask questions, share experience, and learn from other builders.
            </p>
          </div>
          <Link
            to="/community/new"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Thread
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
          </div>
        ) : (
          <>
            {categories.length > 0 && (
              <section className="mb-12">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/community/category/${c.slug}`}
                      className="group rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 transition hover:border-primary/40 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span className="material-symbols-outlined text-2xl text-primary">
                        {c.icon || 'forum'}
                      </span>
                      <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-primary dark:text-white">
                        {c.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{c.description}</p>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        {c.thread_count} thread{c.thread_count === 1 ? '' : 's'}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {trending.length > 0 && (
              <section className="mb-12">
                <SectionHeader
                  subtitle="Hot right now"
                  title="Trending Discussions"
                  link="/community?sort=trending"
                />
                <div className="space-y-3">
                  {trending.map((t) => (
                    <ThreadCard key={t.id} thread={t} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionHeader
                subtitle="Fresh topics"
                title="Latest Discussions"
              />
              <div className="space-y-3">
                {latest.length > 0 ? (
                  latest.map((t) => <ThreadCard key={t.id} thread={t} />)
                ) : (
                  <p className="rounded-2xl border border-dashed border-surface-container py-12 text-center text-sm text-slate-500 dark:border-slate-700">
                    No threads yet. Start the first discussion!
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
