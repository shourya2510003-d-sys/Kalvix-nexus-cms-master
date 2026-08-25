import { MetadataRoute } from 'next';

/**
 * Technical SEO Sitemap (AEO/GEO/LLMO Optimized)
 * Generates an automated, XML sitemap dynamically.
 * Scalable for 500+ pages (Next.js automatically supports pagination if needed, or we can use generateSitemaps).
 * 
 * Intelligent Priorities:
 * 1.0 - Homepage
 * 0.95 - Service Pages
 * 0.90 - Solutions (Future scaling)
 * 0.85 - Portfolio / Case Studies
 * 0.80 - Blog
 * 0.75 - About & Contact
 * 0.50 - Support / Careers
 * 0.40 - Policies
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kalvixnexus.com';
  const lastModified = new Date(); // Dynamic freshness signal for AI crawlers & search engines

  return [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.50,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.50,
    }
  ];
}
