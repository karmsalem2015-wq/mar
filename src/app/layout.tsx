// src/app/layout.tsx
import type { Metadata } from 'next';
import { Almarai, Alexandria, Cairo, Tajawal, Cormorant_Garamond } from 'next/font/google';
import '../styles/globals.css';
import { BRAND } from '@/config/brand';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';

const almarai = Almarai({
  subsets: ['arabic'],
  variable: '--font-mar-almarai',
  display: 'swap',
  weight: ['300', '400', '700', '800'],
});

const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-mar-alexandria',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-mar-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  variable: '--font-mar-tajawal',
  display: 'swap',
  weight: ['300', '400', '500', '700', '800'],
});

const latinDisplay = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-mar-latin-display',
  display: 'swap',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.website),
  title: { 
    default: `${BRAND.nameAr} | ${BRAND.promiseAr}`,
    template: `%s | ${BRAND.nameAr}`,
  },
  description: BRAND.storyAr,
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;if(p.indexOf('/mar-cp')===0){var t=localStorage.getItem('mar-admin-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${almarai.variable} ${alexandria.variable} ${cairo.variable} ${tajawal.variable} ${latinDisplay.variable} bg-white font-tajawal text-brand-black antialiased`}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
