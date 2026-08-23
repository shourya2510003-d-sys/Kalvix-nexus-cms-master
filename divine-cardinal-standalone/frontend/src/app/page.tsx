import React from 'react';
import Link from 'next/link';
import HomeClient from './HomeClient';

export const revalidate = 60; // Cache homepage for 1 minute

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function getHomepageData() {
  const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
  let bestSellers: any[] = [];

  try {
    const res = await fetchWithTimeout(`${API_URL}/products?limit=200`, { next: { revalidate: 300 } }, 5000);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        let arr = data.products || data.data || data;
        if (Array.isArray(arr) && arr.length > 0) {
          try {
            const extrasRes = await fetchWithTimeout(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras.json`, { cache: 'no-store' }, 3000);
            if (extrasRes.ok) {
              const extras = await extrasRes.json();
              if (extras) arr = arr.map((p: any) => ({ ...p, ...(extras[p.id] || {}) }));
            }
          } catch(e) {}
          
          bestSellers = arr
            .filter((p: any) => p.status?.toLowerCase() === 'active')
            .sort((a: any, b: any) => {
              // Prioritize best sellers and featured products first
              const aScore = (a.isBestSeller ? 2 : 0) + (a.isFeatured ? 1 : 0);
              const bScore = (b.isBestSeller ? 2 : 0) + (b.isFeatured ? 1 : 0);
              return bScore - aScore;
            })
            .map((p: any) => {
              const priceNum = p.basePrice ? Number(p.basePrice) : (p.price ? Number(p.price) : 0);
              const imageUrl = p.images?.[0]?.url || p.image || '/bottle3.webp';
              
              const derivedSlug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const finalSlug = (p.slug && p.slug !== String(p.id)) ? p.slug : ((p.handle && p.handle !== String(p.id)) ? p.handle : (derivedSlug || `product-${p.id}`));

              return {
                id: String(p.id),
                sku: p.sku || String(p.id),
                name: p.name || 'Unnamed Product',
                slug: finalSlug,
                summary: p.description || 'Premium Ayurvedic blend crafted with pure natural extracts.',
                basePrice: priceNum,
                compareAtPrice: Number(p.compareAtPrice) || 0,
                rating: p.rating || 4.8,
                reviewCount: p.reviewCount || 0,
                isBestSeller: p.isBestSeller || false,
                isFeatured: p.isFeatured || false,
                images: p.images?.length > 0 ? p.images : [{ url: imageUrl }],
                variants: [{ id: `var-${p.id}`, title: 'Default', price: priceNum, sku: p.sku || `SKU-${p.id}` }]
              };
            });
        }
      }
    }
  } catch (error) {
    console.warn('Backend query failed (timeout or error) in homepage. Using fallback banners and best sellers.');
  }

  let initialLayout: any[] = [];
  try {
    const layoutRes = await fetchWithTimeout(`${API_URL}/cms/layout/homepage_layout`, { next: { revalidate: 60 } }, 8000);
    if (layoutRes.ok) {
      const layoutData = await layoutRes.json();
      if (layoutData) {
        initialLayout = Array.isArray(layoutData) ? layoutData : Object.values(layoutData);
      }
    }
  } catch (err) {
    console.error('Failed to fetch initial layout on server (timeout or error):', err);
  }

  // Fallback banners
  const banners = [
    {
      id: 'banner-hero-1',
      title: 'Vedic Wisdom Meets Modern Luxury',
      subtitle: 'Pure, organic, and highly-efficacious Ayurvedic formulations crafted for contemporary wellness.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1200',
      link: '/shop',
    },
  ];

  return { banners, bestSellers, initialLayout };
}

export default async function Page() {
  const data = await getHomepageData();

  return (
    <HomeClient 
      banners={data.banners} 
      bestSellers={data.bestSellers} 
      initialLayout={data.initialLayout} 
    />
  );
}
