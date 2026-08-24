import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';

const DURASI_MINIMUM_DETIK = 10;

// Tracker view tervalidasi: menghitung detik aktif (halaman terlihat) lalu
// mengklaim view ke layanan validasi terpusat. Counter halaman diperbarui
// dengan nilai otoritatif yang dikembalikan server. Dipanggil sekali per muat
// halaman; token dipakai ulang bila artikel dimuat ulang.
export function usePelacakView(artikel) {
  const [jumlahDilihat, setJumlahDilihat] = useState(artikel?.jumlah_dilihat ?? 0);
  const sudahKlaim = useRef(false);
  const tokenRef = useRef(artikel?.token_kunjungan || null);

  useEffect(() => {
    setJumlahDilihat(artikel?.jumlah_dilihat ?? 0);
    tokenRef.current = artikel?.token_kunjungan || null;
    sudahKlaim.current = false;
  }, [artikel?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!artikel?.slug) return undefined;
    let detikAktif = 0;
    let timer;

    const klaim = () => {
      if (sudahKlaim.current || !tokenRef.current) return;
      sudahKlaim.current = true;
      clearInterval(timer);
      api
        .post(`/kunjungan/${artikel.slug}`, {
          token: tokenRef.current,
          durasi_detik: detikAktif,
        })
        .then((r) => {
          if (typeof r.data?.jumlah_dilihat === 'number') {
            setJumlahDilihat(r.data.jumlah_dilihat);
          }
        })
        .catch(() => {});
    };

    timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      detikAktif += 1;
      if (detikAktif >= DURASI_MINIMUM_DETIK) klaim();
    }, 1000);

    return () => clearInterval(timer);
  }, [artikel?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  return jumlahDilihat;
}
