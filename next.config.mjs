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
  // Explicitly disable Turbopack for Azure App Service compatibility
  experimental: {
    turbopack: false,
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
