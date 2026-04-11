import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "B2B Telecom — Классика",
    short_name: "Telecom+",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFCFF",
    theme_color: "#1F2035",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
