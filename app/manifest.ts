import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Menú Digital — Mi Leña",
    short_name: "Mi Leña",
    description: "Menú digital premium e interactivo de Mi Leña.",
    start_url: "/menu",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#171717",
    icons: [
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
