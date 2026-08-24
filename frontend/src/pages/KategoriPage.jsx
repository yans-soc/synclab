import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import SectionHeader from '../components/beranda/SectionHeader.jsx';
import { ArticleCard } from '../components/beranda/ArticleCard.jsx';

export default function KategoriPage() {
  const { slug } = useParams();
  const [kategori, setKategori] = useState(null);
  const [artikel, setArtikel] = useState([]);
  const [meta, setMeta] = useState(null);
  const [halaman, setHalaman] = useState(1);

  useEffect(() => {
    setHalaman(1);
    api
      .get('/kategori')
      .then((r) => setKategori((r.data || []).find((k) => k.slug === slug) || null))
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    api
      .get(`/artikel?kategori=${slug}&halaman=${halaman}&limit=9`)
      .then((r) => {
        setArtikel(r.data || []);
        setMeta(r.meta);
      })
      .catch(() => {
        setArtikel([]);
        setMeta(null);
      });
  }, [slug, halaman]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeader
          subjudul="Kategori"
          judul={kategori?.nama || slug}
        />
        {kategori?.deskripsi && (
          <p className="-mt-4 mb-8 text-slate-500 dark:text-slate-400">{kategori.deskripsi}</p>
        )}
        {artikel.length === 0 ? (
          <p className="py-16 text-center text-slate-500">
            Belum ada artikel terbit pada kategori ini.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {artikel.map((a) => (
              <ArticleCard key={a.id} {...a} />
            ))}
          </div>
        )}
        {meta && meta.total_halaman > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              disabled={halaman <= 1}
              onClick={() => setHalaman((h) => h - 1)}
              className="rounded-lg border border-surface-container-high px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              Sebelumnya
            </button>
            <span className="text-sm text-slate-500">
              Halaman {meta.halaman} dari {meta.total_halaman}
            </span>
            <button
              disabled={halaman >= meta.total_halaman}
              onClick={() => setHalaman((h) => h + 1)}
              className="rounded-lg border border-surface-container-high px-4 py-2 text-sm disabled:opacity-40 dark:border-slate-700"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
