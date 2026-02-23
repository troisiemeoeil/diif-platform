// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Disable Turbopack in production for Azure App Service compatibility
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
  experimental: {
    turbopack: false,
  },
};

module.exports = nextConfig;