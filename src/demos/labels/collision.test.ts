/**
 * Tests for the label placement algorithm: correctness (no overlaps, inside
 * the viewport, priority respected) and that the grid index agrees with a
 * brute-force O(n²) check.
 */
import { describe, expect, it } from 'vitest';
import { ANCHORS, candidateBox, intersects, overlapArea, overlapDensity, placeLabels, placeNaively, type LabelInput } from './collision';

/** Deterministic pseudo-random labels. */
function makeLabels(count: number, width: number, height: number, seed = 1): LabelInput[] {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: rand() * width,
    y: rand() * height,
    width: 30 + rand() * 60,
    height: 12,
    priority: rand(),
  }));
}

describe('geometry helpers', () => {
  it('treats touching edges as non-overlapping', () => {
    const a = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    expect(intersects(a, { minX: 10, minY: 0, maxX: 20, maxY: 10 })).toBe(false);
    expect(intersects(a, { minX: 9, minY: 9, maxX: 20, maxY: 20 })).toBe(true);
    expect(overlapArea(a, { minX: 5, minY: 5, maxX: 20, maxY: 20 })).toBe(25);
  });

  it('puts every anchor on the expected side of the point', () => {
    const label: LabelInput = { id: 0, x: 100, y: 100, width: 40, height: 10, priority: 1 };
    const ne = candidateBox(label, 'NE', 4);
    expect(ne.minX).toBeGreaterThan(100);
    expect(ne.maxY).toBeLessThan(100);
    const sw = candidateBox(label, 'SW', 4);
    expect(sw.maxX).toBeLessThan(100);
    expect(sw.minY).toBeGreaterThan(100);
    expect(ANCHORS).toHaveLength(8);
  });
});

describe('placeLabels', () => {
  const W = 800;
  const H = 500;
  const labels = makeLabels(600, W, H);
  const result = placeLabels(labels, { width: W, height: H });

  it('never places two overlapping labels (brute-force check)', () => {
    const boxes = result.placed.map((p) => p.box);
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        expect(intersects(boxes[i]!, boxes[j]!)).toBe(false);
      }
    }
  });

  it('keeps every label inside the viewport and accounts for all inputs', () => {
    for (const { box } of result.placed) {
      expect(box.minX).toBeGreaterThanOrEqual(0);
      expect(box.minY).toBeGreaterThanOrEqual(0);
      expect(box.maxX).toBeLessThanOrEqual(W);
      expect(box.maxY).toBeLessThanOrEqual(H);
    }
    expect(result.placed.length + result.hidden).toBe(labels.length);
  });

  it('always places the highest-priority label', () => {
    // Pick a label safely inside the viewport and make it the most important.
    const top: LabelInput = { id: 9999, x: W / 2, y: H / 2, width: 50, height: 12, priority: 10 };
    const r = placeLabels([...labels, top], { width: W, height: H });
    expect(r.placed[0]?.label.id).toBe(9999);
  });

  it('places more labels with eight candidate positions than with one', () => {
    const single = placeLabels(labels, { width: W, height: H, multiPosition: false });
    expect(result.placed.length).toBeGreaterThan(single.placed.length);
  });

  it('uses far fewer box tests than a brute-force O(n²) search', () => {
    expect(result.tests).toBeLessThan((labels.length * labels.length) / 4);
  });

  it('never covers an obstacle', () => {
    const obstacles = labels.slice(0, 40).map((l) => ({ minX: l.x - 5, minY: l.y - 5, maxX: l.x + 5, maxY: l.y + 5 }));
    const r = placeLabels(labels, { width: W, height: H, obstacles });
    for (const { box } of r.placed) for (const o of obstacles) expect(intersects(box, o)).toBe(false);
  });

  it('does not mutate its input', () => {
    const copy = labels.map((l) => l.id);
    placeLabels(labels, { width: W, height: H });
    expect(labels.map((l) => l.id)).toEqual(copy);
  });
});

describe('overlapDensity', () => {
  it('is zero for collision-free placements and positive for naive ones', () => {
    const W = 600;
    const H = 400;
    const labels = makeLabels(400, W, H, 7);
    expect(overlapDensity(placeLabels(labels, { width: W, height: H }).placed, W, H)).toBe(0);
    expect(overlapDensity(placeNaively(labels, { width: W, height: H }), W, H)).toBeGreaterThan(0.1);
  });

  it('matches a brute-force computation', () => {
    const W = 300;
    const H = 200;
    const placements = placeNaively(makeLabels(80, W, H, 3), { width: W, height: H });
    let overlap = 0;
    let total = 0;
    placements.forEach((p, i) => {
      total += (p.box.maxX - p.box.minX) * (p.box.maxY - p.box.minY);
      for (let j = 0; j < i; j += 1) overlap += overlapArea(p.box, placements[j]!.box);
    });
    expect(overlapDensity(placements, W, H)).toBeCloseTo(overlap / total, 10);
  });
});
