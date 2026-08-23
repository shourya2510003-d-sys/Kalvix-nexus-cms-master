const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/HomeClient.tsx', 'utf8');
code = code.replace(/<img /g, '<img loading="lazy" ');
code = code.replace(/<img\n/g, '<img loading="lazy"\n');
// Ensure HeroCarousel images are eager (first image at least)
// Actually, HeroCarousel uses `<img src={currentSlide.mediaUrl}` which will get replaced.
// For hero banner, it's fine. Next.js natively handles <Image priority> but we are using native <img>.
fs.writeFileSync('frontend/src/app/HomeClient.tsx', code);
console.log('Lazy loading added');
