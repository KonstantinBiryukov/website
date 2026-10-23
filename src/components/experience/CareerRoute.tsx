/**
 * The career as a route on a map: real city coordinates on an
 * equirectangular graticule, joined in chronological order.
 *
 * The labels are placed by a collision-aware algorithm (src/demos/labels):
 * Los Angeles, Irvine and Santa Monica are only tens of kilometres apart,
 * so on a small chart some labels cannot fit — the algorithm keeps the most
 * recent ones and drops the rest, exactly as a real map would.
 *
 * The SVG is laid out in real CSS pixels (its viewBox tracks the rendered
 * width via ResizeObserver), so label text is always 11 px. Recomputed
 * only when the width changes; the route draws itself with a CSS animation.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { routeStops } from '../../data/experience';
import { placeLabels, type LabelInput } from '../../demos/labels/collision';
import { project, type Frame } from '../../lib/geo';
import styles from './Experience.module.css';

/** Geographic extent of the chart (output size comes from the rendered width). */
const EXTENT = { west: -125, east: -88, south: 31.5, north: 48.5 } as const;
/** Height as a fraction of width — matches the extent's projected aspect ratio. */
const ASPECT = 0.62;
/** Label font: 11 px monospace → each glyph advances 0.6 em. */
const FONT_SIZE = 11;
const CHAR_WIDTH = FONT_SIZE * 0.6;
const LABEL_HEIGHT = 14;
/** Radius around each marker that labels must keep clear of. */
const MARKER_CLEARANCE = 7;

interface CareerRouteProps {
  /** Role id currently hovered/focused in the timeline. */
  readonly highlight: string | null;
}

export function CareerRoute({ highlight }: CareerRouteProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(560);

  // Track the rendered width (rounded, so sub-pixel changes don't recompute).
  useEffect(() => {
    const figure = figureRef.current;
    if (figure === null) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0);
      if (next > 0) setWidth(next);
    });
    observer.observe(figure);
    return () => {
      observer.disconnect();
    };
  }, []);

  const chart = useMemo(() => {
    const frame: Frame = { ...EXTENT, width, height: Math.round(width * ASPECT) };
    const points = routeStops.map((stop) => ({ stop, ...project(stop.coordinates, frame) }));

    // Graticule every 5°.
    const meridians: { x: number; label: string }[] = [];
    for (let lng = -120; lng <= -90; lng += 5) meridians.push({ x: project([frame.south, lng], frame).x, label: `${-lng}°W` });
    const parallels: { y: number; label: string }[] = [];
    for (let lat = 35; lat <= 45; lat += 5) parallels.push({ y: project([lat, frame.west], frame).y, label: `${lat}°N` });

    // Labels: the newest stop has top priority; markers are obstacles.
    const inputs: LabelInput[] = points.map((p, i) => ({
      id: i,
      x: p.x,
      y: p.y,
      width: p.stop.label.length * CHAR_WIDTH,
      height: LABEL_HEIGHT,
      priority: i,
    }));
    const obstacles = points.map((p) => ({
      minX: p.x - MARKER_CLEARANCE,
      minY: p.y - MARKER_CLEARANCE,
      maxX: p.x + MARKER_CLEARANCE,
      maxY: p.y + MARKER_CLEARANCE,
    }));
    const { placed } = placeLabels(inputs, { width: frame.width, height: frame.height, gap: 9, padding: 3, obstacles });
    const labels = placed.map((p) => ({ x: p.box.minX, y: p.box.maxY - 3.5, stopIndex: p.label.id }));

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return { frame, points, meridians, parallels, labels, path };
  }, [width]);

  const { frame, points, meridians, parallels, labels, path } = chart;
  const isActive = (refs: readonly string[]) => highlight !== null && refs.includes(highlight);

  return (
    <figure ref={figureRef} className={styles.chart}>
      <svg viewBox={`0 0 ${frame.width} ${frame.height}`} className={styles.svg} role="img" aria-labelledby="career-route-title">
        <title id="career-route-title">
          Career map: St. Cloud and Minneapolis in Minnesota, Golden in Colorado, then Los Angeles, Irvine and Santa Monica in California.
        </title>

        <g className={styles.graticule}>
          {meridians.map((m) => (
            <g key={m.label}>
              <line x1={m.x} y1={0} x2={m.x} y2={frame.height} />
              <text x={m.x + 4} y={frame.height - 6}>
                {m.label}
              </text>
            </g>
          ))}
          {parallels.map((p) => (
            <g key={p.label}>
              <line x1={0} y1={p.y} x2={frame.width} y2={p.y} />
              <text x={4} y={p.y - 4}>
                {p.label}
              </text>
            </g>
          ))}
        </g>

        <path d={path} pathLength={1} className={styles.route} />

        {points.map(({ stop, x, y }) => (
          <g key={stop.id} className={styles.stop} data-active={isActive(stop.refs)}>
            <circle cx={x} cy={y} r={isActive(stop.refs) ? 9 : 6} className={styles.stopRing} />
            <circle cx={x} cy={y} r={2.5} className={styles.stopDot} />
          </g>
        ))}

        {labels.map((label) => {
          const stop = points[label.stopIndex]?.stop;
          if (stop === undefined) return null;
          return (
            <text key={stop.id} x={label.x} y={label.y} className={styles.stopLabel} data-active={isActive(stop.refs)}>
              {stop.label}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}
