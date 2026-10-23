import { describe, expect, it } from 'vitest';
import { formatLatLng, haversineKm, initialBearing, project, type LatLng } from './geo';

const NOVOSIBIRSK: LatLng = [55.0302, 82.9204];
const ST_CLOUD: LatLng = [45.5579, -94.1632];

describe('geodesy', () => {
  it('computes great-circle distance', () => {
    expect(haversineKm(NOVOSIBIRSK, ST_CLOUD)).toBeCloseTo(8827, -1);
    expect(haversineKm(ST_CLOUD, ST_CLOUD)).toBe(0);
  });

  it('computes the initial bearing (St. Cloud → Novosibirsk is almost due north)', () => {
    const b = initialBearing(ST_CLOUD, NOVOSIBIRSK);
    expect(b).toBeGreaterThan(0);
    expect(b).toBeLessThan(5);
  });

  it('projects frame corners onto the output box and keeps north up', () => {
    const frame = { west: -120, east: -90, south: 30, north: 50, width: 800, height: 500 };
    const nw = project([50, -120], frame);
    const se = project([30, -90], frame);
    expect(nw.x).toBeLessThan(se.x);
    expect(nw.y).toBeLessThan(se.y);
    expect(nw.x).toBeGreaterThanOrEqual(0);
    expect(se.y).toBeLessThanOrEqual(500);
  });

  it('formats hemispheres', () => {
    expect(formatLatLng(ST_CLOUD)).toBe('45.56° N · 94.16° W');
    expect(formatLatLng(NOVOSIBIRSK, 1)).toBe('55.0° N · 82.9° E');
  });
});
