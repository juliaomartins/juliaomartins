import type { MetadataRoute } from "next";

import { queueCase } from "@/data/queue-case";
import {
  absoluteUrl,
  caseImages,
  caseVideos,
  CONTENT_UPDATED,
  homeImages,
  homeVideos,
  SITE_URL,
  type IndexedVideo,
} from "@/lib/seo";

const video = (clip: IndexedVideo) => ({
  title: clip.title,
  description: clip.description,
  thumbnail_loc: absoluteUrl(clip.poster),
  content_loc: absoluteUrl(clip.src),
  publication_date: clip.date,
});

/**
 * Pages, and the images and videos on each, so search engines can find every
 * photo (Google Images) and clip and tie it to the page it appears on. The
 * lists live in lib/seo.ts, shared with the pages' structured data.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
      images: homeImages.map((image) => absoluteUrl(image.src)),
      videos: homeVideos.map(video),
    },
    {
      url: absoluteUrl(queueCase.href),
      lastModified: CONTENT_UPDATED,
      changeFrequency: "yearly",
      priority: 0.8,
      images: caseImages.map((image) => absoluteUrl(image.src)),
      videos: caseVideos.map(video),
    },
  ];
}
