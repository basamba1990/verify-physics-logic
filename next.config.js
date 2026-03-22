/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['mhjtsawgsusgbdphdbzv.supabase.co'],
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-*'],
  },
}

module.exports = nextConfig
