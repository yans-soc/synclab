import SectionHeader from '../home/SectionHeader.jsx';
import ThreadCard from './ThreadCard.jsx';

// Homepage section: trending community discussions. Cards display counters
// but never increment them.
export default function CommunityTrending({ settings, initialData }) {
  const threads = initialData || [];
  if (threads.length === 0) return null;
  return (
    <section className="bg-surface-container/50 py-12 dark:bg-slate-900/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          subtitle={settings?.subtitle || 'Community'}
          title={settings?.section_title || 'Trending Discussions'}
          link="/community"
          linkText={settings?.link_text || 'Visit Community'}
        />
        <div className="space-y-3">
          {threads.map((t) => (
            <ThreadCard key={t.id} thread={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
