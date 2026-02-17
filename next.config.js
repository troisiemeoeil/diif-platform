// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations
  transpilePackages: ['@mui/x-charts-vendor'],
  experimental: {
    turbo: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kartta.luke.fi',
        port: '',
        pathname: '/geoserver/**',
      },
    ],
  },
};

module.exports = nextConfig;