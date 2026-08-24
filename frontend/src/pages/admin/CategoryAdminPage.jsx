import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const EMPTY = { name: '', slug: '', description: '', color: 'primary', icon: 'folder' };
const COLOR_CHOICES = ['primary', 'secondary', 'tertiary', 'ai-purple'];

export default function CategoryAdminPage() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    const r = await api.get('/categories');
    setData(r.data || []);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function save(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') };
    try {
      if (editId) {
        await api.put(`/admin/categories/${editId}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
      setForm(EMPTY);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  function mulaiEdit(k) {
    setEditId(k.id);
    setForm({ name: k.name, slug: k.slug, description: k.description || '', color: k.color, icon: k.icon || 'folder' });
  }

  async function remove(id) {
    if (!window.confirm('Delete this category? Related articles will not be deleted.')) return;
    await api.del(`/admin/categories/${id}`);
    await load();
  }

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Categories
      </h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest dark:border-slate-800 dark:bg-slate-950">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-container-high text-xs uppercase text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Articles</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((k) => (
                  <tr key={k.id} className="border-b border-surface-container last:border-0 dark:border-slate-800">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <span className="material-symbols-outlined text-lg">{k.icon || 'folder'}</span>
                        {k.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{k.slug}</td>
                    <td className="px-5 py-3 text-slate-500">{k.article_count ?? 0}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => mulaiEdit(k)} className="mr-1 inline-flex rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary" title="Edit">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => remove(k.id)} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" title="Delete">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form
          onSubmit={save}
          className="h-fit rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950"
        >
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
            {editId ? 'Edit Category' : 'New Category'}
          </h2>
          <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="auto from name"
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Color</label>
          <div className="mb-3 flex gap-2">
            {COLOR_CHOICES.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: w }))}
                className={`h-8 w-8 rounded-full border-2 bg-${w} ${
                  form.color === w ? 'border-slate-800 dark:border-white' : 'border-transparent'
                }`}
                title={w}
              />
            ))}
          </div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Icon (Material Symbols)</label>
          <input
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            className="mb-4 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-700">
              {editId ? 'Update' : 'Add'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm(EMPTY); }}
                className="rounded-lg border border-surface-container-high px-4 py-2 text-sm text-slate-500 dark:border-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
