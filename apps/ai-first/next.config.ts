import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/ai-kit"],
  // On Vercel we deploy as a normal Next.js app.
  // Static export (`out/`) is still useful for mobile (Capacitor), so we enable it by default locally.
  ...(process.env.VERCEL ? {} : { output: "export" }),
  trailingSlash: true,
  images: { unoptimized: true }
};

export default nextConfig;
