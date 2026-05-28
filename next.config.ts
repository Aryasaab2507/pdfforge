import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  transpilePackages: [],
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Treat pdfjs as client-only by aliasing server imports to a stub
  serverExternalPackages: ['pdfjs-dist'],
};

export default nextConfig;
