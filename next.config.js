// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations

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