import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

export default function SettingsAdminPage() {
  const [list, setList] = useState([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then((r) => setList(r.data || [])).catch(() => {});
  }, []);

  function onChange(key, value) {
    setList((d) => d.map((p) => (p.key === key ? { ...p, value } : p)));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/admin/settings', {
        settings: list.map((p) => ({ key: p.key, value: p.value })),
      });
      setMessage('Settings saved successfully.');
    } catch (err) {
      setMessage(`Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Global Settings
      </h1>
      <form
        onSubmit={save}
        className="space-y-5 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-6 dark:border-slate-800 dark:bg-slate-950"
      >
        {list.map((p) => (
          <div key={p.key}>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              {p.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </label>
            {p.description && <p className="mb-1 text-xs text-slate-400">{p.description}</p>}
            <input
              value={p.value || ''}
              onChange={(e) => onChange(p.key, e.target.value)}
              className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
            />
          </div>
        ))}
        {message && (
          <p className="rounded-lg bg-surface-container px-4 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
