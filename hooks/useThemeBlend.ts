"use client";

import { useGSAP } from "@gsap/react";
import { useCallback, useRef, type RefObject } from "react";

import { gsap } from "@/motion/registry";
import { duration, ease } from "@/motion/tokens";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "theme";
const MIX = "--theme-mix";

const systemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const currentTheme = (): Theme => {
  const value = document.documentElement.getAttribute("data-theme");
  return value === "light" || value === "dark" ? value : systemTheme();
};

/** Same writes as the head script, so a reload lands on the same theme. */
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

/**
 * Light/dark switch that blends the whole page instead of cutting.
 *
 * Every colour token is a mix of its light and dark value by --theme-mix
 * (globals.css). The switch flips the theme attribute at once — so `dark:`
 * utilities, scrollbars and form controls follow — while GSAP holds
 * --theme-mix inline and tweens it to the new end, then hands it back to CSS.
 * CSS colour transitions are suspended meanwhile (data-theme-animating) so
 * they don't trail the blend. Toggling again mid-blend reverses from where
 * the colours are. Reduced motion: the switch is instant.
 */
export function useThemeBlend(scope: RefObject<HTMLElement | null>) {
  const toggleRef = useRef<(() => void) | null>(null);

  useGSAP(
    (_context, contextSafe) => {
      if (!contextSafe) return;

      let reduced = false;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        reduced = true;
        return () => {
          reduced = false;
        };
      });

      const root = document.documentElement;
      const finish = () => {
        root.style.removeProperty(MIX);
        root.removeAttribute("data-theme-animating");
      };

      toggleRef.current = contextSafe(() => {
        const from = currentTheme();
        const to: Theme = from === "dark" ? "light" : "dark";
        localStorage.setItem(THEME_STORAGE_KEY, to);

        // Start from the colours on screen, even mid-blend.
        const inline = root.style.getPropertyValue(MIX);
        const start = inline ? parseFloat(inline) : from === "dark" ? 1 : 0;
        gsap.killTweensOf(root);

        if (reduced) {
          applyTheme(to);
          finish();
          return;
        }

        // Pin the current mix inline before the attribute flips, so the
        // first frame shows no jump.
        root.setAttribute("data-theme-animating", "");
        gsap.set(root, { [MIX]: start });
        applyTheme(to);
        gsap.to(root, {
          [MIX]: to === "dark" ? 1 : 0,
          duration: duration.theme,
          ease: ease.inOut,
          onComplete: finish,
        });
      });

      return () => {
        toggleRef.current = null;
        gsap.killTweensOf(root);
        finish();
        mm.revert();
      };
    },
    { scope }
  );

  return useCallback(() => toggleRef.current?.(), []);
}
