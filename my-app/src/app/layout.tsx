import type { Metadata } from "next";
import "./globals.css";
import { IntlProvider } from '@/components/IntlProvider';

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
    <html lang="no" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Parisienne:wght@400&family=Dancing+Script:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        <IntlProvider>
          {children}
        </IntlProvider>
      </body>
    </html>
  );
}
