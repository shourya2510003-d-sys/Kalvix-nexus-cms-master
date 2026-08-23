import React from 'react';
import HomeClient from '../../HomeClient';

export const dynamic = 'force-dynamic';

async function getPageData() {
  let bestSellers: any[] = [];
  try {
    const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
    const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data) {
      const arr = data.products || data.data || data;
      if (Array.isArray(arr) && arr.length > 0) {
        bestSellers = arr
          .filter((p: any) => p.status === 'ACTIVE')
          .map((p: any) => {
            const priceNum = p.basePrice ? Number(p.basePrice) : (p.price ? Number(p.price) : 0);
            const imageUrl = p.images?.[0]?.url || p.image || '/bottle3.webp';
            
            return {
              id: String(p.id),
              name: p.name || 'Unnamed Product',
              slug: p.slug || `product-${p.id}`,
              summary: p.description || 'Premium Ayurvedic blend crafted with pure natural extracts.',
              basePrice: priceNum,
              rating: p.rating || 4.8,
              images: [{ url: imageUrl }],
              variants: [{ id: `var-${p.id}`, title: 'Default', price: priceNum, sku: p.sku || `SKU-${p.id}` }]
            };
          });
      }
    }
    }
  } catch (error) {}

  const banners = [
    {
      id: 'banner-hero-1',
      title: 'Vedic Wisdom Meets Modern Luxury',
      subtitle: 'Pure, organic, and highly-efficacious Ayurvedic formulations crafted for contemporary wellness.',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1200',
      link: '/shop',
    },
  ];

  if (bestSellers.length === 0) {
    bestSellers = [
      {
        id: '1', name: 'Chamomile Teething Roll-On', slug: 'chamomile-teething-roll-on',
        summary: 'Soothing external roll-on for baby teething discomfort.', basePrice: '599.00', rating: 4.8,
        images: [{ url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400' }],
        variants: [{ id: 'var-1', title: '10ml', price: '599.00', sku: 'DC-BABY-TEETH-10ML' }],
      }
    ];
  }

  return { banners, bestSellers };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getPageData();
  const { slug } = await params;
  
  let initialLayout: any[] = [];
  try {
    const layoutRes = await fetch(`https://divine-cardinal-default-rtdb.firebaseio.com/layouts/page-${slug}.json`, { cache: 'no-store' });
    if (layoutRes.ok) {
      const layoutData = await layoutRes.json();
      if (layoutData) {
        initialLayout = Object.values(layoutData).sort((a: any, b: any) => a.order - b.order);
      }
    }
  } catch (error) {
    console.error("Failed to fetch layout:", error);
  }

  return (
    <main className="min-h-screen">
      <HomeClient banners={data.banners} bestSellers={data.bestSellers} pageId={slug} initialLayout={initialLayout} />
    </main>
  );
}
