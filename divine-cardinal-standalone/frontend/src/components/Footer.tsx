'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { db, ref, onValue } from '../lib/firebase';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const [footerConfig, setFooterConfig] = React.useState<any>(null);

  React.useEffect(() => {
    const unsub = onValue(ref(db, 'global_elements/footer'), (snap) => {
      if (snap.exists()) setFooterConfig(snap.val());
    });
    return () => unsub();
  }, []);

  const cols = footerConfig?.columns || [
    {
      id: 'story',
      title: 'DIVINE CARDINAL',
      text: 'A premium union of Vedic wisdom and modern luxury. We distill original botanical wellness remedies, crafted with purity, intention, and respect for nature.\\n\\nMade in Hathras, India.',
      links: []
    },
    {
      id: 'shop',
      title: 'Shop Categories',
      text: '',
      links: [
        { label: 'Face & Body Serums', url: '/shop?category=face-and-body' },
        { label: 'Therapeutic Massage Oils', url: '/shop?category=wellness' },
        { label: 'Baby & Mother Care', url: '/shop?category=baby-and-mother-care' },
        { label: 'Traditional Attars & Perfumes', url: '/shop?category=fragrance-attars' }
      ]
    },
    {
      id: 'support',
      title: 'Customer Support',
      text: '',
      links: [
        { label: 'Frequently Asked Questions', url: '/pages/faqs' },
        { label: 'Ingredients Glossary', url: '/ingredients' },
        { label: 'Shipping & Estimations', url: '/pages/shipping-policy' },
        { label: 'Returns & Refunds', url: '/pages/returns-refunds' },
        { label: 'Terms of Service', url: '/pages/terms-and-conditions' },
        { label: 'Admin Dashboard', url: '/admin/login' }
      ]
    },
    {
      id: 'newsletter',
      title: 'The Journal Newsletter',
      text: 'Subscribe to receive Ayurvedic wellness insights, early access to new distillations, and seasonal offers.',
      links: []
    }
  ];

  return (
    <footer className="bg-luxury-darkBg text-luxury-cream border-t border-luxury-gold/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {cols.map((col: any) => (
          <div key={col.id} className="space-y-4">
            <h4 className={`${col.id === 'story' ? 'text-lg tracking-wider' : 'text-sm tracking-widest uppercase'} font-serif text-luxury-gold`}>{col.title}</h4>
            {col.text && (
              <div className="text-sm text-luxury-cream/70 leading-relaxed font-sans font-light whitespace-pre-line">
                {col.text}
              </div>
            )}
            {col.links && col.links.length > 0 && (
              <ul className="space-y-2 text-sm text-luxury-cream/70 font-light font-sans">
                {col.links.map((link: any, idx: number) => (
                  <li key={idx}><Link href={link.url} className="hover:text-luxury-gold transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            )}
            {col.id === 'newsletter' && (
              subscribed ? (
                <p className="text-sm text-luxury-gold font-serif mt-4">Thank you for subscribing to our journal.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex border-b border-luxury-gold/50 py-1 mt-4">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-luxury-cream/40 w-full font-light"
                    required
                  />
                  <button type="submit" className="text-luxury-gold hover:text-white text-xs uppercase tracking-widest font-serif ml-2">
                    Subscribe
                  </button>
                </form>
              )
            )}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-luxury-gold/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-luxury-cream/55 space-y-4 sm:space-y-0">
        <p>&copy; {new Date().getFullYear()} Divine Cardinal International. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-luxury-gold transition-colors">Instagram</a>
          <a href="#" className="hover:text-luxury-gold transition-colors">Facebook</a>
          <a href="#" className="hover:text-luxury-gold transition-colors">YouTube</a>
        </div>
      </div>
    </footer>
  );
}
