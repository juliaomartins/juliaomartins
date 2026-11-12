"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { projectPrints, type ProjectPrint } from "@/data/project-prints";
import { cn } from "@/lib/utils";

type ProjectItem = {
  name: string;
  description: string;
  tags: string[];
  linkLabel: string;
  href: string;
};

/** Slight tilts for the pinned prints; they straighten and fan out on hover. */
const PRINT_TILT = [
  "-rotate-3 group-hover/prints:-translate-x-1 group-hover/prints:rotate-0",
  "rotate-2 group-hover/prints:rotate-0",
  "-rotate-1 group-hover/prints:translate-x-1 group-hover/prints:rotate-0",
] as const;

/** Photos from the project, pinned to the row like prints on a board.
 * Decorative: the project is described in words beside them. */
function Prints({ prints }: { prints: readonly ProjectPrint[] }) {
  return (
    <div aria-hidden className="group/prints mt-6 inline-flex pl-1">
      {prints.map(({ src }, index) => (
        <span
          key={src}
          className={cn(
            "relative -ml-3 block h-16 w-24 overflow-hidden rounded-sm border-4 border-card bg-muted shadow-md transition-transform duration-(--duration-micro) ease-(--ease-standard) first:ml-0 md:h-20 md:w-28",
            "motion-reduce:transition-none",
            PRINT_TILT[index % PRINT_TILT.length]
          )}
        >
          <Image src={src} alt="" fill sizes="7rem" className="object-cover" />
        </span>
      ))}
    </div>
  );
}

/** Typographic index. No entrance animation — content first. */
export default function Projects() {
  const t = useTranslations("projects");
  const items = t.raw("items") as ProjectItem[];

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 className="text-h2 font-semibold">{t("title")}</h2>

      <ol className="mt-12 border-t border-border">
        {items.map((project, index) => (
          <li
            key={project.href}
            className="group grid gap-4 border-b border-border py-8 md:grid-cols-12 md:gap-8 md:py-10"
          >
            <span
              aria-hidden
              className="text-sm tabular-nums text-muted-foreground md:col-span-1"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="md:col-span-8">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h3>
              <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              {projectPrints[project.href] && (
                <Prints prints={projectPrints[project.href]} />
              )}
            </div>

            <div className="md:col-span-3 md:justify-self-end">
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex min-h-11 items-center gap-2 rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:opacity-70"
              >
                {project.linkLabel}
                <span className="sr-only"> {t("openInNewTab")}</span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
