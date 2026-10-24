"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useScrollNavbar } from "@/hooks/useScrollNavbar";
import { useThemeBlend } from "@/hooks/useThemeBlend";
import { cn } from "@/lib/utils";

/**
 * Case-study header. The home navbar's links are in-page anchors, so here the
 * way out is explicit: the name goes home, "All projects" goes back to the
 * project list. Theme and language behave exactly as on the home page.
 */
export default function CaseNav() {
  const t = useTranslations();
  const scrolled = useScrollNavbar();
  const navRef = useRef<HTMLElement>(null);
  const toggleTheme = useThemeBlend(navRef);

  return (
    <nav
      ref={navRef}
      aria-label={t("a11y.mainNav")}
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/75 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          aria-label={t("queueCase.home")}
          className="tap-target whitespace-nowrap rounded-sm text-lg font-bold tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background md:text-xl"
        >
          Julião Martins
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/#projects"
            className="press group inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-2 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:opacity-70 sm:px-3"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-x-0.5"
            />
            <span className="sr-only sm:not-sr-only">{t("queueCase.back")}</span>
          </Link>
          <ThemeToggle onToggle={toggleTheme} />
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
