/**
 * Visitor and Queue System case study (/projects/visitor-queue-system).
 * Photographs and footage from DRCCMD 2026 at Palm Spring, Dili. Every
 * caption lives in messages (queueCase.*); this file is only the media.
 */

/** Every still from the event is a 3:2 landscape at this size. */
const PHOTO = { width: 2048, height: 1366 } as const;

/** The shape a photo is hung in on the wall; it is cropped to fit. */
export type Frame = "wide" | "landscape" | "square" | "portrait";

/** Width over height of each frame. On the wall a row shares one height, so
 * each piece's width is in proportion to this. */
export const FRAME_RATIO: Record<Frame, number> = {
  wide: 2,
  landscape: 1.5,
  square: 1,
  portrait: 0.8,
};

export type CasePhoto = {
  /** Caption key in messages (queueCase.photos.<id>). */
  id: string;
  src: string;
  width: number;
  height: number;
  frame: Frame;
  /** object-position for the crop, when the subject is off-centre. */
  focus?: string;
};

/**
 * The salon wall, hung in rows and read left to right. Each row mixes frame
 * shapes and alternates which side carries the large piece.
 */
const wall: readonly (readonly CasePhoto[])[] = [
  [
    { id: "lobbyScreen", src: "/projects/visitor-queue-system/juliao-martins-lobby-screen.jpg", ...PHOTO, frame: "landscape" },
    { id: "scanDesk", src: "/projects/visitor-queue-system/juliao-martins-scan-desk.jpg", ...PHOTO, frame: "portrait", focus: "45% 50%" },
  ],
  [
    { id: "scanCloseup", src: "/projects/visitor-queue-system/juliao-martins-scan-closeup.jpg", ...PHOTO, frame: "landscape" },
    { id: "scanArrival", src: "/projects/visitor-queue-system/juliao-martins-scan-arrival.jpg", ...PHOTO, frame: "portrait", focus: "70% 50%" },
    { id: "scanBatik", src: "/projects/visitor-queue-system/juliao-martins-scan-batik.jpg", ...PHOTO, frame: "portrait", focus: "55% 50%" },
  ],
  [
    { id: "drccmdStage", src: "/projects/visitor-queue-system/juliao-martins-drccmd-stage.jpg", ...PHOTO, frame: "wide" },
    { id: "deskReady", src: "/projects/visitor-queue-system/juliao-martins-desk-ready.jpg", ...PHOTO, frame: "square", focus: "55% 50%" },
  ],
  [
    { id: "scanQueue", src: "/projects/visitor-queue-system/juliao-martins-scan-queue.jpg", ...PHOTO, frame: "square", focus: "60% 50%" },
    { id: "scanLounge", src: "/projects/visitor-queue-system/juliao-martins-scan-lounge.jpg", ...PHOTO, frame: "portrait", focus: "60% 50%" },
    { id: "aseanExpo", src: "/projects/visitor-queue-system/juliao-martins-asean-expo.jpg", ...PHOTO, frame: "wide", focus: "50% 15%" },
  ],
];

export const queueCase = {
  href: "/projects/visitor-queue-system",
  repo: "https://github.com/juliaomartins/visitor-management-system",

  /** The lobby screen at 08:51, waiting for arrivals. The page's LCP. */
  lead: { src: "/projects/visitor-queue-system/juliao-martins-waiting-for-arrivals.jpg", ...PHOTO },

  /**
   * One medium per step, in the order of messages queueCase.steps: register
   * a walk-in at the desk, the QR ID card, the scan, the welcome on screen.
   */
  steps: [
    { kind: "photo", src: "/projects/visitor-queue-system/juliao-martins-welcome-desk.jpg", ...PHOTO },
    { kind: "photo", src: "/projects/visitor-queue-system/juliao-martins-badges-on.jpg", ...PHOTO },
    { kind: "photo", src: "/projects/visitor-queue-system/juliao-martins-badge-scan.jpg", ...PHOTO },
    {
      kind: "video",
      src: "/projects/visitor-queue-system/juliao-martins-welcome.mp4",
      poster: "/projects/visitor-queue-system/juliao-martins-welcome-poster.webp",
      width: 540,
      height: 960,
    },
  ],

  wall,

  /** Behind the scenes: the Inovtec team that built and ran the system. */
  team: {
    site: "https://inovtec.digital",
    website: "https://cooptl.com/",
    photos: [
      { id: "behind", src: "/projects/visitor-queue-system/juliao-martins-inovtec-team.jpg", ...PHOTO },
      { id: "mission", src: "/projects/visitor-queue-system/juliao-martins-inovtec-mission.jpg", ...PHOTO },
    ],
  },

  /** Three prints pinned to the project row on the home page. */
  teaser: [
    "/projects/visitor-queue-system/juliao-martins-waiting-for-arrivals.jpg",
    "/projects/visitor-queue-system/juliao-martins-badge-scan.jpg",
    "/projects/visitor-queue-system/juliao-martins-scan-closeup.jpg",
  ],
} as const;
