import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';

const STATUS_LABELS = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  published: 'bg-secondary/10 text-secondary',
  archived: 'bg-tertiary/10 text-tertiary',
};

export default function ArticleAdminPage() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    const q = new URLSearchParams({ page: String(page), limit: '10' });
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    const r = await api.get(`/admin/articles?${q}`);
    setData(r.data || []);
    setMeta(r.meta);
  }

  useEffect(() => {
    load().catch(() => {});
  }, [page, status]);

  async function remove(id) {
    if (!window.confirm('Delete this article permanently?')) return;
    await api.del(`/admin/articles/${id}`);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
          Article
        </h1>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Article
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-slate-400">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
            placeholder="Search title..."
            className="rounded-lg border border-surface-container-high bg-surface-container-lowest py-2 pl-10 pr-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-surface-container-high bg-surface-container-lowest px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-container-high text-xs uppercase text-slate-400 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="hidden px-5 py-3 md:table-cell">Category</th>
              <th className="hidden px-5 py-3 md:table-cell">Views</th>
              <th className="hidden px-5 py-3 md:table-cell">Updated</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-b border-surface-container last:border-0 dark:border-slate-800">
                <td className="px-5 py-3">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{a.title}</p>
                  <p className="text-xs text-slate-400">/{a.slug}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_LABELS[a.status]}`}>
                    {a.status === 'draft' ? 'Draft' : a.status === 'published' ? 'Published' : 'Archived'}
                  </span>
                </td>
                <td className="hidden px-5 py-3 text-slate-500 md:table-cell">
                  {a.categories.map((k) => k.name).join(', ') || '-'}
                </td>
                <td className="hidden px-5 py-3 md:table-cell">
                  <span className="flex items-center gap-1 text-slate-500" title={`${a.view_count ?? 0} views`}>
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    {(a.view_count ?? 0).toLocaleString('en-US')}
                  </span>
                </td>
                <td className="hidden px-5 py-3 text-slate-500 md:table-cell">
                  {formatDate(a.updated_at)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`/admin/articles/${a.id}`}
                    className="mr-1 inline-flex rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </Link>
                  <button
                    onClick={() => remove(a.id)}
                    className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  No articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((h) => h - 1)}
            className="rounded-lg border border-surface-container-high px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
          >
            Previous
          </button>
          <span className="text-slate-500">
            {meta.page} / {meta.total_pages}
          </span>
          <button
            disabled={page >= meta.total_pages}
            onClick={() => setPage((h) => h + 1)}
            className="rounded-lg border border-surface-container-high px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
