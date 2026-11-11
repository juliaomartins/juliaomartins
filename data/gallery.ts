import { GalleryItem } from "@/types/gallery";

/**
 * The gallery strip, from public/gallery. Files are named by date so the
 * folder reads in order too; the strip itself sorts on `date`, newest first.
 *
 * Dates come from each file's camera metadata where it had one. The hills
 * photo carried none (November 2026), and the DRCCMD photo is dated to the
 * event (2–3 October 2026); only the month is shown, so day-level precision
 * there just keeps the order right.
 */
export const galleryItems: readonly GalleryItem[] = [
  { id: "hills", src: "/gallery/juliao-martins-2026-11-mount-rabilau-maubisse.jpg", date: "2026-11-01", width: 1536, height: 2048 },
  {
    id: "hacktoberfestCheer",
    src: "/gallery/juliao-martins-2026-10-25-dili-hacktoberfest.mp4",
    date: "2026-10-25T14:29",
    width: 1280,
    height: 720,
    video: { poster: "/gallery/juliao-martins-2026-10-25-dili-hacktoberfest-poster.webp", comic: true },
  },
  { id: "hacktoberfestFriends", src: "/gallery/juliao-martins-2026-10-24-dili-hacktoberfest-friends.jpg", date: "2026-10-24T21:27", width: 800, height: 450 },
  { id: "hacktoberfestGroup", src: "/gallery/juliao-martins-2026-10-24-dili-hacktoberfest-group.jpg", date: "2026-10-24T17:39", width: 800, height: 450 },
  { id: "drccmdInovtec", src: "/gallery/juliao-martins-2026-10-drccmd-inovtec.webp", date: "2026-10-03", width: 750, height: 500 },
  { id: "picnicTeam", src: "/gallery/juliao-martins-2026-07-18-telemor-island-picnic-team.jpg", date: "2026-07-18T16:26", width: 2048, height: 1365 },
  { id: "picnicGroup", src: "/gallery/juliao-martins-2026-07-18-telemor-island-picnic-group.jpg", date: "2026-07-18T16:22", width: 2048, height: 1365 },
];
