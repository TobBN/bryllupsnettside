import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [85, 90, 95, 100],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
