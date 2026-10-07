"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";

import { AI_LOGOS, STACK_LOGOS } from "@/content/logos";
import { gsap } from "@/motion/registry";
import { ease, sprites } from "@/motion/tokens";

const SETS = { stack: STACK_LOGOS, ai: AI_LOGOS } as const;

type Props = {
  /**
   * Named set rather than the array itself. The logo objects carry React
   * component functions, which cannot be serialised across the server/client
   * boundary — passing them from a server component throws
   * "Functions cannot be passed directly to Client Components" at runtime,
   * which neither the build nor the linter catches.
   */
  set: keyof typeof SETS;
  /**
   * Selector for the elements that emit, resolved inside the nearest
   * `[data-sprite-scope]` ancestor.
   */
  trigger: string;
  /**
   * `hover` re-fires every time the pointer enters a trigger.
   * `hover-once` greets each trigger once, and clicks fire it again.
   */
  mode?: "hover" | "hover-once";
};

/**
 * Pooled, physics-driven logo burst.
 *
 * Used by the gallery slides; kept as its own module so the pool, the projectile
 * maths and the reduced-motion gate exist once. A host marks its coordinate
 * space with `data-sprite-scope` and renders this with a trigger selector.
 *
 * Decorative throughout: `aria-hidden`, pointer-only, no tab stops, and it
 * builds nothing at all under `prefers-reduced-motion`.
 */
export default function SpriteBurst({ set, trigger, mode = "hover" }: Props) {
  const logos = SETS[set];
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const templatesRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const overlay = overlayRef.current;
      const templates = templatesRef.current;
      if (!overlay || !templates) return;

      /*
       * Resolved from this component's own node. React attaches host refs
       * bottom-up, so an ancestor ref passed in as a prop is still null while
       * this layout effect runs — that mistake silently disabled an earlier
       * version of this emitter entirely.
       */
      const scope = overlay.closest<HTMLElement>("[data-sprite-scope]");
      if (!scope) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          full: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const conditions = context.conditions as
            | { full: boolean; reduced: boolean }
            | undefined;

          // A burst of flying particles carries no information, so the designed
          // reduced-motion state is simply no burst.
          if (!conditions?.full) return;

          const stamps = Array.from(
            templates.querySelectorAll<HTMLElement>("[data-sprite-template]")
          );
          if (stamps.length === 0) return;

          /*
           * One pool bank per logo, because a recycled node still carries its
           * own SVG. Nodes are created once and reused: cloning and removing
           * per sprite measured 27fps while scrolling at 4x CPU throttle,
           * against 56fps pooled.
           */
          const perLogo = Math.max(1, Math.floor(sprites.max / stamps.length));

          type Bank = {
            stamp: HTMLElement;
            free: HTMLElement[];
            busy: { node: HTMLElement; tl: gsap.core.Timeline }[];
            made: number;
          };

          const banks: Bank[] = stamps.map((stamp) => ({
            stamp,
            free: [],
            busy: [],
            made: 0,
          }));

          const acquire = (bank: Bank): HTMLElement => {
            const spare = bank.free.pop();
            if (spare) return spare;

            if (bank.made < perLogo) {
              const node = bank.stamp.cloneNode(true) as HTMLElement;
              node.removeAttribute("data-sprite-template");
              node.style.position = "absolute";
              node.style.left = "0";
              node.style.top = "0";
              overlay.appendChild(node);
              bank.made += 1;
              return node;
            }

            const oldest = bank.busy.shift();
            if (oldest) {
              oldest.tl.kill();
              return oldest.node;
            }
            return bank.stamp;
          };

          const release = (bank: Bank, node: HTMLElement) => {
            const i = bank.busy.findIndex((e) => e.node === node);
            if (i !== -1) bank.busy.splice(i, 1);
            gsap.set(node, { autoAlpha: 0 });
            bank.free.push(node);
          };

          const burstFrom = (source: Element) => {
            const from = source.getBoundingClientRect();
            const box = scope.getBoundingClientRect();
            const originX = from.left - box.left + from.width / 2;
            const originY = from.top - box.top + from.height / 2;

            banks.forEach((bank) => {
              const node = acquire(bank);

              /*
               * Real projectile motion: launch upward at a random angle and
               * speed, then let Physics2DPlugin integrate gravity so each
               * sprite arcs over and falls away under its own weight.
               */
              const velocity = gsap.utils.random(
                sprites.velocityMin,
                sprites.velocityMax
              );
              const angle = gsap.utils.random(sprites.angleMin, sprites.angleMax);

              // A recycled node still holds the previous flight's transform.
              gsap.set(node, {
                x: originX,
                y: originY,
                scale: 0,
                autoAlpha: 0,
                rotation: 0,
              });

              const tl = gsap.timeline({
                onComplete: () => release(bank, node),
              });
              bank.busy.push({ node, tl });

              tl.to(node, {
                scale: 1,
                autoAlpha: 1,
                duration: sprites.popIn,
                ease: ease.out,
              });

              tl.to(
                node,
                {
                  duration: sprites.life,
                  physics2D: { velocity, angle, gravity: sprites.gravity },
                  rotation: gsap.utils.random(-sprites.spin, sprites.spin),
                  ease: ease.none,
                },
                0
              );

              // Fades on the way down, finishing as the flight ends, so sprites
              // dissolve mid-fall rather than blinking out at their apex.
              tl.to(
                node,
                { autoAlpha: 0, duration: sprites.fade, ease: ease.in },
                sprites.life - sprites.fade
              );
            });
          };

          /*
           * Delegated from the scope rather than a handler per trigger.
           * `pointerenter` does not bubble, so this listens for `pointerover`
           * and tracks which element the pointer was last inside — otherwise
           * every move between child nodes would re-fire the burst.
           */
          let insideNow: Element | null = null;
          const greeted = new WeakSet<Element>();

          const onPointerOver = (event: PointerEvent) => {
            const source = (event.target as Element | null)?.closest(trigger);
            if (!source) {
              insideNow = null;
              return;
            }
            if (source === insideNow) return;
            insideNow = source;

            if (mode === "hover-once") {
              if (greeted.has(source)) return;
              greeted.add(source);
            }
            burstFrom(source);
          };

          const onClick = (event: MouseEvent) => {
            const source = (event.target as Element | null)?.closest(trigger);
            if (source) burstFrom(source);
          };

          scope.addEventListener("pointerover", onPointerOver);
          if (mode === "hover-once") scope.addEventListener("click", onClick);

          return () => {
            scope.removeEventListener("pointerover", onPointerOver);
            scope.removeEventListener("click", onClick);
            banks.forEach((bank) => {
              bank.busy.forEach((e) => e.tl.kill());
              bank.busy = [];
              bank.free = [];
            });
            overlay.replaceChildren();
          };
        }
      );

      return () => mm.revert();
    },
    { scope: overlayRef, dependencies: [trigger, mode] }
  );

  return (
    <>
      {/* Rendered once, never shown. Bursts clone these nodes. */}
      <div ref={templatesRef} hidden aria-hidden>
        {logos.map(({ Icon, color, label }) => (
          <span
            key={label}
            data-sprite-template=""
            style={{ color, display: "inline-flex" }}
          >
            <Icon size={sprites.size} />
          </span>
        ))}
      </div>

      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      />
    </>
  );
}
