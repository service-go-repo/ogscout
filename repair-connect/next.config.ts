import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled standalone output - was causing CSS loading issues
  output: 'standalone',
  eslint: {
    // Skip ESLint during build for faster builds
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Removed experimental workerThreads and cpus settings
  // These were causing CSS minification to corrupt media queries
};

export default nextConfig;
