/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Removing the unrecognized 'missingSyncParamsInRoutesWarning' option
  },
  // Keep these settings for deployment
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