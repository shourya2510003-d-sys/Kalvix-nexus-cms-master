'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Eye, ShieldCheck, Heart, Sparkles, TrendingUp, Cpu, Award, Rocket } from 'lucide-react';
import Loader from '@/components/Loader';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const VALUES = [
  { icon: TrendingUp, title: 'Results First', desc: 'We focus on metrics that matter. Whether it is code throughput or ad spend ROI, we deliver tangible business growth.' },
  { icon: Cpu, title: 'Integrated Innovation', desc: 'We combine robust software engineering with modern consumer psychology to build unique market advantages.' },
  { icon: ShieldCheck, title: 'Technical Integrity', desc: 'We write clean, secure, and production-grade code that scales infinitely and remains bulletproof under load.' },
  { icon: Heart, title: 'Deep Partnership', desc: 'We act as an extension of your team. Your business goals become our technical blueprints.' },
];

const TIMELINE = [
  { year: '14 May 2026', title: 'Agency Foundation', desc: 'Established in Hathras, UP as a high-end software development studio working with early-stage startups.' },
  { year: 'June 2026', title: 'The Nexus Era', desc: 'Consolidating AI automation assets with high-end digital marketing campaigns to build automated sales engines.' },
  { year: 'July 2026', title: 'Expanding Across India', desc: 'Achieved a major milestone by successfully delivering a diverse range of projects nationwide, mastering everything from complex E-commerce platforms to dynamic business websites.' },
];

export default function AboutPage() {
  // ==== Structured Data for Founders (JSON-LD) ====
  const founderSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kalvix Nexus",
    "url": "https://kalvixnexus.com",
    "logo": "https://kalvixnexus.com/logo.png",
    "founder": [
      {
        "@type": "Person",
        "name": "Shourya Sharma",
        "jobTitle": "Co-Founder & CEO",
        "description": "Shourya Sharma is the Co-Founder & CEO of Kalvix Nexus. He is a Full‑Stack Developer, Performance Marketer and Business Growth Architect currently pursuing B.Tech (CSE) at Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad.",
        "sameAs": [
          "https://linkedin.com/in/shourya-sharma",
          "https://github.com/shourya-sharma"
        ]
      },
      {
        "@type": "Person",
        "name": "Vikram Singh Parmar",
        "jobTitle": "Co‑Founder & CTO",
        "description": "Vikram Singh Parmar is the Co‑Founder & CTO of Kalvix Nexus. He is a Systems Architect, Front‑End & Back‑End Engineer and Cloud Solutions Expert currently pursuing B.Tech (CSE‑AI/ML) at Maya Institute of Technology Hathras (AKTU).",
        "sameAs": [
          "https://linkedin.com/in/vikram-parmar",
          "https://github.com/vikram-parmar"
        ]
      }
    ]
  };

  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const teamRef = ref(db, 'team');
    onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTeam = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        // Sort team: Shourya Sharma (Founder) on left, Vikram Singh Parmar (Co-Founder) on right
        loadedTeam.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          if (nameA.includes('shourya')) return -1;
          if (nameB.includes('shourya')) return 1;
          if (nameA.includes('vikram')) return 1;
          if (nameB.includes('vikram')) return -1;
          return 0;
        });

        // Inject explicit SEO bios for founders to guarantee Google indexing
        loadedTeam.forEach(member => {
          const lowerName = (member.name || '').toLowerCase();
          if (lowerName.includes('shourya')) {
            member.role = "Co-Founder & CEO";
            if (!member.desc?.includes('Ajay Kumar')) {
              member.desc = `Shourya Sharma is the Co-Founder & CEO of Kalvix Nexus. Currently pursuing his B.Tech in Computer Science & Engineering at Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad, he is a seasoned Full-Stack Developer, Performance Marketer, and Business Growth Architect.`;
            }
          } else if (lowerName.includes('vikram')) {
            member.role = "Co-Founder & CTO";
            if (!member.desc?.includes('Maya Institute')) {
              member.desc = `Vikram Singh Parmar is the Co-Founder & CTO of Kalvix Nexus. Pursuing his B.Tech in Computer Science & Engineering (AI & ML) at Maya Institute of Technology Hathras (AKTU), he specializes as a Systems Architect, Frontend & Backend Engineer, and Cloud Solutions Expert.`;
            }
          }
        });

        setTeam(loadedTeam);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-gold-glow rounded-full blur-[150px] pointer-events-none opacity-20" />
      <div className="absolute bottom-20 right-[-10%] w-[500px] h-[500px] bg-gold-glow rounded-full blur-[150px] pointer-events-none opacity-15" />

      <section className="relative py-20 px-6 max-w-5xl mx-auto text-center z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="font-rajdhani text-xs font-bold tracking-[0.4em] text-gold-primary uppercase">Our Story</span>
          <h1 className="font-orbitron font-black text-4xl sm:text-6xl text-text-primary uppercase tracking-wider mt-3 mb-6">
            The Nexus Core
          </h1>
          <p className="font-inter text-sm sm:text-base text-text-muted leading-relaxed max-w-2xl mx-auto">
            We are a dual-force digital agency combining high-end software engineering with performance marketing to scale companies from foundation to market leaders.
          </p>
        </motion.div>
      </section>

      <section className="py-12 px-6 max-w-5xl mx-auto z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-bg-card border border-gold-primary/10 p-8 rounded-lg relative">
            <div className="w-10 h-10 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center mb-6">
              <Target className="text-gold-primary" size={20} />
            </div>
            <h3 className="font-orbitron font-bold text-base text-text-primary mb-4 tracking-wide">Our Philosophy</h3>
            <p className="text-text-muted text-xs leading-relaxed font-inter">
              We believe that exceptional code is wasted without visibility, and aggressive marketing fails without a rock-solid conversion funnel. At Kalvix Nexus, we align product development with marketing engineering to ensure every line of code generates growth and every ad dollar spent returns value.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-bg-card border border-gold-primary/10 p-8 rounded-lg relative">
            <div className="w-10 h-10 rounded-full bg-gold-primary/5 border border-gold-primary/20 flex items-center justify-center mb-6">
              <Eye className="text-gold-primary" size={20} />
            </div>
            <h3 className="font-orbitron font-bold text-base text-text-primary mb-4 tracking-wide">Our Mission</h3>
            <p className="text-text-muted text-xs leading-relaxed font-inter">
              To equip modern brands with scalable technical infrastructure and highly optimized performance marketing funnels. We strive to strip out operational bottlenecks and create frictionless customer acquisition loops that allow founders to focus purely on product delivery.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-5xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-2xl sm:text-4xl uppercase tracking-wider text-text-primary">The Leadership</h2>
          <p className="font-rajdhani text-xs sm:text-sm text-gold-primary tracking-widest uppercase mt-2">Visionaries behind the agency</p>
          <div className="w-12 h-[2px] bg-gold-primary mx-auto mt-4" />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader text="Loading About Us..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="bg-bg-card border border-gold-primary/10 rounded-xl overflow-hidden hover:border-gold-primary/30 transition-all duration-300 shadow-lg hover:shadow-gold-glow group"
              >
                <div className="relative h-80 w-full overflow-hidden bg-bg-surface flex items-center justify-center">
                  <Image
                    src={member.image || '/logo.png'}
                    alt={member.name || 'Team Member'}
                    fill
                    sizes="(max-w-768px) 100vw, 50vw"
                    className="object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent" />
                </div>
                <div className="p-8 text-center relative z-10">
                  <h3 className="font-orbitron font-black text-xl text-text-primary tracking-wide uppercase">{member.name}</h3>
                  <span className="font-rajdhani text-xs text-gold-primary font-bold uppercase block tracking-wider mt-1 mb-4">{member.role}</span>
                  <p className="text-text-muted text-xs leading-relaxed mb-6 px-2">
                    {member.desc}
                  </p>
                  <div className="flex justify-center gap-6 text-xs font-mono text-gold-light border-t border-gold-primary/10 pt-4">
                    {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white transition-colors">LinkedIn</a>}
                    {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-white transition-colors">GitHub</a>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <section className="py-20 bg-bg-card/50 border-y border-gold-primary/10 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-orbitron font-bold text-2xl sm:text-4xl uppercase tracking-wider text-text-primary">Our Core Values</h2>
            <p className="font-rajdhani text-xs sm:text-sm text-gold-primary tracking-widest uppercase mt-2">Principles that drive our results</p>
            <div className="w-12 h-[2px] bg-gold-primary mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((val, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.1 }} className="bg-bg-primary border border-gold-primary/5 p-6 rounded-lg text-center hover:border-gold-primary/20 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-full bg-gold-primary/5 border border-gold-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-primary group-hover:text-black transition-all duration-300">
                  <val.icon className="text-gold-primary group-hover:text-black transition-colors" size={18} />
                </div>
                <h4 className="font-orbitron font-bold text-xs text-text-primary tracking-wider mb-2">{val.title}</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-2xl sm:text-4xl uppercase tracking-wider text-text-primary">Our Timeline</h2>
          <p className="font-rajdhani text-xs sm:text-sm text-gold-primary tracking-widest uppercase mt-2">The milestones of our growth</p>
          <div className="w-12 h-[2px] bg-gold-primary mx-auto mt-4" />
        </div>

        <motion.div 
          className="relative border-l border-gold-primary/10 pl-6 ml-4 space-y-12 pb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >


          {/* Animated Rocket */}
          <motion.div
            className="absolute -left-[21px] z-10 bg-bg-primary w-[42px] h-[42px] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)] flex items-center justify-center"
            variants={{
              hidden: { top: 0, opacity: 0 },
              visible: { top: 'calc(100% - 42px)', opacity: 1, transition: { duration: 8, ease: "linear" } }
            }}
          >
            <span className="inline-block text-[28px] transform rotate-[135deg] drop-shadow-[0_0_12px_rgba(255,165,0,0.8)] leading-none brightness-90 contrast-125 saturate-150">🚀</span>
          </motion.div>

          {TIMELINE.map((time, idx) => (
            <motion.div 
              key={idx} 
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: idx * 3.5 + 0.2 } }
              }}
              className="relative"
            >
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-bg-primary border-2 border-gold-primary shadow-gold-glow flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-ping" />
              </div>
              <span className="font-orbitron font-black text-lg text-gold-primary leading-none block">{time.year}</span>
              <h4 className="font-orbitron font-bold text-sm text-text-primary tracking-wide mt-1 mb-2">{time.title}</h4>
              <p className="text-text-muted text-xs leading-relaxed font-inter max-w-2xl">{time.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    {/* Structured Data Script */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(founderSchema) }}
    />
    </div>
  );
}