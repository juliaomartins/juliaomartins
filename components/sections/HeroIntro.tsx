"use client";

import { useTranslations } from "next-intl";

/**
 * The text side of the hero. Left-aligned and typographic: the name is the
 * display element, set across two lines.
 *
 * Deliberately static. An entrance here had to hide content that the server
 * already painted, so on slow phones the buttons appeared, vanished at
 * hydration and faded back in — and the intro paragraph is the LCP element.
 */
export default function HeroIntro({
  first,
  last,
}: {
  first: string;
  last: string;
}) {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col items-start">
      <p className="text-lead font-medium text-signal">{t("eyebrow")}</p>

      <h1 className="mt-4 text-display font-semibold text-foreground">
        <span className="block">{first}</span>{" "}
        <span className="block">{last}</span>
      </h1>

      <p className="mt-8 max-w-xl text-lead text-muted-foreground">
        {t("intro")}
      </p>

      <p className="mt-6 text-note text-muted-foreground">
        <span className="font-medium text-foreground">{t("currentLabel")}</span>{" "}
        {t("currentRole")}
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href="#projects"
          className="press inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
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
