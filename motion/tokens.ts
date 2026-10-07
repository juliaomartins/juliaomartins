/**
 * Single source of truth for motion timing.
 * Components must never inline a duration, ease, stagger or offset.
 */

export const duration = {
  micro: 0.18,
  sm: 0.28,
  md: 0.36,
  lg: 0.42,
  xl: 0.8,
} as const;

export const ease = {
  /** Linear. Required for scrub-linked tweens, which must track scroll 1:1. */
  none: "none",
  out: "power3.out",
  in: "power2.in",
  inOut: "power2.inOut",
} as const;

/**
 * Total stagger spread, not per-item delay.
 *
 * `amount` keeps a sequence's wall-clock length fixed regardless of how many
 * chars or lines a split produces. That is what holds the hero morph under
 * its 2.5s ceiling when the stack lines rewrap at different viewport widths —
 * with `each`, the tail would drift past budget on narrow screens.
 */
export const staggerAmount = {
  tight: 0.14,
  base: 0.16,
  loose: 0.3,
} as const;

/**
 * Hero role/stack morph. Plays once on load, never loops.
 *
 * Budget (see the offsets resolved end to end):
 *   0.00  rest on state A
 *   1.60  connector fades in            (holdA)
 *   1.66  state A masks out upward      (connector start + outOverlap)
 *   1.90  state B masks in from below   (A-out start + stateOut + inOverlap)
 *   2.48  rest on state B
 */
export const hero = {
  holdA: 1.6,
  /** Dwell on state B before yoyo reverses, mirroring holdA. */
  holdB: 1.6,
  connectorIn: duration.sm,
  stateOut: duration.md,
  stateIn: duration.lg,
  /** state A begins leaving while the connector is still arriving */
  outOverlap: -0.22,
  /** state B begins arriving while state A is ~75% gone — sells the morph */
  inOverlap: -0.26,
  /** yPercent travel for the masked exit / entrance */
  outShift: -100,
  inShift: 100,
  connectorRise: 8,

  /**
   * Split-flap. Each character rotates on its X axis inside its own SplitText
   * mask, so the old role flips away and the new one flips in — a departure
   * board, which is what a career transition actually looks like.
   */
  flipOut: -90,
  flipIn: 90,
  /** Without perspective on the slot, rotationX reads as a vertical squash. */
  perspective: 420,
} as const;

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
