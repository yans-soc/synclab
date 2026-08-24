import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const KOSONG = { nama: '', slug: '', deskripsi: '', warna: 'primary', ikon: 'folder' };
const PILIHAN_WARNA = ['primary', 'secondary', 'tertiary', 'ai-purple'];

export default function KategoriAdminPage() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState(KOSONG);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  async function muat() {
    const r = await api.get('/kategori');
    setData(r.data || []);
  }

  useEffect(() => {
    muat().catch(() => {});
  }, []);

  async function simpan(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, slug: form.slug || form.nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') };
    try {
      if (editId) {
        await api.put(`/admin/kategori/${editId}`, payload);
      } else {
        await api.post('/admin/kategori', payload);
      }
      setForm(KOSONG);
      setEditId(null);
      await muat();
    } catch (err) {
      setError(err.message);
    }
  }

  function mulaiEdit(k) {
    setEditId(k.id);
    setForm({ nama: k.nama, slug: k.slug, deskripsi: k.deskripsi || '', warna: k.warna, ikon: k.ikon || 'folder' });
  }

  async function hapus(id) {
    if (!window.confirm('Hapus kategori ini? Artikel terkait tidak ikut terhapus.')) return;
    await api.del(`/admin/kategori/${id}`);
    await muat();
  }

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Kategori
      </h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest dark:border-slate-800 dark:bg-slate-950">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-surface-container-high text-xs uppercase text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Nama</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Artikel</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((k) => (
                  <tr key={k.id} className="border-b border-surface-container last:border-0 dark:border-slate-800">
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                        <span className="material-symbols-outlined text-lg">{k.ikon || 'folder'}</span>
                        {k.nama}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{k.slug}</td>
                    <td className="px-5 py-3 text-slate-500">{k.jumlah_artikel ?? 0}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => mulaiEdit(k)} className="mr-1 inline-flex rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary" title="Sunting">
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button onClick={() => hapus(k.id)} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" title="Hapus">
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
          onSubmit={simpan}
          className="h-fit rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950"
        >
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
            {editId ? 'Sunting Kategori' : 'Kategori Baru'}
          </h2>
          <label className="mb-1 block text-xs font-medium text-slate-500">Nama</label>
          <input
            required
            value={form.nama}
            onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="otomatis dari nama"
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Deskripsi</label>
          <textarea
            value={form.deskripsi}
            onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
            rows={2}
            className="mb-3 w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
          />
          <label className="mb-1 block text-xs font-medium text-slate-500">Warna</label>
          <div className="mb-3 flex gap-2">
            {PILIHAN_WARNA.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setForm((f) => ({ ...f, warna: w }))}
                className={`h-8 w-8 rounded-full border-2 bg-${w} ${
                  form.warna === w ? 'border-slate-800 dark:border-white' : 'border-transparent'
                }`}
                title={w}
              />
            ))}
          </div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Ikon (Material Symbols)</label>
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
