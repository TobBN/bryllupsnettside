import type { Metadata } from "next";
import { Parisienne, Playfair_Display, Cormorant_Garamond, Dancing_Script } from 'next/font/google';
import Script from "next/script";
import "./globals.css";

const parisienne = Parisienne({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-parisienne',
});

const playfair = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant',
});

const dancingScript = Dancing_Script({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dancing',
});

export const metadata: Metadata = {
  title: "Alexandra & Tobias - Bryllup 2026",
  description: "Velkommen til vårt bryllup den 24. juli 2026 på Villa Paradiso, Oslo",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevent iOS zoom issues
  viewportFit: 'cover' // Handle iPhone notch
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className={`scroll-smooth ${parisienne.variable} ${playfair.variable} ${cormorant.variable} ${dancingScript.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Parisienne:wght@400&family=Dancing+Script:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased font-sans">
        {children}
        <Script id="service-worker-registration">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
