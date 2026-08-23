'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, ref, onValue } from '../../../lib/firebase';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const blogsRef = ref(db, 'blogs');
    const unsub = onValue(blogsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const found = Object.values(data).find((b: any) => b.slug === slug && b.status === 'published');
        if (found) {
          setBlog(found);
        } else {
          router.push('/blogs'); // Redirect if not found or not published
        }
      } else {
        router.push('/blogs');
      }
      setLoading(false);
    });

    return () => unsub();
  }, [slug, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-24 font-serif">Loading...</div>;
  }

  if (!blog) return null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://divinecardinal.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    datePublished: new Date(blog.createdAt).toISOString(),
    author: {
      '@type': 'Person',
      name: blog.author || 'Divine Cardinal Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Divine Cardinal International',
      logo: {
        '@type': 'ImageObject',
        url: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116344/kalvix_nexus/navbar/women_care_menu.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blogs/${slug}`
    }
  };

  return (
    <article className="min-h-screen bg-[#FAF9F6] pt-32 pb-20 px-4 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 shadow-sm border border-[#E5E5E5]">
        <Link href="/blogs" className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-500 hover:text-luxury-gold mb-12 transition-colors">
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Journal</span>
        </Link>
        
        <header className="mb-12 border-b border-gray-100 pb-12 text-center">
          <div className="text-[10px] uppercase tracking-widest text-luxury-gold mb-6 font-semibold flex justify-center items-center space-x-2">
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>{blog.author}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-serif text-luxury-charcoal leading-tight">
            {blog.title}
          </h1>
        </header>

        <div className="prose prose-stone prose-lg max-w-none font-serif text-[#4A4A4A] leading-relaxed
          prose-headings:font-serif prose-headings:text-luxury-charcoal prose-headings:font-normal
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:mb-6 prose-a:text-luxury-gold hover:prose-a:text-black
          prose-strong:text-black prose-strong:font-semibold">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
