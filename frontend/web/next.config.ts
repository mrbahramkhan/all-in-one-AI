import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { serverComponentsExternalPackages: ['@prisma/client'] },
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com', 's3.amazonaws.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  },
};

export default nextConfig;
