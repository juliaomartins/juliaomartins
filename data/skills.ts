import type { ComponentType } from "react";
import {
  SiAnthropic,
  SiClaude,
  SiCss3,
  SiDjango,
  SiGit,
  SiGithub,
  SiGitlab,
  SiHtml5,
  SiHuggingface,
  SiJavascript,
  SiLangchain,
  SiMaterialformkdocs,
  SiMysql,
  SiNextdotjs,
  SiNginx,
  SiOpenai,
  SiOpenjdk,
  SiOracle,
  SiPython,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

import GsapLogo from "@/components/ui/GsapLogo";

/** [first grid line, span] on the md+ mosaic. */
type Placement = readonly [start: number, span: number];

export type Skill = {
  key: string;
  /** Product name. Never translated. */
  name: string;
  icon: ComponentType<{ className?: string }>;
  /** Tile fill and ink, OKLCH. Every pair measured ≥ 4.5:1. */
  bg: string;
  fg: string;
  /** Wide wordmark rather than a square glyph — sized by height. */
  wordmark?: boolean;
  /** A long anchor piece: gets a larger mark. */
  feature?: boolean;
  /**
   * Where the piece hangs on the md+ mosaic: a 14-column grid of short rows.
   * Three staggered columns (2–5, 6–9, 10–13), with pieces that overhang
   * into columns 1 and 14 like fragments of one painting.
   */
  col: Placement;
  row: Placement;
};

const WHITE = "oklch(1 0 0)";
const BLACK = "oklch(0 0 0)";
const INK = "oklch(0.218 0 0)";

/**
 * Ordered column by column so reading order follows the wall, and each
 * column is one part of the stack: frontend & mobile (left), backend, data &
 * delivery (centre, which starts highest and ends lowest), AI & tooling
 * (right). Below md the same list packs a 2-column grid.
 */
export const skills: readonly Skill[] = [
  // Left — frontend & mobile. Starts low.
  { key: "html", name: "HTML", icon: SiHtml5, bg: "oklch(0.625 0.191 35.7)", fg: BLACK, col: [2, 4], row: [3, 4] },
  { key: "css", name: "CSS", icon: SiCss3, bg: "oklch(0.537 0.133 247.1)", fg: WHITE, col: [3, 3], row: [7, 3] },
  { key: "javascript", name: "JavaScript", icon: SiJavascript, bg: "oklch(0.896 0.182 101.2)", fg: INK, col: [1, 5], row: [10, 4] },
  { key: "typescript", name: "TypeScript", icon: SiTypescript, bg: "oklch(0.567 0.14 253.3)", fg: WHITE, col: [2, 4], row: [14, 4] },
  { key: "tailwind", name: "Tailwind CSS", icon: SiTailwindcss, bg: "oklch(0.754 0.139 232.7)", fg: "oklch(0.293 0.063 243.2)", col: [2, 4], row: [18, 5] },
  { key: "gsap", name: "GSAP", icon: GsapLogo, wordmark: true, bg: "oklch(0.17 0.004 164.5)", fg: "oklch(0.986 0.035 101.8)", col: [1, 5], row: [23, 3] },
  { key: "react", name: "React", icon: SiReact, bg: "oklch(0.256 0.014 267)", fg: "oklch(0.832 0.117 218.7)", col: [2, 4], row: [26, 4] },
  { key: "next", name: "Next.js", icon: SiNextdotjs, bg: BLACK, fg: WHITE, col: [2, 4], row: [30, 5] },
  { key: "reactNative", name: "React Native", icon: SiReact, bg: "oklch(0.832 0.117 218.7)", fg: "oklch(0.256 0.014 267)", col: [3, 3], row: [35, 4] },

  // Centre — backend, data & delivery. Starts highest, ends lowest.
  { key: "python", name: "Python", icon: SiPython, feature: true, bg: "oklch(0.505 0.096 246.2)", fg: WHITE, col: [6, 4], row: [1, 5] },
  { key: "django", name: "Django", icon: SiDjango, bg: "oklch(0.271 0.049 164.1)", fg: WHITE, col: [6, 4], row: [6, 4] },
  { key: "java", name: "Java", icon: SiOpenjdk, bg: "oklch(0.726 0.165 63.1)", fg: INK, col: [6, 4], row: [10, 4] },
  { key: "supabase", name: "Supabase", icon: SiSupabase, bg: "oklch(0.762 0.154 159.4)", fg: "oklch(0.226 0 0)", col: [6, 4], row: [14, 4] },
  { key: "mysql", name: "MySQL", icon: SiMysql, feature: true, bg: "oklch(0.52 0.095 220.4)", fg: WHITE, col: [6, 4], row: [18, 4] },
  { key: "oracle", name: "OracleDB", icon: SiOracle, bg: "oklch(0.571 0.168 30.8)", fg: WHITE, col: [6, 4], row: [22, 4] },
  { key: "vercel", name: "Vercel", icon: SiVercel, bg: "oklch(0.985 0 0)", fg: BLACK, col: [6, 4], row: [26, 4] },
  // The long anchor needs a strong colour: a near-white piece this tall read
  // as an empty block on the light page.
  { key: "nginx", name: "Nginx", icon: SiNginx, feature: true, bg: "oklch(0.587 0.171 147.7)", fg: BLACK, col: [6, 4], row: [30, 11] },

  // Right — AI & tooling. Starts lower, overhangs right mid-way.
  { key: "claudeCode", name: "Claude Code", icon: SiClaude, feature: true, bg: "oklch(0.672 0.131 38.8)", fg: "oklch(0.191 0 0)", col: [10, 4], row: [4, 5] },
  { key: "claudeApi", name: "Claude API", icon: SiAnthropic, bg: "oklch(0.948 0.011 95.2)", fg: "oklch(0.191 0 0)", col: [10, 3], row: [9, 3] },
  { key: "openai", name: "OpenAI SDK", icon: SiOpenai, bg: "oklch(0.637 0.124 169.5)", fg: "oklch(0.15 0 0)", col: [10, 5], row: [12, 4] },
  { key: "langchain", name: "LangChain", icon: SiLangchain, bg: "oklch(0.332 0.038 195.5)", fg: WHITE, col: [10, 4], row: [16, 4] },
  { key: "huggingface", name: "Hugging Face", icon: SiHuggingface, bg: "oklch(0.877 0.175 92.6)", fg: "oklch(0.278 0.03 256.8)", col: [10, 4], row: [20, 4] },
  { key: "git", name: "Git", icon: SiGit, bg: "oklch(0.649 0.201 32.8)", fg: INK, col: [10, 3], row: [24, 3] },
  { key: "github", name: "GitHub", icon: SiGithub, bg: "oklch(0.206 0 0)", fg: WHITE, col: [10, 5], row: [27, 4] },
  { key: "gitlab", name: "GitLab", icon: SiGitlab, bg: "oklch(0.702 0.191 43)", fg: INK, col: [10, 4], row: [31, 4] },
  { key: "mkdocs", name: "MkDocs", icon: SiMaterialformkdocs, bg: "oklch(0.479 0.159 271.8)", fg: WHITE, col: [10, 3], row: [35, 3] },
];
