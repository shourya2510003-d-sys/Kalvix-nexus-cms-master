import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-luxury-charcoal">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <div className="relative h-[60vh] w-full mb-16 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1920" 
            alt="About Divine Cardinal" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-4 tracking-wide">Our Heritage</h1>
              <p className="text-white/80 uppercase tracking-[0.2em] text-xs max-w-2xl mx-auto px-4">
                The intersection of ancient Ayurvedic wisdom and modern luxury.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Section 1 */}
          <section className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-serif text-luxury-gold">The Genesis of Divine Cardinal</h2>
            <p className="text-sm leading-loose text-luxury-charcoal/80 font-light">
              Founded on the principles of purity and luxury, Divine Cardinal represents a return to nature's most potent remedies. Our journey began with a simple belief: true beauty and wellness are achieved not through harsh chemicals, but through the delicate balance of authentic Ayurvedic ingredients.
            </p>
          </section>

          {/* Image + Text Grid */}
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/5] relative rounded-md overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" 
                alt="Ayurvedic Ingredients" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-serif text-luxury-charcoal border-b border-luxury-gold/20 pb-4">Our Craftsmanship</h3>
              <p className="text-sm leading-loose text-luxury-charcoal/80 font-light">
                Every drop of our luxury oils and elixirs is crafted with meticulous attention to detail. We source our ingredients directly from the pristine valleys of the Himalayas and the lush backwaters of Kerala, ensuring that each herb retains its maximum potency.
              </p>
              <p className="text-sm leading-loose text-luxury-charcoal/80 font-light">
                Our extraction processes respect the traditional timelines—some of our formulations take weeks of gentle sun-infusion to reach their perfect state. This is not mass production; this is artisanal wellness.
              </p>
            </div>
          </section>

          {/* Philosophy */}
          <section className="bg-white border border-luxury-gold/10 p-12 text-center rounded-sm shadow-sm">
            <h2 className="text-2xl font-serif text-luxury-gold mb-6">Our Philosophy</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h4 className="uppercase tracking-widest text-xs font-semibold">Purity</h4>
                <p className="text-xs text-luxury-charcoal/60 leading-relaxed">100% natural ingredients, free from synthetic preservatives and artificial fragrances.</p>
              </div>
              <div className="space-y-3">
                <h4 className="uppercase tracking-widest text-xs font-semibold">Potency</h4>
                <p className="text-xs text-luxury-charcoal/60 leading-relaxed">Concentrated formulations that deliver visible results through sustained use.</p>
              </div>
              <div className="space-y-3">
                <h4 className="uppercase tracking-widest text-xs font-semibold">Sustainability</h4>
                <p className="text-xs text-luxury-charcoal/60 leading-relaxed">Ethically sourced and packaged in recyclable, premium glass containers.</p>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
