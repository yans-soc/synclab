export function makeSlug(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export default function SlugEditor({ value, onChange, fromTitle }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">Slug</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(makeSlug(e.target.value))}
          className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-primary dark:border-slate-700"
        />
        <button
          type="button"
          onClick={() => onChange(makeSlug(fromTitle))}
          className="shrink-0 rounded-lg border border-surface-container-high px-3 text-xs font-semibold text-slate-500 hover:text-primary dark:border-slate-700"
          title="Generate slug from title"
        >
          From Title
        </button>
      </div>
    </div>
  );
}
