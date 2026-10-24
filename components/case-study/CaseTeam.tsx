"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { queueCase } from "@/data/queue-case";
import { useClipReveal } from "@/hooks/useClipReveal";

type Credit = { term: string; detail: string };
type TeamPhoto = { label: string; caption: string };

/**
 * Behind the scenes: the exhibition's credits. The team that built and ran
 * the system, set on an inverted panel so it reads as the closing wall — the
 * statement and credits on one side (held in view on large screens while the
 * photos pass), the work-in-progress and mission-complete photos on the other.
 */
export default function CaseTeam() {
  const t = useTranslations("queueCase.team");
  const tp = useTranslations("projects");
  const rootRef = useRef<HTMLElement>(null);
  const credits = t.raw("credits") as Credit[];
  const { team } = queueCase;

  useClipReveal(rootRef, "[data-team-photo]");

  // The finale first: the mission-complete photo, then the work behind it.
  const photos = [...team.photos].reverse();

  return (
    <section
      ref={rootRef}
      aria-labelledby="team-title"
      className="mx-auto max-w-7xl px-6 pb-24 md:pb-32"
    >
      <div className="rounded-2xl bg-foreground p-6 text-background md:p-10 lg:p-14">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <p className="text-eyebrow font-medium uppercase text-background/70">
              {t("eyebrow")}
            </p>
            <h2
              id="team-title"
              className="mt-5 text-display font-semibold text-balance"
            >
              {t("title")}
            </h2>
            <p className="mt-6 text-lead text-background/75">{t("body")}</p>

            <dl className="mt-8 divide-y divide-background/15 border-y border-background/15 text-sm">
              {credits.map((item) => (
                <div key={item.term} className="grid grid-cols-3 gap-3 py-3">
                  <dt className="text-background/65">{item.term}</dt>
                  <dd className="col-span-2">{item.detail}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={team.site}
                target="_blank"
                rel="noopener noreferrer"
                className="group press inline-flex min-h-11 items-center gap-2 rounded-full bg-background pl-5 pr-4 text-sm font-medium text-foreground hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
              >
                {t("site")}
                <span className="sr-only"> {tp("openInNewTab")}</span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </a>
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group press inline-flex min-h-11 items-center gap-2 rounded-full border border-background/40 pl-5 pr-4 text-sm font-medium hover:border-background hover:bg-background/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
              >
                {t("website")}
                <span className="sr-only"> {tp("openInNewTab")}</span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </div>

          <div className="grid gap-10 lg:col-span-7">
            {photos.map((photo) => {
              const copy = t.raw(`photos.${photo.id}`) as TeamPhoto;
              return (
                <figure key={photo.id} data-team-photo="">
                  <div className="relative aspect-3/2 overflow-hidden rounded-lg bg-background/10">
                    <Image
                      src={photo.src}
                      alt={copy.caption}
                      fill
                      sizes="(min-width: 80rem) 42rem, (min-width: 64rem) 52vw, calc(100vw - 6rem)"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-sm">
                    <span className="block font-mono uppercase tracking-wide text-background/65">
                      {copy.label}
                    </span>
                    <span className="mt-1 block">{copy.caption}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
