/** @type {import('next').NextConfig} */

const nextConfig = {
  serverExternalPackages: ['sharp'],
  typescript: {
    ignoreBuildErrors: false,
  },
  // Fix workspace root issue
  ...(process.env.NODE_ENV === 'development' && {
    turbopack: {
      root: __dirname,
    },
  }),
};

module.exports = nextConfig;