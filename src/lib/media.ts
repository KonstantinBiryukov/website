/**
 * Responsive images.
 *
 * scripts/optimize-images.mjs writes `src/assets/media/<id>-<width>.webp`
 * and a manifest with each image's intrinsic size. Here we let Vite
 * fingerprint every file (via import.meta.glob) and assemble `srcset`
 * strings, plus `width`/`height` so the browser reserves the right box
 * before the image loads (zero layout shift).
 */
import manifest from '../data/generated/media.json';

/** One entry of the generated manifest. */
interface ManifestEntry {
  readonly width: number;
  readonly height: number;
  readonly widths: readonly number[];
}

/** Everything an <img> needs. */
export interface ResolvedImage {
  readonly src: string;
  readonly srcSet: string;
  readonly width: number;
  readonly height: number;
}

// Eagerly resolve every WebP to its final, hashed URL. Only URL strings are
// bundled (`?url` / `import: 'default'`), never the image bytes.
const files = import.meta.glob<string>('../assets/media/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Look up the hashed URL of `<id>-<width>.webp`. */
function fileUrl(id: string, width: number): string {
  const url = files[`../assets/media/${id}-${width}.webp`];
  if (url === undefined) throw new Error(`Missing optimised image ${id}-${width}.webp — run npm run optimize:images`);
  return url;
}

const entries = manifest as Readonly<Record<string, ManifestEntry>>;

/**
 * Resolve a media id into src/srcSet/size. Throws for unknown ids so a typo
 * in the data files fails the build-time tests instead of shipping a
 * broken image.
 */
export function resolveImage(id: string): ResolvedImage {
  const entry = entries[id];
  if (entry === undefined) throw new Error(`Unknown media id "${id}"`);
  const srcSet = entry.widths.map((w) => `${fileUrl(id, w)} ${w}w`).join(', ');
  // The largest candidate is the fallback `src` for browsers ignoring srcset.
  const largest = entry.widths[entry.widths.length - 1] ?? entry.width;
  return { src: fileUrl(id, largest), srcSet, width: entry.width, height: entry.height };
}

/** All ids known to the manifest (used by tests to validate the data files). */
export const mediaIds: readonly string[] = Object.keys(entries);
