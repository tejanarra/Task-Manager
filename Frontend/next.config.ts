import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  // Base path for GitHub Pages deployment
  basePath: isGitHubPages ? '/Task-Manager' : '',

  // Asset prefix for GitHub Pages
  assetPrefix: isGitHubPages ? '/Task-Manager/' : '',

  // Output configuration
  output: isGitHubPages ? 'export' : undefined,

  // Image optimization
  images: {
    unoptimized: isGitHubPages, // Disable image optimization for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },

  // Trailing slash for GitHub Pages
  trailingSlash: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // React strict mode
  reactStrictMode: true,

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://task-manager-sigma-ashen.vercel.app/api',
  },

  // Turbopack configuration (empty to silence warning)
  turbopack: {},
};

export default nextConfig;
