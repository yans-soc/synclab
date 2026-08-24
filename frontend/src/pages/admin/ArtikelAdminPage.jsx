import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatTanggal } from '../../utils/format.js';

const LABEL_STATUS = {
  draf: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  terbit: 'bg-secondary/10 text-secondary',
  arsip: 'bg-tertiary/10 text-tertiary',
};

export default function ArtikelAdminPage() {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [cari, setCari] = useState('');
  const [status, setStatus] = useState('');
  const [halaman, setHalaman] = useState(1);

  async function muat() {
    const q = new URLSearchParams({ halaman: String(halaman), limit: '10' });
    if (cari) q.set('cari', cari);
    if (status) q.set('status', status);
    const r = await api.get(`/admin/artikel?${q}`);
    setData(r.data || []);
    setMeta(r.meta);
  }

  useEffect(() => {
    muat().catch(() => {});
  }, [halaman, status]);

  async function hapus(id) {
    if (!window.confirm('Hapus artikel ini secara permanen?')) return;
    await api.del(`/admin/artikel/${id}`);
    muat();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
          Artikel
        </h1>
        <Link
          to="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Artikel Baru
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-lg text-slate-400">search</span>
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setHalaman(1), muat())}
            placeholder="Cari judul..."
            className="rounded-lg border border-surface-container-high bg-surface-container-lowest py-2 pl-10 pr-3 text-sm outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setHalaman(1);
          }}
          className="rounded-lg border border-surface-container-high bg-surface-container-lowest px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        >
          <option value="">Semua Status</option>
          <option value="draf">Draf</option>
          <option value="terbit">Terbit</option>
          <option value="arsip">Arsip</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-container-high bg-surface-container-lowest dark:border-slate-800 dark:bg-slate-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-container-high text-xs uppercase text-slate-400 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3">Judul</th>
              <th className="px-5 py-3">Status</th>
              <th className="hidden px-5 py-3 md:table-cell">Kategori</th>
              <th className="hidden px-5 py-3 md:table-cell">Views</th>
              <th className="hidden px-5 py-3 md:table-cell">Diperbarui</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-b border-surface-container last:border-0 dark:border-slate-800">
                <td className="px-5 py-3">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{a.judul}</p>
                  <p className="text-xs text-slate-400">/{a.slug}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LABEL_STATUS[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="hidden px-5 py-3 text-slate-500 md:table-cell">
                  {a.kategori.map((k) => k.nama).join(', ') || '-'}
                </td>
                <td className="hidden px-5 py-3 md:table-cell">
                  <span className="flex items-center gap-1 text-slate-500" title={`${a.jumlah_dilihat ?? 0} kali dilihat`}>
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    {(a.jumlah_dilihat ?? 0).toLocaleString('id-ID')}
                  </span>
                </td>
                <td className="hidden px-5 py-3 text-slate-500 md:table-cell">
                  {formatTanggal(a.diperbarui_pada)}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`/admin/articles/${a.id}`}
                    className="mr-1 inline-flex rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary"
                    title="Sunting"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </Link>
                  <button
                    onClick={() => hapus(a.id)}
                    className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                  Belum ada artikel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total_halaman > 1 && (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm">
          <button
            disabled={halaman <= 1}
            onClick={() => setHalaman((h) => h - 1)}
            className="rounded-lg border border-surface-container-high px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
          >
            Sebelumnya
          </button>
          <span className="text-slate-500">
            {meta.halaman} / {meta.total_halaman}
          </span>
          <button
            disabled={halaman >= meta.total_halaman}
            onClick={() => setHalaman((h) => h + 1)}
            className="rounded-lg border border-surface-container-high px-3 py-1.5 disabled:opacity-40 dark:border-slate-700"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
