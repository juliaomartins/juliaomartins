"use client";

import { useGSAP } from "@gsap/react";
import { Expand } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState, type CSSProperties, type MouseEvent } from "react";

import { FRAME_RATIO, queueCase, type Frame } from "@/data/queue-case";
import { gsap, ScrollTrigger } from "@/motion/registry";
import { clip, duration, ease, offset, stagger } from "@/motion/tokens";

import Lightbox from "./Lightbox";

/** Literal classes for each FRAME_RATIO, so Tailwind can see them. */
const FRAME: Record<Frame, string> = {
  wide: "aspect-2/1",
  landscape: "aspect-3/2",
  square: "aspect-square",
  portrait: "aspect-4/5",
};

/** The lead photo is Nº 01; the wall carries on from there. */
const FIRST_PLATE = 2;

/**
 * From the floor: the event photographs hung salon-style — rows of mixed
 * frames, each on a mat with its plate number, the way a gallery hangs a
 * series. From md every piece in a row shares one height: its width grows in
 * proportion to its frame's ratio (globals.css), so a portrait and a
 * landscape line up without a gap. Below md they stack. Selecting a photo
 * opens it full-screen (Lightbox).
 *
 * Every photo is a real link to the full image, so without JS it still opens;
 * with JS the click is taken over by the viewer. Modified clicks (new tab)
 * are left alone. Pieces unveil bottom-up in batches as they scroll in.
 */
export default function CaseWall() {
  const t = useTranslations("queueCase");
  const rootRef = useRef<HTMLElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const lastRef = useRef(0);
  const [open, setOpen] = useState<number | null>(null);

  let count = 0;
  const rows = queueCase.wall.map((row) =>
    row.map((photo) => ({
      ...photo,
      caption: t(`photos.${photo.id}`),
      index: count++,
    }))
  );
  const photos = rows.flat();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pieces = gsap.utils.toArray<HTMLElement>(
          "[data-wall-piece]",
          rootRef.current
        );
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
    { scope: rootRef }
  );

  const show = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    lastRef.current = index;
    setOpen(index);
  };

  const close = () => setOpen(null);

  // Back to the photo the visitor opened, even after paging to another.
  const restoreFocus = (event: Event) => {
    event.preventDefault();
    linksRef.current[lastRef.current]?.focus();
  };

  return (
    <section
      ref={rootRef}
      aria-labelledby="wall-title"
      className="mx-auto max-w-7xl px-6 py-24 md:py-32"
    >
      <div className="grid gap-6 border-t border-border pt-10 md:grid-cols-12 md:gap-8">
        <h2 id="wall-title" className="text-h2 font-semibold md:col-span-4">
          {t("wallTitle")}
        </h2>
        <p className="text-lead text-muted-foreground md:col-span-8">
          {t("wallIntro")}
        </p>
      </div>

      <div className="mt-12 space-y-8 md:mt-16 md:space-y-10">
        {rows.map((row) => (
          <ul
            key={row[0].id}
            className="flex flex-col gap-8 md:flex-row md:gap-6 lg:gap-8"
          >
            {row.map((photo) => (
              <li
                key={photo.id}
                data-wall-piece=""
                className="min-w-0"
                style={{ "--ratio": FRAME_RATIO[photo.frame] } as CSSProperties}
              >
                <figure>
                  <a
                    ref={(node) => {
                      linksRef.current[photo.index] = node;
                    }}
                    href={photo.src}
                    onClick={show(photo.index)}
                    className="group press block rounded-sm border border-border bg-card p-(--mat) shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-99"
                  >
                    <div className={`relative overflow-hidden bg-muted ${FRAME[photo.frame]}`}>
                      <Image
                        src={photo.src}
                        alt={photo.caption}
                        fill
                        sizes="(min-width: 80rem) 40rem, (min-width: 48rem) 50vw, calc(100vw - 3rem)"
                        className="object-cover transition-transform duration-(--duration-micro) ease-(--ease-standard) motion-safe:group-hover:scale-103"
                        style={photo.focus ? { objectPosition: photo.focus } : undefined}
                      />
                      <span
                        aria-hidden
                        className="absolute right-2 bottom-2 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-(--duration-micro) group-hover:opacity-100 group-focus-visible:opacity-100"
                      >
                        <Expand className="size-4" />
                      </span>
                    </div>
                  </a>
                  <figcaption className="mt-3 flex gap-3 text-sm">
                    <span className="shrink-0 whitespace-nowrap font-mono tabular-nums text-muted-foreground">
                      Nº {String(photo.index + FIRST_PLATE).padStart(2, "0")}
                    </span>
                    <span className="text-foreground">{photo.caption}</span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <Lightbox
        photos={photos}
        index={open}
        onIndexChange={setOpen}
        onClose={close}
        onCloseAutoFocus={restoreFocus}
        labels={{
          close: t("lightbox.close"),
          previous: t("lightbox.previous"),
          next: t("lightbox.next"),
          counter: (current, total) => t("lightbox.counter", { current, total }),
        }}
      />
    </section>
  );
}
