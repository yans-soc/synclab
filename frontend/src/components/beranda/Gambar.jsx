import { useState } from 'react';
import { urlMedia, urlMediaAsli } from '../../utils/media.js';

// Gambar media dengan varian responsive + fallback ke berkas asli bila varian
// belum ada (mis. unggahan lama), dan reservasi rasio aspek agar CLS = 0.
export default function Gambar({
  src,
  alt = '',
  ukuran = 'small',
  rasio = 'aspect-video',
  className = '',
  imgClassName = '',
  eager = false,
}) {
  const [gagal, setGagal] = useState(false);
  if (!src) return null;
  const sumber = gagal ? urlMediaAsli(src) : urlMedia(src, ukuran);
  return (
    <div className={`overflow-hidden bg-surface-container dark:bg-slate-800 ${rasio} ${className}`}>
      <img
        src={sumber}
        alt={alt}
        onError={() => setGagal(true)}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={eager ? 'high' : 'auto'}
        decoding="async"
        className={`h-full w-full object-cover ${imgClassName}`}
      />
    </div>
  );
}
