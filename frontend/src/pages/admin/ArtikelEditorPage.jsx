import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import SeoPanel from '../../components/seo-panel/SeoPanel.jsx';
import SlugEditor from '../../components/slug-editor/SlugEditor.jsx';
import MediaManagerModal from '../../components/media-picker/MediaManagerModal.jsx';
import PanelStatistikArtikel from '../../components/statistik/PanelStatistikArtikel.jsx';

const KOSONG = {
  judul: '',
  slug: '',
  kutipan: '',
  konten: '',
  status: 'draf',
  id_gambar_unggulan: null,
  kategori_ids: [],
  seo: {},
};

export default function ArtikelEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(KOSONG);
  const [kategori, setKategori] = useState([]);
  const [gambarUrl, setGambarUrl] = useState('');
  const [modalMedia, setModalMedia] = useState(false);
  const [error, setError] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
    api.get('/kategori').then((r) => setKategori(r.data || [])).catch(() => {});
    if (id) {
      api
        .get(`/admin/artikel/${id}`)
        .then((r) => {
          const a = r.data;
          setForm({
            judul: a.judul,
            slug: a.slug,
            kutipan: a.kutipan || '',
            konten: a.konten || '',
            status: a.status,
            id_gambar_unggulan: a.id_gambar_unggulan,
            kategori_ids: a.kategori_ids || [],
            seo: a.seo || {},
          });
          setGambarUrl(a.gambar_unggulan || '');
        })
        .catch((err) => setError(err.message));
    }
  }, [id]);

  function toggleKategori(idKategori) {
    setForm((f) => ({
      ...f,
      kategori_ids: f.kategori_ids.includes(idKategori)
        ? f.kategori_ids.filter((k) => k !== idKategori)
        : [...f.kategori_ids, idKategori],
    }));
  }

  async function simpan(statusBaru) {
    setError('');
    setMenyimpan(true);
    const payload = { ...form, status: statusBaru || form.status };
    if (!payload.seo || Object.values(payload.seo).every((v) => !v)) {
      delete payload.seo;
    }
    try {
      if (id) {
        await api.put(`/admin/artikel/${id}`, payload);
      } else {
        await api.post('/admin/artikel', payload);
      }
      navigate('/admin/artikel');
    } catch (err) {
      setError(
        err.data
          ? `${err.message}: ${err.data.map((d) => d.jalur || d.pesan).join(', ')}`
          : err.message
      );
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
          {id ? 'Sunting Artikel' : 'Artikel Baru'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => simpan('draf')}
            disabled={menyimpan}
            className="rounded-lg border border-surface-container-high px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
          >
            Simpan Draf
          </button>
          <button
            onClick={() => simpan('terbit')}
            disabled={menyimpan}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {menyimpan ? 'Menyimpan...' : 'Terbitkan'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950">
          {error}
        </p>
      )}

      {id && <div className="mb-6"><PanelStatistikArtikel idArtikel={id} /></div>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <input
              value={form.judul}
              onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
              placeholder="Judul artikel..."
              className="w-full bg-transparent font-headline text-2xl font-extrabold text-slate-900 outline-none placeholder:text-slate-300 dark:text-white"
            />
            <div className="mt-3">
              <SlugEditor
                nilai={form.slug}
                dariJudul={form.judul}
                ubah={(slug) => setForm((f) => ({ ...f, slug }))}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <label className="mb-1 block text-xs font-medium text-slate-500">Kutipan</label>
            <textarea
              value={form.kutipan}
              onChange={(e) => setForm((f) => ({ ...f, kutipan: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
            />
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Konten (Markdown)
            </label>
            <textarea
              value={form.konten}
              onChange={(e) => setForm((f) => ({ ...f, konten: e.target.value }))}
              rows={16}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-primary dark:border-slate-700"
              placeholder="## Judul Bagian&#10;&#10;Tulis konten artikel di sini..."
            />
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <SeoPanel
              nilai={form.seo}
              ubah={(seo) => setForm((f) => ({ ...f, seo }))}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Status</h3>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            >
              <option value="draf">Draf</option>
              <option value="terbit">Terbit</option>
              <option value="arsip">Arsip</option>
            </select>
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Gambar Unggulan</h3>
            {gambarUrl ? (
              <div className="mb-3 overflow-hidden rounded-lg">
                <img src={gambarUrl} alt="Gambar unggulan" className="w-full object-cover" />
              </div>
            ) : (
              <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-surface-container dark:bg-slate-800">
                <span className="material-symbols-outlined text-3xl text-slate-400">image</span>
              </div>
            )}
            <button
              onClick={() => setModalMedia(true)}
              className="w-full rounded-lg border border-surface-container-high py-2 text-sm font-semibold text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:text-slate-300"
            >
              Pilih dari Pustaka Media
            </button>
          </div>

          <div className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Kategori</h3>
            <div className="space-y-2">
              {kategori.map((k) => (
                <label key={k.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.kategori_ids.includes(k.id)}
                    onChange={() => toggleKategori(k.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  {k.nama}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MediaManagerModal
        terbuka={modalMedia}
        tutup={() => setModalMedia(false)}
        pilih={(m) => {
          setForm((f) => ({ ...f, id_gambar_unggulan: m.id }));
          setGambarUrl(m.url);
        }}
      />
    </div>
  );
}
