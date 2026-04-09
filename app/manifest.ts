import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "B2B Telecom — Mobile Prototype",
    short_name: "Telecom",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFCFF",
    theme_color: "#6C63FF",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}

