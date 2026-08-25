import { Link } from 'react-router-dom';
import PostViewCount from '../home/PostViewCount.jsx';
import { formatDate, timeAgo } from '../../utils/format.js';

// Shared thread card. Rendering this card never affects counters; a view
// only counts when the visitor qualifies on the thread detail page.
export default function ThreadCard({ thread, showCategory = true }) {
  if (!thread) return null;
  return (
    <article className="flex gap-4 rounded-2xl border border-surface-container-high bg-surface-container-lowest p-4 transition hover:border-primary/40 hover:shadow-lg sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <span className="material-symbols-outlined text-lg text-primary">forum</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {thread.is_pinned && (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <span className="material-symbols-outlined text-xs">keep</span>
              Pinned
            </span>
          )}
          {showCategory && thread.category && (
            <Link
              to={`/community/category/${thread.category.slug}`}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
            >
              {thread.category.name}
            </Link>
          )}
        </div>
        <h3 className="mt-1 font-headline text-base font-bold leading-snug text-slate-900 dark:text-white">
          <Link
            to={`/community/thread/${thread.slug}`}
            className="line-clamp-2 hover:text-primary"
          >
            {thread.title}
          </Link>
        </h3>
        {thread.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
            {thread.excerpt}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">person</span>
            {thread.author?.full_name || 'Member'}
          </span>
          <PostViewCount count={thread.view_count} />
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">chat_bubble</span>
            {thread.reply_count}
          </span>
          {thread.reaction_count > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">favorite</span>
              {thread.reaction_count}
            </span>
          )}
          <span className="ml-auto">
            {thread.last_reply_at
              ? `active ${timeAgo(thread.last_reply_at)}`
              : formatDate(thread.created_at)}
          </span>
        </div>
      </div>
    </article>
  );
}
