import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  // Enable Turbopack (Next.js 16 default)
  // Prisma binaries are handled via binaryTargets in schema.prisma
  // and runtime='nodejs' in routes using Prisma
  turbopack: {},
};

export default nextConfig;
