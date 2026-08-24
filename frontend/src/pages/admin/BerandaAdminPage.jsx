import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const TIPE_LABEL = {
  hero_section: 'Hero Section',
  explore_topics: 'Jelajah Topik',
  trending_articles: 'Artikel Trending',
  latest_articles: 'Artikel Terbaru',
  cta_banner: 'Banner CTA',
};

const CONTOH_PENGATURAN = {
  hero_section: {
    judul_utama: 'Judul Utama',
    deskripsi: 'Deskripsi singkat hero.',
    cta: { teks_tombol: 'Mulai', url_tujuan: '/artikel', ikon: 'arrow_forward' },
  },
  explore_topics: { subjudul: 'Topik', judul_seksi: 'Jelajahi Topik' },
  trending_articles: { subjudul: 'Paling Banyak Dibaca', judul_seksi: 'Artikel Trending', jumlah_tampil: 6, teks_tautan: 'Lihat Semua' },
  latest_articles: { judul_seksi: 'Artikel Terbaru', jumlah_tampil: 6, teks_tautan: 'Lihat Semua' },
  cta_banner: {
    judul: 'Judul Banner',
    deskripsi: 'Deskripsi banner.',
    cta: { teks_tombol: 'Pelajari', url_tujuan: '/halaman/tentang', ikon: 'arrow_forward' },
  },
};

export default function BerandaAdminPage() {
  const [daftarBeranda, setDaftarBeranda] = useState([]);
  const [beranda, setBeranda] = useState(null);
  const [error, setError] = useState('');
  const [pesan, setPesan] = useState('');

  // state form bagian
  const [formTerbuka, setFormTerbuka] = useState(false);
  const [editBagianId, setEditBagianId] = useState(null);
  const [tipe, setTipe] = useState('hero_section');
  const [judulBagian, setJudulBagian] = useState('');
  const [teksPengaturan, setTeksPengaturan] = useState('');

  async function muatDaftar() {
    const r = await api.get('/admin/beranda');
    setDaftarBeranda(r.data || []);
  }

  async function muatDetail(id) {
    const r = await api.get(`/admin/beranda/${id}`);
    setBeranda(r.data);
  }

  useEffect(() => {
    muatDaftar().catch(() => {});
  }, []);

  useEffect(() => {
    if (daftarBeranda.length > 0 && !beranda) {
      muatDetail(daftarBeranda[0].id).catch(() => {});
    }
  }, [daftarBeranda]);

  function bukaFormTambah() {
    setEditBagianId(null);
    setTipe('hero_section');
    setJudulBagian('Hero Baru');
    setTeksPengaturan(JSON.stringify(CONTOH_PENGATURAN.hero_section, null, 2));
    setFormTerbuka(true);
    setError('');
  }

  function bukaFormEdit(bagian) {
    setEditBagianId(bagian.id);
    setTipe(bagian.tipe);
    setJudulBagian(bagian.judul_bagian);
    setTeksPengaturan(JSON.stringify(bagian.pengaturan, null, 2));
    setFormTerbuka(true);
    setError('');
  }

  function ubahTipe(t) {
    setTipe(t);
    if (!editBagianId) {
      setTeksPengaturan(JSON.stringify(CONTOH_PENGATURAN[t], null, 2));
    }
  }

  async function simpanBagian(e) {
    e.preventDefault();
    setError('');
    let pengaturan;
    try {
      pengaturan = JSON.parse(teksPengaturan);
    } catch {
      setError('JSON pengaturan tidak valid.');
      return;
    }
    const payload = { judul_bagian: judulBagian, tipe, pengaturan, aktif: true };
    try {
      if (editBagianId) {
        await api.put(`/admin/beranda/${beranda.id}/bagian/${editBagianId}`, payload);
      } else {
        await api.post(`/admin/beranda/${beranda.id}/bagian`, {
          ...payload,
          posisi: beranda.bagian.length,
        });
      }
      setFormTerbuka(false);
      await muatDetail(beranda.id);
    } catch (err) {
      setError(err.data ? `${err.message}: ${err.data.map((d) => `${d.jalur} ${d.pesan}`).join(', ')}` : err.message);
    }
  }

  async function hapusBagian(idBagian) {
    if (!window.confirm('Hapus bagian ini?')) return;
    await api.del(`/admin/beranda/${beranda.id}/bagian/${idBagian}`);
    await muatDetail(beranda.id);
  }

  async function duplikatBagian(idBagian) {
    await api.post(`/admin/beranda/${beranda.id}/bagian/${idBagian}/duplikat`);
    await muatDetail(beranda.id);
  }

  async function toggleAktifBagian(bagian) {
    await api.put(`/admin/beranda/${beranda.id}/bagian/${bagian.id}`, { aktif: !bagian.aktif });
    await muatDetail(beranda.id);
  }

  async function pindah(indeks, arah) {
    const bagian = [...beranda.bagian];
    const tujuan = indeks + arah;
    if (tujuan < 0 || tujuan >= bagian.length) return;
    [bagian[indeks], bagian[tujuan]] = [bagian[tujuan], bagian[indeks]];
    await api.put(`/admin/beranda/${beranda.id}/bagian/susun-ulang`, {
      urutan: bagian.map((b, i) => ({ id: b.id, posisi: i })),
    });
    await muatDetail(beranda.id);
  }

  async function aturAktif(id, aktif) {
    setPesan('');
    await api.post(`/admin/beranda/${id}/aktif`, { aktif });
    await muatDaftar();
    await muatDetail(id);
    setPesan(aktif ? 'Beranda ini kini aktif (tampil di situs).' : 'Beranda dinonaktifkan.');
  }

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Pengatur Beranda
      </h1>
      {pesan && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-4 py-3 text-sm text-secondary">{pesan}</p>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {daftarBeranda.map((b) => (
          <button
            key={b.id}
            onClick={() => muatDetail(b.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              beranda?.id === b.id
                ? 'bg-primary text-white'
                : 'border border-surface-container-high text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            v{b.versi} — {b.judul}
            {b.aktif && <span className="ml-2 rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">aktif</span>}
          </button>
        ))}
      </div>

      {beranda && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {beranda.bagian.length} bagian · {beranda.aktif ? 'Beranda aktif' : 'Beranda tidak aktif'}
            </p>
            <div className="flex gap-2">
              {!beranda.aktif && (
                <button
                  onClick={() => aturAktif(beranda.id, true)}
                  className="rounded-lg border border-secondary px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary/10"
                >
                  Jadikan Aktif
                </button>
              )}
              <button
                onClick={bukaFormTambah}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tambah Bagian
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {beranda.bagian.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center justify-between rounded-xl border bg-surface-container-lowest px-4 py-3 dark:bg-slate-950 ${
                  b.aktif ? 'border-surface-container-high dark:border-slate-800' : 'border-dashed border-slate-300 opacity-60 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => pindah(i, -1)}
                      disabled={i === 0}
                      className="rounded p-0.5 text-slate-400 hover:text-primary disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-lg">expand_less</span>
                    </button>
                    <button
                      onClick={() => pindah(i, 1)}
                      disabled={i === beranda.bagian.length - 1}
                      className="rounded p-0.5 text-slate-400 hover:text-primary disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-lg">expand_more</span>
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{b.judul_bagian}</p>
                    <p className="text-xs text-slate-400">
                      {TIPE_LABEL[b.tipe] || b.tipe} · {b.aktif ? 'tampil' : 'tersembunyi'}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <button onClick={() => toggleAktifBagian(b)} className="rounded-lg p-2 text-slate-400 hover:bg-secondary/10 hover:text-secondary" title={b.aktif ? 'Sembunyikan' : 'Tampilkan'}>
                    <span className="material-symbols-outlined text-lg">{b.aktif ? 'visibility' : 'visibility_off'}</span>
                  </button>
                  <button onClick={() => bukaFormEdit(b)} className="rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary" title="Sunting">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={() => duplikatBagian(b.id)} className="rounded-lg p-2 text-slate-400 hover:bg-tertiary/10 hover:text-tertiary" title="Duplikat">
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                  <button onClick={() => hapusBagian(b.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" title="Hapus">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {formTerbuka && (
            <form
              onSubmit={simpanBagian}
              className="mt-6 rounded-2xl border border-primary/30 bg-surface-container-lowest p-6 dark:bg-slate-950"
            >
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                {editBagianId ? 'Sunting Bagian' : 'Bagian Baru'}
              </h2>
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Judul Bagian</label>
                  <input
                    required
                    value={judulBagian}
                    onChange={(e) => setJudulBagian(e.target.value)}
                    className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Tipe</label>
                  <select
                    value={tipe}
                    onChange={(e) => ubahTipe(e.target.value)}
                    className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                  >
                    {Object.entries(TIPE_LABEL).map(([nilai, label]) => (
                      <option key={nilai} value={nilai}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Pengaturan (JSON) — divalidasi per tipe di server
              </label>
              <textarea
                value={teksPengaturan}
                onChange={(e) => setTeksPengaturan(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 font-mono text-xs outline-none focus:border-primary dark:border-slate-700"
              />
              {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950">{error}</p>}
              <div className="mt-4 flex gap-2">
                <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setFormTerbuka(false)}
                  className="rounded-lg border border-surface-container-high px-5 py-2 text-sm text-slate-500 dark:border-slate-700"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
