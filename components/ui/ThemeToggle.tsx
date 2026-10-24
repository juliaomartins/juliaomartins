"use client";

import { MoonStar, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

import { Button } from "./button";

/** Light/dark switch. The blend itself lives in useThemeBlend. */
export default function ThemeToggle({
  onToggle,
  className,
}: {
  onToggle: () => void;
  className?: string;
}) {
  const t = useTranslations();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onToggle}
      aria-label={t("a11y.changeTheme")}
      className={cn(
        "tap-target cursor-pointer relative h-10 w-[4.5rem] rounded-full border border-border/60 bg-background/80 p-1 shadow-sm backdrop-blur-md transition-all duration-300",
        "hover:bg-background hover:shadow-md",
        className
      )}
    >
      <span className="absolute left-1 top-1 h-8 w-8 rounded-full bg-primary shadow-sm transition-transform duration-300 ease-out dark:translate-x-8" />
      <span className="relative z-10 grid h-full w-full grid-cols-2 place-items-center">
        <Sun className="h-4 w-4 text-primary-foreground transition-colors duration-300 dark:text-muted-foreground/70" />
        <MoonStar className="h-4 w-4 text-muted-foreground/70 transition-colors duration-300 dark:text-primary-foreground" />
      </span>
    </Button>
  );
}
