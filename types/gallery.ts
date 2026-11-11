export type GalleryItem = {
  /** Stable id; also the caption key in messages (gallery.captions.<id>). */
  id: string;
  src: string;
  /**
   * When it was taken, as an ISO date (YYYY-MM-DD, or YYYY-MM-DDTHH:mm to
   * order shots from the same day). The strip shows newest first, sorted on
   * this, and labels each piece with its month and year.
   */
  date: string;
  /** Intrinsic size: the strip renders every photo at one height, so the
   * width (and the reserved box, so no CLS) comes from this ratio. */
  width: number;
  height: number;
  /** Present when this slide is a looping clip rather than a still. */
  video?: { poster: string };
};
