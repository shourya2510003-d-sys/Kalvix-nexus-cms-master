'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Cpu,
  Globe,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle,
  Award,
  ShieldCheck,
  Zap,
  TrendingUp,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Users,
  Briefcase,
  ExternalLink,
  Loader2,
  Lock,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  Download,
  XCircle
} from 'lucide-react';
import { ref, onValue, get, child } from 'firebase/database';
import { db } from '@/lib/firebase';

const ICONS_MAP: Record<string, any> = {
  Code,
  Cpu,
  Globe,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Search,
  ShieldCheck
};

const FALLBACK_SERVICES = [
  {
    id: "s1",
    title: "Web Development",
    desc: "Engineered platforms built with Next.js & React. Zero code debt, sub-second latency, and scalable API layers.",
    icon: "Code",
    points: ["Custom React/Next.js Platforms", "High-Performance APIs", "Search Engine Optimization"]
  },
  {
    id: "s2",
    title: "Mobile Applications",
    desc: "Cross-platform iOS and Android apps crafted using React Native or Flutter. Optimized for performance and design elegance.",
    icon: "Globe",
    points: ["iOS & Android App Engines", "Smooth Native UX/UI", "Offline Sync Capabilities"]
  },
  {
    id: "s3",
    title: "AI & ML Solutions",
    desc: "Custom LLM integrations, conversational agents, automated workflows, and intelligence engines built for high productivity.",
    icon: "Cpu",
    points: ["Conversational Chatbots", "Custom LLM Fine-Tuning", "Automated Database Insight Extraction"]
  },
  {
    id: "s4",
    title: "Business Automation",
    desc: "Scale your operations and strip out overhead. End-to-end CRM workflows, scheduled scripting, and database synchronization.",
    icon: "Zap",
    points: ["CRM & Lead Pipeline Automation", "Scheduled ETL Database Flows", "Webhook & Multi-API Integrations"]
  },
  {
    id: "s5",
    title: "UI/UX Strategy",
    desc: "Luxury product design focusing on user psychology. Interactive wireframes, style systems, and conversion-optimized checkout layouts.",
    icon: "Sparkles",
    points: ["Interactive Product Wireframing", "Luxury Branding Systems", "Conversion Rate Optimized Checkout"]
  },
  {
    id: "s6",
    title: "Digital Growth & SEO",
    desc: "Strategic search engine campaigns, metadata auditing, conversion rate marketing, and analytics mapping to maximize client reach.",
    icon: "TrendingUp",
    points: ["In-Depth Competitor Analytics", "Metadata & Schema Structure Audit", "High-ROI Copywriting Strategy"]
  },
  {
    id: "s7",
    title: "Branding & Identity",
    desc: "Creating timeless and luxurious brand aesthetics. Includes visual standard guides, professional color systems, and corporate typefaces.",
    icon: "Award",
    points: ["Luxury Corporate Styling", "Modern Typography Standards", "Digital Design Asset Suites"]
  },
  {
    id: "s8",
    title: "Business Analytics",
    desc: "Complete operational tracking. Build customized dashboards, warehousing systems, and predictive models.",
    icon: "Search",
    points: ["Custom KPI Dashboards", "Data Infrastructure Setup", "Predictive Trend Analysis"]
  },
  {
    id: "s9",
    title: "Enterprise IT Consulting",
    desc: "Architecture design, security enforcement, cloud deployment strategy, and database scaling plans.",
    icon: "ShieldCheck",
    points: ["AWS & Google Cloud Setup", "Robust Multi-Region Clusters", "System Audit & Security Guardrails"]
  }
];

const FALLBACK_PROJECTS = [
  {
    id: "p1",
    title: "Apex Ledger",
    desc: "A luxury fintech ledger application designed for multi-region currency tracking and secure audit mapping.",
    category: "web",
    image: "/web-dev.jpeg",
    stats: "+340% Performance",
    link: "#"
  },
  {
    id: "p2",
    title: "Veloce Delivery",
    desc: "High-throughput logistics and live tracking mobile platform, supporting millions of delivery routes.",
    category: "mobile",
    image: "/mobile-app.jpeg",
    stats: "50k+ Active Users",
    link: "#"
  },
  {
    id: "p3",
    title: "Nova AI Auditor",
    desc: "Enterprise compliance scanner utilizing customized language models to audit internal reports in real time.",
    category: "AI",
    image: "/ai-solutions.jpeg",
    stats: "99.2% Accuracy",
    link: "#"
  },
  {
    id: "p4",
    title: "Kalvix Brand Suite",
    desc: "Redesigning the digital visual identity and assets for a prominent capital management firm.",
    category: "branding",
    image: "/Social Media Marketing.jpeg",
    stats: "+180% Engagement",
    link: "#"
  }
];

const FALLBACK_REVIEWS = [
  {
    id: "r1",
    name: "Aarav Mehta",
    role: "Founder",
    company: "Apex Ventures",
    text: "Kalvix Nexus completely turned our legacy platforms around. The performance boost directly correlated with a 45% increase in online conversions. Highly professional group.",
    rating: "5"
  },
  {
    id: "r2",
    name: "Sophia Patel",
    role: "Director of Product",
    company: "Veloce Systems",
    text: "Their software engineering standard is impeccable. They delivered our cross-platform mobile application two weeks ahead of schedule and with zero major bugs.",
    rating: "5"
  },
  {
    id: "r3",
    name: "Marcus Vance",
    role: "Chief Technology Officer",
    company: "Nova Corp",
    text: "The AI automation scripts they developed saved our operations team over 25 hours per week. They operate with direct engineer-led communication which is highly efficient.",
    rating: "5"
  }
];

const PARTNER_BRANDS = [
  "Stripe", "Vercel", "Apple", "Rolex", "Google", "Meta", "AWS", "Supabase", "Next.js"
];

// Pure React Counter for performance and robustness
function AnimatedCounter({ value, duration = 1500, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function Home() {
  // DB States
  const [heroData, setHeroData] = useState<any>({ heroTitle: '', heroSubtitle: '' });
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Portfolio category filter state
  const [portfolioFilter, setPortfolioFilter] = useState('all');

  // Testimonials Carousel state
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);

  // Certificate Verification states
  const [certId, setCertId] = useState('');
  const [certSearching, setCertSearching] = useState(false);
  const [certResult, setCertResult] = useState<any>(null);
  const [certError, setCertError] = useState<string | null>(null);

  // Load database content on mount
  useEffect(() => {
    onValue(ref(db, '/'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        if (data.home) {
          setHeroData({
            heroTitle: data.home.heroTitle || '',
            heroSubtitle: data.home.heroSubtitle || ''
          });
        }
        
        if (data.services) {
          const loadedServices = Object.keys(data.services).map((k) => ({
            id: k,
            ...data.services[k]
          }));
          setServices(loadedServices.length > 0 ? loadedServices : FALLBACK_SERVICES);
        } else {
          setServices(FALLBACK_SERVICES);
        }

        if (data.projects) {
          const loadedProjects = Object.keys(data.projects).map((k) => ({
            id: k,
            ...data.projects[k]
          }));
          setProjects(loadedProjects.length > 0 ? loadedProjects : FALLBACK_PROJECTS);
        } else {
          setProjects(FALLBACK_PROJECTS);
        }

        if (data.reviews) {
          const loadedReviews = Object.keys(data.reviews).map((k) => ({
            id: k,
            ...data.reviews[k]
          }));
          setReviews(loadedReviews.length > 0 ? loadedReviews : FALLBACK_REVIEWS);
        } else {
          setReviews(FALLBACK_REVIEWS);
        }
      } else {
        setServices(FALLBACK_SERVICES);
        setProjects(FALLBACK_PROJECTS);
        setReviews(FALLBACK_REVIEWS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Realtime DB read error: ", error);
      setServices(FALLBACK_SERVICES);
      setProjects(FALLBACK_PROJECTS);
      setReviews(FALLBACK_REVIEWS);
      setLoading(false);
    });
  }, []);

  // Testimonial auto scroll
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewIdx((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews]);

  // Certificate Verification query
  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    setCertSearching(true);
    setCertError(null);
    setCertResult(null);

    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, `certificates/${certId.trim()}`));
      if (snapshot.exists()) {
        setCertResult({ id: certId.trim(), ...snapshot.val() });
      } else {
        setCertError('No credential found with this ID. Please double-check the characters or contact support.');
      }
    } catch (err) {
      console.error(err);
      setCertError('An error occurred during verification. Please try again.');
    } finally {
      setCertSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-primary min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-gold-primary animate-spin" />
      </div>
    );
  }

  // Filter projects by category
  const filteredProjects = portfolioFilter === 'all'
    ? projects
    : projects.filter(p => p.category?.toLowerCase() === portfolioFilter.toLowerCase());

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen overflow-hidden">
      
      {/* SECTION 1: HERO */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32 overflow-hidden px-6">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="heroGridPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D4AF37" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#heroGridPattern)" />
          </svg>
        </div>
        
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-[-15%] w-[450px] h-[450px] bg-gold-glow rounded-full blur-[140px] pointer-events-none opacity-25" />
        <div className="absolute bottom-1/4 right-[-15%] w-[450px] h-[450px] bg-gold-glow rounded-full blur-[140px] pointer-events-none opacity-20 animate-pulse" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="section-label"
            >
              <Sparkles size={12} className="text-gold-primary animate-pulse" />
              Digital Innovation Agency
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[54px] text-text-primary uppercase tracking-normal leading-[1.1]"
            >
              {heroData.heroTitle ? (
                <span className="whitespace-pre-line">{heroData.heroTitle}</span>
              ) : (
                <>
                  Where Vision <br className="hidden sm:inline" />
                  <span className="text-gold-gradient text-gold-primary">Meets</span> Technology
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-muted text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-inter"
            >
              {heroData.heroSubtitle || "We craft high-performance digital infrastructure, scalable web application architectures, and conversion-optimized growth ecosystems. Designed for enterprises that demand distinction."}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
            >
              <Link
                href="/contact"
                className="shimmer-btn bg-gold-primary text-black font-rajdhani font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-xl hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-gold flex items-center justify-center gap-2"
              >
                Start Your Project
                <ArrowRight size={14} />
              </Link>
              <a
                href="#services"
                className="bg-transparent border border-gold-primary/30 text-text-primary hover:border-gold-primary/80 font-rajdhani font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Explore Services
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center gap-3 pt-4 sm:pt-6"
            >
              <div className="inline-flex items-center gap-1.5 border border-gold-primary/10 bg-gold-primary/5 text-text-primary px-3 py-1.5 rounded-full text-[10px] font-rajdhani font-semibold tracking-wider uppercase">
                <CheckCircle size={10} className="text-gold-primary" />
                Google Partner
              </div>
              <div className="inline-flex items-center gap-1.5 border border-gold-primary/10 bg-gold-primary/5 text-text-primary px-3 py-1.5 rounded-full text-[10px] font-rajdhani font-semibold tracking-wider uppercase">
                <Star size={10} className="text-gold-primary fill-gold-primary" />
                Clutch 4.9★ Rated
              </div>
              <div className="inline-flex items-center gap-1.5 border border-gold-primary/10 bg-gold-primary/5 text-text-primary px-3 py-1.5 rounded-full text-[10px] font-rajdhani font-semibold tracking-wider uppercase">
                <Award size={10} className="text-gold-primary" />
                Meta Certified
              </div>
              <div className="inline-flex items-center gap-1.5 border border-gold-primary/10 bg-gold-primary/5 text-text-primary px-3 py-1.5 rounded-full text-[10px] font-rajdhani font-semibold tracking-wider uppercase">
                <ShieldCheck size={10} className="text-gold-primary" />
                ISO 9001:2015
              </div>
            </motion.div>
          </div>

          {/* Hero Right Visual: 3D Mockup + Orbiting Badges */}
          <div className="lg:col-span-5 flex items-center justify-center relative pt-10 lg:pt-0">
            <div className="relative w-full h-[320px] sm:h-[400px] xl:h-[420px] perspective-card flex items-center justify-center" style={{ isolation: 'isolate' }}>
              
              {/* Radial gold background glow */}
              <div className="absolute w-[260px] h-[260px] bg-gold-glow rounded-full blur-[100px] pointer-events-none opacity-20 animate-pulse" />

              {/* The main dashboard mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: -15, rotateX: 10 }}
                animate={{ opacity: 1, scale: 1, rotateY: -12, rotateX: 8 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ rotateY: -4, rotateX: 4, scale: 1.02 }}
                className="w-[95%] sm:w-[420px] h-[280px] bg-[#0A0A0A] rounded-[24px] border border-gold-primary/30 shadow-[0_20px_50px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col p-4 z-10 glass-dark text-white"
              >
                {/* Mockup Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                    <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="text-[8px] text-text-muted font-mono tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full uppercase">
                    NEXUS_SYSTEMS_v2
                  </div>
                </div>

                {/* Mockup Body Content */}
                <div className="flex-1 grid grid-cols-3 gap-3">
                  {/* Left Column Widgets */}
                  <div className="col-span-2 flex flex-col gap-2.5">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-2.5 flex flex-col justify-between">
                      <div className="text-[7.5px] font-rajdhani font-bold text-text-muted uppercase tracking-wider">Revenue Growth</div>
                      <div className="text-base font-mono font-bold text-white mt-0.5">+350.48%</div>
                      
                      {/* Chart line */}
                      <div className="h-8 w-full mt-1.5 relative">
                        <svg viewBox="0 0 100 40" className="w-full h-full text-gold-primary">
                          <path d="M0 38 Q 20 18, 40 28 T 80 8 T 100 2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M0 38 Q 20 18, 40 28 T 80 8 T 100 2 L 100 40 L 0 40 Z" fill="url(#heroChartGlow)" opacity="0.12" />
                          <defs>
                            <linearGradient id="heroChartGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--gold-primary)" />
                              <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 flex-1">
                      <div className="bg-white/5 rounded-xl border border-white/10 p-2 flex flex-col justify-center">
                        <div className="text-[7px] font-rajdhani font-bold text-text-muted uppercase tracking-wider">Uptime</div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">99.998%</div>
                      </div>
                      <div className="bg-white/5 rounded-xl border border-white/10 p-2 flex flex-col justify-center">
                        <div className="text-[7px] font-rajdhani font-bold text-text-muted uppercase tracking-wider">Engines</div>
                        <div className="text-xs font-mono font-bold text-gold-primary mt-0.5">14 active</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Widget */}
                  <div className="col-span-1 bg-white/5 rounded-xl border border-white/10 p-2.5 flex flex-col justify-between">
                    <div className="text-[7px] font-rajdhani font-bold text-text-muted uppercase tracking-wider text-center font-bold">Conversion</div>
                    <div className="relative w-12 h-12 mx-auto flex items-center justify-center my-1.5">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" fill="transparent" />
                        <circle cx="24" cy="24" r="20" stroke="var(--gold-primary)" strokeWidth="3.5" fill="transparent" strokeDasharray="125.6" strokeDashoffset="31.4" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-[8.5px] font-mono font-bold text-white">75%</span>
                    </div>
                    <div className="text-[7px] text-text-muted text-center leading-normal">Funnels optimized.</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badges — positioned OVER the dashboard image */}
              {/* Top-left badge: Web Dev */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{ transform: "translateZ(60px)" }}
                className="absolute top-4 left-[6%] bg-white/90 backdrop-blur-md border border-gold-primary/40 rounded-xl px-3 py-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center gap-2 animate-float z-30"
              >
                <div className="w-7 h-7 rounded-full bg-gold-primary/15 border border-gold-primary/30 flex items-center justify-center text-gold-primary flex-shrink-0">
                  <Code size={13} />
                </div>
                <div>
                  <div className="text-[9px] font-rajdhani font-bold uppercase tracking-wider text-[#0A0A0A] leading-none">Web Dev</div>
                  <div className="text-[7px] text-gray-500 font-mono mt-0.5">Next.js</div>
                </div>
              </motion.div>

              {/* Bottom-left badge: AI Systems */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75 }}
                style={{ transform: "translateZ(70px)" }}
                className="absolute bottom-10 left-[8%] bg-white/90 backdrop-blur-md border border-gold-primary/40 rounded-xl px-3 py-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center gap-2 [animation-delay:1.5s] animate-float z-30"
              >
                <div className="w-7 h-7 rounded-full bg-gold-primary/15 border border-gold-primary/30 flex items-center justify-center text-gold-primary flex-shrink-0">
                  <Cpu size={13} />
                </div>
                <div>
                  <div className="text-[9px] font-rajdhani font-bold uppercase tracking-wider text-[#0A0A0A] leading-none">AI Systems</div>
                  <div className="text-[7px] text-gray-500 font-mono mt-0.5">Custom LLM</div>
                </div>
              </motion.div>

              {/* Top-right badge: Mobile */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                style={{ transform: "translateZ(80px)" }}
                className="absolute top-4 right-[6%] bg-white/90 backdrop-blur-md border border-gold-primary/40 rounded-xl px-3 py-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center gap-2 [animation-delay:3s] animate-float z-30"
              >
                <div className="w-7 h-7 rounded-full bg-gold-primary/15 border border-gold-primary/30 flex items-center justify-center text-gold-primary flex-shrink-0">
                  <Globe size={13} />
                </div>
                <div>
                  <div className="text-[9px] font-rajdhani font-bold uppercase tracking-wider text-[#0A0A0A] leading-none">Mobile</div>
                  <div className="text-[7px] text-gray-500 font-mono mt-0.5">iOS & Android</div>
                </div>
              </motion.div>

              {/* Bottom-right badge: UI/UX */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 1.25 }}
                style={{ transform: "translateZ(60px)" }}
                className="absolute bottom-10 right-[8%] bg-white/90 backdrop-blur-md border border-gold-primary/40 rounded-xl px-3 py-2 shadow-[0_4px_20px_rgba(212,175,55,0.25)] flex items-center gap-2 [animation-delay:4.5s] animate-float z-30"
              >
                <div className="w-7 h-7 rounded-full bg-gold-primary/15 border border-gold-primary/30 flex items-center justify-center text-gold-primary flex-shrink-0">
                  <Sparkles size={13} />
                </div>
                <div>
                  <div className="text-[9px] font-rajdhani font-bold uppercase tracking-wider text-[#0A0A0A] leading-none">UI/UX</div>
                  <div className="text-[7px] text-gray-500 font-mono mt-0.5">High-Fidelity</div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>

        {/* Hero Bottom: 4 Stat Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 pt-16 md:pt-24 border-t border-gold-primary/10 mt-12 relative z-10">
          {[
            { value: 120, label: "Projects Completed", suffix: "+", icon: Briefcase },
            { value: 50, label: "Global Clients Served", suffix: "+", icon: Users },
            { value: 2, label: "Expert Founders Lead", suffix: "", icon: UserCheck },
            { value: 15, label: "Core Technologies Used", suffix: "+", icon: Layers }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card border border-gold-primary/10 rounded-2xl p-6 flex items-start gap-4 hover:border-gold-primary/30 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-xl bg-gold-primary/5 border border-gold-primary/15 flex items-center justify-center text-gold-primary flex-shrink-0">
                <stat.icon size={18} />
              </div>
              <div>
                <div className="font-orbitron font-black text-2xl md:text-3xl text-text-primary leading-none">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-text-muted text-[10px] md:text-xs font-rajdhani font-bold uppercase tracking-wider mt-1.5">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </section>

      {/* SECTION 2: ABOUT SECTION */}
      <section id="about" className="py-20 md:py-28 px-6 bg-bg-card/40 border-t border-gold-primary/10 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Side-by-Side Founders Layout */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-[420px] flex flex-col gap-3">

              {/* Leadership badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 mb-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-pulse" />
                <span className="text-[9px] font-rajdhani font-black text-gold-primary uppercase tracking-widest">Leadership Team</span>
              </motion.div>

              {/* Two cards side by side */}
              <div className="grid grid-cols-2 gap-3">

                {/* LEFT — Shourya Sharma */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative h-[280px] rounded-2xl overflow-hidden border border-gold-primary/25 bg-bg-surface shadow-lg group"
                >
                  <Image
                    src="/founder.jpg"
                    alt="Shourya Sharma"
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                    <h4 className="text-[10px] font-orbitron font-bold uppercase tracking-widest leading-tight">Shourya Sharma</h4>
                    <span className="text-[8px] font-rajdhani font-bold text-gold-primary uppercase tracking-wider mt-0.5">Founder & CEO</span>
                  </div>
                  {/* gold top accent */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-gold-primary/80 to-transparent" />
                </motion.div>

                {/* RIGHT — Vikram Singh Parmar */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="relative h-[280px] rounded-2xl overflow-hidden border border-gold-primary/25 bg-bg-surface shadow-lg group"
                >
                  <Image
                    src="/founder_vikram.jpg"
                    alt="Vikram Singh Parmar"
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                    <h4 className="text-[10px] font-orbitron font-bold uppercase tracking-widest leading-tight">Vikram Singh Parmar</h4>
                    <span className="text-[8px] font-rajdhani font-bold text-gold-primary uppercase tracking-wider mt-0.5">Co-Founder & CTO</span>
                  </div>
                  {/* gold top accent */}
                  <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-gold-primary/80 to-transparent" />
                </motion.div>

              </div>

              {/* Bottom floating chip */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="self-start bg-bg-primary border border-gold-primary/30 px-4 py-2 rounded-xl shadow-lg"
              >
                <div className="text-[8px] font-rajdhani font-black text-gold-primary uppercase tracking-widest">Visionaries</div>
                <div className="text-[10px] text-text-primary font-bold mt-0.5">Shourya Sharma & Vikram Singh</div>
              </motion.div>

            </div>
          </div>

          {/* Right Column: Narrative Story */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 flex flex-col items-start">
            <div className="section-label">Who We Are</div>
            
            <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-text-primary uppercase tracking-wide leading-tight">
              Architects of Scalable <br />
              <span className="text-gold-gradient text-gold-primary">Digital ecosystems</span>
            </h2>

            <div className="space-y-4 text-text-muted text-xs sm:text-sm leading-relaxed max-w-2xl font-inter">
              <p>
                We do not just construct interfaces; we engineer digital foundations. Kalvix Nexus is an integrated software studio and technical consulting agency founded on the principle that digital assets should actively drive business compounding.
              </p>
              <p>
                By bridging high-fidelity engineering standards with conversions-first digital marketing psychology, we build platforms that are fast, robust, and designed to scale from day one.
              </p>
            </div>

            {/* Core Values grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full pt-4">
              {[
                { title: "Direct Engineer Link", desc: "No middle managers. You speak directly with the architects writing your project's codebase." },
                { title: "Clean Architecture", desc: "Modular, fully documented setups that are built to scale and run without legacy code bloat." },
                { title: "Psychology-First UI", desc: "We map layout structures to conversion patterns to guarantee design isn't just pretty, but profitable." },
                { title: "Uptime Hardening", desc: "All server setups deploy with multi-region routing and redundant failover protocols." }
              ].map((val, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center text-gold-primary flex-shrink-0 mt-0.5">
                    <Check size={10} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-orbitron font-bold text-text-primary uppercase tracking-wide">{val.title}</h4>
                    <p className="text-[10px] text-text-muted leading-relaxed mt-1">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: SERVICES SECTION (Black/Dark Contrast Section) */}
      <section id="services" className="bg-[#0A0A0A] text-white py-20 md:py-28 px-6 border-y border-gold-primary/10 relative">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold-glow rounded-full blur-[160px] pointer-events-none opacity-10" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center mb-16 md:mb-20 flex flex-col items-center">
            <span className="section-label bg-gold-primary/5 border-gold-primary/20 text-gold-primary">What We Architect</span>
            <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-white uppercase tracking-wider mt-4">
              Premium Solutions <br />
              <span className="text-gold-gradient text-gold-primary">For Business Scale</span>
            </h2>
            <p className="text-text-muted mt-4 max-w-2xl text-xs sm:text-sm font-inter">
              We leverage modern frameworks, cloud systems, and data-driven marketing assets to construct optimized workflows for visionary firms.
            </p>
          </div>

          {/* 9-Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((svc, idx) => {
              const IconComponent = ICONS_MAP[svc.icon] || Code;
              const points = svc.points || FALLBACK_SERVICES[idx]?.points || ["Engineered Frameworks", "Production Standards"];
              
              return (
                <motion.div
                  key={svc.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: Math.min(idx * 0.08, 0.4) }}
                  whileHover={{ y: -8, borderColor: "rgba(212, 175, 55, 0.45)" }}
                  className="bg-[#111] border border-gold-primary/10 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 group hover:shadow-[0_15px_40px_rgba(212,175,55,0.08)]"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center text-gold-primary group-hover:bg-gold-primary group-hover:text-black transition-all duration-300">
                        <IconComponent size={20} />
                      </div>
                      <span className="text-[10px] font-mono text-gold-primary/40 uppercase tracking-widest font-semibold">0{idx + 1}</span>
                    </div>

                    <h3 className="font-orbitron font-bold text-lg text-white tracking-wide uppercase mb-3">
                      {svc.title}
                    </h3>
                    
                    <p className="text-text-muted text-xs leading-relaxed font-inter mb-6 min-h-[48px]">
                      {svc.desc}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-2 border-t border-white/5 pt-4">
                      {points.map((pt: string, pIdx: number) => (
                        <div key={pIdx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold-primary/60 flex-shrink-0" />
                          <span className="text-[10.5px] text-gray-300 font-inter">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 text-[10px] font-rajdhani font-black text-gold-primary uppercase tracking-widest mt-8 border-b border-gold-primary/0 hover:border-gold-primary/80 pb-0.5 transition-all duration-200"
                  >
                    Learn More <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12 md:mt-16">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 font-rajdhani font-black text-xs text-gold-primary tracking-widest uppercase border border-gold-primary/20 px-8 py-3.5 rounded-full bg-gold-primary/5 hover:bg-gold-primary/10 hover:border-gold-primary/60 transition-all duration-300"
            >
              Explore Services Framework
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 4: PORTFOLIO SECTION */}
      <section id="portfolio" className="py-20 md:py-28 px-6 bg-bg-primary relative border-b border-gold-primary/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="section-label">Case Studies</span>
              <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-text-primary uppercase tracking-wide mt-4">
                Engineered Works
              </h2>
            </div>
            
            {/* Filter tags */}
            <div className="flex flex-wrap gap-2.5 items-center">
              {[
                { id: 'all', label: 'All Projects' },
                { id: 'web', label: 'Web Assets' },
                { id: 'mobile', label: 'Mobile Apps' },
                { id: 'branding', label: 'Creative Branding' },
                { id: 'AI', label: 'AI Solutions' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setPortfolioFilter(cat.id)}
                  className={`px-4 py-1.5 font-rajdhani font-bold text-[10.5px] uppercase tracking-widest border rounded-full transition-all duration-300 ${
                    portfolioFilter === cat.id
                      ? 'bg-gold-primary text-black border-gold-primary shadow-gold-glow scale-105'
                      : 'bg-bg-card text-text-muted border-gold-primary/10 hover:border-gold-primary/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Projects */}
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((proj, idx) => (
                <motion.div
                  layout
                  key={proj.id || idx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4 }}
                  className="bg-bg-card border border-gold-primary/10 rounded-2xl overflow-hidden hover:border-gold-primary/30 transition-all duration-500 group flex flex-col justify-between"
                >
                  <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-black/40">
                    <Image
                      src={proj.image || "/logo.png"}
                      alt={proj.title || "Project Image"}
                      fill
                      sizes="(max-w-768px) 100vw, 50vw"
                      className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-90" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-gold-primary/20 text-gold-primary px-3 py-1 rounded-full text-[9px] font-rajdhani font-black tracking-widest uppercase">
                      {proj.category || "General"}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-orbitron font-bold text-lg md:text-xl text-text-primary group-hover:text-gold-primary transition-colors mb-2 uppercase">
                        {proj.title}
                      </h3>
                      <p className="text-text-muted text-xs leading-relaxed font-inter mb-6 max-w-lg">
                        {proj.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-gold-primary/10 pt-4 mt-auto">
                      <div>
                        <span className="block text-[8px] font-rajdhani font-black text-text-muted uppercase tracking-widest">Proven Impact</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-emerald-500">{proj.stats || "Completed"}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {proj.link && proj.link !== '#' && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-rajdhani font-bold uppercase tracking-widest text-text-muted hover:text-gold-primary transition-colors"
                          >
                            Live Link <ExternalLink size={10} />
                          </a>
                        )}
                        <Link
                          href={`/portfolio/${proj.id || 'apex-ledger'}`}
                          className="w-8 h-8 rounded-full bg-gold-primary/5 border border-gold-primary/15 flex items-center justify-center text-gold-primary group-hover:bg-gold-primary group-hover:text-black transition-all duration-300"
                        >
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

        </div>
      </section>

      {/* SECTION 5: WHY CHOOSE US */}
      <section className="py-20 md:py-28 px-6 bg-bg-card/20 relative border-b border-gold-primary/10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-16 flex flex-col items-center">
            <span className="section-label">Nexus Standards</span>
            <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-text-primary uppercase tracking-wide mt-4">
              Engineered for Enterprise Trust
            </h2>
            <p className="text-text-muted mt-4 max-w-2xl text-xs sm:text-sm font-inter">
              We operate under strict engineering guardrails to build software assets that act as profit engines rather than technical liabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: "Direct Architect Comms", desc: "You interface directly with senior software architects and campaigns lead developers. No communications lag.", icon: UserCheck },
              { title: "Zero Technical Debt", desc: "Our codebase deploys with strict TypeScript typing, robust unit tests, and fully structured modular configurations.", icon: Code },
              { title: "Absolute Data Security", desc: "We implement advanced encryption guidelines, robust OAuth protocols, and multi-layered database security patterns.", icon: ShieldCheck },
              { title: "Agile Demo Cadence", desc: "Review working sprints weekly in sandboxed staging environments. Total tracking visibility over all progress.", icon: Layers },
              { title: "Clean Predictable Budgets", desc: "No scope creep. We provide milestone maps, structured hourly tracking, or flat rates, strictly aligned with milestones.", icon: Briefcase },
              { title: "Ongoing Life cycle Support", desc: "Dedicated maintenance packages, real-time logging alerts, server scaling, and continuous security audits.", icon: Cpu }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="glass-card border border-gold-primary/10 rounded-2xl p-6 hover:border-gold-primary/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-primary/5 border border-gold-primary/15 flex items-center justify-center text-gold-primary mb-5">
                  <card.icon size={18} />
                </div>
                <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-text-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-text-muted text-[11px] leading-relaxed font-inter">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS SECTION */}
      <section className="py-20 md:py-28 px-6 bg-bg-primary relative border-b border-gold-primary/10">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <span className="section-label mx-auto">Client Success Stories</span>
          <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-text-primary uppercase tracking-wide mt-4 mb-12">
            Trusted by Global Innovators
          </h2>

          <div className="relative min-h-[220px] md:min-h-[250px] flex items-center justify-center">
            
            {/* Background gold pulse */}
            <div className="absolute w-[200px] h-[200px] bg-gold-glow rounded-full blur-[90px] pointer-events-none opacity-10" />

            <AnimatePresence mode="wait">
              {reviews.length > 0 && (
                <motion.div
                  key={currentReviewIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-card border border-gold-primary/15 rounded-3xl p-8 md:p-10 text-center relative z-10 w-full"
                >
                  {/* Stars */}
                  <div className="flex justify-center gap-1 text-gold-primary mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-gold-primary" />
                    ))}
                  </div>

                  {/* Feedback quote */}
                  <p className="text-text-primary text-xs sm:text-sm md:text-base italic leading-relaxed font-inter mb-6 max-w-2xl mx-auto">
                    "{reviews[currentReviewIdx].text || reviews[currentReviewIdx].desc}"
                  </p>

                  {/* Client Info */}
                  <div>
                    <h4 className="font-orbitron font-bold text-xs uppercase tracking-widest text-text-primary">
                      {reviews[currentReviewIdx].name}
                    </h4>
                    <span className="text-[10px] font-rajdhani font-semibold text-gold-primary uppercase tracking-wider block mt-1">
                      {reviews[currentReviewIdx].role} · {reviews[currentReviewIdx].company}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slider navigation buttons */}
            <div className="absolute top-1/2 left-[-15px] sm:left-[-35px] -translate-y-1/2 z-20">
              <button
                onClick={() => setCurrentReviewIdx((prev) => (prev - 1 + reviews.length) % reviews.length)}
                className="w-9 h-9 rounded-full border border-gold-primary/20 bg-bg-card hover:bg-gold-primary/10 flex items-center justify-center text-gold-primary transition-all active:scale-95"
                aria-label="Previous review"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
            <div className="absolute top-1/2 right-[-15px] sm:right-[-35px] -translate-y-1/2 z-20">
              <button
                onClick={() => setCurrentReviewIdx((prev) => (prev + 1) % reviews.length)}
                className="w-9 h-9 rounded-full border border-gold-primary/20 bg-bg-card hover:bg-gold-primary/10 flex items-center justify-center text-gold-primary transition-all active:scale-95"
                aria-label="Next review"
              >
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentReviewIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentReviewIdx === idx ? 'w-5 bg-gold-primary' : 'w-1.5 bg-gold-primary/20'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 7: PERFORMANCE STATS SECTION */}
      <section className="py-16 bg-bg-card/40 border-b border-gold-primary/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center relative z-10">
          {[
            { value: 98, label: "Satisfaction Rate", suffix: "%" },
            { value: 100, label: "Delivery Integrity", suffix: "%" },
            { value: 85, label: "Repeat Client Rate", suffix: "%" },
            { value: 2, label: "Response Window", suffix: "hr" }
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="font-orbitron font-black text-3xl sm:text-4xl lg:text-5xl text-gold-primary leading-none">
                {stat.suffix === "hr" ? <span className="mr-0.5">&lt;</span> : null}
                <AnimatedCounter value={stat.value} />
                {stat.suffix !== "hr" ? stat.suffix : " " + stat.suffix}
              </div>
              <div className="text-text-muted text-[10px] font-rajdhani font-bold uppercase tracking-widest mt-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: CERTIFICATE VERIFICATION */}
      <section id="verify" className="py-20 md:py-28 px-6 bg-bg-primary relative border-b border-gold-primary/10">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <span className="section-label mx-auto">Security &amp; Trust</span>
          <h2 className="font-orbitron font-black text-2xl sm:text-4xl text-text-primary uppercase tracking-wide mt-4 mb-4">
            Verify Certificate
          </h2>
          <p className="text-text-muted text-xs sm:text-sm font-inter mb-8">
            Enter a Certificate ID to instantly verify the authenticity of any Kalvix Nexus issued certificate from our secure real-time database registry.
          </p>

          <form onSubmit={handleVerifyCertificate} className="flex gap-2 p-1.5 border border-gold-primary/20 bg-bg-card rounded-2xl max-w-lg mx-auto focus-within:border-gold-primary/60 transition-all duration-300">
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. KNX-2026-000001)"
              value={certId}
              onChange={(e) => setCertId(e.target.value.toUpperCase())}
              className="bg-transparent border-0 outline-none text-text-primary placeholder-text-muted text-xs px-3 py-2.5 flex-1 font-mono uppercase focus:ring-0"
              required
            />
            <button
              type="submit"
              disabled={certSearching}
              className="bg-gold-primary text-black font-rajdhani font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xl hover:bg-gold-light active:scale-95 transition-all duration-200 flex items-center justify-center min-w-[90px] disabled:opacity-50"
            >
              {certSearching ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
            </button>
          </form>

          {/* Results */}
          <div className="mt-8">
            {certError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 border border-rose-500/20 bg-rose-500/5 rounded-2xl max-w-lg mx-auto"
              >
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <XCircle size={20} className="text-rose-400" />
                  </div>
                  <span className="font-orbitron font-bold text-rose-400 text-sm uppercase tracking-wider">Invalid Certificate</span>
                </div>
                <p className="text-rose-400/70 text-xs font-inter">{certError}</p>
              </motion.div>
            )}

            {certResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="border border-gold-primary/30 rounded-3xl bg-[#0A0A0A] overflow-hidden shadow-[0_20px_60px_rgba(212,175,55,0.15)] max-w-lg mx-auto text-left"
              >
                {/* Top bar */}
                <div className="bg-gradient-to-r from-[#0A0A0A] via-[#1a1505] to-[#0A0A0A] px-6 py-4 border-b border-gold-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="text-gold-primary" size={16} />
                    <span className="font-orbitron font-bold text-[10px] tracking-widest text-gold-primary uppercase">Official Kalvix Nexus Certificate</span>
                  </div>
                  <span className="text-[9px] font-rajdhani font-black tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    VALID
                  </span>
                </div>

                <div className="p-6 space-y-5 text-white">
                  {/* Certificate Title */}
                  <div className="text-center pb-4 border-b border-white/10">
                    <p className="text-[10px] font-rajdhani font-bold text-gold-primary uppercase tracking-widest mb-1">
                      Certificate of {certResult.certificate_type || 'Achievement'}
                    </p>
                    <p className="font-orbitron font-bold text-lg">{certResult.certificate_title || '—'}</p>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                    {[
                      { label: 'Employee Name', value: certResult.employee_name || certResult.name || '—' },
                      { label: 'Certificate ID',  value: certResult.certificate_id || certResult.id, mono: true },
                      { label: 'Designation',     value: certResult.designation || '—' },
                      { label: 'Issue Date',       value: certResult.issue_date
                          ? new Date(certResult.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                          : (certResult.date || '—') },
                      { label: 'Project',          value: certResult.project || '—' },
                      { label: 'Issued By',        value: certResult.issued_by || '—' },
                    ].map(({ label, value, mono }) => (
                      <div key={label}>
                        <span className="block text-[8px] font-rajdhani font-black text-gray-500 uppercase tracking-widest mb-0.5">{label}</span>
                        <span className={`text-[11px] font-semibold text-white leading-tight ${mono ? 'font-mono' : ''}`}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* QR Code */}
                  {certResult.qr_code && (
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-[8px] font-rajdhani font-black text-gray-500 uppercase tracking-widest mb-1">Verification QR</p>
                        <p className="text-[10px] text-gray-400">Scan to re-verify</p>
                      </div>
                      <img src={certResult.qr_code} alt="Certificate QR" className="w-16 h-16 rounded-lg border border-gold-primary/20 bg-white p-0.5" />
                    </div>
                  )}

                  {/* PDF Download */}
                  {certResult.pdf_file && (
                    <a
                      href={certResult.pdf_file}
                      download={`${certResult.certificate_id || certResult.id}.pdf`}
                      className="flex items-center justify-center gap-2 w-full border border-gold-primary/30 text-gold-primary hover:bg-gold-primary/10 py-2.5 rounded-xl text-xs font-rajdhani font-bold uppercase tracking-wider transition-colors"
                    >
                      <Download size={14} /> Download Certificate PDF
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 9: CLIENTS / PARTNERS */}
      <section className="py-12 bg-bg-card/25 border-b border-gold-primary/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div className="flex-shrink-0 text-left">
            <span className="block text-[8px] font-rajdhani font-black text-gold-primary uppercase tracking-widest">Collaborative Ecosystem</span>
            <span className="text-xs font-orbitron font-bold uppercase tracking-wider text-text-primary">Trusted Ecosystem Partners</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative w-full select-none">
            {/* Left and Right fades */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg-primary to-transparent z-10 pointer-events-none" />
            
            <div className="marquee-wrapper">
              <div className="marquee-track flex items-center gap-12 py-2">
                {[...PARTNER_BRANDS, ...PARTNER_BRANDS].map((brand, i) => (
                  <span
                    key={i}
                    className="font-orbitron font-black text-xs sm:text-sm tracking-[0.25em] text-text-muted hover:text-gold-primary transition-all duration-300 uppercase cursor-default"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: CALL TO ACTION (CTA) */}
      <section className="bg-[#0A0A0A] text-white py-20 md:py-28 px-6 relative overflow-hidden border-b border-gold-primary/10">
        
        {/* Radial Gold Lighting Effect */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-t from-gold-primary/20 to-transparent rounded-full blur-[100px] pointer-events-none opacity-45" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6 md:space-y-8">
          <span className="section-label bg-gold-primary/5 border-gold-primary/20 text-gold-primary">Forge Your Venture</span>
          
          <h2 className="font-orbitron font-black text-2xl sm:text-4xl lg:text-[46px] uppercase tracking-wide leading-tight text-white">
            Ready to Build the Future <br />
            <span className="text-gold-gradient text-gold-primary">Of Your Enterprise?</span>
          </h2>
          
          <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto font-inter leading-relaxed">
            Let us design a high-end digital ecosystem, custom AI automation engine, or conversions-first marketing blueprint tailored for your target audience.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/contact"
              className="shimmer-btn w-full sm:w-auto bg-gold-primary text-black font-rajdhani font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-xl hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-gold flex items-center justify-center gap-2"
            >
              <Calendar size={14} />
              Book Consult Call
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto bg-transparent border border-white/20 hover:border-gold-primary/60 text-white font-rajdhani font-bold text-xs tracking-widest uppercase px-8 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Mail size={14} className="text-gold-primary" />
              Inquire Online
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-8 text-[11px] text-text-muted font-rajdhani uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Phone size={12} className="text-gold-primary" />
              +91 79063 55122
            </span>
            <span className="hidden sm:inline text-gold-primary/20">|</span>
            <span className="flex items-center gap-1.5">
              <Mail size={12} className="text-gold-primary" />
              kalvixnexus@gmail.com
            </span>
          </div>

        </div>
      </section>

    </div>
  );
}
