export default function SeoPanel({ nilai, ubah }) {
  const seo = nilai || {};
  const set = (kunci) => (e) => ubah({ ...seo, [kunci]: e.target.value });

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
        <span className="material-symbols-outlined text-xl text-primary">search</span>
        Metadata SEO
      </h3>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Judul SEO</label>
        <input
          value={seo.judul_seo || ''}
          onChange={set('judul_seo')}
          maxLength={150}
          className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Deskripsi SEO</label>
        <textarea
          value={seo.deskripsi_seo || ''}
          onChange={set('deskripsi_seo')}
          rows={3}
          className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-500">Kata Kunci</label>
        <input
          value={seo.kata_kunci || ''}
          onChange={set('kata_kunci')}
          placeholder="pisahkan dengan koma"
          className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
        />
      </div>
    </div>
  );
}
