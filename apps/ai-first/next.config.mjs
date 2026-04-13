/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@b2b/shared"],
  /** Статический экспорт для сборки APK (Capacitor). */
  output: "export",
  /** Чтобы при обновлении страницы (/appeals и др.) отдавался index.html, а не 404. */
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;

