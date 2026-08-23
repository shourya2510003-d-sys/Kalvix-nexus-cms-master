'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-luxury-charcoal">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif text-luxury-charcoal">Contact Us</h1>
            <p className="text-sm text-luxury-charcoal/60 uppercase tracking-[0.2em] max-w-2xl mx-auto">
              We are here to assist you with your luxury wellness journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Contact Information */}
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-serif text-luxury-gold mb-6 border-b border-luxury-gold/20 pb-4">Get in Touch</h3>
                <p className="text-sm leading-relaxed text-luxury-charcoal/80 font-light mb-8">
                  Whether you have a question about our bespoke formulations, need assistance with an order, or wish to seek personalized Ayurvedic advice, our dedicated concierge team is at your service.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-luxury-gold/10 p-3 rounded-full">
                    <MapPin className="h-5 w-5 text-luxury-gold" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm uppercase tracking-widest mb-1">Our Boutique</h4>
                    <p className="text-xs text-luxury-charcoal/70 leading-relaxed font-light">
                      Divine Cardinal Wellness<br />
                      123 Heritage Lane, Ayurvedic District<br />
                      New Delhi, 110001, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-luxury-gold/10 p-3 rounded-full">
                    <Phone className="h-5 w-5 text-luxury-gold" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm uppercase tracking-widest mb-1">Telephone</h4>
                    <p className="text-xs text-luxury-charcoal/70 leading-relaxed font-light">
                      +91 98765 43210<br />
                      Mon-Sat, 10:00 AM - 7:00 PM (IST)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-luxury-gold/10 p-3 rounded-full">
                    <Mail className="h-5 w-5 text-luxury-gold" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm uppercase tracking-widest mb-1">Email</h4>
                    <p className="text-xs text-luxury-charcoal/70 leading-relaxed font-light">
                      concierge@divinecardinal.com<br />
                      support@divinecardinal.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-luxury-gold/10 p-8 md:p-10 shadow-sm rounded-sm">
              <h3 className="text-xl font-serif text-luxury-charcoal mb-8 text-center">Send us a Message</h3>
              
              {status === 'success' && (
                <div className="mb-6 bg-green-50 text-green-700 p-4 text-xs rounded border border-green-200 text-center">
                  Thank you for reaching out. A member of our concierge team will respond to you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-luxury-gold/30 rounded p-3 text-sm outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-luxury-gold/30 rounded p-3 text-sm outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Phone (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-luxury-gold/30 rounded p-3 text-sm outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full border border-luxury-gold/30 rounded p-3 text-sm outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-luxury-charcoal/70">Message</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full border border-luxury-gold/30 rounded p-3 text-sm outline-none focus:border-luxury-gold transition-colors resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-luxury-gold hover:bg-luxury-goldDark text-white py-4 text-xs uppercase tracking-widest font-serif transition-colors shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{status === 'submitting' ? 'Sending...' : 'Send Message'}</span>
                  {!status && <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>

          {/* Map Location */}
          <div className="mt-24">
            <h3 className="text-2xl font-serif text-luxury-charcoal mb-8 text-center border-b border-luxury-gold/20 pb-4 max-w-xl mx-auto">Find Us Here</h3>
            <div className="w-full h-96 bg-gray-100 rounded-sm overflow-hidden shadow-inner border border-luxury-gold/10">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192868!2d77.06889658957805!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi%2C%20India!5e0!3m2!1sen!2sus!4v1689255263155!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Divine Cardinal Location"
              ></iframe>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
