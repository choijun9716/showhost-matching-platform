export const getOptimizedImageUrl = (url, width = 400) => {
  if (!url) return '';
  if (!url.startsWith('http')) return url;
  if (url.includes('wsrv.nl')) return url;

  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80&maxage=31536000`;
};
