export function readingTimeMinutes(content) {
  const wordsPerMinute = 200;
  const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

// The single view-count formatter for the entire frontend.
// 999 -> "999", 1250 -> "1.2K", 12840 -> "12.8K", 1200000 -> "1.2M"
export function formatViewCount(n) {
  const value = Number(n) || 0;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function formatNumber(n) {
  const value = Number(n) || 0;
  if (value >= 1000000) return `${(value / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  if (value >= 1000) return `${(value / 1000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
  return value.toLocaleString('en-US');
}
