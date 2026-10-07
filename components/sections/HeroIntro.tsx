"use client";

import { useTranslations } from "next-intl";

/**
 * Everything in the hero that changes with the locale. The portrait and the
 * <h1> stay in the server component — they never depend on JavaScript.
 *
 * Deliberately static. An entrance here had to hide content that the server
 * already painted, so on slow phones the buttons appeared, vanished at
 * hydration and faded back in — and the intro paragraph is the LCP element.
 */
export default function HeroIntro() {
  const t = useTranslations("home");

  return (
    <div className="mt-4 flex flex-col items-center">
      <p className="text-lead font-medium text-signal">{t("eyebrow")}</p>

      <p className="mt-6 max-w-xl text-lead text-muted-foreground">
        {t("intro")}
      </p>

      <p className="mt-6 text-note text-muted-foreground">
        <span className="font-medium text-foreground">{t("currentLabel")}</span>{" "}
        {t("currentRole")}
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
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
