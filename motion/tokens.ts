/**
 * Single source of truth for motion timing.
 * Components must never inline a duration, ease, stagger or offset.
 */

export const duration = {
  micro: 0.18,
  /** Navbar underline travel. Micro-interaction range (0.15–0.25s). */
  ui: 0.24,
  sm: 0.28,
  md: 0.36,
  lg: 0.42,
  /** Entrances (0.6–0.9s). */
  xl: 0.8,
  /** In-page navigation scroll. Within the 1.0s page-transition ceiling. */
  scroll: 0.9,
  /** Light/dark blend: long enough to read as a change of light, not a flash. */
  theme: 0.6,
} as const;

export const ease = {
  /** Linear. Required for scrub-linked tweens, which must track scroll 1:1. */
  none: "none",
  out: "power3.out",
  in: "power2.in",
  inOut: "power2.inOut",
} as const;

/** Per-item stagger, inside the 0.06–0.12s house range. */
export const stagger = {
  each: 0.08,
} as const;

/** Entrance travel in px. Small on purpose: content settles, it doesn't fly. */
export const offset = {
  rise: 16,
  tile: 24,
} as const;

/** Bottom-up unveil: a piece is wiped into view from its lower edge. */
export const clip = {
  hidden: "inset(100% 0% 0% 0%)",
  shown: "inset(0% 0% 0% 0%)",
} as const;

/** Lead photo settle: it starts this much larger and eases back to 1. */
export const settle = {
  scale: 1.06,
} as const;

/** Timeline position parameters. */
export const position = {
  /** Start shortly after the previous tween starts. */
  follow: "<0.2",
} as const;

/**
 * Hero colour panels: where each window rests before it slides into place, in
 * % of the frame's width (container units), so the gesture is the same at
 * 240px on a phone and 416px on desktop. Order matches the panels.
 */
export const heroScatter = [
  [-3.4, -2.4],
  [-5.3, 1],
  [-2.4, 3.4],
  [0, -4.3],
  [1, 3.8],
  [3.8, -2.9],
  [4.8, 2.4],
] as const;

/**
 * The hero settle waits for the main thread to go idle after hydration, so it
 * never shares frames with start-up work (measured: started at hydration it
 * got 15–25 frames in 1.3s at 4x CPU). Upper bound on that wait, in ms.
 */
export const heroIdleTimeout = 1200;

/**
 * Gallery loop. Speed in px per second, so the pace reads the same whatever
 * the strip's width; `settle` is how long hover / Pause take to glide the
 * strip to a stop (and back), rather than freezing it mid-frame.
 */
export const galleryLoop = {
  pxPerSecond: 36,
  settle: duration.lg,
} as const;

/**
 * Comic overlay for the Dili Hacktoberfest clip (ComicClip).
 *
 * `cue` is in seconds of the video and was measured from its audio track (a
 * loudness envelope in 50ms windows, checked against the frames), not chosen
 * by eye:
 *   0.00–0.85  near silence
 *   0.85–2.60  one voice: "Dili Hacktoberfest 2026!"
 *   2.75–3.70  the room claps
 *   4.00 / 4.50 / 4.95  three shouts: "YES! YES! YES!"
 *   5.85–7.30  applause and cheering to the end of the clip
 * If the clip is ever re-cut, re-measure these.
 */
export const comic = {
  cue: {
    intro: 0.1,
    introOut: 0.7,
    speech: 0.88,
    speechOut: 2.62,
    applause: 2.78,
    applauseOut: 3.5,
    yes: [4.0, 4.5, 4.95],
    yesOut: 5.5,
    clap: 5.9,
    cheer: 6.22,
    sfxOut: 6.58,
    title: 6.68,
    end: 7.3,
  },
  duration: {
    pop: 0.4,
    /** A word slamming in from large: fast, so it lands on the shout. */
    slam: 0.14,
    burst: 0.22,
    out: 0.16,
    flash: 0.06,
    fade: 0.3,
    shake: 0.32,
    wobble: 0.28,
    jitter: 0.12,
  },
  ease: {
    /** Pop-in with overshoot. */
    pop: "back.out(2.4)",
    burst: "back.out(3)",
    slam: "power4.in",
    shake: "elastic.out(1.2, 0.3)",
    wobble: "sine.inOut",
    out: "power2.in",
    fade: "power2.out",
  },
  /** Start states. Rest tilt and position live in CSS (globals.css). */
  from: {
    captionScale: 0.4,
    captionTilt: -14,
    bubbleTilt: -10,
    slamScale: 2.6,
    burstScale: 0.2,
    burstTilt: -25,
    titleScale: 1.8,
    titleTilt: 6,
    starTilt: -90,
    outScale: 0.7,
  },
  /** Impact shake of the overlay only (never the video), in px. */
  shake: { x: -5, y: 3 },
  squash: 1.12,
  wobble: 2,
  jitter: 4,
  bob: -6,
  /** Peak / resting opacity of the speed lines and halftone. */
  lines: { peak: 0.9, rest: 0.3, title: 0.45 },
  dots: { applause: 0.5, title: 0.6 },
  stagger: 0.12,
} as const;
