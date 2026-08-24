export default function Ikon({ nama, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {nama}
    </span>
  );
}
