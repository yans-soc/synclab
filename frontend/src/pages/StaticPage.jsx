import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { api } from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';

export default function StaticPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    api
      .get(`/pages/${slug}`)
      .then((r) => {
        setPage(r.data);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  useEffect(() => {
    if (page) {
      document.title = page.seo?.seo_title || `${page.title} - SYNCLAB`;
    }
  }, [page]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
        {status === 'loading' && (
          <div className="flex min-h-[40vh] items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          </div>
        )}
        {status === 'error' && (
          <div className="py-24 text-center">
            <p className="text-lg text-slate-500">Page not found.</p>
            <Link to="/" className="mt-4 inline-block font-semibold text-primary">
              Back to Home
            </Link>
          </div>
        )}
        {status === 'ok' && (
          <>
            <h1 className="font-headline text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
              {page.title}
            </h1>
            <div
              className="prose-content mt-8"
              dangerouslySetInnerHTML={{ __html: marked.parse(page.content || '') }}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
