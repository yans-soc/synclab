import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

export default function PengaturanAdminPage() {
  const [daftar, setDaftar] = useState([]);
  const [pesan, setPesan] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    api.get('/admin/pengaturan').then((r) => setDaftar(r.data || [])).catch(() => {});
  }, []);

  function ubah(kunci, nilai) {
    setDaftar((d) => d.map((p) => (p.kunci === kunci ? { ...p, nilai } : p)));
  }

  async function simpan(e) {
    e.preventDefault();
    setMenyimpan(true);
    setPesan('');
    try {
      await api.put('/admin/pengaturan', {
        pengaturan: daftar.map((p) => ({ kunci: p.kunci, nilai: p.nilai })),
      });
      setPesan('Pengaturan berhasil disimpan.');
    } catch (err) {
      setPesan(`Gagal: ${err.message}`);
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Pengaturan Global
      </h1>
      <form
        onSubmit={simpan}
        className="space-y-5 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 dark:border-slate-800 dark:bg-slate-950"
      >
        {daftar.map((p) => (
          <div key={p.kunci}>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {p.kunci.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </label>
            {p.deskripsi && <p className="mb-1 text-xs text-slate-400">{p.deskripsi}</p>}
            <input
              value={p.nilai || ''}
              onChange={(e) => ubah(p.kunci, e.target.value)}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
            />
          </div>
        ))}
        {pesan && (
          <p className="rounded-lg bg-surface-container px-4 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {pesan}
          </p>
        )}
        <button
          type="submit"
          disabled={menyimpan}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {menyimpan ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}
