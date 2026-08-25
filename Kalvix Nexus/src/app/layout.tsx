import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import GlobalLayoutProviders from '@/components/GlobalLayoutProviders';
import PopupForm from '@/components/PopupForm';

const outfit = Outfit({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-outfit' });
const inter = Inter({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Kalvix Nexus | Where Vision Meets Technology',
  description: 'Premium Technology Agency. Specialized engineering architectures across Web Development, Android Applications, AI Solutions, and Automation Assets.',
  metadataBase: new URL('https://www.kalvixnexus.com'),
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Kalvix Nexus | Premium Tech Agency',
    description: 'Where Vision Meets Technology',
    url: 'https://www.kalvixnexus.com',
    siteName: 'Kalvix Nexus',
    type: 'website',
  },
};

import { headers } from 'next/headers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers();
  const hostname = headersList.get('host') || '';
  const isLocalhost = hostname.includes('localhost');
  const baseDomain = isLocalhost ? 'localhost:3001' : 'kalvixnexus.com';
  const subdomain = hostname.replace(`.${baseDomain}`, '');
  const isSubdomain = subdomain !== hostname && subdomain !== 'www' && subdomain !== 'kalvixnexus.com';
  return (
    <html lang="en" suppressHydrationWarning className="selection:bg-gold-primary selection:text-black">
      <head>
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-B7G6MP0D23" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-B7G6MP0D23');
          `}
        </Script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${inter.variable} font-inter antialiased bg-bg-primary text-text-primary`}>
        {/* JSON-LD Schema (AEO/GEO Optimized) */}
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://kalvixnexus.com/#organization",
                  "name": "Kalvix Nexus",
                  "url": "https://kalvixnexus.com",
                  "logo": "https://kalvixnexus.com/logo.png",
                  "founder": [
                    { 
                      "@type": "Person", 
                      "name": "Shourya Sharma",
                      "jobTitle": "Co-Founder & CEO",
                      "alumniOf": {
                        "@type": "CollegeOrUniversity",
                        "name": "Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad"
                      }
                    },
                    { 
                      "@type": "Person", 
                      "name": "Vikram Singh Parmar",
                      "jobTitle": "Co-Founder & CTO",
                      "alumniOf": {
                        "@type": "CollegeOrUniversity",
                        "name": "Maya Institute of Technology Hathras (AKTU)"
                      }
                    }
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91-7906355122",
                    "contactType": "customer service"
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://kalvixnexus.com/#website",
                  "url": "https://kalvixnexus.com",
                  "name": "Kalvix Nexus",
                  "publisher": { "@id": "https://kalvixnexus.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://kalvixnexus.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://kalvixnexus.com/#localbusiness",
                  "name": "Kalvix Nexus",
                  "image": "https://kalvixnexus.com/logo.png",
                  "telephone": "+91-7906355122",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Hathras",
                    "addressRegion": "UP",
                    "addressCountry": "IN"
                  }
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "Who are the founders of Kalvix Nexus?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "The founders of Kalvix Nexus are Shourya Sharma (Co-Founder & CEO) and Vikram Singh Parmar (Co-Founder & CTO). Shourya Sharma is a B.Tech (Computer Science & Engineering) student at Ajay Kumar Garg Engineering College (AKGEC), Ghaziabad. Vikram Singh Parmar is a B.Tech (Computer Science & Engineering - AI & ML) student at Maya Institute of Technology Hathras (AKTU)."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />
        <GlobalLayoutProviders isSubdomain={isSubdomain}>
          {children}
        </GlobalLayoutProviders>
        {!isSubdomain && <PopupForm />}
      </body>
    </html>
  );
}