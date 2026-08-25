'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Calendar, User } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import Loader from '@/components/Loader';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
        setBlogs(parsed);
      } else {
        setBlogs([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col text-text-primary selection:bg-gold-primary selection:text-black">
      
      <main className="flex-1 relative pb-16 overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gold-glow-heavy rounded-full blur-[150px] pointer-events-none opacity-20" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-10" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-gold-primary transition-colors font-rajdhani uppercase tracking-widest text-xs mb-4">
              <ArrowLeft size={14} /> Back to Home
            </Link>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-outfit font-bold text-text-primary mb-4"
            >
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-primary to-yellow-600">Blogs</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base text-text-muted max-w-2xl"
            >
              Read our latest articles, insights, and thoughts on web development, digital transformation, and the future of technology.
            </motion.p>
          </div>

          {loading ? (
            <Loader text="Loading Blogs..." />
          ) : blogs.length === 0 ? (
            <div className="text-center py-16 bg-bg-card rounded-xl border border-gold-primary/10">
              <p className="text-text-muted font-rajdhani uppercase tracking-widest text-sm">No Blogs Available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {blogs.map((blog, idx) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-bg-card border border-gold-primary/10 hover:border-gold-primary/30 rounded-xl p-6 hover:shadow-gold-glow transition-all duration-300 group flex flex-col h-full"
                >
                  {blog.image && (
                    <div className="w-full h-56 mb-5 relative rounded-lg overflow-hidden border border-white/5">
                      <img src={blog.image} alt={blog.title || 'Blog Image'} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[10px] font-rajdhani font-bold text-gold-primary uppercase tracking-widest mb-3">
                    {blog.date && <span className="flex items-center gap-1"><Calendar size={12} /> {blog.date}</span>}
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-outfit font-bold text-text-primary mb-3 group-hover:text-gold-light transition-colors">{blog.title}</h3>
                  
                  <div className="space-y-4 mb-3 flex-1">
                    {blog.content && (
                      <p className="text-xs text-text-muted leading-relaxed whitespace-pre-wrap line-clamp-4">{blog.content.replace(/<[^>]*>?/gm, '')}</p>
                    )}
                  </div>
                  
                  {blog.tags && (
                    <div className="mb-4">
                      <span className="inline-block bg-gold-primary/10 text-gold-primary text-[10px] font-rajdhani font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                        {blog.tags}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gold-primary/10 mt-auto">
                    <Link href={`/blogs/${blog.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-primary hover:text-gold-light transition-colors">
                      Read Article <ArrowLeft size={14} className="rotate-180" />
                    </Link>
                    {blog.author && (
                      <span className="flex items-center gap-1 text-[10px] font-rajdhani font-bold text-text-muted uppercase tracking-widest">
                        <User size={12} /> {blog.author}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
