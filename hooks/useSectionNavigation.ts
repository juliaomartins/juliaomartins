"use client";

import { useGSAP } from "@gsap/react";
import { useCallback, useRef, type RefObject } from "react";

import { gsap } from "@/motion/registry";
import { duration, ease } from "@/motion/tokens";

type Options = {
  /** Section ids that in-page links may target. Must be stable. */
  ids: readonly string[];
  /** From useActiveSection: claim the target / hand control back. */
  hold: (id: string) => void;
  release: () => void;
  /** Close the mobile menu sheet. */
  closeMenu: () => void;
  /** Scope for useGSAP (the nav). */
  scope: RefObject<HTMLElement | null>;
};

type Pending = { id: string; focus: boolean };

/** Focus a section without scrolling, so the next Tab continues from it. */
function focusSection(section: HTMLElement) {
  if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
  section.focus({ preventScroll: true });
}

/**
 * Every link to a section ("#about", from the nav, the hero buttons or the
 * skills link) scrolls there with GSAP instead of the browser's anchor jump,
 * so the URL never gains a #fragment. One delegated listener covers them all;
 * the links keep their real href, so without JS they still work as anchors.
 *
 * - The target is made active at once and the scroll-spy is held until the
 *   scroll ends, so the nav underline moves once instead of visiting every
 *   section on the way.
 * - Reduced motion: the jump is instant.
 * - Keyboard activation moves focus to the section, like a native jump.
 * - Links inside the mobile menu close it first: the open dialog locks page
 *   scrolling, so the scroll starts once the sheet has gone
 *   (`onMenuCloseAutoFocus`).
 * - An old deep link (/#about) lands on its section, then the #about is
 *   removed from the address bar.
 */
export function useSectionNavigation({ ids, hold, release, closeMenu, scope }: Options) {
  const pendingRef = useRef<Pending | null>(null);
  const goRef = useRef<((id: string, focus: boolean, instant?: boolean) => void) | null>(null);

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

      const isSection = (id: string) => ids.includes(id);

      const go = contextSafe((id: string, focus: boolean, instant = false) => {
        const section = document.getElementById(id);
        if (!section) return;
        hold(id);
        gsap.to(window, {
          // The hero is the top of the page; any other section aligns its top
          // edge with the viewport, exactly where an anchor jump would.
          scrollTo: { y: id === ids[0] ? 0 : section, autoKill: true },
          duration: reduced || instant ? 0 : duration.scroll,
          ease: ease.inOut,
          overwrite: true,
          onComplete: () => {
            release();
            if (focus) focusSection(section);
          },
          // The visitor scrolled during the trip: hand control back.
          onInterrupt: release,
        });
      });
      goRef.current = go;

      const onClick = (event: MouseEvent) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          !(event.target instanceof Element)
        ) {
          return;
        }
        const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
        const id = link?.getAttribute("href")?.slice(1) ?? "";
        if (!link || !isSection(id)) return;

        event.preventDefault();
        // detail is 0 when the click came from the keyboard (Enter).
        const focus = event.detail === 0;
        if (link.closest('[data-slot="sheet-content"]')) {
          pendingRef.current = { id, focus };
          closeMenu();
          return;
        }
        go(id, focus);
      };
      document.addEventListener("click", onClick);

      // Old deep links: wait one frame so sections below (the pinned gallery)
      // have laid out, land instantly, and drop the fragment.
      const hash = window.location.hash.slice(1);
      let frame = 0;
      if (isSection(hash)) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
        frame = window.requestAnimationFrame(() => go(hash, false, true));
      }

      return () => {
        document.removeEventListener("click", onClick);
        window.cancelAnimationFrame(frame);
        goRef.current = null;
        mm.revert();
      };
    },
    { scope, dependencies: [ids, hold, release, closeMenu] }
  );

  /** Pass to the menu sheet's onCloseAutoFocus. */
  const onMenuCloseAutoFocus = useCallback((event: Event) => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    // Focus goes to the section (keyboard) or nowhere (pointer), not back to
    // the menu button the visitor has finished with.
    event.preventDefault();
    window.requestAnimationFrame(() =>
      goRef.current?.(pending.id, pending.focus)
    );
  }, []);

  return { onMenuCloseAutoFocus };
}
