import { formatViewCount } from '../../utils/format.js';

// The only view-count display component; used in article cards,
// the detail page, and every public section. The number always comes from
// the view_count field of the article data (authoritative counter).
export default function PostViewCount({ count, className = '', iconClass = 'text-sm' }) {
  if (count === undefined || count === null) return null;
  return (
    <span className={`flex items-center gap-1 ${className}`} title={`${count} views`}>
      <span className={`material-symbols-outlined ${iconClass}`}>visibility</span>
      {formatViewCount(count)}
    </span>
  );
}
