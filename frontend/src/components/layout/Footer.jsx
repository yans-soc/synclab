import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export default function Footer() {
  const [item, setItem] = useState([]);
  const [pengaturan, setPengaturan] = useState({});

  useEffect(() => {
    api.get('/menu/footer').then((r) => setItem(r.data || [])).catch(() => {});
    api.get('/pengaturan').then((r) => setPengaturan(r.data || {})).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-surface-container-high bg-surface-container-low dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 md:py-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary">sync</span>
            <span className="font-headline text-lg font-extrabold text-slate-900 dark:text-white">
              {pengaturan.judul_situs || 'SYNCLAB'}
            </span>
          </div>
          <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {pengaturan.deskripsi_situs}
          </p>
          {pengaturan.surel_kontak && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined mr-1 align-middle text-base">mail</span>
              {pengaturan.surel_kontak}
            </p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Tautan
          </h3>
          <ul className="mt-3 space-y-2">
            {item.map((it) => (
              <li key={it.id}>
                <Link
                  to={it.url}
                  className="text-sm text-slate-600 transition hover:text-primary dark:text-slate-300"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-surface-container-high py-4 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Date().getFullYear()} {pengaturan.judul_situs || 'SYNCLAB'}. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}
