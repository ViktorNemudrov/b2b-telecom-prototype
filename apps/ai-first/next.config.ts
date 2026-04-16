import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/shared"],
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true }
};

export default nextConfig;
