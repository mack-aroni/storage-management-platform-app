import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100MB",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run'
      },
      {
        protocol: 'https',
        hostname: 'nyc.cloud.appwrite.io'
      }
    ]
  },
};

export default nextConfig;
