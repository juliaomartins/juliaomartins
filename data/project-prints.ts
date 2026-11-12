/**
 * Photos pinned to a project's row on the home page, keyed by the project's
 * link (messages projects.items[].href). Captions are for search engines
 * (lib/seo.ts); on the page the prints are decorative.
 */
export type ProjectPrint = {
  src: string;
  width: number;
  height: number;
  caption: string;
};

const PHOTO = { width: 2048, height: 1366 } as const;

export const projectPrints: Record<string, readonly ProjectPrint[]> = {
  // Visitor and Queue System, at DRCCMD 2026 (Palm Spring, Dili).
  "https://github.com/juliaomartins/visitor-management-system": [
    {
      src: "/images/juliao-martins-queue-system-lobby-screen.jpg",
      ...PHOTO,
      caption: "The Visitor and Queue System lobby screen at 08:51, waiting for arrivals at DRCCMD 2026.",
    },
    {
      src: "/images/juliao-martins-queue-system-badge-scan.jpg",
      ...PHOTO,
      caption: "A staff member scans a delegate's QR ID card with a phone at DRCCMD 2026.",
    },
    {
      src: "/images/juliao-martins-queue-system-scan-closeup.jpg",
      ...PHOTO,
      caption: "Badge and phone: a delegate checked in by the Visitor and Queue System.",
    },
  ],
};
