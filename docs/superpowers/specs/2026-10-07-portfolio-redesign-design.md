# Portfolio redesign — design spec

Date: 2026-10-07 · Status: approved in conversation, awaiting spec review

## Intent

A minimalist portfolio that reads clearly in a few seconds: Julião is a developer
first (web + mobile), now studying AI engineering. No decorative noise, no
"AI-slop" tropes (gradient blobs, glow cards, rainbow rails, emoji, generic
glassmorphism). Every section bilingual: English and Tetum.

Out of scope (stay as they are): Gallery (`HorizontalGallery`), Contact
(`ContactForm`), Footer. Fonts (Geist Sans / Geist Mono) and the colour palette
stay, so the untouched sections keep their look.

## Decisions (from conversation)

| Topic | Decision |
|---|---|
| Hero motion | Static text + a single gentle fade-in. Split-flap morph and logo sprite burst removed. |
| Projects | Typographic index list, no screenshots. |
| Title | "Developer" — "Junior" dropped from hero and metadata. |
| Experience | "over three years" (Leader Group 2023–2025 + Telemor since 2025). Avoid month counts that go stale. |
| 3D | `ComputerVisual`, `Scene.jsx`, `Model.jsx`, `my_computer.glb`, `three`, `@react-three/fiber`, `@react-three/drei`, `computer` motion token removed in the same change. |
| Tetum | Written by Claude; every new Tetum string flagged for Julião's review in the final report. |

Signature interactions after the change (limit 3): navbar underline, skills
gallery reveal, existing gallery horizontal scroll.

## Sections

### 1. Navbar — sliding underline

- One indicator `<span aria-hidden>` absolutely positioned under the link list.
  It moves with `x` + `scaleX` only (GSAP, durations/eases from
  `motion/tokens.ts`). Width is a fixed base (e.g. 100px) scaled to the target
  link's width, `transformOrigin: left`.
- Target = the **active section** (scroll-spy via `IntersectionObserver` on
  `#home … #contact`). Hover / `focus-visible` on a link previews it; leaving
  the list returns it to the active link.
- Active link: `aria-current="true"` + foreground colour; others muted.
- Recomputes on resize and locale change (link widths change between EN/TE).
- Reduced motion: indicator jumps (duration 0). No JS: no indicator, links still work.
- Mobile sheet menu unchanged in behaviour; active item gets the same
  `aria-current` + colour treatment (no sliding bar in the sheet).
- Hover background (`hover:bg-accent`) removed — the underline is the hover signal.

### 2. Home (Hero) — simplified

Server component. Layout: single centered column at every width.

- Portrait (existing LCP image, `priority`), `<h1>` name.
- Eyebrow: "Developer · Studying AI Engineering".
- Intro sentence (EN): "I'm a developer who builds web and mobile products with
  React, Next.js and React Native. Now I'm studying AI engineering — learning to
  build with language models and bring them into real products."
- Status line: "Currently — IT Collaborator at Viettel Timor (Telemor)".
- Two links: "See my work" → `#projects` (primary), "Get in touch" → `#contact`.
- Motion: one small client leaf fades/rises the text block once on load
  (`duration.xl`, `ease.out`, stagger from tokens); reduced-motion = static.
  Content is fully present in SSR HTML.
- Removed: `HeroRoleMorph.tsx`, `SpriteBurst.tsx`, `content/hero.ts` morph
  fields, hero morph CSS in `globals.css`, `hero` + `sprites` motion tokens,
  `Physics2DPlugin` registration (if nothing else uses it).
- Hero copy moves into `messages/{en,te}.json` under `home.*`.

### 3. About + Roadmap

Paragraph 1 (EN, rewritten): "I'm a developer with over three years of
professional experience in IT and systems maintenance. At Leader Group I looked
after hardware, networking and databases for retail systems — both the cashier
front line and the back office — across Leader Hypermarket, Leader Mart, Cement
Timor, Auto Timor Leste and Lisun Timor."

Paragraph 2 (EN, rewritten): "Since 2025 I've been an IT Collaborator in the
Software Development department at Viettel Timor (Telemor), one of Timor-Leste's
leading telecommunications companies, building real applications used by staff
and customers."

Roadmap — three stops on one hairline:

| Stop | Year | Title | Org | Line |
|---|---|---|---|---|
| 1 | 2023 – 2025 | IT Support | Leader Group | Kept retail systems, networks and databases running. |
| 2 | 2025 – Now | IT Collaborator | Viettel Timor (Telemor) | Building software in the Software Development department. |
| 3 | Next | AI Engineer | Studying | Learning to build products with language models. |

- Desktop (`md+`): horizontal 1px rule, three columns, a dot on the rule per
  stop; stops 1–2 filled, stop 3 outlined (future). Year in large tabular
  numerals, title, org, one line.
- Mobile: vertical rule on the left, same content stacked.
- Motion: on enter (`top 80%`, `once`), rule draws via `scaleX` (`scaleY`
  mobile), stops fade-up staggered. Reduced motion: final state.
- Removed: rainbow rail, glow pins, the "road" capsule, `PIN_COLORS`.
- Timeline data stays in messages (`about.timeline`), gains a `status`
  field (`"past" | "current" | "next"`).

### 4. Projects — index list

Data in messages (`projects.items`), rendered by a server-safe component
(client only if `useTranslations` requires it — it does under the current
client `IntlProvider`, so the component stays a small client leaf without GSAP).

| # | Name | Description (EN) | Tags | Link label | URL |
|---|---|---|---|---|---|
| 01 | Life Mor | iOS app for Telemor staff to manage their daily work activities, published on the App Store. | React Native · iOS | App Store | https://apps.apple.com/us/app/life-mor/id6754350114 |
| 02 | DRCCMD 2026 | Official website of the Díli Regional Cooperative Conference and Ministerial Dialogue 2026, held alongside the ASEAN Cooperative Expo 2026. | Next.js · Website | Visit site | https://cooptl.com/ |
| 03 | Visitor & Queue System | Event badge and queue system for DRCCMD 2026 at Palm Spring: register visitors, print QR badges, scan arrivals by phone, welcome them on the lobby screen. | Django · Next.js · React Native | GitHub | https://github.com/juliaomartins/visitor-management-system |

- Row: index number (muted, tabular), name (h3), description, tags, outbound
  link with arrow icon (`target="_blank" rel="noopener noreferrer"`, visually
  hidden "(opens in a new tab)").
- Rows separated by 1px borders. Whole row hover: arrow nudges via `translate`
  (CSS, `--duration-micro`), name colour shifts. Focus-visible ring on the link.
- No entrance animation (keeps the signature-interaction budget).

### 5. Skills — gallery wall

Header (desktop: 3-column grid like the reference):
- Left: `<h2>` "Skills" + the AI paragraph.
- Right: a large "09" (count derived from the data), caption "Tools I build with".
- Mobile: stacked, count beside the heading.

AI paragraph (EN): "I work with AI coding agents like Claude Code every day —
and I use them responsibly. I review every line they produce and keep
architecture and judgement in my own hands. For me they're a way to ship better
work faster, not a substitute for knowing my craft."

Mosaic: 9 tiles in a CSS grid with staggered column offsets (like the
reference's offset columns of varied heights). Desktop 3 columns with column 2
shifted down; tiles alternate tall/short rows via `grid-row: span`.
Mobile: 2 columns, same idea. Each tile: `bg-card`, 1px border, rounded,
logo centered (monochrome `currentColor` by default; brand colour on hover),
name + short label bottom-left.

Skills (order, label EN):
1. Tailwind CSS — Styling
2. GSAP — Animation (official GSAP wordmark SVG, inline, not an icon-font approximation)
3. React — UI library
4. Next.js — Web framework
5. React Native — Mobile apps
6. Supabase — Backend & database
7. Django — Backend framework
8. Vercel — Deployment
9. Claude Code — AI coding agent

Icons: `react-icons/si` (`SiTailwindcss`, `SiReact`, `SiNextdotjs`, `SiSupabase`,
`SiDjango`, `SiVercel`, `SiClaude`); React Native uses `SiReact`; GSAP inline SVG.
Labels translated via messages; names are not translated.

Motion: `ScrollTrigger.batch` on tiles (≥6 items rule), reveal by `clip-path:
inset(100% 0 0 0) → inset(0)` + slight `y`, `once`, stagger from tokens.
Reduced motion: visible immediately. No-JS: visible (no CSS pre-hiding; GSAP
`from` with `immediateRender: false` pattern as in About today).

### 6. i18n

All new/changed copy lives in `messages/en.json` and `messages/te.json` with
identical key shapes. Proper nouns, technology names and URLs are not
translated. Metadata in `layout.tsx` updated to "Developer" (English only —
metadata is not localized today and that stays).

## Verification (Definition of done)

- `npm run build` (repo uses npm lockfile) + `npm run lint` clean.
- Screenshots at 360 / 768 / 1024 / 1440 via headless browser if available;
  JS-disabled render check; reduced-motion check; keyboard pass on navbar.
- Report anything not verifiable (e.g. Lighthouse if unavailable).
