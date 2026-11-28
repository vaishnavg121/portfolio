import { Color, CylinderGeometry, Group, Mesh, PlaneGeometry, Vector3, type MeshBasicMaterial } from "three";
import { armAssembly, armFeeder, armGeometry } from "./robotics-kinematics";
import { articulatedArm } from "./robotics-arm";
import { modelGroup, placeShadow, plateMaterial, type StudioMaterials } from "./studio-model";

export type RoboticsComposition = "assembly" | "computing" | "hybrid";
export const rover = { width: .662, depth: .586, height: .136, centerY: .396, axle: .381, wheel: .131 };

export function roboticsCell(root: Group, m: StudioMaterials, shadow: MeshBasicMaterial, composition: RoboticsComposition) {
  const mass = composition === "assembly" ? 1.24 : composition === "computing" ? .83 : 1.16;
  const boardDepth = composition === "computing" ? .65 : composition === "assembly" ? .41 : .51;
  const sage = new Color(0x667b70);
  const slate = m.satin(m.night.clone().lerp(new Color(0x626f75), .59), .43, .48);
  const ceramic = m.satin(m.stone.clone().lerp(sage, .66).lerp(m.ivory, .22), .37, .22);
  const board = m.satin(sage.clone().lerp(m.night, .51), .60, .19);
  const glaze = m.smoke.clone();
  glaze.color.copy(m.ivory).lerp(sage, .78);
  glaze.opacity = .24;
  const lights = Array.from({ length: 5 }, (_, index) => {
    const light = m.trace.clone();
    light.color.copy(sage).lerp(index === 3 ? m.rose : m.ivory, .48);
    return light;
  });
  const [controllerLight, armLight, probeLight, roverLight, dockLight] = lights;
  const { x: bx, z: bz } = armAssembly;

  const deck = modelGroup(root);
  const { box, cylinder, piece } = deck;
  placeShadow(root, shadow, new Vector3(-.02, .005, -.03), 3.98, 1.92);
  box(m.rubber, -.033, .050, -.025, 3.67, .102, 1.789, .087);
  box(slate, -.033, .108, -.025, 3.61, .066, 1.723, .042);
  box(m.ceramic, -.033, .158, -.025, 3.53, .060, 1.641, .033);
  box(m.edge, -.038, .137, .827, 3.43, .018, .019, .008);
  for (const x of [-1.72, 1.64]) for (const z of [-.752, .753]) {
    cylinder(m.edge, x, .189, z, .023, .022, 8);
    cylinder(m.rubber, x, .201, z, .009, .006, 8);
  }

  // Exposed controller with a removable smoked cover and rows of card-edge connectors.
  const front = -.60 + boardDepth / 2;
  const controller = new Vector3(-1.283, .316, front + .071);
  const armPort = new Vector3(armGeometry.pivot.x - .259, .291, armGeometry.pivot.z + .112);
  const testPort = new Vector3(1.41, .312, -.57);
  const servicePort = new Vector3(-.258, .207, -.803);
  box(m.alloy, -1.307, .235, -.573, .98, .100, boardDepth + .11, .061);
  box(board, -1.307, .296, -.573, .91, .039, boardDepth + .027, .017);
  box(m.metal, -1.353, .348, -.59, .286, .080, .231, .027);
  box(m.edge, -1.353, .391, -.590, .227, .017, .181, .012);
  for (let i = 0; i < 5; i++) {
    const z = -.659 + i * .033;
    box(slate, -1.347, .409, z, .185, .017, .012, .004);
    box(m.edge, -1.527 + i * .083, .324, front - .041, .030, .022, .071, .007);
    box(controllerLight, -1.527 + i * .083, .329, front + .005, .024, .015, .018, .005);
  }
  box(m.rubber, -1.007, .329, -.592, .157, .043, .177, .016);
  for (const x of [-1.688, -1.609, -1.018, -.938]) {
    box(m.edge, x, .324, -.678, .029, .024, .058, .006);
    box(m.metal, x + .018, .353, -.682, .031, .057, .034, .009);
  }
  box(glaze, -1.307, .455, -.573, .91, .027, boardDepth + .027, .025);
  for (const x of [-1.731, -.885]) for (const z of [-.573 - boardDepth / 2, -.573 + boardDepth / 2]) {
    cylinder(m.edge, x, .386, z, .022, .173, 10);
  }
  box(m.edge, controller.x, .304, controller.z - .029, .247, .081, .093, .027);
  box(controllerLight, controller.x, .338, controller.z + .028, .161, .017, .025, .006);

  // The loader has three guide faces and a second shallow bin for the assembly concept.
  box(slate, armFeeder.x, .252, armFeeder.z, .672, .145, .647, .069);
  box(m.edge, armFeeder.x, .322, armFeeder.z, .631, .045, .599, .025);
  box(m.rubber, armFeeder.x, .358, armFeeder.z, .49, .031, .415, .025);
  for (const side of [-1, 1]) {
    box(m.metal, armFeeder.x + .234 * side, .383, armFeeder.z, .075, .045, .370, .012);
    box(ceramic, armFeeder.x + .238 * side, .411, armFeeder.z + .110, .068, .044, .075, .017);
  }
  box(m.metal, armFeeder.x, .382, armFeeder.z - .195, .435, .043, .048, .015);
  box(dockLight, armFeeder.x, .358, armFeeder.z + .244, .23, .016, .023, .008);
  if (composition === "assembly") {
    box(m.rubber, -.723, .243, .647, .329, .102, .301, .046);
    box(m.edge, -.723, .310, .647, .277, .041, .260, .020);
    box(board, -.723, .335, .647, .224, .028, .195, .012);
  }

  // A four-wheel demonstration chassis has an open, keyed dock for the removable sensor cassette.
  box(m.alloy, bx, .242, bz, 1.23, .103, .93, .057);
  box(m.edge, bx, .296, bz, 1.17, .033, .88, .029);
  box(m.rubber, bx, .317, bz, 1.109, .022, .838, .025);
  for (const x of [bx - .512, bx + .512]) for (const z of [bz - .38, bz + .38]) {
    box(m.metal, x, .344, z, .093, .051, .096, .017);
  }
  box(slate, bx, rover.centerY, bz, rover.width, rover.height, rover.depth, .049);
  box(board, bx, .444, bz, .503, .040, .436, .023);
  box(m.edge, bx, .422, bz + .329, .643, .075, .122, .034);
  box(m.edge, bx, .413, bz - .308, .629, .063, .116, .027);
  box(roverLight, bx, .429, bz + .390, .276, .017, .017, .008);
  for (const z of [bz - .174, bz + .174]) {
    box(m.metal, bx, .464, z, .446, .029, .051, .015);
    box(roverLight, bx - .144, .483, z, .055, .016, .041, .006);
    for (const x of [bx - .170, bx + .170]) cylinder(m.edge, x, .489, z, .018, .047, 9);
  }
  for (const side of [-1, 1]) for (const z of [bz - .205, bz + .205]) {
    const x = bx + side * rover.axle;
    piece(new CylinderGeometry(rover.wheel, rover.wheel, .097, 20).rotateZ(Math.PI / 2), m.rubber, x, .459, z);
    piece(new CylinderGeometry(rover.wheel * .76, rover.wheel * .76, .108, 20).rotateZ(Math.PI / 2), slate, x, .459, z);
    piece(new CylinderGeometry(rover.wheel * .46, rover.wheel * .46, .116, 14).rotateZ(Math.PI / 2), m.edge, x, .459, z);
    for (let i = 0; i < 10; i++) {
      const a = i * Math.PI / 5;
      box(m.rubber, x, .459 + Math.sin(a) * .126, z + Math.cos(a) * .126, .11, .021, .022, .007);
    }
  }

  const payload = new Group();
  root.add(payload);
  const packageModel = modelGroup(payload);
  packageModel.box(slate, 0, 0, 0, .293, .112, .244, .037);
  packageModel.box(ceramic, 0, .044, 0, .271, .035, .217, .022);
  packageModel.box(m.alloy, -.026, .068, -.016, .155, .027, .139, .015);
  packageModel.box(roverLight, .076, .068, .016, .054, .014, .106, .007);
  for (const x of [-.101, .101]) {
    packageModel.box(m.edge, x, -.035, 0, .028, .025, .259, .008);
    packageModel.cylinder(m.metal, x, .072, -.073, .016, .012, 9);
  }
  packageModel.build();

  // A short side rail keeps the probe clear of the gripper until assembly finishes.
  const scannerY = composition === "computing" ? 1.18 : composition === "assembly" ? .992 : 1.028;
  const slideX = 1.427;
  const park = -.425;
  for (const z of [park - .092, .787]) {
    box(slate, slideX, .249, z, .316, .134, .235, .044);
    box(m.alloy, slideX, (scannerY + .286) / 2, z, .147, scannerY - .287, .116, .035);
    box(m.edge, slideX - .081, (scannerY + .347) / 2, z, .018, scannerY - .356, .072, .008);
    box(m.edge, slideX, scannerY - .002, z, .195, .056, .151, .024);
  }
  for (const x of [slideX - .062, slideX + .052]) box(m.edge, x, scannerY, .142, .043, .038, 1.36, .017);
  box(probeLight, slideX - .090, scannerY - .047, .13, .025, .018, .882, .008);
  box(slate, testPort.x, .254, testPort.z, .399, .150, .298, .047);
  box(glaze, testPort.x, .344, testPort.z, .357, .048, .259, .022);
  box(probeLight, testPort.x, .307, testPort.z + .154, .173, .019, .018, .006);
  for (const x of [testPort.x - .129, testPort.x + .124]) cylinder(m.edge, x, .376, testPort.z, .031, .035, 10);
  for (const p of [armPort, servicePort]) {
    cylinder(m.edge, p.x, p.y - .015, p.z, .041, .044, 10);
    cylinder(m.rubber, p.x, p.y + .006, p.z, .023, .015, 8);
  }
  deck.build();

  const scanner = new Group();
  scanner.position.set(slideX, scannerY, park);
  root.add(scanner);
  const sensor = modelGroup(scanner);
  sensor.box(m.rubber, 0, 0, 0, .235, .111, .259, .038);
  sensor.box(ceramic, 0, .060, 0, .189, .052, .204, .020);
  sensor.box(m.metal, -.386, .001, 0, .612, .049, .079, .024);
  sensor.box(slate, -.702, -.041, 0, .191, .138, .182, .044);
  sensor.box(glaze, -.702, -.117, 0, .143, .042, .138, .028);
  sensor.box(probeLight, -.702, -.148, 0, .075, .014, .068, .006);
  sensor.build();

  function plate(label: string, detail: string, x: number, z: number, width: number, y = .219) {
    const panel = new Mesh(new PlaneGeometry(width, width * .237), plateMaterial(m, label, detail, true));
    panel.position.set(x, y, z);
    panel.rotation.x = -1.23;
    root.add(panel);
  }
  plate("CONTROL", "COMMAND & FEEDBACK", -1.412, -.187, .57);
  plate("FEEDER", "SENSOR CASSETTE", -1.275, .776, .59);
  plate("ASSEMBLY", "ALIGNMENT FIXTURE", bx, .828, .64);
  plate("SCAN", "OPTICAL PROBE", 1.418, -.473, .45, .389);

  const arm = articulatedArm(root, m, slate, ceramic, armLight, mass);
  return { arm, controller, armPort, testPort, servicePort, scanner, scannerY, park, payload, lights, sage };
}
