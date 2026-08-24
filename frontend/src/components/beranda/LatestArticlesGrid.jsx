import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import SectionHeader from './SectionHeader.jsx';
import { ArticleCard } from './ArticleCard.jsx';

export default function LatestArticlesGrid({ pengaturan, dataAwal = null }) {
  const [artikel, setArtikel] = useState(dataAwal || []);
  const jumlah = pengaturan.jumlah_tampil || 6;

  useEffect(() => {
    if (dataAwal) return; // data sudah datang dari endpoint komposit beranda
    api
      .get(`/artikel?limit=${jumlah}`)
      .then((r) => setArtikel(r.data || []))
      .catch(() => {});
  }, [jumlah, dataAwal]);

  return (
    <section className="py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          judul={pengaturan.judul_seksi}
          tautan="/artikel"
          teksTautan={pengaturan.teks_tautan}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artikel.map((a) => (
            <ArticleCard key={a.id} {...a} />
          ))}
        </div>
      </div>
    </section>
  );
}
