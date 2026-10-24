"use client";

import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, type CSSProperties } from "react";

import { queueCase } from "@/data/queue-case";
import { gsap } from "@/motion/registry";
import { duration, ease, offset, settle, stagger } from "@/motion/tokens";

type LabelItem = { term: string; detail: string };

/**
 * The entrance: case title, the museum-style wall label, the lead photo and
 * the problem it answered.
 *
 * Above the fold, so the hidden start state comes from CSS (globals.css,
 * keyed on the head probe's data-motion) rather than a gsap.set after
 * hydration, which would flash the text before hiding it. The lead photo is
 * never hidden — it is the LCP — it only settles from slightly larger.
 */
export default function CaseIntro() {
  const t = useTranslations("queueCase");
  const rootRef = useRef<HTMLElement>(null);
  const label = t.raw("label.items") as LabelItem[];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: ease.out, duration: duration.xl },
        });
        // Opacity is left inline at 1: clearing it would hand the element
        // back to the CSS start state.
        tl.fromTo(
          "[data-case-rise]",
          { y: offset.rise },
          { autoAlpha: 1, y: 0, stagger: stagger.each, clearProps: "transform" }
        ).to("[data-case-settle]", { "--settle": 1 }, 0);
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      aria-labelledby="case-title"
      className="mx-auto max-w-7xl px-6 pt-32 md:pt-40"
    >
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-8">
          <p
            data-case-rise=""
            className="text-eyebrow font-medium uppercase text-signal"
          >
            {t("eyebrow")}
          </p>
          <h1
            id="case-title"
            data-case-rise=""
            className="mt-5 text-display font-semibold text-balance text-foreground"
          >
            {t("title")}
          </h1>
          <p
            data-case-rise=""
            className="mt-8 max-w-2xl text-lead text-muted-foreground"
          >
            {t("lede")}
          </p>
        </div>

        {/* The wall label beside a work in a gallery: what, where, when, made of what. */}
        <aside
          data-case-rise=""
          aria-labelledby="case-label"
          className="self-end md:col-span-4"
        >
          <div className="rounded-sm border border-border bg-card p-5 shadow-sm">
            <p
              id="case-label"
              className="text-eyebrow font-medium uppercase text-muted-foreground"
            >
              {t("label.title")}
            </p>
            <dl className="mt-3 divide-y divide-border text-sm">
              {label.map((item) => (
                <div key={item.term} className="grid grid-cols-3 gap-3 py-2.5">
                  <dt className="text-muted-foreground">{item.term}</dt>
                  <dd className="col-span-2 text-foreground">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>

      <figure className="mt-14 md:mt-20">
        <div className="relative aspect-3/2 overflow-hidden rounded-lg bg-muted md:aspect-video">
          <div
            data-case-settle=""
            className="absolute inset-0"
            style={{ "--settle": settle.scale } as CSSProperties}
          >
            <Image
              src={queueCase.lead.src}
              alt={t("leadAlt")}
              fill
              preload
              sizes="(min-width: 80rem) 77rem, calc(100vw - 3rem)"
              className="object-cover"
              // The 16:9 frame trims a 3:2 photo top and bottom; keep the screen and faces.
              style={{ objectPosition: "50% 40%" }}
            />
          </div>
        </div>
        <figcaption className="mt-3 flex gap-3 text-sm">
          <span className="shrink-0 whitespace-nowrap font-mono tabular-nums text-muted-foreground">Nº 01</span>
          <span className="text-foreground">{t("leadCaption")}</span>
        </figcaption>
      </figure>

      <div className="mt-24 grid gap-6 border-t border-border pt-10 md:mt-32 md:grid-cols-12 md:gap-8">
        <h2 className="text-h2 font-semibold md:col-span-4">{t("problemTitle")}</h2>
        <p className="text-lead text-foreground md:col-span-8">{t("problem")}</p>
      </div>
    </section>
  );
}
