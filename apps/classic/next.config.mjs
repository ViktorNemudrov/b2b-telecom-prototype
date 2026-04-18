/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/classic-kit"],
  /** Статический экспорт для сборки APK (Capacitor). */
  output: process.env.VERCEL ? undefined : "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;

