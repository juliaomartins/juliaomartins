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
