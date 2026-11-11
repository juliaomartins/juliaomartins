import { useId, type ReactNode } from "react";

import { EMOJI } from "@/lib/emoji";

/**
 * Emoji drawn as SVG, so they look the same on every device and match the
 * site instead of each platform's emoji font. The text itself is untouched:
 * the original character stays in the DOM for screen readers (which read its
 * name, e.g. "red heart") and is only hidden visually; the drawing is
 * decorative. Gradient ids come from useId, because a caption can render
 * more than once (the gallery strip's loop copy).
 */

const glyph = "inline-block size-[1.15em] -translate-y-[0.08em] align-middle";

function Heart({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={glyph}>
      <defs>
        <linearGradient id={`${id}-h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF5C74" />
          <stop offset="1" stopColor="#D90429" />
        </linearGradient>
      </defs>
      <path
        d="M16 28.5S3.5 21 3.5 11.9A6.9 6.9 0 0 1 16 7.6a6.9 6.9 0 0 1 12.5 4.3C28.5 21 16 28.5 16 28.5Z"
        fill={`url(#${id}-h)`}
        stroke="#9D0208"
        strokeWidth="1"
      />
      {/* Highlight, top left: the shine that makes it read as glossy. */}
      <ellipse cx="10" cy="11.5" rx="3.2" ry="2" transform="rotate(-35 10 11.5)" fill="#fff" opacity="0.55" />
    </svg>
  );
}

function Clap({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={glyph}>
      <defs>
        <linearGradient id={`${id}-c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFD37A" />
          <stop offset="1" stopColor="#F4A62A" />
        </linearGradient>
      </defs>
      {/* Two hands, thumbs out, tipped together so their fingertips meet:
          the back hand leans right, the front one is its mirror. */}
      {[
        "translate(10.5 28) rotate(16) translate(-4.5 -20)",
        "translate(21.5 28) rotate(-16) scale(-1 1) translate(-4.5 -20)",
      ].map((transform) => (
        <g key={transform} transform={transform}>
          {/* Thumb, then the hand over it. */}
          <path
            d="M1 9.5C-1.6 8.6-3 6.6-2.4 5.2c.6-1.4 2.4-1 3.4.4Z"
            fill={`url(#${id}-c)`}
            stroke="#B9770E"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d="M0 16V5a4.5 4.5 0 0 1 9 0v11a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4Z"
            fill={`url(#${id}-c)`}
            stroke="#B9770E"
            strokeWidth="1"
          />
          {/* Gaps between the fingers. */}
          <path d="M3 1.2v4.6M6 1.2v4.6" stroke="#B9770E" strokeWidth="0.9" strokeLinecap="round" />
        </g>
      ))}
      {/* Impact marks where the hands meet. */}
      <g stroke="#F4A62A" strokeWidth="1.8" strokeLinecap="round">
        <path d="M16 4.2V1.2" />
        <path d="M10.6 5 9 2.6" />
        <path d="M21.4 5 23 2.6" />
      </g>
    </svg>
  );
}

function Fire({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={glyph}>
      <defs>
        <linearGradient id={`${id}-f`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#E63946" />
          <stop offset="0.55" stopColor="#FF7A1A" />
          <stop offset="1" stopColor="#FFB703" />
        </linearGradient>
        <linearGradient id={`${id}-i`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFB703" />
          <stop offset="1" stopColor="#FFF3B0" />
        </linearGradient>
      </defs>
      <path
        d="M16 30c-6 0-10-4.2-10-9.6 0-4.3 2.6-7.2 4.6-9.6.4 2.4 1.6 3.9 3 4.6-.6-4.6 1.4-9.4 5.6-12.4-.4 3.6 1.2 6.2 3.4 8.6 2 2.2 3.4 4.8 3.4 8.4C26 25.8 22 30 16 30Z"
        fill={`url(#${id}-f)`}
        stroke="#B5172A"
        strokeWidth="0.8"
      />
      <path
        d="M16 28c-2.9 0-4.8-2-4.8-4.6 0-2.8 2-4.6 3.4-6.6.3 1.8 1.2 2.8 2.4 3.4.2-1.6 1-2.8 2-3.8.2 1.8 1.8 3.6 1.8 6.6 0 2.8-1.9 5-4.8 5Z"
        fill={`url(#${id}-i)`}
      />
    </svg>
  );
}

function Glyph({ char }: { char: string }) {
  const id = useId().replace(/:/g, "");
  const Drawing = char.startsWith("❤") ? Heart : char === "\u{1F44F}" ? Clap : Fire;
  return (
    <>
      <span className="sr-only">{char}</span>
      <Drawing id={id} />
    </>
  );
}

/** Renders `text`, drawing any supported emoji in it as SVG. */
export default function EmojiText({ text }: { text: string }) {
  const parts = text.split(EMOJI);
  if (parts.length === 1) return text;
  return parts.map((part, index): ReactNode =>
    index % 2 === 1 ? <Glyph key={index} char={part} /> : part
  );
}
