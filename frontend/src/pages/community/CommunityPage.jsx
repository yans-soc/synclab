import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import ThreadCard from '../../components/community/ThreadCard.jsx';
import SectionHeader from '../../components/home/SectionHeader.jsx';

// Rotated through topic chips so the palette mirrors the homepage's
// Explore Topics palette (community categories carry no color field).
const TOPIC_COLORS = ['primary', 'secondary', 'tertiary', 'ai-purple'];

// Community landing: hero (Google Stitch-inspired, with quick stats) + topic
// chips + trending grid + latest grid. Cards display counts, never increment them.
export default function CommunityPage() {
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [totalThreads, setTotalThreads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Three parallel requests at mount; no waterfall per section.

    Promise.all([
      api.get('/threads/categories').catch(() => ({ data: [] })),
      api.get('/threads/trending?limit=5').catch(() => ({ data: [] })),
      api.get('/threads?sort=latest&limit=8').catch(() => ({ data: [], meta: { total: 0 } })),
    ]).then(([c, t, l]) => {
      setCategories(c.data || []);
      setTrending(t.data || []);
      const latestData = l.data || [];
      setLatest(latestData);
      setTotalThreads(l.meta?.total ?? latestData.length);
      setLoading(false);
    });
   }, []);

  useEffect(() => {
    document.title = 'Community - SYNCLAB';
   }, []);

  return (
    <AppLayout>
      {/* Hero — clean Google Stitch-inspired, left-aligned with stats */}
      <section className="relative overflow-hidden bg-surface-container-lowest dark:bg-slate-950">
        <div
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-ai-purple/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="fadein-blur inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <span className="material-symbols-outlined text-sm">forum</span>
                Discussion Hub
              </p>
              <h1 className="fadein-blur mt-4 font-headline text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
                Community
              </h1>
              <p className="fadein-blur mt-3 max-w-xl text-base leading-relaxed text-slate-500 dark:text-slate-400 md:text-lg">
                Ask questions, share experience, and learn from other builders..
              </p>
              <div className="fadein-blur mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/community/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-700"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  New Thread
                </Link>
                <a
                  href="/community#latest"
                  className="inline-flex items-center gap-2 rounded-xl border border-surface-container-high bg-surface-container-lowest px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-surface-container dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  Browse Discussions
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
              <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="font-headline text-2xl font-extrabold text-primary">
                  {trending.length || '–'}
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Hot Threads
                </p>
              </div>
              <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="font-headline text-2xl font-extrabold text-secondary">
                  {categories.length || '–'}
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Topics
                </p>
              </div>
              <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="font-headline text-2xl font-extrabold text-tertiary">
                  {totalThreads}
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Threads
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {categories.length > 0 && (
            <section className="mb-12">
              <SectionHeader subtitle="Browse by topic" title="Explore Topics" />
              <div className="flex flex-wrap gap-2">
                {categories.map((c, i) => {
                  const color = TOPIC_COLORS[i % TOPIC_COLORS.length];
                  const colorClass = {
                    primary: 'bg-primary/10 text-primary border-primary/20',
                    secondary: 'bg-secondary/10 text-secondary border-secondary/20',
                    tertiary: 'bg-tertiary/10 text-tertiary border-tertiary/20',
                    'ai-purple': 'bg-ai-purple/10 text-ai-purple border-ai-purple/20',
                  }[color];
                  return (
                    <Link
                      key={c.id}
                      to={`/community/category/${c.slug}`}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition hover:scale-105 hover:shadow-md ${colorClass}`}
                    >
                      <span className="material-symbols-outlined text-base">{c.icon || 'forum'}</span>
                      {c.name}
                    </Link>
                  );
                })}
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
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {trending.map((t) => (
                  <ThreadCard key={t.id} thread={t} />
                ))}
              </div>
            </section>
          )}

          <section id="latest">
            <SectionHeader subtitle="Fresh topics" title="Latest Discussions" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {latest.length > 0 ? (
                latest.map((t) => <ThreadCard key={t.id} thread={t} />)
              ) : (
                <p className="rounded-3xl border border-dashed border-surface-container py-12 text-center text-sm text-slate-500 dark:border-slate-700 lg:col-span-2">
                  No threads yet.. Start the first discussion!
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  );
}