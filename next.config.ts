import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure CSS processing works correctly
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Disable CSS optimization which can cause issues with Tailwind
  experimental: {
    optimizeCss: false,
  },
  // Ensure PostCSS runs correctly
  webpack: (config) => {
    return config
  },
}

export default nextConfig