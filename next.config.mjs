/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
  // Let webpack handle CSS/PostCSS instead of Turbopack
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
