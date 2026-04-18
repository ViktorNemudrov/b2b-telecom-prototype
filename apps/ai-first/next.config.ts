import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/ai-kit"],
  // Static export (`out/`) only for Capacitor — иначе `app/api/**` (LLM proxy) не попадёт в артефакт.
  ...(process.env.CAPACITOR_STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
  trailingSlash: true,
  images: { unoptimized: true }
};

export default nextConfig;
