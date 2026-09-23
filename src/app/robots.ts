import type { MetadataRoute } from "next";

export const SITE_URL = "https://juliaomartins.dev";

/**
 * Replaces the hand-maintained public/robots.txt, so the host can never drift
 * from metadataBase and the sitemap URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
