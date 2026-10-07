"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useScrollNavbar } from "@/hooks/useScrollNavbar";
import { cn } from "@/lib/utils";
import { Menu, MoonStar, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

// React 18+ idiom for detecting hydration without setState-in-effect.
// Server snapshot is `false`, client snapshot is `true`, so the value
// flips exactly once after hydration completes.
const subscribeNoop = () => () => {};
const getHydratedClientSnapshot = () => true;
const getHydratedServerSnapshot = () => false;
const useHasHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot
  );

import LanguageSwitcher from "../LanguageSwitcher";
import { Button } from "../ui/button";

import DesktopNav, { type NavItem } from "./DesktopNav";

const SECTION_IDS = [
  "home",
  "about",
  "projects",
  "skills",
  "gallery",
  "contact",
] as const;

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const resolveTheme = (value: string | null): Theme =>
  value === "light" || value === "dark" ? value : getSystemTheme();

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

function ThemeToggleButton({
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

export default function Navbar() {
  const scrolled = useScrollNavbar();
  const [open, setOpen] = useState<boolean>(false);
  // Defer Radix Sheet mount until after hydration. Radix Dialog's
  // auto-generated aria-controls (via React useId) can drift between SSR
  // and CSR with React 19 + next-intl, producing a hydration mismatch.
  // Rendering a visually identical placeholder on the server and only
  // mounting the real Sheet on the client side-steps the issue cleanly.
  const mounted = useHasHydrated();
  const t = useTranslations();

  const active = useActiveSection(SECTION_IDS);

  const navItems: readonly NavItem[] = SECTION_IDS.map((id) => ({
    id,
    label: t(`nav.${id}`),
  }));

  const toggleTheme = () => {
    const activeTheme = resolveTheme(
      document.documentElement.getAttribute("data-theme")
    );
    const nextTheme: Theme = activeTheme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/40 bg-background/75 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <p className="text-xl font-bold tracking-tight text-foreground">
          Julião Martins
        </p>

        <DesktopNav
          items={navItems}
          active={active}
          label={t("a11y.mainNav")}
        >
          <li>
            <ThemeToggleButton onToggle={toggleTheme} />
          </li>
          <li>
            <LanguageSwitcher className="ml-1" />
          </li>
        </DesktopNav>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggleButton onToggle={toggleTheme} />
          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="tap-target border border-border/60 bg-background/70 backdrop-blur-sm"
                  aria-label={t("a11y.openMenu")}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                closeLabel={t("a11y.closeMenu")}
                className="w-72 border-l border-border/50 bg-background/95 backdrop-blur-xl"
              >
                <div className="mt-10 flex flex-col items-center gap-6">
                  {navItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      aria-current={item.id === active ? "true" : undefined}
                      className={cn(
                        "tap-target text-lg font-medium transition-colors hover:text-foreground",
                        item.id === active
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="mt-2 flex items-center gap-3">
                    <ThemeToggleButton onToggle={toggleTheme} />
                    <LanguageSwitcher />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            // Server / pre-hydration placeholder. Same dimensions and visuals
            // as the real trigger so there's no layout shift when the Sheet
            // mounts. Disabled because the dialog isn't wired up yet.
            <Button
              variant="ghost"
              size="icon"
              className="border border-border/60 bg-background/70 backdrop-blur-sm"
              aria-label={t("a11y.openMenu")}
              aria-hidden
              tabIndex={-1}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
