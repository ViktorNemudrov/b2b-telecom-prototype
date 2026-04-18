import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/classic-kit"],
  // Static export (`out/`) only for Capacitor — иначе `app/api/**` (LLM proxy) не попадёт в артефакт.
  ...(process.env.CAPACITOR_STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
  // Windows: без этого иногда получается неполный `server/app-paths-manifest.json` и падение на
  // «Cannot find module for page» при collect page data (гонка воркеров при записи манифеста).
  ...(process.platform === "win32"
    ? { experimental: { cpus: 1 } }
    : {})
};

export default nextConfig;
