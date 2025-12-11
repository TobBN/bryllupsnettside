import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Configure for next-intl compatibility with Next.js 15
  turbopack: {},
};

export default nextConfig;
