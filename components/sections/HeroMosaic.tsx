"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";

import { gsap } from "@/motion/registry";
import { duration, ease, heroScatter, stagger } from "@/motion/tokens";
import portrait from "@/public/juliao_martins2.png";

/**
 * Fragments of the portrait as [left, top, width, height] in % of a 3:4 frame:
 * three staggered columns with gaps between them, like the painting in the
 * reference split across canvases. Order matches `heroScatter`.
 */
const PIECES = [
  [0, 14, 31, 22],
  [0, 38, 31, 34],
  [6, 74, 25, 16],
  [34, 0, 32, 45],
  [34, 47, 32, 53],
  [69, 10, 31, 30],
  [69, 42, 31, 36],
] as const;

/** Rendered width of the frame; keep in step with the max-w classes below. */
const SIZES = "(min-width: 1024px) 26rem, 15rem";

/**
 * One photo (transparent background), shown through seven windows backed by
 * the amber signal colour — the page's single accent, here doing the job the
 * painting's colour does in the reference. Every window renders the same
 * next/image at the size of the whole frame and offsets it, so the browser
 * downloads a single file.
 *
 * Motion: with full motion the pieces start a few px apart (CSS, before first
 * paint) and settle together once — the same "pieces finding their place"
 * language as the skills wall. Transform only, so the photo is visible from
 * the first frame and LCP is untouched. Reduced motion is the assembled frame.
 */
export default function HeroMosaic({ name }: { name: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { full } = context.conditions as { full: boolean; reduced: boolean };
          const pieces = gsap.utils.toArray<HTMLElement>("[data-hero-piece]", rootRef.current);
          if (!full) {
            // The OS setting can change after the head probe ran.
            gsap.set(pieces, { "--piece-x": "0px", "--piece-y": "0px" });
            return;
          }
          gsap.to(pieces, {
            "--piece-x": "0px",
            "--piece-y": "0px",
            duration: duration.xl,
            ease: ease.out,
            stagger: stagger.each,
          });
        }
      );
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      data-hero-mosaic=""
      role="img"
      aria-label={name}
      className="relative aspect-3/4 w-full max-w-60 lg:max-w-104"
    >
      {PIECES.map(([left, top, width, height], index) => {
        const [x, y] = heroScatter[index];
        return (
          <div
            key={`${left}-${top}`}
            data-hero-piece=""
            className="absolute overflow-hidden rounded-md bg-signal"
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                "--piece-x": `${x}px`,
                "--piece-y": `${y}px`,
              } as CSSProperties
            }
          >
            {/* The whole frame, shifted so this window shows its own slice. */}
            <div
              className="absolute"
              style={{
                left: `${(-left / width) * 100}%`,
                top: `${(-top / height) * 100}%`,
                width: `${(100 / width) * 100}%`,
                height: `${(100 / height) * 100}%`,
              }}
            >
              <Image
                src={portrait}
                alt=""
                fill
                sizes={SIZES}
                placeholder="blur"
                preload={index === 0}
                loading="eager"
                className="object-cover object-top"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
