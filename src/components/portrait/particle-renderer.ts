import { createParticleField, type Disturbance } from "./particle-field";

const vertex = `
attribute vec3 aPosition;
attribute vec3 aInk;
uniform vec4 uCamera;
uniform vec3 uGrid;
uniform float uPixelsPerCell;
varying vec4 vInk;
varying vec2 vPoint;

void main() {
  float size = uGrid.x;
  float x = aPosition.x * uCamera.x + aPosition.z * uCamera.y;
  float z = aPosition.z * uCamera.x - aPosition.x * uCamera.y;
  float y = aPosition.y * uCamera.z - z * uCamera.w;
  z = aPosition.y * uCamera.w + z * uCamera.z;
  float perspective = uGrid.y / (uGrid.y - z);
  vec2 projected = (vec2(x, y) * perspective + vec2(size * .5, uGrid.z)) / size;
  gl_Position = vec4(projected.x * 2. - 1., 1. - projected.y * 2., 0., 1.);

  float tone = aInk.x;
  float radius = aInk.z * perspective * uPixelsPerCell;
  gl_PointSize = radius * 2. + 1.45;
  vPoint = vec2(radius, gl_PointSize);
  vec3 warm = mix(vec3(162., 156., 150.), vec3(243., 234., 225.), tone) / 255.;
  float alpha = min(1., aInk.y * clamp(.88 + .53 * z / size, .62, 1.));
  vInk = vec4(warm, alpha);
}
`;

const fragment = `
precision mediump float;
varying vec4 vInk;
varying vec2 vPoint;
void main() {
  float d = length(gl_PointCoord - .5) * vPoint.y;
  float edge = 1. - smoothstep(max(0., vPoint.x - .52), vPoint.x + .52, d);
  float alpha = vInk.a * edge;
  gl_FragColor = vec4(vInk.rgb * alpha, alpha);
}
`;

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const stage = gl.createShader(type);
  if (!stage) return null;
  gl.shaderSource(stage, source);
  gl.compileShader(stage);
  if (gl.getShaderParameter(stage, gl.COMPILE_STATUS)) return stage;
  gl.deleteShader(stage);
  return null;
}

function link(gl: WebGLRenderingContext) {
  const vs = shader(gl, gl.VERTEX_SHADER, vertex);
  const fs = shader(gl, gl.FRAGMENT_SHADER, fragment);
  const program = vs && fs && gl.createProgram();
  if (program) {
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
  }
  if (vs) gl.deleteShader(vs);
  if (fs) gl.deleteShader(fs);
  if (program && gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  if (program) gl.deleteProgram(program);
  return null;
}

export function createParticleRenderer(canvas: HTMLCanvasElement, data: ArrayBuffer) {
  const field = createParticleField(data);
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;
  const program = link(gl);
  if (!program) return null;

  const position = gl.createBuffer();
  const ink = gl.createBuffer();
  if (!position || !ink) {
    gl.deleteProgram(program);
    gl.deleteBuffer(position);
    gl.deleteBuffer(ink);
    return null;
  }

  gl.useProgram(program);
  const positionAttribute = gl.getAttribLocation(program, "aPosition");
  const inkAttribute = gl.getAttribLocation(program, "aInk");
  const camera = gl.getUniformLocation(program, "uCamera");
  const grid = gl.getUniformLocation(program, "uGrid");
  const pixelScale = gl.getUniformLocation(program, "uPixelsPerCell");

  gl.bindBuffer(gl.ARRAY_BUFFER, ink);
  gl.bufferData(gl.ARRAY_BUFFER, field.inks, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(inkAttribute);
  gl.vertexAttribPointer(inkAttribute, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.bufferData(gl.ARRAY_BUFFER, field.positions, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(positionAttribute);
  gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.uniform3f(grid, field.size, field.focal, field.centerY);

  return {
    resize(width: number, height: number) {
      const density = Math.min(window.devicePixelRatio || 1, 1.75, 820 / Math.max(width, height, 1));
      const w = Math.max(1, Math.round(width * density));
      const h = Math.max(1, Math.round(height * density));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform1f(pixelScale, Math.min(w, h) / field.size);
    },
    paint() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform4fv(camera, field.camera);
      gl.bindBuffer(gl.ARRAY_BUFFER, position);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, field.positions);
      gl.drawArrays(gl.POINTS, 0, field.count);
    },
    advance(step: number, force: Disturbance | null) {
      return field.advance(step, force);
    },
    scatter: field.scatter,
    reset: field.reset,
    dispose() {
      gl.disableVertexAttribArray(positionAttribute);
      gl.disableVertexAttribArray(inkAttribute);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
      gl.deleteBuffer(position);
      gl.deleteBuffer(ink);
      gl.deleteProgram(program);
    },
  };
}
