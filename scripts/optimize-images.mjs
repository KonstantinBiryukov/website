/**
 * optimize-images.mjs — turn the original screenshots in media/originals/
 * into small, responsive WebP files the site actually ships.
 *
 * Run with:  npm run optimize:images
 *
 * For every entry in IMAGES below it writes
 *   src/assets/media/<id>-<width>.webp      (one file per target width)
 * and records the intrinsic size of each image in
 *   src/data/generated/media.json
 * so <img> elements can reserve their exact aspect ratio before the file
 * arrives (no layout shift). It also renders the 1200×630 social sharing
 * card public/og.png from an SVG template.
 *
 * The outputs are committed, so a normal `npm run build` never needs sharp.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'media/originals');
const OUT = join(ROOT, 'src/assets/media');
const MANIFEST = join(ROOT, 'src/data/generated/media.json');

/**
 * What to generate. `widths` are the srcset candidates; anything wider than
 * the original is skipped (we never upscale). `crop` optionally trims the
 * source first ({ left, top, width, height } in source pixels).
 */
const IMAGES = [
  // The Last of Us — The Journey (screenshot supplied by Konstantin, Bus Depot chapter).
  { id: 'lou-bus-depot', file: 'portfolio/lou-bus-depot.webp', widths: [800, 1600] },
  // The book cover (Amazon listing image, 1000×1491).
  { id: 'book-cover', file: 'book-cover.jpg', widths: [240, 480] },
  // Earlier projects (screenshots that were already published on the old site).
  { id: 'storytelling', file: 'portfolio/storytelling-classification.png', widths: [800, 1600] },
  { id: 'faang', file: 'portfolio/faang.png', widths: [800, 1600] },
  { id: 'geojobs', file: 'portfolio/geojobs.png', widths: [800, 1600] },
  { id: 'game-of-grants', file: 'portfolio/gameOfGrants.png', widths: [540] },
];

/** WebP quality: 78 is visually lossless for UI screenshots at these sizes. */
const QUALITY = 78;

/**
 * Encode one source image at every requested width.
 * @returns the manifest entry { width, height, widths } of the source.
 */
async function processImage({ id, file, widths, crop }) {
  let pipeline = sharp(join(SRC, file));
  if (crop) pipeline = pipeline.extract(crop);
  // Read the (possibly cropped) intrinsic size once.
  const { width, height } = crop ?? (await pipeline.metadata());

  // Never upscale; always keep at least one candidate (the original width).
  const targets = widths.filter((w) => w <= width);
  if (targets.length === 0) targets.push(width);

  for (const w of targets) {
    await pipeline
      .clone()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(join(OUT, `${id}-${w}.webp`));
  }
  return { width, height, widths: targets };
}

/**
 * Build the Open Graph image: a typographic card with contour lines drawn
 * from the same kind of procedural height field as the site's hero.
 */
async function renderOgImage() {
  const W = 1200;
  const H = 630;

  // Concentric, slightly warped rings = cheap stylised contour lines.
  const rings = [];
  for (let i = 1; i <= 26; i += 1) {
    const r = 30 + i * 26;
    const points = [];
    for (let a = 0; a <= 64; a += 1) {
      const t = (a / 64) * Math.PI * 2;
      const wobble = 1 + 0.08 * Math.sin(3 * t + i * 0.4) + 0.05 * Math.cos(5 * t - i * 0.3);
      points.push(`${(880 + Math.cos(t) * r * wobble * 1.25).toFixed(1)},${(330 + Math.sin(t) * r * wobble).toFixed(1)}`);
    }
    // Hypsometric colours, inner rings = peaks (same ramp as the site's terrain).
    const ramp = ['#ff6b4a', '#ffb547', '#c9e265', '#4fd1a5', '#38b6d8', '#5b6cff'];
    const colour = ramp[Math.min(ramp.length - 1, Math.floor((i / 26) * ramp.length))];
    rings.push(`<polyline points="${points.join(' ')}" fill="none" stroke="${colour}" stroke-opacity="0.55" stroke-width="${i % 5 === 0 ? 2 : 1}"/>`);
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="100%" height="100%" fill="#0b1024"/>
    ${rings.join('\n')}
    <circle cx="880" cy="330" r="7" fill="#ffffff"/>
    <text x="72" y="300" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="86" fill="#ffffff">Konstantin</text>
    <text x="72" y="396" font-family="Helvetica Neue, Arial, sans-serif" font-weight="800" font-size="86" fill="#ffffff">Biriukov</text>
    <text x="72" y="466" font-family="Helvetica Neue, Arial, sans-serif" font-size="30" fill="#c9cdf0">Software engineer · maps, 3D &amp; games</text>
    <text x="72" y="560" font-family="Menlo, monospace" font-size="18" fill="#8a90c0">konstantinbiryukov.github.io/website</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(ROOT, 'public/og.png'));
}

// ---------------------------------------------------------------------------

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
mkdirSync(dirname(MANIFEST), { recursive: true });

const manifest = {};
for (const image of IMAGES) {
  manifest[image.id] = await processImage(image);
  console.log(`✓ ${image.id.padEnd(16)} ${manifest[image.id].width}×${manifest[image.id].height} → ${manifest[image.id].widths.join(', ')}`);
}
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

await renderOgImage();
console.log('✓ public/og.png');
