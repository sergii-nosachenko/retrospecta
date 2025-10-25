import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  // Ensure Prisma binaries are included in Vercel deployment
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      // Don't externalize Prisma Client
      config.externals.push({
        '.prisma/client/index-browser': '@prisma/client/index-browser',
      });
    }
    return config;
  },
};

export default nextConfig;
