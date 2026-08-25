'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Loader2, CheckCircle } from 'lucide-react';
import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function LeaveReview() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    text: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating first.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const reviewsRef = ref(db, 'reviews');
      await push(reviewsRef, {
        ...formData,
        rating,
        approved: false, // Default to false so it requires admin approval
        createdAt: Date.now()
      });
      
      setIsSuccess(true);
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 bg-bg-primary relative overflow-hidden border-t border-gold-primary/10">
      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-outfit font-bold text-text-primary mb-4">
            Rate Your Experience
          </h2>
          <p className="text-text-muted mb-8 max-w-xl mx-auto text-sm">
            We value your feedback. Let us know how Kalvix Nexus helped you achieve your goals.
          </p>

          {!isSuccess ? (
            <div className="flex flex-col items-center">
              <div className="flex gap-2 mb-8 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.div
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleStarClick(star)}
                  >
                    <Star
                      size={40}
                      className={`transition-colors duration-200 ${
                        star <= (hoverRating || rating)
                          ? "fill-gold-primary text-gold-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                          : "text-gold-primary/30"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {isFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    className="w-full max-w-lg mx-auto overflow-hidden"
                  >
                    <form onSubmit={handleSubmit} className="bg-bg-card border border-gold-primary/20 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4 text-left">
                      {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs text-center">
                          {error}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-1">Your Name</label>
                          <input 
                            type="text" 
                            required
                            className="w-full bg-bg-primary border border-border/50 rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-1">Role / Job Title</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Founder"
                            className="w-full bg-bg-primary border border-border/50 rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-1">Company Name</label>
                        <input 
                          type="text" 
                          className="w-full bg-bg-primary border border-border/50 rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-rajdhani uppercase tracking-widest text-text-muted mb-1">Your Review</label>
                        <textarea 
                          required
                          rows={4}
                          className="w-full bg-bg-primary border border-border/50 rounded-lg px-4 py-2 text-sm text-text-primary focus:border-gold-primary outline-none transition-colors resize-none"
                          value={formData.text}
                          onChange={(e) => setFormData({...formData, text: e.target.value})}
                        ></textarea>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-gold-primary text-black font-bold uppercase tracking-wider text-xs py-3 rounded-lg hover:bg-gold-light transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
                      >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Submit Review</>}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl max-w-lg mx-auto flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="font-orbitron font-bold text-emerald-400 text-xl">Review Submitted!</h3>
              <p className="text-sm text-text-muted">
                Thank you for your feedback. Your review is currently pending and will be published once approved by our team.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
