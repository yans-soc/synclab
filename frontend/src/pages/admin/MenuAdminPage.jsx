import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const KOSONG = { label: '', url: '', posisi: 1, ikon: '' };

export default function MenuAdminPage() {
  const [lokasi, setLokasi] = useState('header');
  const [item, setItem] = useState([]);
  const [form, setForm] = useState(KOSONG);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function muat() {
    const r = await api.get(`/admin/menu?lokasi=${lokasi}`);
    setItem(r.data || []);
  }

  useEffect(() => {
    setEditId(null);
    setForm(KOSONG);
    muat().catch(() => {});
  }, [lokasi]);

  async function simpan(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, posisi: Number(form.posisi) || 1, lokasi };
    try {
      if (editId) {
        await api.put(`/admin/menu/${editId}`, payload);
      } else {
        await api.post('/admin/menu', payload);
      }
      setForm(KOSONG);
      setEditId(null);
      await muat();
    } catch (err) {
      setError(err.message);
    }
  }

  async function hapus(id) {
    if (!window.confirm('Hapus item menu ini?')) return;
    await api.del(`/admin/menu/${id}`);
    await muat();
  }

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Pengelola Menu
      </h1>
      <div className="mb-5 flex gap-2">
        {['header', 'footer'].map((l) => (
          <button
            key={l}
            onClick={() => setLokasi(l)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              lokasi === l
                ? 'bg-primary text-white'
                : 'border border-surface-container-high text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            Menu {l}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-2">
          {item.map((it) => (
            <div
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-surface-container-high bg-surface-container-lowest px-4 py-3 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-300">drag_indicator</span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{it.label}</p>
                  <p className="text-xs text-slate-400">{it.url} · posisi {it.posisi}</p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => { setEditId(it.id); setForm({ label: it.label, url: it.url, posisi: it.posisi, ikon: it.ikon || '' }); }}
                  className="mr-1 rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button
                  onClick={() => hapus(it.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            </div>
          ))}
          {item.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              Belum ada item pada menu {lokasi}.
            </p>
          )}
        </div>

        <form
          onSubmit={simpan}
          className="h-fit rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950"
        >
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
            {editId ? 'Sunting Item' : 'Item Baru'}
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
            placeholder="/kategori/web-dev"
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Posisi</label>
          <input
            type="number"
            min={1}
            value={form.posisi}
            onChange={(e) => setForm((f) => ({ ...f, posisi: e.target.value }))}
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Ikon (opsional)</label>
          <input
            value={form.ikon}
            onChange={(e) => setForm((f) => ({ ...f, ikon: e.target.value }))}
            className="mb-4 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-lg bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-700">
              {editId ? 'Perbarui' : 'Tambah'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => { setEditId(null); setForm(KOSONG); }}
                className="rounded-lg border border-surface-container-high px-4 py-2 text-sm text-slate-500 dark:border-slate-700"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
