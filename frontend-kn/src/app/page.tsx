import React from 'react';

// Homepage Components
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustBar from '@/components/home/TrustBar';

// Dynamically import below-the-fold components to improve initial page load speed
const WhoWeAre = dynamic(() => import('@/components/home/WhoWeAre'));
const Services = dynamic(() => import('@/components/home/Services'));
const WhyChooseUs = dynamic(() => import('@/components/home/WhyChooseUs'));
const Process = dynamic(() => import('@/components/home/Process'));
const Blogs = dynamic(() => import('@/components/home/Blogs'));
const Testimonials = dynamic(() => import('@/components/home/Testimonials'));
const MeetFounders = dynamic(() => import('@/components/home/MeetFounders'));
const Industries = dynamic(() => import('@/components/home/Industries'));
const FAQSection = dynamic(() => import('@/components/home/FAQSection'));
const FinalCTA = dynamic(() => import('@/components/home/FinalCTA'));
const LeaveReview = dynamic(() => import('@/components/home/LeaveReview'));

export default function Home() {
  // We can pass data to Hero if fetched from Firebase, but for now we'll rely on the defaults in the component
  const heroData = {};

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-gold-primary selection:text-black">
      <Hero heroData={heroData} />
      <TrustBar />
      
      {/* Parallax Window Section for WhoWeAre & Services */}
      <div 
        className="relative bg-center bg-no-repeat bg-fixed bg-cover"
        style={{ backgroundImage: "url('/watery-bg.png')" }}
      >
        {/* Very light overlay to keep text readable without making it dark */}
        <div className="absolute inset-0 bg-black/15 pointer-events-none z-0" />
        <div className="relative z-10">
          <WhoWeAre />
          <Services />
          <WhyChooseUs />
        </div>
      </div>
      
      <Process />
      <Blogs />
      <Testimonials />
      <MeetFounders />
      <Industries />
      <FAQSection />
      <FinalCTA />
      <LeaveReview />
    </main>
  );
}
