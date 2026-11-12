import type { MetadataRoute } from "next";

import {
  absoluteUrl,
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
 * The site's one page, and the images and videos on it, so search engines can
 * find every photo (Google Images) and clip and tie it to the page. The
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
  ];
}
