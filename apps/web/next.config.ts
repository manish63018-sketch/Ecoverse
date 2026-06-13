import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ecoverseindia.supabase.co" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  outputFileTracingRoot: path.join(__dirname, "../.."),
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
};

export default nextConfig;
