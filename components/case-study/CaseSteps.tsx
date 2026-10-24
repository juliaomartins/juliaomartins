"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import GalleryVideo from "@/components/sections/GalleryVideo";
import { queueCase } from "@/data/queue-case";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/motion/registry";
import { clip, duration, ease, offset, stagger } from "@/motion/tokens";

type Step = { title: string; body: string; alt: string; caption: string };

const NUMERALS = ["I", "II", "III", "IV"] as const;

/**
 * How it worked: four plates, I to IV, alternating sides from md. The last is
 * the footage from the lobby — a scan, then the welcome on screen.
 *
 * Each piece is unveiled bottom-up as it enters, like the skills wall. Hidden
 * only once JS runs, so no-JS and reduced motion see every plate at rest.
 */
export default function CaseSteps() {
  const t = useTranslations("queueCase");
  const rootRef = useRef<HTMLElement>(null);
  const steps = t.raw("steps") as Step[];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const pieces = gsap.utils.toArray<HTMLElement>(
          "[data-case-reveal]",
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

  return (
    <section
      ref={rootRef}
      aria-labelledby="steps-title"
      className="mx-auto max-w-7xl px-6 py-24 md:py-32"
    >
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <h2 id="steps-title" className="text-h2 font-semibold md:col-span-4">
          {t("stepsTitle")}
        </h2>
        <p className="text-lead text-muted-foreground md:col-span-8">
          {t("stepsIntro")}
        </p>
      </div>

      <ol className="mt-16 space-y-20 md:mt-24 md:space-y-32">
        {steps.map((step, index) => {
          const media = queueCase.steps[index];
          const flipped = index % 2 === 1;
          return (
            <li
              key={step.title}
              className="grid items-center gap-8 md:grid-cols-12 md:gap-12"
            >
              <div
                data-case-reveal=""
                className={cn("md:col-span-5", flipped && "md:order-2")}
              >
                <span
                  aria-hidden
                  className="block font-mono font-semibold text-count text-signal"
                >
                  {NUMERALS[index]}
                </span>
                <h3 className="mt-6 text-h2 font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md text-lead text-muted-foreground">
                  {step.body}
                </p>
              </div>

              <figure
                data-case-reveal=""
                className={cn("md:col-span-7", flipped && "md:order-1")}
              >
                {media.kind === "video" ? (
                  // Phone footage, framed as the phone that shot it.
                  <div className="relative mx-auto aspect-9/16 w-full max-w-xs overflow-hidden rounded-3xl border-4 border-foreground bg-muted shadow-xl">
                    <GalleryVideo
                      src={media.src}
                      poster={media.poster}
                      width={media.width}
                      height={media.height}
                      label={step.alt}
                    />
                  </div>
                ) : (
                  <div className="relative aspect-3/2 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={media.src}
                      alt={step.alt}
                      fill
                      sizes="(min-width: 80rem) 44rem, (min-width: 48rem) 56vw, calc(100vw - 3rem)"
                      className="object-cover"
                    />
                  </div>
                )}
                <figcaption
                  className={cn(
                    "mt-3 flex gap-3 text-sm",
                    media.kind === "video" && "justify-center"
                  )}
                >
                  <span className="shrink-0 whitespace-nowrap font-mono tabular-nums text-muted-foreground">
                    {NUMERALS[index]}
                  </span>
                  <span className="text-foreground">{step.caption}</span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
