"use client";

import { useGSAP } from "@gsap/react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { buildComicTimeline } from "@/motion/comicTimeline";
import { gsap } from "@/motion/registry";

import ComicOverlay from "./ComicOverlay";

type Props = {
  src: string;
  poster: string;
  width: number;
  height: number;
  label: string;
  /** The loop's hidden copy: clickable, but out of the tab order. */
  clone?: boolean;
};

/** silent: muted loop in the strip · sound: playing once, with audio ·
 * ended: holding the last frame and the closing title. */
type Mode = "silent" | "sound" | "ended";

const pill =
  "press pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-full bg-black/70 text-sm font-medium text-white hover:bg-black/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-97";

const silence = (video: HTMLVideoElement) => {
  video.muted = true;
  video.loop = true;
};

/**
 * The Dili Hacktoberfest clip as a comic strip panel.
 *
 * In the strip it loops silently like any gallery clip, with the comic
 * overlay telling the sound in pictures: the speech bubble while she speaks,
 * YES! YES! YES! on each shout. "Play with sound" restarts it once with its
 * real audio and stops the strip drifting while it plays; at the end it
 * holds on the closing title until replayed or scrolled away.
 *
 * The overlay is one paused GSAP timeline whose time is set from
 * `video.currentTime` on every tick while the video plays, and once on pause,
 * seek and end — so it cannot drift from the audio, and pause, loop and
 * replay need no animation code of their own.
 *
 * Reduced motion: the clip does not autoplay and gets native controls, and
 * the captions appear and disappear on their cues without moving.
 */
export default function ComicClip({
  src,
  poster,
  width,
  height,
  label,
  clone = false,
}: Props) {
  const t = useTranslations("gallery.comic");
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modeRef = useRef<Mode>("silent");
  const [mode, setMode] = useState<Mode>("silent");
  const [playing, setPlaying] = useState(true);
  const reduced = usePrefersReducedMotion();

  const go = (next: Mode) => {
    modeRef.current = next;
    setMode(next);
  };

  /** Ask the gallery strip to stop (or resume) drifting. */
  const hold = (on: boolean) =>
    rootRef.current?.dispatchEvent(
      new CustomEvent("gallery:hold", { bubbles: true, detail: on })
    );

  useGSAP(
    () => {
      const root = rootRef.current;
      const video = videoRef.current;
      if (!root || !video) return;

      let timeline: gsap.core.Timeline | null = null;
      const sync = () => {
        timeline?.time(Math.min(video.currentTime, timeline.duration()));
      };

      const mm = gsap.matchMedia();
      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference)",
          still: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          timeline = buildComicTimeline(root, Boolean(context.conditions?.still));
          sync();
          return () => {
            timeline = null;
          };
        }
      );

      // One ticker listener, only while the video is actually playing.
      const start = () => gsap.ticker.add(sync);
      const stop = () => {
        gsap.ticker.remove(sync);
        sync();
      };
      video.addEventListener("play", start);
      video.addEventListener("pause", stop);
      video.addEventListener("ended", stop);
      video.addEventListener("seeked", sync);
      if (!video.paused) start();

      return () => {
        gsap.ticker.remove(sync);
        video.removeEventListener("play", start);
        video.removeEventListener("pause", stop);
        video.removeEventListener("ended", stop);
        video.removeEventListener("seeked", sync);
        mm.revert();
      };
    },
    { scope: rootRef }
  );

  // Play only while on screen; leaving the screen ends a sound session.
  useEffect(() => {
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (modeRef.current === "silent" && !reduced) {
            void video.play().catch(() => {});
          }
          return;
        }
        video.pause();
        if (modeRef.current !== "silent") {
          silence(video);
          modeRef.current = "silent";
          setMode("silent");
          setPlaying(true);
          root.dispatchEvent(
            new CustomEvent("gallery:hold", { bubbles: true, detail: false })
          );
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced]);

  const playWithSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.loop = false;
    video.currentTime = 0;
    void video.play().catch(() => {});
    go("sound");
    setPlaying(true);
    hold(true);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const backToSilent = () => {
    const video = videoRef.current;
    if (!video) return;
    silence(video);
    void video.play().catch(() => {});
    go("silent");
    setPlaying(true);
    hold(false);
  };

  const onEnded = () => {
    if (modeRef.current !== "sound") return;
    go("ended");
    hold(false);
  };

  // The copy sits in an aria-hidden list: let the mouse use it without
  // moving focus into it.
  const keepFocus = clone
    ? (event: MouseEvent) => event.preventDefault()
    : undefined;
  const tabIndex = clone ? -1 : undefined;

  return (
    <div ref={rootRef} data-comic-clip="" className="@container absolute inset-0">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        width={width}
        height={height}
        muted
        loop
        playsInline
        preload="metadata"
        controls={reduced}
        aria-label={label}
        onEnded={onEnded}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <ComicOverlay />

      {/* Native controls take over with reduced motion. */}
      {!reduced && (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex gap-2">
          {mode === "sound" ? (
            <>
              <button
                type="button"
                onClick={togglePlay}
                onMouseDown={keepFocus}
                tabIndex={tabIndex}
                aria-label={playing ? t("pause") : t("resume")}
                className={`${pill} w-11 justify-center`}
              >
                {playing ? (
                  <Pause aria-hidden className="size-4" />
                ) : (
                  <Play aria-hidden className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={backToSilent}
                onMouseDown={keepFocus}
                tabIndex={tabIndex}
                aria-label={t("mute")}
                className={`${pill} w-11 justify-center`}
              >
                <VolumeX aria-hidden className="size-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={playWithSound}
              onMouseDown={keepFocus}
              tabIndex={tabIndex}
              // Icon only on a phone, where the clip is small and a labelled
              // pill would sit on people's faces; the label stays for
              // assistive tech.
              className={`${pill} w-11 justify-center md:w-auto md:pl-4 md:pr-5`}
            >
              {mode === "ended" ? (
                <RotateCcw aria-hidden className="size-4" />
              ) : (
                <Volume2 aria-hidden className="size-4" />
              )}
              <span className="sr-only md:not-sr-only">
                {mode === "ended" ? t("replay") : t("playSound")}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
