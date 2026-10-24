"use client";

import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";

import { gsap, ScrollTrigger } from "@/motion/registry";
import { clip, duration, ease, offset, stagger } from "@/motion/tokens";

/**
 * Unveil every `selector` inside `scope` bottom-up (clip-path + a short rise)
 * as it scrolls in, in batches. Pieces are hidden only once JS runs and only
 * with full motion, so no-JS and reduced motion see everything at rest.
 */
export function useClipReveal(
  scope: RefObject<HTMLElement | null>,
  selector: string
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pieces = gsap.utils.toArray<HTMLElement>(selector, scope.current);
        gsap.set(pieces, { clipPath: clip.hidden, y: offset.tile });
        ScrollTrigger.batch(pieces, {
          start: "top 80%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              clipPath: clip.shown,
              y: 0,
              duration: duration.xl,
              ease: ease.out,
              stagger: stagger.each,
              clearProps: "clipPath,transform",
            }),
        });
      });
      return () => mm.revert();
    },
    { scope }
  );
}
