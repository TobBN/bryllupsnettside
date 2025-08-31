import type { Metadata } from "next";
import "./globals.css";
import { IntlProvider } from '@/components/IntlProvider';

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
    <html lang="no" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Parisienne:wght@400&family=Dancing+Script:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative antialiased font-sans bg-[#FEFAE0] text-[#2D1B3D]">
        {/* Fixed hero background visible on home */}
        <div
          id="fixed-hero-bg"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 opacity-100"
          style={{
            backgroundImage: "url('/couple-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        <IntlProvider>
          {children}
        </IntlProvider>
      </body>
    </html>
  );
}
