/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/shared"],
  /** Статический экспорт для сборки APK (Capacitor). */
  output: "export",
  images: {
    unoptimized: true
  }
};

export default nextConfig;

