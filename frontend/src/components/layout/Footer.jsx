import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';

export default function Footer() {
  const [item, setItem] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/menus/footer').then((r) => setItem(r.data || [])).catch(() => {});
    api.get('/settings').then((r) => setSettings(r.data || {})).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-surface-container-high bg-surface-container-low dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 md:py-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-primary">sync</span>
            <span className="font-headline text-lg font-extrabold text-slate-900 dark:text-white">
              {settings.site_title || 'SYNCLAB'}
            </span>
          </div>
          <p className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {settings.site_description}
          </p>
          {settings.contact_email && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined mr-1 align-middle text-base">mail</span>
              {settings.contact_email}
            </p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Links
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
        © {new Date().getFullYear()} {settings.site_title || 'SYNCLAB'}. All rights reserved.
      </div>
    </footer>
  );
}
