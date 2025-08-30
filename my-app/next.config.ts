import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    quality: 85,
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
