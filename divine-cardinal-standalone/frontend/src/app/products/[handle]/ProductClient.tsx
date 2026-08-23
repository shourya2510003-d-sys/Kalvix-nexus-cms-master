'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../../../context/CartContext';
import { Star, ShieldCheck, Heart, ArrowLeftRight, ChevronDown, Award, Truck, Gift, BadgePercent, X, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { optimizeCloudinaryUrl } from '../../../lib/cloudinary';
import { getProductStats, getWrittenReviews } from '../../../lib/reviews';
import { useCurrency } from '../../../context/CurrencyContext';
import { parseProductIngredients } from '../../../lib/ingredients';
import { db, ref, set } from '../../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductClientProps {
  product: any;
  relatedProducts?: any[];
}

export default function ProductClient({ product, relatedProducts = [] }: ProductClientProps) {
  const { formatPrice } = useCurrency();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'how-to-use' | 'faqs' | 'key-benefits' | 'ingredients' | 'who-its-for' | 'regulatory-note'>('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState<{show: boolean, time: string, isIndia: boolean} | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  
  // Review form states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5, image: '' });
  
  // Dynamic ingredients dictionary
  const [ingredientsGlossary, setIngredientsGlossary] = useState<any[]>([]);

  useEffect(() => {
    const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
    fetch(`${API_URL}/cms/layout/ingredients`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setIngredientsGlossary(data);
        }
      })
      .catch(err => console.error("Failed to load ingredients in ProductClient:", err));
  }, []);
  const [submittingReview, setSubmittingReview] = useState(false);

  const mappedIngredients = parseProductIngredients(
    product.keyIngredients,
    ingredientsGlossary.length ? ingredientsGlossary : undefined,
    product.sku || selectedVariant?.sku || product.id,
    product.name
  );

  const handleCheckDelivery = () => {
    if (!pincode) return;
    const pin = pincode.trim();
    if (/^\d{6}$/.test(pin)) {
      setDeliveryInfo({ show: true, time: '3-6', isIndia: true });
    } else {
      setDeliveryInfo({ show: true, time: '10', isIndia: false });
    }
  };
  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetSlideshowTimer = () => {
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
    }
  };

  useEffect(() => {
    const imagesLength = product.images?.length || 0;
    if (imagesLength <= 1) return;

    const isCurrentVideo = product.images?.[activeImageIndex]?.url && 
      (product.images[activeImageIndex].url.endsWith('.mp4') || product.images[activeImageIndex].url.includes('/video/upload/'));

    // Pause slideshow if currently displaying a video
    if (isCurrentVideo) {
      resetSlideshowTimer();
      return;
    }

    slideshowTimerRef.current = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % imagesLength);
    }, 5000);

    return () => resetSlideshowTimer();
  }, [activeImageIndex, product.images]);

  const { addItem } = useCart();

  const [uploadingReviewMedia, setUploadingReviewMedia] = useState(false);

  const handleReviewImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingReviewMedia(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      
      try {
        const response = await fetch(`${API_URL}/cms/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const resData = await response.json();
          if (resData.url) {
            setNewReview(prev => ({ ...prev, image: resData.url }));
          }
        } else {
          alert('Failed to upload media. Please try again.');
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Error uploading media.');
      } finally {
        setUploadingReviewMedia(false);
      }
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
      productId: product.id,
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

  const handleAddToCart = (e?: React.MouseEvent) => {
    const imageUrl = product.images?.[0]?.url;
    addItem({
      variantId: selectedVariant.id || selectedVariant.sku,
      quantity,
      price: Number(selectedVariant.price || product.price || product.basePrice || 0),
      compareAtPrice: Number(selectedVariant.compareAtPrice || product.compareAtPrice || 0),
      name: product.name,
      sku: selectedVariant.sku,
      image: imageUrl,
      variantTitle: selectedVariant.title,
    });
    triggerFlyToCart(e, imageUrl);
  };
  const isVideoUrl = (url: string) => {
    return url && (url.endsWith('.mp4') || url.includes('/video/upload/'));
  };
  const activeMedia = product.images?.[activeImageIndex]?.url || product.images?.[0]?.url || '';

  const faqSchema = product.faqs && product.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": product.faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumbs */}
      <nav className="text-xs uppercase tracking-widest text-luxury-charcoal/60 mb-8 space-x-2">
        <Link href="/" className="hover:text-luxury-gold">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-luxury-gold">Shop</Link>
        <span>/</span>
        <span className="text-luxury-charcoal">{product.name}</span>
      </nav>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <style>{`
            @keyframes luxuryFadeIn {
              from {
                opacity: 0.6;
                transform: scale(0.97);
                filter: blur(4px);
              }
              to {
                opacity: 1;
                transform: scale(1);
                filter: blur(0);
              }
            }
            .animate-luxury-fade {
              animation: luxuryFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          <div className="relative bg-white border border-luxury-gold/15 shadow-xl flex items-center justify-center overflow-hidden w-full aspect-square md:h-[600px] md:aspect-auto">
            {product.images?.map((media: any, idx: number) => {
              const isActive = idx === activeImageIndex;
              if (isVideoUrl(media.url)) {
                return (
                  <video
                    key={idx}
                    src={media.url}
                    controls={isActive}
                    autoPlay={isActive}
                    muted
                    className={`absolute inset-0 w-full h-full max-h-[600px] object-contain transition-opacity duration-1000 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  />
                );
              } else {
                return (
                  <img
                    key={idx}
                    src={optimizeCloudinaryUrl(media.url, 800) || 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600'}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full max-h-[600px] object-contain transition-opacity duration-1000 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  />
                );
              }
            })}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin">
              {product.images.map((img: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`border-2 w-16 h-16 flex items-center justify-center p-1 bg-white shrink-0 transition-all ${
                    activeImageIndex === idx ? 'border-luxury-gold' : 'border-gray-200 hover:border-luxury-gold/50'
                  }`}
                >
                  {isVideoUrl(img.url) ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-gray-100 border border-gray-200">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Video</span>
                    </div>
                  ) : (
                    <img src={optimizeCloudinaryUrl(img.url, 150)} alt="" className="max-h-full max-w-full object-contain" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div>
            <div className="flex flex-wrap items-center space-x-1 text-xs text-yellow-600 mb-2 font-sans">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || getProductStats(product.id).rating) ? 'fill-yellow-600' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-luxury-charcoal/60 ml-2 font-medium">({product.reviewCount || getProductStats(product.id).reviewCount})</span>
              <span className="text-luxury-charcoal/30 mx-2">|</span>
              <span className="text-luxury-charcoal/70 tracking-wide font-medium">
                {product.totalBuyers || getProductStats(product.id).totalBuyers}+ Total Buyers
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-luxury-charcoal leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-luxury-gold uppercase font-serif tracking-widest mt-2">
              {product.categories?.[0]?.name}
            </p>
          </div>

          <div className="flex items-baseline space-x-4 border-y border-luxury-gold/10 py-4">
            {!!(selectedVariant.compareAtPrice || product.compareAtPrice) && Number(selectedVariant.compareAtPrice || product.compareAtPrice) > Number(selectedVariant.price || product.price || product.basePrice) && (
              <span className="text-xs sm:text-sm font-serif text-gray-400 line-through">
                {formatPrice(selectedVariant.compareAtPrice || product.compareAtPrice)}
              </span>
            )}
            <span className="text-xl sm:text-2xl font-serif text-red-600">
              {formatPrice(selectedVariant.price || product.price || product.basePrice)}
            </span>
            {!!(selectedVariant.compareAtPrice || product.compareAtPrice) && Number(selectedVariant.compareAtPrice || product.compareAtPrice) > Number(selectedVariant.price || product.price || product.basePrice) && (
              <span className="text-sm font-serif text-green-600 bg-green-50 px-2 py-1 rounded">
                Save {(Number(selectedVariant.compareAtPrice || product.compareAtPrice) - Number(selectedVariant.price || product.price || product.basePrice)).toFixed(0)}
              </span>
            )}
          </div>

          <p className="text-sm text-luxury-charcoal/80 leading-relaxed font-light font-sans mt-4">
            {product.shortDescription || product.summary}
          </p>

          {product.quickFacts && product.quickFacts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-luxury-gold/20">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-serif text-luxury-charcoal/60 mb-4">Quick Facts</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {product.quickFacts.map((fact: any, idx: number) => (
                  <div key={idx} className="flex items-start text-xs space-x-2">
                    <span className="text-luxury-gold mt-0.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium text-luxury-charcoal/90">{fact.key}</span>
                      <span className="text-luxury-charcoal/60 font-light mt-0.5 leading-snug">{fact.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-2 mt-6">
              <span className="text-xs uppercase tracking-widest text-luxury-charcoal/70">Select Size:</span>
              <div className="flex space-x-3">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`border px-4 py-2 text-xs uppercase tracking-widest font-serif transition-colors ${
                      selectedVariant.id === v.id
                        ? 'border-luxury-gold bg-luxury-gold text-white'
                        : 'border-luxury-gold/30 hover:border-luxury-gold'
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Cart buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center border border-luxury-gold/30 rounded h-12">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 hover:text-luxury-gold"
              >
                -
              </button>
              <span className="px-4 text-sm font-sans">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 hover:text-luxury-gold"
              >
                +
              </button>
            </div>

            <button
              onClick={(e) => handleAddToCart(e)}
              className="flex-1 bg-luxury-gold hover:bg-luxury-goldDark text-white h-12 text-xs uppercase tracking-widest transition-colors font-serif"
            >
              Add to Shopping Bag
            </button>
          </div>

          {/* Delivery Options */}
          <div className="pt-6 pb-2">
            <h3 className="text-xl font-serif text-luxury-charcoal mb-4">Delivery Options</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
              <div className="flex border border-luxury-gold/30 w-full sm:w-auto h-12 bg-white">
                <input
                  type="text"
                  placeholder="ENTER PIN CODE"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckDelivery()}
                  className="px-4 py-2 w-full sm:w-40 outline-none text-sm font-sans tracking-widest placeholder-gray-400 bg-transparent"
                />
                <button
                  onClick={handleCheckDelivery}
                  className="px-4 py-2 text-luxury-gold font-sans font-medium text-sm border-l border-luxury-gold/30 hover:bg-luxury-gold/5 transition-colors uppercase"
                >
                  CHECK
                </button>
              </div>
              <div className="text-sm text-luxury-charcoal/70 font-sans leading-relaxed">
                Delivery outside India?<br />
                <span className="text-luxury-charcoal/90">Guaranteed dispatch within 48 Hrs.</span>
              </div>
            </div>
            {deliveryInfo?.show && (
              <div className="mt-4 text-sm flex items-center text-green-700 font-sans font-medium">
                <Truck className="w-4 h-4 mr-2" />
                {deliveryInfo.isIndia ? `FREE Delivery: ` : `Standard Delivery: `}
                <span className="font-bold ml-1">{deliveryInfo.time} days</span>
              </div>
            )}
          </div>

          {/* Offers & Whats New Buttons */}
          <div className="flex space-x-4 pt-2 pb-6">
            <button className="flex items-center space-x-2 bg-[#EFE3D7] hover:bg-[#E3D1C1] text-luxury-charcoal px-4 py-2.5 text-xs font-serif font-medium tracking-wide transition-colors rounded-sm">
              <Gift className="w-4 h-4 text-luxury-charcoal/80" />
              <span>AVAILABLE OFFERS</span>
            </button>
            <button className="flex items-center space-x-2 bg-[#EFE3D7] hover:bg-[#E3D1C1] text-luxury-charcoal px-4 py-2.5 text-xs font-serif font-medium tracking-wide transition-colors rounded-sm">
              <BadgePercent className="w-4 h-4 text-luxury-charcoal/80" />
              <span>WHAT'S NEW</span>
            </button>
          </div>

        </div>
      </div>

      {/* Detail Tabs Accordion (Full Page Width) */}
      <div className="mt-12 md:mt-16 border-t border-luxury-gold/15 pt-8 md:pt-10">
        <div 
          className="flex space-x-6 md:space-x-8 border-b border-luxury-gold/10 pb-4 text-[11px] md:text-lg font-serif font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap justify-start md:justify-center px-4 md:px-0 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-2 transition-colors ${activeTab === 'description' ? 'border-b-2 border-luxury-gold text-luxury-gold' : 'text-black hover:text-luxury-gold'}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('how-to-use')}
            className={`pb-2 transition-colors ${activeTab === 'how-to-use' ? 'border-b-2 border-luxury-gold text-luxury-gold' : 'text-black hover:text-luxury-gold'}`}
          >
            How to Use
          </button>
          {product.faqs && product.faqs.length > 0 && (
            <button
              onClick={() => setActiveTab('faqs')}
              className={`pb-2 transition-colors ${activeTab === 'faqs' ? 'border-b-2 border-luxury-gold text-luxury-gold' : 'text-black hover:text-luxury-gold'}`}
            >
              FAQs
            </button>
          )}
          {product.keyBenefits && product.keyBenefits.length > 0 && (
            <button
              onClick={() => setActiveTab('key-benefits')}
              className={`pb-2 transition-colors ${activeTab === 'key-benefits' ? 'border-b-2 border-luxury-gold text-luxury-gold' : 'text-black hover:text-luxury-gold'}`}
            >
              Key Benefits
            </button>
          )}
          {product.ingredientBreakdown && (
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-2 transition-colors ${activeTab === 'ingredients' ? 'border-b-2 border-luxury-gold text-luxury-gold' : 'text-black hover:text-luxury-gold'}`}
            >
              Ingredients
            </button>
          )}
          {product.whoItsFor && (
            <button
              onClick={() => setActiveTab('who-its-for')}
              className={`pb-2 transition-colors ${activeTab === 'who-its-for' ? 'border-b-2 border-luxury-gold text-luxury-gold' : 'text-black hover:text-luxury-gold'}`}
            >
              Who It's For
            </button>
          )}
          {product.regulatoryNote && (
            <button
              onClick={() => setActiveTab('regulatory-note')}
              className={`pb-2 transition-colors ${activeTab === 'regulatory-note' ? 'border-b-2 border-luxury-gold text-luxury-gold' : 'text-black hover:text-luxury-gold'}`}
            >
              Regulatory Note
            </button>
          )}
        </div>

        <div className="text-xs md:text-base font-sans leading-relaxed md:leading-loose text-luxury-charcoal/80 font-light min-h-[100px] pt-6 md:pt-8 pb-32 md:pb-12 max-w-4xl mx-auto px-4 md:px-0">
          
          {activeTab === 'description' && (
            <div 
              className="prose prose-sm md:prose-base prose-gold max-w-none prose-headings:font-serif prose-headings:text-luxury-charcoal prose-strong:text-luxury-charcoal prose-strong:font-semibold prose-a:text-luxury-gold hover:prose-a:text-luxury-charcoal"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          {activeTab === 'how-to-use' && (
            <div 
              className="prose prose-sm md:prose-base prose-gold max-w-none mt-4 prose-p:mb-5 prose-strong:text-luxury-charcoal prose-strong:font-semibold prose-a:text-luxury-gold hover:prose-a:text-luxury-charcoal"
              dangerouslySetInnerHTML={{ __html: product.howToUse || '' }}
            />
          )}
          {activeTab === 'faqs' && (
            <div className="space-y-4 mt-4">
              {product.faqs?.map((faq: any, i: number) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div 
                    key={i} 
                    className="border border-luxury-gold/20 rounded-lg bg-white overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                      className="w-full flex justify-between items-center px-6 py-5 text-left font-serif text-base text-luxury-charcoal hover:bg-luxury-gold/5 transition-colors focus:outline-none"
                    >
                      <span className="font-medium tracking-wide">{faq.question}</span>
                      <span className="ml-4 flex-shrink-0 text-luxury-gold">
                        {isOpen ? (
                          <Minus className="w-5 h-5 transition-transform duration-300" />
                        ) : (
                          <Plus className="w-5 h-5 transition-transform duration-300" />
                        )}
                      </span>
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-96 border-t border-luxury-gold/10' : 'max-h-0'
                      }`}
                    >
                      <div className="px-6 py-5 text-sm md:text-base font-sans text-luxury-charcoal/80 leading-relaxed bg-[#FDFBF9]">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'key-benefits' && product.keyBenefits && (
            <div className="text-sm md:text-base text-luxury-charcoal/80 font-sans mt-4">
              <ul className="space-y-3">
                {product.keyBenefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-luxury-charcoal font-bold text-xl mr-3 leading-none">•</span>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeTab === 'ingredients' && product.ingredientBreakdown && (
            <div 
              className="prose prose-sm md:prose-base prose-gold max-w-none mt-4 prose-p:mb-5 prose-strong:text-luxury-charcoal prose-strong:font-semibold prose-a:text-luxury-gold hover:prose-a:text-luxury-charcoal prose-li:list-disc prose-li:ml-6 prose-ul:space-y-3"
              dangerouslySetInnerHTML={{ __html: product.ingredientBreakdown || '' }}
            />
          )}
          {activeTab === 'who-its-for' && product.whoItsFor && (
            <div 
              className="prose prose-sm md:prose-base prose-gold max-w-none mt-4 prose-p:mb-5 prose-strong:text-luxury-charcoal prose-strong:font-semibold"
              dangerouslySetInnerHTML={{ __html: product.whoItsFor }}
            />
          )}
          {activeTab === 'regulatory-note' && product.regulatoryNote && (
            <div 
              className="prose prose-sm md:prose-base prose-gold max-w-none mt-4 p-4 md:p-6 bg-gray-50 border-l-4 border-luxury-gold text-gray-700 italic shadow-sm"
              dangerouslySetInnerHTML={{ __html: product.regulatoryNote }}
            />
          )}
        </div>
      </div>
    </div>
      
    {/* Frequently Bought Together & Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-luxury-gold/20">
          <div className="text-center mb-12">
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-luxury-gold font-serif mb-4">Complete Your Ritual</h3>
            <div className="w-8 h-px bg-luxury-gold mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal font-light">Frequently Bought Together</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((rp: any) => (
              <div key={rp.id} className="group cursor-pointer">
                <Link href={`/products/${rp.slug}`}>
                  <div className="aspect-[4/5] bg-[#F9F8F6] relative overflow-hidden mb-4">
                    <img 
                      src={optimizeCloudinaryUrl(rp.images?.[0]?.url || rp.image, 500)} 
                      alt={rp.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <h3 className="font-serif text-sm text-luxury-charcoal group-hover:text-luxury-gold transition-colors line-clamp-2">{rp.name}</h3>
                  <div className="mt-2 text-xs font-sans text-luxury-charcoal/70">
                    {formatPrice(rp.basePrice || rp.price || 0)}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Ingredients Section */}
      {mappedIngredients.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-luxury-gold/20">
          <div className="text-center mb-16">
            <h3 className="text-[10px] tracking-[0.3em] uppercase text-luxury-gold font-serif mb-4">Key Ingredients</h3>
            <div className="w-8 h-px bg-luxury-gold mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-serif text-luxury-charcoal font-light">What's inside that really matters</h2>
            <div className="mt-8">
              <Link href="/ingredients" className="text-[10px] uppercase tracking-widest text-luxury-charcoal/60 hover:text-luxury-gold hover:underline transition-all">
                VIEW FULL LIST
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {mappedIngredients.map((ingredient) => (
              <div key={ingredient.id} className="flex flex-col text-left group">
                <Link href={`/ingredients/${ingredient.id}`} className="block mb-6 relative overflow-hidden rounded-full w-40 h-40 mx-auto md:mx-0 border border-luxury-gold/20 p-2 hover:border-luxury-gold transition-colors">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-50">
                    <img 
                      src={optimizeCloudinaryUrl(ingredient.image, 300)} 
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Link>
                <Link href={`/ingredients/${ingredient.id}`}>
                  <h4 className="font-serif text-lg text-luxury-charcoal mb-2 hover:text-luxury-gold transition-colors">{ingredient.name}</h4>
                </Link>
                <div className="w-4 h-px bg-luxury-charcoal/30 mb-4" />
                <p className="text-xs text-luxury-charcoal/70 font-sans leading-relaxed">
                  {ingredient.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-luxury-gold/20">
        <h2 className="text-2xl sm:text-3xl font-serif text-luxury-charcoal text-center mb-6">Customer Reviews</h2>
        
        {/* Write a Review Section */}
        <div className="flex flex-col items-center justify-center mb-12 bg-luxury-cream p-6 border border-luxury-gold/10">
          <h3 className="font-serif text-lg text-luxury-charcoal mb-2">Rate this product</h3>
          <p className="text-xs text-luxury-charcoal/60 mb-4 font-sans text-center max-w-md">Share your experience with others. Click on a star to write a review.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getWrittenReviews(product.id).map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-sm border border-luxury-gold/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-luxury-gold/10 flex items-center justify-center text-luxury-gold font-serif font-bold text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-luxury-charcoal font-sans">{review.name}</h4>
                    {review.verified && (
                      <div className="flex items-center text-[10px] text-green-600">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified Buyer
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-[10px] text-luxury-charcoal/50 font-sans">
                  {review.date}
                </div>
              </div>
              
              <div className="flex items-center space-x-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-600 text-yellow-600' : 'fill-gray-200 text-gray-200'}`} 
                  />
                ))}
              </div>
              
              <p className="text-sm text-luxury-charcoal/80 font-sans font-light leading-relaxed">
                "{review.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-luxury-charcoal/50 hover:text-luxury-charcoal hover:bg-luxury-gold/10 transition-colors rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl text-luxury-charcoal">Write a Review</h3>
                <div className="w-12 h-px bg-luxury-gold mx-auto mt-3 mb-2" />
                <p className="text-xs text-luxury-charcoal/60 font-sans">Share your experience with {product.name}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-luxury-charcoal/80 font-serif mb-2">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-7 w-7 cursor-pointer transition-colors ${star <= newReview.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300 hover:text-yellow-200 hover:fill-yellow-200'}`} 
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-luxury-charcoal/80 font-serif mb-2">Your Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your full name"
                    value={newReview.name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border-b border-luxury-gold/30 pb-2 bg-transparent text-sm font-sans focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-luxury-charcoal/80 font-serif mb-2">Review</label>
                  <textarea 
                    required
                    placeholder="What did you love about this product?"
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full border border-luxury-gold/30 p-3 bg-transparent text-sm font-sans focus:outline-none focus:border-luxury-gold transition-colors placeholder-gray-400 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-luxury-charcoal/80 font-serif mb-2">Upload Photo / Video (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={handleReviewImageChange}
                    disabled={uploadingReviewMedia}
                    className="w-full text-xs font-sans file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-serif file:uppercase file:tracking-widest file:bg-luxury-gold/10 file:text-luxury-charcoal hover:file:bg-luxury-gold/20 cursor-pointer disabled:opacity-50"
                  />
                  {uploadingReviewMedia && <p className="text-xs text-luxury-gold mt-2">Uploading media...</p>}
                  {newReview.image && (
                    <div className="mt-4 relative w-20 h-20 border border-luxury-gold/20 p-1">
                      {newReview.image.includes('/video/upload/') || newReview.image.endsWith('.mp4') ? (
                        <video src={newReview.image} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                      ) : (
                        <img src={newReview.image} alt="Preview" className="w-full h-full object-cover" />
                      )}
                      <button 
                        type="button" 
                        onClick={() => setNewReview(prev => ({ ...prev, image: '' }))}
                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-md p-0.5 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-luxury-charcoal text-white text-xs uppercase tracking-[0.2em] py-4 font-serif hover:bg-black transition-colors disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
