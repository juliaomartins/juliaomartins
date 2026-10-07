import { useId } from "react";

/**
 * The circular stamp from the reference: a line of text set around a ring,
 * with a thread dropping from its centre to a pin. Static — it is a mark, not
 * a moving part. Decorative, so hidden from assistive tech; the statement
 * beside it carries the meaning.
 */
export default function SkillsBadge({ text }: { text: string }) {
  const ringId = useId();

  return (
    <svg
      viewBox="0 0 120 200"
      aria-hidden="true"
      focusable="false"
      className="h-auto w-28 text-foreground"
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
      <line x1="60" y1="60" x2="60" y2="186" stroke="currentColor" strokeWidth="1" />
      <circle cx="60" cy="188" r="3" className="fill-current" />
    </svg>
  );
}
