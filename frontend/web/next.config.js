/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001' },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  compress: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  swcMinify: true,
  poweredByHeader: false,
  reactStrictMode: true,
};
module.exports = nextConfig;
