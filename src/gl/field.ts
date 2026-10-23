/**
 * The procedural height field behind the hero, defined ONCE.
 *
 * The GPU evaluates this field per pixel in a fragment shader (see
 * shaders.ts, which is generated from the constants below). The CPU
 * evaluates the very same function here to sample the elevation under the
 * pointer for the live readout — so the number you read is the surface you
 * see.
 *
 * Why sine waves instead of classic hash-based value/Perlin noise: hash
 * functions rely on `fract()` of large numbers, which gives different
 * results in 32-bit GPU floats and 64-bit JavaScript numbers. A sum of
 * rotated sine products is numerically well-conditioned in both, so CPU and
 * GPU agree to within rounding error.
 *
 * Shape of the function (all deterministic, no textures):
 *   wave(p)      = sin(p.x) · sin(p.y)                     — one "egg-crate" octave
 *   fbm(p)       = Σ amp_i · wave(p_i), p_{i+1} = R·p_i·LACUNARITY + SHIFT
 *   field(p, t)  = fbm(p + WARP · q),  q = (fbm(p + drift₁), fbm(p + O + drift₂))
 * The second fbm layer ("domain warping") bends the egg-crate pattern into
 * ridges and valleys that read as natural terrain.
 */

/** Number of fbm octaves. 5 gives crisp detail at hero scale. */
export const OCTAVES = 5;
/** Frequency multiplier between octaves. Not exactly 2 to avoid visible tiling. */
export const LACUNARITY = 2.02;
/** Amplitude multiplier between octaves. */
export const GAIN = 0.5;
/** Rotation applied between octaves: cos θ, sin θ with θ ≈ 36.87° (a 3-4-5 triangle). */
export const ROT_COS = 0.8;
export const ROT_SIN = 0.6;
/** Translation applied between octaves, decorrelates octaves near the origin. */
export const SHIFT_X = 1.7;
export const SHIFT_Y = 9.2;
/** Offset of the second warp channel. */
export const WARP_OFFSET_X = 5.2;
export const WARP_OFFSET_Y = 1.3;
/** Strength of the domain warp. */
export const WARP = 1.7;
/** How fast each warp channel drifts per unit of time (time is pre-scaled). */
export const DRIFT_A = 0.13;
export const DRIFT_B = -0.11;

/** Map raw fbm output (≈ −1…1) to a normalised elevation 0…1. */
export const ELEVATION_SCALE = 0.9;
export const ELEVATION_BIAS = 0.5;
/** Display range of the readout: 0 … MAX_ELEVATION_M metres. */
export const MAX_ELEVATION_M = 2400;

/** Contour spacing in normalised elevation: 0.025 × 2400 m = a 60 m contour interval. */
export const CONTOUR_INTERVAL = 0.025;
/** Every n-th contour is an index contour (drawn heavier, as on survey maps). */
export const INDEX_EVERY = 5;

/** One octave: an egg-crate surface. */
function wave(x: number, y: number): number {
  return Math.sin(x) * Math.sin(y);
}

/** Fractal sum of rotated, scaled waves. Mirrors `fbm()` in the shader. */
export function fbm(x: number, y: number): number {
  let value = 0;
  let amplitude = 0.5;
  let px = x;
  let py = y;
  for (let i = 0; i < OCTAVES; i += 1) {
    value += amplitude * wave(px, py);
    // p = R · p · LACUNARITY + SHIFT  (R = rotation by θ)
    const nx = (ROT_COS * px - ROT_SIN * py) * LACUNARITY + SHIFT_X;
    const ny = (ROT_SIN * px + ROT_COS * py) * LACUNARITY + SHIFT_Y;
    px = nx;
    py = ny;
    amplitude *= GAIN;
  }
  return value;
}

/** Domain-warped field value at world position (x, y) and time t. */
export function field(x: number, y: number, t: number): number {
  const qx = fbm(x + DRIFT_A * t, y);
  const qy = fbm(x + WARP_OFFSET_X, y + WARP_OFFSET_Y + DRIFT_B * t);
  return fbm(x + WARP * qx, y + WARP * qy);
}

/** Normalised elevation in [0, 1]. Mirrors `elevation()` in the shader. */
export function elevation(x: number, y: number, t: number): number {
  const e = field(x, y, t) * ELEVATION_SCALE + ELEVATION_BIAS;
  return Math.min(1, Math.max(0, e));
}

/** Elevation in metres, rounded to the contour-friendly 1 m. */
export function elevationMetres(x: number, y: number, t: number): number {
  return Math.round(elevation(x, y, t) * MAX_ELEVATION_M);
}
