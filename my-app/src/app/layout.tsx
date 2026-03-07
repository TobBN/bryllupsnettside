import type { Metadata } from "next";
import { Parisienne, Dancing_Script, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { IntlProvider } from '@/components/IntlProvider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const parisienne = Parisienne({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-parisienne',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Alexandra & Tobias",
  description: "Bryllupsnettside",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  }
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
    <html lang="no" className={`scroll-smooth ${parisienne.variable} ${dancingScript.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable}`}>
      <body className="relative antialiased font-sans bg-[#FEFAE0] text-[#2D1B3D]">
        <IntlProvider>
          {children}
        </IntlProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
