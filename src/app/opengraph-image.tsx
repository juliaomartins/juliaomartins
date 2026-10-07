import { ImageResponse } from "next/og";

import en from "../../messages/en.json";

/**
 * Generated OG card, 1200x630.
 *
 * The previous metadata pointed at /juliao_martins.jpg and *declared* it as
 * 1200x630 — the file is actually 354x472 portrait, so every social preview
 * was cropping or letterboxing it badly.
 *
 * All copy here comes from messages/en.json. Nothing is invented.
 */
const NAME = "Julião Martins";

export const alt = `${NAME} — ${en.home.eyebrow}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const { eyebrow, currentLabel, currentRole } = en.home;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#020617",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            fontSize: 32,
            color: "#efb146",
            marginBottom: 28,
          }}
        >
          {eyebrow}
        </div>

        <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.05 }}>
          {NAME}
        </div>

        <div
          style={{
            marginTop: 40,
            height: 2,
            width: 220,
            backgroundColor: "#efb146",
          }}
        />

        <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 40 }}>
          {`${currentLabel} ${currentRole}`}
        </div>
      </div>
    ),
    size
  );
}
