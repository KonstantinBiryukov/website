/**
 * Map-label placement with collision detection — a compact, self-contained
 * implementation written for this site to illustrate the technique.
 * (It is not LightBox's LabelTextCollision library.)
 *
 * Algorithm — greedy placement by priority:
 *   1. Sort labels by priority (most important first).
 *   2. For each label, try up to eight candidate positions around its point
 *      in the classic cartographic preference order (Imhof): upper-right,
 *      upper-left, lower-right, lower-left, then right, left, above, below.
 *   3. Accept the first candidate that is inside the viewport and does not
 *      intersect any label already placed; otherwise hide the label.
 *
 * Collision queries use a uniform grid spatial index: each placed box is
 * registered in every cell it overlaps, so a query only compares against
 * boxes in nearby cells. For n labels that turns O(n²) pairwise tests into
 * roughly O(n · k), where k is the (small) number of boxes per cell.
 *
 * All functions are pure (apart from the reusable index) and allocation is
 * kept low so the demo can re-run placement on every pointer-move.
 */

/** Axis-aligned bounding box in screen pixels. */
export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** A label to place: an anchor point plus the measured text size. */
export interface LabelInput {
  readonly id: number;
  /** Anchor point in screen px. */
  readonly x: number;
  readonly y: number;
  /** Measured text box size in px. */
  readonly width: number;
  readonly height: number;
  /** Higher = placed first (e.g. parcel area or city population). */
  readonly priority: number;
}

/** Candidate positions relative to the anchor point. */
export type Anchor = 'NE' | 'NW' | 'SE' | 'SW' | 'E' | 'W' | 'N' | 'S';

/** Cartographic preference order (Imhof, 1975). */
export const ANCHORS: readonly Anchor[] = ['NE', 'NW', 'SE', 'SW', 'E', 'W', 'N', 'S'];

/** One placed label. */
export interface Placement {
  readonly label: LabelInput;
  readonly anchor: Anchor;
  readonly box: Box;
}

export interface PlacementResult {
  readonly placed: readonly Placement[];
  /** Number of labels that found no free position. */
  readonly hidden: number;
  /** Box-vs-box intersection tests performed (shows the index at work). */
  readonly tests: number;
}

export interface PlacementOptions {
  /** Viewport size; labels must fit entirely inside it. */
  readonly width: number;
  readonly height: number;
  /** Gap between the anchor point and the label box, px. */
  readonly gap?: number;
  /** Extra empty margin required around each label, px. */
  readonly padding?: number;
  /** Try all eight positions (true) or only upper-right (false). */
  readonly multiPosition?: boolean;
  /**
   * Boxes labels must not cover — e.g. the point markers themselves.
   * Registered in the index before any label is placed.
   */
  readonly obstacles?: readonly Box[];
}

/** Strict overlap test; touching edges do not count as a collision. */
export function intersects(a: Box, b: Box): boolean {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
}

/** Area of the intersection of two boxes (0 when disjoint). */
export function overlapArea(a: Box, b: Box): number {
  const w = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const h = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY);
  return w > 0 && h > 0 ? w * h : 0;
}

/** The box a label would occupy at a given anchor position. */
export function candidateBox(label: LabelInput, anchor: Anchor, gap: number): Box {
  const { x, y, width: w, height: h } = label;
  let minX: number;
  let minY: number;
  switch (anchor) {
    case 'NE':
      minX = x + gap;
      minY = y - gap - h;
      break;
    case 'NW':
      minX = x - gap - w;
      minY = y - gap - h;
      break;
    case 'SE':
      minX = x + gap;
      minY = y + gap;
      break;
    case 'SW':
      minX = x - gap - w;
      minY = y + gap;
      break;
    case 'E':
      minX = x + gap * 1.5;
      minY = y - h / 2;
      break;
    case 'W':
      minX = x - gap * 1.5 - w;
      minY = y - h / 2;
      break;
    case 'N':
      minX = x - w / 2;
      minY = y - gap * 1.5 - h;
      break;
    case 'S':
      minX = x - w / 2;
      minY = y + gap * 1.5;
      break;
  }
  return { minX, minY, maxX: minX + w, maxY: minY + h };
}

/**
 * Uniform-grid spatial index over a fixed viewport.
 *
 * Cells are stored in a flat array of arrays and reused between runs:
 * `clear()` empties every cell without reallocating, so steady-state
 * re-placement allocates almost nothing.
 */
export class GridIndex {
  private cols = 0;
  private rows = 0;
  private cellSize = 64;
  private cells: Box[][] = [];
  /** Running count of box-vs-box tests, for instrumentation. */
  tests = 0;

  /** Prepare the grid for a viewport; reuses cell arrays when possible. */
  reset(width: number, height: number, cellSize: number): void {
    this.cellSize = cellSize;
    this.cols = Math.max(1, Math.ceil(width / cellSize));
    this.rows = Math.max(1, Math.ceil(height / cellSize));
    const needed = this.cols * this.rows;
    while (this.cells.length < needed) this.cells.push([]);
    for (let i = 0; i < needed; i += 1) (this.cells[i] as Box[]).length = 0;
    this.tests = 0;
  }

  /** Inclusive cell-range covered by a box, clamped to the grid. */
  private range(box: Box): [number, number, number, number] {
    const s = this.cellSize;
    const c0 = Math.max(0, Math.floor(box.minX / s));
    const r0 = Math.max(0, Math.floor(box.minY / s));
    const c1 = Math.min(this.cols - 1, Math.floor(box.maxX / s));
    const r1 = Math.min(this.rows - 1, Math.floor(box.maxY / s));
    return [c0, r0, c1, r1];
  }

  /** Register a box in every cell it overlaps. */
  insert(box: Box): void {
    const [c0, r0, c1, r1] = this.range(box);
    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) (this.cells[r * this.cols + c] as Box[]).push(box);
    }
  }

  /** Does `box` intersect any registered box? Stops at the first hit. */
  collides(box: Box): boolean {
    const [c0, r0, c1, r1] = this.range(box);
    for (let r = r0; r <= r1; r += 1) {
      for (let c = c0; c <= c1; c += 1) {
        for (const other of this.cells[r * this.cols + c] as Box[]) {
          this.tests += 1;
          if (intersects(box, other)) return true;
        }
      }
    }
    return false;
  }
}

/** Is the box fully inside the viewport? */
function inside(box: Box, width: number, height: number): boolean {
  return box.minX >= 0 && box.minY >= 0 && box.maxX <= width && box.maxY <= height;
}

/** Grow a box by `padding` on every side (returns a new box). */
function padded(box: Box, padding: number): Box {
  return { minX: box.minX - padding, minY: box.minY - padding, maxX: box.maxX + padding, maxY: box.maxY + padding };
}

/**
 * Place labels without overlaps. See the module comment for the algorithm.
 *
 * @param labels — any order; they are sorted by priority internally
 *   (a copy is sorted, the input is not mutated).
 * @param index — optional reusable index (avoids reallocating per run).
 */
export function placeLabels(labels: readonly LabelInput[], options: PlacementOptions, index: GridIndex = new GridIndex()): PlacementResult {
  const { width, height, gap = 4, padding = 2, multiPosition = true, obstacles = [] } = options;
  const anchors = multiPosition ? ANCHORS : ANCHORS.slice(0, 1);
  // Cell size ≈ a typical label width keeps both cell count and boxes-per-cell low.
  index.reset(width, height, 72);
  for (const obstacle of obstacles) index.insert(obstacle);

  const ordered = [...labels].sort((a, b) => b.priority - a.priority || a.id - b.id);
  const placed: Placement[] = [];
  let hidden = 0;

  for (const label of ordered) {
    let accepted: Placement | null = null;
    for (const anchor of anchors) {
      const box = candidateBox(label, anchor, gap);
      if (!inside(box, width, height)) continue;
      // Collide with padding so accepted labels keep a little breathing room.
      if (index.collides(padded(box, padding))) continue;
      accepted = { label, anchor, box };
      break;
    }
    if (accepted === null) {
      hidden += 1;
    } else {
      placed.push(accepted);
      index.insert(accepted.box);
    }
  }
  return { placed, hidden, tests: index.tests };
}

/**
 * Naive labelling for comparison: every label at the upper-right position,
 * nothing hidden (only labels completely off-screen are dropped).
 */
export function placeNaively(labels: readonly LabelInput[], options: PlacementOptions): Placement[] {
  const { width, height, gap = 4 } = options;
  const out: Placement[] = [];
  for (const label of labels) {
    const box = candidateBox(label, 'NE', gap);
    if (box.maxX < 0 || box.maxY < 0 || box.minX > width || box.minY > height) continue;
    out.push({ label, anchor: 'NE', box });
  }
  return out;
}

/**
 * Overlap density: total pairwise overlap area divided by total label area.
 * 0 means no two labels overlap. Uses its own grid index so the cost stays
 * near-linear; each pair is counted once.
 */
export function overlapDensity(placements: readonly Placement[], width: number, height: number): number {
  if (placements.length === 0) return 0;
  const cellSize = 72;
  const cols = Math.max(1, Math.ceil(width / cellSize));
  const rows = Math.max(1, Math.ceil(height / cellSize));
  const cells: number[][] = Array.from({ length: cols * rows }, () => []);
  const clampCol = (v: number) => Math.min(cols - 1, Math.max(0, Math.floor(v / cellSize)));
  const clampRow = (v: number) => Math.min(rows - 1, Math.max(0, Math.floor(v / cellSize)));

  let total = 0;
  let overlap = 0;
  // Pairs already counted (i < j), encoded as i * n + j. Prevents double
  // counting when two boxes share several cells.
  const seen = new Set<number>();
  const n = placements.length;

  placements.forEach((p, i) => {
    const { box } = p;
    total += (box.maxX - box.minX) * (box.maxY - box.minY);
    for (let r = clampRow(box.minY); r <= clampRow(box.maxY); r += 1) {
      for (let c = clampCol(box.minX); c <= clampCol(box.maxX); c += 1) {
        const cell = cells[r * cols + c] as number[];
        for (const j of cell) {
          const key = j * n + i;
          if (seen.has(key)) continue;
          seen.add(key);
          overlap += overlapArea(box, (placements[j] as Placement).box);
        }
        cell.push(i);
      }
    }
  });
  return total === 0 ? 0 : overlap / total;
}
