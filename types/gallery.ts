export type GalleryItem = {
  /** Stable id; also the caption key in messages (gallery.captions.<id>). */
  id: string;
  src: string;
  /** Intrinsic size: the strip renders every photo at one height, so the
   * width (and the reserved box, so no CLS) comes from this ratio. */
  width: number;
  height: number;
  /**
   * Present when this slide is a looping clip rather than a still. The two
   * clips were 51.2 MB and 21.7 MB animated GIFs, which next/image passes
   * through unoptimised; as h264 they are 0.82 MB and 0.40 MB.
   */
  video?: { poster: string };
};
