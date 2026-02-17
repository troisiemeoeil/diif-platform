// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations
  transpilePackages: ['@mui/x-charts-vendor'],
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