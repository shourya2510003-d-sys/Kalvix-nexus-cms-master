import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Frequently Asked Questions – Divine Cardinal Natural Wellness',
  description: 'Find answers about our chemical-free Ayurvedic products, traditional copper vessel steam distillation, and secure international shipping.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'Are all your products 100% natural?',
      answer: 'Yes! All Kalvix Nexus and Divine Cardinal formulations are 100% plant-based, cruelty-free, paraben-free, and crafted using pure Ayurvedic essential oils and ingredients. We never use mineral oils, synthetic colors, or artificial preservatives.',
    },
    {
      question: 'How do you ensure shipping safety?',
      answer: 'We package all our therapeutic oils in high-quality dark glass bottles to prevent UV damage, wrapped inside eco-friendly biodegradable cardboard tubes for shipping protection. Our boxes are reinforced to survive international transits.',
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes! We ship across India through Shiprocket and provide secure international shipping to selected destinations worldwide. Shipping rates and delivery timeframes are calculated during checkout based on delivery pincodes.',
    },
    {
      question: 'What is the traditional Deg-Bhapka distillation method?',
      answer: 'Deg-Bhapka is a centuries-old Indian steam distillation method using copper vessels. Flower blossoms and fresh herbs are placed in a copper Deg (pot), heated with steam, and the volatile vapors condense in a copper Bhapka (receiver). This slow, artisanal process preserves the natural potency and therapeutic properties of the oils.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-charcoal">Frequently Asked Questions</h1>
          <p className="text-xs text-luxury-gold uppercase tracking-widest font-serif">Customer Care & Botanical Science</p>
        </div>

        <div className="space-y-8 divide-y divide-luxury-gold/15">
          {faqs.map((faq, index) => (
            <div key={index} className={`pt-6 ${index === 0 ? 'pt-0' : ''} space-y-2`}>
              <h3 className="font-serif text-lg text-luxury-gold">{faq.question}</h3>
              <p className="text-sm font-sans font-light leading-relaxed text-luxury-charcoal/80">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-8 text-center border-t border-luxury-gold/10 text-xs">
          <p className="text-luxury-charcoal/60">Still have questions? We are here to help.</p>
          <a href="mailto:care@divinecardinal.com" className="text-luxury-gold hover:underline font-serif mt-2 block">
            Email us: care@divinecardinal.com
          </a>
        </div>
      </div>
    </>
  );
}
