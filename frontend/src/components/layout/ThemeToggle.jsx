import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem('synclab_theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('synclab_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      type="button"
      onClick={() => setDark((v) => !v)}
      className="rounded-full p-2 text-slate-500 transition hover:bg-surface-container dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
