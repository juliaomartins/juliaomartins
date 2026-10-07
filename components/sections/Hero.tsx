import Image from "next/image";

import portrait from "@/public/juliao_martins.jpg";

import HeroIntro from "./HeroIntro";

/** Proper noun — identical in every locale, so it never needs translating. */
const NAME = "Julião Martins";

/**
 * Server component. Owns the portrait (the LCP element) and the <h1>, the two
 * things that must never depend on JavaScript and that GSAP never touches.
 */
export default function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-svh items-center justify-center px-5 pb-20 pt-28"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        {/*
          Fixed-size avatar: explicit square width/height, no `sizes`, so
          next/image emits a tight 1x/2x srcset and the box is reserved.
        */}
        <Image
          src={portrait}
          alt={NAME}
          width={144}
          height={144}
          placeholder="blur"
          priority
          className="mb-8 size-28 rounded-full object-cover object-top ring-1 ring-border md:size-36"
        />

        <h1 className="text-name font-semibold text-foreground">{NAME}</h1>

        <HeroIntro />
      </div>
    </section>
  );
}
