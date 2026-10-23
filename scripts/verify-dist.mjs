/**
 * verify-dist.mjs — sanity checks on the production build, run automatically
 * at the end of `npm run build`. Fails the build (exit 1) if anything that
 * would break the live site is wrong.
 *
 * Checks:
 *  1. Every asset URL in dist/index.html is under the /website/ base path.
 *  2. Every file the PREVIOUS site published (legacy URLs that may be linked
 *     from elsewhere) still exists at the same path.
 *  3. GitHub Pages support files exist (.nojekyll, 404.html, favicon…).
 *  4. No source maps are published.
 * Then prints the gzip size of every JS/CSS file, as a size budget report.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const BASE = '/website/';
const errors = [];

/**
 * Files published by the previous Vue site (from its gh-pages branch) that
 * are not code chunks. Old JS/CSS chunks are not kept: only the old
 * index.html referenced them, and it has been replaced.
 */
const LEGACY_FILES = [
  'favicon.ico',
  'img/1.a3a81fae.png',
  'img/2.f026789a.png',
  'img/3.357af3ed.png',
  'img/4.969045d3.png',
  'img/5.370e2d2b.png',
  'img/6.d8adf8ab.png',
  'img/background.1e0a5874.jpg',
  'img/collins.7286812d.png',
  'img/css3.84f7316b.png',
  'img/faang.6c280c83.png',
  'img/gameOfGrants.8c19a048.png',
  'img/geojobs2.242902e9.png',
  'img/last_of_us.d726a73b.png',
  'img/mit_winner.344e95b4.png',
  'img/phone_book.f9d00b48.png',
  'img/storytelling-classification.8b00dd22.png',
  'img/vue.82b9c7a5.png',
];

const REQUIRED_FILES = ['index.html', '.nojekyll', '404.html', 'favicon.svg', 'apple-touch-icon.png', 'og.png', 'robots.txt', 'sitemap.xml'];

// 1 — Base path of every src/href in index.html.
const html = readFileSync(join(DIST, 'index.html'), 'utf8');
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^(https?:|mailto:|#|data:)/.test(url)) continue;
  if (!url.startsWith(BASE)) errors.push(`index.html references "${url}" outside ${BASE}`);
}
if (!html.includes(`${BASE}assets/`)) errors.push(`index.html has no ${BASE}assets/ script — wrong base path?`);

// 2 & 3 — Files that must exist.
for (const file of [...LEGACY_FILES, ...REQUIRED_FILES]) {
  if (!existsSync(join(DIST, file))) errors.push(`missing dist/${file}`);
}

/** Recursively list files under a directory. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const files = walk(DIST);

// 4 — No source maps.
for (const file of files) if (file.endsWith('.map')) errors.push(`source map published: ${file}`);

// Size report.
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
let totalJs = 0;
let totalCss = 0;
console.log('\nBundle (gzip):');
for (const file of files.filter((f) => /\.(js|css)$/.test(f)).sort()) {
  const gz = gzipSync(readFileSync(file)).length;
  if (file.endsWith('.js')) totalJs += gz;
  else totalCss += gz;
  console.log(`  ${relative(DIST, file).padEnd(44)} ${kb(gz).padStart(9)}`);
}
console.log(`  ${'total JS'.padEnd(44)} ${kb(totalJs).padStart(9)}`);
console.log(`  ${'total CSS'.padEnd(44)} ${kb(totalCss).padStart(9)}`);

if (errors.length > 0) {
  console.error(`\n✖ verify-dist found ${errors.length} problem(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`\n✓ dist/ verified: base path ${BASE}, ${LEGACY_FILES.length} legacy files preserved, no source maps.`);
