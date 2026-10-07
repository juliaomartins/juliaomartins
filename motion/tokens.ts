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
 * Hero portrait fragments: where each piece rests (px) before it drifts into
 * place, in fragment order. Small on purpose — the photo is readable from the
 * first frame; the settle only closes the gaps.
 */
export const heroScatter = [
  [-14, -10],
  [-22, 4],
  [-10, 14],
  [0, -18],
  [4, 16],
  [16, -12],
  [20, 10],
] as const;

/**
 * Gallery slide focus. Both effects hang off the existing horizontal tween via
 * ScrollTrigger's `containerAnimation`, so they stay in lockstep with the pin
 * instead of running their own scroll maths.
 */
export const gallery = {
  scaleFrom: 0.88,
  scaleTo: 1,
  alphaFrom: 0.55,
  /** xPercent drift of the media inside its slide, against the track. */
  parallax: 12,
} as const;

/**
 * Logo sprite emitter on the gallery slides.
 *
 * `max` is the important one: the brief is "more clicks, more logos", which is
 * unbounded by definition. Bursts stay unlimited, but live sprites are capped
 * and the oldest recycle — otherwise a determined visitor accumulates hundreds
 * of animating nodes on the one section that already runs 20 ScrollTriggers.
 */
export const sprites = {
  /** One of each logo per burst: HTML, CSS, JS, TS, React, Next, GSAP. */
  perBurst: 7,
  max: 84,
  /*
   * Real projectile motion via Physics2DPlugin rather than a radial fan.
   * Angles are degrees with 0 = right and y pointing down, so a negative
   * angle launches upward; gravity then arcs each sprite over and drops it.
   */
  velocityMin: 320,
  velocityMax: 620,
  /** Upward spray, biased slightly outward on both sides. */
  angleMin: -150,
  angleMax: -30,
  gravity: 1100,
  /** Seconds a sprite stays airborne before it has fallen away. */
  life: 1.9,
  /** px; matches the eyebrow type size so the logos read as a caption, not clip-art. */
  size: 26,
  spin: 220,
  popIn: duration.sm,
  drift: duration.xl,
  fade: duration.md,
} as const;
