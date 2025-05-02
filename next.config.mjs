/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Add build output tracking for Vercel
  output: 'standalone',
  // Disable sourcemaps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Add domain for Vercel deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;