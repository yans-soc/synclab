import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import AppLayout from '../../components/layout/AppLayout.jsx';
import ThreadCard from '../../components/community/ThreadCard.jsx';
import SectionHeader from '../../components/home/SectionHeader.jsx';
import { CategoryCard } from '../../components/home/CategoryExplorer.jsx';

// Rotated through topic cards so the grid mirrors the homepage's
// Explore Topics palette (community categories carry no color field).
const TOPIC_COLORS = ['primary', 'secondary', 'tertiary', 'ai-purple'];

// Community landing: hero + topics grid (homepage style) + trending + latest.
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
      {/* Hero — same atmospheric language as the homepage hero */}
      <section className="relative overflow-hidden bg-surface-container-lowest dark:bg-slate-950">
        <div
          className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-ai-purple/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-20">
          <p className="fadein-blur text-xs font-semibold uppercase tracking-widest text-primary sm:text-sm">
            Discussion Hub
          </p>
          <h1 className="fadein-blur mx-auto mt-3 max-w-2xl font-headline text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl">
            Community
          </h1>
          <p className="fadein-blur mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 md:text-lg">
            Ask questions, share experience, and learn from other builders.
          </p>
          <Link
            to="/community/new"
            className="fadein-blur mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-700"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Thread
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">
            progress_activity
          </span>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {categories.length > 0 && (
            <section className="mb-14">
              <SectionHeader subtitle="Browse by topic" title="Explore Topics" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                {categories.map((c, i) => (
                  <CategoryCard
                    key={c.id}
                    name={c.name}
                    slug={c.slug}
                    description={c.description}
                    icon={c.icon || 'forum'}
                    color={TOPIC_COLORS[i % TOPIC_COLORS.length]}
                    to={`/community/category/${c.slug}`}
                    meta={`${c.thread_count} thread${c.thread_count === 1 ? '' : 's'}`}
                  />
                ))}
              </div>
            </section>
          )}

          {trending.length > 0 && (
            <section className="mb-14">
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
            <SectionHeader subtitle="Fresh topics" title="Latest Discussions" />
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
        </div>
      )}
    </AppLayout>
  );
}
