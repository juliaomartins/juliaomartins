"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { queueCase } from "@/data/queue-case";
import { cn } from "@/lib/utils";

type Props = {
  /** Short station names, I to IV, from messages queueCase.steps[].short. */
  stations: readonly string[];
  numerals: readonly string[];
};

/** Arrow into the next station across the grid gap (lg only, decorative). */
function Across() {
  return (
    <ArrowRight
      aria-hidden
      className="absolute top-1/2 -right-8.5 hidden size-5 -translate-y-1/2 text-muted-foreground lg:block"
    />
  );
}

/** Arrow to the next station in the stacked layout (below lg, decorative). */
function Down() {
  return (
    <ArrowDown
      aria-hidden
      className="mx-auto size-5 text-muted-foreground lg:hidden"
    />
  );
}

function Station({
  plate,
  numeral,
  children,
  className,
}: {
  plate: number;
  numeral: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={`#plate-${plate}`}
      data-case-reveal=""
      className={cn(
        "group/station press relative flex flex-col rounded-lg border border-border bg-card p-5 shadow-sm hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-99",
        className
      )}
    >
      <span className="font-mono text-h2 font-semibold text-signal">{numeral}</span>
      <span className="mt-2 font-medium text-foreground">{children}</span>
    </a>
  );
}

/**
 * The route at the door, drawn as the event ran it: a new visitor is
 * registered at the desk (I) and gets a QR ID card (II); a visitor already in
 * the system skips both. The two paths meet at the scan (III) and end at the
 * welcome on the lobby screen (IV). Each station links to its plate below.
 *
 * From lg it is a two-lane map whose lanes merge into III and IV; below lg
 * the same stations stack in reading order with the shortcut between II and
 * III. Arrows are decoration — the order is carried by the DOM.
 */
export default function RouteMap({ stations, numerals }: Props) {
  const t = useTranslations("queueCase.flow");

  return (
    <nav
      aria-label={t("label")}
      className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-4 lg:grid-rows-2 lg:gap-x-12 lg:gap-y-6"
    >
      <Station plate={1} numeral={numerals[0]} className="lg:col-start-1 lg:row-start-1">
        <span className="mb-1 block text-eyebrow font-medium uppercase text-muted-foreground">
          {t("newVisitor")}
        </span>
        {stations[0]}
        <Across />
      </Station>
      <Down />
      <Station plate={2} numeral={numerals[1]} className="lg:col-start-2 lg:row-start-1">
        {stations[1]}
        <Across />
      </Station>
      <Down />

      {/* The shortcut for visitors who registered before the event. */}
      <a
        href="#plate-3"
        data-case-reveal=""
        className="press relative flex items-center gap-4 rounded-lg border border-dashed border-field-border p-5 hover:border-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-99 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:border-0 lg:px-0"
      >
        <span className="shrink-0">
          <span className="block font-medium text-foreground">{t("registered")}</span>
          <span className="block text-muted-foreground">{t("bypass")}</span>
        </span>
        {/* The lane itself: a dashed line running past I and II. */}
        <span
          aria-hidden
          className="hidden flex-1 border-t-2 border-dashed border-field-border lg:block"
        />
        <Across />
      </a>
      <Down />

      <Station
        plate={3}
        numeral={numerals[2]}
        className="lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:justify-center"
      >
        {stations[2]}
        <Across />
      </Station>
      <Down />

      {/* The destination, shown as the lobby screen itself. */}
      <a
        href="#plate-4"
        data-case-reveal=""
        className="group press relative isolate flex min-h-48 flex-col justify-end overflow-hidden rounded-lg bg-black p-5 text-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-99 lg:col-start-4 lg:row-span-2 lg:row-start-1"
      >
        <Image
          src={queueCase.steps[3].poster}
          alt=""
          fill
          sizes="(min-width: 64rem) 18rem, calc(100vw - 3rem)"
          className="-z-10 object-cover opacity-70 transition-opacity duration-(--duration-micro) group-hover:opacity-90"
          // The portrait clip's screen sits in its upper third.
          style={{ objectPosition: "50% 22%" }}
        />
        <span aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/60 to-transparent" />
        <span className="font-mono text-h2 font-semibold text-white">{numerals[3]}</span>
        <span className="mt-2 font-medium">{stations[3]}</span>
      </a>
    </nav>
  );
}
