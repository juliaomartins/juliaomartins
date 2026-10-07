import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * A line of text set around a ring — the stamp from the artist reference.
 * With `thread`, a line drops from the centre to a pin (the skills wall);
 * without, it is a compact seal (the hero portrait). Static: a mark, not a
 * moving part. Decorative, so hidden from assistive tech; nearby text carries
 * the meaning.
 */
export default function CircleStamp({
  text,
  thread = false,
  className,
}: {
  text: string;
  thread?: boolean;
  className?: string;
}) {
  const ringId = useId();

  return (
    <svg
      viewBox={thread ? "0 0 120 200" : "0 0 120 120"}
      aria-hidden="true"
      focusable="false"
      className={cn("h-auto text-foreground", className)}
    >
      <defs>
        {/* Starts at 9 o'clock and runs clockwise so the text reads upright. */}
        <path id={ringId} d="M 16 60 a 44 44 0 1 1 88 0 a 44 44 0 1 1 -88 0" />
      </defs>
      <text
        fontSize="9"
        className="fill-signal font-medium uppercase"
        textLength="274"
        lengthAdjust="spacingAndGlyphs"
      >
        <textPath href={`#${ringId}`}>{text}</textPath>
      </text>
      <circle cx="60" cy="60" r="2.5" className="fill-current" />
      {thread && (
        <>
          <line x1="60" y1="60" x2="60" y2="186" stroke="currentColor" strokeWidth="1" />
          <circle cx="60" cy="188" r="3" className="fill-current" />
        </>
      )}
    </svg>
  );
}
