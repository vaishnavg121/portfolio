import { ATLAS_TERRITORIES, SKILLS } from "./atlas-model";
import { atlasGeometry, getSceneRoutes, territoryIndex, type AtlasRenderer, type SceneFrame } from "./atlas-geometry";

const vertexSource = /* glsl */ `
precision highp float;
attribute vec3 aPosition;
attribute vec4 aColor;
attribute float aRegion;
uniform vec3 uCamera;
uniform vec2 uSize;
uniform float uStretch;
uniform float uRatio;
uniform float uProgress;
uniform float uRegion;
uniform mediump float uLayer;
varying mediump vec4 vColor;

void main() {
  vec3 p = aPosition;
  float emerge = smoothstep(0.0, 1.0, clamp(uProgress * 1.48 - max(aRegion, 0.0) * .065, 0.0, 1.0));
  float fade = 1.0;
  if (aRegion >= 0.0) {
    if (uLayer == 2.0) {
      float noise = fract(sin(dot(p.xy, vec2(76.34, 91.72))) * 4938.46);
      float drift = (1.0 - emerge) * (1.0 - emerge);
      p.x += sin(noise * 47.0) * drift * 152.0;
      p.y += cos(noise * 49.0) * drift * 85.0;
      p.z = p.z * emerge + sin(noise * 21.0) * drift * 37.0;
      fade = mix(.05, 1.0, emerge);
    } else if (uLayer != 4.0) {
      p.z *= mix(.28, 1.0, emerge);
      fade = uLayer == 0.0 ? smoothstep(.09, .82, emerge) : smoothstep(.17, .92, emerge);
    }
    if (uRegion >= 0.0 && uLayer != 4.0) {
      fade *= abs(uRegion - aRegion) < .3 ? 1.0 : (uLayer == 0.0 ? .64 : .48);
    }
  }
  if (uLayer == 4.0) fade *= smoothstep(.43, .94, uProgress);
  if (uLayer == 3.0) fade *= smoothstep(.48, .99, uProgress);
  vec2 projected = vec2(p.x + p.y * .12, p.y * .77 - p.z * .84);
  vec2 offset = (projected * uCamera.z + uCamera.xy) * vec2(1.0, uStretch);
  gl_Position = vec4(offset.x * 2.0 / uSize.x, -offset.y * 2.0 / uSize.y, -(p.y * .41 + p.z * .68) / 820.0, 1.0);
  float size = uLayer == 5.0 ? 5.4 : (uLayer == 4.0 ? mix(3.0, 5.6, aColor.a) : mix(1.35, 2.5, aColor.a));
  gl_PointSize = size * uRatio;
  vColor = vec4(aColor.rgb, aColor.a * fade);
}
`;

const fragmentSource = /* glsl */ `
precision mediump float;
uniform mediump float uLayer;
varying mediump vec4 vColor;
void main() {
  float alpha = vColor.a;
  if (uLayer == 2.0 || uLayer >= 4.0) {
    float distanceToCenter = length(gl_PointCoord - .5);
    alpha *= 1.0 - smoothstep(.24, .49, distanceToCenter);
  }
  if (alpha < .015) discard;
  gl_FragColor = vec4(vColor.rgb, alpha);
}
`;

function makeProgram(gl: WebGLRenderingContext) {
  const program = gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(type);
    if (!shader) {
      gl.deleteProgram(program);
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      gl.deleteProgram(program);
      return null;
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

export function makeWebGLAtlas(canvas: HTMLCanvasElement, compact: boolean): AtlasRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: true, antialias: !compact, depth: true, premultipliedAlpha: true,
    preserveDrawingBuffer: false, powerPreference: "low-power",
  });
  if (!gl) return null;
  const program = makeProgram(gl);
  if (!program) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  const buffers: WebGLBuffer[] = [];
  const bufferFor = (data: number[], dynamic = false) => {
    const buffer = gl.createBuffer()!;
    buffers.push(buffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
    return { buffer, count: data.length / 8 };
  };
  const { surface, contours, points, grid } = atlasGeometry(compact);
  const surfaceBuffer = bufferFor(surface);
  const contourBuffer = bufferFor(contours);
  const particleBuffer = bufferFor(points);
  const gridBuffer = bufferFor(grid);
  const markers = bufferFor(SKILLS.flatMap(skill => {
    const p = skill.position;
    const region = ATLAS_TERRITORIES.find(region => region.id === skill.territoryId)!;
    const tint = [1,3,5].map(i => parseInt(region.color.substring(i, i + 2), 16) / 255);
    return [p.x,p.y,p.z + 2,...tint,skill.rank < 2 ? .93 : .64,region.index];
  }));
  const routeBuffer = bufferFor([], true);
  const signalBuffer = bufferFor([], true);
  const position = gl.getAttribLocation(program, "aPosition");
  const color = gl.getAttribLocation(program, "aColor");
  const region = gl.getAttribLocation(program, "aRegion");
  const names = ["uCamera", "uSize", "uStretch", "uRatio", "uProgress", "uRegion", "uLayer"] as const;
  const uniform = Object.fromEntries(names.map(name => [name, gl.getUniformLocation(program, name)]));
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);
  gl.enableVertexAttribArray(position);
  gl.enableVertexAttribArray(color);
  gl.enableVertexAttribArray(region);

  const draw = (entry: ReturnType<typeof bufferFor>, mode: number, layer: number) => {
    if (!entry.count) return;
    gl.uniform1f(uniform.uLayer, layer);
    gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(region, 1, gl.FLOAT, false, 32, 28);
    gl.drawArrays(mode, 0, entry.count);
  };
  const update = (entry: ReturnType<typeof bufferFor>, data: number[] | Float32Array, count = data.length) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data instanceof Float32Array ? data.subarray(0,count) : new Float32Array(data), gl.DYNAMIC_DRAW);
    entry.count = count / 8;
  };
  let routeKey = "";
  let routes = getSceneRoutes(null, 0);
  let highlighted: typeof routes = [];
  let signalVertices = new Float32Array(0);
  let activeRegion = -1;

  return {
    draw(frame: SceneFrame) {
      const ratio = Math.min(window.devicePixelRatio || 1, compact ? 1.4 : 1.7);
      const w = Math.max(1, Math.round(frame.width * ratio));
      const h = Math.max(1, Math.round(frame.height * ratio));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      const key = [frame.selection?.type, frame.selection?.id, frame.level].join("/");
      if (key !== routeKey) {
        routeKey = key;
        activeRegion = territoryIndex(frame.selection);
        routes = getSceneRoutes(frame.selection, frame.level);
        highlighted = routes.filter(route => route.active);
        signalVertices = new Float32Array(highlighted.length * 8);
        const vertices: number[] = [];
        for (const route of routes) {
          const tint = route.active ? [0.89, 0.64, 0.54, route.bridge ? .83 : .64] : [0.72, 0.60, 0.52, route.bridge ? .43 : .19];
          for (let i = 0; i < route.points.length - 1; i++) {
            if (route.bridge && i % 3 === 2) continue;
            for (const p of [route.points[i], route.points[i + 1]]) vertices.push(p.x,p.y,p.z,...tint,-1);
          }
        }
        update(routeBuffer, vertices);
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform2f(uniform.uSize, frame.width, frame.height);
      gl.uniform3f(uniform.uCamera, frame.camera.x, frame.camera.y, frame.camera.z);
      gl.uniform1f(uniform.uStretch, frame.stretch);
      gl.uniform1f(uniform.uRatio, ratio);
      gl.uniform1f(uniform.uProgress, frame.progress);
      gl.uniform1f(uniform.uRegion, activeRegion);
      gl.disable(gl.DEPTH_TEST);
      draw(gridBuffer, gl.LINES, 3);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      draw(surfaceBuffer, gl.TRIANGLES, 0);
      gl.depthMask(false);
      draw(contourBuffer, gl.LINES, 1);
      draw(particleBuffer, gl.POINTS, 2);
      gl.disable(gl.DEPTH_TEST);
      draw(routeBuffer, gl.LINES, 3);
      draw(markers, gl.POINTS, 4);
      if (frame.signal >= 0 && frame.signal < 1 && highlighted.length) {
        let offset = 0;
        highlighted.forEach((route, index) => {
          const phase = (frame.signal - (index % 5) * .055) / .72;
          if (phase < 0 || phase >= 1) return;
          const step = phase * (route.points.length - 1);
          const a = route.points[Math.floor(step)];
          const b = route.points[Math.ceil(step)];
          const t = step % 1;
          signalVertices.set([
            a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t,
            1,.79,.64,Math.sin(phase * Math.PI) * .85 + .13,-1,
          ], offset);
          offset += 8;
        });
        update(signalBuffer, signalVertices, offset);
        draw(signalBuffer, gl.POINTS, 5);
      }
      gl.depthMask(true);
    },
    dispose() {
      buffers.forEach(buffer => gl.deleteBuffer(buffer));
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
