import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import SectionHeader from './SectionHeader.jsx';
import { ArticleCard } from './ArticleCard.jsx';

export default function LatestArticlesGrid({ pengaturan }) {
  const [artikel, setArtikel] = useState([]);
  const jumlah = pengaturan.jumlah_tampil || 3;

  useEffect(() => {
    api
      .get(`/artikel?limit=${jumlah}`)
      .then((r) => setArtikel(r.data || []))
      .catch(() => {});
  }, [jumlah]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          judul={pengaturan.judul_seksi}
          tautan="/artikel"
          teksTautan={pengaturan.teks_tautan}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {artikel.map((a) => (
            <ArticleCard key={a.id} {...a} />
          ))}
        </div>
      </div>
    </section>
  );
}
