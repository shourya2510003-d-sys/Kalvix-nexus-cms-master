'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewsData, setReviewsData] = useState<any[]>([]);

  useEffect(() => {
    const reviewsRef = ref(db, 'reviews');
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        const approved = parsed.filter(r => r.approved === true);
        setReviewsData(approved);
      } else {
        setReviewsData([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayList = reviewsData;

  useEffect(() => {
    if (displayList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [displayList.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayList.length) % displayList.length);
  };

  if (displayList.length === 0) return null;

  return (
    <section className="py-24 bg-bg-primary relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">Testimonials</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold text-text-primary leading-tight">
              What Our Clients Say.
            </h3>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="absolute top-0 left-0 text-gold-primary/10 transform -translate-x-1/2 -translate-y-1/2 z-0">
            <Quote size={120} />
          </div>

          <div className="relative z-10 bg-bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-bg-primary/50 border border-gold-primary/10 p-8 md:p-12 rounded-2xl relative"
              >
                <Quote className="absolute -top-6 right-6 text-gold-primary w-16 h-16 drop-shadow-sm stroke-[1.5]" />
                
                <div className="flex items-center gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={18} className="fill-gold-primary text-gold-primary" />
                  ))}
                </div>

                <p className="text-lg md:text-xl text-text-primary leading-relaxed font-inter mb-8 relative z-10 italic">
                  "{displayList[currentIndex]?.text}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-primary/20 flex items-center justify-center font-bold text-gold-primary border border-gold-primary/40">
                    {displayList[currentIndex]?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-orbitron font-bold text-text-primary uppercase tracking-wide">
                      {displayList[currentIndex]?.name}
                    </h4>
                    <p className="text-gold-primary text-sm font-medium uppercase tracking-widest mt-0.5">
                      {displayList[currentIndex]?.role}, {displayList[currentIndex]?.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {displayList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-12 h-1 rounded-full transition-colors ${
                    idx === currentIndex ? 'bg-gold-primary' : 'bg-gold-primary/20 hover:bg-gold-primary/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
