import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';

const TYPE_LABELS = {
  hero_section: 'Hero Section',
  explore_topics: 'Explore Topics',
  trending_articles: 'Trending Articles',
  latest_articles: 'Latest Articles',
  cta_banner: 'CTA Banner',
};

const EXAMPLE_SETTINGS = {
  hero_section: {
    main_title: 'Main Title',
    description: 'Short hero description.',
    cta: { button_text: 'Get Started', target_url: '/articles', icon: 'arrow_forward' },
  },
  explore_topics: { subtitle: 'Topics', section_title: 'Explore Topics' },
  trending_articles: { subtitle: 'Most Read', section_title: 'Trending Articles', display_count: 6, link_text: 'View All' },
  latest_articles: { section_title: 'Latest Articles', display_count: 6, link_text: 'View All' },
  cta_banner: {
    title: 'Banner Title',
    description: 'Banner description.',
    cta: { button_text: 'Learn More', target_url: '/page/about', icon: 'arrow_forward' },
  },
};

export default function HomepageAdminPage() {
  const [homepages, setHomepages] = useState([]);
  const [homepage, setHomepage] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // state form section
  const [formOpen, setFormOpen] = useState(false);
  const [editSectionId, setEditSectionId] = useState(null);
  const [type, setType] = useState('hero_section');
  const [sectionTitle, setSectionTitle] = useState('');
  const [settingsText, setSettingsText] = useState('');

  async function loadList() {
    const r = await api.get('/admin/homepage');
    setHomepages(r.data || []);
  }

  async function loadDetail(id) {
    const r = await api.get(`/admin/homepage/${id}`);
    setHomepage(r.data);
  }

  useEffect(() => {
    loadList().catch(() => {});
  }, []);

  useEffect(() => {
    if (homepages.length > 0 && !homepage) {
      loadDetail(homepages[0].id).catch(() => {});
    }
  }, [homepages]);

  function openCreateForm() {
    setEditSectionId(null);
    setType('hero_section');
    setSectionTitle('New Hero');
    setSettingsText(JSON.stringify(EXAMPLE_SETTINGS.hero_section, null, 2));
    setFormOpen(true);
    setError('');
  }

  function openEditForm(section) {
    setEditSectionId(section.id);
    setType(section.type);
    setSectionTitle(section.section_title);
    setSettingsText(JSON.stringify(section.settings, null, 2));
    setFormOpen(true);
    setError('');
  }

  function changeType(t) {
    setType(t);
    if (!editSectionId) {
      setSettingsText(JSON.stringify(EXAMPLE_SETTINGS[t], null, 2));
    }
  }

  async function saveSection(e) {
    e.preventDefault();
    setError('');
    let settings;
    try {
      settings = JSON.parse(settingsText);
    } catch {
      setError('Invalid settings JSON.');
      return;
    }
    const payload = { section_title: sectionTitle, type, settings, active: true };
    try {
      if (editSectionId) {
        await api.put(`/admin/homepage/${homepage.id}/sections/${editSectionId}`, payload);
      } else {
        await api.post(`/admin/homepage/${homepage.id}/sections`, {
          ...payload,
          position: homepage.sections.length,
        });
      }
      setFormOpen(false);
      await loadDetail(homepage.id);
    } catch (err) {
      setError(err.data ? `${err.message}: ${err.data.map((d) => `${d.path} ${d.message}`).join(', ')}` : err.message);
    }
  }

  async function deleteSection(sectionId) {
    if (!window.confirm('Delete this section?')) return;
    await api.del(`/admin/homepage/${homepage.id}/sections/${sectionId}`);
    await loadDetail(homepage.id);
  }

  async function duplicateSection(sectionId) {
    await api.post(`/admin/homepage/${homepage.id}/sections/${sectionId}/duplicate`);
    await loadDetail(homepage.id);
  }

  async function toggleSectionActive(section) {
    await api.put(`/admin/homepage/${homepage.id}/sections/${section.id}`, { active: !section.active });
    await loadDetail(homepage.id);
  }

  async function move(index, direction) {
    const section = [...homepage.sections];
    const target = index + direction;
    if (target < 0 || target >= section.length) return;
    [section[index], section[target]] = [section[target], section[index]];
    await api.put(`/admin/homepage/${homepage.id}/sections/reorder`, {
      order: section.map((b, i) => ({ id: b.id, position: i })),
    });
    await loadDetail(homepage.id);
  }

  async function setActive(id, active) {
    setMessage('');
    await api.post(`/admin/homepage/${id}/active`, { active });
    await loadList();
    await loadDetail(id);
    setMessage(active ? 'This homepage is now active (shown on site).' : 'Homepage deactivated.');
  }

  return (
    <div>
      <h1 className="mb-6 font-headline text-2xl font-extrabold text-slate-900 dark:text-white">
        Homepage Builder
      </h1>
      {message && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-4 py-3 text-sm text-secondary">{message}</p>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {homepages.map((b) => (
          <button
            key={b.id}
            onClick={() => loadDetail(b.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              homepage?.id === b.id
                ? 'bg-primary text-white'
                : 'border border-surface-container-high text-slate-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            v{b.version} — {b.title}
            {b.active && <span className="ml-2 rounded-full bg-secondary/20 px-2 py-0.5 text-xs text-secondary">active</span>}
          </button>
        ))}
      </div>

      {homepage && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {homepage.sections.length} sections · {homepage.active ? 'Homepage active' : 'Homepage inactive'}
            </p>
            <div className="flex gap-2">
              {!homepage.active && (
                <button
                  onClick={() => setActive(homepage.id, true)}
                  className="rounded-lg border border-secondary px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary/10"
                >
                  Make Active
                </button>
              )}
              <button
                onClick={openCreateForm}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Section
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {homepage.sections.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center justify-between rounded-xl border bg-surface-container-lowest px-4 py-3 dark:bg-slate-950 ${
                  b.active ? 'border-surface-container-high dark:border-slate-800' : 'border-dashed border-slate-300 opacity-60 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      className="rounded p-0.5 text-slate-400 hover:text-primary disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-lg">expand_less</span>
                    </button>
                    <button
                      onClick={() => move(i, 1)}
                      disabled={i === homepage.sections.length - 1}
                      className="rounded p-0.5 text-slate-400 hover:text-primary disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined text-lg">expand_more</span>
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{b.section_title}</p>
                    <p className="text-xs text-slate-400">
                      {TYPE_LABELS[b.type] || b.type} · {b.active ? 'visible' : 'hidden'}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <button onClick={() => toggleSectionActive(b)} className="rounded-lg p-2 text-slate-400 hover:bg-secondary/10 hover:text-secondary" title={b.active ? 'Hide' : 'Show'}>
                    <span className="material-symbols-outlined text-lg">{b.active ? 'visibility' : 'visibility_off'}</span>
                  </button>
                  <button onClick={() => openEditForm(b)} className="rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary" title="Edit">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button onClick={() => duplicateSection(b.id)} className="rounded-lg p-2 text-slate-400 hover:bg-tertiary/10 hover:text-tertiary" title="Duplicate">
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                  <button onClick={() => deleteSection(b.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" title="Delete">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {formOpen && (
            <form
              onSubmit={saveSection}
              className="mt-6 rounded-2xl border border-primary/30 bg-surface-container-lowest p-6 dark:bg-slate-950"
            >
              <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
                {editSectionId ? 'Edit Section' : 'New Section'}
              </h2>
              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Section Title</label>
                  <input
                    required
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Type</label>
                  <select
                    value={type}
                    onChange={(e) => changeType(e.target.value)}
                    className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 text-sm dark:border-slate-700"
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Settings (JSON) — validated per type on server
              </label>
              <textarea
                value={settingsText}
                onChange={(e) => setSettingsText(e.target.value)}
                rows={10}
                spellCheck={false}
                className="w-full rounded-lg border border-surface-container-high bg-transparent px-3 py-2 font-mono text-xs outline-none focus:border-primary dark:border-slate-700"
              />
              {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950">{error}</p>}
              <div className="mt-4 flex gap-2">
                <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-lg border border-surface-container-high px-5 py-2 text-sm text-slate-500 dark:border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
