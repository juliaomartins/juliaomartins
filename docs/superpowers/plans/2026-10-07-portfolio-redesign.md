# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the home page into a minimalist, bilingual (EN/TE) portfolio: sliding navbar underline, simplified hero, new About + roadmap, real Projects list, gallery-wall Skills, 3D removed.

**Architecture:** Each section is a small client leaf (the i18n provider is client-side, so anything calling `useTranslations` is a client component) with server-rendered HTML that is complete without JS. GSAP runs only through `useGSAP` + `gsap.matchMedia()` and only animates transform / opacity / clip-path. All copy lives in `messages/{en,te}.json` with identical key shapes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (CSS-first `@theme`), GSAP 3.15 + `@gsap/react`, next-intl, react-icons, lucide-react. Package manager: **npm** (the repo has `package-lock.json`).

**Spec:** `docs/superpowers/specs/2026-10-07-portfolio-redesign-design.md`

## Global Constraints

- No `any`, no `console.log`, no `tailwind.config.js`, no new animation library, no new runtime dependency.
- GSAP and plugins imported only from `@/motion/registry`; durations/eases/staggers/offsets only from `@/motion/tokens`.
- `useGSAP({ scope })` only — never `useEffect` for animation. Every animation has a `prefers-reduced-motion` branch via `gsap.matchMedia()`.
- No arbitrary Tailwind values for anything that has a token; new sizes go into `@theme` in `src/app/globals.css`. Colours in OKLCH.
- Gallery (`HorizontalGallery`, `GalleryVideo`), Contact (`ContactForm`) and Footer are not modified.
- Every user-visible string exists in both `messages/en.json` and `messages/te.json`. Proper nouns, tech names and URLs are not translated.
- Title is "Developer" (never "Junior Developer"). Experience is "over three years".
- One commit per task.

## Review Focus

1. **Locale switch with no reload** — switching EN↔TE changes link widths; the navbar underline must re-measure and still sit exactly under the active link (Task 3 step "switch locale" check).
2. **JavaScript disabled** — every section's text, links and tiles must be in the SSR HTML and visible (no CSS pre-hiding). Checked in each task by `check-ssr.sh` and once more in Task 7 with a scripts-disabled screenshot.
3. **Reduced motion** — hero, roadmap and skills must render in their final state, and the underline must jump without sliding (Task 7 `--force-prefers-reduced-motion` screenshot).
4. **360px width** — the skills mosaic (2 columns, tall tiles) and roadmap (vertical) must not overflow horizontally (Task 7 screenshot at 360 + `scrollWidth` check).
5. **Removed modules leave no dangling imports** — `content/hero.ts` is imported by `opengraph-image.tsx`; deleting it without updating the OG image breaks the build (Task 2 covers both).

---

## Verification harness (scratchpad, not committed)

There is no test runner in this repo and the stack is locked, so the "failing test" for each task is an assertion against the server-rendered HTML (which is also exactly what a visitor with JavaScript disabled receives). Create these once.

`$SP` = `C:/Users/User/AppData/Local/Temp/claude/c--workplace-juliaomartins/5ea070ec-0e06-49c0-bc1c-811eb8a40204/scratchpad`

- [ ] **H1: Create `$SP/check-ssr.sh`**

```bash
#!/usr/bin/env bash
# usage: LOCALE=en|te check-ssr.sh "literal one" "literal two" ...
# Fetches the SSR HTML (what a no-JS visitor gets) and asserts each literal is present.
# Prefix a literal with "!" to assert it is ABSENT.
LOCALE="${LOCALE:-en}"
html="$(curl -s -H "Cookie: locale=$LOCALE" http://localhost:3100/)"
fail=0
for p in "$@"; do
  if [[ "$p" == !* ]]; then
    needle="${p:1}"
    if grep -qF -- "$needle" <<<"$html"; then echo "FAIL (present) $needle"; fail=1; else echo "PASS (absent) $needle"; fi
  else
    if grep -qF -- "$p" <<<"$html"; then echo "PASS $p"; else echo "FAIL $p"; fail=1; fi
  fi
done
exit $fail
```

- [ ] **H2: Create `$SP/serve.sh`** (build + serve on :3100; run with `run_in_background`)

```bash
#!/usr/bin/env bash
cd /c/workplace/juliaomartins
npx kill-port 3100 >/dev/null 2>&1 || true
npm run build && npx next start -p 3100
```

- [ ] **H3: Create `$SP/shot.sh`** (full-page-ish screenshot)

```bash
#!/usr/bin/env bash
# usage: shot.sh <width> <name> [extra chrome flags...]
W="$1"; N="$2"; shift 2
SPW="$(cygpath -w "$(dirname "$0")")"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --hide-scrollbars --window-size="$W,5200" "$@" \
  --screenshot="$SPW\\$N.png" http://localhost:3100/ 2>/dev/null
echo "$SPW\\$N.png"
```

Note on literals: React escapes `'` as `&#x27;` and `&` as `&amp;` in SSR HTML, so assertion literals below avoid those characters.

---

### Task 1: Remove the 3D computer

**Files:**
- Delete: `components/sections/ComputerVisual.tsx`, `components/Scene.jsx`, `components/Model.jsx`, `public/my_computer.glb`, `hooks/useScrolledPast.ts`
- Modify: `src/app/page.tsx`, `motion/tokens.ts` (drop `computer`), `src/app/globals.css` (drop `reveal-fade` utility + `--duration-reveal` if no other users), `package.json` / `package-lock.json`

**Interfaces:** Produces nothing new. After this task `three`, `@react-three/fiber`, `@react-three/drei` are gone.

- [ ] **Step 1: Failing check** — start `serve.sh` in background, then:

Run: `bash $SP/check-ssr.sh '!my_computer.glb'` and `grep -c "three\|@react-three" package.json`
Expected: grep count ≥ 1 (deps still present) — this is the failing state. (The glb is loaded client-side, so the SSR check passes already; the dependency check is the real red.)

- [ ] **Step 2: Confirm nothing else uses the files**

Run: `grep -rn "ComputerVisual\|Scene\|Model\|useScrolledPast\|reveal-fade\|duration-reveal\|my_computer" components src hooks lib content data motion --include=*.ts --include=*.tsx --include=*.jsx --include=*.css`
Expected: hits only in the files being deleted, `src/app/page.tsx`, `motion/tokens.ts`, `globals.css`.

- [ ] **Step 3: Remove**

```bash
cd /c/workplace/juliaomartins
git rm -q components/sections/ComputerVisual.tsx components/Scene.jsx components/Model.jsx public/my_computer.glb hooks/useScrolledPast.ts
npm uninstall three @react-three/fiber @react-three/drei
```

In `src/app/page.tsx` delete `import ComputerVisual from "@/components/sections/ComputerVisual";` and the `<ComputerVisual />` line.

In `motion/tokens.ts` delete the `computer` export and its doc comment ("The 3D scene. Gating the mount…").

In `src/app/globals.css` delete `--duration-reveal: 360ms;` (+ its comment), the whole "Reveal fade" block (`@utility reveal-fade`, its reduced-motion media query and the `html[data-motion="reduced"] .reveal-fade` rule).

- [ ] **Step 4: Verify** — rerun `serve.sh`; build must be clean. Then `npm run lint` → 0 errors, and `grep -c "three\|@react-three" package.json` → `0`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor: remove 3D computer scene and three.js dependencies"
```

---

### Task 2: Simplified hero (+ tokens, OG image, metadata)

**Files:**
- Create: `components/sections/HeroIntro.tsx`
- Modify: `components/sections/Hero.tsx`, `motion/tokens.ts`, `motion/registry.ts`, `src/app/globals.css`, `src/app/opengraph-image.tsx`, `src/app/layout.tsx`, `messages/en.json`, `messages/te.json`
- Delete: `components/sections/HeroRoleMorph.tsx`, `components/motion/SpriteBurst.tsx`, `content/hero.ts`, `content/logos.ts`

**Interfaces:**
- Produces (tokens, used by Tasks 3–6): `duration.ui = 0.24`; `stagger.each = 0.08`; `offset.rise = 16`, `offset.tile = 24`; `position.follow = "<0.2"`.
- Produces (CSS tokens): `text-lead`, `text-count`, `text-signal` / `bg-signal` / `border-signal` / `ring-signal`, utility `auto-rows-tile`.
- Produces (messages): `home.{eyebrow,intro,currentLabel,currentRole,primaryCta,secondaryCta}`.

- [ ] **Step 1: Failing check**

Run: `bash $SP/check-ssr.sh "Studying AI Engineering" "See my work" '!Transitioning to' '!Junior Developer'`
Expected: FAIL on the first two and on the two absences.

- [ ] **Step 2: Tokens** — replace `motion/tokens.ts` content above `gallery` so the file exports exactly `duration`, `ease`, `stagger`, `offset`, `position`, `gallery`:

```ts
/**
 * Single source of truth for motion timing.
 * Components must never inline a duration, ease, stagger or offset.
 */

export const duration = {
  micro: 0.18,
  /** Navbar underline travel. Micro-interaction range (0.15–0.25s). */
  ui: 0.24,
  sm: 0.28,
  md: 0.36,
  lg: 0.42,
  /** Entrances (0.6–0.9s). */
  xl: 0.8,
} as const;

export const ease = {
  /** Linear. Required for scrub-linked tweens, which must track scroll 1:1. */
  none: "none",
  out: "power3.out",
  in: "power2.in",
  inOut: "power2.inOut",
} as const;

/** Per-item stagger, inside the 0.06–0.12s house range. */
export const stagger = {
  each: 0.08,
} as const;

/** Entrance travel in px. Small on purpose: content settles, it doesn't fly. */
export const offset = {
  rise: 16,
  tile: 24,
} as const;

/** Timeline position parameters. */
export const position = {
  /** Start shortly after the previous tween starts. */
  follow: "<0.2",
} as const;
```

Keep the existing `gallery` export unchanged. `hero`, `sprites`, `staggerAmount` are removed — after Step 6 run `grep -rn "staggerAmount\|sprites\|hero\b" components hooks motion` and expect only `About.tsx` (rewritten in Task 4). Until Task 4, keep `About.tsx` compiling by changing its import to `import { duration, ease, stagger } from "@/motion/tokens";` and replacing each `stagger: { amount: staggerAmount.loose }` with `stagger: stagger.each`.

- [ ] **Step 3: Registry** — check `grep -rn "SplitText\|Physics2DPlugin" components hooks --include=*.tsx --include=*.ts` (expect hits only in files deleted this task). Replace `motion/registry.ts` with:

```ts
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The ONLY place in this codebase where a GSAP plugin is registered.
 * Import gsap and every plugin from here — never from "gsap" directly —
 * so registration can never be duplicated or missed.
 */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
```

- [ ] **Step 4: CSS tokens** in `src/app/globals.css`:
  - In `@theme inline`: replace `--color-hero-accent` / `--color-hero-rule` lines (and their comment) with
    ```css
      /* The single warm accent on an otherwise cool slate page. */
      --color-signal: var(--signal);
    ```
  - Delete `--text-role*` and `--text-stack*` tokens. Keep `--text-name`, `--text-eyebrow`, `--text-note`, `--text-h2`, `--text-control`.
  - Add after `--text-h2--letter-spacing`:
    ```css
      --text-lead: clamp(1.0625rem, 1rem + 0.35vw, 1.25rem);
      --text-lead--line-height: 1.6;

      --text-count: clamp(4.5rem, 3rem + 6vw, 8rem);
      --text-count--line-height: 0.85;
      --text-count--letter-spacing: -0.05em;
    ```
  - In `:root` rename `--hero-accent` → `--signal` and delete `--hero-rule`; same in the dark block.
  - Delete the whole "Hero morph stage" block (`[data-hero-stage]` … `html[data-motion="full"] [data-hero-state="b"]`).
  - Add at the end:
    ```css
    /* Skills gallery row unit. Tall tiles span two. */
    @utility auto-rows-tile {
      grid-auto-rows: clamp(7.5rem, 6rem + 6vw, 11rem);
    }
    ```
  - Verify: `grep -rn "hero-accent\|hero-rule\|text-role\|text-stack\|data-hero" components src` → only files deleted in Step 6.

- [ ] **Step 5: Messages** — in `messages/en.json` replace the `"home"` object with:

```json
"home": {
  "eyebrow": "Developer · Studying AI Engineering",
  "intro": "I'm a developer who builds web and mobile products with React, Next.js and React Native. Now I'm studying AI engineering — learning to build with language models and bring them into real products.",
  "currentLabel": "Currently",
  "currentRole": "IT Collaborator at Viettel Timor (Telemor)",
  "primaryCta": "See my work",
  "secondaryCta": "Get in touch"
},
```

In `messages/te.json`:

```json
"home": {
  "eyebrow": "Developer · Estuda AI Engineering",
  "intro": "Ha'u developer ida ne'ebé harii produtu web no mobile ho React, Next.js no React Native. Agora ha'u estuda hela AI engineering — aprende oinsá harii ho modelu lian (language models) no hatama sira ba produtu reál.",
  "currentLabel": "Agora dadaun",
  "currentRole": "IT Kolaborador iha Viettel Timor (Telemor)",
  "primaryCta": "Haree ha'u-nia servisu",
  "secondaryCta": "Kontaktu ha'u"
},
```

- [ ] **Step 6: Delete morph files**

```bash
git rm -q components/sections/HeroRoleMorph.tsx components/motion/SpriteBurst.tsx content/hero.ts content/logos.ts
```

- [ ] **Step 7: Create `components/sections/HeroIntro.tsx`**

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { gsap } from "@/motion/registry";
import { duration, ease, offset, stagger } from "@/motion/tokens";

/**
 * Everything in the hero that changes with the locale. The portrait and the
 * <h1> stay in the server component — they never depend on JavaScript.
 *
 * Motion: one quiet settle on load. Reduced motion keeps the server-rendered
 * final state, which is the designed static layout, not a disabled animation.
 */
export default function HeroIntro() {
  const t = useTranslations("home");
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-reveal]", {
          autoAlpha: 0,
          y: offset.rise,
          duration: duration.xl,
          ease: ease.out,
          stagger: stagger.each,
          clearProps: "opacity,visibility,transform",
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="mt-4 flex flex-col items-center">
      <p
        data-reveal
        className="text-eyebrow font-mono uppercase text-signal"
      >
        {t("eyebrow")}
      </p>

      <p data-reveal className="mt-8 max-w-xl text-lead text-muted-foreground">
        {t("intro")}
      </p>

      <p data-reveal className="mt-6 text-note text-muted-foreground">
        <span className="font-medium text-foreground">{t("currentLabel")}</span>
        {" — "}
        {t("currentRole")}
      </p>

      <div data-reveal className="mt-10 flex flex-wrap justify-center gap-3">
        <a
          href="#projects"
          className="press inline-flex min-h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
        >
          {t("primaryCta")}
        </a>
        <a
          href="#contact"
          className="press inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-97"
        >
          {t("secondaryCta")}
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Replace `components/sections/Hero.tsx`**

```tsx
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
```

- [ ] **Step 9: OG image** — in `src/app/opengraph-image.tsx` replace the `heroCopy` import and usages:

```tsx
import en from "../../messages/en.json";

const NAME = "Julião Martins";

export const alt = `${NAME} — ${en.home.eyebrow}`;
```

and inside the component use `en.home.eyebrow` for the small uppercase line (where `connector` was), `NAME` in the big line (where `roleB` was, keep its 104px style), and `` `${en.home.currentLabel} — ${en.home.currentRole}` `` for the line that used `current`. Delete any remaining `heroCopy` references and update the doc comment to "All copy here comes from messages/en.json."

- [ ] **Step 10: Metadata** in `src/app/layout.tsx`:
  - `title.default` and `openGraph.title` and `twitter.title` → `"Julião Martins – Developer"`
  - `description` → `"Portfolio of Julião Martins, a developer building web and mobile products with React, Next.js and React Native — now studying AI engineering."`
  - `openGraph.description` → same as description.
  - keywords: replace `"Junior developer Timor Leste"` with `"Developer Timor Leste"` and add `"AI Engineer Timor Leste"`.

- [ ] **Step 11: Verify** — rerun `serve.sh` (clean build), `npm run lint` (0 errors), then:

Run: `bash $SP/check-ssr.sh "Studying AI Engineering" "See my work" "IT Collaborator at Viettel Timor" '!Transitioning to' '!Junior Developer'`
Expected: all PASS.
Run: `LOCALE=te bash $SP/check-ssr.sh "Estuda AI Engineering" "Kontaktu ha"`
Expected: all PASS.
Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/opengraph-image` → `200`.
Screenshot: `bash $SP/shot.sh 1440 t2-hero-1440` and `bash $SP/shot.sh 360 t2-hero-360`; view both.

- [ ] **Step 12: Commit**

```bash
git add -A && git commit -m "feat(hero): simplified bilingual hero; drop role morph and sprite burst"
```

---

### Task 3: Navbar sliding underline

**Files:**
- Create: `hooks/useActiveSection.ts`, `components/layout/DesktopNav.tsx`
- Modify: `components/layout/Navbar.tsx`, `messages/en.json`, `messages/te.json`

**Interfaces:**
- Consumes: `duration.ui`, `ease.out` (Task 2).
- Produces: `useActiveSection(ids: readonly string[]): string`; `DesktopNav({ items: readonly NavItem[]; active: string; label: string; children?: ReactNode })`, `type NavItem = { id: string; label: string }`.

- [ ] **Step 1: Failing check**

Run: `bash $SP/check-ssr.sh 'data-nav-indicator' 'aria-current="true"' 'aria-label="Main navigation"'`
Expected: FAIL ×3.

- [ ] **Step 2: Messages** — add to `a11y` in `en.json`: `"mainNav": "Main navigation"`; in `te.json`: `"mainNav": "Navegasaun prinsipál"`.

- [ ] **Step 3: Create `hooks/useActiveSection.ts`**

```ts
import { useEffect, useState } from "react";

/**
 * Scroll-spy. Returns the id of the section currently crossing a thin line
 * just above the middle of the viewport. `ids` must be a stable (module-level)
 * array, or the observer is rebuilt on every render.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Collapse the root to a 1%-tall band at 45% of the viewport height.
      { rootMargin: "-45% 0px -54% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
```

- [ ] **Step 4: Create `components/layout/DesktopNav.tsx`**

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import { useLocale } from "next-intl";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { gsap } from "@/motion/registry";
import { duration, ease } from "@/motion/tokens";

export type NavItem = { id: string; label: string };

type Props = {
  items: readonly NavItem[];
  /** Section currently in view. */
  active: string;
  /** Accessible name for the list. */
  label: string;
  /** Extra <li> controls (theme, language) rendered after the links. */
  children?: ReactNode;
};

/**
 * One underline for the whole list. It rests under the section in view and
 * slides to whichever link is hovered or keyboard-focused, then returns.
 * Transform only (x + scaleX); with reduced motion it jumps instead of sliding.
 * Without JS the bar never appears and the links work as plain anchors.
 */
export default function DesktopNav({ items, active, label, children }: Props) {
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const reducedRef = useRef(false);
  const placedRef = useRef(false);
  const targetRef = useRef(active);
  const [preview, setPreview] = useState<string | null>(null);
  const locale = useLocale();

  const target = preview ?? active;

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        reducedRef.current = true;
        return () => {
          reducedRef.current = false;
        };
      });
      return () => mm.revert();
    },
    { scope: listRef }
  );

  const placeBar = contextSafe((id: string, animate: boolean) => {
    const list = listRef.current;
    const bar = barRef.current;
    const link = list?.querySelector<HTMLElement>(`a[href="#${id}"]`);
    if (!list || !bar || !link) return;

    gsap.to(bar, {
      x: link.offsetLeft,
      scaleX: link.offsetWidth / bar.offsetWidth,
      autoAlpha: 1,
      duration: animate && !reducedRef.current ? duration.ui : 0,
      ease: ease.out,
      overwrite: "auto",
    });
  });

  // Move on every target change. Locale is a dependency because link widths
  // change between English and Tetum.
  useGSAP(
    () => {
      targetRef.current = target;
      placeBar(target, placedRef.current);
      placedRef.current = true;
    },
    { dependencies: [target, locale], scope: listRef }
  );

  // Re-measure without animating when the list resizes (font swap, viewport).
  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const observer = new ResizeObserver(() =>
        placeBar(targetRef.current, false)
      );
      observer.observe(list);
      return () => observer.disconnect();
    },
    { scope: listRef }
  );

  return (
    <ul
      ref={listRef}
      aria-label={label}
      onMouseLeave={() => setPreview(null)}
      className="relative hidden list-none items-center gap-7 py-1 sm:flex"
    >
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "true" : undefined}
              onMouseEnter={() => setPreview(item.id)}
              onFocus={() => setPreview(item.id)}
              onBlur={() => setPreview(null)}
              className={cn(
                "tap-target block rounded-sm py-2 text-sm font-medium outline-none transition-colors duration-(--duration-micro)",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          </li>
        );
      })}

      {children}

      <span
        ref={barRef}
        data-nav-indicator=""
        aria-hidden
        className="pointer-events-none invisible absolute bottom-0 left-0 h-0.5 w-10 origin-left rounded-full bg-foreground"
      />
    </ul>
  );
}
```

- [ ] **Step 5: Wire into `components/layout/Navbar.tsx`**
  - Imports: add `import { useActiveSection } from "@/hooks/useActiveSection";` and `import DesktopNav, { type NavItem } from "./DesktopNav";`.
  - Module scope, above the component:
    ```ts
    const SECTION_IDS = ["home", "about", "projects", "skills", "gallery", "contact"] as const;
    ```
  - In the component: `const active = useActiveSection(SECTION_IDS);` and build
    ```ts
    const navItems: readonly NavItem[] = SECTION_IDS.map((id) => ({
      id,
      label: t(`nav.${id}`),
    }));
    ```
  - Replace the whole desktop `<ul className="hidden list-none …">…</ul>` (including the long Radix comment above it) with:
    ```tsx
    <DesktopNav items={navItems} active={active} label={t("a11y.mainNav")}>
      <li>
        <ThemeToggleButton onToggle={toggleTheme} />
      </li>
      <li>
        <LanguageSwitcher className="ml-1" />
      </li>
    </DesktopNav>
    ```
  - Mobile sheet links: `key={item.id}`, `href={`#${item.id}`}`, add `aria-current={item.id === active ? "true" : undefined}` and make the class `cn("tap-target text-lg font-medium transition-colors hover:text-foreground", item.id === active ? "text-foreground" : "text-muted-foreground")`.

- [ ] **Step 6: Verify** — rerun `serve.sh`, lint clean, then:

Run: `bash $SP/check-ssr.sh 'data-nav-indicator' 'aria-current="true"' 'aria-label="Main navigation"'` → all PASS.
Behaviour (screenshots): `bash $SP/shot.sh 1440 t3-nav-top` — underline under "Home". For the scrolled state, open `http://localhost:3100/#skills` in the screenshot (`shot.sh` with URL edited, or a copy that takes a URL) and confirm the underline sits under "Skills".
Locale switch: `LOCALE=te` screenshot at `#about` — underline sits under "Konaba Hau" with matching width.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(navbar): sliding underline that follows the active section"
```

---

### Task 4: About + roadmap

**Files:**
- Create: `components/sections/Roadmap.tsx`
- Modify: `components/sections/About.tsx` (full rewrite), `types/timeline.ts`, `messages/en.json`, `messages/te.json`

**Interfaces:**
- Consumes: `duration.xl`, `ease.out`, `stagger.each`, `offset.rise`, `position.follow`; `text-lead`, `text-signal`.
- Produces: `TimelineItem` gains `status: "past" | "current" | "next"`.

- [ ] **Step 1: Failing check**

Run: `bash $SP/check-ssr.sh "over three years" "data-roadmap-stop" "Learning to build products with language models" '!past four months'`
Expected: FAIL on all.

- [ ] **Step 2: `types/timeline.ts`**

```ts
export type TimelineItem = {
  year: string;
  title: string;
  company: string;
  description: string;
  status: "past" | "current" | "next";
};
```

- [ ] **Step 3: Messages** — replace the `"about"` object in `en.json`:

```json
"about": {
  "title": "About Me",
  "paragraph1": "I'm a developer with over three years of professional experience in IT and systems maintenance. At Leader Group I looked after hardware, networking and databases for retail systems — both the cashier front line and the back office — across Leader Hypermarket, Leader Mart, Cement Timor, Auto Timor Leste and Lisun Timor.",
  "paragraph2": "Since 2025 I've been an IT Collaborator in the Software Development department at Viettel Timor (Telemor), one of Timor-Leste's leading telecommunications companies, building real applications used by staff and customers.",
  "roadmapTitle": "Roadmap",
  "timeline": [
    { "year": "2023 – 2025", "title": "IT Support", "company": "Leader Group", "description": "Kept retail systems, networks and databases running.", "status": "past" },
    { "year": "2025 – Now", "title": "IT Collaborator", "company": "Viettel Timor (Telemor)", "description": "Building software in the Software Development department.", "status": "current" },
    { "year": "Next", "title": "AI Engineer", "company": "Studying", "description": "Learning to build products with language models.", "status": "next" }
  ]
},
```

and in `te.json`:

```json
"about": {
  "title": "Konaba Ha'u",
  "paragraph1": "Ha'u developer ida ho esperiénsia profisionál liu tinan tolu iha área IT no manutensaun sistema. Iha Leader Group, ha'u tau matan ba hardware, rede (networking) no baze-dadus ba sistema retail — kaixa (frontline) no back-office — iha Leader Hypermarket, Leader Mart, Cement Timor, Auto Timor Leste no Lisun Timor.",
  "paragraph2": "Desde 2025, ha'u servisu hanesan IT Kolaborador iha departamentu Software Development iha Viettel Timor (Telemor), kompañia telekomunikasaun boot ida iha Timor-Leste, hodi harii aplikasaun reál ne'ebé funsionáriu no kliente sira uza.",
  "roadmapTitle": "Dalan Karreira",
  "timeline": [
    { "year": "2023 – 2025", "title": "Apoiu IT", "company": "Leader Group", "description": "Mantein sistema retail, rede no baze-dadus la'o di'ak.", "status": "past" },
    { "year": "2025 – Agora", "title": "IT Kolaborador", "company": "Viettel Timor (Telemor)", "description": "Harii software iha departamentu Software Development.", "status": "current" },
    { "year": "Tuir mai", "title": "AI Engineer", "company": "Estuda hela", "description": "Aprende harii produtu ho modelu lian (language models).", "status": "next" }
  ]
},
```

Also set `nav.about` in `te.json` to `"Konaba Ha'u"` for consistency with the title.

- [ ] **Step 4: Create `components/sections/Roadmap.tsx`**

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

import { cn } from "@/lib/utils";
import { gsap } from "@/motion/registry";
import { duration, ease, offset, position, stagger } from "@/motion/tokens";
import type { TimelineItem } from "@/types/timeline";

/**
 * One hairline, three stops. Horizontal from md, vertical below.
 * The rule draws once on entry and the stops settle after it. Reduced motion
 * and no-JS both get the server-rendered final state.
 */
export default function Roadmap() {
  const t = useTranslations("about");
  const items = t.raw("timeline") as TimelineItem[];
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          narrow: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { wide } = context.conditions as { wide: boolean; narrow: boolean };
          const tl = gsap.timeline({
            defaults: { ease: ease.out, duration: duration.xl },
            scrollTrigger: { trigger: rootRef.current, start: "top 80%", once: true },
          });

          tl.from("[data-roadmap-rule]", {
            ...(wide
              ? { scaleX: 0, transformOrigin: "left center" }
              : { scaleY: 0, transformOrigin: "center top" }),
            clearProps: "transform",
          }).from(
            "[data-roadmap-stop]",
            {
              autoAlpha: 0,
              y: offset.rise,
              stagger: stagger.each,
              clearProps: "opacity,visibility,transform",
            },
            position.follow
          );
        }
      );
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className="mt-20">
      <h3 className="text-eyebrow font-mono uppercase text-muted-foreground">
        {t("roadmapTitle")}
      </h3>

      <div className="relative mt-10">
        <span
          data-roadmap-rule=""
          aria-hidden
          className="absolute bottom-0 left-1.75 top-0 w-px bg-border md:bottom-auto md:left-0 md:right-0 md:top-1.75 md:h-px md:w-auto"
        />

        <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
          {items.map((item) => (
            <li
              key={item.year}
              data-roadmap-stop=""
              className="relative pl-10 md:pl-0 md:pt-10"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-0 size-3.5 rounded-full border-2",
                  item.status === "next"
                    ? "border-signal bg-background"
                    : "border-foreground bg-foreground",
                  item.status === "current" && "ring-4 ring-signal/30"
                )}
              />
              <p
                className={cn(
                  "text-h2 font-semibold tabular-nums",
                  item.status === "next" && "text-signal"
                )}
              >
                {item.year}
              </p>
              <h4 className="mt-3 font-medium text-foreground">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.company}</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Replace `components/sections/About.tsx`**

```tsx
"use client";

import { useTranslations } from "next-intl";

import Roadmap from "./Roadmap";

export default function About() {
  const t = useTranslations("about");

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 className="text-h2 font-semibold">{t("title")}</h2>

      <div className="mt-8 grid max-w-3xl gap-5 text-lead text-muted-foreground">
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2")}</p>
      </div>

      <Roadmap />
    </section>
  );
}
```

- [ ] **Step 6: Verify** — rerun `serve.sh`, lint clean, then:

Run: `bash $SP/check-ssr.sh "over three years" "data-roadmap-stop" "Learning to build products with language models" '!past four months' '!PIN_COLORS'`
Run: `LOCALE=te bash $SP/check-ssr.sh "liu tinan tolu" "Dalan Karreira" "Tuir mai"`
Expected: all PASS. Screenshots at 1440 and 360 of `/#about`; check dot centred on the rule (adjust `left-1.75`/`top-1.75` if off by more than 1px).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(about): rewrite copy and replace road timeline with minimal roadmap"
```

---

### Task 5: Projects index list

**Files:**
- Modify: `components/sections/Projects.tsx` (full rewrite), `messages/en.json`, `messages/te.json`

**Interfaces:** Produces messages `projects.{title,openInNewTab,items[]}` where each item is `{ name, description, tags: string[], linkLabel, href }`.

- [ ] **Step 1: Failing check**

Run: `bash $SP/check-ssr.sh "https://apps.apple.com/us/app/life-mor/id6754350114" "https://cooptl.com/" "https://github.com/juliaomartins/visitor-management-system" '!A concept project'`
Expected: FAIL on all.

- [ ] **Step 2: Messages** — replace `"projects"` in `en.json`:

```json
"projects": {
  "title": "Projects",
  "openInNewTab": "(opens in a new tab)",
  "items": [
    {
      "name": "Life Mor",
      "description": "iOS app for Telemor staff to manage their daily work activities, published on the App Store.",
      "tags": ["React Native", "iOS"],
      "linkLabel": "App Store",
      "href": "https://apps.apple.com/us/app/life-mor/id6754350114"
    },
    {
      "name": "DRCCMD 2026",
      "description": "Official website of the Díli Regional Cooperative Conference and Ministerial Dialogue 2026, held alongside the ASEAN Cooperative Expo 2026.",
      "tags": ["Next.js", "Website"],
      "linkLabel": "Visit site",
      "href": "https://cooptl.com/"
    },
    {
      "name": "Visitor and Queue System",
      "description": "Event badge and queue system for DRCCMD 2026 at Palm Spring: register visitors, print QR badges, scan arrivals by phone and welcome them on the lobby screen.",
      "tags": ["Django", "Next.js", "React Native"],
      "linkLabel": "GitHub",
      "href": "https://github.com/juliaomartins/visitor-management-system"
    }
  ]
},
```

and in `te.json`:

```json
"projects": {
  "title": "Projetu sira",
  "openInNewTab": "(loke iha tab foun)",
  "items": [
    {
      "name": "Life Mor",
      "description": "Aplikasaun iOS ba funsionáriu Telemor sira hodi jere sira-nia atividade servisu loroloron, publika iha App Store.",
      "tags": ["React Native", "iOS"],
      "linkLabel": "App Store",
      "href": "https://apps.apple.com/us/app/life-mor/id6754350114"
    },
    {
      "name": "DRCCMD 2026",
      "description": "Website ofisiál ba Díli Regional Cooperative Conference and Ministerial Dialogue 2026, ne'ebé hala'o hamutuk ho ASEAN Cooperative Expo 2026.",
      "tags": ["Next.js", "Website"],
      "linkLabel": "Vizita website",
      "href": "https://cooptl.com/"
    },
    {
      "name": "Sistema Vizitante no Fila",
      "description": "Sistema kartaun no fila ba vizitante sira iha DRCCMD 2026 iha Palm Spring: rejista vizitante, imprime kartaun ho QR, scan sira-nia to'o ho telefone no simu sira iha ekran lobby.",
      "tags": ["Django", "Next.js", "React Native"],
      "linkLabel": "GitHub",
      "href": "https://github.com/juliaomartins/visitor-management-system"
    }
  ]
},
```

- [ ] **Step 3: Replace `components/sections/Projects.tsx`**

```tsx
"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";

type ProjectItem = {
  name: string;
  description: string;
  tags: string[];
  linkLabel: string;
  href: string;
};

/** Typographic index. No entrance animation — content first. */
export default function Projects() {
  const t = useTranslations("projects");
  const items = t.raw("items") as ProjectItem[];

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <h2 className="text-h2 font-semibold">{t("title")}</h2>

      <ol className="mt-12 border-t border-border">
        {items.map((project, index) => (
          <li
            key={project.href}
            className="group grid gap-4 border-b border-border py-8 md:grid-cols-12 md:gap-8 md:py-10"
          >
            <span
              aria-hidden
              className="font-mono text-sm tabular-nums text-muted-foreground md:col-span-1"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="md:col-span-8">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h3>
              <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
                {project.description}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                {project.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 md:justify-self-end">
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex min-h-11 items-center gap-2 rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:opacity-70"
              >
                {project.linkLabel}
                <span className="sr-only"> {t("openInNewTab")}</span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform duration-(--duration-micro) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 4: Verify** — rerun `serve.sh`, lint clean; rerun Step 1 command → all PASS; `LOCALE=te bash $SP/check-ssr.sh "Sistema Vizitante no Fila" "loke iha tab foun"` → PASS. Screenshots at 1440 and 360 of `/#projects`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(projects): real project index with outbound links"
```

---

### Task 6: Skills gallery wall

**Files:**
- Create: `components/ui/GsapLogo.tsx`
- Modify: `data/skills.ts` (full rewrite), `components/sections/Skills.tsx` (full rewrite), `src/app/page.tsx` (rename import `SKills` → `Skills`), `messages/en.json`, `messages/te.json`
- Delete (if no imports remain): `components/ui/badge.tsx`, `components/ui/card.tsx`

**Interfaces:**
- Consumes: `ScrollTrigger` + `gsap` from registry; `duration.xl`, `ease.out`, `stagger.each`, `offset.tile`; `text-count`, `text-signal`, `auto-rows-tile`.
- Produces: `type SkillKey`, `type Skill = { key: SkillKey; name: string; icon: ComponentType<{ className?: string }>; brand?: string; wordmark?: boolean }`, `skills: readonly Skill[]`.

- [ ] **Step 1: Failing check**

Run: `bash $SP/check-ssr.sh "data-skill-tile" "Supabase" "Claude Code" "Vercel" "viewBox=\"0 0 82 30\"" "review every line" '!Firebase'`
Expected: FAIL on all.

- [ ] **Step 2: Messages** — replace `"skills"` in `en.json`:

```json
"skills": {
  "title": "Skills",
  "description": "I work with AI coding agents like Claude Code every day — and I use them responsibly. I review every line they produce and keep architecture and judgement in my own hands. For me they are a way to ship better work faster, not a substitute for knowing my craft.",
  "countCaption": "Tools I build with",
  "labels": {
    "tailwind": "Styling",
    "gsap": "Animation",
    "react": "UI library",
    "next": "Web framework",
    "reactNative": "Mobile apps",
    "supabase": "Backend and database",
    "django": "Backend framework",
    "vercel": "Deployment",
    "claudeCode": "AI coding agent"
  }
},
```

and in `te.json`:

```json
"skills": {
  "title": "Abilidade sira",
  "description": "Ha'u servisu ho AI coding agent hanesan Claude Code loroloron — no ha'u uza sira ho responsabilidade. Ha'u revee liña ida-idak ne'ebé sira hakerek, no ha'u rasik mak kaer arkitetura no desizaun. Ba ha'u, sira mak meius atu entrega servisu di'ak liu no lalais liu, la'ós atu troka ha'u-nia koñesimentu profisionál.",
  "countCaption": "Ferramenta ne'ebé ha'u uza",
  "labels": {
    "tailwind": "Estilu",
    "gsap": "Animasaun",
    "react": "Biblioteka UI",
    "next": "Framework web",
    "reactNative": "Aplikasaun mobile",
    "supabase": "Backend no baze-dadus",
    "django": "Framework backend",
    "vercel": "Deployment",
    "claudeCode": "Ajente AI ba kódigu"
  }
},
```

(Note: EN uses "they are" rather than "they're" so the SSR assertion literal "review every line" stays apostrophe-free; the sentence reads the same.)

- [ ] **Step 3: Create `components/ui/GsapLogo.tsx`** — the official GSAP wordmark, taken from the header logo on gsap.com (letter paths only; the hover-only gradient/noise decorations are omitted). Fill is `currentColor` so it follows the theme like the other icons.

```tsx
/** Official GSAP wordmark (gsap.com header logo, letterforms only). */
export default function GsapLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 82 30"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M23.81 14.012v.013l-1.075 4.666c-.058.264-.322.457-.626.457H20.81a.218.218 0 0 0-.208.156c-1.198 4.064-2.82 6.857-4.962 8.534-1.822 1.428-4.068 2.094-7.069 2.094-2.696 0-4.514-.867-6.056-2.579-2.038-2.262-2.88-5.966-2.37-10.428C1.065 8.548 5.41.095 13.776.095c2.545-.022 4.543.763 5.933 2.33 1.47 1.658 2.216 4.154 2.22 7.422a.55.55 0 0 1-.549.536h-6.13a.42.42 0 0 1-.407-.41c-.05-2.26-.72-3.36-2.052-3.36-2.35 0-3.736 3.19-4.471 4.958-1.027 2.47-1.55 5.153-1.447 7.825.049 1.244.249 2.993 1.43 3.718 1.047.642 2.541.216 3.446-.495.904-.712 1.632-1.943 1.938-3.066.043-.156.046-.277.005-.331-.043-.056-.162-.069-.253-.069h-1.574a.572.572 0 0 1-.438-.202.42.42 0 0 1-.087-.362l1.076-4.674c.053-.239.27-.42.537-.452v-.012h10.33c.024 0 .049 0 .072.005.268.035.457.284.452.556h.002Z" />
      <path d="M41.595 8.65a.548.548 0 0 1-.548.53h-5.646c-.37 0-.679-.3-.679-.665 0-1.647-.57-2.449-1.736-2.449s-1.918.716-1.94 1.967c-.025 1.395.764 2.663 3.01 4.841 2.957 2.774 4.142 5.231 4.085 8.479C38.048 26.605 34.477 30 29.043 30c-2.775 0-4.895-.742-6.305-2.206-1.431-1.487-2.087-3.669-1.95-6.485a.548.548 0 0 1 .549-.53h5.84a.55.55 0 0 1 .422.208.48.48 0 0 1 .106.384c-.065 1.016.112 1.775.512 2.195.256.272.613.41 1.058.41 1.079 0 1.711-.762 1.735-2.09.02-1.148-.343-2.154-2.321-4.189-2.555-2.496-4.846-5.075-4.775-9.13.042-2.352.976-4.503 2.631-6.057C28.295.868 30.688 0 33.466 0c2.783.02 4.892.814 6.269 2.36 1.304 1.465 1.931 3.581 1.862 6.29h-.002Z" />
      <path d="m59.095 29.012.037-27.933a.525.525 0 0 0-.529-.533h-8.738c-.294 0-.423.253-.507.42L36.706 28.841v.005l-.005.007c-.14.343.126.71.497.71h6.108c.33 0 .549-.1.656-.308l1.213-2.915c.149-.389.177-.425.601-.425h5.836c.406 0 .414.008.408.405l-.131 2.71a.525.525 0 0 0 .528.533h6.171a.523.523 0 0 0 .403-.182.458.458 0 0 0 .104-.369Zm-10.81-9.326a1.67 1.67 0 0 1-.138-.005.147.147 0 0 1-.13-.184c.012-.04.029-.095.054-.162l4.376-10.828a2.99 2.99 0 0 1 .136-.313c.071-.146.157-.156.184-.048.023.09-.502 11.118-.502 11.118-.041.413-.06.43-.467.464l-3.509-.04h-.008l.003-.002Z" />
      <path d="M71.543.546h-4.639c-.245 0-.52.13-.584.422l-6.456 28.03a.423.423 0 0 0 .088.363.573.573 0 0 0 .437.202h5.798c.312 0 .525-.153.583-.418l.704-3.177c.05-.248-.036-.44-.258-.556a52.313 52.313 0 0 1-.312-.162l-1.005-.523-1-.522-.387-.201a.186.186 0 0 1-.103-.17.199.199 0 0 1 .2-.194l3.177.014c.95.005 1.901-.062 2.836-.234 6.58-1.215 10.95-6.485 11.076-13.656.108-6.12-3.308-9.221-10.15-9.221l-.005.003Zm-1.579 16.68h-.124c-.279 0-.328-.03-.336-.04-.005-.007 1.832-8.073 1.833-8.084.047-.233.045-.367-.099-.446-.184-.102-2.866-1.516-2.866-1.516a.189.189 0 0 1-.101-.172.197.197 0 0 1 .197-.192h4.241c1.32.04 2.056 1.221 2.021 3.238-.061 3.491-1.721 7.09-4.766 7.213Z" />
    </svg>
  );
}
```

Implementation note: the four `d` strings are byte-for-byte copies of `$SP/gsap-wordmark.svg` (extracted from gsap.com and visually verified). Copy them from that file rather than retyping.

- [ ] **Step 4: Replace `data/skills.ts`**

```ts
import type { ComponentType } from "react";
import {
  SiClaude,
  SiDjango,
  SiNextdotjs,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiVercel,
} from "react-icons/si";

import GsapLogo from "@/components/ui/GsapLogo";

export type SkillKey =
  | "tailwind"
  | "gsap"
  | "react"
  | "next"
  | "reactNative"
  | "supabase"
  | "django"
  | "vercel"
  | "claudeCode";

export type Skill = {
  key: SkillKey;
  /** Product name. Never translated. */
  name: string;
  icon: ComponentType<{ className?: string }>;
  /** Hover tint (OKLCH). Omitted for black/white marks, which stay foreground. */
  brand?: string;
  /** Wide wordmark rather than a square glyph — sized by height. */
  wordmark?: boolean;
};

export const skills: readonly Skill[] = [
  { key: "tailwind", name: "Tailwind CSS", icon: SiTailwindcss, brand: "oklch(0.715 0.126 215.2)" },
  { key: "gsap", name: "GSAP", icon: GsapLogo, brand: "oklch(0.8 0.246 145.5)", wordmark: true },
  { key: "react", name: "React", icon: SiReact, brand: "oklch(0.832 0.117 218.7)" },
  { key: "next", name: "Next.js", icon: SiNextdotjs },
  { key: "reactNative", name: "React Native", icon: SiReact, brand: "oklch(0.832 0.117 218.7)" },
  { key: "supabase", name: "Supabase", icon: SiSupabase, brand: "oklch(0.762 0.154 159.4)" },
  { key: "django", name: "Django", icon: SiDjango, brand: "oklch(0.703 0.123 164.4)" },
  { key: "vercel", name: "Vercel", icon: SiVercel },
  { key: "claudeCode", name: "Claude Code", icon: SiClaude, brand: "oklch(0.672 0.131 38.8)" },
];
```

- [ ] **Step 5: Replace `components/sections/Skills.tsx`**

Layout rule: tiles at index 0, 3, 6 span two rows. With 3 columns that packs into exactly 4 rows and with 2 columns into exactly 6 rows — no holes at either width (the diagonal of tall tiles is the "gallery wall" rhythm from the reference).

```tsx
"use client";

import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";
import { useRef, type CSSProperties } from "react";

import { skills } from "@/data/skills";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/motion/registry";
import { duration, ease, offset, stagger } from "@/motion/tokens";

const HIDDEN_CLIP = "inset(100% 0% 0% 0%)";
const SHOWN_CLIP = "inset(0% 0% 0% 0%)";

export default function Skills() {
  const t = useTranslations("skills");
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray<HTMLElement>("[data-skill-tile]", rootRef.current);
        // Hidden only once JS is running — the SSR/no-JS state is fully visible.
        gsap.set(tiles, { clipPath: HIDDEN_CLIP, y: offset.tile });
        ScrollTrigger.batch(tiles, {
          start: "top 80%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              clipPath: SHOWN_CLIP,
              y: 0,
              duration: duration.xl,
              ease: ease.out,
              stagger: stagger.each,
              clearProps: "clipPath,transform",
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <section ref={rootRef} id="skills" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <h2 className="text-h2 font-semibold">{t("title")}</h2>
          <p className="mt-6 max-w-2xl text-lead text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <p className="lg:col-span-4 lg:text-right">
          <span className="block text-count font-semibold tabular-nums text-signal">
            {String(skills.length).padStart(2, "0")}
          </span>
          <span className="mt-3 block text-sm text-muted-foreground">
            {t("countCaption")}
          </span>
        </p>
      </div>

      <ul className="mt-14 grid auto-rows-tile grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
        {skills.map((skill, index) => {
          const tall = index % 3 === 0;
          const Icon = skill.icon;
          return (
            <li
              key={skill.key}
              data-skill-tile=""
              style={skill.brand ? ({ "--brand": skill.brand } as CSSProperties) : undefined}
              className={cn(
                "group flex flex-col justify-between rounded-xl border border-border bg-card p-5 md:p-6",
                tall && "row-span-2"
              )}
            >
              <span aria-hidden className="block">
                <Icon
                className={cn(
                  "text-foreground transition-colors duration-(--duration-micro) group-hover:text-(--brand)",
                  skill.wordmark
                    ? tall ? "h-8 w-auto md:h-10" : "h-6 w-auto md:h-8"
                    : tall ? "size-10 md:size-14" : "size-8 md:size-10"
                )}
                />
              </span>
              <div>
                <p className="font-medium text-foreground">{skill.name}</p>
                <p className="text-sm text-muted-foreground">{t(`labels.${skill.key}`)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

The icon is wrapped in `<span aria-hidden>` because the product name is already in the text below it; react-icons do not set `aria-hidden` themselves.

- [ ] **Step 6: page.tsx** — `import Skills from "@/components/sections/Skills";` and `<Skills />` (fixes the `SKills` typo).

- [ ] **Step 7: Remove unused UI primitives**

Run: `grep -rn "components/ui/badge\|components/ui/card" components src`
If no hits: `git rm -q components/ui/badge.tsx components/ui/card.tsx`.

- [ ] **Step 8: Verify** — rerun `serve.sh`, lint clean; rerun Step 1 command → all PASS (Firebase absent). `LOCALE=te bash $SP/check-ssr.sh "Abilidade sira" "Ajente AI ba"` → PASS. Screenshots of `/#skills` at 1440, 768, 360 — confirm 3-col and 2-col mosaics have no holes and the GSAP wordmark renders.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(skills): gallery-wall skills with official GSAP wordmark"
```

---

### Task 7: Whole-page verification + simplification pass

**Files:** none planned; fixes go into the file they concern, committed as `fix: …`.

- [ ] **Step 1: Simplify** — run the `code-simplifier:code-simplifier` agent over the files changed in Tasks 1–6 (`git diff --name-only 4f0f292..HEAD`). Apply only behaviour-preserving changes; rebuild.

- [ ] **Step 2: Static rules**

```bash
cd /c/workplace/juliaomartins
grep -rn "console.log\|: any\b\|as any" components hooks motion data src types || echo "clean"
ls tailwind.config.* 2>/dev/null || echo "no tailwind config"
grep -rn "framer-motion\|aos\|locomotive\|jquery\|three" package.json || echo "no extra libs"
grep -rnE "duration: [0-9]|stagger: [0-9]|delay: [0-9]" components hooks || echo "no hardcoded motion"
```

Expected: all four print their "clean" message.

- [ ] **Step 3: Responsive screenshots** — `shot.sh` at 360, 768, 1024, 1440, 1920 (EN) and 360 + 1440 (TE). View each; at 360 confirm nothing is clipped at the right edge (the page `<main>` has `overflow-hidden`, so overflow shows up as clipped content rather than a scrollbar). 200% zoom ≈ 720px CSS width at 1440 — covered by the 768 shot.

- [ ] **Step 4: No-JS** — `bash $SP/shot.sh 1440 t7-nojs --blink-settings=scriptEnabled=false` — every section visible, no underline, no blank tiles.

- [ ] **Step 5: Reduced motion** — `bash $SP/shot.sh 1440 t7-reduced --force-prefers-reduced-motion` — hero, roadmap and tiles in final state.

- [ ] **Step 6: Lighthouse (mobile)** — `npx -y lighthouse http://localhost:3100/ --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --chrome-flags="--headless=new" --output=json --output-path=$SP/lh.json --quiet` then print the four scores + LCP/CLS. Report actual numbers against the budget (95/100/100/95, LCP ≤ 2.0s, CLS ≤ 0.02). If the run is not possible, say so.

- [ ] **Step 7: Report** — what passed, what was not verifiable (keyboard-only pass and 60fps/long-task profiling need a real browser session), and the list of every new Tetum string for Julião's review.
