'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User as UserIcon, X, Plus, Minus, Trash2, MapPin, ChevronDown, Sun, Moon, ArrowLeft, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { db, ref, push, set, onValue } from '../lib/firebase';
import { useEffect, useState as useStateReact } from 'react';
import { useCurrency, Currency } from '../context/CurrencyContext';
import { Country, State, City } from 'country-state-city';
import { optimizeCloudinaryUrl } from '../lib/cloudinary';

const megaMenuData: Record<string, any> = {
  'womens-care': {
    title: "Women's Care",
    categories: ['Intimate Care Oils', 'Body Massage Oils', 'Wellness Roll-ons'],
    concerns: ['Monthly Comfort', 'Leg Comfort', 'Stress Relief'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116344/kalvix_nexus/navbar/women_care_menu.png'
  },
  'wellness-category': {
    title: "Wellness Category",
    categories: ['Essential Oils', 'Carrier Oils', 'Massage Oils'],
    concerns: ['Vitality', 'Sleep Comfort', 'Muscle Soothing'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116350/kalvix_nexus/navbar/wellness_menu.png'
  },
  'mother-care': {
    title: "MOTHER Care",
    categories: ['Pre-natal Oils', 'Post-natal Oils', 'Stretch Mark Oils'],
    concerns: ['Skin Elasticity', 'Body Relaxation', 'Calming'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116339/kalvix_nexus/navbar/mother_care_menu.png'
  },
  'men-care': {
    title: "Men Care",
    categories: ['Beard Oils', 'Face Serums', 'Muscle Recovery Oils'],
    concerns: ['Beard Nourishment', 'Post-Workout Soothing', 'Skin Radiance'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116334/kalvix_nexus/navbar/mens_carrer_menu.png'
  },
  'hair-care': {
    title: "Hair Care",
    categories: ['Hair Nourishing Oils', 'Scalp Serums', 'Hair Tonics'],
    concerns: ['Hair Vitality', 'Scalp Health', 'Natural Shine'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116307/kalvix_nexus/navbar/hair_care_menu.png'
  },
  'face-and-body': {
    title: "Face and Body",
    categories: ['Face Serums', 'Body Oils', 'Facial Toners'],
    concerns: ['Clear Skin', 'Youthful Glow', 'Skin Hydration'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116280/kalvix_nexus/navbar/face_care_menu.png'
  },
  'attar-and-toners': {
    title: "Attar and Toners",
    categories: ['Premium Attars', 'Facial Toners', 'Floral Waters'],
    concerns: ['Long-lasting Fragrance', 'Skin Refreshment', 'Pore Tightening'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116247/kalvix_nexus/navbar/attar_menu.jpg'
  },
  'baby-care-range': {
    title: "Baby Care Range",
    categories: ['Baby Massage Oils', 'Gentle Serums', 'Soothing Oils'],
    concerns: ['Baby Skin Comfort', 'Gentle Nourishment', 'Skin Softness'],
    image: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116255/kalvix_nexus/navbar/child_care_menu.png'
  }
};

export default function Navbar() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      localStorage.setItem('theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  const [headerConfig, setHeaderConfig] = useState<any>(null);

  useEffect(() => {
    const unsub = onValue(ref(db, 'global_elements/header'), (snap) => {
      if (snap.exists()) setHeaderConfig(snap.val());
    });
    return () => unsub();
  }, []);

  const activeMenuData = headerConfig?.menuItems?.length 
    ? headerConfig.menuItems.reduce((acc: any, item: any) => {
        acc[item.id || item.title.toLowerCase().replace(/\\s+/g, '-')] = item;
        return acc;
      }, {})
    : megaMenuData;
  const template = headerConfig?.template || 'premium';

  useEffect(() => {
    if (isSearchOpen && allProducts.length === 0) {
      const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
      fetch(`${API_URL}/products?limit=1000`)
        .then(res => res.json())
        .then(data => {
          if(data.products) setAllProducts(data.products);
        }).catch(console.error);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      setFilteredProducts(allProducts.filter(p => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)).slice(0, 5));
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, allProducts]);
  
  const { cart, cartCount, cartTotal, updateQuantity, removeItem } = useCart();
  const { user, logout } = useAuth();

  // Location State
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationText, setLocationText] = useState('Location');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [locationStep, setLocationStep] = useState<'initial' | 'country' | 'state' | 'city'>('initial');
  const [selectedCountry, setSelectedCountry] = useState<{name: string, isoCode: string} | null>(null);
  const [selectedState, setSelectedState] = useState<{name: string, isoCode: string} | null>(null);


  useEffect(() => {
    const saved = localStorage.getItem('dc_location');
    if (saved) setLocationText(saved);
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocationText('Locating...');
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`);
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.state || 'Unknown';
          setLocationText(city);
          localStorage.setItem('dc_location', city);
          setIsLocationOpen(false);
          setLocationStep('initial');
        } catch (e) {
          setLocationText('Location');
          alert('Failed to get city from coordinates.');
        }
      }, () => {
        setLocationText('Location');
        alert('Permission denied.');
      });
    }
  };

  const handleCitySelect = (city: string) => {
    setLocationText(city);
    localStorage.setItem('dc_location', city);
    setIsLocationOpen(false);
    setLocationStep('initial');
  };

  useEffect(() => {
    if (pathname && !pathname.startsWith('/admin')) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const newVisitRef = push(ref(db, 'live_visits'));
      set(newVisitRef, {
        user: user ? `${user.firstName} ${user.lastName}` : 'Guest Session',
        action: pathname === '/' ? 'Browsing storefront homepage' : `Viewing page ${pathname}`,
        page: pathname,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        device: isMobile ? 'Mobile' : 'Desktop',
        location: 'Delhi, IN'
      });
    }
  }, [pathname, user]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 w-full z-40 bg-luxury-cream dark:bg-[#0c0c0c] transition-all duration-500 ${isScrolled ? 'shadow-md border-b border-luxury-gold/15' : 'shadow-none border-b border-luxury-gold/5'}`}>
        {/* Top Announcement Bar */}
        <div className="hidden md:block bg-[#583a2c] text-white text-center py-2 text-[10px] tracking-[0.2em] font-serif font-normal uppercase">
          Free Shipping All Over India
        </div>

        {/* Main Header Row */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'}`}>
          {/* Left Actions: Search, Stores, Currency */}
          <div className="flex-1 flex items-center justify-start space-x-3 sm:space-x-6 text-[10px] sm:text-xs uppercase tracking-widest font-serif font-normal text-luxury-charcoal/80 dark:text-luxury-cream/85">
            {/* Mobile Hamburger */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden hover:text-luxury-gold transition-colors">
              <Menu className="h-5 w-5 text-luxury-charcoal dark:text-luxury-cream" />
            </button>
            <button onClick={() => setIsSearchOpen(true)} className="hidden sm:flex hover:text-luxury-gold transition-colors items-center space-x-1.5">
              <Search className="h-4.5 w-4.5 text-luxury-charcoal dark:text-luxury-cream" />
            </button>
            <div className="relative hidden sm:flex items-center space-x-1">
              <button 
                onClick={() => setIsLocationOpen(!isLocationOpen)} 
                className="hover:text-luxury-gold transition-colors flex items-center space-x-1"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{locationText}</span>
              </button>
              
              <AnimatePresence>
                {isLocationOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-10 left-0 bg-white border border-luxury-gold/20 shadow-xl w-64 p-4 z-50 rounded text-luxury-charcoal flex flex-col space-y-4"
                  >
                    {locationStep === 'initial' && (
                      <>
                        <button onClick={handleGetCurrentLocation} className="w-full text-left p-3 text-xs uppercase tracking-widest border border-luxury-gold/50 hover:bg-luxury-gold hover:text-white transition-colors font-serif">
                          Use Current Location
                        </button>
                        <button onClick={() => setLocationStep('country')} className="w-full text-left p-3 text-xs uppercase tracking-widest border border-luxury-gold/50 hover:bg-luxury-gold hover:text-white transition-colors font-serif">
                          Enter Location Manually
                        </button>
                      </>
                    )}
                    
                    {locationStep === 'country' && (
                      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                        <div className="text-[10px] uppercase text-gray-500 font-serif mb-2 sticky top-0 bg-white z-10 pb-1">Select Country</div>
                        {Country.getAllCountries().map(country => (
                          <button key={country.isoCode} onClick={() => { setSelectedCountry({ name: country.name, isoCode: country.isoCode }); setLocationStep('state'); }} className="block w-full text-left px-2 py-1.5 hover:bg-luxury-gold/10 text-xs">
                            {country.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {locationStep === 'state' && (
                      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                        <div className="flex items-center space-x-2 text-[10px] uppercase text-gray-500 font-serif mb-2 sticky top-0 bg-white z-10 pb-1">
                          <button onClick={() => setLocationStep('country')}><ArrowLeft className="w-3 h-3 hover:text-luxury-gold" /></button>
                          <span>Select State/Region</span>
                        </div>
                        {selectedCountry && State.getStatesOfCountry(selectedCountry.isoCode).length > 0 ? (
                          State.getStatesOfCountry(selectedCountry.isoCode).map(state => (
                            <button key={state.isoCode} onClick={() => { setSelectedState({ name: state.name, isoCode: state.isoCode }); setLocationStep('city'); }} className="block w-full text-left px-2 py-1.5 hover:bg-luxury-gold/10 text-xs">
                              {state.name}
                            </button>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500 px-2">No states found.</div>
                        )}
                        {selectedCountry && State.getStatesOfCountry(selectedCountry.isoCode).length === 0 && (
                           <button onClick={() => handleCitySelect(selectedCountry.name)} className="block w-full text-left px-2 py-1.5 mt-2 bg-luxury-gold/10 hover:bg-luxury-gold/20 text-xs text-luxury-charcoal font-medium">
                             Use Country As Location
                           </button>
                        )}
                      </div>
                    )}

                    {locationStep === 'city' && (
                      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                        <div className="flex items-center space-x-2 text-[10px] uppercase text-gray-500 font-serif mb-2 sticky top-0 bg-white z-10 pb-1">
                          <button onClick={() => setLocationStep('state')}><ArrowLeft className="w-3 h-3 hover:text-luxury-gold" /></button>
                          <span>Select City</span>
                        </div>
                        {selectedCountry && selectedState && City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode).length > 0 ? (
                          City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode).map(city => (
                            <button key={city.name} onClick={() => handleCitySelect(city.name)} className="block w-full text-left px-2 py-1.5 hover:bg-luxury-gold/10 text-xs">
                              {city.name}
                            </button>
                          ))
                        ) : (
                           <>
                            <div className="text-xs text-gray-500 px-2 mb-2">No cities found.</div>
                            <button onClick={() => handleCitySelect(selectedState?.name || 'Unknown')} className="block w-full text-left px-2 py-1.5 bg-luxury-gold/10 hover:bg-luxury-gold/20 text-xs text-luxury-charcoal font-medium">
                              Use State As Location
                            </button>
                           </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div 
              className="hidden md:flex items-center space-x-1 cursor-pointer hover:text-luxury-gold transition-colors relative"
              onMouseEnter={() => setIsCurrencyDropdownOpen(true)}
              onMouseLeave={() => setIsCurrencyDropdownOpen(false)}
            >
              <span>{currency}</span>
              <ChevronDown className="h-3 w-3" />
              
              <AnimatePresence>
                {isCurrencyDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 bg-white shadow-xl border border-luxury-gold/20 py-2 w-24 rounded-sm z-50 text-xs font-serif text-luxury-charcoal"
                  >
                    {['INR', 'USD', 'EUR', 'AED'].map((cur) => (
                      <button
                        key={cur}
                        onClick={() => {
                          setCurrency(cur as Currency);
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-luxury-gold/10 ${currency === cur ? 'text-luxury-gold bg-luxury-gold/5' : ''}`}
                      >
                        {cur}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Logo (Center) */}
          <div className="text-center flex flex-col items-center justify-center flex-shrink-0 relative">
            <Link href="/" className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl tracking-[0.1em] text-luxury-charcoal hover:opacity-90 transition-opacity whitespace-nowrap leading-none mb-1">
              DIVINE CARDINAL
            </Link>
            <span className="text-[8px] sm:text-[9px] md:text-[10px] tracking-widest uppercase font-sans text-gray-500 font-medium">A path of natural well being</span>
          </div>

          {/* Right Actions: Account, Soundarya Club, Cart */}
          <div className="flex-1 flex items-center justify-end space-x-4 sm:space-x-6 text-[10px] sm:text-[11px] uppercase tracking-widest font-serif font-normal text-luxury-charcoal dark:text-luxury-cream">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme} 
              className="hidden sm:flex hover:text-luxury-gold dark:hover:text-luxury-gold transition-colors p-1"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-luxury-gold" />}
            </button>
            {user ? (
              <div className="hidden sm:flex items-center space-x-4">
                <Link href="/dashboard" className="text-luxury-gold hover:underline">
                  Hi, {user.firstName}
                </Link>
                <button onClick={logout} className="hover:text-luxury-gold transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="hidden sm:flex hover:text-luxury-gold transition-colors items-center space-x-1">
                <UserIcon className="h-4 w-4" />
                <span>Account</span>
              </Link>
            )}

            <Link href="/blogs" className="hidden lg:inline text-luxury-gold hover:text-luxury-goldDark transition-colors">
              Journal & Blogs
            </Link>

            <button onClick={() => setIsCartOpen(true)} className="relative flex items-center space-x-1.5 hover:text-luxury-gold transition-colors">
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-serif font-normal">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Sub-header Categories Navigation Row */}
        <div className={`hidden md:block overflow-x-auto scrollbar-none transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 border-transparent overflow-hidden' : 'h-10 sm:h-12 border-t border-luxury-gold/10 opacity-100'}`}>
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-start md:justify-center space-x-6 text-[9px] sm:text-[10px] font-serif font-normal uppercase tracking-[0.15em] text-luxury-charcoal whitespace-nowrap">
            {Object.keys(activeMenuData).map((key) => (
              <div 
                key={key}
                onMouseEnter={() => setActiveMegaMenu(key)}
                className="h-full flex items-center"
              >
                <Link href={activeMenuData[key].link || `/shop?category=${key}`} className="hover:text-luxury-gold transition-colors py-3">
                  {activeMenuData[key].title}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Mega Menu Dropdowns */}
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
              onMouseLeave={() => setActiveMegaMenu(null)}
              className="absolute left-0 right-0 bg-white border-b border-luxury-gold/15 shadow-xl z-50 py-10"
            >
              <div className="max-w-7xl mx-auto px-8 grid grid-cols-12 gap-8">
                {activeMegaMenu && activeMenuData[activeMegaMenu] && template !== 'simple' && (
                  <>
                    <div className={`${template === 'advanced' ? 'col-span-6' : 'col-span-2'} space-y-4`}>
                      <h4 className="font-serif text-sm font-normal text-luxury-charcoal tracking-wide border-b border-luxury-gold/10 pb-2">Shop by Category</h4>
                      <ul className="space-y-3 text-xs font-sans text-luxury-charcoal/80">
                        {(activeMenuData[activeMegaMenu].categories || []).map((cat: string) => (
                          <li key={cat}><Link href={`/shop?category=${activeMegaMenu}`} className="hover:text-luxury-gold transition-colors">{cat}</Link></li>
                        ))}
                      </ul>
                    </div>

                    <div className={`${template === 'advanced' ? 'col-span-6' : 'col-span-2'} space-y-4`}>
                      <h4 className="font-serif text-sm font-normal text-luxury-charcoal tracking-wide border-b border-luxury-gold/10 pb-2">Shop By Concern</h4>
                      <ul className="space-y-3 text-xs font-sans text-luxury-charcoal/80">
                        {(activeMenuData[activeMegaMenu].concerns || []).map((concern: string) => (
                          <li key={concern}><Link href={`/shop?category=${activeMegaMenu}`} className="hover:text-luxury-gold transition-colors">{concern}</Link></li>
                        ))}
                      </ul>
                    </div>
                    
                    {template === 'premium' && (
                      <>
                        <div className="col-span-4"></div>

                        {/* Column 5: Banner Image (Right) */}
                        <div className="col-span-4 relative h-64 bg-luxury-cream overflow-hidden cursor-pointer group">
                          <Link href={activeMenuData[activeMegaMenu].link || `/shop?category=${activeMegaMenu}`}>
                            {(() => {
                              const type = activeMenuData[activeMegaMenu].animationType || 'zoom-in';
                              const duration = activeMenuData[activeMegaMenu].animationTiming || 0.7;
                              
                              let animProps: any = {};
                              if (type === 'fade-in') {
                                animProps = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration } };
                              } else if (type === 'slide-up') {
                                animProps = { initial: { y: 30, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration } };
                              } else if (type === 'zoom-in') {
                                animProps = { initial: { scale: 1 }, whileHover: { scale: 1.05 }, transition: { duration } };
                              }

                              if (activeMenuData[activeMegaMenu].image?.includes('.mp4')) {
                                return (
                                  <motion.video
                                    src={activeMenuData[activeMegaMenu].image}
                                    className="w-full h-full object-cover"
                                    autoPlay loop muted playsInline
                                    {...animProps}
                                  />
                                );
                              } else {
                                return (
                                  <motion.img
                                    src={optimizeCloudinaryUrl(activeMenuData[activeMegaMenu].image, 500)}
                                    alt={`${activeMenuData[activeMegaMenu].title} Banner`}
                                    className="w-full h-full object-cover"
                                    {...animProps}
                                  />
                                );
                              }
                            })()}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="border border-white/60 bg-black/40 px-6 py-2 backdrop-blur-sm hover:bg-black/60 transition-colors">
                                <span className="text-white text-xs tracking-widest font-sans uppercase">Explore {activeMenuData[activeMegaMenu].title} &gt;</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </>
                    )}
                  </>
                )}

                {activeMegaMenu && activeMenuData[activeMegaMenu] && template === 'simple' && (
                  <div className="col-span-12 flex space-x-8">
                     <ul className="space-y-3 text-sm font-sans text-luxury-charcoal/80">
                        {(activeMenuData[activeMegaMenu].categories || []).map((cat: string) => (
                          <li key={cat}><Link href={`/shop?category=${activeMegaMenu}`} className="hover:text-luxury-gold transition-colors block py-1">{cat}</Link></li>
                        ))}
                     </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-luxury-cream border-l border-luxury-gold/15 z-50 flex flex-col p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-6 border-b border-luxury-gold/15">
                <h3 className="font-serif text-xl tracking-wide">Shopping Bag ({cartCount})</h3>
                <button onClick={() => setIsCartOpen(false)} className="hover:text-luxury-gold transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                  <ShoppingBag className="h-12 w-12 text-luxury-gold/50" />
                  <p className="font-serif text-lg">Your shopping bag is empty</p>
                  <Link
                    href="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="border border-luxury-gold text-luxury-gold px-6 py-3 text-xs uppercase tracking-widest hover:bg-luxury-gold hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto divide-y divide-luxury-gold/10 no-scrollbar pr-1">
                    {cart.map((item) => (
                      <div key={item.variantId} className="py-6 flex space-x-4">
                        <div className="w-20 h-24 bg-white border border-luxury-gold/10 flex-shrink-0 flex items-center justify-center p-2">
                           <img
                            src={optimizeCloudinaryUrl(item.image, 150) || 'https://images.cloudinary.com/placeholder-bottle.jpg'}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif text-sm tracking-wide">{item.name}</h4>
                            <p className="text-xs text-luxury-gold uppercase mt-1">{item.variantTitle}</p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-luxury-gold/30 rounded">
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                className="px-2 py-1 hover:text-luxury-gold"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-xs font-sans">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                className="px-2 py-1 hover:text-luxury-gold"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-serif">{formatPrice(item.price * item.quantity)}</span>
                            <button
                              onClick={() => removeItem(item.variantId)}
                              className="text-luxury-charcoal/50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-luxury-gold/15 pt-6 space-y-4">
                    <div className="flex justify-between font-serif text-lg">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <p className="text-xs text-luxury-charcoal/60">Taxes and shipping calculated at checkout.</p>
                    <Link
                      href="/checkout"
                      onClick={() => setIsCartOpen(false)}
                      className="block w-full bg-luxury-gold text-white text-center py-4 text-xs uppercase tracking-widest hover:bg-luxury-goldDark transition-colors"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-4/5 max-w-sm bg-luxury-cream dark:bg-[#0c0c0c] border-r border-luxury-gold/15 z-50 flex flex-col shadow-2xl md:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-luxury-gold/10">
                <div className="flex flex-col">
                  <span className="font-serif text-lg tracking-[0.1em] text-luxury-charcoal dark:text-luxury-cream">DIVINE CARDINAL</span>
                  <span className="text-[9px] tracking-widest uppercase font-sans text-gray-500">A path of natural well being</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="hover:text-luxury-gold transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-4">
                <div className="px-5 mb-4 relative">
                  <Search className="absolute left-8 top-2.5 h-4 w-4 text-luxury-gold" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className="w-full bg-transparent border border-luxury-gold/30 focus:border-luxury-gold outline-none py-1.5 pl-9 pr-4 text-sm font-serif rounded"
                  />
                </div>
                <div className="px-5 space-y-1">
                  {Object.keys(activeMenuData).map((key) => (
                    <Link
                      key={key}
                      href={activeMenuData[key].link || `/shop?category=${key}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-3.5 border-b border-luxury-gold/10 text-sm font-serif text-luxury-charcoal dark:text-luxury-cream hover:text-luxury-gold transition-colors"
                    >
                      <span>{activeMenuData[key].title}</span>
                    </Link>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="px-5 mt-6 space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-gray-400 font-sans mb-3">Quick Links</p>
                  <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-sm font-sans text-luxury-charcoal dark:text-luxury-cream hover:text-luxury-gold transition-colors">All Products</Link>
                  <Link href="/blogs" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-sm font-sans text-luxury-charcoal dark:text-luxury-cream hover:text-luxury-gold transition-colors">Journal & Blogs</Link>
                  <Link href="/pages/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-sm font-sans text-luxury-charcoal dark:text-luxury-cream hover:text-luxury-gold transition-colors">About Us</Link>
                  <Link href="/pages/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-sm font-sans text-luxury-charcoal dark:text-luxury-cream hover:text-luxury-gold transition-colors">Contact</Link>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-luxury-gold/10 space-y-3">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 text-sm font-sans text-luxury-charcoal dark:text-luxury-cream">
                      <UserIcon className="h-4 w-4" />
                      <span>Hi, {user.firstName}</span>
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full bg-luxury-gold/10 text-luxury-charcoal dark:text-luxury-cream py-2 rounded text-xs uppercase tracking-widest font-serif">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2 text-sm font-sans text-luxury-charcoal dark:text-luxury-cream">
                    <UserIcon className="h-4 w-4" />
                    <span>Account / Login</span>
                  </Link>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-gray-500">Currency</span>
                  <div className="flex space-x-2">
                    {['INR', 'USD', 'EUR', 'AED'].map((cur) => (
                      <button
                        key={cur}
                        onClick={() => setCurrency(cur as any)}
                        className={`text-[10px] font-serif px-2 py-1 rounded ${currency === cur ? 'bg-luxury-gold text-white' : 'bg-luxury-gold/10 text-luxury-charcoal dark:text-luxury-cream'}`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Dialog */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-0 bg-luxury-cream border-b border-luxury-gold/15 p-4 sm:p-6 z-50 shadow-2xl flex items-center justify-between"
          >
            <div className="max-w-3xl mx-auto w-full flex flex-col relative">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Search className="h-5 w-5 text-luxury-gold flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search our luxury Ayurvedic catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="w-full bg-transparent border-b border-luxury-gold/30 focus:border-luxury-gold outline-none py-2 text-lg font-serif"
                  autoFocus
                />
              </div>
              {filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl border border-luxury-gold/20 rounded-md overflow-hidden z-50">
                  {filteredProducts.map(product => (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.handle || product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center px-4 py-3 hover:bg-luxury-cream/50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      {product.images && product.images[0] && (
                         <img src={optimizeCloudinaryUrl(product.images[0].url, 100)} alt={product.name} className="w-10 h-10 object-cover rounded shadow-sm mr-4" />
                      )}
                      <div>
                        <h4 className="font-serif text-luxury-charcoal text-sm">{product.name}</h4>
                        <p className="text-xs text-luxury-gold uppercase tracking-widest">{product.category || 'Luxury Collection'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setIsSearchOpen(false)} className="hover:text-luxury-gold transition-colors ml-4">
              <X className="h-6 w-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
