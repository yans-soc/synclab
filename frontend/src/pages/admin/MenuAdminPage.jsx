import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const EMPTY = { label: '', url: '', position: 1, icon: '' };

export default function MenuAdminPage() {
  const [location, setLocation] = useState('header');
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const menu = menus.find((m) => m.location === location) || null;
  const items = menu?.item || [];

  async function load() {
    const r = await api.get('/admin/menus');
    setMenus(r.data || []);
  }

  useEffect(() => {
    setEditId(null);
    setForm(EMPTY);
    load().catch(() => {});
  }, [location]);

  async function save(e) {
    e.preventDefault();
    setError('');
    if (!menu) {
      setError(`No "${location}" menu exists yet.`);
      return;
    }
    const payload = { ...form, position: Number(form.position) || 1 };
    try {
      if (editId) {
        await api.put(`/admin/menus/${menu.id}/item/${editId}`, payload);
      } else {
        await api.post(`/admin/menus/${menu.id}/item`, payload);
      }
      setForm(EMPTY);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(itemId) {
    if (!window.confirm('Delete this menu item?')) return;
    await api.del(`/admin/menus/${menu.id}/item/${itemId}`);
    await load();
  }

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Menu Manager
      </h1>
      <div className="mb-5 flex gap-2">
        {['header', 'footer'].map((l) => (
          <button
            key={l}
            onClick={() => setLocation(l)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              location === l
                ? 'bg-primary text-white'
                : 'border border-surface-container-high text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {l} menu
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-surface-container-high bg-surface-container-lowest px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-300">drag_indicator</span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{it.label}</p>
                  <p className="text-xs text-slate-400">{it.url} · position {it.position}</p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => { setEditId(it.id); setForm({ label: it.label, url: it.url, position: it.position, icon: it.icon || '' }); }}
                  className="mr-1 rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary"
                  title="Edit"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  onClick={() => remove(it.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  title="Delete"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              No items in the {location} menu yet.
            </p>
          )}
        </div>

        <form
          onSubmit={save}
          className="h-fit rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950"
        >
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
            {editId ? 'Edit Item' : 'New Item'}
          </h2>
          <label className="mb-1 block text-xs font-medium text-slate-500">Label</label>
          <input
            required
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">URL</label>
          <input
            required
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="/category/web-dev"
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Position</label>
          <input
            type="number"
            min={1}
            value={form.position}
            onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Icon (optional)</label>
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
