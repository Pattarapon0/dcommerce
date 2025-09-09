import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable image optimization for better compatibility
  images: {
    unoptimized: true,
  },
  
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  },
};

export default nextConfig;