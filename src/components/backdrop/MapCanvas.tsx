/**
 * The WebGL layer of the backdrop, in its own lazily-loaded chunk.
 *
 * Creates a TerrainRenderer on a fresh canvas, flies it to the current
 * tab's view, mirrors the pointer while `interactive`, keeps reduced-motion
 * in sync, and disposes everything on unmount. If WebGL2 is missing or the
 * shaders fail, it calls `onUnavailable` and the CSS backdrop remains.
 */
import { useEffect, useRef } from 'react';
import { TerrainRenderer, type MapView, type PointerSample } from '../../gl/TerrainRenderer';
import { useMediaQuery, usePrefersReducedMotion } from '../../lib/hooks';
import styles from './Backdrop.module.css';

interface MapCanvasProps {
  readonly view: MapView;
  /** Show the survey lens under the pointer (About tab only). */
  readonly interactive: boolean;
  readonly onLive: () => void;
  readonly onUnavailable: () => void;
  readonly onPointerSample: (sample: PointerSample | null) => void;
}

export default function MapCanvas({ view, interactive, onLive, onUnavailable, onPointerSample }: MapCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<TerrainRenderer | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  // Touch devices: lower pixel ratio and a 30 fps cap save battery.
  const coarse = useMediaQuery('(pointer: coarse)');

  // Latest props in a ref, so the renderer is created once per device class.
  const latest = useRef({ view, onLive, onUnavailable, onPointerSample });
  useEffect(() => {
    latest.current = { view, onLive, onUnavailable, onPointerSample };
  });

  // Create / dispose the renderer.
  //
  // Each renderer gets a brand-new <canvas>, created here and removed on
  // cleanup. A canvas hands out the same context object for its whole life,
  // so after dispose() releases that context (WEBGL_lose_context), a remount
  // on the same element — React StrictMode does exactly that in development —
  // would receive a dead context and fail to compile shaders.
  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    if (!TerrainRenderer.isSupported()) {
      latest.current.onUnavailable();
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.className = styles.canvas ?? '';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    let renderer: TerrainRenderer;
    try {
      renderer = new TerrainRenderer(canvas, {
        // Read the current preference directly; later changes go through setReducedMotion.
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        maxPixelRatio: coarse ? 1.25 : 1.5,
        minFrameInterval: coarse ? 1000 / 30 : 0,
        unitCssPx: coarse ? 260 : 340,
        onPointerSample: (sample) => {
          latest.current.onPointerSample(sample);
        },
        onFailure: () => {
          latest.current.onUnavailable();
        },
      });
    } catch (error) {
      // Shader compile/link errors land here; log for developers, fall back for visitors.
      console.warn('[map] WebGL unavailable, using the static backdrop.', error);
      canvas.remove();
      latest.current.onUnavailable();
      return;
    }
    // Start at the current tab's place without a fly-in.
    renderer.setView(latest.current.view, true);
    rendererRef.current = renderer;
    latest.current.onLive();
    return () => {
      rendererRef.current = null;
      renderer.dispose();
      canvas.remove();
    };
  }, [coarse]);

  // Tab changes: fly to the new place.
  useEffect(() => {
    rendererRef.current?.setView(view);
  }, [view]);

  // Follow OS-level reduced-motion changes without recreating the context.
  useEffect(() => {
    rendererRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  // Pointer → survey lens, only while interactive. The canvas is fixed and
  // full-viewport, so client coordinates are canvas coordinates.
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!interactive || renderer === null) return;
    let touchTimer: ReturnType<typeof setTimeout> | undefined;
    const onMove = (event: PointerEvent) => {
      // Touch "hovers" only while pressed; mouse and pen hover freely.
      if (event.pointerType === 'touch' && event.buttons === 0) return;
      clearTimeout(touchTimer);
      renderer.setPointer(event.clientX, event.clientY);
    };
    const onUp = (event: PointerEvent) => {
      // Keep the lens briefly after a finger lifts, so it can be read.
      if (event.pointerType === 'touch') touchTimer = setTimeout(() => { renderer.clearPointer(); }, 1600);
    };
    const onLeave = () => {
      renderer.clearPointer();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      clearTimeout(touchTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      renderer.clearPointer();
    };
    // `coarse` recreates the renderer above, so the listeners must re-attach.
  }, [interactive, coarse]);

  return <div ref={hostRef} className={styles.canvasHost} />;
}
