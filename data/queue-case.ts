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
    { id: "lobbyScreen", src: "/queue-system/lobby-screen.jpg", ...PHOTO, frame: "landscape" },
    { id: "scanDesk", src: "/queue-system/scan-desk.jpg", ...PHOTO, frame: "portrait", focus: "45% 50%" },
  ],
  [
    { id: "scanCloseup", src: "/queue-system/scan-closeup.jpg", ...PHOTO, frame: "square" },
    { id: "scanArrival", src: "/queue-system/scan-arrival.jpg", ...PHOTO, frame: "portrait", focus: "70% 50%" },
    { id: "delegates", src: "/queue-system/delegates.jpg", ...PHOTO, frame: "landscape" },
  ],
  [
    { id: "scanBatik", src: "/queue-system/scan-batik.jpg", ...PHOTO, frame: "portrait", focus: "55% 50%" },
    { id: "welcomeDesk", src: "/queue-system/welcome-desk.jpg", ...PHOTO, frame: "landscape" },
    { id: "scanQueue", src: "/queue-system/scan-queue.jpg", ...PHOTO, frame: "square", focus: "60% 50%" },
  ],
  [
    { id: "drccmdStage", src: "/queue-system/drccmd-stage.jpg", ...PHOTO, frame: "wide" },
    { id: "deskReady", src: "/queue-system/desk-ready.jpg", ...PHOTO, frame: "square", focus: "55% 50%" },
  ],
  [
    { id: "scanLounge", src: "/queue-system/scan-lounge.jpg", ...PHOTO, frame: "portrait", focus: "60% 50%" },
    { id: "aseanExpo", src: "/queue-system/asean-expo.jpg", ...PHOTO, frame: "wide", focus: "50% 15%" },
  ],
];

export const queueCase = {
  href: "/projects/visitor-queue-system",
  repo: "https://github.com/juliaomartins/visitor-management-system",

  /** The lobby screen at 08:51, waiting for arrivals. The page's LCP. */
  lead: { src: "/queue-system/waiting-for-arrivals.jpg", ...PHOTO },

  /** One medium per step, in the order of messages queueCase.steps. */
  steps: [
    { kind: "photo", src: "/queue-system/operators.jpg", ...PHOTO },
    { kind: "photo", src: "/queue-system/badges-on.jpg", ...PHOTO },
    { kind: "photo", src: "/queue-system/badge-scan.jpg", ...PHOTO },
    {
      kind: "video",
      src: "/queue-system/welcome.mp4",
      poster: "/queue-system/welcome-poster.webp",
      width: 540,
      height: 960,
    },
  ],

  wall,

  /** Three prints pinned to the project row on the home page. */
  teaser: [
    "/queue-system/waiting-for-arrivals.jpg",
    "/queue-system/badge-scan.jpg",
    "/queue-system/scan-closeup.jpg",
  ],
} as const;
