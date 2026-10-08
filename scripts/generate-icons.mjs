#!/usr/bin/env node
/**
 * Generate every site icon from one SVG: `npm run icons`.
 *
 * Source:  src/app/icon.svg   (also served as-is as the scalable favicon)
 * Writes:  src/app/favicon.ico          16, 32, 48 (PNG-in-ICO, for old browsers and tabs)
 *          src/app/apple-icon.png       180 (iOS home screen)
 *          public/icons/icon-192.png    manifest
 *          public/icons/icon-512.png    manifest
 *          public/icons/icon-maskable-512.png
 *                                        Android adaptive icon: full-bleed black with the
 *                                        mark inside the 80% safe zone, so any mask shape
 *                                        (circle, squircle) never clips the letters.
 *
 * Next.js links favicon.ico, icon.svg and apple-icon.png automatically from
 * src/app; the manifest (src/app/manifest.ts) points at public/icons.
 * Change the SVG, run the script, commit the outputs.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(root, "src/app/icon.svg");
const BACKGROUND = "#000000";

const svg = await readFile(SOURCE);

/** Rasterise at a density high enough that the result is downsampled, never upscaled. */
const png = (size) =>
  sharp(svg, { density: Math.max(72, (size / 32) * 72 * 4) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

/** ICO container holding PNG images (supported by every browser that still asks for .ico). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function maskable(size) {
  const inner = Math.round(size * 0.8);
  const mark = await png(inner);
  return sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: mark, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const out = async (path, data) => {
  const full = join(root, path);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, data);
  console.log(`  ${path}  ${(data.length / 1024).toFixed(1)} KB`);
};

console.log("Generating icons from src/app/icon.svg");
await out(
  "src/app/favicon.ico",
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(size) }))))
);
await out("src/app/apple-icon.png", await png(180));
await out("public/icons/icon-192.png", await png(192));
await out("public/icons/icon-512.png", await png(512));
await out("public/icons/icon-maskable-512.png", await maskable(512));
console.log("Done.");
