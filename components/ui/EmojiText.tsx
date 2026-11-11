import { Fragment, useId, type ReactNode } from "react";

import { EMOJI } from "@/lib/emoji";

import { CLAP_PATHS } from "./fluent-clap";

/**
 * Emoji drawn as SVG, so they look the same on every device and match the
 * site instead of each platform's emoji font. The text itself is untouched:
 * the original character stays in the DOM for screen readers (which read its
 * name, e.g. "red heart") and is only hidden visually; the drawing is
 * decorative. Gradient ids come from useId, because a caption can render
 * more than once (the gallery strip's loop copy).
 *
 * An emoji never wraps away from the words beside it: "I ❤ Maubisse" is a
 * slogan, and reads as one, so it stays on one line.
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

/** Clapping hands: Microsoft's Fluent Emoji design (MIT; see fluent-clap.ts),
 * the shape people already know from their own devices. */
function Clap() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={glyph}>
      {CLAP_PATHS.map(({ d, fill }) => (
        <path key={d} d={d} fill={fill} />
      ))}
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
  return (
    <>
      <span className="sr-only">{char}</span>
      {char.startsWith("❤") ? (
        <Heart id={id} />
      ) : char === "\u{1F44F}" ? (
        <Clap />
      ) : (
        <Fire id={id} />
      )}
    </>
  );
}

/** A word, a run of spaces, an emoji, or a possible line break inside a word
 * (rendered as <wbr>, adding no characters). */
type Token = { emoji: string } | { text: string } | { wbr: true };

const isEmoji = (token?: Token) => token !== undefined && "emoji" in token;
const isBreak = (token: Token) =>
  "wbr" in token || ("text" in token && /^\s+$/.test(token.text));

/**
 * A text piece as tokens. A word with an opening bracket inside it, like
 * "Rabilau(I", gets a break point before the bracket: browsers never break
 * there on their own, so without it the whole word would be glued to the
 * emoji and could overflow a narrow caption.
 */
const tokenize = (piece: string): Token[] =>
  piece
    .split(/(\s+)/)
    .filter(Boolean)
    .flatMap((word) =>
      word
        .split(/(?=\()/)
        .flatMap<Token>((part, index) => (index > 0 ? [{ wbr: true }, { text: part }] : [{ text: part }]))
    );

/**
 * Renders `text`, drawing any supported emoji in it as SVG. The text is cut
 * into words, spaces and emoji; a space next to an emoji is glued, so each
 * emoji and its neighbouring words form one run that never breaks.
 */
export default function EmojiText({ text }: { text: string }) {
  const parts = text.split(EMOJI);
  if (parts.length === 1) return text;

  const tokens = parts.flatMap<Token>((part, index) =>
    index % 2 === 1 ? [{ emoji: part }] : tokenize(part)
  );

  // Runs split only at break points with no emoji on either side.
  const runs: Token[][] = [[]];
  tokens.forEach((token, index) => {
    if (isBreak(token) && !isEmoji(tokens[index - 1]) && !isEmoji(tokens[index + 1])) {
      runs.push([token], []);
    } else {
      runs[runs.length - 1].push(token);
    }
  });

  const draw = (token: Token, key: number): ReactNode =>
    "emoji" in token ? (
      <Glyph key={key} char={token.emoji} />
    ) : "wbr" in token ? (
      <wbr key={key} />
    ) : (
      token.text
    );

  return runs.map((run, index): ReactNode =>
    run.some((token) => isEmoji(token)) ? (
      <span key={index} className="whitespace-nowrap">
        {run.map(draw)}
      </span>
    ) : (
      <Fragment key={index}>{run.map(draw)}</Fragment>
    )
  );
}
