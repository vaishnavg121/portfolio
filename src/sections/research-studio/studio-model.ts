import {
  BufferGeometry, CanvasTexture, Color, CylinderGeometry, Group, Material, Matrix4, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, PlaneGeometry, RepeatWrapping, Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

export function studioMaterials(surface: HTMLElement) {
  const css = getComputedStyle(surface);
  const tone = (token: string) => new Color(css.getPropertyValue(token).trim());
  const night = tone("--background"), stone = tone("--accent-stone"), ivory = tone("--text-primary");
  const rose = tone("--accent-source"), mauve = tone("--accent-mauve");
  const satin = (color: Color, roughness: number, metalness = 0) => new MeshStandardMaterial({ color, roughness, metalness });
  const glass = (color: Color, opacity: number) => new MeshStandardMaterial({
    color, metalness: .13, roughness: .27, transparent: true, opacity, depthWrite: false, envMapIntensity: 1.45,
  });
  const ceramic = satin(night.clone().lerp(mauve, .082), .63, .09);
  const rubber = satin(night.clone().lerp(stone, .023), .93);
  const metal = satin(stone.clone().lerp(night, .4), .34, .73);
  const edge = satin(stone.clone().lerp(ivory, .23), .25, .67);
  const alloy = satin(mauve.clone().lerp(night, .53), .39, .59);
  const grout = satin(night.clone().lerp(mauve, .25), .73, .14);
  const panel = satin(night.clone().lerp(stone, .126), .58, .20);
  const tile = (shade: number) => satin(night.clone().lerp(stone, shade), .69, .12);
  const strip = new MeshBasicMaterial({ color: stone.clone().lerp(rose, .25).multiplyScalar(.63) });
  const trace = new MeshBasicMaterial({ color: rose.clone().lerp(ivory, .43).multiplyScalar(.65) });
  const lamp = new MeshBasicMaterial({ color: ivory.clone().lerp(stone, .22) });
  const smoke = glass(mauve.clone().lerp(night, .54), .21);
  const capsule = glass(rose.clone().lerp(ivory, .55), .19);
  const graph = glass(stone.clone().lerp(ivory, .53), .23);
  return { night, stone, ivory, rose, mauve, satin, ceramic, rubber, metal, edge, alloy, grout, panel, tile, strip, trace, lamp, smoke, capsule, graph };
}

export type StudioMaterials = ReturnType<typeof studioMaterials>;

export function modelGroup(parent: Group) {
  const batches = new Map<Material, BufferGeometry[]>();
  const shift = new Matrix4();
  function piece(geometry: BufferGeometry, material: Material, x: number, y: number, z: number) {
    if (material.transparent) {
      const mesh = new Mesh(geometry, material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return;
    }
    geometry.deleteAttribute("uv");
    const batch = batches.get(material) ?? [];
    geometry.applyMatrix4(shift.makeTranslation(x, y, z));
    batch.push(geometry);
    batches.set(material, batch);
  }
  return {
    piece,
    box(material: Material, x: number, y: number, z: number, w: number, h: number, d: number, bevel = .075) {
      const rounded = new RoundedBoxGeometry(w, h, d, 1, bevel);
      const geometry = mergeVertices(rounded);
      rounded.dispose();
      piece(geometry, material, x, y, z);
    },
    cylinder(material: Material, x: number, y: number, z: number, radius: number, height: number, segments = 24) {
      piece(new CylinderGeometry(radius, radius, height, segments), material, x, y, z);
    },
    build() {
      for (const [material, parts] of batches) {
        const geometry = mergeGeometries(parts);
        if (geometry) parent.add(new Mesh(geometry, material));
        parts.forEach(part => part.dispose());
      }
      batches.clear();
    },
  };
}

export function contactMaterial() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const context = canvas.getContext("2d")!;
  const shade = context.createRadialGradient(32, 32, 7, 32, 32, 31);
  shade.addColorStop(0, "rgba(8,5,6,.68)");
  shade.addColorStop(.44, "rgba(8,5,6,.39)");
  shade.addColorStop(1, "rgba(8,5,6,0)");
  context.fillStyle = shade;
  context.fillRect(0, 0, 64, 64);
  return new MeshBasicMaterial({ map: new CanvasTexture(canvas), transparent: true, depthWrite: false });
}

export function placeShadow(parent: Group, material: Material, position: Vector3, width: number, depth: number) {
  const shade = new Mesh(new PlaneGeometry(width, depth), material);
  shade.rotation.x = -Math.PI / 2;
  shade.position.copy(position);
  parent.add(shade);
}

export function plateMaterial(materials: StudioMaterials, label: string, sub: string, active: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 78;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#"+materials.night.getHexString();
  ctx.fillRect(0, 0, 320, 78);
  ctx.fillStyle = "#"+(active ? materials.rose : materials.mauve).getHexString();
  ctx.fillRect(12, 13, 2, 51);
  ctx.font = "600 24px monospace";
  ctx.fillStyle = "#"+materials.ivory.getHexString();
  ctx.fillText(label, 28, 36);
  ctx.font = "16px monospace";
  ctx.fillStyle = "#"+materials.stone.getHexString();
  ctx.fillText(sub, 29, 60);
  const map = new CanvasTexture(canvas);
  map.colorSpace = "srgb";
  map.wrapS = map.wrapT = RepeatWrapping;
  return new MeshBasicMaterial({ map });
}
