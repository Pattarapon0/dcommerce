import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: 'export' - not needed for dynamic apps
  images: {
    unoptimized: true
  }
};

export default nextConfig;
