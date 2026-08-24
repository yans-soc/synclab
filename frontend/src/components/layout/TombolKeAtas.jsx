import { useEffect, useState } from 'react';

// Tombol melayang "kembali ke atas"; muncul setelah pengguna scroll jauh ke bawah.
export default function TombolKeAtas() {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const ambang = Math.max(window.innerHeight * 1.5, 600);
    const saatScroll = () => setTampil(window.scrollY > ambang);
    saatScroll();
    window.addEventListener('scroll', saatScroll, { passive: true });
    return () => window.removeEventListener('scroll', saatScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Kembali ke atas"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-700 ${
        tampil
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <span className="material-symbols-outlined">arrow_upward</span>
    </button>
  );
}
