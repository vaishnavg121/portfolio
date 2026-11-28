import { CatmullRomCurve3, Vector3, type Color } from "three";

export const studioRail = { y: .143, z: .015 };
export type StationPorts = { input: CatmullRomCurve3; output: CatmullRomCurve3; tint?: Color };

export function railEnd(origin: Vector3, localX: number) {
  return new Vector3(localX, studioRail.y - origin.y, studioRail.z - origin.z);
}

export function worldPort(origin: Vector3, path: CatmullRomCurve3, reverse = false) {
  const points = path.points.map(point => point.clone().add(origin));
  if (reverse) points.reverse();
  return new CatmullRomCurve3(points);
}
