// @ts-expect-error - No type definitions available
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@chakra-ui/react'],
  },
  // Ensure Prisma binaries are included in Vercel deployment
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;
