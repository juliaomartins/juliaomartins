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
