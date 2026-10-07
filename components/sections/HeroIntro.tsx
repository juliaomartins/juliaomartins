"use client";

import { ArrowDown, Mail } from "lucide-react";
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
        {/* Primary: scrolls down to the work, so the arrow points down. */}
        <a
          href="#projects"
          className="group press inline-flex min-h-11 items-center gap-2 rounded-full bg-primary pl-6 pr-5 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
        >
          {t("primaryCta")}
          <ArrowDown
            aria-hidden="true"
            className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:translate-y-0.5"
          />
        </a>
        {/*
          Secondary. Its outline uses the form-control boundary token (3.12:1
          light, 3.51:1 dark) — the plain border token was 1.19:1, so the
          button barely read as one. Hover darkens the outline and fills it.
        */}
        <a
          href="#contact"
          className="group press inline-flex min-h-11 items-center gap-2 rounded-full border border-field-border pl-5 pr-6 text-sm font-medium text-foreground hover:border-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
        >
          <Mail
            aria-hidden="true"
            className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-px"
          />
          {t("secondaryCta")}
        </a>
      </div>
    </div>
  );
}
