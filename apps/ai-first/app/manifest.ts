import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Билайн.One",
    short_name: "Билайн.One",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#F7F8FA",
    icons: [
      {
        src: "/mockups/sphere-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/mockups/sphere-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ]
  };
}

