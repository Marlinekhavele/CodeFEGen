import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure PostCSS runs correctly
  webpack: (config) => {
    return config
  },
}

export default nextConfig