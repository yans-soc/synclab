export default function SeoPanel({ value, onChange }) {
  const seo = value || {};
  const set = (key) => (e) => onChange({ ...seo, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <span className="material-symbols-outlined text-xl text-primary">search</span>
        Metadata SEO
      </h3>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">SEO Title</label>
        <input
          value={seo.seo_title || ''}
          onChange={set('seo_title')}
          maxLength={150}
          className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">SEO Description</label>
        <textarea
          value={seo.seo_description || ''}
          onChange={set('seo_description')}
          rows={3}
          className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Keywords</label>
        <input
          value={seo.seo_keywords || ''}
          onChange={set('seo_keywords')}
          placeholder="separate with commas"
          className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
        />
      </div>
    </div>
  );
}
