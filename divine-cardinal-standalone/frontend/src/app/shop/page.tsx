import React from 'react';
import ShopClient from './ShopClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop - Divine Cardinal',
  description: 'Browse our complete collection of premium Ayurvedic wellness products and organic therapeutic oils.',
  openGraph: {
    title: 'Shop - Divine Cardinal',
    description: 'Browse our complete collection of premium Ayurvedic wellness products and organic therapeutic oils.',
    url: 'https://divinecardinal.com/shop',
  }
};

export const dynamic = 'force-dynamic';

async function getProductsData(params: { category?: string; search?: string; sortBy?: string; ingredient?: string; concern?: string }) {
  let allProducts: any[] = [];
  let layout: any[] = [];
  let categories: any[] = [];
  let allowedSlugs = [
    'womens-care', 'women-s-care', 'wellness-category', 'mother-care', 'men-care', 'hair-care', 'face-and-body', 'attar-and-toners', 'baby-care-range'
  ];
  let ingredients = ['Neem', 'Jojoba', 'Sandalwood', 'Rose', 'Lavender', 'Almond', 'Grapefruit', 'Argan', 'Vitamin E'];
  let concerns = ['Dandruff', 'Hair Fall', 'Dry Skin', 'Anti-Aging', 'Acne', 'Pain Relief', 'Stress Relief', 'Glowing Skin', 'Stretch Marks'];

  try {
    const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';

    try {
      const filtersRes = await fetch(`${API_URL}/cms/layout/shop_filters`, { cache: 'no-store' });
      if (filtersRes.ok) {
        const text = await filtersRes.text();
        if (text) {
          const filterData = JSON.parse(text);
          if (filterData.allowedCategories && Array.isArray(filterData.allowedCategories)) {
            allowedSlugs = filterData.allowedCategories;
          }
          if (filterData.ingredients && Array.isArray(filterData.ingredients)) {
            ingredients = filterData.ingredients;
          }
          if (filterData.concerns && Array.isArray(filterData.concerns)) {
            concerns = filterData.concerns;
          }
        }
      }
    } catch (err) {
      console.warn('Shop filters fetch error:', err);
    }

    try {
      const catRes = await fetch(`${API_URL}/products/categories`, { cache: 'no-store' });
      if (catRes.ok) {
        const text = await catRes.text();
        if (text) {
          const catData = JSON.parse(text);
          categories = Array.isArray(catData) ? catData : (catData.categories || []);
          
          // Filter out junk categories, only allow the valid ones
          categories = categories.filter(c => allowedSlugs.includes(c.slug));
        }
      }
    } catch (err) {
      console.warn('Categories fetch error:', err);
    }

    try {
      const layoutRes = await fetch(`${API_URL}/cms/layout/shop`, { cache: 'no-store' });
      if (layoutRes.ok) {
        const text = await layoutRes.text();
        if (text) {
          const layoutData = JSON.parse(text);
          if (Array.isArray(layoutData)) layout = layoutData;
        }
      }
    } catch (err) {
      console.warn('Layout fetch error:', err);
    }

    const res = await fetch(`${API_URL}/products?limit=1000`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        let arr = data.products || data.data || data;
        if (Array.isArray(arr)) {
          try {
            const extrasRes = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/product_extras.json`, { cache: 'no-store' });
            if (extrasRes.ok) {
              const extras = await extrasRes.json();
              if (extras) arr = arr.map((p: any) => ({ ...p, ...(extras[p.id] || {}) }));
            }
          } catch(e) {}
          
          allProducts = arr
            .filter((p: any) => p.status?.toLowerCase() === 'active')
            .map((p: any) => {
            const priceNum = p.basePrice ? Number(p.basePrice) : (p.price ? Number(p.price) : 0);
            const imageUrl = p.images?.[0]?.url || p.image || '/bottle3.webp';
            
            // Fix slug if it is just the ID or missing
            const derivedSlug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const finalSlug = (p.slug && p.slug !== String(p.id)) ? p.slug : ((p.handle && p.handle !== String(p.id)) ? p.handle : (derivedSlug || `product-${p.id}`));

            // Fix categories for Face & Body
            let mappedCategories = p.categories;
            if (!mappedCategories && p.category) {
              const catSlug = p.category.toLowerCase().replace(/ & /g, '-and-').replace(/[^a-z0-9]+/g, '-');
              mappedCategories = [{ slug: catSlug }];
            }
            if (!mappedCategories || mappedCategories.length === 0) {
               mappedCategories = [{ slug: 'uncategorized' }];
            }
            // Ensure face-body maps to face-and-body so it appears in shop sidebar
            mappedCategories = mappedCategories.map((c: any) => {
              if (c.slug === 'face-body' || c.slug === 'face-and-body-care') return { slug: 'face-and-body' };
              return c;
            });

            return {
              id: String(p.id),
              name: p.name || 'Unnamed Product',
              slug: finalSlug,
              summary: p.description || 'Premium Ayurvedic blend crafted with pure natural extracts.',
              keyIngredients: p.keyIngredients || '',
              howToUse: p.howToUse || '',
              basePrice: priceNum,
              rating: p.rating || 4.8,
              categories: mappedCategories,
              images: [{ url: imageUrl }],
              variants: [{ id: `var-${p.id}`, title: 'Default', price: priceNum, sku: p.sku || `SKU-${p.id}` }]
            };
          });
      }
    }
    }
  } catch (error) {
    console.warn('Firebase connection failed in shop page. Using default fallback.');
  }

  let filtered = allProducts;
  if (params.category) {
    filtered = filtered.filter((p) => {
      let cats = p.categories;
      if (typeof cats === 'string') cats = [{ slug: cats }];
      else if (Array.isArray(cats)) cats = cats.map((c: any) => typeof c === 'string' ? { slug: c } : c);
      else cats = [];
      return cats.some((c: any) => c.slug === params.category || (params.category === 'womens-care' && c.slug === 'women-s-care'));
    });
  }
  if (params.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term) || p.summary.toLowerCase().includes(term));
  }
  if (params.ingredient) {
    const term = params.ingredient.toLowerCase();
    filtered = filtered.filter((p) => p.keyIngredients?.toLowerCase().includes(term));
  }
  if (params.concern) {
    const term = params.concern.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term) || p.summary.toLowerCase().includes(term) || p.howToUse?.toLowerCase().includes(term) || p.keyIngredients?.toLowerCase().includes(term));
  }
  
  if (params.sortBy) {
    const [field, order] = params.sortBy.split(':');
    filtered = [...filtered].sort((a, b) => {
      const valA = Number(a.basePrice);
      const valB = Number(b.basePrice);
      return order === 'asc' ? valA - valB : valB - valA;
    });
  }

  return { products: filtered, categories, ingredients, concerns, layout };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sortBy?: string; ingredient?: string; concern?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const data = await getProductsData(resolvedSearchParams);

  return <ShopClient products={data.products} initialParams={resolvedSearchParams} categories={data.categories} ingredients={data.ingredients} concerns={data.concerns} layout={data.layout} />;
}
