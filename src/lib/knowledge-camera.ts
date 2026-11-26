export type Point = { x: number; y: number };
export type Camera = Point & { z: number };
export type Frame = { width: number; height: number; scale: number };
export type Bounds = { left: number; right: number; top: number; bottom: number };
export type GestureSample = { center: Point; span: number };
export type ReliefPoint = Point & { z: number };

export function reliefLens(pitch: number, yaw: number) {
  const COS = Math.cos(pitch), SIN = Math.sin(pitch);
  const CY = Math.cos(yaw), SY = Math.sin(yaw);
  return {
    COS, SIN, CY, SY,
    project({ x, y, z }: ReliefPoint, focalDistance: number): Point {
      const u = x * CY - y * SY;
      const v = x * SY + y * CY;
      const depth = v * COS + z * SIN;
      const magnification = focalDistance / (focalDistance - depth);
      return { x: u * magnification, y: (v * SIN - z * COS) * magnification };
    },
    rayPoint(point: Point, depth: number, focalDistance: number): ReliefPoint {
      const scale = 1 - depth / focalDistance;
      const u = point.x * scale, vertical = point.y * scale;
      const v = depth * COS + vertical * SIN;
      return { x: u * CY + v * SY, y: v * CY - u * SY, z: depth * SIN - vertical * COS };
    },
  };
}

const clamp = (value: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, value));

export type CameraTransition = {
  from: Camera; to: Camera; start: number; duration: number; velocity?: Camera;
};

export function sampleCameraTransition({ from, to, start, duration, velocity }: CameraTransition, now: number) {
  const t = clamp((now - start) / duration, 0, 1);
  const position = { ...from }, speed = { x: 0, y: 0, z: 0 };
  // A bounded Hermite tangent carries forward motion toward the new target,
  // while keeping every axis monotonic and bringing it to rest at the destination.
  for (const axis of ["x", "y", "z"] as const) {
    const delta = to[axis] - from[axis];
    if (!delta) continue;
    const tangent = clamp((velocity?.[axis] ?? 0) * duration / delta, 0, 2.6);
    position[axis] += delta * (t * t * (3 - 2 * t) + tangent * t * (1 - t) ** 2);
    speed[axis] = delta / duration * (6 * t * (1 - t) + tangent * (1 - 4 * t + 3 * t * t));
  }
  return { position: t === 1 ? to : position, speed, done: t === 1 };
}

export function fitCamera(bounds: Bounds, frame: Frame): Camera {
  const padding = clamp(frame.width * 0.1, 20, 52);
  const z = Math.min(
    Math.max(1, frame.width - 2 * padding) / Math.max(1, bounds.right - bounds.left),
    Math.max(1, frame.height - 2 * padding) / Math.max(1, bounds.bottom - bounds.top),
  ) / frame.scale;
  return cameraAt({ x: (bounds.left + bounds.right) / 2, y: (bounds.top + bounds.bottom) / 2 }, z);
}

export function cameraAt(point: Point, z: number): Camera {
  return { x: -point.x * z, y: -point.y * z, z };
}

export function constrainPan(camera: Camera, bounds: Bounds, frame: Frame): Camera {
  const limit = (offset: number, start: number, end: number, length: number) => {
    const halfView = length / (2 * frame.scale);
    const edge = halfView * 0.68;
    return clamp(offset, -end * camera.z - edge, -start * camera.z + edge);
  };
  return {
    x: limit(camera.x, bounds.left, bounds.right, frame.width),
    y: limit(camera.y, bounds.top, bounds.bottom, frame.height),
    z: camera.z,
  };
}

export function resizeCamera(camera: Camera, oldScale: number, newScale: number, min: number, max: number): Camera {
  const z = clamp(camera.z * oldScale / newScale, min, max);
  return cameraAt({ x: -camera.x / camera.z, y: -camera.y / camera.z }, z);
}

export function sampleGesture(points: Iterable<Point>): GestureSample | null {
  const contacts = points[Symbol.iterator]();
  const first = contacts.next().value;
  if (!first) return null;
  const second = contacts.next().value;
  return second ? {
    center: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
    span: Math.hypot(first.x - second.x, first.y - second.y),
  } : { center: first, span: 0 };
}

export function moveCamera(
  camera: Camera, from: GestureSample, to: GestureSample, min: number, max: number,
): Camera {
  const zoom = from.span > 0 && to.span > 0 ? Math.max(1, to.span) / Math.max(1, from.span) : 1;
  const z = clamp(camera.z * zoom, min, max);
  const ratio = z / camera.z;
  return {
    x: to.center.x - (from.center.x - camera.x) * ratio,
    y: to.center.y - (from.center.y - camera.y) * ratio,
    z,
  };
}
