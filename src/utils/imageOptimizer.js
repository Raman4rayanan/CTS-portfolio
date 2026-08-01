export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !url.includes('f_auto') && !url.includes('q_auto')) {
    return url.replace('/upload/', '/upload/f_auto,q_auto/');
  }
  return url;
}
