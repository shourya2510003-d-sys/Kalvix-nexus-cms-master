'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import Loader from '@/components/Loader';
import { ArrowLeft, Calendar, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BlogDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const blogRef = ref(db, `blogs/${id}`);
        const snapshot = await get(blogRef);
        if (snapshot.exists()) {
          setBlog({ id: snapshot.key, ...snapshot.val() });
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  return (
    <div className="bg-bg-primary min-h-screen flex flex-col text-text-primary selection:bg-gold-primary selection:text-black">
      
      <main className="flex-1 relative pb-16 overflow-hidden">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gold-glow-heavy rounded-full blur-[150px] pointer-events-none opacity-20" />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="mb-10">
            <Link href="/blogs" className="inline-flex items-center gap-2 text-text-muted hover:text-gold-primary transition-colors font-rajdhani uppercase tracking-widest text-sm mb-6">
              <ArrowLeft size={16} /> Back to Blogs
            </Link>
          </div>

          {loading ? (
            <Loader text="Loading Blog..." />
          ) : !blog ? (
            <div className="text-center py-20 bg-bg-card rounded-2xl border border-gold-primary/10">
              <p className="text-text-muted font-rajdhani uppercase tracking-widest">Blog not found or deleted.</p>
              <Link href="/blogs" className="mt-4 inline-block text-gold-primary font-bold hover:underline">Go Back</Link>
            </div>
          ) : (
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card border border-gold-primary/10 rounded-2xl p-6 md:p-10 shadow-xl"
            >
              {blog.tags && (
                <div className="mb-6">
                  <span className="inline-block bg-gold-primary/10 text-gold-primary text-xs font-rajdhani font-bold uppercase tracking-widest px-3 py-1 rounded">
                    {blog.tags}
                  </span>
                </div>
              )}
              
              <h1 className="text-3xl md:text-5xl font-outfit font-bold text-text-primary mb-6 leading-tight">
                {blog.title}
              </h1>

              <div className="flex items-center gap-6 text-sm font-rajdhani font-bold text-text-muted uppercase tracking-widest mb-10 pb-6 border-b border-gold-primary/10">
                {blog.date && <span className="flex items-center gap-2"><Calendar size={16} className="text-gold-primary" /> {blog.date}</span>}
              </div>

              {blog.image && (
                <div className="w-full h-[300px] md:h-[500px] mb-10 relative rounded-xl overflow-hidden border border-white/5 shadow-2xl">
                  <img src={blog.image} alt={blog.title} className="object-cover w-full h-full" />
                </div>
              )}

              <div className="prose prose-invert prose-gold max-w-none font-sans text-text-primary/90 leading-loose whitespace-pre-wrap mb-12">
                {blog.content}
              </div>
              
              {blog.author && (
                <div className="pt-6 border-t border-gold-primary/10 flex justify-start">
                  <span className="flex items-center gap-2 text-sm font-rajdhani font-bold text-text-muted uppercase tracking-widest">
                    <User size={16} className="text-gold-primary" /> Written by {blog.author}
                  </span>
                </div>
              )}
            </motion.article>
          )}
        </div>
      </main>
    </div>
  );
}
