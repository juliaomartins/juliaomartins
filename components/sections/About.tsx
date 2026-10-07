"use client";

import { useTranslations } from "next-intl";

import Roadmap from "./Roadmap";

export default function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 className="text-h2 font-semibold">{t("title")}</h2>

      <div className="mt-8 grid max-w-3xl gap-5 text-lead text-muted-foreground">
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2")}</p>
      </div>

      <Roadmap />
    </section>
  );
}
