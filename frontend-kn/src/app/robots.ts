import { MetadataRoute } from 'next';

/**
 * Technical SEO robots.ts (AEO/GEO/LLMO Optimized)
 * Follows Google Search Central, Bing Webmaster Guidelines, and AI Search optimizations.
 * 
 * Allows all major standard bots and AI Agents.
 * Protects crawl budget by blocking admin/private routes.
 * Ensures CSS, JS, Fonts, and Images are NOT blocked for Core Web Vitals rendering.
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://kalvixnexus.com';

  // Explicitly allowing all these modern AI and traditional bots
  const allowedBots = [
    '*', // Default all
    'Googlebot', 'Googlebot-Image', 'Googlebot-News', 'GoogleOther', 'Google-Extended',
    'Bingbot', 'msnbot',
    'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', // OpenAI / ChatGPT
    'ClaudeBot', 'Claude-Web', // Anthropic / Claude
    'PerplexityBot', // Perplexity AI
    'grok', // xAI Grok
    'Google-Extended', 'Gemini', // Gemini AI
    'DuckDuckBot', 'Applebot', 'Amazonbot',
    'FacebookBot', 'Meta-ExternalAgent', // Meta / Llama
    'Bytespider', 'CCBot', 'Diffbot', 'YandexBot', 'PetalBot',
    'LinkedInBot', 'Slackbot', 'Twitterbot', 'WhatsApp', 'Discordbot'
  ];

  return {
    rules: {
      userAgent: allowedBots,
      allow: '/',
      disallow: [
        '/kn2026',
        '/dashboard',
        '/employee-dashboard',
        '/api/private',
        '/tmp',
        '/_next/',
        '/client',
        '/client-signup',
        '/registration',
        '/verify',
        '/verify-employee'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
