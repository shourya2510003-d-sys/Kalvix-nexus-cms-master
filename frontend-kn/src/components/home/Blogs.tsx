'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import Image from 'next/image';

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsubscribe = onValue(blogsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // convert to array and filter approved/valid ones if needed
        const parsed = Object.keys(data).map(k => ({ id: k, ...data[k] })).reverse();
        setBlogs(parsed);
      } else {
        setBlogs([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-bg-card relative flex justify-center items-center">
        <div className="text-gold-primary animate-pulse">Loading Blogs...</div>
      </section>
    );
  }

  if (blogs.length === 0) return null;

  return (
    <section className="py-12 bg-bg-card relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">Latest Insights</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold text-text-primary leading-tight">
              Our Blogs
            </h3>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <Link href="/blogs" className="inline-flex items-center gap-2 font-semibold text-gold-primary hover:text-text-primary transition-colors">
              View All Blogs <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogs.slice(0, 4).map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-bg-primary border border-border rounded-xl p-8 hover:shadow-md transition-shadow duration-300 group flex flex-col"
            >
              {blog.image && (
                <div className="w-full h-48 mb-6 relative rounded-lg overflow-hidden border border-border">
                  <img src={blog.image} alt={blog.title || 'Blog Image'} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">
                {blog.date && <span className="flex items-center gap-1"><Calendar size={14} /> {blog.date}</span>}
              </div>
              
              <h4 className="text-xl font-outfit font-bold text-text-primary mb-4">{blog.title}</h4>
              
              <div className="space-y-4 mb-4 flex-grow">
                {blog.content && (
                  <p className="text-sm text-text-muted whitespace-pre-wrap line-clamp-3">{blog.content.replace(/<[^>]*>?/gm, '')}</p>
                )}
              </div>
              
              {blog.tags && (
                <div className="mb-8">
                  <span className="inline-block bg-gold-primary/10 text-gold-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                    {blog.tags}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <Link 
                  href={`/blogs/${blog.id}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-black bg-gold-primary px-5 py-2.5 rounded hover:bg-gold-light transition-colors"
                >
                  Read More
                </Link>
                {blog.author && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-widest">
                    <User size={14} /> {blog.author}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
