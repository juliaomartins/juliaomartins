"use client";

import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useRef, type CSSProperties } from "react";

import { skills } from "@/data/skills";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/motion/registry";
import { duration, ease, offset, stagger } from "@/motion/tokens";

const HIDDEN_CLIP = "inset(100% 0% 0% 0%)";
const SHOWN_CLIP = "inset(0% 0% 0% 0%)";

/**
 * A gallery wall rather than a card grid: borderless panels hung in a mosaic.
 * Tiles 0, 3 and 6 span two rows, which packs into exactly 4 rows at three
 * columns and 6 rows at two — a diagonal of tall pieces and no holes.
 *
 * Each piece is unveiled bottom-up (clip-path) as it enters. They are hidden
 * only once JS runs, so no-JS and reduced motion both see the finished wall.
 */
export default function Skills() {
  const t = useTranslations("skills");
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray<HTMLElement>(
          "[data-skill-tile]",
          rootRef.current
        );
        gsap.set(tiles, { clipPath: HIDDEN_CLIP, y: offset.tile });
        ScrollTrigger.batch(tiles, {
          start: "top 80%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              clipPath: SHOWN_CLIP,
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
      id="skills"
      className="mx-auto max-w-6xl px-6 py-24 md:py-32"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <h2 className="text-h2 font-semibold">{t("title")}</h2>
          <p className="mt-6 max-w-2xl text-lead text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <p className="lg:col-span-4 lg:text-right">
          <span className="block text-count font-semibold tabular-nums text-signal">
            {String(skills.length).padStart(2, "0")}
          </span>
          <span className="mt-3 block text-sm text-muted-foreground">
            {t("countCaption")}
          </span>
        </p>
      </div>

      <ul className="mt-14 grid auto-rows-tile grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {skills.map((skill, index) => {
          const tall = index % 3 === 0;
          const Icon = skill.icon;
          return (
            <li
              key={skill.key}
              data-skill-tile=""
              style={
                skill.brand
                  ? ({ "--brand": skill.brand } as CSSProperties)
                  : undefined
              }
              className={cn(
                "group flex flex-col rounded-lg bg-muted p-5 md:p-6",
                tall && "row-span-2"
              )}
            >
              {/* The name is in the caption; the mark is decoration. */}
              <span
                aria-hidden
                className="grid flex-1 place-items-center text-foreground transition-colors duration-(--duration-micro) group-hover:text-(--brand)"
              >
                <Icon
                  className={cn(
                    skill.wordmark
                      ? tall
                        ? "h-10 w-auto md:h-14"
                        : "h-6 w-auto md:h-9"
                      : tall
                        ? "size-14 md:size-20"
                        : "size-8 md:size-11"
                  )}
                />
              </span>
              <div>
                <p className="font-medium text-foreground">{skill.name}</p>
                <p className="text-sm text-foreground/70">
                  {t(`labels.${skill.key}`)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
