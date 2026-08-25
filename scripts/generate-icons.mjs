/**
 * Generate icon-192.png from public/icon-512.png.
 *
 * public/icon-512.png is the canonical, hand-verified branded icon (rainbow compass
 * rose, transparent corners) and is the source of truth for all other app icon sizes.
 *
 * Do NOT point this script at public/icon.svg (a generic placeholder compass that was
 * never the real app icon — see commit 21b3f7b) or public/icon.png (a flattened export
 * with no alpha channel, whose corners are baked-in solid black rather than transparent
 * — see commit ab46f08). Either source reintroduces the black-corner splash/icon bug.
 *
 * Requires: npm install sharp --save-dev
 * Run with: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';

await sharp('public/icon-512.png').resize(192, 192).png().toFile('public/icon-192.png');
console.log('✓ icon-192.png (from public/icon-512.png)');

// apple-touch-icon.png is generated separately by make-icon.py (opaque background —
// iOS renders transparent PNG areas as black, so it must not go through the transparent path above).

console.log('Done.');
