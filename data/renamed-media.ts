/**
 * Old public URLs of photos and clips that were renamed, and where they live
 * now. next.config.ts turns each into a permanent redirect, so anything a
 * search engine (or anyone) indexed under the old name still resolves and
 * passes its ranking to the new one. Add to this list whenever a public file
 * is renamed. Remove an entry only when its file is deleted, so the old URL
 * 404s instead of redirecting to nothing.
 */
export const renamedMedia: readonly { from: string; to: string }[] = [
  // Gallery: the name first, then the date, so the folder still sorts by date.
  { from: "/gallery/2026-11-hills.jpg", to: "/gallery/juliao-martins-2026-11-mount-rabilau-maubisse.jpg" },
  { from: "/gallery/2026-10-25-hacktoberfest.mp4", to: "/gallery/juliao-martins-2026-10-25-dili-hacktoberfest.mp4" },
  { from: "/gallery/2026-10-25-hacktoberfest-poster.webp", to: "/gallery/juliao-martins-2026-10-25-dili-hacktoberfest-poster.webp" },
  { from: "/gallery/2026-10-24-hacktoberfest-friends.jpg", to: "/gallery/juliao-martins-2026-10-24-dili-hacktoberfest-friends.jpg" },
  { from: "/gallery/2026-10-24-hacktoberfest-group.jpg", to: "/gallery/juliao-martins-2026-10-24-dili-hacktoberfest-group.jpg" },
  { from: "/gallery/2026-10-drccmd-inovtec.webp", to: "/gallery/juliao-martins-2026-10-drccmd-inovtec.webp" },
  { from: "/gallery/2026-07-18-telemor-picnic-team.jpg", to: "/gallery/juliao-martins-2026-07-18-telemor-island-picnic-team.jpg" },
  { from: "/gallery/2026-07-18-telemor-picnic-group.jpg", to: "/gallery/juliao-martins-2026-07-18-telemor-island-picnic-group.jpg" },
];
