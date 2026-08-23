import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ArticleData {
  title: string;
  category: string;
  date: string;
  intro: string;
  body: string[];
}

const ARTICLES: Record<string, ArticleData> = {
  'future-of-web-automation': {
    title: 'Setting Up Production-Ready Web Architectures',
    category: 'AI & Automation',
    date: 'March 2026',
    intro: 'Modern digital web applications demand modularity, sub-second rendering targets, and clean state handling.',
    body: [
      'When building high-performance websites, developers must decide between client-side rendering (CSR), server-side rendering (SSR), and static site generation (SSG). Next.js provides the flexibility to mix these techniques using server and client components.',
      'To prevent rendering delays, static content should be served directly from CDN edges, while database queries are resolved on server nodes with aggressive caching mechanisms. Keeping heavy client interactions (like canvas animations and voice widget modules) isolated to dynamic lazy imports ensures that your main thread stays light.',
      'Additionally, asset management remains a key factor. Using lightweight modern file types (like WebP images and SVG icons) reduces page payloads. By optimizing the loading timeline of external scripts, you can guarantee a premium, instantaneous user experience.'
    ]
  },
  'meta-ads-guide-2026': {
    title: 'The Ultimate Guide to Scaling Meta Ads in 2026',
    category: 'Digital Marketing',
    date: 'April 2026',
    intro: 'Scaling Facebook and Instagram ads requires a shift from technical campaign hacks to creative clarity and landing page speed.',
    body: [
      'In recent years, Meta ads algorithms have become incredibly smart at identifying prospective buyers. This means complex manual targeting exclusions and bidding hacks are no longer necessary. Instead, the algorithm relies heavily on ad creatives and copy to find the right audience.',
      'Focus on drafting compelling hook variations and testing high-emotion image or video angles. The job of the ad is simply to earn the click; the landing page has the job of closing the sale. If your landing page takes longer than 2 seconds to load on mobile connections, your bounce rate will spike, destroying your campaign ROAS.',
      'Ensure you set up clean Conversions API (CAPI) event tracking alongside standard browser pixels. Direct server-to-server data pipelines ensure Meta receives accurate attribution data, allowing it to optimize your bids for the highest possible returns.'
    ]
  },
  'conversion-rate-optimization': {
    title: 'CRO Secrets: How We Redesigned Storefronts for a 15% Conversion Boost',
    category: 'E-Commerce Growth',
    date: 'May 2026',
    intro: 'Converting traffic into buyers is a science of speed, friction removal, and trust.',
    body: [
      'Many e-commerce stores fail to convert visitors not because their products are weak, but because their buying loop is filled with friction. Complicated sign-up forms, slow shopping carts, and hidden shipping fees are the main drivers of checkout abandonment.',
      'To address this, implement headless checkout overlays and one-click payment gateways (like Razorpay or Stripe). By keeping the checkout on a single fast page and pre-filling basic user inputs, you can remove major friction points.',
      'Equally important is mobile responsiveness. Over 80% of digital retail traffic comes from mobile screens. Compressing product images, building sticky cart buttons, and using clean, modern typography will make shopping fluid and result in a measurable bump in sales.'
    ]
  }
};

export default async function DynamicArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES[slug];

  if (!article) notFound();

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen py-16 px-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-xs font-rajdhani font-black tracking-widest uppercase text-gold-primary hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Resources</span>
        </Link>

        {/* Article Header */}
        <div className="border-b border-gold-primary/10 pb-8 mb-8">
          <div className="flex items-center justify-between text-[10px] font-mono text-gold-primary mb-3">
            <span>{article.category}</span>
            <span className="text-text-muted">{article.date}</span>
          </div>
          <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-text-primary uppercase tracking-wide leading-tight">
            {article.title}
          </h1>
        </div>

        {/* Intro */}
        <p className="text-sm font-medium text-text-primary mb-6 leading-relaxed font-inter italic border-l-2 border-gold-primary pl-4">
          {article.intro}
        </p>

        {/* Body Paragraphs */}
        <div className="space-y-6 font-inter text-xs sm:text-sm leading-relaxed text-text-muted">
          {article.body.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
}