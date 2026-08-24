import { formatViewCount } from '../../utils/format.js';

// Satu-satunya komponen tampilan view count; dipakai di kartu artikel,
// halaman detail, dan seluruh section publik. Sumber angka selalu
// field jumlah_dilihat dari data artikel (counter otoritatif).
export default function PostViewCount({ jumlah, className = '', ikonClass = 'text-sm' }) {
  if (jumlah === undefined || jumlah === null) return null;
  return (
    <span className={`flex items-center gap-1 ${className}`} title={`${jumlah} kali dilihat`}>
      <span className={`material-symbols-outlined ${ikonClass}`}>visibility</span>
      {formatViewCount(jumlah)}
    </span>
  );
}
