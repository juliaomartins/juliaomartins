"use client";

import { useGSAP } from "@gsap/react";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import EmojiText from "@/components/ui/EmojiText";
import { galleryItems } from "@/data/gallery";
import { cn } from "@/lib/utils";
import { gsap } from "@/motion/registry";
import { ease, galleryLoop } from "@/motion/tokens";
import type { GalleryItem } from "@/types/gallery";

import ComicClip from "./ComicClip";
import GalleryVideo from "./GalleryVideo";

/** Strip heights in rem; widths follow each photo's own ratio. Keep in step
 * with the h-64 / md:h-96 classes below. */
const HEIGHT_REM = { base: 16, md: 24 } as const;

const sizesFor = ({ width, height }: GalleryItem) => {
  const ratio = width / height;
  return `(min-width: 768px) ${Math.round(HEIGHT_REM.md * ratio)}rem, ${Math.round(HEIGHT_REM.base * ratio)}rem`;
};

/** Newest first, whatever order the data is written in. */
const photos = [...galleryItems].sort((a, b) => b.date.localeCompare(a.date));

/** One run of the photos. Rendered twice: the second is the loop's seam. */
function PhotoSet({ clone = false }: { clone?: boolean }) {
  const t = useTranslations("gallery");
  const months = t.raw("months") as string[];
  return (
    <ul
      data-gallery-set=""
      data-loop-clone={clone ? "" : undefined}
      aria-hidden={clone ? "true" : undefined}
      className="flex shrink-0 gap-4 md:gap-6"
    >
      {photos.map((item) => {
        const caption = t(`captions.${item.id}`);
        const month = months[Number(item.date.slice(5, 7)) - 1];
        return (
          <li
            key={item.id}
            data-gallery-item=""
            // The copy is inert, except the comic clip: its sound button must
            // work whichever copy happens to be on screen.
            inert={clone && !item.video?.comic}
            className="shrink-0 snap-start"
          >
            {/* As wide as the photo; the caption wraps inside it. */}
            <figure className="w-min">
              <div
                className={cn(
                  "relative overflow-hidden rounded-lg bg-muted md:h-96",
                  // The comic clip must be seen whole: on a phone the strip's
                  // height would make it wider than the screen, so there it
                  // is as wide as the screen allows (never past its h-64
                  // width) and its height follows.
                  item.video?.comic
                    ? "w-[min(calc(100vw-3rem),28.44rem)] md:w-auto"
                    : "h-64"
                )}
                style={{ aspectRatio: `${item.width} / ${item.height}` }}
              >
                {item.video?.comic ? (
                  <ComicClip
                    src={item.src}
                    poster={item.video.poster}
                    width={item.width}
                    height={item.height}
                    label={caption}
                    clone={clone}
                  />
                ) : item.video ? (
                  <GalleryVideo
                    src={item.src}
                    poster={item.video.poster}
                    width={item.width}
                    height={item.height}
                    label={caption}
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={caption}
                    fill
                    sizes={sizesFor(item)}
                    className="object-cover"
                  />
                )}
              </div>
              <figcaption className="mt-3 flex gap-3 text-sm">
                <time
                  dateTime={item.date.slice(0, 7)}
                  className="shrink-0 whitespace-nowrap tabular-nums text-muted-foreground"
                >
                  {month} {item.date.slice(0, 4)}
                </time>
                <span className="text-foreground">
                  <EmojiText text={caption} />
                </span>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Field notes: an endless strip that drifts on its own — never driven by
 * scroll. GSAP moves the track left by exactly one photo set (measured, so
 * the seam is pixel-exact at every breakpoint) and repeats; the second set
 * is a hidden copy that fills the gap as the first slides out.
 *
 * - Hover glides it to a stop and back; the Pause button (WCAG 2.2.2) does
 *   the same and stays paused until pressed again.
 * - It also rests while off-screen, so nothing animates unseen, and while
 *   the comic clip plays with sound, so the visitor can watch it.
 * - Reduced motion and no-JS: no loop and no copy — the strip is a normal
 *   swipe/keyboard-scrollable row (globals.css), and the button is hidden.
 */
export default function Gallery() {
  const t = useTranslations("gallery");
  const sectionRef = useRef<HTMLElement>(null);
  const loopRef = useRef<ReturnType<typeof gsap.to> | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const viewport = section.querySelector<HTMLElement>("[data-gallery-viewport]");
        const track = section.querySelector<HTMLElement>("[data-gallery-track]");
        const [first, seam] = gsap.utils.toArray<HTMLElement>("[data-gallery-set]", section);
        const shifter = track?.parentElement;
        if (!viewport || !track || !shifter || !first || !seam) return;

        let hovering = false;
        let visible = false;
        // A clip playing with sound holds the strip still (ComicClip).
        let held = false;

        /** The speed it should be heading to right now. */
        const target = () =>
          pausedRef.current || hovering || held || !visible ? 0 : 1;
        const glide = () => {
          const loop = loopRef.current;
          if (!loop) return;
          gsap.to(loop, {
            timeScale: target(),
            duration: galleryLoop.settle,
            ease: ease.inOut,
            overwrite: true,
          });
        };

        const build = () => {
          const progress = loopRef.current?.progress() ?? 0;
          loopRef.current?.kill();
          // The distance from one set to its copy, gap included.
          const distance = seam.offsetLeft - first.offsetLeft;
          const loop = gsap.fromTo(
            track,
            { x: 0 },
            {
              x: -distance,
              duration: distance / galleryLoop.pxPerSecond,
              ease: ease.none,
              repeat: -1,
            }
          );
          loop.progress(progress).timeScale(target());
          loopRef.current = loop;
        };
        build();

        // Photo widths follow the strip height, which changes at md.
        const resize = new ResizeObserver(build);
        resize.observe(first);

        const seen = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          glide();
        });
        seen.observe(viewport);

        const enter = () => {
          hovering = true;
          glide();
        };
        const leave = () => {
          hovering = false;
          glide();
        };
        viewport.addEventListener("pointerenter", enter);
        viewport.addEventListener("pointerleave", leave);

        // Let the Pause button reach the same glide.
        section.addEventListener("gallery:toggle", glide);

        const onHold = (event: Event) => {
          held = (event as CustomEvent<boolean>).detail;
          glide();

          // Nudge the clip fully into the window while it plays, and back
          // after. The nudge is on a wrapper around the track, not the
          // loop's own x: moving the loop's playhead could wrap it, which
          // swaps the copy on screen for the other one mid-play.
          const shift = Number(gsap.getProperty(shifter, "x"));
          let by = -shift;
          if (held) {
            const clip = (event.target as HTMLElement).getBoundingClientRect();
            const frame = viewport.getBoundingClientRect();
            const gutter = parseFloat(getComputedStyle(viewport).paddingLeft);
            const before = frame.left + gutter - clip.left;
            const after = frame.right - gutter - clip.right;
            by = before > 0 ? before : Math.min(after, 0);
          }
          gsap.to(shifter, {
            x: shift + by,
            duration: galleryLoop.settle,
            ease: ease.inOut,
            overwrite: "auto",
          });
        };

        section.addEventListener("gallery:hold", onHold);

        return () => {
          resize.disconnect();
          seen.disconnect();
          viewport.removeEventListener("pointerenter", enter);
          viewport.removeEventListener("pointerleave", leave);
          section.removeEventListener("gallery:toggle", glide);
          section.removeEventListener("gallery:hold", onHold);
          loopRef.current = null;
        };
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const toggle = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    sectionRef.current?.dispatchEvent(new Event("gallery:toggle"));
  };

  return (
    <section ref={sectionRef} id="gallery" className="py-24 md:py-32">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-6">
        <div className="max-w-2xl">
          <h2 className="text-h2 font-semibold">{t("title")}</h2>
          <p className="mt-4 text-lead text-muted-foreground">{t("intro")}</p>
        </div>
        <button
          type="button"
          data-gallery-toggle=""
          aria-pressed={paused}
          onClick={toggle}
          className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-field-border px-5 text-sm font-medium text-foreground hover:border-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
        >
          {paused ? (
            <Play aria-hidden="true" className="size-4" />
          ) : (
            <Pause aria-hidden="true" className="size-4" />
          )}
          {paused ? t("play") : t("pause")}
        </button>
      </div>

      <div
        data-gallery-viewport=""
        role="region"
        aria-label={t("label")}
        // A scroll container with only images inside is unreachable by
        // keyboard; in the static (reduced-motion / no-JS) layout it scrolls.
        tabIndex={0}
        className="relative mt-12 overflow-hidden px-6 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring md:mt-16"
      >
        {/* Edge fades: photos drift in and out instead of being cut. */}
        <span
          aria-hidden="true"
          data-gallery-fade=""
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-background to-transparent"
        />
        <span
          aria-hidden="true"
          data-gallery-fade=""
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-background to-transparent"
        />
        {/* Wrapper: nudged to bring a clip playing with sound into view. */}
        <div className="w-max">
          <div
            data-gallery-track=""
            className="flex w-max gap-4 will-change-transform md:gap-6"
          >
            <PhotoSet />
            <PhotoSet clone />
          </div>
        </div>
      </div>
    </section>
  );
}
