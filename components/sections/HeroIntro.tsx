"use client";

import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { gsap } from "@/motion/registry";
import { duration, ease, offset, stagger } from "@/motion/tokens";

/**
 * Everything in the hero that changes with the locale. The portrait and the
 * <h1> stay in the server component — they never depend on JavaScript.
 *
 * Motion: one quiet settle on load for the small lines and the buttons — the
 * intro paragraph is the LCP element and is never hidden. Reduced motion keeps
 * the server-rendered final state, which is the designed static layout.
 */
export default function HeroIntro() {
  const t = useTranslations("home");
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-reveal]", {
          autoAlpha: 0,
          y: offset.rise,
          duration: duration.xl,
          ease: ease.out,
          stagger: stagger.each,
          clearProps: "opacity,visibility,transform",
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="mt-4 flex flex-col items-center">
      <p data-reveal className="text-lead font-medium text-signal">
        {t("eyebrow")}
      </p>

      {/*
        The LCP element. Never animated: hiding it until hydration pushed LCP
        to 4.5s on Lighthouse mobile.
      */}
      <p className="mt-6 max-w-xl text-lead text-muted-foreground">
        {t("intro")}
      </p>

      <p data-reveal className="mt-6 text-note text-muted-foreground">
        <span className="font-medium text-foreground">{t("currentLabel")}</span>{" "}
        {t("currentRole")}
      </p>

      <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href="#projects"
          className="press inline-flex min-h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
        >
          {t("primaryCta")}
        </a>
        <a
          href="#contact"
          className="press inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
        >
          {t("secondaryCta")}
        </a>
      </div>
    </div>
  );
}
