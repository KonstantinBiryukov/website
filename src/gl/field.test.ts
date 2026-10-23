/**
 * Tests for the procedural height field and its GLSL counterpart.
 */
import { describe, expect, it } from 'vitest';
import { elevation, elevationMetres, MAX_ELEVATION_M, OCTAVES } from './field';
import { FRAGMENT_SHADER } from './shaders';

describe('height field', () => {
  it('is deterministic', () => {
    expect(elevation(0.3, -1.2, 4)).toBe(elevation(0.3, -1.2, 4));
  });

  it('stays within [0, 1] and uses a good part of that range', () => {
    let min = 1;
    let max = 0;
    for (let i = 0; i < 4000; i += 1) {
      const e = elevation((i % 80) / 20 - 2, Math.floor(i / 80) / 20 - 1.25, 0);
      expect(e).toBeGreaterThanOrEqual(0);
      expect(e).toBeLessThanOrEqual(1);
      min = Math.min(min, e);
      max = Math.max(max, e);
    }
    // A flat field would make a boring hero; require real relief.
    expect(max - min).toBeGreaterThan(0.5);
  });

  it('changes over time (the drift animation) but continuously', () => {
    const a = elevation(0.5, 0.5, 0);
    const b = elevation(0.5, 0.5, 0.001);
    const c = elevation(0.5, 0.5, 3);
    expect(Math.abs(a - b)).toBeLessThan(0.01);
    expect(a).not.toBe(c);
  });

  it('reports metres within the display range', () => {
    const m = elevationMetres(0, 0, 0);
    expect(m).toBeGreaterThanOrEqual(0);
    expect(m).toBeLessThanOrEqual(MAX_ELEVATION_M);
    expect(Number.isInteger(m)).toBe(true);
  });
});

describe('generated GLSL', () => {
  it('embeds the same constants as the CPU field', () => {
    expect(FRAGMENT_SHADER).toContain(`i < ${OCTAVES}`);
    expect(FRAGMENT_SHADER).toContain('mat2(0.8, 0.6, -0.6, 0.8)');
  });

  it('only contains valid float literals (no "NaN" / "undefined" from bad interpolation)', () => {
    expect(FRAGMENT_SHADER).not.toMatch(/NaN|undefined|Infinity/);
  });
});
