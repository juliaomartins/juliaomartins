import type { ComponentType } from "react";
import {
  SiAnthropic,
  SiClaude,
  SiDjango,
  SiHuggingface,
  SiLangchain,
  SiNextdotjs,
  SiOpenai,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiVercel,
} from "react-icons/si";

import GsapLogo from "@/components/ui/GsapLogo";

export type Skill = {
  key: string;
  /** Product name. Never translated. */
  name: string;
  icon: ComponentType<{ className?: string }>;
  /** Tile fill and ink, OKLCH. Every pair measured ≥ 5.8:1. */
  bg: string;
  fg: string;
  /** Wide wordmark rather than a square glyph — sized by height. */
  wordmark?: boolean;
  /** One of the two long anchor pieces: gets a larger mark. */
  feature?: boolean;
  /**
   * Where the piece hangs on the md+ mosaic: a 14-column grid of short rows.
   * Three staggered columns (2–5, 6–9, 10–13) with pieces that overhang into
   * columns 1 and 14, like fragments of one painting.
   */
  place: string;
};

/**
 * Ordered column by column (left, centre, right), so reading order follows the
 * wall. Below md the same list packs a 2-column grid; pieces 0, 3, 6 and 9 are
 * tall there, which fills 9 rows exactly.
 */
export const skills: readonly Skill[] = [
  // Left column — starts low.
  { key: "tailwind", name: "Tailwind CSS", icon: SiTailwindcss, bg: "oklch(0.754 0.139 232.7)", fg: "oklch(0.293 0.063 243.2)", place: "md:col-start-2 md:col-span-4 md:row-start-3 md:row-span-4" },
  { key: "gsap", name: "GSAP", icon: GsapLogo, wordmark: true, bg: "oklch(0.17 0.004 164.5)", fg: "oklch(0.986 0.035 101.8)", place: "md:col-start-1 md:col-span-5 md:row-start-7 md:row-span-4" },
  { key: "react", name: "React", icon: SiReact, bg: "oklch(0.256 0.014 267)", fg: "oklch(0.832 0.117 218.7)", place: "md:col-start-2 md:col-span-4 md:row-start-11 md:row-span-4" },
  { key: "reactNative", name: "React Native", icon: SiReact, bg: "oklch(0.832 0.117 218.7)", fg: "oklch(0.256 0.014 267)", place: "md:col-start-2 md:col-span-4 md:row-start-15 md:row-span-4" },
  { key: "python", name: "Python", icon: SiPython, bg: "oklch(0.505 0.096 246.2)", fg: "oklch(1 0 0)", place: "md:col-start-3 md:col-span-3 md:row-start-19 md:row-span-3" },
  // Centre column — starts highest, ends lowest.
  { key: "next", name: "Next.js", icon: SiNextdotjs, feature: true, bg: "oklch(0 0 0)", fg: "oklch(1 0 0)", place: "md:col-start-6 md:col-span-4 md:row-start-1 md:row-span-6" },
  { key: "supabase", name: "Supabase", icon: SiSupabase, bg: "oklch(0.762 0.154 159.4)", fg: "oklch(0.226 0 0)", place: "md:col-start-6 md:col-span-4 md:row-start-7 md:row-span-4" },
  { key: "claudeCode", name: "Claude Code", icon: SiClaude, bg: "oklch(0.672 0.131 38.8)", fg: "oklch(0.191 0 0)", place: "md:col-start-6 md:col-span-4 md:row-start-11 md:row-span-4" },
  { key: "openai", name: "OpenAI SDK", icon: SiOpenai, feature: true, bg: "oklch(0.637 0.124 169.5)", fg: "oklch(0.15 0 0)", place: "md:col-start-6 md:col-span-4 md:row-start-15 md:row-span-9" },
  // Right column — starts low, overhangs right in the middle.
  { key: "django", name: "Django", icon: SiDjango, bg: "oklch(0.271 0.049 164.1)", fg: "oklch(1 0 0)", place: "md:col-start-10 md:col-span-3 md:row-start-3 md:row-span-4" },
  { key: "huggingface", name: "Hugging Face", icon: SiHuggingface, bg: "oklch(0.877 0.175 92.6)", fg: "oklch(0.278 0.03 256.8)", place: "md:col-start-10 md:col-span-4 md:row-start-7 md:row-span-4" },
  { key: "langchain", name: "LangChain", icon: SiLangchain, bg: "oklch(0.332 0.038 195.5)", fg: "oklch(1 0 0)", place: "md:col-start-10 md:col-span-5 md:row-start-11 md:row-span-4" },
  { key: "claudeApi", name: "Claude API", icon: SiAnthropic, bg: "oklch(0.948 0.011 95.2)", fg: "oklch(0.191 0 0)", place: "md:col-start-10 md:col-span-4 md:row-start-15 md:row-span-3" },
  { key: "vercel", name: "Vercel", icon: SiVercel, bg: "oklch(0.985 0 0)", fg: "oklch(0 0 0)", place: "md:col-start-10 md:col-span-3 md:row-start-18 md:row-span-3" },
];
