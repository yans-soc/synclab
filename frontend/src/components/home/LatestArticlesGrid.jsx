import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import SectionHeader from './SectionHeader.jsx';
import { ArticleCard } from './ArticleCard.jsx';

export default function LatestArticlesGrid({ settings, initialData = null }) {
  const [articles, setArticles] = useState(initialData || []);
  const count = settings.display_count || 6;

  useEffect(() => {
    if (initialData) return; // data already came from the composite homepage endpoint
    api
      .get(`/articles?limit=${count}`)
      .then((r) => setArticles(r.data || []))
      .catch(() => {});
  }, [count, initialData]);

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          title={settings.section_title}
          link="/articles"
          linkText={settings.link_text}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} {...a} />
          ))}
        </div>
      </div>
    </section>
  );
}
