import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import HeroSection from './HeroSection.jsx';
import CategoryExplorer from './CategoryExplorer.jsx';
import LatestArticlesGrid from './LatestArticlesGrid.jsx';
import TrendingArticlesGrid from './TrendingArticlesGrid.jsx';
import CallToActionBanner from './CallToActionBanner.jsx';

const COMPONENT_MAP = {
  hero_section: HeroSection,
  explore_topics: CategoryExplorer,
  trending_articles: TrendingArticlesGrid,
  latest_articles: LatestArticlesGrid,
  cta_banner: CallToActionBanner,
};

export default function LandingPageBuilder() {
  const [homepage, setHomepage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // One composite request: structure + section data together (no waterfall).
    api
      .get('/homepage/active?full=1')
      .then((r) => setHomepage(r.data))
      .catch(() => setHomepage(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">
          progress_activity
        </span>
      </div>
    );
  }

  if (!homepage) {
    return (
      <div className="py-24 text-center text-slate-500">
        No homepage has been published yet.
      </div>
    );
  }

  return (
    <>
      {homepage.sections.map((section) => {
        const Component = COMPONENT_MAP[section.type];
        if (!Component) return null;
        const initialData =
          section.type === 'explore_topics'
            ? homepage.data?.categories
            : section.type === 'latest_articles'
              ? homepage.data?.latest_articles
              : section.type === 'trending_articles'
                ? homepage.data?.trending
                : null;
        return <Component key={section.id} settings={section.settings} initialData={initialData} />;
      })}
    </>
  );
}
