import { useCallback, useEffect, useRef, useState } from "react";

/** The reading line, as a fraction of the viewport height from the top. */
const READING_LINE = 0.45;

/**
 * Scroll-spy. `active` is the id of the section crossing a thin line just
 * above the middle of the viewport. `ids` must be a stable (module-level)
 * array, or the observer is rebuilt on every render.
 *
 * `hold(id)` makes `id` active immediately and freezes the spy, for while a
 * programmatic scroll travels there — otherwise every section it passes
 * becomes active on the way and the nav underline chases them. `release()`
 * unfreezes it and re-reads where the page actually is (the user may have
 * taken over mid-scroll).
 */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const heldRef = useRef<string | null>(null);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        if (heldRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Collapse the root to a 1%-tall band at the reading line.
      { rootMargin: `-${READING_LINE * 100}% 0px -${(1 - READING_LINE) * 100 - 1}% 0px` }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  const hold = useCallback((id: string) => {
    heldRef.current = id;
    setActive(id);
  }, []);

  const release = useCallback(() => {
    heldRef.current = null;
    const line = window.innerHeight * READING_LINE;
    const current = ids
      .filter((id) => {
        const el = document.getElementById(id);
        return el !== null && el.getBoundingClientRect().top <= line;
      })
      .at(-1);
    if (current) setActive(current);
  }, [ids]);

  return { active, hold, release };
}
