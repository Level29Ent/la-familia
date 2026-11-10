/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/la-familia',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
