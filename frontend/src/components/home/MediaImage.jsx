import { useState } from 'react';
import { mediaUrl, originalMediaUrl } from '../../utils/media.js';

// Media image with responsive variants + fallback to the original file when variants
// are missing (e.g. old uploads), plus aspect-ratio reservation so CLS = 0.
export default function MediaImage({
  src,
  alt = '',
  size = 'small',
  ratio = 'aspect-video',
  className = '',
  imgClassName = '',
  eager = false,
}) {
  const [failed, setFailed] = useState(false);
  if (!src) return null;
  const source = failed ? originalMediaUrl(src) : mediaUrl(src, size);
  return (
    <div className={`overflow-hidden bg-surface-container dark:bg-slate-800 ${ratio} ${className}`}>
      <img
        src={source}
        alt={alt}
        onError={() => setFailed(true)}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : 'auto'}
        decoding="async"
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
