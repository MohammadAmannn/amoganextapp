import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable strict mode to prevent double-renders in development (faster dev experience)
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Keep browser-only / node-only packages out of SSR bundling
  serverExternalPackages: ['@cle-does-things/pdfitdown', 'pdfjs-dist', 'canvas'],
  transpilePackages: [],
  turbopack: {
    resolveAlias: {
      canvas: './src/lib/empty-module.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  outputFileTracingExcludes: {
    '*': [
      'public/uploads/**',
      'android/**',
      'ios/**',
      '**/*.pdf',
      '**/*.csv',
    ],
  },
  experimental: {},
}

export default nextConfig
