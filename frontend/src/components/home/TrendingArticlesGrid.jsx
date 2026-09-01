import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import SectionHeader from './SectionHeader.jsx';
import { ArticleCard } from './ArticleCard.jsx';

export default function TrendingArticlesGrid({ settings, initialData = null }) {
  const [articles, setArticles] = useState(initialData || []);
  const count = settings.display_count || 6;

  useEffect(() => {
    if (initialData) return; // data already came from the composite homepage endpoint
    api
      .get(`/articles/trending?limit=${count}`)
      .then((r) => setArticles(r.data || []))
      .catch(() => {});
  }, [count, initialData]);

  if (articles.length === 0) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          subtitle={settings.subtitle}
          title={settings.section_title}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a, i) => (
            <div key={a.id} className="relative">
              <span className="absolute -top-2.5 left-4 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
                #{i + 1}
              </span>
              <ArticleCard {...a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
