import{r as e,t}from"./react-Db-_YT-E.js";import{t as n}from"./index-Byia9Gut.js";var r=e(),i=2.02,a=.5,o=.8,s=.6,c=1.7,l=9.2,u=5.2,d=1.3,f=1.7,p=.13,m=-.11,h=.9,g=.5,_=2400,v=.025;function y(e,t){return Math.sin(e)*Math.sin(t)}function b(e,t){let n=0,r=.5,u=e,d=t;for(let e=0;e<5;e+=1){n+=r*y(u,d);let e=(o*u-s*d)*i+c,t=(s*u+o*d)*i+l;u=e,d=t,r*=a}return n}function x(e,t,n){let r=b(e+p*n,t),i=b(e+u,t+d+m*n);return b(e+f*r,t+f*i)}function S(e,t,n){let r=x(e,t,n)*h+g;return Math.min(1,Math.max(0,r))}function C(e,t,n){return Math.round(S(e,t,n)*_)}var w=e=>Number.isInteger(e)?`${e}.0`:`${e}`,T=`#version 300 es
void main() {
  // (0,0) (2,0) (0,2) → clip space (-1,-1) (3,-1) (-1,3)
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,E=`#version 300 es
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
  const mat2 R = mat2(${w(o)}, ${w(s)}, ${w(-s)}, ${w(o)}); // column-major
  for (int i = 0; i < 5; i++) {
    value += amplitude * wave(p);
    p = R * p * ${w(i)} + vec2(${w(c)}, ${w(l)});
    amplitude *= ${w(a)};
  }
  return value;
}

float elevation(vec2 p, float t) {
  vec2 q = vec2(
    fbm(p + vec2(${w(p)} * t, 0.0)),
    fbm(p + vec2(${w(u)}, ${w(d)} + ${w(m)} * t))
  );
  float e = fbm(p + ${w(f)} * q) * ${w(h)} + ${w(g)};
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
  float minor = isoLine(e, ${w(v)}, hairline);
  float major = isoLine(e, ${w(v*5)}, hairline * 1.9);
  color = mix(color, vec3(0.85, 0.90, 1.0), minor * 0.22);
  color = mix(color, vec3(1.0), major * 0.3);
  color *= uDim;

  // Survey lens around the pointer (radius in CSS px, scaled to device px).
  float dist = length(frag - uPointer) / uPixelRatio;
  float lens = uLens * (1.0 - smoothstep(110.0, 150.0, dist));
  if (lens > 0.001) {
    float fine = isoLine(e, ${w(v/3)}, hairline * 0.8);
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
}`,D={alpha:!1,antialias:!1,depth:!1,stencil:!1,premultipliedAlpha:!1,preserveDrawingBuffer:!1,powerPreference:`low-power`},O=.045,k=4,A=.5,j=22,M=14,N=40,P=5e-4,F={x:.35,y:-.2,accent:[1,.42,.29],dim:1,animate:!0},I=class{canvas;gl;options;gpu=null;frameHandle=0;lastFrame=0;time=0;reducedMotion;onScreen=!0;pageVisible=!document.hidden;contextLost=!1;disposed=!1;pointer=null;lensTarget=0;lens=0;target=F;camX=F.x;camY=F.y;dim=F.dim;dirty=!0;renderScale=1;frameTimeSum=0;frameCount=0;resizeObserver;intersectionObserver;static isSupported(){try{let e=document.createElement(`canvas`).getContext(`webgl2`);return e!==null&&(e.getExtension(`WEBGL_lose_context`)?.loseContext(),!0)}catch{return!1}}constructor(e,t){this.canvas=e,this.options={maxPixelRatio:1.5,minFrameInterval:0,unitCssPx:340,...t},this.reducedMotion=t.reducedMotion;let n=e.getContext(`webgl2`,D);if(n===null)throw Error(`WebGL2 is not available`);this.gl=n,this.gpu=this.createResources(),e.addEventListener(`webglcontextlost`,this.handleContextLost),e.addEventListener(`webglcontextrestored`,this.handleContextRestored),document.addEventListener(`visibilitychange`,this.handleVisibility),this.resizeObserver=new ResizeObserver(()=>{this.dirty=!0,this.schedule()}),this.resizeObserver.observe(e),this.intersectionObserver=new IntersectionObserver(e=>{this.onScreen=e.some(e=>e.isIntersecting),this.onScreen&&(this.lastFrame=0,this.schedule())}),this.intersectionObserver.observe(e),this.schedule()}setPointer(e,t){this.pointer={x:e,y:t},this.lensTarget=1,this.dirty=!0,this.schedule()}clearPointer(){this.lensTarget=0,this.schedule()}setView(e,t=!1){this.target=e,t&&(this.camX=e.x,this.camY=e.y,this.dim=e.dim),this.dirty=!0,this.schedule()}setReducedMotion(e){e!==this.reducedMotion&&(this.reducedMotion=e,this.dirty=!0,this.schedule())}dispose(){this.disposed||(this.disposed=!0,cancelAnimationFrame(this.frameHandle),this.resizeObserver.disconnect(),this.intersectionObserver.disconnect(),this.canvas.removeEventListener(`webglcontextlost`,this.handleContextLost),this.canvas.removeEventListener(`webglcontextrestored`,this.handleContextRestored),document.removeEventListener(`visibilitychange`,this.handleVisibility),this.destroyResources(),this.gl.getExtension(`WEBGL_lose_context`)?.loseContext())}needsFrame(){let e=this.target.animate&&!this.reducedMotion,t=this.lens!==this.lensTarget;return e||t||this.panning()||this.dirty}panning(){return this.camX!==this.target.x||this.camY!==this.target.y||this.dim!==this.target.dim}stepCamera(e){let t=this.reducedMotion?1:1-Math.exp(-2.6*e);this.camX+=(this.target.x-this.camX)*t,this.camY+=(this.target.y-this.camY)*t,this.dim+=(this.target.dim-this.dim)*t,Math.abs(this.target.x-this.camX)<P&&Math.abs(this.target.y-this.camY)<P&&(this.camX=this.target.x,this.camY=this.target.y),Math.abs(this.target.dim-this.dim)<.002&&(this.dim=this.target.dim)}schedule(){!this.disposed&&!this.contextLost&&this.onScreen&&this.pageVisible&&this.frameHandle===0&&this.needsFrame()&&(this.frameHandle=requestAnimationFrame(this.frame))}frame=e=>{if(this.frameHandle=0,this.disposed||this.contextLost||!this.onScreen||!this.pageVisible)return;if(this.options.minFrameInterval>0&&this.lastFrame!==0&&e-this.lastFrame<this.options.minFrameInterval-1){this.frameHandle=requestAnimationFrame(this.frame);return}let t=this.lastFrame===0?1/60:Math.min((e-this.lastFrame)/1e3,.1);this.lastFrame!==0&&this.adaptResolution(e-this.lastFrame),this.lastFrame=e,this.target.animate&&!this.reducedMotion&&(this.time+=t*O),this.stepCamera(t);let n=k*t;this.lens=this.lens<this.lensTarget?Math.min(this.lensTarget,this.lens+n):Math.max(this.lensTarget,this.lens-n),this.lens===0&&this.lensTarget===0&&(this.pointer=null),this.render(),this.reportPointer(),this.dirty=!1,this.needsFrame()?this.frameHandle=requestAnimationFrame(this.frame):this.lastFrame=0};adaptResolution(e){if(this.options.minFrameInterval>0||(this.frameTimeSum+=e,this.frameCount+=1,this.frameCount<N))return;let t=this.frameTimeSum/this.frameCount;this.frameTimeSum=0,this.frameCount=0,t>j&&this.renderScale>A?(this.renderScale=Math.max(A,this.renderScale*.85),this.dirty=!0):t<M&&this.renderScale<1&&(this.renderScale=Math.min(1,this.renderScale*1.1),this.dirty=!0)}render(){let e=this.gpu;if(e===null)return;let{gl:t,canvas:n}=this,r=Math.min(window.devicePixelRatio||1,this.options.maxPixelRatio)*this.renderScale,i=Math.max(1,Math.round(n.clientWidth*r)),a=Math.max(1,Math.round(n.clientHeight*r));(n.width!==i||n.height!==a)&&(n.width=i,n.height=a),t.viewport(0,0,i,a),t.useProgram(e.program),t.bindVertexArray(e.vao);let o=e.uniforms;t.uniform2f(o.resolution,i,a),t.uniform1f(o.pixelRatio,r),t.uniform1f(o.unitPx,this.options.unitCssPx*r),t.uniform2f(o.offset,this.camX,this.camY),t.uniform1f(o.time,this.time);let s=this.pointer??{x:-1e4,y:-1e4};t.uniform2f(o.pointer,s.x*r,a-s.y*r),t.uniform1f(o.lens,this.lens),t.uniform3f(o.accent,this.target.accent[0],this.target.accent[1],this.target.accent[2]),t.uniform1f(o.dim,this.dim),t.drawArrays(t.TRIANGLES,0,3)}reportPointer(){let e=this.options.onPointerSample;if(e===void 0)return;if(this.pointer===null||this.lensTarget===0){e(null);return}let t=this.options.unitCssPx,n=(this.pointer.x-this.canvas.clientWidth/2)/t+this.camX,r=(this.canvas.clientHeight/2-this.pointer.y)/t+this.camY;e({x:n,y:r,metres:C(n,r,this.time)})}createResources(){let{gl:e}=this,t=this.compile(e.VERTEX_SHADER,T),n=this.compile(e.FRAGMENT_SHADER,E),r=e.createProgram();if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),e.deleteShader(t),e.deleteShader(n),e.getProgramParameter(r,e.LINK_STATUS)!==!0){let t=e.getProgramInfoLog(r)??`unknown error`;throw e.deleteProgram(r),Error(`Terrain program failed to link: ${t}`)}return{program:r,vao:e.createVertexArray(),uniforms:{resolution:e.getUniformLocation(r,`uResolution`),pixelRatio:e.getUniformLocation(r,`uPixelRatio`),unitPx:e.getUniformLocation(r,`uUnitPx`),offset:e.getUniformLocation(r,`uOffset`),time:e.getUniformLocation(r,`uTime`),pointer:e.getUniformLocation(r,`uPointer`),lens:e.getUniformLocation(r,`uLens`),accent:e.getUniformLocation(r,`uAccent`),dim:e.getUniformLocation(r,`uDim`)}}}compile(e,t){let{gl:n}=this,r=n.createShader(e);if(r===null)throw Error(`Could not create shader`);if(n.shaderSource(r,t),n.compileShader(r),n.getShaderParameter(r,n.COMPILE_STATUS)!==!0){let e=n.getShaderInfoLog(r)??`unknown error`;throw n.deleteShader(r),Error(`Terrain shader failed to compile: ${e}`)}return r}destroyResources(){this.gpu!==null&&(this.gl.deleteProgram(this.gpu.program),this.gl.deleteVertexArray(this.gpu.vao),this.gpu=null)}handleVisibility=()=>{this.pageVisible=!document.hidden,this.pageVisible&&(this.lastFrame=0,this.schedule())};handleContextLost=e=>{e.preventDefault(),this.contextLost=!0,cancelAnimationFrame(this.frameHandle),this.frameHandle=0,this.gpu=null};handleContextRestored=()=>{this.contextLost=!1;try{this.gpu=this.createResources(),this.dirty=!0,this.schedule()}catch{this.options.onFailure?.()}}};function L(e){return(0,r.useSyncExternalStore)(t=>{let n=window.matchMedia(e);return n.addEventListener(`change`,t),()=>{n.removeEventListener(`change`,t)}},()=>window.matchMedia(e).matches,()=>!1)}function R(){return L(`(prefers-reduced-motion: reduce)`)}var z=t();function B({view:e,interactive:t,onLive:i,onUnavailable:a,onPointerSample:o}){let s=(0,r.useRef)(null),c=(0,r.useRef)(null),l=R(),u=L(`(pointer: coarse)`),d=(0,r.useRef)({view:e,onLive:i,onUnavailable:a,onPointerSample:o});return(0,r.useEffect)(()=>{d.current={view:e,onLive:i,onUnavailable:a,onPointerSample:o}}),(0,r.useEffect)(()=>{let e=s.current;if(e===null)return;if(!I.isSupported()){d.current.onUnavailable();return}let t=document.createElement(`canvas`);t.className=n.canvas??``,t.setAttribute(`aria-hidden`,`true`),e.appendChild(t);let r;try{r=new I(t,{reducedMotion:window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,maxPixelRatio:u?1.25:1.5,minFrameInterval:u?1e3/30:0,unitCssPx:u?260:340,onPointerSample:e=>{d.current.onPointerSample(e)},onFailure:()=>{d.current.onUnavailable()}})}catch(e){console.warn(`[map] WebGL unavailable, using the static backdrop.`,e),t.remove(),d.current.onUnavailable();return}return r.setView(d.current.view,!0),c.current=r,d.current.onLive(),()=>{c.current=null,r.dispose(),t.remove()}},[u]),(0,r.useEffect)(()=>{c.current?.setView(e)},[e]),(0,r.useEffect)(()=>{c.current?.setReducedMotion(l)},[l]),(0,r.useEffect)(()=>{let e=c.current;if(!t||e===null)return;let n,r=t=>{(t.pointerType!==`touch`||t.buttons!==0)&&(clearTimeout(n),e.setPointer(t.clientX,t.clientY))},i=t=>{t.pointerType===`touch`&&(n=setTimeout(()=>{e.clearPointer()},1600))},a=()=>{e.clearPointer()};return window.addEventListener(`pointermove`,r,{passive:!0}),window.addEventListener(`pointerdown`,r,{passive:!0}),window.addEventListener(`pointerup`,i,{passive:!0}),document.documentElement.addEventListener(`pointerleave`,a),()=>{clearTimeout(n),window.removeEventListener(`pointermove`,r),window.removeEventListener(`pointerdown`,r),window.removeEventListener(`pointerup`,i),document.documentElement.removeEventListener(`pointerleave`,a),e.clearPointer()}},[t,u]),(0,z.jsx)(`div`,{ref:s,className:n.canvasHost})}export{B as default};