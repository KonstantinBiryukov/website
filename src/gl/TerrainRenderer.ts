/**
 * TerrainRenderer — owns the hero's WebGL2 context and its frame loop.
 *
 * Framework-free on purpose: React only creates it and calls dispose().
 * Everything per-frame happens here, outside React, so rendering never
 * triggers a React re-render.
 *
 * Performance rules it follows:
 *  - Renders only while the canvas is on screen AND the tab is visible
 *    (IntersectionObserver + visibilitychange). Off screen = zero GPU work.
 *  - Render-on-demand: the slow drift runs only when `animate` is on (the
 *    About tab) and motion is allowed. Otherwise the loop runs only while
 *    the camera pans to a new tab's location or the lens/brightness ease,
 *    then stops completely.
 *  - Device pixel ratio is capped, and a dynamic-resolution controller
 *    lowers the internal resolution if frames take too long (and raises it
 *    again when there is headroom).
 *  - Optional frame cap (e.g. 30 fps on touch devices) to save battery.
 *  - No per-frame allocations: uniforms are written from scalars.
 *  - Handles WebGL context loss/restoration, and frees every GPU object on
 *    dispose() (plus WEBGL_lose_context to release the context at once).
 */
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';
import { elevationMetres } from './field';

/** What the renderer reports about the point under the cursor. */
export interface PointerSample {
  /** World coordinates (1 unit = 1 km in the readout). */
  readonly x: number;
  readonly y: number;
  readonly metres: number;
}

export interface TerrainOptions {
  /** Freeze the terrain drift (respects prefers-reduced-motion). */
  readonly reducedMotion: boolean;
  /** Upper bound for devicePixelRatio. 1.5 is visually lossless for soft terrain. */
  readonly maxPixelRatio?: number;
  /** Minimum ms between frames; 0 = every display refresh. */
  readonly minFrameInterval?: number;
  /** CSS px per world unit — the "map scale". */
  readonly unitCssPx?: number;
  /** Called (at most once per frame) with the sample under the pointer. */
  readonly onPointerSample?: (sample: PointerSample | null) => void;
  /** Called once if WebGL fails after construction (e.g. context lost for good). */
  readonly onFailure?: () => void;
}

/** Uniform locations, looked up once after linking. */
interface Uniforms {
  readonly resolution: WebGLUniformLocation | null;
  readonly pixelRatio: WebGLUniformLocation | null;
  readonly unitPx: WebGLUniformLocation | null;
  readonly offset: WebGLUniformLocation | null;
  readonly time: WebGLUniformLocation | null;
  readonly pointer: WebGLUniformLocation | null;
  readonly lens: WebGLUniformLocation | null;
  readonly accent: WebGLUniformLocation | null;
  readonly dim: WebGLUniformLocation | null;
}

/** Where the camera looks and how the map is lit — one per tab. */
export interface MapView {
  /** World position at the centre of the screen. */
  readonly x: number;
  readonly y: number;
  /** Lens/accent colour, RGB 0…1. */
  readonly accent: readonly [number, number, number];
  /** Overall brightness 0…1 (lower behind text-heavy tabs). */
  readonly dim: number;
  /** Let the terrain drift slowly (continuous rendering). */
  readonly animate: boolean;
}

/** GPU objects that must be recreated after a context loss. */
interface GpuResources {
  readonly program: WebGLProgram;
  readonly vao: WebGLVertexArrayObject;
  readonly uniforms: Uniforms;
}

/** Context attributes: no depth/stencil/MSAA — a single full-screen pass needs none. */
const CONTEXT_ATTRIBUTES: WebGLContextAttributes = {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  // Decorative graphics should not wake a discrete GPU on dual-GPU laptops.
  powerPreference: 'low-power',
};

/** Animation speed: field time units per second. Slow enough to feel geological. */
const DRIFT_PER_SECOND = 0.045;
/** Lens fade speed (fraction of full strength per second). */
const LENS_FADE_PER_SECOND = 4;
/** Dynamic resolution bounds and thresholds. */
const MIN_RENDER_SCALE = 0.5;
const SLOW_FRAME_MS = 22; // sustained frames slower than ~45 fps → lower resolution
const FAST_FRAME_MS = 14; // sustained frames faster than ~70 fps → raise resolution
const SCALE_WINDOW = 40; // frames averaged before each decision
/** Camera easing: fraction of the remaining distance covered per second (exponential). */
const PAN_RATE = 2.6;
/** Below this distance (world units) the pan snaps and stops requesting frames. */
const PAN_EPSILON = 0.0005;
/** Default view until the first setView(). */
const DEFAULT_VIEW: MapView = { x: 0.35, y: -0.2, accent: [1, 0.42, 0.29], dim: 1, animate: true };

export class TerrainRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly options: Required<Omit<TerrainOptions, 'onPointerSample' | 'onFailure'>> &
    Pick<TerrainOptions, 'onPointerSample' | 'onFailure'>;

  private gpu: GpuResources | null = null;
  private frameHandle = 0;
  private lastFrame = 0;
  private time = 0;
  /** Mutable copy of options.reducedMotion (can change at runtime). */
  private reducedMotion: boolean;

  /** Visibility gates; the loop runs only when all are true. */
  private onScreen = true;
  private pageVisible = !document.hidden;
  private contextLost = false;
  private disposed = false;

  /** Pointer in CSS px relative to the canvas, or null when outside. */
  private pointer: { x: number; y: number } | null = null;
  private lensTarget = 0;
  private lens = 0;

  /** Camera: current (eased) and target view. Accent changes instantly. */
  private target: MapView = DEFAULT_VIEW;
  private camX = DEFAULT_VIEW.x;
  private camY = DEFAULT_VIEW.y;
  private dim = DEFAULT_VIEW.dim;

  /** Set when something changed that requires a redraw. */
  private dirty = true;

  /** Dynamic resolution state. */
  private renderScale = 1;
  private frameTimeSum = 0;
  private frameCount = 0;

  private readonly resizeObserver: ResizeObserver;
  private readonly intersectionObserver: IntersectionObserver;

  /** Feature test without creating a lasting context. */
  static isSupported(): boolean {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (gl === null) return false;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    } catch {
      return false;
    }
  }

  /** @throws if WebGL2 is unavailable or the shaders fail to compile. */
  constructor(canvas: HTMLCanvasElement, options: TerrainOptions) {
    this.canvas = canvas;
    this.options = {
      maxPixelRatio: 1.5,
      minFrameInterval: 0,
      unitCssPx: 340,
      ...options,
    };

    this.reducedMotion = options.reducedMotion;

    const gl = canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
    if (gl === null) throw new Error('WebGL2 is not available');
    this.gl = gl;
    this.gpu = this.createResources();

    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
    document.addEventListener('visibilitychange', this.handleVisibility);

    // Track size changes (layout, rotation, zoom) — resize the drawing buffer lazily.
    this.resizeObserver = new ResizeObserver(() => {
      this.dirty = true;
      this.schedule();
    });
    this.resizeObserver.observe(canvas);

    // Stop all work when the hero scrolls out of view.
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.onScreen = entries.some((entry) => entry.isIntersecting);
      if (this.onScreen) {
        this.lastFrame = 0; // don't count off-screen time as one huge frame
        this.schedule();
      }
    });
    this.intersectionObserver.observe(canvas);

    this.schedule();
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Move the survey lens. Coordinates are CSS px relative to the canvas. */
  setPointer(x: number, y: number): void {
    this.pointer = { x, y };
    this.lensTarget = 1;
    this.dirty = true;
    this.schedule();
  }

  /** Hide the survey lens (pointer left the hero). */
  clearPointer(): void {
    this.lensTarget = 0;
    this.schedule();
  }

  /**
   * Fly to a new view (called on tab change). The camera eases there over
   * about a second; on the very first call it jumps, so a deep link to a
   * tab doesn't start with a pan.
   */
  setView(view: MapView, immediate = false): void {
    this.target = view;
    if (immediate) {
      this.camX = view.x;
      this.camY = view.y;
      this.dim = view.dim;
    }
    this.dirty = true;
    this.schedule();
  }

  /** Toggle the slow terrain drift at runtime. */
  setReducedMotion(reduced: boolean): void {
    if (reduced === this.reducedMotion) return;
    this.reducedMotion = reduced;
    this.dirty = true;
    this.schedule();
  }

  /** Stop the loop and release every GPU and DOM resource. Idempotent. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frameHandle);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    this.destroyResources();
    // Free the context immediately instead of waiting for garbage collection
    // (browsers cap the number of live contexts per page).
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  // ── Frame loop ──────────────────────────────────────────────────────────

  /** True if another frame is needed right now. */
  private needsFrame(): boolean {
    const animating = this.target.animate && !this.reducedMotion;
    const lensEasing = this.lens !== this.lensTarget;
    return animating || lensEasing || this.panning() || this.dirty;
  }

  /** Is the camera (or brightness) still travelling towards its target? */
  private panning(): boolean {
    return this.camX !== this.target.x || this.camY !== this.target.y || this.dim !== this.target.dim;
  }

  /** Exponential ease towards the target view; snaps when close enough. */
  private stepCamera(dt: number): void {
    // With reduced motion the camera cuts instead of flying.
    const k = this.reducedMotion ? 1 : 1 - Math.exp(-PAN_RATE * dt);
    this.camX += (this.target.x - this.camX) * k;
    this.camY += (this.target.y - this.camY) * k;
    this.dim += (this.target.dim - this.dim) * k;
    if (Math.abs(this.target.x - this.camX) < PAN_EPSILON && Math.abs(this.target.y - this.camY) < PAN_EPSILON) {
      this.camX = this.target.x;
      this.camY = this.target.y;
    }
    if (Math.abs(this.target.dim - this.dim) < 0.002) this.dim = this.target.dim;
  }

  /** Request a frame if the loop is allowed to run and has work to do. */
  private schedule(): void {
    if (this.disposed || this.contextLost || !this.onScreen || !this.pageVisible) return;
    if (this.frameHandle !== 0 || !this.needsFrame()) return;
    this.frameHandle = requestAnimationFrame(this.frame);
  }

  /** One animation frame. Arrow function so it can be passed to rAF directly. */
  private readonly frame = (now: number): void => {
    this.frameHandle = 0;
    if (this.disposed || this.contextLost || !this.onScreen || !this.pageVisible) return;

    // Optional frame cap: skip this refresh if it came too soon.
    if (this.options.minFrameInterval > 0 && this.lastFrame !== 0 && now - this.lastFrame < this.options.minFrameInterval - 1) {
      this.frameHandle = requestAnimationFrame(this.frame);
      return;
    }

    // Clamp dt so a long pause (debugger, background tab) never jumps the animation.
    const dt = this.lastFrame === 0 ? 1 / 60 : Math.min((now - this.lastFrame) / 1000, 0.1);
    if (this.lastFrame !== 0) this.adaptResolution(now - this.lastFrame);
    this.lastFrame = now;

    if (this.target.animate && !this.reducedMotion) this.time += dt * DRIFT_PER_SECOND;
    this.stepCamera(dt);

    // Ease the lens towards its target at a constant rate.
    const step = LENS_FADE_PER_SECOND * dt;
    this.lens = this.lens < this.lensTarget ? Math.min(this.lensTarget, this.lens + step) : Math.max(this.lensTarget, this.lens - step);
    if (this.lens === 0 && this.lensTarget === 0) this.pointer = null;

    this.render();
    this.reportPointer();
    this.dirty = false;

    // Continue only while there is something to animate.
    if (this.needsFrame()) this.frameHandle = requestAnimationFrame(this.frame);
    else this.lastFrame = 0;
  };

  /**
   * Dynamic resolution. Averages frame intervals over a window; if the
   * device can't keep up, lowers the internal resolution by 15 %, and
   * raises it again by 10 % when there is plenty of headroom.
   */
  private adaptResolution(frameMs: number): void {
    if (this.options.minFrameInterval > 0) return; // capped loops measure the cap, not the GPU
    this.frameTimeSum += frameMs;
    this.frameCount += 1;
    if (this.frameCount < SCALE_WINDOW) return;
    const average = this.frameTimeSum / this.frameCount;
    this.frameTimeSum = 0;
    this.frameCount = 0;
    if (average > SLOW_FRAME_MS && this.renderScale > MIN_RENDER_SCALE) {
      this.renderScale = Math.max(MIN_RENDER_SCALE, this.renderScale * 0.85);
      this.dirty = true;
    } else if (average < FAST_FRAME_MS && this.renderScale < 1) {
      this.renderScale = Math.min(1, this.renderScale * 1.1);
      this.dirty = true;
    }
  }

  /** Size the drawing buffer to the canvas, then draw one frame. */
  private render(): void {
    const gpu = this.gpu;
    if (gpu === null) return;
    const { gl, canvas } = this;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, this.options.maxPixelRatio) * this.renderScale;
    const width = Math.max(1, Math.round(canvas.clientWidth * pixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight * pixelRatio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);

    gl.useProgram(gpu.program);
    gl.bindVertexArray(gpu.vao);
    const u = gpu.uniforms;
    gl.uniform2f(u.resolution, width, height);
    gl.uniform1f(u.pixelRatio, pixelRatio);
    gl.uniform1f(u.unitPx, this.options.unitCssPx * pixelRatio);
    gl.uniform2f(u.offset, this.camX, this.camY);
    gl.uniform1f(u.time, this.time);
    // Pointer: CSS px (top-left origin) → device px (bottom-left origin).
    const pointer = this.pointer ?? { x: -1e4, y: -1e4 };
    gl.uniform2f(u.pointer, pointer.x * pixelRatio, height - pointer.y * pixelRatio);
    gl.uniform1f(u.lens, this.lens);
    gl.uniform3f(u.accent, this.target.accent[0], this.target.accent[1], this.target.accent[2]);
    gl.uniform1f(u.dim, this.dim);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Sample the CPU mirror of the field under the pointer for the readout. */
  private reportPointer(): void {
    const callback = this.options.onPointerSample;
    if (callback === undefined) return;
    if (this.pointer === null || this.lensTarget === 0) {
      callback(null);
      return;
    }
    // Same transform as the shader, in CSS px (y flipped: world y points up).
    const unit = this.options.unitCssPx;
    const x = (this.pointer.x - this.canvas.clientWidth / 2) / unit + this.camX;
    const y = (this.canvas.clientHeight / 2 - this.pointer.y) / unit + this.camY;
    callback({ x, y, metres: elevationMetres(x, y, this.time) });
  }

  // ── GPU resources ───────────────────────────────────────────────────────

  /** Compile, link and look up uniforms. Throws with the driver's log on failure. */
  private createResources(): GpuResources {
    const { gl } = this;
    const vertex = this.compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = this.compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    // Shaders can be flagged for deletion right away; the program keeps them alive.
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
      const log = gl.getProgramInfoLog(program) ?? 'unknown error';
      gl.deleteProgram(program);
      throw new Error(`Terrain program failed to link: ${log}`);
    }
    // An empty VAO: the vertex shader generates positions from gl_VertexID.
    const vao = gl.createVertexArray();
    const uniforms: Uniforms = {
      resolution: gl.getUniformLocation(program, 'uResolution'),
      pixelRatio: gl.getUniformLocation(program, 'uPixelRatio'),
      unitPx: gl.getUniformLocation(program, 'uUnitPx'),
      offset: gl.getUniformLocation(program, 'uOffset'),
      time: gl.getUniformLocation(program, 'uTime'),
      pointer: gl.getUniformLocation(program, 'uPointer'),
      lens: gl.getUniformLocation(program, 'uLens'),
      accent: gl.getUniformLocation(program, 'uAccent'),
      dim: gl.getUniformLocation(program, 'uDim'),
    };
    return { program, vao, uniforms };
  }

  /** Compile one shader stage. */
  private compile(type: GLenum, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type);
    if (shader === null) throw new Error('Could not create shader');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
      const log = gl.getShaderInfoLog(shader) ?? 'unknown error';
      gl.deleteShader(shader);
      throw new Error(`Terrain shader failed to compile: ${log}`);
    }
    return shader;
  }

  /** Delete program and VAO (safe to call with a lost context). */
  private destroyResources(): void {
    if (this.gpu === null) return;
    this.gl.deleteProgram(this.gpu.program);
    this.gl.deleteVertexArray(this.gpu.vao);
    this.gpu = null;
  }

  // ── Event handlers (arrow functions keep `this` and stable identity) ────

  private readonly handleVisibility = (): void => {
    this.pageVisible = !document.hidden;
    if (this.pageVisible) {
      this.lastFrame = 0;
      this.schedule();
    }
  };

  private readonly handleContextLost = (event: Event): void => {
    // preventDefault() tells the browser we want the context restored later.
    event.preventDefault();
    this.contextLost = true;
    cancelAnimationFrame(this.frameHandle);
    this.frameHandle = 0;
    this.gpu = null; // objects died with the context; nothing to delete
  };

  private readonly handleContextRestored = (): void => {
    this.contextLost = false;
    try {
      this.gpu = this.createResources();
      this.dirty = true;
      this.schedule();
    } catch {
      this.options.onFailure?.();
    }
  };
}
