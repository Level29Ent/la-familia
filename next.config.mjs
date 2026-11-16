/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
};

// configure-pages injects basePath above. Publish that exact final value to client assets.
nextConfig.env = { NEXT_PUBLIC_BASE_PATH: nextConfig.basePath };

export default nextConfig;
