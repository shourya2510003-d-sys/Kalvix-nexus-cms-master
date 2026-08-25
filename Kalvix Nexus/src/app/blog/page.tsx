import Link from 'next/link';

const POSTS = [
  {
    slug: 'future-of-web-automation',
    date: 'March 2026',
    category: 'AI & Automation',
    title: 'Setting Up Production-Ready Web Architectures',
    desc: 'Exploring modern approaches to deploying robust Next.js web applications, serverless systems, and AI widget integrations.'
  },
  {
    slug: 'meta-ads-guide-2026',
    date: 'April 2026',
    category: 'Digital Marketing',
    title: 'The Ultimate Guide to Scaling Meta Ads in 2026',
    desc: 'How targeting algorithms are evolving, and why creative copywriting and landing page speed are the key factors for achieving a 4x+ ROAS.'
  },
  {
    slug: 'conversion-rate-optimization',
    date: 'May 2026',
    category: 'E-Commerce Growth',
    title: 'CRO Secrets: How We Redesigned Storefronts for a 15% Conversion Boost',
    desc: 'A case study on page speed, headless checkout processes, and mobile-first layouts that turn organic traffic into paying customers.'
  }
];

export default function BlogPage() {
  return (
    <div className="bg-bg-primary text-text-primary min-h-screen pb-24 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-20 left-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-20 right-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center py-20">
          <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Knowledge Base</span>
          <h1 className="font-orbitron font-black text-3xl sm:text-5xl text-text-primary mt-2 mb-4 uppercase tracking-wider">
            Resources & Insights
          </h1>
          <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Read our thoughts on web architecture, conversion rate optimization, and advertising strategies.
          </p>
        </div>

        {/* Blog Listings */}
        <div className="space-y-8 max-w-2xl mx-auto">
          {POSTS.map(post => (
            <div 
              key={post.slug} 
              className="bg-bg-card border border-gold-primary/10 p-8 rounded-xl hover:border-gold-primary/30 hover:shadow-gold-glow transition-all duration-300"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-gold-primary mb-3">
                <span>{post.category}</span>
                <span className="text-text-muted">{post.date}</span>
              </div>
              <h2 className="font-orbitron font-bold text-base text-text-primary mb-3 hover:text-gold-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-text-muted text-xs leading-relaxed mb-4">{post.desc}</p>
              
              <Link 
                href={`/blog/${post.slug}`} 
                className="font-rajdhani font-black text-[11px] uppercase tracking-widest text-gold-primary hover:text-white transition-colors"
              >
                Read Article →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}