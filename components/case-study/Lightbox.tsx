"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, XIcon } from "lucide-react";
import Image from "next/image";
import type { KeyboardEvent } from "react";

export type LightboxPhoto = { src: string; caption: string };

type Labels = {
  close: string;
  previous: string;
  next: string;
  counter: (current: number, total: number) => string;
};

type Props = {
  photos: readonly LightboxPhoto[];
  /** Photo on show, or null when closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** Where focus goes back to on close: the photo that was opened. */
  onCloseAutoFocus: (event: Event) => void;
  labels: Labels;
};

const iconButton =
  "press inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/25 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-97";

/**
 * Full-screen photo viewer. Radix Dialog traps focus, closes on Esc and on
 * the backdrop, and hides the page from assistive tech while open. Arrow keys
 * step through the wall, wrapping at either end. The caption is the dialog's
 * title, so each photo is announced by what it shows.
 *
 * Always dark, whatever the theme: photographs read best on black.
 */
export default function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  onCloseAutoFocus,
  labels,
}: Props) {
  const total = photos.length;
  const photo = index === null ? null : photos[index];

  const step = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + total) % total);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") step(-1);
    if (event.key === "ArrowRight") step(1);
  };

  return (
    <Dialog.Root open={photo !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/95 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <Dialog.Content
          onKeyDown={onKeyDown}
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed inset-0 z-50 flex flex-col gap-4 p-4 text-white outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none md:p-8"
        >
          {photo && index !== null && (
            <>
              <div className="flex items-center justify-between gap-4">
                <Dialog.Description className="font-mono text-sm tabular-nums text-white/75">
                  {labels.counter(index + 1, total)}
                </Dialog.Description>
                <Dialog.Close className={iconButton} aria-label={labels.close}>
                  <XIcon aria-hidden className="size-5" />
                </Dialog.Close>
              </div>

              <div className="relative min-h-0 flex-1">
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={labels.previous}
                  className={iconButton}
                >
                  <ArrowLeft aria-hidden className="size-5" />
                </button>
                <Dialog.Title className="text-center text-sm text-white md:text-base">
                  {photo.caption}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={labels.next}
                  className={iconButton}
                >
                  <ArrowRight aria-hidden className="size-5" />
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
