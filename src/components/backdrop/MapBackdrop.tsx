/**
 * The living map behind the whole site.
 *
 * Layers, back to front:
 *   1. a static CSS backdrop (instant first paint; the permanent fallback
 *      without WebGL2 or in data-saver mode)
 *   2. the WebGL terrain (lazy chunk, mounted when the browser is idle so
 *      it never delays the first paint of the text)
 *   3. on the About tab: a veil that keeps the text readable over bright
 *      parts of the map, and a tiny readout of coordinates and elevation
 *      under the pointer, sampled from the CPU copy of the same height field
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { PointerSample } from '../../gl/TerrainRenderer';
import { tabConfig } from '../../lib/tabs';
import type { TabId } from '../../lib/routes';
import styles from './Backdrop.module.css';

// Code-split: renderer, shaders and field maths load only when needed.
const MapCanvas = lazy(() => import('./MapCanvas'));

/** Respect data-saver mode: no WebGL chunk at all. */
function graphicsAllowed(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return connection?.saveData !== true;
}

/** Run a callback when the main thread is idle (timeout fallback for Safari). */
function whenIdle(callback: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const handle = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => {
      window.cancelIdleCallback(handle);
    };
  }
  const handle = setTimeout(callback, 300);
  return () => {
    clearTimeout(handle);
  };
}

type GraphicsState = 'pending' | 'live' | 'static';

interface MapBackdropProps {
  /** Current tab, or null on non-tab views (404, phone book). */
  readonly tab: TabId | null;
}

export function MapBackdrop({ tab }: MapBackdropProps) {
  const [graphics, setGraphics] = useState<GraphicsState>(() => (graphicsAllowed() ? 'pending' : 'static'));
  const [mounted, setMounted] = useState(false);
  const readoutRef = useRef<HTMLParagraphElement>(null);
  // Non-tab views use the Contacts view (bright, quiet) as a neutral backdrop.
  const config = tabConfig(tab ?? 'contacts');
  const interactive = tab === 'about';

  useEffect(() => {
    if (graphics === 'static') return;
    return whenIdle(() => {
      setMounted(true);
    });
    // Only the initial decision matters; failures unmount the canvas themselves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLive = useCallback(() => {
    setGraphics('live');
  }, []);

  const onUnavailable = useCallback(() => {
    setMounted(false);
    setGraphics('static');
  }, []);

  /**
   * Written straight into the DOM: this runs every frame while the pointer
   * moves, and must not re-render React.
   */
  const onPointerSample = useCallback((sample: PointerSample | null) => {
    const el = readoutRef.current;
    if (el === null) return;
    el.textContent =
      sample === null
        ? ''
        : `${(sample.x * 1000).toFixed(0)} E · ${(sample.y * 1000).toFixed(0)} N · ${sample.metres} m`;
  }, []);

  return (
    <div className={styles.backdrop} aria-hidden="true">
      <div className={styles.fallback} />
      {mounted && (
        <Suspense fallback={null}>
          <div className={styles.live} data-live={graphics === 'live'}>
            <MapCanvas
              view={config.view}
              interactive={interactive}
              onLive={onLive}
              onUnavailable={onUnavailable}
              onPointerSample={onPointerSample}
            />
          </div>
        </Suspense>
      )}
      {interactive && <div className={styles.veil} />}
      {interactive && graphics === 'live' && <p ref={readoutRef} className={styles.readout} />}
    </div>
  );
}
