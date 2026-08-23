'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { ArrowRight, Star, Heart, ArrowLeftRight, Play, X, ChevronRight, ChevronLeft, Award, Instagram, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, ref, set, onValue } from '../lib/firebase';
import { DEFAULT_HOMEPAGE_LAYOUT } from '../lib/defaultLayout';
import { optimizeCloudinaryUrl } from '../lib/cloudinary';
import { getProductStats, getHomepageReviews } from '../lib/reviews';
import { useCurrency } from '../context/CurrencyContext';

interface HomeClientProps {
  banners: any[];
  bestSellers: any[];
  pageId?: string;
  previewLayout?: any[];
  initialLayout?: any[];
}

// Helper: returns Tailwind object-fit class based on stored fitMode value
const getFitClass = (fitMode?: string) => {
  if (fitMode === 'stretch') return 'object-fill';
  if (fitMode === 'contain') return 'object-contain';
  return 'object-cover'; // default: crop to fit
};

const BackgroundVideo = ({ src, mobileSrc, className, priority = false }: { src: string; mobileSrc?: string; className: string; priority?: boolean }) => {
  const [isMuted, setIsMuted] = React.useState(true);
  const [isInView, setIsInView] = React.useState(priority);
  const [isMobile, setIsMobile] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (priority) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load video slightly before it comes into view
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [priority]);
  
  const currentSrc = isMobile && mobileSrc ? mobileSrc : src;

  return (
    <div ref={containerRef} className="relative w-full h-full group/video bg-black/5">
      {isInView && (
        <>
          <video src={currentSrc} className={className} autoPlay loop muted={isMuted} playsInline />
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMuted(!isMuted); }}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-opacity opacity-0 group-hover/video:opacity-100"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </>
      )}
    </div>
  );
};

const HeroCarousel = ({ section }: { section: any }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  const slides = section.data.slides || (section.data.image ? [{
    id: 'legacy-slide',
    mediaType: 'image',
    mediaUrl: section.data.image,
    title: section.data.title,
    subtitle: section.data.subtitle,
    description: section.data.description,
    buttonText: section.data.buttonText,
    buttonLink: section.data.buttonLink
  }] : []);
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
            <BackgroundVideo
              src={currentSlide.mediaUrl}
              mobileSrc={currentSlide.mobileMediaUrl}
              priority={true}
              className="w-full h-full object-cover object-right md:object-center"
            />
          ) : (
            <>
              {/* Desktop Image */}
              <img loading="lazy"
                src={optimizeCloudinaryUrl(currentSlide.mediaUrl, 1200)}
                alt="Banner"
                className={`hidden md:block w-full h-full ${
                  currentSlide.imageFit === 'contain'
                    ? 'object-contain'
                    : currentSlide.imageFit === 'fill'
                    ? 'object-fill'
                    : 'object-cover'
                } object-right md:object-center`}
              />
              {/* Mobile Image */}
              <img loading="lazy"
                src={optimizeCloudinaryUrl(currentSlide.mobileMediaUrl || currentSlide.mediaUrl, 800)}
                alt="Banner Mobile"
                className={`block md:hidden w-full h-full ${
                  currentSlide.imageFit === 'contain'
                    ? 'object-contain'
                    : currentSlide.imageFit === 'fill'
                    ? 'object-fill'
                    : 'object-cover'
                } object-center`}
              />
            </>
          )}
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

const InstagramMediaItem = ({ media, isVideo, finalSrc }: { media: any, isVideo: boolean, finalSrc: string }) => {
  const [isMuted, setIsMuted] = React.useState(true);

  return (
    <a 
      href={media.link || "https://instagram.com/divinecardinal"} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="relative rounded-xl overflow-hidden aspect-[9/16] bg-gray-800 group block cursor-pointer"
    >
      {isVideo ? (
        <>
          <video src={finalSrc} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" autoPlay loop muted={isMuted} playsInline />
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors z-20"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </>
      ) : (
        <img loading="lazy" src={optimizeCloudinaryUrl(media.src || media.img, 400)} alt="Social Media Content" className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${getFitClass(media.fitMode)}`} />
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="text-white bg-black/50 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-sm pointer-events-auto">View on Instagram</span>
      </div>
    </a>
  );
};

const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const cleaned = String(price).replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};

export default function HomeClient({ banners, bestSellers, pageId = 'home', previewLayout, initialLayout }: HomeClientProps) {
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const [layout, setLayout] = useState<any[]>(previewLayout || initialLayout || DEFAULT_HOMEPAGE_LAYOUT);
  
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const bestSellerSliderRef = React.useRef<HTMLDivElement>(null);
  
  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollBestSellerSlider = (direction: 'left' | 'right') => {
    if (bestSellerSliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      bestSellerSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Trusted Tales state
  const [talesLikes, setTalesLikes] = useState<Record<number, number>>({
    0: 120, 1: 340, 2: 89, 3: 212, 4: 512
  });
  const [talesLiked, setTalesLiked] = useState<Record<number, boolean>>({});

  const toggleTalesLike = (index: number) => {
    setTalesLiked(prev => {
      const liked = !prev[index];
      setTalesLikes(likes => ({
        ...likes,
        [index]: likes[index] + (liked ? 1 : -1)
      }));
      return { ...prev, [index]: liked };
    });
  };

  // Quiz State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizRecommendation, setQuizRecommendation] = useState<any | null>(null);

  const quizSection = layout.find(s => s.id === 'quiz_banner');
  const quizQuestions = quizSection?.data?.questions || [
    {
      key: 'skinType',
      question: 'What is your skin type?',
      options: ['Oily Skin', 'Dry Skin', 'Normal Skin', 'Sensitive Skin']
    }
  ];
  const quizRecommendations = quizSection?.data?.recommendations || [];

  const handleQuizAnswer = (value: string) => {
    const key = quizQuestions[quizStep].key;
    const newAnswers = { ...quizAnswers, [key]: value };
    setQuizAnswers(newAnswers);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(prev => prev + 1);
    } else {
      let matchedSku = 'DC-ROSE-DAY-50'; // Default static fallback

      // Evaluate dynamic rules
      for (const rec of quizRecommendations) {
        if (rec.conditionKey === 'default') {
          matchedSku = rec.productSku;
        } else if ((newAnswers as any)[rec.conditionKey] === rec.conditionValue) {
          matchedSku = rec.productSku;
          break; // Stop at first match
        }
      }

      // Find real product from bestSellers
      const realProduct = bestSellers?.find(p => p.sku === matchedSku || p.variants?.[0]?.sku === matchedSku);
      
      let recommended;
      if (realProduct) {
        recommended = {
          name: realProduct.name,
          price: Number(realProduct.basePrice || realProduct.variants?.[0]?.price || 0),
          image: realProduct.images?.[0]?.url || '/bottle3.webp',
          desc: realProduct.summary || realProduct.description || '',
          sku: matchedSku,
          realItem: realProduct // Store reference to real item for add to bag
        };
      } else {
        recommended = {
          name: 'Rose Day Care (Normal Skin)',
          price: 1700,
          image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400',
          desc: 'A light nourishing daytime serum formulated with pure Rose oil & Ayurvedic extracts.',
          sku: matchedSku
        };
      }

      setQuizRecommendation(recommended);
      setQuizStep(quizQuestions.length);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setQuizRecommendation(null);
  };

  const [activeArticle, setActiveArticle] = useState<any | null>(null);

  // User reviews states
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5, image: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [homepageLayout, setHomepageLayout] = useState<any[]>(initialLayout || []);

  // Load layout from localStorage immediately (before Firebase)
  // Listen for localStorage changes from admin tab (cross-tab sync for preview only)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === `dc_layout_${pageId}` && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHomepageLayout(parsed);
          }
        } catch (_) {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pageId]);

  useEffect(() => {
    const reviewsRef = ref(db, 'reviews');
    const unsubscribeReviews = onValue(
      reviewsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const approvedList = Object.values(data).filter((r: any) => r.status === 'approved');
          setReviewsList(approvedList);
        } else {
          setReviewsList([]);
        }
      },
      (_error) => { /* silently ignore review read errors */ }
    );

    return () => {
      unsubscribeReviews();
    };
  }, []);

  const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReview(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      alert("Please fill out both your name and review feedback.");
      return;
    }
    setSubmittingReview(true);
    const reviewId = `rev_${Date.now()}`;
    const payload = {
      id: reviewId,
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      image: newReview.image || '',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'pending'
    };
    try {
      await set(ref(db, `reviews/${reviewId}`), payload);
      alert("Thank you! Your review has been submitted for moderation and will appear live once verified by our team.");
      setIsReviewModalOpen(false);
      setNewReview({ name: '', comment: '', rating: 5, image: '' });
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const triggerFlyToCart = (e: React.MouseEvent | undefined, imageUrl?: string) => {
    if (!e) return;
    const el = document.createElement(imageUrl ? 'img' : 'div');
    if (imageUrl && el instanceof HTMLImageElement) {
      el.src = imageUrl;
      el.style.width = '150px';
      el.style.height = '150px';
      el.style.objectFit = 'cover';
      el.style.borderRadius = '8px';
      el.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    } else {
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundColor = '#B89B5E';
      el.style.borderRadius = '50%';
    }
    el.style.position = 'fixed';
    el.style.left = `${e.clientX - (imageUrl ? 75 : 12)}px`;
    el.style.top = `${e.clientY - (imageUrl ? 75 : 12)}px`;
    el.style.zIndex = '9999';
    el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);

    const cartIcon = document.getElementById('cart-icon-nav');
    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect();
      setTimeout(() => {
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
        el.style.transform = 'scale(0.1) rotate(15deg)';
        el.style.opacity = '0.2';
      }, 50);
    } else {
      setTimeout(() => {
        el.style.left = `calc(100vw - 60px)`;
        el.style.top = `20px`;
        el.style.transform = 'scale(0.1) rotate(15deg)';
        el.style.opacity = '0.2';
      }, 50);
    }

    setTimeout(() => {
      if (document.body.contains(el)) {
        document.body.removeChild(el);
      }
    }, 850);
  };

  const handleQuickAdd = (product: any, e?: React.MouseEvent) => {
    const variant = product.variants?.[0] || {};
    const imageUrl = product.images?.[0]?.url || product.image;
    addItem({
      variantId: variant.id || variant.sku || product.id,
      quantity: 1,
      price: Number(product.basePrice || variant.price || 0),
      name: product.name,
      sku: variant.sku || 'default-sku',
      image: imageUrl,
      variantTitle: variant.title || 'Standard',
    });
    triggerFlyToCart(e, imageUrl);
  };

  const handleQuizAddToBag = (item: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (item.realItem) {
      // It's a real product, use handleAddToBag
      handleQuickAdd(item.realItem, e);
      return;
    }

    addItem({
      variantId: item.sku || `quiz-${Date.now()}`,
      quantity: 1,
      price: Number(item.price),
      name: item.name,
      sku: item.sku || 'quiz-item',
      image: item.image,
      variantTitle: 'Default',
    });
    triggerFlyToCart(e, item.image);
  };

  // The actual layout to render: use DB layout if it exists and has items, else default
  const activeLayout = previewLayout 
    ? previewLayout 
    : (homepageLayout.length > 0 ? homepageLayout : (pageId === 'home' ? DEFAULT_HOMEPAGE_LAYOUT : []));

  // Ensure sections are rendered in the defined order
  const sortedLayout = [...activeLayout].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-24 pb-24 bg-luxury-cream dark:bg-[#0A0A0A] transition-colors duration-300">
      {sortedLayout
        .filter(section => section.visible)
        .map((section) => {
          const sectionStyle: React.CSSProperties = {
            backgroundColor: section.styles?.backgroundColor || 'transparent',
            color: section.styles?.textColor || 'inherit',
            textAlign: (section.styles?.textAlignment || 'left') as any,
          };
          const fontClass = section.styles?.fontFamily && section.styles.fontFamily !== 'inherit' ? section.styles.fontFamily : '';

          const content = (() => {
            const baseId = section.id.replace(/_\d+$/, '');
            switch (baseId) {
            case 'hero_banner':
              return <HeroCarousel section={section} />;

            case 'text_paragraph':
              return (
                <section key={section.id} className="max-w-4xl mx-auto px-6 sm:px-8 py-12">
                  {section.data.title && (
                    <h2 className="text-3xl font-serif text-center mb-10 text-luxury-charcoal">
                      {section.data.title}
                    </h2>
                  )}
                  <div className="space-y-8">
                    {(section.data.blocks || []).map((block: any, idx: number) => (
                      <div key={idx} className="space-y-4">
                        {block.heading && (
                          <h3 className="text-xl font-serif text-luxury-gold">
                            {block.heading}
                          </h3>
                        )}
                        {block.paragraph && (
                          <div className="text-sm font-sans font-light text-luxury-charcoal/80 leading-relaxed whitespace-pre-wrap">
                            {block.paragraph}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            

            case 'slow_beauty':
              return (
                <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  <div className="lg:col-span-5 space-y-6">
                    <h2 className="text-2xl sm:text-3.5xl font-serif text-luxury-charcoal tracking-wide">
                      {section.data.title}
                    </h2>
                    <p className="text-sm text-luxury-charcoal/70 leading-relaxed font-sans font-light">
                      {section.data.description}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={section.data.buttonLink}
                        className="inline-flex items-center space-x-2 border border-luxury-gold/50 text-luxury-charcoal px-6 py-3 text-xs uppercase tracking-widest font-serif hover:bg-luxury-gold hover:text-white transition-colors"
                      >
                        <span>{section.data.buttonText}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                  <div className="lg:col-span-7 relative h-[380px] bg-white border border-luxury-gold/15 p-2.5 shadow-lg group overflow-hidden">
                    {(() => {
                      const videoSrc = section.data.videoImage || 'https://kalvix-nexus-production.up.railway.app/uploads/1783752704651-371936797.mp4';
                      return (
                        <BackgroundVideo src={videoSrc}
                          priority={true}
                          className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${getFitClass(section.data.fitMode)}`} />
                      );
                    })()}
                    <div className="absolute inset-0 bg-black/25 flex flex-col justify-between p-6 text-white">
                      <span className="text-[11px] tracking-[0.25em] uppercase font-serif text-luxury-gold">{section.data.videoSubtitle}</span>
                      <div className="flex items-center space-x-4">
                        <button className="bg-white/80 hover:bg-white text-luxury-charcoal p-4 rounded-full shadow-lg transition-transform group-hover:scale-105">
                          <Play className="h-5 w-5 fill-luxury-charcoal ml-0.5" />
                        </button>
                        <div>
                          <h4 className="font-serif text-lg leading-tight">{section.data.videoTitleLine1}</h4>
                          <p className="text-[11px] tracking-[0.2em] uppercase font-serif text-luxury-gold mt-0.5">{section.data.videoTitleLine2}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'seasonal_indulgences':
              return (
                <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8">
                  <div className="flex justify-between items-end border-b border-luxury-gold/15 pb-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal tracking-wide">{section.data.title}</h2>
                      <div className="w-12 h-[1px] bg-luxury-gold mt-2" />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="hidden sm:flex space-x-2">
                        <button onClick={() => scrollSlider('left')} className="p-2 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold transition-colors rounded-full">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => scrollSlider('right')} className="p-2 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold transition-colors rounded-full">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <Link
                        href={section.data.buttonLink}
                        className="text-[10px] uppercase tracking-[0.25em] text-luxury-gold hover:text-luxury-goldDark font-sans font-medium transition-colors"
                      >
                        {section.data.buttonText}
                      </Link>
                    </div>
                  </div>
                  <div className="relative group/slider">
                    <div ref={sliderRef} className="flex overflow-x-auto gap-6 sm:gap-8 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {bestSellers.map((product, idx) => (
                        <div key={product.id} className="snap-start flex-none w-[280px] sm:w-[320px] group flex flex-col bg-white border border-luxury-gold/10 p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="relative h-64 bg-luxury-cream overflow-hidden flex items-center justify-center p-4 border border-luxury-gold/5">
                            <span className="absolute top-3 left-3 bg-[#1C1C1C] text-white text-[8px] tracking-widest uppercase px-2.5 py-1 font-sans">
                              {idx % 2 === 0 ? 'Trending Now' : 'New Arrival'}
                            </span>
                            <img loading="lazy"
                              src={optimizeCloudinaryUrl(product.images?.[0]?.url, 400) || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400'}
                              alt={product.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full border border-luxury-gold/10 hover:bg-white transition-colors cursor-pointer">
                              <Heart className="h-3.5 w-3.5 text-luxury-charcoal hover:fill-red-600 hover:text-red-600 transition-colors" />
                            </div>
                          </div>
                          <div className="mt-4 flex-1 flex flex-col justify-between space-y-2 text-left">
                            <div>
                              <div className="flex items-center space-x-1 text-xs text-yellow-600 mb-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                                ))}
                                <span className="text-[10px] text-luxury-charcoal/50 ml-1">
                                  {(product.rating || getProductStats(product.id).rating).toFixed(1)} <span className="mx-1">•</span> {product.reviewCount || getProductStats(product.id).reviewCount} reviews
                                </span>
                              </div>
                              <h3 className="font-serif text-sm tracking-wide text-luxury-charcoal group-hover:text-luxury-gold transition-colors font-medium">
                                <Link href={`/products/${product.slug}`}>{product.name}</Link>
                              </h3>
                              <p className="text-[11px] text-luxury-charcoal/60 line-clamp-1 mt-0.5 font-light leading-relaxed font-sans">
                                {product.summary}
                              </p>
                              <p className="text-[10px] text-luxury-charcoal/50 font-sans mt-1">
                                {product.variants?.[0]?.title || '50 ml'}
                              </p>
                            </div>
                            <div className="pt-2 flex items-center justify-between border-t border-luxury-gold/5">
                              <div className="flex items-center space-x-2">
                                {parsePrice(product.compareAtPrice) > parsePrice(product.basePrice) && (
                                  <span className="text-xs line-through text-gray-500">{formatPrice(parsePrice(product.compareAtPrice))}</span>
                                )}
                                <span className="font-serif font-normal text-sm text-red-600">{formatPrice(parsePrice(product.basePrice))}</span>
                                {parsePrice(product.compareAtPrice) > parsePrice(product.basePrice) && (
                                  <span className="text-[10px] text-green-600">Save {(parsePrice(product.compareAtPrice) - parsePrice(product.basePrice)).toFixed(0)}</span>
                                )}
                              </div>
                              <button
                                onClick={(e) => handleQuickAdd(product, e)}
                                className="text-[9px] uppercase tracking-widest border border-luxury-gold px-3.5 py-1.5 hover:bg-luxury-gold hover:text-white transition-colors font-serif whitespace-nowrap"
                              >
                                Add to Bag
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );

            case 'shop_by_concern':
              return (
                <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal tracking-wide uppercase">{section.data.title}</h2>
                    <div className="w-16 h-[1px] bg-luxury-gold mx-auto mt-2" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {section.data.items.map((con: any) => (
                      <Link href={con.link || '/shop'} key={con.name} className="group relative flex flex-col items-center cursor-pointer">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-luxury-gold/15 overflow-hidden shadow-sm relative flex items-center justify-center p-2 bg-white">
                          <img loading="lazy"
                            src={optimizeCloudinaryUrl(con.img, 300)}
                            alt={con.name}
                            className={`w-full h-full rounded-full ${getFitClass(con.fitMode)} grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105`}
                          />
                          <div className="absolute inset-0 bg-black/10 rounded-full group-hover:bg-transparent transition-all" />
                        </div>
                        <span className="mt-4 font-serif text-sm text-luxury-charcoal group-hover:text-luxury-gold transition-colors tracking-wide text-center">
                          {con.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );

            case 'trusted_tales':
              return (
                <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8 overflow-hidden">
                  <div className="text-left space-y-1.5">
                    <h2 className="text-2.5xl sm:text-3.5xl font-serif text-luxury-charcoal tracking-widest font-normal uppercase">
                      {section.data.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-luxury-charcoal/70 font-sans font-light" dangerouslySetInnerHTML={{ __html: section.data.subtitleHtml }} />
                  </div>
                  <div className="relative">
                    <div className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-1" id="tales-slider">
                      {section.data.items.map((tale: any, idx: number) => (
                        <div key={idx} className="flex-shrink-0 w-64 bg-white border border-luxury-gold/15 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                          <div className="relative h-[340px] bg-luxury-cream overflow-hidden">
                            {tale.mediaType === 'video' ? (
                              <BackgroundVideo src={tale.img} className={`w-full h-full transition-transform duration-700 group-hover:scale-103 ${getFitClass(tale.fitMode)}`} />
                            ) : (
                              <img loading="lazy" src={optimizeCloudinaryUrl(tale.img, 400)} alt={tale.title} className={`w-full h-full transition-transform duration-700 group-hover:scale-103 ${getFitClass(tale.fitMode)}`} />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-between p-4 text-white">
                              <span className="text-[9px] uppercase tracking-widest text-luxury-gold bg-black/40 px-2 py-0.5 self-start rounded font-sans font-light">
                                @divinecardinal
                              </span>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-1">
                                  <Heart 
                                    onClick={() => toggleTalesLike(idx)}
                                    className={`h-4.5 w-4.5 cursor-pointer hover:scale-110 active:scale-95 transition-transform ${talesLiked[idx] ? 'text-red-500 fill-red-500' : 'text-white'}`} 
                                  />
                                  <span className="text-[10px] font-sans font-medium text-white/90">{talesLikes[idx] || tale.likes}</span>
                                </div>
                                <Play className="h-4.5 w-4.5 text-white/90 cursor-pointer hover:scale-110 transition-transform" />
                              </div>
                            </div>
                          </div>
                          <div className="p-4 space-y-1.5 text-left bg-[#FAF9F6]/30">
                            <h4 className="font-serif text-xs font-semibold text-luxury-charcoal line-clamp-1">{tale.title}</h4>
                            <p className="text-[10.5px] font-sans text-gray-500 line-clamp-2 leading-relaxed font-light">{tale.desc}</p>
                            <div className="flex items-center justify-between pt-1 border-t border-luxury-gold/5">
                              <span className="text-xs font-serif text-luxury-gold font-medium">{tale.price}</span>
                              <Link href={tale.shopLink || "/shop"} className="text-[9px] uppercase font-sans tracking-widest text-[#008060] font-semibold hover:underline">
                                Shop &gt;
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { const el = document.getElementById('tales-slider'); if (el) el.scrollLeft -= 280; }} className="absolute left-[-16px] top-[40%] translate-y-[-50%] bg-white/95 hover:bg-white text-luxury-charcoal border border-luxury-gold/25 p-2 rounded-full shadow-md z-10 transition-colors">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => { const el = document.getElementById('tales-slider'); if (el) el.scrollLeft += 280; }} className="absolute right-[-16px] top-[40%] translate-y-[-50%] bg-white/95 hover:bg-white text-luxury-charcoal border border-luxury-gold/25 p-2 rounded-full shadow-md z-10 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </section>
              );

            case 'quiz_banner':
              return (
                <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
                  <div className="relative rounded-lg overflow-hidden h-[420px] shadow-lg border border-luxury-gold/15">
                    <img loading="lazy" src={optimizeCloudinaryUrl(section.data.image, 1200)} alt="Beauty routine background" className={`w-full h-full ${getFitClass(section.data.fitMode)}`} />
                    <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <span className="text-xs sm:text-sm text-luxury-goldLight tracking-[0.4em] uppercase font-sans font-light">
                        {section.data.subtitle}
                      </span>
                      <h2 className="text-3xl sm:text-5xl text-white font-serif tracking-widest font-normal uppercase">
                        {section.data.title}
                      </h2>
                      <div className="w-16 h-[1.5px] bg-luxury-goldLight" />
                      <p className="max-w-md text-xs sm:text-sm text-white/90 font-sans font-light leading-relaxed">
                        {section.data.description}
                      </p>
                      <button 
                        onClick={() => setIsQuizOpen(true)}
                        className="bg-luxury-gold hover:bg-luxury-goldDark text-white px-8 py-3.5 text-xs uppercase tracking-widest font-serif font-normal transition-all hover:scale-103 shadow-md"
                      >
                        {section.data.buttonText}
                      </button>
                    </div>
                  </div>
                </section>
              );

            case 'best_sellers':
              {
                let selectedProducts = bestSellers;
                if (section.data.categorySlug) {
                  // Filter by category slug — show ALL products from that category
                  selectedProducts = bestSellers.filter((p: any) =>
                    p.categories?.some((c: any) => c.slug === section.data.categorySlug)
                  );
                } else if (Array.isArray(section.data.productIds) && section.data.productIds.length > 0) {
                  selectedProducts = section.data.productIds
                    .map((id: string) => bestSellers.find((p: any) => p.id === id || p.sku === id))
                    .filter(Boolean);
                }
                return (
                  <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 py-12 space-y-8">
                    <div className="flex justify-between items-end border-b border-luxury-gold/15 pb-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal tracking-wide uppercase">
                          {section.data.title || 'BEST SELLERS'}
                        </h2>
                        {section.data.subtitle && (
                          <p className="text-xs text-gray-500 font-sans mt-1">
                            {section.data.subtitle}
                          </p>
                        )}
                        <div className="w-12 h-[1px] bg-luxury-gold mt-2" />
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex space-x-2">
                          <button onClick={() => scrollBestSellerSlider('left')} className="p-2 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold transition-colors rounded-full">
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button onClick={() => scrollBestSellerSlider('right')} className="p-2 border border-luxury-gold/30 hover:border-luxury-gold text-luxury-gold transition-colors rounded-full">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        <Link
                          href="/shop"
                          className="text-[10px] uppercase tracking-[0.25em] text-luxury-gold hover:text-luxury-goldDark font-sans font-medium transition-colors"
                        >
                          VIEW ALL &gt;
                        </Link>
                      </div>
                    </div>
                    {section.data.description && (
                      <p className="text-sm text-gray-600 max-w-2xl font-light font-sans leading-relaxed">
                        {section.data.description}
                      </p>
                    )}
                    <div className="relative group/slider">
                      <div ref={bestSellerSliderRef} className="flex overflow-x-auto gap-6 sm:gap-8 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {selectedProducts.map((product) => (
                          <div key={product.id} className="snap-start flex-none w-[280px] sm:w-[320px] group flex flex-col bg-white border border-luxury-gold/10 p-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative h-64 bg-luxury-cream overflow-hidden flex items-center justify-center p-4 border border-luxury-gold/5">
                              <Link href={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
                                <span className="absolute top-3 left-3 bg-[#1C1C1C] text-white text-[8px] tracking-widest uppercase px-2.5 py-1 font-sans z-10">
                                  Top Rated
                                </span>
                                <img loading="lazy"
                                  src={optimizeCloudinaryUrl(product.images?.[0]?.url, 400) || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=400'}
                                  alt={product.name}
                                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                                />
                              </Link>
                              <div className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full border border-luxury-gold/10 hover:bg-white transition-colors cursor-pointer z-20">
                                <Heart className="h-3.5 w-3.5 text-luxury-charcoal hover:fill-red-600 hover:text-red-600 transition-colors" />
                              </div>
                            </div>
                            <div className="mt-4 flex-1 flex flex-col justify-between space-y-2 text-left">
                              <div>
                                <div className="flex items-center space-x-1 text-xs text-yellow-600 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-yellow-600 text-yellow-600" />
                                  ))}
                                  <span className="text-[10px] text-luxury-charcoal/50 ml-1">
                                    {(product.rating || getProductStats(product.id).rating).toFixed(1)} <span className="mx-1">•</span> {product.reviewCount || getProductStats(product.id).reviewCount} reviews
                                  </span>
                                </div>
                                <h3 className="font-serif text-sm tracking-wide text-luxury-charcoal group-hover:text-luxury-gold transition-colors font-medium font-sans">
                                  <Link href={`/products/${product.slug}`}>{product.name}</Link>
                                </h3>
                                <p className="text-[11px] text-luxury-charcoal/60 line-clamp-1 mt-0.5 font-light leading-relaxed font-sans">
                                  {product.summary}
                                </p>
                                <p className="text-[10px] text-luxury-charcoal/50 font-sans mt-1">
                                  {product.variants?.[0]?.title || '50 ml'}
                                </p>
                              </div>
                              <div className="pt-2 flex items-center justify-between border-t border-luxury-gold/5 font-sans">
                                <div className="flex items-center space-x-2">
                                  {parsePrice(product.compareAtPrice) > parsePrice(product.basePrice) && (
                                    <span className="text-xs line-through text-gray-500">{formatPrice(parsePrice(product.compareAtPrice))}</span>
                                  )}
                                  <span className="font-serif font-normal text-sm text-red-600">{formatPrice(parsePrice(product.basePrice))}</span>
                                  {parsePrice(product.compareAtPrice) > parsePrice(product.basePrice) && (
                                    <span className="text-[10px] text-green-600">Save {(parsePrice(product.compareAtPrice) - parsePrice(product.basePrice)).toFixed(0)}</span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => handleQuickAdd(product, e)}
                                  className="text-[9px] uppercase tracking-widest border border-luxury-gold px-3.5 py-1.5 hover:bg-luxury-gold hover:text-white transition-colors font-serif whitespace-nowrap"
                                >
                                  Add to Bag
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              }

            case 'latest_reads':
              return (
                <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 space-y-24">
                  <div className="space-y-8">
                    <div className="flex justify-between items-end border-b border-luxury-gold/15 pb-4">
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal tracking-wide uppercase">{section.data.title}</h2>
                        <div className="w-12 h-[1px] bg-luxury-gold mt-2" />
                      </div>
                      <Link href={section.data.buttonLink} className="text-[10px] uppercase tracking-[0.25em] text-luxury-gold hover:text-luxury-goldDark font-sans font-medium transition-colors">
                        {section.data.buttonText}
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {section.data.items.map((article: any, idx: number) => {
                          const CardWrapper = ({ children }: any) => article.link
                            ? <a href={article.link} key={idx} className="group cursor-pointer block">{children}</a>
                            : <div key={idx} className="group cursor-pointer" onClick={() => setActiveArticle(article)}>{children}</div>;
                          return (
                            <CardWrapper key={idx}>
                              <div className="relative h-64 overflow-hidden bg-gray-100 rounded">
                                {article.mediaType === 'video' ? (
                                  <BackgroundVideo src={article.image} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${getFitClass(article.fitMode)}`} />
                                ) : (
                                  <img loading="lazy" src={optimizeCloudinaryUrl(article.image, 500)} alt={article.title} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${getFitClass(article.fitMode)}`} />
                                )}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-sans tracking-widest uppercase text-luxury-charcoal">
                                  {article.category}
                                </div>
                              </div>
                              <div className="mt-6 space-y-3">
                                <p className="text-[10px] text-gray-400 font-sans tracking-wider">{article.date}</p>
                                <h3 className="font-serif text-lg leading-snug text-luxury-charcoal group-hover:text-luxury-gold transition-colors">{article.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-sans">{article.content}</p>
                              </div>
                            </CardWrapper>
                          );
                        })}
                    </div>
                  </div>
                </section>
              );

            case 'our_story':
              return (
                <section key={section.id} className="bg-[#FAF9F6] border-y border-luxury-gold/15">
                  <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                      <div className="relative h-[500px] rounded-t-full overflow-hidden border-8 border-white shadow-xl">
                        {section.data.mediaType === 'video' ? (
                          <BackgroundVideo src={section.data.image} className={`w-full h-full ${getFitClass(section.data.fitMode)}`} />
                        ) : (
                          <img loading="lazy" src={optimizeCloudinaryUrl(section.data.image, 800)} alt="Our Story" className={`w-full h-full ${getFitClass(section.data.fitMode)}`} />
                        )}
                      </div>
                      <div className="space-y-8 text-center lg:text-left">
                        <div className="space-y-4">
                          <h2 className="text-3xl sm:text-4xl font-serif text-luxury-charcoal tracking-wide">{section.data.title}</h2>
                          <div className="w-16 h-[1px] bg-luxury-gold mx-auto lg:mx-0" />
                        </div>
                        <p className="text-sm text-luxury-charcoal/70 leading-relaxed font-sans font-light max-w-lg mx-auto lg:mx-0">
                          {section.data.description}
                        </p>
                        <div className="pt-4">
                          <p className="font-serif text-xl text-luxury-gold italic">{section.data.signatureText}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'testimonials_slider':
              return (
                <section key={section.id} className="bg-luxury-cream py-16 overflow-hidden">
                  <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar">
                      {section.data.items.map((t: any, idx: number) => {
                          const TestCard = ({ children }: any) => t.link
                            ? <a href={t.link} key={idx} className="snap-center min-w-[300px] w-full md:w-[calc(33.333%-1rem)] bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col flex-shrink-0 hover:shadow-lg transition-shadow">{children}</a>
                            : <div key={idx} className="snap-center min-w-[300px] w-full md:w-[calc(33.333%-1rem)] bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col flex-shrink-0">{children}</div>;
                          return (
                            <TestCard key={idx}>
                              <div className="h-64 w-full bg-gray-200">
                                {t.mediaType === 'video' ? (
                                  <BackgroundVideo src={t.image} className={`w-full h-full ${getFitClass(t.fitMode)}`} />
                                ) : (
                                  <img loading="lazy" src={optimizeCloudinaryUrl(t.image, 400)} alt={t.name} className={`w-full h-full ${getFitClass(t.fitMode)}`} />
                                )}
                              </div>
                              <div className="p-6 flex flex-col flex-grow space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-4 w-4 ${i < (t.rating || 5) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}`} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-gray-400 font-sans">{t.timeAgo}</span>
                                </div>
                                <p className="text-xs text-gray-600 font-sans leading-relaxed">{t.text}</p>
                                <div className="mt-auto pt-4 font-bold font-serif text-sm">{t.name}</div>
                              </div>
                            </TestCard>
                          );
                        })}
                    </div>
                    <div className="text-center pt-8 flex flex-col items-center">
                      <h3 className="font-serif text-lg text-luxury-charcoal mb-2">Rate your experience</h3>
                      <p className="text-xs text-luxury-charcoal/60 mb-4 font-sans max-w-md">Share your experience with others. Click on a star to write a review.</p>
                      <div className="flex items-center space-x-2 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-8 w-8 transition-colors ${star <= newReview.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 hover:fill-yellow-200 hover:text-yellow-200'}`} 
                            onClick={() => {
                              setNewReview(prev => ({ ...prev, rating: star }));
                              setIsReviewModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );

            case 'instagram_integration':
              return (
                <section key={section.id} className="bg-[#0f0f0f] py-20 text-white">
                  <div className="max-w-6xl mx-auto px-6 sm:px-8 space-y-12">
                    <div className="text-center space-y-4">
                      <h4 className="text-luxury-gold uppercase tracking-widest text-[10px] font-semibold">{section.data.subtitle}</h4>
                      <h2 className="text-3xl sm:text-4.5xl font-serif tracking-wide">{section.data.title}</h2>
                      <p className="text-gray-400 font-sans text-xs max-w-lg mx-auto">
                        {section.data.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {section.data.items.map((media: any, idx: number) => {
                        const isVideo = media.reelUrl?.toLowerCase().endsWith('.mp4') || media.reelUrl?.toLowerCase().includes('/video/upload/') || media.src?.toLowerCase().endsWith('.mp4') || media.src?.toLowerCase().includes('/video/upload/');
                        const finalSrc = media.reelUrl || media.src || media.img;
                        return (
                          <InstagramMediaItem key={idx} media={media} isVideo={isVideo} finalSrc={finalSrc} />
                        );
                      })}
                    </div>
                    <div className="text-center pt-8">
                      <Link 
                        href="https://instagram.com/divinecardinal" 
                        target="_blank" 
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-8 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-lg"
                      >
                        <Instagram className="h-5 w-5" />
                        <span>{section.data.buttonText}</span>
                      </Link>
                    </div>
                  </div>
                </section>
              );

            case 'brand_usps':
              return (
                <section key={section.id} className="bg-white py-16">
                  <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
                    <h2 className="text-2xl sm:text-3.5xl font-serif text-luxury-charcoal tracking-wide">
                      {section.data.title}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                      {section.data.items.map((usp: any, idx: number) => {
                          const UspCard = ({ children }: any) => usp.link
                            ? <a href={usp.link} key={idx} className="flex flex-col space-y-4 group hover:opacity-90 transition-opacity">{children}</a>
                            : <div key={idx} className="flex flex-col space-y-4 group">{children}</div>;
                          return (
                            <UspCard key={idx}>
                              <div className="aspect-square w-full overflow-hidden">
                                {usp.mediaType === 'video' ? (
                                  <BackgroundVideo src={usp.img} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${getFitClass(usp.fitMode)}`} />
                                ) : (
                                  <img loading="lazy" src={optimizeCloudinaryUrl(usp.img, 400)} alt={usp.title} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${getFitClass(usp.fitMode)}`} />
                                )}
                              </div>
                              <h4 className="font-serif font-bold text-luxury-charcoal">{usp.title}</h4>
                              <p className="text-xs text-gray-600 leading-relaxed font-sans font-light">{usp.desc}</p>
                            </UspCard>
                          );
                        })}
                    </div>
                  </div>
                </section>
              );

            case 'marketplace_reviews':
              return (
                <section key={section.id} className="bg-[#11161A] text-white py-16">
                  <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-xs uppercase tracking-widest font-sans font-medium text-gray-300">
                        <span className="bg-[#FF9900] text-black px-1.5 py-0.5 rounded font-bold text-[9px] font-sans mr-1">amazon</span>
                        <span className="text-gray-500 mx-1">&</span>
                        <span className="bg-[#FF3F6C] text-white px-1.5 py-0.5 rounded font-bold text-[9px] font-sans mr-1">Myntra</span>
                        Verified Store Reviews
                      </div>
                      <h2 className="text-2.5xl sm:text-3.5xl font-serif tracking-widest uppercase">
                        {section.data.title}
                      </h2>
                      <div className="w-16 h-[1px] bg-luxury-gold mx-auto mt-2" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {section.data.items.map((rev: any, idx: number) => (
                        <div 
                          key={idx}
                          className="bg-[#1A2126] border border-gray-850 p-6 rounded-lg shadow-md flex flex-col justify-between space-y-4 text-left"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-gray-500">Verified Purchase</span>
                              <span className={`text-[10px] text-[${rev.color}] bg-[${rev.color}]/10 border border-[${rev.color}]/30 px-1.5 py-0.5 rounded font-bold font-mono`} style={{ color: rev.color, borderColor: rev.color }}>{rev.rating || 5}.0 ★</span>
                            </div>
                            <h4 className="font-serif text-sm font-semibold text-white tracking-wide">
                              {rev.title}
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed font-sans font-light">
                              "{rev.comment}"
                            </p>
                          </div>
                          <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold text-white block">{rev.reviewer}</span>
                              <span className="text-[9.5px] text-gray-500 font-sans block mt-0.5">{rev.product}</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest font-sans font-semibold" style={{ color: rev.color }}>
                              {rev.platform}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                      <Link 
                        href="https://www.amazon.in/stores/DIVINECARDINAL/page/19531183-B47F-43B7-9263-1A79C706F803?lp_asin=B0FND62F39&ref_=ast_bln" 
                        target="_blank" 
                        className="inline-flex items-center space-x-2 bg-[#FF9900] hover:bg-[#e68a00] text-black px-8 py-3.5 text-xs uppercase tracking-widest font-serif font-bold transition-all hover:scale-103 shadow-md w-full sm:w-auto justify-center"
                      >
                        <span>Our Amazon Store</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link 
                        href="https://www.myntra.com/baby-body-oil/divine+cardinal/divine-cardinal-chamomile-teeting-roll-on--10-ml/35348281/buy" 
                        target="_blank" 
                        className="inline-flex items-center space-x-2 bg-[#FF3F6C] hover:bg-[#e8355f] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-serif font-bold transition-all hover:scale-103 shadow-md w-full sm:w-auto justify-center"
                      >
                        <span>Shop on Myntra</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </section>
              );

            case 'customer_reviews': {
              const staticReviews = getHomepageReviews().map(r => ({ ...r, comment: r.text }));
              const combinedReviews = [...reviewsList, ...staticReviews];
              
              return (
                <section key={section.id} className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
                  <div className="bg-white border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="w-full sm:w-1/3 text-center sm:text-left">
                      <h2 className="text-2xl font-serif text-luxury-charcoal tracking-wide">
                        {section.data.title}
                      </h2>
                      <p className="text-xs text-gray-500 font-sans mt-2">
                        Based on {combinedReviews.length} review{combinedReviews.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="w-full sm:w-1/3 flex flex-col space-y-2 text-xs font-sans text-gray-600">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = combinedReviews.filter(r => r.rating === star).length;
                        const percentage = combinedReviews.length > 0 ? Math.round((count / combinedReviews.length) * 100) : 0;
                        return (
                          <div key={star} className="flex items-center space-x-2">
                            <span className="w-8 text-right">{percentage}%</span>
                            <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="w-8">({count})</span>
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="w-full sm:w-1/3 text-center sm:text-right flex flex-col sm:items-end justify-center">
                      <h4 className="font-serif text-sm text-luxury-charcoal mb-1">Rate this</h4>
                      <div className="flex items-center space-x-1 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-6 w-6 transition-colors ${star <= newReview.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 hover:fill-yellow-200 hover:text-yellow-200'}`} 
                            onClick={() => {
                              setNewReview(prev => ({ ...prev, rating: star }));
                              setIsReviewModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {combinedReviews.length === 0 ? (
                    <div className="bg-white border border-luxury-gold/10 p-12 text-center rounded text-xs text-gray-400 font-sans">
                      {section.data.emptyStateText}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {combinedReviews.map((rev) => (
                        <div key={rev.id} className="bg-white border border-luxury-gold/10 p-6 rounded shadow-sm flex flex-col justify-between space-y-4 text-left">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-serif text-xs font-semibold text-luxury-charcoal">{rev.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{rev.date}</span>
                            </div>
                            <div className="flex space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 font-sans leading-relaxed">{rev.comment}</p>
                          {rev.image && (
                            <div className="pt-2">
                              <div className="w-16 h-16 rounded border border-gray-100 overflow-hidden">
                                <img loading="lazy" src={optimizeCloudinaryUrl(rev.image, 150)} alt="User" className="w-full h-full object-cover" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            }
            case 'available_on_platforms':
              return (
                <section key={section.id} className="py-16 bg-[#F9F9F9] text-center border-t border-gray-200">
                  <div className="max-w-6xl mx-auto px-6">
                    <h3 className="text-xl sm:text-2xl font-serif text-luxury-charcoal mb-8 uppercase tracking-widest">
                      {section.data.title || 'Also Available On'}
                    </h3>
                    <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-10">
                      {(section.data.platforms || []).map((platform: any, idx: number) => (
                        <a
                          key={idx}
                          href={platform.link || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center transform hover:-translate-y-1 transition-all duration-300 bg-white px-6 py-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100"
                          title={`Shop on ${platform.name}`}
                        >
                          {platform.logo ? (
                            <img loading="lazy" src={optimizeCloudinaryUrl(platform.logo, 400)} alt={platform.name} className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain" />
                          ) : (
                            <span className="text-base sm:text-lg font-sans font-semibold text-luxury-charcoal uppercase tracking-widest">{platform.name}</span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                </section>
              );

            default:
              return null;
          }
          })();

          return (
            <div key={section.id} style={sectionStyle} className={`${fontClass}`}>
              {content}
            </div>
          );
        })}

      {/* Write Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg border border-luxury-gold/20 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#FAF9F6]">
                <h3 className="font-serif text-xl text-luxury-charcoal">Write a Review</h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-luxury-charcoal transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-sans mb-1.5">Your Name</label>
                    <input 
                      type="text" required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})}
                      className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold outline-none transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-sans mb-1.5">Rating</label>
                    <div className="flex space-x-2" onMouseLeave={() => setHoverRating(null)}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={`h-7 w-7 cursor-pointer transition-colors ${star <= (hoverRating || newReview.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                          onClick={() => setNewReview({...newReview, rating: star})}
                          onMouseEnter={() => setHoverRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-sans mb-1.5">Your Feedback</label>
                    <textarea 
                      required value={newReview.comment} onChange={e => setNewReview({...newReview, comment: e.target.value})}
                      className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm h-28 resize-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold outline-none transition-all"
                      placeholder="Share your experience with our products..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 font-sans mb-1.5">Photo (Optional)</label>
                    <input 
                      type="file" accept="image/*" onChange={handleReviewImageChange}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-luxury-gold/10 file:text-luxury-charcoal hover:file:bg-luxury-gold/20 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit" disabled={submittingReview}
                      className="w-full bg-luxury-charcoal hover:bg-black text-white py-3.5 rounded text-xs uppercase tracking-widest font-serif transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-sans">
                      All reviews are moderated before publishing to maintain community guidelines.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog Article Modal */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-[#FAF9F6] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl hide-scrollbar"
            >
              <div className="relative h-64 sm:h-80 w-full">
                <img loading="lazy" src={optimizeCloudinaryUrl(activeArticle.image, 800)} alt={activeArticle.title} className="w-full h-full object-cover" />
                <button 
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8 sm:p-12 space-y-6">
                <div className="space-y-3 text-center">
                  <span className="text-[10px] font-sans tracking-widest uppercase text-luxury-gold">
                    {activeArticle.category} • {activeArticle.date}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal leading-snug">
                    {activeArticle.title}
                  </h2>
                  <div className="w-12 h-[1px] bg-luxury-gold mx-auto" />
                </div>
                <div className="prose prose-sm prose-stone mx-auto text-gray-600 font-sans leading-relaxed">
                  <p>{activeArticle.content}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {isQuizOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FAF9F6] w-full max-w-3xl flex flex-col md:flex-row overflow-hidden rounded-xl shadow-2xl h-[600px] md:h-[500px]"
            >
              <div className="w-full md:w-2/5 relative h-48 md:h-full shrink-0">
                <img loading="lazy" 
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600" 
                  alt="Quiz Sidebar" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-luxury-charcoal/90 via-luxury-charcoal/40 to-transparent p-6 flex flex-col justify-end md:justify-center">
                  <h3 className="text-white font-serif text-2xl mb-2">Ayurvedic Routine</h3>
                  <p className="text-white/80 text-xs font-sans font-light leading-relaxed">Discover your personalized path to radiant wellness based on ancient rituals.</p>
                </div>
              </div>

              <div className="w-full md:w-3/5 p-6 sm:p-10 flex flex-col relative h-full">
                <button 
                  onClick={() => { setIsQuizOpen(false); setTimeout(resetQuiz, 300); }}
                  className="absolute top-4 right-4 text-gray-400 hover:text-luxury-charcoal transition-colors p-1"
                >
                  <X className="h-6 w-6" />
                </button>
                
                {quizStep < quizQuestions.length ? (
                  <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                    <div className="mb-8">
                      <span className="text-[10px] text-luxury-gold uppercase tracking-widest font-semibold block mb-2 font-sans">
                        Step {quizStep + 1} of {quizQuestions.length}
                      </span>
                      <h2 className="text-2xl font-serif text-luxury-charcoal leading-tight">
                        {quizQuestions[quizStep].question}
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {quizQuestions[quizStep].options.map((opt: string) => (
                        <button 
                          key={opt}
                          onClick={() => handleQuizAnswer(opt)}
                          className="w-full text-left px-6 py-4 border border-gray-200 hover:border-luxury-gold hover:bg-luxury-gold/5 rounded text-sm text-luxury-charcoal transition-all font-sans font-medium group flex justify-between items-center"
                        >
                          <span>{opt}</span>
                          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-luxury-gold transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : quizRecommendation ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto w-full animate-fade-in-up">
                    <span className="text-[10px] text-luxury-gold uppercase tracking-widest font-semibold mb-2 font-sans">
                      Your Personal Ritual
                    </span>
                    <h2 className="text-2xl font-serif text-luxury-charcoal mb-6">
                      We Recommend
                    </h2>
                    
                    <div className="bg-white border border-luxury-gold/20 p-5 rounded-lg shadow-sm w-full mb-6">
                      <div className="h-32 w-full bg-luxury-cream mb-4 flex items-center justify-center">
                        <img loading="lazy" src={optimizeCloudinaryUrl(quizRecommendation.image, 250)} alt={quizRecommendation.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <h4 className="font-serif text-lg text-luxury-charcoal mb-1">{quizRecommendation.name}</h4>
                      <p className="text-xs text-gray-500 mb-3 font-sans line-clamp-2">{quizRecommendation.desc}</p>
                      <span className="text-luxury-charcoal font-serif font-medium">{formatPrice(quizRecommendation.price)}</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        handleQuizAddToBag(quizRecommendation, e);
                        setIsQuizOpen(false);
                        setTimeout(resetQuiz, 300);
                      }}
                      className="w-full bg-[#008060] hover:bg-[#006e52] text-white py-3.5 rounded text-xs uppercase tracking-widest font-serif transition-colors shadow-md mb-3"
                    >
                      Add to Bag
                    </button>
                    <button onClick={resetQuiz} className="text-xs text-gray-400 hover:text-luxury-charcoal uppercase tracking-widest font-sans underline underline-offset-4">
                      Retake Quiz
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
