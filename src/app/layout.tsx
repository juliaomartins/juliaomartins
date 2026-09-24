import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";

import React from "react";

/**
 * Two families, both self-hosted by next/font. `--font-geist-sans` and
 * `--font-geist-mono` were referenced by globals.css but never defined until
 * now, which meant the whole site was rendering in the browser default face.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // Measured on this page (Lighthouse mobile, simulated throttling).
  // While three.js still loaded eagerly it saturated the link, and preloading
  // the fonts starved the render-blocking CSS (perf 40 vs 53 without preload).
  // Once three.js moved behind the `load` event that inverted:
  //   swap + preload    -> perf 76-78, CLS 0      <- chosen
  //   swap, no preload  -> perf 71-77, CLS 0.001
  // `swap` guarantees the chosen typography is actually seen.
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  // Measured on this page (Lighthouse mobile, simulated throttling).
  // While three.js still loaded eagerly it saturated the link, and preloading
  // the fonts starved the render-blocking CSS (perf 40 vs 53 without preload).
  // Once three.js moved behind the `load` event that inverted:
  //   swap + preload    -> perf 76-78, CLS 0      <- chosen
  //   swap, no preload  -> perf 71-77, CLS 0.001
  // `swap` guarantees the chosen typography is actually seen.
  display: "swap",
  preload: true,
});

import IntlProvider from "../../components/IntlProvider";
import enMessages from "../../messages/en.json";
import teMessages from "../../messages/te.json";

import "./globals.css";

const messagesMap = {
  en: enMessages,
  te: teMessages,
} as const;

type SupportedLocale = keyof typeof messagesMap;

const isSupportedLocale = (value: string | undefined): value is SupportedLocale =>
  value === "en" || value === "te";


const THEME_SCRIPT = `
(() => {
  try {
    const storedTheme = localStorage.getItem("theme");
    const hasStoredTheme = storedTheme === "light" || storedTheme === "dark";
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const theme = hasStoredTheme ? storedTheme : systemTheme;

    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
})();
`;

/**
 * Motion probe. Runs before first paint, alongside the theme script.
 *
 * Stamping the mode onto <html> here — rather than after hydration — is what
 * lets the hero pick its layout in CSS with zero layout shift, and is why the
 * JS-disabled path degrades correctly: with no JS this attribute is simply
 * absent, and the hero's base CSS renders every state in normal flow.
 */
const MOTION_SCRIPT = `
(() => {
  try {
    document.documentElement.setAttribute(
      "data-motion",
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "reduced"
        : "full"
    );
  } catch (_) {}
})();
`;


export const metadata: Metadata = {
  metadataBase: new URL("https://juliaomartins.dev"),

  title: {
    default: "Julião Martins – Junior Developer",
    template: "%s | Julião Martins",
  },

  description:
    "Portfolio of Julião Martins, Junior Developer focused on React Native, Next.js and modern web technologies.",

  alternates: {
    canonical: "https://juliaomartins.dev/",
  },

  authors: [
    {
      name: "Julião Martins",
      url: "https://juliaomartins.dev",
    },
  ],
  
  creator: "Julião Martins",
  publisher: "Julião Martins",
  
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },

  keywords: [
    "Juliao",
    "Julião",
    "Julião Martins",
    "Juliao Martins",
    "Julião Martins Timor Leste",
    "Juliao Martins Timor Leste",
    "Julião Martins Dili",
    "mobile developer Timor Leste",
    "mobile developer Dili",
    "React Native developer Timor Leste",
    "React Native developer Dili",
    "Next.js developer Timor Leste",
    "Junior developer Timor Leste",
    "desenvolvedor mobile Timor-Leste",
    "desenvolvedor React Native Timor-Leste",
    "IT Timor Leste",
    "React Native Expo",
  ],

  openGraph: {
    title: "Julião Martins – Junior Developer",
    description:
      "Portfolio of Julião Martins, Junior Developer focused on React Native and Next.js.",
    url: "/",
    siteName: "Julião Martins",
    locale: "en_US",
    type: "website",

    // `images` is intentionally omitted: src/app/opengraph-image.tsx generates
    // a real 1200x630 card and Next wires it up automatically. The previous
    // entry pointed at a 354x472 portrait while declaring 1200x630.
  },

  twitter: {
    card: "summary_large_image",
    title: "Julião Martins – Junior Developer",
    description: "Portfolio and projects built with React Native & Next.js",
    // Inherits the generated opengraph-image; see above.
  },

  robots: {
    index: true,
    follow: true,
  },
};


export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;
  const initialLocale: SupportedLocale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : "en";

  return (
    <html
      lang={initialLocale}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: MOTION_SCRIPT }} />
      </head>
      <body>
        <IntlProvider initialLocale={initialLocale} messagesMap={messagesMap}>
          {children}
        </IntlProvider>
      </body>
    </html>
  );
}
