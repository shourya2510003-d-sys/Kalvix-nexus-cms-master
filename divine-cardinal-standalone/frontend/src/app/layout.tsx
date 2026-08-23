import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Montserrat_Alternates } from 'next/font/google';
import '@fontsource/bagnard';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AppPopup from '../components/AppPopup';
import CustomerAI from '../components/CustomerAI';
import WhatsAppWidget from '../components/WhatsAppWidget';
import LiveTracker from '../components/LiveTracker';

const montserratAlt = Montserrat_Alternates({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat-alt',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Divine Cardinal – Premium Natural Wellness & Ayurvedic Oils',
    template: '%s | Divine Cardinal',
  },
  description: 'Explore our world of organic goodness, where ancient Ayurvedic wisdom meets modern luxury. Distilled therapeutic oils for teething, sleep, stress, and muscle recovery.',
  metadataBase: new URL('https://divinecardinal.com'),
  keywords: [
    'ayurvedic oils', 'natural wellness', 'herbal oils India', 'divine cardinal',
    'essential oils', 'organic wellness', 'women care oils', 'baby care oils',
    'massage oils', 'hair care oils', 'men grooming oils', 'attar perfume',
  ],
  authors: [{ name: 'Divine Cardinal International', url: 'https://divinecardinal.com' }],
  creator: 'Divine Cardinal International',
  publisher: 'Divine Cardinal International',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Divine Cardinal – Premium Natural Wellness & Ayurvedic Oils',
    description: 'Vedic wisdom meets modern luxury. Discover organic wellness remedies formulated with pure essential oils.',
    url: 'https://divinecardinal.com',
    siteName: 'Divine Cardinal International',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/qdq7ult5/image/upload/v1784116344/kalvix_nexus/navbar/women_care_menu.png',
        width: 1200,
        height: 630,
        alt: 'Divine Cardinal – Premium Ayurvedic Wellness',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Divine Cardinal – Premium Natural Wellness & Ayurvedic Oils',
    description: 'Vedic wisdom meets modern luxury. Discover organic wellness remedies formulated with pure essential oils.',
    images: ['https://res.cloudinary.com/qdq7ult5/image/upload/v1784116344/kalvix_nexus/navbar/women_care_menu.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification-token',
  },
};

export const viewport: Viewport = {
  themeColor: '#C8A96E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserratAlt.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Divine Cardinal International",
                "url": "https://divinecardinal.com",
                "logo": "https://res.cloudinary.com/qdq7ult5/image/upload/v1784116344/kalvix_nexus/navbar/women_care_menu.png",
                "description": "Premium Ayurvedic wellness oils and natural remedies.",
                "sameAs": [
                  "https://instagram.com/divinecardinal",
                ],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "availableLanguage": ["English", "Hindi"],
                }
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Divine Cardinal",
                "url": "https://divinecardinal.com",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://divinecardinal.com/shop?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ])
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <LiveTracker />
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <AppPopup />
              <CustomerAI />
              <WhatsAppWidget />
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
