import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { marked } from 'marked';
import { api } from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import PostViewCount from '../components/home/PostViewCount.jsx';
import MediaImage from '../components/home/MediaImage.jsx';
import { readingTimeMinutes, formatDate } from '../utils/format.js';
import { useViewTracker } from '../hooks/useViewTracker.js';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [status, setStatus] = useState('loading');
  const viewCount = useViewTracker(article);

  useEffect(() => {
    setStatus('loading');
    api
      .get(`/articles/${slug}`)
      .then((r) => {
        setArticle(r.data);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, [slug]);

  useEffect(() => {
    if (article) {
      document.title = article.seo?.seo_title || `${article.title} - SYNCLAB`;
    }
  }, [article]);

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </div>
      </AppLayout>
    );
  }

  if (status === 'error') {
    return (
      <AppLayout>
        <div className="py-24 text-center">
          <p className="text-lg text-slate-500">Article not found.</p>
          <Link to="/" className="mt-4 inline-block font-semibold text-primary">
            Back to Home
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
        <div className="mb-4 flex flex-wrap gap-2">
          {article.categories.map((k) => (
            <Link
              key={k.slug}
              to={`/category/${k.slug}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {k.name}
            </Link>
          ))}
        </div>
        <h1 className="font-headline text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
          {article.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">person</span>
            {article.author.full_name}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">calendar_month</span>
            {formatDate(article.published_at)}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base">schedule</span>
            {readingTimeMinutes(article.content)} min read
          </span>
          <PostViewCount count={viewCount} iconClass="text-base" />
        </div>
        {article.featured_image && (
          <MediaImage
            src={article.featured_image}
            alt={article.title}
            size="medium"
            eager
            className="mt-8 rounded-2xl"
          />
        )}
        <div
          className="prose-content mt-8"
          dangerouslySetInnerHTML={{ __html: marked.parse(article.content || '') }}
        />
      </article>
    </AppLayout>
  );
}
