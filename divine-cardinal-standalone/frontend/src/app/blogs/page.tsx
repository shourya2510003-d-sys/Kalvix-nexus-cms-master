'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, ref, onValue } from '../../lib/firebase';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const blogsRef = ref(db, 'blogs');
    const unsub = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Only show published blogs
        const published = Object.values(data).filter((b: any) => b.status === 'published');
        // Sort by date descending
        published.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBlogs(published);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-24 font-serif">Loading wisdom...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-luxury-charcoal mb-4 text-center">Ayurvedic Journal</h1>
        <p className="text-center text-gray-500 font-light mb-16 max-w-2xl mx-auto">
          Insights, rituals, and timeless wisdom for modern holistic living. Powered by Nexus OS SEO Intelligence.
        </p>

        {blogs.length === 0 ? (
          <div className="text-center text-gray-400 font-serif italic py-20">
            No entries have been published yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group">
                <div className="bg-white p-6 md:p-8 border border-[#E5E5E5] hover:border-luxury-gold transition-colors duration-300 h-full flex flex-col shadow-sm hover:shadow-md">
                  <span className="text-[10px] uppercase tracking-widest text-luxury-gold mb-4 font-semibold">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <h2 className="font-serif text-xl md:text-2xl text-luxury-charcoal mb-3 group-hover:text-luxury-gold transition-colors">{blog.title}</h2>
                  <p className="text-sm text-gray-600 font-light leading-relaxed flex-grow mb-6 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <span className="text-xs uppercase tracking-widest text-black border-b border-black self-start pb-1 font-medium">Read Article</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
