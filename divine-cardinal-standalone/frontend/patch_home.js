const fs = require('fs');
let content = fs.readFileSync('src/app/HomeClient.tsx', 'utf8');

const heroComponent = `
const HeroCarousel = ({ section }: { section: any }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  const slides = section.data.slides || [];
  const interval = (section.data.sliderInterval || 5) * 1000;

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval]);

  if (slides.length === 0) return null;
  const currentSlide = slides[currentIndex];

  return (
    <section className="relative h-[75vh] flex items-center overflow-hidden w-full transition-all duration-700">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 z-0"
        >
          {currentSlide.mediaType === 'video' ? (
            <video
              src={currentSlide.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-right md:object-center"
            />
          ) : (
            <img
              src={currentSlide.mediaUrl}
              alt="Banner"
              className="w-full h-full object-cover object-right md:object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIndex + '-text'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md space-y-4"
          >
            {currentSlide.subtitle && (
              <span className="text-xs tracking-[0.3em] uppercase block font-serif opacity-80">
                {currentSlide.subtitle}
              </span>
            )}
            {currentSlide.title && (
              <h1 className="text-3xl sm:text-5xl leading-tight tracking-wide font-normal">
                {currentSlide.title}
              </h1>
            )}
            {currentSlide.description && (
              <p className="text-xs sm:text-sm font-light max-w-sm leading-relaxed opacity-90">
                {currentSlide.description}
              </p>
            )}
            {currentSlide.buttonText && currentSlide.buttonLink && (
              <div className="pt-4">
                <Link
                  href={currentSlide.buttonLink}
                  className="inline-block bg-[#DE5D68] hover:bg-[#c94b56] text-white text-[11px] uppercase tracking-[0.2em] px-8 py-3.5 shadow-md font-sans font-medium transition-colors"
                >
                  {currentSlide.buttonText}
                </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center space-x-2">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={"w-2 h-2 rounded-full transition-all " + (idx === currentIndex ? "bg-[#1A1A1A] w-6" : "bg-gray-400")}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default function HomeClient`;
content = content.replace('export default function HomeClient', heroComponent);

const mapRegex = /\{\s*sortedLayout\s*\.filter\(section => section\.visible\)\s*\.map\(\(section\) => \{\s*switch \(section\.id\) \{/;

if (mapRegex.test(content)) {
  content = content.replace(mapRegex, `{sortedLayout
        .filter(section => section.visible)
        .map((section) => {
          const sectionStyle: React.CSSProperties = {
            backgroundColor: section.styles?.backgroundColor || 'transparent',
            color: section.styles?.textColor || 'inherit',
            textAlign: (section.styles?.textAlignment || 'left') as any,
          };
          const fontClass = section.styles?.fontFamily && section.styles.fontFamily !== 'inherit' ? section.styles.fontFamily : '';

          const content = (() => {
            switch (section.id) {`);
}

const mapEndRegex = /default:\s*return null;\s*\}\s*\}\)\}/;
if (mapEndRegex.test(content)) {
  content = content.replace(mapEndRegex, `default:
              return null;
          }
          })();

          return (
            <div key={section.id} style={sectionStyle} className={\`\${fontClass}\`}>
              {content}
            </div>
          );
        })}`);
}

const heroBannerRegex = /case 'hero_banner':[\s\S]*?(?=case 'slow_beauty':)/;
content = content.replace(heroBannerRegex, `case 'hero_banner':
              return <HeroCarousel section={section} />;
            
            `);

fs.writeFileSync('src/app/HomeClient.tsx', content);
