import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Cpu, Target, Award, Key } from 'lucide-react';

interface ProjectDetails {
  title: string;
  category: string;
  stack: string;
  problem: string;
  solution: string;
  metrics: string;
  deliverables: string[];
}

const REPO: Record<string, ProjectDetails> = {
  'namaste-india': {
    title: 'Namaste India',
    category: 'Web Systems',
    stack: 'Next.js 16, Firebase Firestore, Tailwind CSS, Algolia Search',
    problem: 'Heavy database query overhead handling multi-category local directory searches and indexing across 50,000+ businesses simultaneously.',
    solution: 'Designed decentralized search indices with custom caching layers on local clients, reducing lookups to milliseconds and cutting database read costs by 70%.',
    metrics: '50K+ Businesses Listed | <100ms Query Latency',
    deliverables: ['Custom Search Engine', 'Indexed Database Structures', 'Optimized SEO Site-Map'],
  },
  'fittrack-pro': {
    title: 'FitTrack Pro',
    category: 'Web Systems',
    stack: 'React Native, Node.js REST API, PostgreSQL, Chart.js',
    problem: 'Low user retention on progress screens due to heavy chart rendering lag and delayed database syncing on low-connectivity devices.',
    solution: 'Implemented offline-first SQLite synchronization alongside optimized Canvas renders for real-time charting, driving client-side rendering speed to 60fps.',
    metrics: '100K+ App Downloads | +35% Monthly User Retention',
    deliverables: ['Offline-First Sync Engine', 'High-Speed Analytics Canvas', 'Push Notification Pipelines'],
  },
  'eduverse': {
    title: 'EduVerse LMS',
    category: 'Web Systems',
    stack: 'Next.js, Apollo GraphQL, PostgreSQL, Redis Cache',
    problem: 'Severe database locks and session crashes during peak online test hours with over 10,000 students accessing tests concurrently.',
    solution: 'Introduced Redis session caching and split reading workloads through GraphQL resolvers, eliminating database locking entirely.',
    metrics: '10K+ Concurrent Student Sessions | Zero Server Crashes',
    deliverables: ['GraphQL Query Architecture', 'Redis Session Store', 'Scalable Question Delivery Engine'],
  },
  'divine-cardinal': {
    title: 'Divine Cardinal',
    category: 'E-Commerce',
    stack: 'Next.js, Payload CMS, Shopify Storefront API, Razorpay',
    problem: 'Slow catalog search and sluggish checkouts (above 3.2s load speed) resulting in 65% shopping cart drop-offs.',
    solution: 'Re-architected static paths generation combined with headless Razorpay checkout overlays, dropping total load speed to 380ms.',
    metrics: '15% Checkout Conversion Boost | 380ms Page Load Speed',
    deliverables: ['Headless Storefront Frontend', 'Stripe/Razorpay Seamless Integration', 'Payload CMS Inventory Console'],
  },
  'stylebazaar': {
    title: 'StyleBazaar Storefront',
    category: 'E-Commerce',
    stack: 'Next.js Commerce, Tailwind CSS, Shopify Custom APIs',
    problem: 'Extremely poor mobile conversion rates caused by large image files and non-responsive product grids on mobile layouts.',
    solution: 'Rebuilt navigation grids and configured automatic WebP image compression with Next.js image caches, elevating mobile revenue by 60%.',
    metrics: '+60% Mobile Sales Growth | 99/100 Lighthouse Performance',
    deliverables: ['Responsive Grid Templates', 'WebP Automated Asset Compressor', 'Next.js Commerce Backend'],
  },
  'greenleaf-organics': {
    title: 'GreenLeaf Organics Scale',
    category: 'Marketing',
    stack: 'Meta Ads Manager, Google Analytics 4, Custom Landing Pages',
    problem: 'Ineffective ad budget spending on Facebook campaigns producing a low 1.5x Return on Ad Spend (ROAS).',
    solution: 'Audited user avatars, rewrote high-emotion ad copies, and routed traffic to custom-tailored, high-speed landing pages, boosting ROAS to 4.2x.',
    metrics: '4.2x Meta Ad ROAS | +180% Organic Impressions',
    deliverables: ['High-Conversion Copy Templates', 'Custom Lead Landing Pages', 'Meta Pixel Event Mapping'],
  },
  'cloudnine-events': {
    title: 'CloudNine Event Branding',
    category: 'Marketing',
    stack: 'Brand Identity Vector Design, Instagram Organic Engine',
    problem: 'Low digital ticket sales and weak online community reach for a premium regional business conference.',
    solution: 'Engineered a unified visual design language and ran a short-form video branding campaign (Reels) that drove complete ticket sellouts.',
    metrics: 'Sold Out 2 Weeks Ahead | 2.5M+ Instagram Reels Views',
    deliverables: ['Social Brand Asset Pack', 'Short-form Video Scripts', 'Event Branding Book'],
  },
  'urbanbite': {
    title: 'UrbanBite Growth System',
    category: 'Marketing',
    stack: 'Google Business Profile, Google Search Ads, Geo-Fencing',
    problem: 'Local food chain struggling to capture digital search share and drive offline foot traffic in metropolitan markets.',
    solution: 'Set up local schema mock-ups, optimized Google Maps reviews flows, and launched geo-fenced PPC ads, boosting customer count by 80%.',
    metrics: '+80% Customer Dine-ins | +210% Website Order Volume',
    deliverables: ['Local SEO Map Optimizations', 'Geo-targeted Google PPC Campaign', 'Online Ordering Funnel Adjustments'],
  },
};

export default async function ProjectSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = REPO[slug];
  
  if (!project) notFound();

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen py-16 px-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-20" />
      <div className="absolute bottom-10 right-[-10%] w-96 h-96 bg-gold-glow rounded-full blur-[120px] pointer-events-none opacity-15" />

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Back Link */}
        <Link 
          href="/portfolio" 
          className="inline-flex items-center gap-2 text-xs font-rajdhani font-black tracking-widest uppercase text-gold-primary hover:text-white transition-colors mb-10 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Case Matrix</span>
        </Link>

        {/* Title & Category */}
        <div className="border-b border-gold-primary/10 pb-8 mb-8">
          <span className="text-[10px] font-mono text-gold-primary uppercase tracking-[0.2em] block mb-2">{project.category}</span>
          <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-text-primary uppercase tracking-wide leading-tight">
            {project.title}
          </h1>
          <div className="font-mono text-[11px] text-text-muted mt-4 p-3 bg-bg-card border border-gold-primary/5 rounded">
            <span className="text-text-primary font-bold">Architecture Stack:</span> {project.stack}
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="bg-gradient-to-r from-gold-primary/10 to-transparent border border-gold-primary/20 p-6 rounded-lg mb-10 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-rajdhani font-black text-gold-primary uppercase tracking-widest mb-1">IMPACT & METRICS</div>
            <div className="font-orbitron font-black text-sm sm:text-base text-text-primary">{project.metrics}</div>
          </div>
          <Award size={28} className="text-gold-primary animate-pulse" />
        </div>

        {/* Problem & Solution Details */}
        <div className="space-y-8 font-inter text-sm leading-relaxed mb-10">
          <div className="bg-bg-card border border-gold-primary/5 p-6 rounded-lg">
            <h3 className="font-orbitron font-bold text-xs text-text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={14} className="text-gold-primary" />
              <span>Identified Overhead / Problem</span>
            </h3>
            <p className="text-text-muted text-xs leading-relaxed">{project.problem}</p>
          </div>

          <div className="bg-bg-card border border-gold-primary/5 p-6 rounded-lg">
            <h3 className="font-orbitron font-bold text-xs text-text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
              <Target size={14} className="text-gold-primary" />
              <span>Applied Solution Architecture</span>
            </h3>
            <p className="text-text-muted text-xs leading-relaxed">{project.solution}</p>
          </div>
        </div>

        {/* Key Deliverables */}
        <div className="bg-bg-card border border-gold-primary/10 p-6 rounded-lg mb-10">
          <h3 className="font-orbitron font-bold text-xs text-text-primary mb-4 uppercase tracking-widest flex items-center gap-2">
            <Key size={14} className="text-gold-primary" />
            <span>Key Deliverables Implemented</span>
          </h3>
          <ul className="space-y-2.5">
            {project.deliverables.map((del, index) => (
              <li key={index} className="flex items-center gap-3 text-xs text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-primary flex-shrink-0" />
                <span>{del}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}