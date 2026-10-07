"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, type CSSProperties } from "react";

import CircleStamp from "@/components/ui/CircleStamp";
import { gsap } from "@/motion/registry";
import {
  duration,
  ease,
  heroIdleTimeout,
  heroScatter,
  stagger,
} from "@/motion/tokens";
import portrait from "@/public/juliao_martins2.png";

/**
 * The colour field behind the portrait: [left, top, width, height] in % of a
 * 3:4 frame, plus a tone. Three staggered columns of panels, like the painting
 * in the reference split across canvases, starting low enough that the head
 * rises clear of them. Tones are the one amber accent at different strengths,
 * with a single ink panel for weight. Order matches `heroScatter`.
 */
const PANELS = [
  { box: [2, 30, 29, 20], tone: "bg-signal/40" },
  { box: [0, 52, 31, 26], tone: "bg-signal" },
  { box: [8, 80, 23, 14], tone: "bg-foreground" },
  { box: [34, 14, 32, 34], tone: "bg-signal/20" },
  { box: [34, 50, 32, 50], tone: "bg-signal/70" },
  { box: [69, 26, 29, 22], tone: "bg-signal" },
  { box: [69, 50, 31, 30], tone: "bg-signal/40" },
] as const;

/**
 * Rendered width of the full-frame photo; keep in step with the max-w classes
 * below. Every layer uses the same value, so the browser picks the same file
 * for all of them and downloads it once.
 */
const SIZES = "(min-width: 1024px) 26rem, 15rem";

/** The head layer stops just under the chin; below it the body is fragmented. */
const HEAD_CLIP = "inset(0% 0% 64% 0%)";

/** The photo at full-frame size, for a layer or a panel window. */
function Photo({ preload = false }: { preload?: boolean }) {
  return (
    <Image
      src={portrait}
      alt=""
      fill
      sizes={SIZES}
      // No blur placeholder: on a transparent cut-out Next draws it as an
      // opaque blurred box over the panels until the photo arrives.
      placeholder="empty"
      preload={preload}
      loading="eager"
      className="object-cover object-top"
    />
  );
}

/**
 * Break-out portrait. The head is one unbroken layer that rises above the top
 * panel — stepping out of the frame. Below the chin the body exists only
 * inside the colour panels, fragmented like the painting in the reference, so
 * the photo's hard crop edges are always hidden inside a rounded panel. A
 * circular stamp seals the bottom corner.
 *
 * Motion: with full motion the panels start a few px apart (CSS, before first
 * paint) and settle together once — the same "pieces finding their place"
 * language as the skills wall. The portrait never moves: it is the LCP image
 * and paints in place. Reduced motion and no-JS get the settled frame.
 */
export default function HeroMosaic({ name }: { name: string }) {
  const t = useTranslations("home");
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
          const { full } = context.conditions as {
            full: boolean;
            reduced: boolean;
          };
          const panels = gsap.utils.toArray<HTMLElement>(
            "[data-hero-piece]",
            rootRef.current
          );
          if (!full) {
            // The OS setting can change after the head probe ran.
            gsap.set(panels, { "--piece-x": "0cqw", "--piece-y": "0cqw" });
            return;
          }
          const settle = gsap.to(panels, {
            "--piece-x": "0cqw",
            "--piece-y": "0cqw",
            duration: duration.xl,
            ease: ease.out,
            stagger: stagger.each,
            paused: true,
          });
          // Play once start-up work is done, so every frame of the settle is
          // free to render. Until then the windows simply rest apart — the
          // photo is already whole.
          const play = () => settle.play();
          // Safari has no requestIdleCallback; it gets the next task instead.
          if (typeof window.requestIdleCallback === "function") {
            const id = window.requestIdleCallback(play, { timeout: heroIdleTimeout });
            return () => window.cancelIdleCallback(id);
          }
          const id = window.setTimeout(play, 0);
          return () => window.clearTimeout(id);
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
      className="@container relative aspect-3/4 w-full max-w-60 lg:max-w-104"
    >
      {PANELS.map(({ box: [left, top, width, height], tone }, index) => {
        const [x, y] = heroScatter[index];
        return (
          <div
            key={`${left}-${top}`}
            data-hero-piece=""
            className={`absolute overflow-hidden rounded-md ${tone}`}
            style={
              {
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                "--piece-x": `${x}cqw`,
                "--piece-y": `${y}cqw`,
              } as CSSProperties
            }
          >
            {/* The whole frame, shifted so this window shows its own slice —
                and counter-moved while the window settles (see globals.css). */}
            <div
              data-hero-slice=""
              className="absolute"
              style={{
                left: `${(-left / width) * 100}%`,
                top: `${(-top / height) * 100}%`,
                width: `${(100 / width) * 100}%`,
                height: `${(100 / height) * 100}%`,
              }}
            >
              <Photo />
            </div>
          </div>
        );
      })}

      {/* The head: one piece, above the field. Same frame, clipped at the chin. */}
      <div
        data-hero-portrait=""
        className="absolute inset-0"
        style={{ clipPath: HEAD_CLIP }}
      >
        <Photo preload />
      </div>

      <div
        data-hero-stamp=""
        aria-hidden="true"
        className="absolute -bottom-6 -left-4 size-24 rounded-full bg-background p-1.5 ring-1 ring-border lg:-left-10 lg:size-28"
      >
        <CircleStamp text={t("stamp")} className="size-full" />
      </div>
    </div>
  );
}
