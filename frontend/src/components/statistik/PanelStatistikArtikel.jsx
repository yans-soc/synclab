import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

// Statistik view per artikel dari sumber data yang sama dengan situs publik
// (kunjungan_artikel sah + counter otoritatif artikel.jumlah_dilihat).
export default function PanelStatistikArtikel({ idArtikel }) {
  const [stat, setStat] = useState(null);

  useEffect(() => {
    if (!idArtikel) return undefined;
    api
      .get(`/kunjungan/admin/${idArtikel}/statistik`)
      .then((r) => setStat(r.data))
      .catch(() => {});
    return undefined;
  }, [idArtikel]);

  if (!stat) return null;

  const metrik = [
    { label: 'Total Views', nilai: stat.total_view },
    { label: 'Pengunjung Unik', nilai: stat.pengunjung_unik },
    { label: 'Hari Ini', nilai: stat.view_hari_ini },
    { label: '7 Hari Terakhir', nilai: stat.view_7_hari },
    { label: '30 Hari Terakhir', nilai: stat.view_30_hari },
    { label: 'Peringkat Populer', nilai: `#${stat.peringkat_populer}` },
  ];
  const maks = Math.max(...stat.harian.map((h) => h.view), 1);

  return (
    <section className="rounded-2xl border border-surface-container-high bg-surface-container-lowest p-5 dark:border-slate-800 dark:bg-slate-950">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
        <span className="material-symbols-outlined text-base">monitoring</span>
        Statistik View
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrik.map((m) => (
          <div key={m.label} className="rounded-xl bg-surface-container px-3 py-2.5 dark:bg-slate-900">
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {typeof m.nilai === 'number' ? m.nilai.toLocaleString('id-ID') : m.nilai}
            </p>
            <p className="text-xs text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
      {stat.harian.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-slate-400">View sah per hari (30 hari terakhir)</p>
          <div className="flex h-20 items-end gap-1">
            {stat.harian.map((h) => (
              <div
                key={h.tanggal}
                title={`${h.tanggal}: ${h.view} view`}
                className="flex-1 rounded-t bg-primary/70"
                style={{ height: `${Math.max(6, (h.view / maks) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
