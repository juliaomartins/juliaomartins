"use client";

import { useEffect, useRef } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  src: string;
  poster: string;
  width: number;
  height: number;
  label: string;
};

/**
 * A looping gallery clip.
 *
 * Three behaviours the previous animated GIFs could not offer:
 *
 *  - Paused while off-screen. A GIF decodes continuously whether or not it is
 *    visible; an IntersectionObserver keeps these idle until they scroll in.
 *  - `preload="metadata"`, so the bytes are not fetched just because the page
 *    loaded.
 *  - A reduced-motion path. Autoplaying video is motion, so when the visitor
 *    has asked for less of it the clip does not play on its own — it renders
 *    its poster and gains native controls, keeping the content reachable
 *    rather than silently dropping it.
 */
export default function GalleryVideo({
  src,
  poster,
  width,
  height,
  label,
}: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // play() rejects if the browser blocks autoplay; that is not an
          // error worth surfacing, the poster simply stays put.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
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
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
