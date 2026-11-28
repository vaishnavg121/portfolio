import {
  CatmullRomCurve3, Color, DynamicDrawUsage, Group, InstancedMesh, Mesh, MeshBasicMaterial, Object3D,
  SphereGeometry, TorusGeometry, TubeGeometry, Vector3,
} from "three";
import { learningBay } from "./studio-plan";
import { modelGroup, placeShadow, type StudioMaterials } from "./studio-model";
import { railEnd, worldPort } from "./studio-ports";
import type { StationSignal } from "./studio-choreography";

const cycle = 9.85;
const vial = { x: -.71, z: -.17 };

const curve = (points: readonly (readonly [number, number, number])[]) =>
  new CatmullRomCurve3(points.map(([x, y, z]) => new Vector3(x, y, z)));

export function learningStation(parent: Group, materials: StudioMaterials, shadow: MeshBasicMaterial) {
  const root = new Group();
  root.position.set(learningBay.x, .307, learningBay.z);
  parent.add(root);
  const model = modelGroup(root);
  const { box, cylinder, piece } = model;
  const m = materials;
  const glow = m.trace.clone();
  const dim = m.strip.clone();
  const ribbon = new MeshBasicMaterial({ color: m.rose.clone().lerp(m.ivory, .47) });
  const rear = m.satin(m.mauve.clone().lerp(m.night, .65), .50, .35);

  placeShadow(root, shadow, new Vector3(-.72, .005, -.12), 2.27, 1.4);
  placeShadow(root, shadow, new Vector3(1.10, .006, -.08), 1.91, 1.42);
  box(m.rubber, -.62, .09, -.13, 2.86, .17, 1.26, .115);
  box(m.metal, -.62, .182, -.13, 2.88, .08, 1.24, .038);
  box(m.ceramic, -.62, .245, -.13, 2.76, .10, 1.18, .064);
  box(m.edge, -.62, .211, .475, 2.57, .023, .022);
  box(m.grout, 1.25, .106, -.08, 1.47, .18, 1.17, .089);
  box(m.alloy, 1.25, .22, -.08, 1.40, .08, 1.08, .047);

  // The sensor manifold feeds a three-dimensional observation chamber.
  box(m.alloy, -1.68, .42, .108, .64, .25, .57, .065);
  box(m.ceramic, -1.68, .58, .09, .56, .14, .49, .047);
  for (let i = 0; i < 4; i++) {
    const x = -1.884 + i * .133;
    box(m.metal, x, .667, .081, .070, .075, .385, .021);
    box(i === 1 ? glow : m.strip, x, .707, .185, .043, .026, .114);
  }
  cylinder(m.rubber, vial.x, .32, vial.z, .56, .14, 36);
  cylinder(m.metal, vial.x, .422, vial.z, .53, .15, 36);
  cylinder(m.edge, vial.x, .515, vial.z, .488, .042, 36);
  cylinder(m.capsule, vial.x, 1.058, vial.z, .441, 1.06, 40);
  cylinder(m.ceramic, vial.x, 1.609, vial.z, .488, .103, 36);
  cylinder(m.edge, vial.x, 1.675, vial.z, .470, .035, 36);
  cylinder(m.metal, vial.x, 1.731, vial.z, .335, .093, 36);
  cylinder(m.rubber, vial.x, 1.801, vial.z, .15, .075, 22);
  cylinder(m.lamp, vial.x, 1.849, vial.z, .091, .030, 20);
  for (let n = 0; n < 8; n++) {
    const angle = n * Math.PI / 4 + .24;
    const x = vial.x + Math.cos(angle) * .495, z = vial.z + Math.sin(angle) * .495;
    if (n > 2 && n < 7) cylinder(m.metal, x, 1.06, z, .031, 1.08, 12);
    cylinder(m.edge, x, .478, z, .038, .035, 12);
    cylinder(m.edge, x, 1.576, z, .033, .031, 12);
  }
  for (const y of [.64, .92, 1.30]) {
    const collar = new TorusGeometry(.444, .013, 8, 42);
    collar.rotateX(-Math.PI / 2);
    piece(collar, y === .92 ? m.edge : m.alloy, vial.x, y, vial.z);
  }

  // Visible fins provide a thermal casing for three compute boards.
  box(m.ceramic, .354, .420, -.23, .76, .28, .74, .067);
  for (let i = 0; i < 3; i++) {
    const y = .62 + i * .175;
    box(i % 2 ? m.grout : rear, .39, y, -.27, .75 - i * .045, .105, .70, .026);
    box(m.edge, .39, y - .045, .087, .65 - i * .035, .020, .026);
    for (let slot = 0; slot < 5; slot++) {
      box(m.metal, .15 + slot * .10, y + .058, -.48, .038, .044, .30, .009);
    }
    box(i === 1 ? glow : m.strip, .52, y, .091, .106, .023, .021);
  }

  const feed = curve([[-2.30,.32,.61],[-1.79,.32,.60],[-1.62,.46,.43],[-1.50,.66,.20],[-1.28,.71,-.15],[-.76,.72,-.17]]);
  const encoded = curve([[vial.x,.86,vial.z],[vial.x,1.37,vial.z],[-.66,1.59,-.28],[-.17,1.31,-.40],[.37,1.03,-.26]]);
  const transfer = curve([[.37,1.03,-.26],[.72,.84,-.15],[.82,.38,-.15],[1.30,.34,-.15],[1.55,.67,-.16]]);
  const exit = curve([[1.82,.64,-.12],[1.85,.36,-.47],[1.74,.10,-.82],[1.22,.052,-1.25],[.98,-.03,-1.62]]);
  exit.points.push(railEnd(root.position,.67));
  const inlet = curve([[-2.30,.32,.61],[-2.48,.24,.63],[-2.56,.023,.60],[-2.54,-.157,.43],
    [-2.53,-.164,-.09],[-2.52,-.164,-1.36],[-2.48,-.164,-1.58]]);
  inlet.points.push(railEnd(root.position,-2.26));
  for (const [path, radius] of [[feed,.036], [encoded,.033], [transfer,.030], [exit,.036], [inlet,.014]] as const) {
    piece(new TubeGeometry(path, 32, radius, 8), m.metal, 0, 0, 0);
    const line = new TubeGeometry(path, 32, radius * .19, 5);
    line.translate(0, radius, 0);
    piece(line, dim, 0, 0, 0);
  }

  // The graph is an upright optical bench with real spacing between panes.
  for (const x of [.73, 1.84]) {
    box(m.metal, x, .775, -.47, .071, 1.005, .095, .022);
    box(m.rubber, x, .321, -.46, .17, .12, .32, .031);
  }
  box(m.edge, 1.285, 1.278, -.47, 1.18, .040, .094, .023);
  box(m.alloy, 1.285, .503, -.44, 1.16, .069, .13, .025);
  for (const z of [-.38,-.20,-.025]) {
    box(m.graph, 1.285, .882, z, 1.05, .70, .024, .012);
    for (let i = 1; i < 5; i++) box(m.strip, .778 + i * .20, .883, z + .017, .009, .48, .008, .003);
    box(m.strip, 1.28, .635, z + .016, .95, .012, .009, .004);
  }
  const forecast = [0,1,2].map(layer => curve([
    [.805,.705,-.34+layer*.18], [.98,.747,-.34+layer*.18], [1.11,.738,-.34+layer*.18],
    [1.27,.842+layer*.034,-.34+layer*.18], [1.40,.810+layer*.034,-.34+layer*.18],
    [1.54,.915+layer*.040,-.34+layer*.18], [1.74,.942+layer*.05,-.34+layer*.18],
  ]));
  const plot = forecast.map((line, index) => {
    const geometry = new TubeGeometry(line, 24, index === 2 ? .023 : .014, 7);
    const mesh = new Mesh(geometry, index === 2 ? glow : ribbon);
    root.add(mesh);
    return mesh;
  });
  model.build();

  const rotor = new Group();
  rotor.position.set(vial.x, .96, vial.z);
  root.add(rotor);
  const engine = modelGroup(rotor);
  engine.cylinder(m.metal, 0, 0, 0, .084, .69, 14);
  for (const y of [-.23, 0, .23]) {
    const disk = new TorusGeometry(.278, .025, 9, 40);
    disk.rotateX(-Math.PI / 2);
    engine.piece(disk, m.edge, 0, y, 0);
    for (let point = 0; point < 5; point++) {
      const angle = point * Math.PI * .4 + y * 2;
      const x = Math.cos(angle) * .277, z = Math.sin(angle) * .277;
      engine.cylinder(glow, x, y, z, .046, .047, 12);
      if (y === -.23) {
        const link = curve([[x, y, z], [x * .72, 0, z * .80], [x * .87, .24, z * .88]]);
        engine.piece(new TubeGeometry(link, 8, .014, 5), m.strip, 0, 0, 0);
      }
    }
  }
  engine.build();

  const count = 42;
  const mover = new Object3D();
  const particles = new InstancedMesh(new SphereGeometry(.045, 8, 6), new MeshBasicMaterial({ color: new Color("white") }), count);
  particles.instanceMatrix.setUsage(DynamicDrawUsage);
  particles.frustumCulled = false;
  root.add(particles);
  for (let i = 0; i < count; i++) particles.setColorAt(i, m.ivory.clone().lerp(i % 3 ? m.rose : m.stone, .3 + (i % 5) / 11));
  const position = new Vector3();
  const ink = glow.color.clone();

  return {
    ports: { input: worldPort(root.position,inlet), output: worldPort(root.position,exit) },
    animate(elapsed: number, emphasis: number, paused: boolean, detailed: boolean, signal: StationSignal, ambient: number) {
      const time = paused ? 5.4 : elapsed % cycle;
      const stage = time < 2.1 ? 0 : time < 4.4 ? 1 : time < 6.62 ? 2 : 3;
      rotor.rotation.y = paused ? .77 : signal === "idle" ? ambient * .14 : elapsed * (.30 + .18 * emphasis);
      const amplitude = signal === "idle" && !paused ? .64 + .08 * Math.sin(ambient * 1.14) + emphasis * .27
        : .78 + .13 * Math.sin(time * 3.4) + emphasis * .24;
      glow.color.copy(ink).multiplyScalar(amplitude);
      const reveal = paused ? 1 : Math.max(.21, Math.min(1, (time - 4.05) * .65));
      for (const line of plot) {
        const triangles = line.geometry.index!.count / 3;
        line.geometry.setDrawRange(0, Math.round(triangles * reveal) * 3);
      }
      const idle = !paused && (signal === "idle" || signal === "settling");
      particles.count = idle ? 9 : detailed ? count : 25;
      for (let i = 0; i < particles.count; i++) {
        const delay = (i % 11) * .105;
        const t = (time + cycle - delay) % cycle;
        const lane = (i % 3 - 1) * .027;
        let size = .72 + (i % 5) * .14;
        if (idle) {
          const phase = ambient * .68 + i * 2.39;
          const radius = .09 + i % 4 * .034;
          position.set(vial.x + Math.cos(phase) * radius, .72 + i * .052, vial.z + Math.sin(phase) * radius);
          size *= .54;
        } else if (i >= 30) {
          const phase = t * 1.12 + i * 2.39;
          const radius = .10 + (i % 5) * .046;
          position.set(vial.x + Math.cos(phase) * radius, .67 + ((i - 30) / 11) * .66, vial.z + Math.sin(phase) * radius);
          size *= stage === 1 ? 1.27 : .64;
        } else if (t < 2.1) feed.getPointAt(t / 2.1, position);
        else if (t < 4.4) encoded.getPointAt((t - 2.1) / 2.3, position);
        else if (t < 6.62) transfer.getPointAt((t - 4.4) / 2.22, position);
        else {
          exit.getPointAt(Math.min(1, (t - 6.62) / 2.63), position);
          size *= signal === "shared" ? .34 : Math.min(1, Math.max(0, (9.48 - t) * 4.5));
        }
        mover.position.copy(position);
        mover.position.y += .031 + lane * .46;
        mover.position.z += lane;
        mover.scale.setScalar(size);
        mover.updateMatrix();
        particles.setMatrixAt(i, mover.matrix);
      }
      particles.instanceMatrix.needsUpdate = true;
      return stage;
    },
  };
}
