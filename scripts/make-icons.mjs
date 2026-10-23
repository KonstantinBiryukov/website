/**
 * make-icons.mjs — generate the site icons from one SVG design: a coral
 * rounded square with a "KB" monogram, matching the badge in the header.
 *
 * Run with:  npm run icons
 *
 * Writes into public/:
 *   favicon.svg            vector icon for modern browsers
 *   favicon.ico            16/32/48 px, for older browsers and tools that
 *                          request /favicon.ico directly (same URL as the
 *                          old site's icon, so existing references still work)
 *   apple-touch-icon.png   180 px, for iOS home screens (full-bleed square:
 *                          iOS applies its own rounded mask)
 *
 * The letters use the system's bold sans-serif; in the raster files they
 * are baked in, so visitors never depend on fonts for the icon.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const CORAL = '#ff6b4a';
const NAVY = '#0b1024';

/**
 * The icon as SVG on a 64-unit canvas.
 * @param rounded — rounded corners (browser tabs) or a full square (iOS).
 */
function iconSvg(rounded) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${rounded ? 14 : 0}" fill="${CORAL}"/>
  <text x="32" y="46" text-anchor="middle" font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
        font-weight="700" font-size="37" letter-spacing="-2" fill="${NAVY}">KB</text>
</svg>
`;
}

/** Render the SVG to a square PNG of `size` px. */
function png(svg, size) {
  return sharp(Buffer.from(svg), { density: 72 * (size / 64) * 4 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Pack PNG images into an .ico container. Modern ICO files may store PNG
 * data directly: a 6-byte header, one 16-byte directory entry per image,
 * then the PNG bytes.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette colours
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

const rounded = iconSvg(true);
writeFileSync(join(PUBLIC, 'favicon.svg'), rounded);

const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(async (size) => ({ size, data: await png(rounded, size) })));
writeFileSync(join(PUBLIC, 'favicon.ico'), ico(images));

writeFileSync(join(PUBLIC, 'apple-touch-icon.png'), await png(iconSvg(false), 180));

console.log('✓ public/favicon.svg, favicon.ico (16/32/48), apple-touch-icon.png (180)');
