/**
 * GLSL ES 3.00 sources for the hero terrain.
 *
 * The field constants are interpolated from field.ts, so the shader and the
 * CPU readout can never disagree about the surface.
 *
 * Rendering in one pass, per pixel:
 *   1. world position from pixel position (pan offset + scale)
 *   2. elevation e ∈ [0,1] from the domain-warped fbm field
 *   3. hillshade from screen-space derivatives of e (dFdx/dFdy — free, no
 *      extra field evaluations)
 *   4. anti-aliased contour lines using fwidth(), so they stay one device
 *      pixel crisp at any resolution
 *   5. a hypsometric colour ramp (indigo valleys → teal → green → sand →
 *      coral peaks), dimmed by uDim so text stays readable over it
 *   6. a "survey lens" around the pointer: 3× denser contours in the
 *      current tab's accent colour (uAccent), faded in/out by uLens
 *   7. faint graticule + ordered dithering against gradient banding
 */
import {
  CONTOUR_INTERVAL,
  DRIFT_A,
  DRIFT_B,
  ELEVATION_BIAS,
  ELEVATION_SCALE,
  GAIN,
  INDEX_EVERY,
  LACUNARITY,
  OCTAVES,
  ROT_COS,
  ROT_SIN,
  SHIFT_X,
  SHIFT_Y,
  WARP,
  WARP_OFFSET_X,
  WARP_OFFSET_Y,
} from './field';

/** Format a JS number as a GLSL float literal ("2" → "2.0"). */
const f = (n: number): string => (Number.isInteger(n) ? `${n}.0` : `${n}`);

/**
 * Vertex shader: one oversized triangle covering the viewport, generated
 * from gl_VertexID — no vertex buffer at all.
 */
export const VERTEX_SHADER = /* glsl */ `#version 300 es
void main() {
  // (0,0) (2,0) (0,2) → clip space (-1,-1) (3,-1) (-1,3)
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

uniform vec2  uResolution;   // drawing-buffer size, device px
uniform float uPixelRatio;   // device px per CSS px (incl. dynamic resolution)
uniform float uUnitPx;       // device px per world unit
uniform vec2  uOffset;       // world position of the canvas centre
uniform float uTime;         // pre-scaled animation time
uniform vec2  uPointer;      // pointer, device px, origin bottom-left
uniform float uLens;         // 0…1 lens visibility (eased on the CPU)
uniform vec3  uAccent;       // lens colour, linear-ish RGB 0…1
uniform float uDim;          // 0…1 overall brightness (eased on the CPU)

out vec4 outColor;

// ── Field (mirrors src/gl/field.ts) ─────────────────────────────────────
float wave(vec2 p) { return sin(p.x) * sin(p.y); }

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  const mat2 R = mat2(${f(ROT_COS)}, ${f(ROT_SIN)}, ${f(-ROT_SIN)}, ${f(ROT_COS)}); // column-major
  for (int i = 0; i < ${OCTAVES}; i++) {
    value += amplitude * wave(p);
    p = R * p * ${f(LACUNARITY)} + vec2(${f(SHIFT_X)}, ${f(SHIFT_Y)});
    amplitude *= ${f(GAIN)};
  }
  return value;
}

float elevation(vec2 p, float t) {
  vec2 q = vec2(
    fbm(p + vec2(${f(DRIFT_A)} * t, 0.0)),
    fbm(p + vec2(${f(WARP_OFFSET_X)}, ${f(WARP_OFFSET_Y)} + ${f(DRIFT_B)} * t))
  );
  float e = fbm(p + ${f(WARP)} * q) * ${f(ELEVATION_SCALE)} + ${f(ELEVATION_BIAS)};
  return clamp(e, 0.0, 1.0);
}

// ── Line helpers ───────────────────────────────────────────────────────
// Coverage (0…1) of an iso-line of value v every 'interval', 'halfWidth'
// device px wide on each side. fwidth() converts value distance to pixels.
float isoLine(float v, float interval, float halfWidth) {
  float f = v / interval;
  float w = fwidth(f);
  // Flat areas (e.g. terrain clamped at 0 or 1) have no gradient, so there
  // is no line to draw. Without this guard a plateau sitting exactly on a
  // contour value (1.0 is a multiple of the interval) would be "on the line"
  // at every pixel and flood-fill with line colour.
  if (w < 1e-5) return 0.0;
  float d = abs(fract(f + 0.5) - 0.5);          // distance to nearest line, in "f" units
  float px = d / w;                              // … in device pixels
  return 1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, px);
}

// Hypsometric colour ramp, like a physical map: elevation 0…1 → colour.
// Kept fairly dark so white text on top always has contrast.
vec3 hypsometric(float e) {
  vec3 c = vec3(0.055, 0.063, 0.165);                                 // deep indigo
  c = mix(c, vec3(0.067, 0.153, 0.310), smoothstep(0.10, 0.30, e));   // ocean blue
  c = mix(c, vec3(0.055, 0.302, 0.322), smoothstep(0.30, 0.45, e));   // teal
  c = mix(c, vec3(0.180, 0.376, 0.231), smoothstep(0.45, 0.60, e));   // green
  c = mix(c, vec3(0.545, 0.463, 0.247), smoothstep(0.60, 0.76, e));   // sand
  c = mix(c, vec3(0.660, 0.290, 0.220), smoothstep(0.76, 0.92, e));   // coral peaks
  return c;
}

// 4×4 Bayer matrix value in [0,1) — ordered dithering hides 8-bit banding
// in the very dark gradients.
float bayer4(vec2 p) {
  ivec2 i = ivec2(mod(p, 4.0));
  int index = i.x + i.y * 4;
  const float m[16] = float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  return m[index] / 16.0;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 world = (frag - 0.5 * uResolution) / uUnitPx + uOffset;

  float e = elevation(world, uTime);

  // Hillshade from screen-space derivatives (slope per device pixel → per world unit).
  vec2 grad = vec2(dFdx(e), dFdy(e)) * uUnitPx;
  vec3 normal = normalize(vec3(-grad * 0.9, 1.0));
  float shade = dot(normal, normalize(vec3(-0.55, 0.65, 0.55)));

  vec3 color = hypsometric(e) * (0.72 + 0.48 * shade);

  // Contours: regular lines plus heavier index contours.
  float hairline = 0.5 * uPixelRatio;
  float minor = isoLine(e, ${f(CONTOUR_INTERVAL)}, hairline);
  float major = isoLine(e, ${f(CONTOUR_INTERVAL * INDEX_EVERY)}, hairline * 1.9);
  color = mix(color, vec3(0.85, 0.90, 1.0), minor * 0.22);
  color = mix(color, vec3(1.0), major * 0.3);
  color *= uDim;

  // Survey lens around the pointer (radius in CSS px, scaled to device px).
  float dist = length(frag - uPointer) / uPixelRatio;
  float lens = uLens * (1.0 - smoothstep(110.0, 150.0, dist));
  if (lens > 0.001) {
    float fine = isoLine(e, ${f(CONTOUR_INTERVAL / 3)}, hairline * 0.8);
    vec3 signal = uAccent;
    color = mix(color, signal, fine * 0.3 * lens);
    color = mix(color, signal, minor * 0.75 * lens);
    color = mix(color, vec3(1.0), major * 0.5 * lens);
    // Thin ring marking the lens edge.
    float ring = 1.0 - smoothstep(0.0, 1.2, abs(dist - 150.0));
    color = mix(color, signal, ring * 0.35 * uLens);
  }

  // Graticule: faint world-space grid every half unit.
  float grid = max(isoLine(world.x, 0.5, hairline), isoLine(world.y, 0.5, hairline));
  color = mix(color, vec3(0.9), grid * 0.045);

  color += (bayer4(frag) - 0.5) / 255.0;
  outColor = vec4(color, 1.0);
}`;
