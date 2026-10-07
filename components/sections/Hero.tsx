import HeroIntro from "./HeroIntro";
import HeroMosaic from "./HeroMosaic";

/** Proper noun — identical in every locale, so it never needs translating. */
const FIRST = "Julião";
const LAST = "Martins";

/**
 * Server component: the layout. Text on the left, the portrait mosaic on the
 * right from lg; below lg the mosaic sits above the text, both left-aligned.
 * Everything here is in the server-rendered HTML.
 */
export default function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-svh items-center px-6 pb-20 pt-28"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:order-last lg:col-span-5 lg:flex lg:justify-end">
          <HeroMosaic name={`${FIRST} ${LAST}`} />
        </div>
        <div className="lg:col-span-7">
          <HeroIntro first={FIRST} last={LAST} />
        </div>
      </div>
    </section>
  );
}
