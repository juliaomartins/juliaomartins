"use client";

import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SiGithub } from "react-icons/si";

import { queueCase } from "@/data/queue-case";

/** The way out: the source on GitHub, or back to the other projects. */
export default function CaseExit() {
  const t = useTranslations();

  return (
    <section
      aria-labelledby="exit-title"
      className="mx-auto max-w-7xl px-6 pb-24 md:pb-32"
    >
      <div className="grid gap-8 border-t border-border pt-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <h2 id="exit-title" className="text-h2 font-semibold">
            {t("queueCase.exitTitle")}
          </h2>
          <p className="mt-4 max-w-xl text-lead text-muted-foreground">
            {t("queueCase.exitBody")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
          <a
            href={queueCase.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="group press inline-flex min-h-11 items-center gap-2 rounded-full bg-primary pl-5 pr-6 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
          >
            <SiGithub aria-hidden className="size-4" />
            {t("queueCase.code")}
            <span className="sr-only"> {t("projects.openInNewTab")}</span>
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            />
          </a>
          <Link
            href="/#projects"
            className="group press inline-flex min-h-11 items-center gap-2 rounded-full border border-field-border pl-5 pr-6 text-sm font-medium text-foreground hover:border-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-x-0.5"
            />
            {t("queueCase.backHome")}
          </Link>
        </div>
      </div>
    </section>
  );
}
