import { cn } from "@/lib/utils";

/**
 * A starburst: `spikes` points alternating between the rim and an inner
 * radius, with a fixed pattern of long and short spikes so it looks drawn,
 * not generated. Computed once; the same shape serves all three bursts.
 */
const BURST = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 - Math.PI / 2;
  const radius = i % 2 === 0 ? [50, 44, 48, 42][(i / 2) % 4] : 31;
  return `${(50 + Math.cos(angle) * radius).toFixed(1)},${(50 + Math.sin(angle) * radius).toFixed(1)}`;
}).join(" ");

/** Fill and tilt of the burst behind each YES! */
const YES = [
  { fill: "fill-comic-red" },
  { fill: "fill-comic-blue" },
  { fill: "fill-comic-red" },
] as const;

function Star({ index }: { index: number }) {
  return (
    <span className={cn("comic-slot comic-star", `comic-star-${index}`)}>
      <svg data-comic="star" viewBox="0 0 24 24" className="comic-piece">
        <path
          d="M12 0 L14.6 9.4 L24 12 L14.6 14.6 L12 24 L9.4 14.6 L0 12 L9.4 9.4 Z"
          fill="currentColor"
          className="stroke-comic-ink"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * The comic layer over the Dili Hacktoberfest clip: every piece the timeline
 * (motion/comicTimeline.ts) animates, at rest and hidden. Each animated piece
 * sits in a slot that owns its place and tilt (see globals.css for why). The
 * words are what is said and heard in the clip, so they are the same in every
 * language.
 *
 * Decorative for assistive tech — the clip's own label describes it — and it
 * never takes pointer events, so the controls beneath stay usable.
 */
export default function ComicOverlay() {
  return (
    <div aria-hidden="true" className="comic">
      <div className="comic-grain" />
      <div data-comic-stage="" className="comic-stage">
        <div data-comic="dots" className="comic-piece comic-dots" />
        <div data-comic="lines" className="comic-piece comic-lines" />

        {[1, 2, 3, 4, 5].map((index) => (
          <Star key={index} index={index} />
        ))}

        <div className="comic-slot comic-intro">
          <p data-comic="intro" className="comic-piece comic-box">
            The energy is real!
          </p>
        </div>

        <div className="comic-slot comic-bubble-slot">
          <p data-comic="bubble" className="comic-piece comic-bubble">
            Dili Hacktoberfest
            <em>2026!</em>
          </p>
        </div>

        {YES.map(({ fill }, index) => (
          <div
            key={index}
            data-comic={`yes-${index + 1}`}
            className={cn("comic-yes", `comic-yes-${index + 1}`)}
          >
            <svg
              data-comic-part="burst"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon
                points={BURST}
                className={cn(fill, "stroke-comic-ink")}
                strokeWidth="2.4"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span data-comic-part="word">
              <span className="comic-word">Yes!</span>
            </span>
          </div>
        ))}

        <div className="comic-slot comic-sfx comic-clap">
          <p data-comic="clap" className="comic-piece">
            <span className="comic-word">Clap! Clap!</span>
          </p>
        </div>
        <div className="comic-slot comic-sfx comic-cheer">
          <p data-comic="cheer" className="comic-piece">
            <span className="comic-word">Cheer!</span>
          </p>
        </div>

        <div className="comic-slot comic-title-slot">
          <p data-comic="title" className="comic-piece comic-box comic-title">
            That&apos;s the
            <strong>Hackathon spirit!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
