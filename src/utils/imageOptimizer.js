export function optimizeCloudinaryUrl(url, width = 'auto') {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // If it already has f_auto,q_auto from an old script, strip it out to avoid duplication
    let cleanUrl = url.replace('/f_auto,q_auto/', '/');
    return cleanUrl.replace('/upload/', `/upload/w_${width},c_limit,dpr_auto,f_auto,q_auto/`);
  }
  return url;
}
