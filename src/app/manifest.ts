import type { MetadataRoute } from "next";

/**
 * Web app manifest: name and icons for "Add to Home Screen" / install.
 * Icons are generated from src/app/icon.svg by `npm run icons`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Julião Martins – Developer",
    short_name: "Julião",
    description:
      "Portfolio of Julião Martins, a developer building web and mobile products — now studying AI engineering.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
