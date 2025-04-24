import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      canvas: false,
    };
    config.externals.push('mock-aws-s3');
    return config;
  },
  images: {
    domains: [],
  },
};

export default nextConfig;
