'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const FALLBACK_FOUNDERS = [
  {
    name: "Shourya Sharma",
    role: "Co-Founder & CEO",
    desc: "Leading innovation through technology, AI adoption, business strategy, and digital transformation initiatives.",
    image: "/founder.jpg",
    linkedin: "#"
  },
  {
    name: "Vikram Singh Parmar",
    role: "Co-Founder & CTO",
    desc: "Driving operations, partnerships, execution excellence, and organizational growth.",
    image: "/founder_vikram.jpg",
    linkedin: "#"
  }
];

export default function MeetFounders() {
  const [founders, setFounders] = useState<any[]>([]);

  useEffect(() => {
    const teamRef = ref(db, 'team');
    const unsubscribe = onValue(teamRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Filter out those who are explicitly marked as founders, or just show the top 2.
        // If there's no specific 'founder' flag, we can just show all team members, or limit to 2.
        const teamList = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        
        // Try to find the founders based on their names or roles, or just take the first two.
        // Assuming admin uploads the founders here.
        teamList.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          if (nameA.includes('shourya')) return -1;
          if (nameB.includes('shourya')) return 1;
          if (nameA.includes('vikram')) return 1;
          if (nameB.includes('vikram')) return -1;
          return 0;
        });

        // Inject explicit SEO bios for founders
        teamList.forEach(member => {
          const lowerName = (member.name || '').toLowerCase();
          if (lowerName.includes('shourya')) {
            member.role = "Co-Founder & CEO";
            member.desc = `Full-Stack Developer, Performance Marketer, and Business Growth Architect.`;
          } else if (lowerName.includes('vikram')) {
            member.role = "Co-Founder & CTO";
            member.desc = `Systems Architect, Frontend & Backend Engineer, and Cloud Solutions Expert.`;
          }
        });

        setFounders(teamList);
      } else {
        setFounders(FALLBACK_FOUNDERS);
      }
    });

    return () => unsubscribe();
  }, []);

  const displayList = founders.length > 0 ? founders : FALLBACK_FOUNDERS;

  return (
    <section className="py-24 bg-bg-card relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-lg md:text-xl font-bold text-gold-primary tracking-widest uppercase mb-4">Leadership</h2>
            <h3 className="text-3xl md:text-5xl font-outfit font-bold text-text-primary leading-tight">
              The Vision Behind Kalvix Nexus.
            </h3>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {displayList.map((founder, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-bg-primary border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group max-w-sm mx-auto w-full"
            >
              <div className="h-[350px] bg-bg-surface relative overflow-hidden p-4">
                <Image 
                  src={founder.image} 
                  alt={founder.name} 
                  fill 
                  className="object-contain transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-2xl font-outfit font-bold text-text-primary">{founder.name}</h4>
                    <p className="text-gold-primary font-medium text-sm uppercase tracking-wider mt-1">{founder.role}</p>
                  </div>
                  <Link href={founder.linkedin} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:bg-gold-primary hover:text-bg-primary hover:border-gold-primary transition-all duration-300">
                    <Linkedin size={18} />
                  </Link>
                </div>
                <p className="text-text-muted leading-relaxed">
                  {founder.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
