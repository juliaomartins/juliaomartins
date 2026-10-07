import { useEffect, useState } from "react";

/**
 * Scroll-spy. Returns the id of the section currently crossing a thin line
 * just above the middle of the viewport. `ids` must be a stable (module-level)
 * array, or the observer is rebuilt on every render.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Collapse the root to a 1%-tall band at 45% of the viewport height.
      { rootMargin: "-45% 0px -54% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
