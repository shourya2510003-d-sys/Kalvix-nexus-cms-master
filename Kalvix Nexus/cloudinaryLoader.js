export default function cloudinaryLoader({ src, width, quality }) {
  if (!src.includes('res.cloudinary.com')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}w=${width}&q=${quality || 75}`;
  }
  
  const parts = src.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},q_${quality || 'auto'},f_auto/${parts[1]}`;
  }
  return src;
}
