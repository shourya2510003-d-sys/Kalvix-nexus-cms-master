/**
 * Helper to optimize Cloudinary URLs by adding f_auto (format), q_auto (quality), and width transformations.
 * This dramatically reduces image sizes (e.g., from 10MB to 50KB) and ensures instant loading.
 */
export function optimizeCloudinaryUrl(url: string | null | undefined, width: number = 800): string {
  if (!url) return '';
  
  // Only optimize Cloudinary image URLs
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // Avoid double optimization if transformations are already present
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) {
      return url;
    }
    return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
  }
  
  return url;
}
