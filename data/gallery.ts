import { GalleryItem } from "@/types/gallery";

/** Field notes, in the order they appear on the strip. */
export const galleryItems: readonly GalleryItem[] = [
  { id: "ceiling", src: "/3.jpg", width: 1200, height: 1600 },
  { id: "workstation", src: "/1.jpg", width: 1600, height: 1200 },
  { id: "site", src: "/4.mp4", width: 480, height: 720, video: { poster: "/4-poster.webp" } },
  { id: "drop", src: "/5.jpg", width: 1200, height: 1600 },
  { id: "team", src: "/8.jpg", width: 1200, height: 1600 },
  { id: "repair", src: "/2.jpg", width: 780, height: 1040 },
  { id: "wall", src: "/6.mp4", width: 720, height: 1080, video: { poster: "/6-poster.webp" } },
  { id: "control", src: "/7.jpg", width: 1200, height: 1600 },
  { id: "accessPoint", src: "/9.jpg", width: 765, height: 1020 },
  { id: "code", src: "/10.jpg", width: 765, height: 1020 },
];
