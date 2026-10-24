import type { MetadataRoute } from "next";

import { queueCase } from "@/data/queue-case";

import { SITE_URL } from "./robots";

/**
 * Replaces the hand-maintained public/sitemap.xml. Adding a page means adding
 * an entry here rather than editing raw XML.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}${queueCase.href}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.8,
    },
  ];
}
