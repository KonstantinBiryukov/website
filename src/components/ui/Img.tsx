/**
 * Responsive, lazy, layout-stable image.
 *
 * - `srcSet` + `sizes` let the browser pick the smallest adequate WebP.
 * - Intrinsic `width`/`height` reserve the aspect ratio before load (CLS 0).
 * - Lazy + async decoding by default; pass `priority` for an above-the-fold
 *   image to load it eagerly with high fetch priority.
 */
import { resolveImage } from '../../lib/media';

interface ImgProps {
  /** Media id from src/data/generated/media.json. */
  readonly id: string;
  readonly alt: string;
  /** The `sizes` attribute — how wide the image is rendered at each breakpoint. */
  readonly sizes: string;
  readonly priority?: boolean;
  readonly className?: string | undefined;
}

export function Img({ id, alt, sizes, priority = false, className }: ImgProps) {
  const image = resolveImage(id);
  return (
    <img
      className={className}
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
