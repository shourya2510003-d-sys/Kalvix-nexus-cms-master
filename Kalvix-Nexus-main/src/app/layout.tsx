import type { Metadata } from 'next';
import { Orbitron, Inter, Rajdhani } from 'next/font/google';
import './globals.css';
import GlobalLayoutProviders from '@/components/GlobalLayoutProviders';

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rajdhani = Rajdhani({ weight: ['500', '600', '700'], subsets: ['latin'], variable: '--font-rajdhani' });

export const metadata: Metadata = {
  title: 'Kalvix Nexus | Where Vision Meets Technology',
  description: 'Premium Technology Agency. Specialized engineering architectures across Web Development, Android Applications, AI Solutions, and Automation Assets.',
  metadataBase: new URL('https://www.kalvixnexus.com'),
  openGraph: {
    title: 'Kalvix Nexus | Premium Tech Agency',
    description: 'Where Vision Meets Technology',
    url: 'https://www.kalvixnexus.com',
    siteName: 'Kalvix Nexus',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="selection:bg-gold-primary selection:text-black">
      <head>
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
      <body className={`${orbitron.variable} ${inter.variable} ${rajdhani.variable} font-inter overflow-x-hidden antialiased bg-bg-primary text-text-primary`}>
        <GlobalLayoutProviders>
          {children}
        </GlobalLayoutProviders>
      </body>
    </html>
  );
}