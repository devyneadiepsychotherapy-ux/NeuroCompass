/**
 * Regenerate the Android launcher icons from public/icon-512.png (the canonical,
 * hand-verified branded icon — see generate-icons.mjs for why it's the source of
 * truth and NOT public/icon.svg or public/icon.png).
 *
 * The Android platform was scaffolded with Capacitor/Android Studio's default
 * placeholder icon (a plain blue mark) and it was never swapped for the real
 * branding — unlike the web icon, which went through several fix commits, the
 * `android/` tree is gitignored so this went unnoticed.
 *
 * Produces, per mipmap density folder:
 *  - ic_launcher.png        legacy square icon (transparent rounded corners,
 *                            baked into icon-512.png itself)
 *  - ic_launcher_round.png  same artwork, circle-masked for pre-adaptive-icon
 *                            launchers that use this file as-is
 *  - ic_launcher_foreground.png  adaptive-icon foreground layer: icon-512
 *                            scaled to ~66% and centered on a transparent
 *                            canvas, so no launcher mask (circle, squircle,
 *                            teardrop) clips the compass points
 * and updates ic_launcher_background.xml to the icon's own background colour,
 * sampled from the source image, so the foreground's transparent margin reads
 * as a seamless continuation of the icon rather than a visible edge.
 *
 * Requires: sharp (already used by generate-icons.mjs)
 * Run with: node scripts/generate-android-icons.mjs
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SOURCE = "public/icon-512.png";
const RES_DIR = "android/app/src/main/res";

// Legacy/round icon size (dp) x density scale = px. Foreground canvas is 108dp
// (adaptive icons render a 108x108dp canvas and mask down to a ~72dp safe zone).
const DENSITIES = [
  { dir: "mipmap-mdpi", scale: 1 },
  { dir: "mipmap-hdpi", scale: 1.5 },
  { dir: "mipmap-xhdpi", scale: 2 },
  { dir: "mipmap-xxhdpi", scale: 3 },
  { dir: "mipmap-xxxhdpi", scale: 4 },
];
const LEGACY_DP = 48;
const FOREGROUND_DP = 108;
const FOREGROUND_ICON_SCALE = 0.66; // keeps the compass points inside every mask shape

async function sampleBackgroundColor(source) {
  // Average a few points well inside the rounded-square fill (not the
  // transparent corners) to get the icon's true background colour.
  const img = sharp(source);
  const { width, height } = await img.metadata();
  const points = [
    [Math.round(width * 0.5), Math.round(height * 0.06)],
    [Math.round(width * 0.06), Math.round(height * 0.5)],
    [Math.round(width * 0.94), Math.round(height * 0.5)],
    [Math.round(width * 0.5), Math.round(height * 0.94)],
  ];
  let r = 0, g = 0, b = 0, n = 0;
  for (const [x, y] of points) {
    const { data } = await sharp(source)
      .extract({ left: x, top: y, width: 1, height: 1 })
      .raw()
      .toBuffer({ resolveWithObject: true });
    r += data[0]; g += data[1]; b += data[2]; n++;
  }
  return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

function toHex({ r, g, b }) {
  const h = (v) => v.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

async function circleMask(size) {
  const svg = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`;
  return Buffer.from(svg);
}

async function main() {
  const bg = await sampleBackgroundColor(SOURCE);
  const bgHex = toHex(bg);
  console.log(`Sampled icon background colour: ${bgHex}`);

  for (const { dir, scale } of DENSITIES) {
    const legacyPx = Math.round(LEGACY_DP * scale);
    const fgPx = Math.round(FOREGROUND_DP * scale);
    const outDir = path.join(RES_DIR, dir);
    await fs.mkdir(outDir, { recursive: true });

    // ic_launcher.png — direct resize of the branded icon
    const legacyBuf = await sharp(SOURCE).resize(legacyPx, legacyPx).png().toBuffer();
    await fs.writeFile(path.join(outDir, "ic_launcher.png"), legacyBuf);

    // ic_launcher_round.png — same artwork, circular alpha mask applied
    const mask = await circleMask(legacyPx);
    const roundBuf = await sharp(legacyBuf)
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
    await fs.writeFile(path.join(outDir, "ic_launcher_round.png"), roundBuf);

    // ic_launcher_foreground.png — icon scaled into the adaptive-icon safe zone,
    // centered on a transparent canvas sized to the full 108dp foreground layer.
    const glyphPx = Math.round(fgPx * FOREGROUND_ICON_SCALE);
    const glyphBuf = await sharp(SOURCE).resize(glyphPx, glyphPx).png().toBuffer();
    const fgBuf = await sharp({
      create: { width: fgPx, height: fgPx, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([{ input: glyphBuf, gravity: "center" }])
      .png()
      .toBuffer();
    await fs.writeFile(path.join(outDir, "ic_launcher_foreground.png"), fgBuf);

    console.log(`✓ ${dir}: ic_launcher.png (${legacyPx}px), ic_launcher_round.png, ic_launcher_foreground.png (${fgPx}px)`);
  }

  // Adaptive-icon background colour — matches the icon's own fill so the
  // foreground's transparent margin doesn't show a seam under any mask shape.
  const bgXmlPath = path.join(RES_DIR, "values/ic_launcher_background.xml");
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${bgHex}</color>\n</resources>\n`;
  await fs.writeFile(bgXmlPath, bgXml);
  console.log(`✓ ${bgXmlPath} -> ${bgHex}`);

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
