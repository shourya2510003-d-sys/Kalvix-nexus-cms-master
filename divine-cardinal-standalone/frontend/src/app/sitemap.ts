import { MetadataRoute } from 'next';

async function getProducts() {
  const API_URL = process.env.API_URL || 'https://kalvix-nexus-production.up.railway.app/api';
  try {
    const res = await fetch(`${API_URL}/products?limit=1000`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
    return [];
  }
}

async function getCategories() {
  const API_URL = process.env.API_URL || 'https://kalvix-nexus-production.up.railway.app/api';
  try {
    const res = await fetch(`${API_URL}/products/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://divinecardinal.com';

  // Dynamic products
  const products = await getProducts();
  const productUrls = products
    .filter((p: any) => (p.status === 'ACTIVE' || p.status === 'active') && p.slug)
    .map((p: any) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: p.isBestSeller ? 0.9 : 0.8,
    }));

  // Categories
  const categories = await getCategories();
  
  const categoryUrls = categories.map((c: any) => ({
    url: `${baseUrl}/shop?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Static pages
  const staticPages = [
    { url: baseUrl, priority: 1.0, freq: 'daily' },
    { url: `${baseUrl}/shop`, priority: 0.95, freq: 'daily' },
    { url: `${baseUrl}/pages/about`, priority: 0.7, freq: 'monthly' },
    { url: `${baseUrl}/pages/contact`, priority: 0.6, freq: 'monthly' },
    { url: `${baseUrl}/pages/soundarya-club`, priority: 0.65, freq: 'weekly' },
    { url: `${baseUrl}/pages/privacy-policy`, priority: 0.4, freq: 'monthly' },
    { url: `${baseUrl}/pages/terms-of-service`, priority: 0.4, freq: 'monthly' },
    { url: `${baseUrl}/pages/shipping-returns`, priority: 0.5, freq: 'monthly' },
    { url: `${baseUrl}/pages/ingredients`, priority: 0.55, freq: 'monthly' },
    { url: `${baseUrl}/auth/login`, priority: 0.3, freq: 'monthly' },
    { url: `${baseUrl}/auth/register`, priority: 0.3, freq: 'monthly' },
  ];

  const staticUrls = staticPages.map(({ url, priority, freq }) => ({
    url,
    lastModified: new Date(),
    changeFrequency: freq as 'daily' | 'weekly' | 'monthly',
    priority,
  }));

  return [
    ...staticUrls,
    ...productUrls,
    ...categoryUrls,
  ];
}
