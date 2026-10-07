"use client";

import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, type CSSProperties } from "react";

import { skills, type Skill } from "@/data/skills";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/motion/registry";
import { duration, ease, offset, stagger } from "@/motion/tokens";

import CircleStamp from "@/components/ui/CircleStamp";

const HIDDEN_CLIP = "inset(100% 0% 0% 0%)";
const SHOWN_CLIP = "inset(0% 0% 0% 0%)";

/**
 * Below md the wall packs two columns: one tall piece then two short ones
 * fill exactly two rows, so tall pieces sit at every third index. Only whole
 * groups of three get a tall piece — a leftover pair then fills the last row
 * evenly instead of leaving a hole.
 */
const tallOnPhone = (index: number) =>
  index % 3 === 0 && index < Math.floor(skills.length / 3) * 3;

/** Wordmarks are sized by height only; square glyphs by both sides. */
function iconSize({ wordmark, feature }: Skill): string {
  if (wordmark) return "h-6 w-auto md:h-7";
  return feature ? "size-12 md:size-16" : "size-8 md:size-9";
}

/**
 * Laid out like the artist's wall in the reference: copy on the left, a
 * mosaic of brand-coloured pieces in the centre, the count, a stamp and a
 * statement on the right. Three columns from xl; from md the copy and the
 * count sit side by side above a full-width mosaic; below md everything
 * stacks and the mosaic packs two columns.
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
      className="mx-auto max-w-7xl px-6 py-24 md:py-32"
    >
      <h2 className="text-center text-h2 font-semibold">{t("title")}</h2>

      {/*
        From xl the wall is much taller than the copy beside it, so the copy
        and the count stay pinned in view while the wall scrolls past.
      */}
      <div className="mt-12 grid gap-12 md:grid-cols-2 xl:mt-16 xl:grid-cols-12 xl:items-start xl:gap-10">
        {/* Left: the copy and the way on. */}
        <div data-skills-intro="" className="relative xl:sticky xl:top-28 xl:col-span-3">
          {/* Two strokes of light, as in the reference. */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="absolute -left-1 -top-6 size-6 text-signal"
          >
            <path
              d="M4 14 L13 18 M12 3 L16 11"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <p className="leading-relaxed text-muted-foreground">
            {t("description")}
          </p>
          <a
            href="#projects"
            data-skills-cta=""
            className="group press mt-8 inline-flex min-h-11 items-center gap-3 rounded-full font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {t("cta")}
            <span
              aria-hidden
              className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition-transform duration-(--duration-micro) motion-safe:group-hover:translate-x-1"
            >
              <ArrowRight className="size-5" />
            </span>
          </a>
        </div>

        {/* Centre: the wall. */}
        <ul className="grid auto-rows-tile grid-cols-2 gap-2 md:col-span-2 md:auto-rows-mosaic md:grid-cols-14 md:gap-2.5 xl:col-span-6">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <li
                key={skill.key}
                data-skill-tile=""
                style={
                  {
                    "--tile-bg": skill.bg,
                    "--tile-fg": skill.fg,
                    "--col": `${skill.col[0]} / span ${skill.col[1]}`,
                    "--row": `${skill.row[0]} / span ${skill.row[1]}`,
                  } as CSSProperties
                }
                className={cn(
                  "flex flex-col gap-2 rounded-md bg-(--tile-bg) p-3 text-(--tile-fg) ring-1 ring-border",
                  tallOnPhone(index) && "row-span-2"
                )}
              >
                {/* The name is the caption; the mark is decoration. */}
                <span aria-hidden className="grid flex-1 place-items-center">
                  <Icon className={iconSize(skill)} />
                </span>
                <span
                  data-skill-name=""
                  className="text-sm font-medium leading-tight"
                >
                  {skill.name}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Right: the count, the stamp and the statement. */}
        <div
          data-skills-aside=""
          className="flex flex-col items-start gap-8 md:col-start-2 md:row-start-1 md:items-end md:text-right xl:sticky xl:top-28 xl:col-span-3 xl:col-start-auto xl:row-start-auto"
        >
          <p>
            <span className="block text-count font-semibold tabular-nums text-signal">
              {String(skills.length).padStart(2, "0")}
            </span>
            <span className="mt-3 block text-sm text-muted-foreground">
              {t("countCaption")}
            </span>
          </p>
          <CircleStamp text={t("badge")} thread className="w-28" />
          <p className="max-w-56 text-h2 font-semibold">
            {t("statementLead")}{" "}
            <span className="text-signal">{t("statementAccent")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
