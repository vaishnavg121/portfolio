import { Group, Mesh, PlaneGeometry, ShaderMaterial, Vector3 } from "three";
import { modelGroup, placeShadow, plateMaterial, type StudioMaterials } from "./studio-model";
import { studioBays } from "./studio-plan";
import type { MeshBasicMaterial } from "three";

const nameplates = [
  ["SYSTEMS", "ROBOTICS BAY"], ["AGENTIC", "RAG BAY"], ["MARKETS", "FINANCE BAY"], ["FORECASTING", "AI / MACHINE LEARNING"],
] as const;

export function studioArchitecture(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, variant: string) {
  const room = modelGroup(parent);
  room.box(m.rubber, 0, -.66, 0, 11.66, .20, 6.95, .095);
  room.box(m.alloy, 0, -.50, 0, 11.88, .17, 7.13, .08);
  room.box(m.edge, 0, -.414, 0, 11.84, .050, 7.11, .024);
  room.box(m.ceramic, 0, -.24, 0, 12.01, .32, 7.25, .14);
  room.box(m.panel, 0, -.059, 0, 11.84, .13, 7.08, .06);
  placeShadow(parent, shadow, new Vector3(.35, -.79, .45), 15.2, 10.5);

  const floorShades = [.046, .066, .077].map(m.tile);
  for (let row = 0; row < 5; row++) {
    for (let slot = 0; slot < 12; slot++) {
      const x = (slot - 5.5) * .966, z = (row - 2) * 1.38;
      room.box(floorShades[(row * 5 + slot * 2) % 3], x, .022, z, .948, .046, 1.355, .022);
    }
  }

  // The two service trenches and their crossing spine connect all bay plinths.
  room.box(m.ceramic, 0, .061, 0, .72, .062, 6.89, .035);
  room.box(m.ceramic, 0, .063, .035, 11.59, .064, .56, .034);
  for (const x of [-.29, .29]) room.box(m.metal, x, .092, 0, .028, .018, 6.76);
  for (const z of [-.18, .23]) room.box(m.metal, 0, .096, z, 11.43, .018, .024);
  room.box(m.strip, 0, .098, .015, 11.32, .012, .016);
  room.box(m.alloy, 0, .099, .024, .42, .030, .41, .066);
  room.cylinder(m.edge, 0, .125, .024, .11, .035, 18);
  for (const x of [-5.42, -4.03, -2.64, -1.25, 1.25, 2.64, 4.03, 5.42]) {
    room.box(m.trace, x, .104, .015, .112, .012, .023);
  }
  for (const z of [-2.55, -1.69, -.84, .86, 1.71, 2.56]) room.box(m.strip, 0, .104, z, .033, .015, .36);

  for (const [index, bay] of studioBays.entries()) {
    const { x, z } = bay;
    const active = bay.id === "learning";
    const width = active ? 4.40 : index === 1 ? 3.79 : 3.97;
    const depth = active ? 2.27 : index === 2 ? 1.90 : 2.02;
    const level = active ? .25 : .070;
    placeShadow(parent, shadow, new Vector3(x, .049, z), width + 1.13, depth + .86);
    room.box(m.rubber, x, .065, z, width + .08, .09, depth + .07, .054);
    if (active) room.box(m.alloy, x, .171, z, width + .08, .094, depth + .08, .055);
    room.box(active ? m.grout : floorShades[index], x, level, z, width, active ? .105 : .056, depth, .058);
    room.box(active ? m.trace : m.metal, x, level, z + depth / 2 + .015, width - .43, .015, .023);
    room.box(m.edge, x - width * .5 + .23, level + .057, z - depth * .5 + .12, .20, .017, .038);
    room.box(m.metal, x + width * .5 - .23, level + .057, z - depth * .5 + .12, .20, .017, .038);
    if (!active) {
      const track = index === 0 ? m.alloy : m.metal;
      room.box(track, x, .105, z - .61, width - .32, .018, .02);
      if (index === 0) {
        for (const offset of [-.61, .61]) room.box(m.rubber, x + offset, .096, z, .095, .027, 1.44);
      } else {
        for (const offset of [-1.03, 1.03]) room.box(m.rubber, x + offset, .096, z, .064, .027, .88);
      }
    }
    const [label, sub] = nameplates[index];
    const plaque = new Mesh(new PlaneGeometry(active ? 1.54 : 1.36, .33), plateMaterial(m, label, sub, active));
    plaque.rotation.x = -Math.PI / 2;
    plaque.position.set(x, level + .061, z + depth / 2 - .22);
    parent.add(plaque);
    const direction = Math.sign(z);
    room.box(m.alloy, x, .072, z - direction * 1.22, .31, .04, .45, .02);
    room.box(m.strip, x, .102, z - direction * 1.18, .074, .012, .43);
    for (const dx of [-1, 1]) {
      room.cylinder(m.metal, x + dx * (width / 2 - .18), level + .058, z + depth / 2 - .16, .038, .014, 10);
      room.cylinder(m.metal, x + dx * (width / 2 - .18), level + .058, z - depth / 2 + .16, .038, .014, 10);
    }
  }

  const rearHeight = 3.18, rear = -3.38;
  if (variant !== "A") {
    for (const x of [-5.61, -2.86, 0, 2.86, 5.61]) {
      room.box(m.rubber, x, .13, rear, .31, .24, .39, .04);
      room.box(m.metal, x, rearHeight * .5, rear, .16, rearHeight, .23, .039);
      room.box(m.edge, x, rearHeight * .5, rear + .122, .031, 2.91, .024);
    }
    room.box(m.alloy, 0, rearHeight, rear, 11.45, .198, .30, .06);
    room.box(m.edge, 0, rearHeight - .077, rear + .14, 11.12, .023, .035);
    room.box(m.strip, 0, rearHeight - .13, rear + .088, 10.55, .034, .068);
    room.box(m.metal, 0, .49, rear, 11.36, .078, .16, .025);
    room.box(m.alloy, 0, 2.35, rear, 11.39, .065, .13, .025);
    const sheen = new ShaderMaterial({
      uniforms: { tint: { value: m.ivory } },
      vertexShader: `varying vec2 pane; void main(){pane=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform vec3 tint; varying vec2 pane;
        void main(){
          float diagonal = pane.x + pane.y * .78;
          float streak = (1. - smoothstep(.04, .34, abs(diagonal - .94))) * .17;
          float frost = (1. - smoothstep(0., .93, pane.y)) * .10;
          gl_FragColor = vec4(tint, streak+frost);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false,
    });
    for (const x of [-4.23, -1.43, 1.43, 4.23]) {
      room.box(m.smoke, x, 1.405, rear, 2.63, 1.78, .095, .04);
      const shine = new Mesh(new PlaneGeometry(2.60, 1.77), sheen);
      shine.position.set(x, 1.405, rear + .056);
      parent.add(shine);
      room.box(m.grout, x, .33, rear, 2.58, .18, .14, .04);
      for (const y of [.65, .72, .79]) room.box(m.strip, x, y, rear + .054, 2.45, .011, .011);
    }
    for (const z of [-1.0, 1.12]) {
      const height = variant === "B" ? rearHeight : 1.71;
      room.box(m.metal, -5.61, height * .5, z, .19, height, .16, .04);
      room.box(m.rubber, -5.61, .095, z, .30, .17, .32, .049);
    }
    const sideTop = variant === "B" ? rearHeight : 1.71;
    room.box(m.alloy, -5.61, sideTop, -1.12, .23, .14, 4.52);
    room.box(m.edge, -5.49, sideTop, -1.12, .024, .036, 4.36);
    room.box(m.smoke, -5.61, (sideTop + .38) / 2, -2.15, .082, sideTop - .48, 2.27, .03);
    room.box(m.smoke, -5.61, (sideTop + .38) / 2, .08, .082, sideTop - .48, 1.94, .03);
    if (variant === "B") {
      room.box(m.alloy, 5.61, rearHeight, -1.72, .26, .18, 3.4);
      room.box(m.metal, 5.61, 1.6, -.10, .18, 3.20, .22);
      room.box(m.smoke, 5.61, 1.63, -1.70, .086, 2.47, 3.16);
    } else {
      room.box(m.alloy, 0, .68, -2.25, .10, 1.31, .14, .024);
      room.box(m.smoke, 0, .87, -2.36, .061, 1.00, 1.58, .025);
      room.box(m.metal, 0, 1.39, -2.36, .12, .053, 1.70);
    }
  } else {
    room.box(m.alloy, 0, .48, rear, 11.36, .85, .24, .07);
    room.box(m.strip, 0, .91, rear, 11.31, .033, .22);
  }

  for (const x of [-5.44, -.28, .28, 5.44]) {
    room.box(m.grout, x, -.25, 3.64, .14, .10, .028, .014);
    room.box(m.strip, x, -.22, 3.659, .066, .021, .012);
  }
  room.build();
}
