"use client";

import { useGSAP } from "@gsap/react";
import { useLocale } from "next-intl";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { gsap } from "@/motion/registry";
import { duration, ease } from "@/motion/tokens";

export type NavItem = { id: string; label: string };

type Props = {
  items: readonly NavItem[];
  /** Section currently in view. */
  active: string;
  /** Accessible name for the list. */
  label: string;
  /** Extra <li> controls (theme, language) rendered after the links. */
  children?: ReactNode;
};

/**
 * Put the bar under the link for `id`: x to the link's left edge, scaleX to its
 * width. Only ever called from inside useGSAP callbacks, never during render.
 */
function moveBar(
  list: HTMLUListElement | null,
  bar: HTMLSpanElement | null,
  id: string,
  seconds: number
) {
  const link = list?.querySelector<HTMLElement>(`a[href="#${id}"]`);
  if (!bar || !link) return;

  gsap.to(bar, {
    x: link.offsetLeft,
    scaleX: link.offsetWidth / bar.offsetWidth,
    autoAlpha: 1,
    duration: seconds,
    ease: ease.out,
    overwrite: "auto",
  });
}

/**
 * One underline for the whole list. It rests under the section in view and
 * slides to whichever link is hovered or keyboard-focused, then returns.
 * Transform only (x + scaleX); with reduced motion it jumps instead of sliding.
 * Without JS the bar never appears and the links work as plain anchors.
 */
export default function DesktopNav({ items, active, label, children }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const reducedRef = useRef(false);
  const placedRef = useRef(false);
  const targetRef = useRef(active);
  const [preview, setPreview] = useState<string | null>(null);
  const locale = useLocale();

  const target = preview ?? active;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        reducedRef.current = true;
        return () => {
          reducedRef.current = false;
        };
      });
      return () => mm.revert();
    },
    { scope: listRef }
  );

  // Move on every target change. Locale is a dependency because link widths
  // change between English and Tetum. The first placement snaps into place.
  useGSAP(
    () => {
      targetRef.current = target;
      const animate = placedRef.current && !reducedRef.current;
      moveBar(listRef.current, barRef.current, target, animate ? duration.ui : 0);
      placedRef.current = true;
    },
    { dependencies: [target, locale], scope: listRef }
  );

  // Re-measure without animating when the list resizes (font swap, viewport).
  useGSAP(
    (_context, contextSafe) => {
      const list = listRef.current;
      if (!list || !contextSafe) return;
      const onResize = contextSafe(() =>
        moveBar(list, barRef.current, targetRef.current, 0)
      );
      const observer = new ResizeObserver(onResize);
      observer.observe(list);
      return () => observer.disconnect();
    },
    { scope: listRef }
  );

  // The bar is a sibling of the <ul> (a <ul> may only contain <li>), so the
  // wrapper is the positioning context and link.offsetLeft is measured from it.
  // Without JS the menu sheet can't open, so the links show from sm and wrap.
  return (
    <div className="relative hidden py-1 lg:block noscript:min-w-0 noscript:sm:block">
      <ul
        ref={listRef}
        aria-label={label}
        onMouseLeave={() => setPreview(null)}
        className="flex list-none items-center gap-7 noscript:flex-wrap noscript:justify-end noscript:gap-x-5"
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onMouseEnter={() => setPreview(item.id)}
                onFocus={() => setPreview(item.id)}
                onBlur={() => setPreview(null)}
                className={cn(
                  "tap-target block rounded-sm py-2 text-sm font-medium outline-none transition-colors duration-(--duration-micro)",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}

        {children}
      </ul>

      <span
        ref={barRef}
        data-nav-indicator=""
        aria-hidden
        className="pointer-events-none invisible absolute bottom-0 left-0 h-0.5 w-10 origin-left rounded-full bg-foreground"
      />
    </div>
  );
}
