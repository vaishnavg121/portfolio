import { connectionEndpoint, connectionsFor, routePoint } from "./atlas-connections";
import { clamp, screenPoint, type SceneFrame } from "./atlas-geometry";

export const STREAM_SEGMENTS = 28;
const STRIDE = 8;
const WIDTH = 3.15;

// Project each curve once per segment. The fragment shader paints both the fine core and its glow.
export function createAtlasStreams() {
  const data = new Float32Array(36 * STREAM_SEGMENTS * STRIDE * 6);
  const centers = new Float32Array((STREAM_SEGMENTS + 1) * 3);
  const edges = new Float32Array((STREAM_SEGMENTS + 1) * 4);
  let current: ReturnType<typeof connectionsFor> = [];
  let previous: typeof current = [];
  let key = "";
  let change = -Infinity;
  let previousSelection: string | undefined;
  let dirty = "";
  let written = 0;

  return {
    data,
    update(frame: SceneFrame) {
      const selectionId = frame.selection?.id;
      const next = [frame.selection?.type, selectionId, frame.hover].join("/");
      if (next !== key) {
        previous = current;
        current = connectionsFor(frame.selection, frame.hover);
        change = key ? frame.time : -Infinity;
        previousSelection = key.split("/")[1] || undefined;
        key = next;
      }
      const phase = frame.motion ? clamp((frame.time - change) / (previousSelection === selectionId ? .21 : .39)) : 1;
      const ease = phase * phase * (3 - 2 * phase);
      const view = [key, frame.width, frame.height, frame.stretch, frame.camera.x, frame.camera.y, frame.camera.z, frame.perspective, ...frame.expansion, ease].join("/");
      if (view === dirty) return { count: written / STRIDE, changed: false };
      dirty = view;
      written = 0;

      const emit = (index: number, side: number, length: number, opacity: number, seed: number, flow: number) => {
        const offset = index * 4 + (side > 0 ? 2 : 0);
        data[written++] = edges[offset];
        data[written++] = edges[offset + 1];
        data[written++] = side;
        data[written++] = centers[index * 3 + 2] / length;
        data[written++] = length;
        data[written++] = opacity;
        data[written++] = seed;
        data[written++] = flow;
      };

      const trace = (links: typeof current, opacity: number) => {
        if (opacity < .009) return;
        links.forEach(({ a, b, bridge, weight, energy }, index) => {
          const p = connectionEndpoint(a, frame), q = connectionEndpoint(b, frame);
          let visibility = 1;
          if (frame.selection?.type === "skill" && (bridge || b.fixed)) {
            const end = screenPoint(q, frame);
            const margin = frame.width < 575 ? 50 : 110;
            const outside = Math.max(0, -end.x, -end.y, end.x - frame.width, end.y - frame.height);
            visibility = clamp(1 - outside / margin);
            if (visibility === 0) return;
          }
          let length = 0;
          let last = p;
          for (let i = 0; i <= STREAM_SEGMENTS; i++) {
            const point = routePoint(p, q, i / STREAM_SEGMENTS, bridge);
            const screen = screenPoint(point, frame);
            length += Math.hypot(point.x - last.x, point.y - last.y, point.z - last.z);
            centers[i * 3] = screen.x;
            centers[i * 3 + 1] = screen.y;
            centers[i * 3 + 2] = length;
            last = point;
          }
          if (length < 3) return;
          for (let i = 0; i <= STREAM_SEGMENTS; i++) {
            const begin = Math.max(0, i - 1) * 3, end = Math.min(STREAM_SEGMENTS, i + 1) * 3;
            const dx = centers[end] - centers[begin], dy = centers[end + 1] - centers[begin + 1];
            const ratio = WIDTH / Math.max(.001, Math.hypot(dx, dy));
            const x = centers[i * 3], y = centers[i * 3 + 1];
            edges[i * 4] = x - dy * ratio;
            edges[i * 4 + 1] = y + dx * ratio;
            edges[i * 4 + 2] = x + dy * ratio;
            edges[i * 4 + 3] = y - dx * ratio;
          }
          const seed = ((a.region * 13 + b.region * 7 + index * 9) % 41) / 41;
          const alpha = opacity * weight * clamp(length / 45) * visibility;
          const flow = energy * visibility * opacity;
          for (let i = 0; i < STREAM_SEGMENTS; i++) {
            emit(i, -1, length, alpha, seed, flow);
            emit(i, 1, length, alpha, seed, flow);
            emit(i + 1, -1, length, alpha, seed, flow);
            emit(i + 1, -1, length, alpha, seed, flow);
            emit(i, 1, length, alpha, seed, flow);
            emit(i + 1, 1, length, alpha, seed, flow);
          }
        });
      };
      trace(previous, 1 - ease);
      trace(current, ease);
      return { count: written / STRIDE, changed: true };
    },
  };
}
