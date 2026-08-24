import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import SectionHeader from './SectionHeader.jsx';

const colorMap = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  tertiary: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  'ai-purple': 'bg-ai-purple/10 text-ai-purple border-ai-purple/20',
};

export function CategoryCard({ name, slug, description, color, icon }) {
  const colorClass = colorMap[color] || colorMap.primary;
  return (
    <Link
      to={`/category/${slug}`}
      className={`group rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-lg ${colorClass} dark:bg-opacity-5`}
    >
      <span className="material-symbols-outlined text-3xl">{icon || 'folder'}</span>
      <h3 className="mt-4 font-headline text-lg font-bold text-slate-900 dark:text-white">
        {name}
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </Link>
  );
}

export default function CategoryExplorer({ settings, initialData = null }) {
  const [categories, setCategories] = useState(initialData || []);

  useEffect(() => {
    if (initialData) return; // data already came from the composite homepage endpoint
    api.get('/categories').then((r) => setCategories(r.data || [])).catch(() => {});
  }, [initialData]);

  return (
    <section className="bg-surface-container-low py-10 dark:bg-slate-900 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          subtitle={settings.subtitle}
          title={settings.section_title}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {categories.map((k) => (
            <CategoryCard key={k.id} {...k} />
          ))}
        </div>
      </div>
    </section>
  );
}
