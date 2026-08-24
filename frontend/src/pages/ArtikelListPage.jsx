import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import SectionHeader from '../components/beranda/SectionHeader.jsx';
import { ArticleCard } from '../components/beranda/ArticleCard.jsx';

export default function ArtikelListPage() {
  const [artikel, setArtikel] = useState([]);
  const [meta, setMeta] = useState(null);
  const [halaman, setHalaman] = useState(1);

  useEffect(() => {
    api
      .get(`/artikel?halaman=${halaman}&limit=9`)
      .then((r) => {
        setArtikel(r.data || []);
        setMeta(r.meta);
      })
      .catch(() => {});
  }, [halaman]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
        <SectionHeader judul="Semua Artikel" subjudul="Katalog Konten" />
        {artikel.length === 0 ? (
          <p className="py-16 text-center text-slate-500">Belum ada artikel terbit.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
