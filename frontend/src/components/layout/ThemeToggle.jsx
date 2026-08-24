import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [gelap, setGelap] = useState(
    () => localStorage.getItem('synclab_tema') === 'gelap'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', gelap);
    localStorage.setItem('synclab_tema', gelap ? 'gelap' : 'terang');
  }, [gelap]);

  return (
    <button
      type="button"
      onClick={() => setGelap((v) => !v)}
      className="rounded-full p-2 text-slate-500 transition hover:bg-surface-container dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label="Ganti tema"
    >
      <span className="material-symbols-outlined">
        {gelap ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
