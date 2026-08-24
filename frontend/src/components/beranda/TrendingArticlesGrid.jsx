import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import SectionHeader from './SectionHeader.jsx';
import { ArticleCard } from './ArticleCard.jsx';

export default function TrendingArticlesGrid({ pengaturan, dataAwal = null }) {
  const [artikel, setArtikel] = useState(dataAwal || []);
  const jumlah = pengaturan.jumlah_tampil || 6;

  useEffect(() => {
    if (dataAwal) return; // data sudah datang dari endpoint komposit beranda
    api
      .get(`/artikel/trending?limit=${jumlah}`)
      .then((r) => setArtikel(r.data || []))
      .catch(() => {});
  }, [jumlah, dataAwal]);

  if (artikel.length === 0) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          subjudul={pengaturan.subjudul}
          judul={pengaturan.judul_seksi}
          tautan="/artikel?urutkan=populer"
          teksTautan={pengaturan.teks_tautan}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artikel.map((a, i) => (
            <div key={a.id} className="relative">
              <span className="absolute -top-2.5 left-4 z-10 rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
                #{i + 1}
              </span>
              <ArticleCard {...a} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
