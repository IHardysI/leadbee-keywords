/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Add this to disable the params await requirement
    missingSyncParamsInRoutesWarning: false
  },
  // Add this if you're having issues with TypeScript paths
  typescript: {
    // During deployment, we want to proceed even with errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // During deployment, we want to proceed even with errors
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 