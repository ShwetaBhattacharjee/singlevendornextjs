import type { NextConfig } from 'next';
import withNextIntl from 'next-intl/plugin';

const nextConfig: NextConfig = withNextIntl()({
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Add Cloudinary here
        port: '',
      },
    ],
  },
});

export default nextConfig;
