import { CatmullRomCurve3, CylinderGeometry, ExtrudeGeometry, Group, Shape, TorusGeometry, TubeGeometry, Vector3, type Material, type MeshBasicMaterial } from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { armGeometry, type ArmPose } from "./robotics-kinematics";
import { modelGroup, type StudioMaterials } from "./studio-model";

const vector = (x: number, y: number, z: number) => new Vector3(x, y, z);

export function articulatedArm(parent: Group, m: StudioMaterials, slate: Material, ceramic: Material, lamp: MeshBasicMaterial, mass: number) {
  const { pivot, upper, forearm, tool } = armGeometry;
  const pedestal = modelGroup(parent);
  pedestal.box(m.rubber, pivot.x, .202, pivot.z, .64, .126, .61, .079);
  pedestal.box(m.ceramic, pivot.x, .275, pivot.z, .60, .101, .56, .047);
  pedestal.cylinder(m.alloy, pivot.x, .343, pivot.z, .244, .083, 28);
  pedestal.cylinder(m.edge, pivot.x, .388, pivot.z, .229, .018, 28);
  pedestal.cylinder(m.grout, pivot.x, .414, pivot.z, .204, .048, 24);
  for (const x of [-.23, .23]) for (const z of [-.21, .21]) {
    pedestal.cylinder(m.edge, pivot.x + x, .324, pivot.z + z, .023, .022, 8);
  }
  pedestal.box(lamp, pivot.x + .173, .293, pivot.z + .285, .134, .019, .014, .005);
  pedestal.build();

  const yaw = new Group();
  yaw.position.set(pivot.x, .435, pivot.z);
  parent.add(yaw);
  const mount = modelGroup(yaw);
  mount.cylinder(m.metal, 0, .014, 0, .184, .057, 26);
  mount.box(slate, 0, .072, 0, .273, .145, .272, .051);
  for (const side of [-1, 1]) {
    mount.box(ceramic, 0, .113, side * .133, .173, .186, .068, .038);
    mount.box(m.edge, .025, .037, side * .129, .126, .038, .041, .013);
  }
  mount.build();

  const shoulder = new Group(), elbow = new Group(), wrist = new Group(), roll = new Group();
  shoulder.position.y = pivot.y - yaw.position.y;
  elbow.position.x = upper;
  wrist.position.x = forearm;
  yaw.add(shoulder);
  shoulder.add(elbow);
  elbow.add(wrist);
  wrist.add(roll);

  function disc(builder: ReturnType<typeof modelGroup>, material: Material, radius: number, depth: number, z: number) {
    builder.piece(new CylinderGeometry(radius, radius, depth, 26).rotateX(Math.PI / 2), material, 0, 0, z);
  }

  function joint(builder: ReturnType<typeof modelGroup>, radius: number, width: number) {
    disc(builder, m.rubber, radius, width, 0);
    disc(builder, m.metal, radius * .89, width + .048, 0);
    for (const side of [-1, 1]) {
      const z = side * (width / 2 + .036);
      disc(builder, m.edge, radius * .86, .023, z);
      disc(builder, slate, radius * .63, .039, z + side * .012);
      disc(builder, m.alloy, radius * .32, .044, z + side * .027);
      builder.piece(new TorusGeometry(radius * .71, .009, 5, 23), m.edge, 0, 0, z + side * .022);
      for (let i = 0; i < 5; i++) {
        const a = i * Math.PI * .4;
        builder.piece(new CylinderGeometry(.013, .013, .011, 7).rotateX(Math.PI / 2), m.metal,
          Math.cos(a) * radius * .54, Math.sin(a) * radius * .54, z + side * .035);
      }
    }
  }

  function fairing(length: number, height: number, width: number) {
    const edge = new Shape();
    edge.moveTo(.071, -.071 * height);
    edge.lineTo(.192, -.104 * height);
    edge.lineTo(length - .12, -.070 * height);
    edge.lineTo(length - .053, -.031 * height);
    edge.lineTo(length - .069, .038 * height);
    edge.lineTo(length - .19, .096 * height);
    edge.lineTo(.177, .153 * height);
    edge.lineTo(.057, .099 * height);
    edge.closePath();
    const solid = new ExtrudeGeometry(edge, { depth: width, bevelEnabled: true, bevelThickness: .016, bevelSize: .015, bevelSegments: 1, steps: 1 });
    solid.translate(0, 0, -width / 2);
    const geometry = mergeVertices(solid);
    solid.dispose();
    return geometry;
  }

  function link(parent: Group, length: number, radius: number, width: number) {
    const builder = modelGroup(parent);
    joint(builder, radius, width);
    builder.piece(fairing(length, mass, width * .69), ceramic, 0, 0, 0);
    builder.box(slate, length * .53, .019, 0, length * .56, .093 * mass, width * .78, .028);
    for (const side of [-1, 1]) {
      const z = side * width * .405;
      builder.box(m.edge, length * .51, .018, z, length * .49, .029, .018, .008);
      builder.box(slate, .18, .027, z, .105, .090, .023, .018);
      builder.box(m.metal, length - .151, .022, z, .073, .064, .024, .015);
    }
    for (let i = 0; i < 3; i++) builder.box(m.metal, length * .53 + i * .048, .072 * mass, .017, .020, .013, .078, .005);
    const path = new CatmullRomCurve3([vector(.073, .050, -.086), vector(.143, .157, -.071),
      vector(length * .53, .138 * mass, -.065), vector(length - .10, .102, -.081), vector(length - .042, .044, -.090)]);
    builder.piece(new TubeGeometry(path, 18, .015, 5), m.rubber, 0, 0, 0);
    builder.box(m.edge, length * .45, .134 * mass, -.067, .050, .031, .039, .009);
    builder.build();
  }
  link(shoulder, upper, .165 * mass, .192 * mass);
  link(elbow, forearm, .124 * mass, .144 * mass);

  const hinge = modelGroup(wrist);
  joint(hinge, .083, .105);
  hinge.cylinder(m.alloy, .060, 0, 0, .048, .063, 18);
  hinge.build();
  const head = modelGroup(roll);
  head.box(slate, .095, 0, 0, .109, .122, .173, .032);
  head.box(m.edge, .146, 0, 0, .041, .087, .235, .023);
  head.box(lamp, .107, -.064, 0, .045, .012, .103, .005);
  head.build();
  const gripPoint = new Group();
  gripPoint.position.x = tool;
  roll.add(gripPoint);
  const fingers = [-1, 1].map(side => {
    const finger = new Group();
    roll.add(finger);
    const shape = modelGroup(finger);
    shape.box(m.metal, .155, 0, -side * .031, .075, .085, .102, .023);
    shape.box(m.edge, .212, 0, 0, .120, .059, .041, .012);
    shape.box(m.rubber, .253, 0, -side * .009, .034, .046, .048, .010);
    shape.build();
    return finger;
  });

  return {
    gripPoint,
    pose(joints: ArmPose, closure: number) {
      yaw.rotation.y = joints.yaw;
      shoulder.rotation.z = joints.shoulder;
      elbow.rotation.z = joints.elbow;
      wrist.rotation.z = joints.wrist;
      // Roll cancels the pedestal yaw while the wrist hangs vertically.
      roll.rotation.x = joints.yaw;
      fingers[0].position.z = -.218 + closure * .069;
      fingers[1].position.z = .218 - closure * .069;
    },
  };
}
