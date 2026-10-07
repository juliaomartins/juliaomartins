"use client";

import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { cn } from "@/lib/utils";
import { gsap } from "@/motion/registry";
import { duration, ease, offset, position, stagger } from "@/motion/tokens";
import type { TimelineItem } from "@/types/timeline";

/**
 * One hairline, three stops. Horizontal from md, vertical below.
 * The rule draws once on entry and the stops settle after it. Reduced motion
 * and no-JS both get the server-rendered final state.
 */
export default function Roadmap() {
  const t = useTranslations("about");
  const items = t.raw("timeline") as TimelineItem[];
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          narrow:
            "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { wide } = context.conditions as {
            wide: boolean;
            narrow: boolean;
          };
          const tl = gsap.timeline({
            defaults: { ease: ease.out, duration: duration.xl },
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top 80%",
              once: true,
            },
          });

          tl.from("[data-roadmap-rule]", {
            ...(wide
              ? { scaleX: 0, transformOrigin: "left center" }
              : { scaleY: 0, transformOrigin: "center top" }),
            clearProps: "transform",
          }).from(
            "[data-roadmap-stop]",
            {
              autoAlpha: 0,
              y: offset.rise,
              stagger: stagger.each,
              clearProps: "opacity,visibility,transform",
            },
            position.follow
          );
        }
      );
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="mt-20">
      <h3 className="text-sm font-medium text-foreground">
        {t("roadmapTitle")}
      </h3>

      <div className="relative mt-10">
        <span
          data-roadmap-rule=""
          aria-hidden
          className="absolute bottom-0 left-1.75 top-0 w-px bg-border md:bottom-auto md:left-0 md:right-0 md:top-1.75 md:h-px md:w-auto"
        />

        <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
          {items.map((item) => (
            <li
              key={item.year}
              data-roadmap-stop=""
              className="relative pl-10 md:pl-0 md:pt-10"
            >
              <span
                aria-hidden
                className={cn(
                  // Mobile: centred on the year line. md+: centred on the rule.
                  "absolute left-0 top-2.5 size-3.5 rounded-full border-2 md:top-0",
                  item.status === "next"
                    ? "border-signal bg-background"
                    : "border-foreground bg-foreground",
                  item.status === "current" && "ring-4 ring-signal/30"
                )}
              />
              <p
                className={cn(
                  "text-h2 font-semibold tabular-nums",
                  item.status === "next" && "text-signal"
                )}
              >
                {item.year}
              </p>
              <h4 className="mt-3 font-medium text-foreground">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.company}</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
