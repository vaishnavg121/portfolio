import { CylinderGeometry, Group, TorusGeometry, Vector3, type MeshBasicMaterial } from "three";
import { modelGroup, placeShadow, type StudioMaterials } from "./studio-model";

export type AgenticComposition = "mechanical" | "optical" | "hybrid";

export function agenticMachinery(root: Group, m: StudioMaterials, shadow: MeshBasicMaterial, composition: AgenticComposition) {
  const deck = modelGroup(root);
  const { box, cylinder, piece } = deck;
  const oxide = m.satin(m.mauve.clone().lerp(m.night, .52), .44, .44);
  const ivory = m.satin(m.ivory.clone().lerp(m.stone, .32), .33, .37);
  const archiveGlass = m.smoke.clone();
  archiveGlass.color.copy(m.mauve).lerp(m.night, .48);
  archiveGlass.opacity = .25;
  const optics = m.capsule.clone();
  optics.color.copy(m.mauve).lerp(m.ivory, .50);
  optics.opacity = composition === "optical" ? .15 : .22;
  const lights = ["archive", "retrieval", "agents", "verify", "output", "reasoning", "parser"].map((_, index) => {
    const material = m.trace.clone();
    material.color.copy(m.mauve).lerp(index < 2 ? m.ivory : m.rose, .47);
    return material;
  });
  const [archiveLight, retrievalLight, agentLight, verifyLight, outputLight, reasoningLight, parserLight] = lights;

  const arch = composition === "mechanical" ? -1.17 : -1.30;
  const core = composition === "optical" ? -.19 : -.34;
  const center = new Vector3(core, .89, -.24);
  const radius = composition === "optical" ? .49 : composition === "hybrid" ? .432 : .405;
  const gate = new Vector3(1.14, .67, .15);
  const output = new Vector3(1.52, .32, .62);
  const archiveEntry = new Vector3(arch, .92, -.08);
  const widths = composition === "mechanical" ? [7, 7, 7] : composition === "hybrid" ? [6, 6, 6] : [6, 6];

  placeShadow(root, shadow, new Vector3(-.14, .006, -.14), 3.96, 1.61);
  box(m.rubber, -.11, .06, -.17, 3.48, .12, 1.32, .067);
  box(oxide, -.11, .138, -.17, 3.43, .092, 1.27, .043);
  box(m.ceramic, -.11, .206, -.17, 3.34, .064, 1.18, .026);
  box(m.edge, -.11, .173, .482, 3.11, .018, .016);
  for (const x of [-1.77, 1.54]) {
    for (const z of [-.70, .36]) {
      cylinder(m.edge, x, .156, z, .029, .24, 10);
      cylinder(m.rubber, x, .271, z, .022, .015, 10);
    }
  }

  // Archive cassettes sit in slotted trays, with a real front rail for the picker.
  const rackTop = .57 + widths.length * .31;
  box(m.ceramic, arch, .343, -.31, 1.07, .20, .83, .074);
  box(m.metal, arch, .417, .134, 1.02, .032, .057);
  box(m.alloy, arch, .409, -.682, 1.01, .10, .092);
  for (const dx of [-.497, .497]) {
    box(m.metal, arch + dx, (rackTop + .44) / 2, -.55, .085, rackTop - .41, .09, .026);
    box(m.edge, arch + dx, (rackTop + .44) / 2, .086, .069, rackTop - .41, .090, .022);
    box(archiveGlass, arch + dx + Math.sign(dx) * .039, (rackTop + .46) / 2, -.24, .019, rackTop - .62, .52, .008);
  }
  box(m.alloy, arch, rackTop + .019, -.251, 1.12, .10, .73, .043);
  box(m.edge, arch, rackTop + .076, -.251, 1.045, .026, .64, .016);
  for (const [row, slots] of widths.entries()) {
    const y = .483 + row * .308;
    box(m.alloy, arch, y, -.24, 1.015, .078, .661, .022);
    box(m.edge, arch, y + .025, .107, 1.025, .021, .048, .013);
    for (let slot = 0; slot < slots; slot++) {
      const x = arch + (slot - (slots - 1) / 2) * .132;
      const h = .193 - ((slot * 13 + row) % 3) * .014;
      box(slot % 3 === 2 ? oxide : m.panel, x, y + .040 + h / 2, -.258, .103, h, .51, .018);
      box(slot % 4 === 0 ? ivory : m.metal, x, y + .088, .006, .077, .050, .038, .012);
      box((row + slot) % 4 === 0 ? archiveLight : m.rubber, x, y + .148, .008, .042, .015, .020, .008);
      box(m.grout, x, y + .177, .008, .062, .012, .024, .006);
    }
  }
  for (const y of [.45, rackTop - .082]) box(m.edge, arch, y, .24, 1.14, .035, .051);
  const picker = new Group();
  root.add(picker);
  const extraction = modelGroup(picker);
  extraction.box(m.rubber, 0, 0, 0, .236, .124, .151, .034);
  extraction.box(ivory, 0, .037, .038, .19, .065, .136, .024);
  extraction.box(archiveLight, 0, .042, .108, .089, .020, .014, .008);
  for (const x of [-.077, .077]) {
    extraction.box(m.edge, x, -.051, -.133, .037, .054, .213, .012);
    extraction.cylinder(m.metal, x, -.052, .028, .030, .027, 12);
  }
  extraction.build();

  // The retrieval vault is mounted horizontally across two saddles.
  const length = composition === "optical" ? .99 : composition === "hybrid" ? .91 : .85;
  box(m.alloy, core, .332, -.24, length + .28, .205, .94, .088);
  box(oxide, core, .438, -.24, length + .19, .086, .89, .031);
  const tube = new CylinderGeometry(radius, radius, length, 40, 1, true).rotateZ(-Math.PI / 2);
  piece(tube, optics, center.x, center.y, center.z);
  for (const side of [-1, 1]) {
    const x = core + side * length * .5;
    piece(new TorusGeometry(radius, .047, 10, 40).rotateY(Math.PI / 2), m.edge, x, center.y, center.z);
    piece(new TorusGeometry(radius * .85, .016, 7, 34).rotateY(Math.PI / 2), retrievalLight, x + side * .027, center.y, center.z);
    piece(new CylinderGeometry(radius * .86, radius * .86, .032, 32).rotateZ(-Math.PI / 2), archiveGlass, x, center.y, center.z);
    for (const z of [-.55, .07]) {
      box(m.alloy, x, .567, z, .135, .32, .13, .047);
      box(m.edge, x, .67, z + .060, .087, .044, .029, .015);
    }
  }
  for (const [y, z] of [[1.12,-.57], [1.18,.024], [.62,.054]] as const) {
    box(m.metal, core, y, z, length + .24, .038, .034, .014);
  }
  const scanner = new Group();
  root.add(scanner);
  const rotor = modelGroup(scanner);
  rotor.piece(new TorusGeometry(radius * .82, .019, 7, 34).rotateY(Math.PI / 2), retrievalLight, 0, 0, 0);
  rotor.box(ivory, 0, radius * .80, 0, .082, .071, .104, .024);
  rotor.box(m.edge, 0, -radius * .80, 0, .067, .05, .075, .022);
  rotor.build();

  // Three visibly different housings share the same bus and connector pitch.
  box(m.alloy, -.99, .34, .54, .70, .176, .49, .070);
  box(oxide, -.99, .476, .52, .60, .116, .37, .063);
  box(archiveGlass, -.99, .552, .52, .54, .072, .32, .027);
  box(parserLight, -.99, .448, .744, .233, .028, .018);
  for (const x of [-1.17, -.99, -.81]) box(m.edge, x, .535, .514, .071, .024, .232, .012);

  box(m.rubber, .60, .303, -.453, .54, .102, .47, .058);
  for (const [index, y] of [.414, .557, .701].entries()) {
    box(index % 2 ? oxide : m.ceramic, .60, y, -.453, .55 - index * .035, .126, .45, .040);
    box(m.edge, .60, y - .037, -.221, .46 - index * .035, .022, .020);
    box(agentLight, .47, y + .023, -.221, .068, .022, .013);
    for (let slot = 0; slot < 4; slot++) box(m.metal, .64 + slot * .047, y + .027, -.218, .018, .045, .022, .008);
  }
  box(archiveGlass, .60, .797, -.455, .466, .083, .379, .027);
  cylinder(m.edge, .60, .834, -.455, .125, .024, 20);

  box(m.ceramic, 1.18, .317, -.51, .85, .131, .43, .072);
  box(m.metal, 1.18, .406, -.51, .76, .071, .37, .035);
  for (let finger = 0; finger < 7; finger++) {
    box(m.alloy, .88 + finger * .101, .479, -.51, .045, .12, .28, .016);
  }
  box(reasoningLight, 1.18, .445, -.304, .398, .028, .018);

  // A floating set of alignment plates rides through a bifurcating optical gate.
  box(m.ceramic, gate.x, .294, gate.z, .78, .133, .60, .057);
  box(m.edge, gate.x, .372, gate.z, .69, .048, .52, .026);
  for (const x of [gate.x - .298, gate.x + .298]) {
    box(m.alloy, x, .677, gate.z, .083, .650, .094, .029);
    box(m.rubber, x, .401, gate.z, .145, .076, .139, .026);
  }
  box(m.metal, gate.x, .995, gate.z, .71, .075, .112, .027);
  box(verifyLight, gate.x, .946, gate.z + .029, .47, .020, .031);
  const arm = new Group();
  arm.position.copy(gate);
  root.add(arm);
  const guard = modelGroup(arm);
  guard.piece(new TorusGeometry(.244, .021, 8, 35), ivory, 0, 0, 0);
  guard.piece(new TorusGeometry(.198, .010, 7, 34), verifyLight, 0, 0, .018);
  guard.box(m.edge, 0, .251, 0, .127, .069, .079, .026);
  guard.build();

  box(m.grout, output.x, .20, output.z, .65, .129, .43, .058);
  box(m.edge, output.x, .275, output.z, .60, .047, .39, .025);
  box(m.rubber, output.x, .309, output.z, .515, .061, .315, .021);
  for (const dx of [-.242, .242]) {
    box(m.metal, output.x + dx, .436, output.z, .037, .246, .28, .017);
    box(outputLight, output.x + dx, .554, output.z, .035, .022, .237, .009);
  }
  deck.build();

  return { center, radius, gate, output, archiveEntry, lights, picker, scanner, arm };
}
