import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { queueCase } from "@/data/queue-case";

import en from "../../../../messages/en.json";

/**
 * Share card for the case study, 1200x630: the lead photo (the lobby screen
 * waiting for arrivals) under a dark wash, with the case title over it.
 * Copy comes from messages/en.json; colours are the dark palette, since
 * Satori takes plain colours, not the CSS tokens.
 */
const TEXT = "#F5F5F7";
const SECONDARY = "#86868B";
const ACCENT = "#A78BFA";

export const alt = `${en.queueCase.title} — ${en.queueCase.eyebrow}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public", queueCase.lead.src));
  const background = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
        <img
          src={background}
          alt=""
          width={1200}
          height={800}
          style={{ position: "absolute", top: -60, left: 0, width: 1200, height: 800, objectFit: "cover" }}
        />
        <div
          style={{
            // Satori has no `inset`; the wash needs explicit bounds.
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "72px 80px",
            color: TEXT,
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.92) 100%)",
          }}
        >
          <div style={{ fontSize: 28, color: ACCENT, marginBottom: 20 }}>
            {en.queueCase.eyebrow}
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02 }}>
            {en.queueCase.title}
          </div>
          <div style={{ marginTop: 28, height: 2, width: 200, backgroundColor: ACCENT }} />
          <div style={{ fontSize: 26, color: SECONDARY, marginTop: 28 }}>
            Julião Martins · juliaomartins.dev
          </div>
        </div>
      </div>
    ),
    size
  );
}
