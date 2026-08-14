/**
 * Generate PNG icons from public/icon.svg
 * Requires: npm install sharp --save-dev
 * Run with: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('public/icon.svg');
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

await sharp(svg, { density: 288 }).resize(512, 512, { fit: 'contain', background: transparent }).ensureAlpha().png().toFile('public/icon-512.png');
console.log('✓ icon-512.png');

await sharp(svg, { density: 288 }).resize(192, 192, { fit: 'contain', background: transparent }).ensureAlpha().png().toFile('public/icon-192.png');
console.log('✓ icon-192.png');

// apple-touch-icon.png is generated separately by make-icon.py (opaque background —
// iOS renders transparent PNG areas as black, so it must not go through the transparent path above).

console.log('Done.');
