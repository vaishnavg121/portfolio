import { CubeUVReflectionMapping, DataTexture, DirectionalLight, HalfFloatType, HemisphereLight, LinearFilter, LinearSRGBColorSpace, RGBAFormat, Scene } from "three";
import type { StudioMaterials } from "./studio-model";

export async function studioReflections(signal: AbortSignal) {
  if (typeof DecompressionStream === "undefined") return null;
  const response = await fetch("/images/research-studio/environment.bin.gz",{signal});
  if (!response.ok || !response.body) return null;
  const decoded = new Response(response.body.pipeThrough(new DecompressionStream("gzip")));
  const buffer = await decoded.arrayBuffer();
  if (buffer.byteLength < 4) return null;
  const header = new DataView(buffer);
  const width = header.getUint16(0,true), height = header.getUint16(2,true);
  if (width < 1 || height < 1 || buffer.byteLength !== 4 + width*height*8) return null;
  const map = new DataTexture(new Uint16Array(buffer,4),width,height,RGBAFormat,HalfFloatType);
  map.mapping = CubeUVReflectionMapping;
  map.colorSpace = LinearSRGBColorSpace;
  map.magFilter = map.minFilter = LinearFilter;
  map.needsUpdate = true;
  return map;
}

export function lightStudio(scene: Scene, materials: StudioMaterials, style: string) {
  scene.environmentIntensity = style === "soft" ? .88 : .56;

  const fill = new HemisphereLight(materials.ivory, materials.mauve.clone().multiplyScalar(.29), 1.18);
  const light = new DirectionalLight(materials.ivory, style === "soft" ? 1.66 : 2.28);
  light.position.set(-4, 8, 5);
  const rim = new DirectionalLight(materials.stone, style === "rim" ? 2.76 : 1.32);
  rim.position.set(4, 3, -7);
  const bounce = new DirectionalLight(materials.rose, .38);
  bounce.position.set(7, 2, 5);
  scene.add(fill, light, rim, bounce);
}
