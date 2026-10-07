"use client";

import { useGSAP } from "@gsap/react";
import { TimelineItem } from "@/types/timeline";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { gsap } from "@/motion/registry";
import { duration, ease, stagger } from "@/motion/tokens";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

/**
 * Per-pin color palette inspired by the reference infographic.
 * Cycled by index so adding more timeline entries Just Works.
 */
const PIN_COLORS = [
  "#EC4899", // pink
  "#F97316", // orange
  "#EF4444", // red
  "#84CC16", // lime
  "#0EA5E9", // sky
  "#F59E0B", // amber
] as const;

const getPinColor = (index: number) =>
  PIN_COLORS[index % PIN_COLORS.length];

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const t = useTranslations();
  const tAbout = useTranslations("about");
  const timeline = tAbout.raw("timeline") as TimelineItem[];

  useGSAP(
    () => {
      const root = sectionRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as
            | { full: boolean; reduced: boolean }
            | undefined;

          // Reduced-motion branch: the timeline is meaningful content, so the
          // designed static state is simply the finished state — cards, pins
          // and rails fully visible, exactly where the animation would have
          // left them. Nothing to undo, because nothing is ever hidden by CSS.
          if (!conditions?.full) return;

          const cards = root.querySelectorAll<HTMLElement>(".timeline-card");
          const lines = root.querySelectorAll<HTMLElement>(".timeline-line");
          const bases = root.querySelectorAll<HTMLElement>(".timeline-base");
          if (cards.length === 0) return;

          const tl = gsap.timeline({
            defaults: {
              ease: ease.out,
              // Don't pre-apply the FROM state on mount: React Strict Mode's
              // double-mount plus `once: true` could otherwise leave cards
              // stuck at opacity 0 if the trigger already passed.
              immediateRender: false,
            },
            scrollTrigger: { trigger: root, start: "top 80%", once: true },
          });

          tl.from(cards, {
            opacity: 0,
            y: 50,
            duration: duration.xl,
            stagger: stagger.each,
            clearProps: "opacity,transform",
          });

          if (lines.length) {
            tl.from(
              lines,
              {
                scaleY: 0,
                transformOrigin: "top center",
                duration: duration.lg,
                stagger: stagger.each,
                clearProps: "transform",
              },
              "-=0.55"
            );
          }

          if (bases.length) {
            tl.from(
              bases,
              {
                opacity: 0,
                scale: 0.4,
                duration: duration.md,
                stagger: stagger.each,
                ease: "back.out(1.8)",
                clearProps: "opacity,transform",
              },
              "-=0.35"
            );
          }
        }
      );

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen max-w-6xl mx-auto px-6 py-24"
    >
      <h2 className="text-3xl font-bold mb-6">{t("about.title")}</h2>

      <p className="text-muted-foreground mb-16 max-w-3xl leading-relaxed">
        {t("about.paragraph1")}
      </p>

      {/* ========== MOBILE: vertical color-rail timeline ========== */}
      <div className="md:hidden relative">
        {/* Rainbow rail */}
        <div
          aria-hidden
          className="absolute left-[14px] top-2 bottom-2 w-[2px] rounded-full
                     bg-gradient-to-b from-pink-500 via-amber-400 to-sky-500
                     opacity-80"
        />

        <ol className="flex flex-col gap-8">
          {timeline.map((item, index) => {
            const color = getPinColor(index);
            return (
              <li key={`m-${index}`} className="relative pl-12 timeline-card">
                {/* Dot */}
                <span
                  aria-hidden
                  className="absolute left-[5px] top-3 grid place-items-center"
                >
                  <span
                    className="block h-5 w-5 rounded-full ring-[3px] ring-background"
                    style={{
                      background: color,
                      boxShadow: `0 0 0 4px ${color}33, 0 0 18px ${color}66`,
                    }}
                  />
                </span>

                <Card
                  className="border-l-4 backdrop-blur transition-all duration-300
                             hover:-translate-y-1 hover:shadow-lg"
                  style={{ borderLeftColor: color }}
                >
                  <CardHeader className="space-y-1">
                    <p
                      className="text-2xl font-extrabold tracking-tight"
                      style={{ color }}
                    >
                      {item.year}
                    </p>
                    <p
                      className="text-[11px] font-bold uppercase tracking-[0.2em]"
                      style={{ color }}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {item.company}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ========== DESKTOP: perspective road with vertical pins ========== */}
      <div className="hidden md:block relative pt-4">
        {/* Pin row — alternating heights via top spacers */}
        <div className="relative flex items-stretch justify-around gap-6 min-h-[460px]">
          {timeline.map((item, index) => {
            const color = getPinColor(index);
            const isTall = index % 2 === 0;

            return (
              <div
                key={`d-${index}`}
                className="group relative flex flex-1 max-w-sm flex-col items-center"
              >
                {/* Top spacer to alternate card height */}
                <div
                  aria-hidden
                  style={{ height: isTall ? 0 : 110 }}
                  className="shrink-0 transition-all"
                />

                {/* Card */}
                <Card
                  className="timeline-card relative z-20 w-full rounded-2xl
                             border border-border bg-background
                             shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)]
                             dark:shadow-[0_14px_36px_-12px_rgba(0,0,0,0.6)]
                             border-t-4 transition-all duration-300
                             group-hover:-translate-y-2
                             group-hover:shadow-[0_28px_50px_-18px_rgba(15,23,42,0.45)]
                             dark:group-hover:shadow-[0_30px_55px_-18px_rgba(0,0,0,0.75)]"
                  style={{ borderTopColor: color }}
                >
                  <CardHeader className="space-y-1 pb-2">
                    <p
                      className="text-3xl font-extrabold tracking-tight leading-none"
                      style={{ color }}
                    >
                      {item.year}
                    </p>
                    <p
                      className="text-xs font-bold uppercase tracking-[0.22em]"
                      style={{ color }}
                    >
                      {item.title}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {item.company}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Vertical pin line — fills space between card and road */}
                <div
                  aria-hidden
                  className="timeline-line w-[2px] flex-1 rounded-full origin-top"
                  style={{
                    background: `linear-gradient(to bottom, ${color}, ${color}55)`,
                    boxShadow: `0 0 14px ${color}55`,
                    minHeight: "32px",
                  }}
                />

                {/* Pin head sitting on the road */}
                <div
                  aria-hidden
                  className="timeline-base relative flex flex-col items-center"
                >
                  <div
                    className="h-3 w-3 rounded-full -mb-[5px]"
                    style={{
                      background: color,
                      boxShadow: `0 0 12px ${color}aa`,
                    }}
                  />
                  <div
                    className="h-2 w-12 rounded-full"
                    style={{
                      background: `radial-gradient(ellipse at center, ${color} 0%, ${color}80 60%, transparent 100%)`,
                      boxShadow: `0 0 18px ${color}66, 0 6px 14px ${color}33`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ==== THE ROAD — visible highway under the pins ==== */}
        <div className="relative -mt-10 z-0" aria-hidden>
          <div className="relative mx-auto max-w-5xl px-2">
            {/* Cast shadow under the road */}
            <div
              className="absolute inset-x-[8%] top-9 h-14 rounded-[100%]
                         bg-slate-900/25 blur-2xl
                         dark:bg-black/60"
            />

            {/* Road body — capsule with gradient surface and inset shadows */}
            <div
              className="relative h-16 rounded-full overflow-hidden
                         bg-linear-to-b from-slate-200 via-slate-300 to-slate-400
                         dark:from-slate-700 dark:via-slate-800 dark:to-slate-950
                         shadow-[inset_0_2px_3px_rgba(255,255,255,0.7),inset_0_-4px_8px_rgba(15,23,42,0.28),0_10px_28px_-8px_rgba(15,23,42,0.25)]
                         dark:shadow-[inset_0_2px_3px_rgba(255,255,255,0.12),inset_0_-4px_8px_rgba(0,0,0,0.65),0_14px_32px_-8px_rgba(0,0,0,0.55)]"
            >
              {/* Top rim highlight — the lit edge of the asphalt */}
              <div
                className="absolute left-[5%] right-[5%] top-[6px] h-px
                           bg-linear-to-r from-transparent via-white/85 to-transparent
                           dark:via-white/35"
              />

              {/* Dashed center lane line */}
              <div
                className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[3px] rounded-full opacity-80 dark:opacity-65"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to right, rgb(255 255 255) 0 30px, transparent 30px 54px)",
                }}
              />

              {/* Bottom dark line for added depth */}
              <div
                className="absolute left-[5%] right-[5%] bottom-[5px] h-px
                           bg-linear-to-r from-transparent via-black/35 to-transparent
                           dark:via-black/70"
              />
            </div>

            {/* Side fades — blend the road into the section background */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-linear-to-r from-background via-background/80 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-linear-to-l from-background via-background/80 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
