import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge only knows Tailwind's default font sizes, so it would read a
 * custom size token like `text-h2` as a text *colour* and drop it whenever a
 * real colour (`text-signal`) appears in the same call. Registering the
 * `--text-*` tokens from globals.css keeps size and colour independent.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["name", "eyebrow", "note", "h2", "lead", "count", "control"] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
