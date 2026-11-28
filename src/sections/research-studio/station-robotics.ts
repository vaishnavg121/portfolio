import {
  BoxGeometry, CatmullRomCurve3, DoubleSide, EdgesGeometry, Group, InstancedMesh, LineBasicMaterial, LineSegments,
  Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, TubeGeometry, Vector3,
} from "three";
import { roboticsCell, rover, type RoboticsComposition } from "./robotics-cell";
import { armAssembly, armFeeder, robotArmTarget, robotCues, robotEase, robotGrip, robotPayload, robotStill, solveRobotArm } from "./robotics-kinematics";
import { roboticsBay } from "./studio-plan";
import { modelGroup, type StudioMaterials } from "./studio-model";
import { railEnd, worldPort } from "./studio-ports";
import type { StationSignal } from "./studio-choreography";

const point = (x: number, y: number, z: number) => new Vector3(x, y, z);
const curve = (...points: Vector3[]) => new CatmullRomCurve3(points);

export function roboticsStation(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, composition: RoboticsComposition) {
  const root = new Group();
  root.position.set(roboticsBay.x, .108, roboticsBay.z);
  parent.add(root);
  const { arm, controller, armPort, testPort, servicePort, scanner, scannerY, park, payload, lights, sage } =
    roboticsCell(root, m, shadow, composition);
  const [controllerLight, armLight, probeLight, roverLight, dockLight] = lights;
  const quiet = sage.clone().lerp(m.night, .18);
  const ice = sage.clone().lerp(m.ivory, .65);
  const bright = m.ivory.clone().lerp(m.stone, .23);
  const scanColor = m.stone.clone().lerp(sage, .43).lerp(m.ivory, .51);
  const { x: seatX, z: seatZ } = armAssembly;
  const fixture = point(seatX + .514, .344, seatZ - .38);

  const hingeBus = curve(controller, point(-1.10, .276, -.243), point(-.91, .263, -.116), armPort);
  const deckBus = curve(armPort, point(-.199, .227, -.124), point(.166, .221, -.106), point(.536, .265, -.105), fixture);
  const probeBus = curve(fixture, point(1.22, .229, -.164), point(1.405, .235, -.295), testPort);
  const backBus = curve(testPort, point(1.19, .237, -.762), point(.329, .220, -.804), point(-.63, .197, -.778),
    point(-1.11, .231, -.429), controller.clone().add(point(-.079, .009, -.012)));
  const line = curve(railEnd(root.position,-.82), point(-.69, .031, -1.61), point(-.62, .020, -1.254), servicePort,
    point(-.567, .216, -.751), point(-.892, .234, -.472), controller);
  const wires = modelGroup(root);
  const braid = m.satin(sage.clone().lerp(m.night, .44), .61, .31);
  for (const path of [hingeBus, deckBus, probeBus, backBus, line]) {
    wires.piece(new TubeGeometry(path, path === line ? 44 : 20, path === line ? .012 : .016, 5), braid, 0, 0, 0);
    path.getLengths();
  }
  for (const port of [point(-.663, .042, -1.264)]) {
    wires.box(m.edge, port.x, port.y, port.z, .076, .023, .064, .013);
  }
  wires.build();

  const outlineMaterial = new LineBasicMaterial({ color: scanColor, transparent: true, opacity: 0, depthWrite: false });
  const silhouette = new Group();
  silhouette.visible = false;
  root.add(silhouette);
  function outline(x: number, y: number, z: number, w: number, h: number, d: number) {
    const solid = new BoxGeometry(w + .014, h + .02, d + .014);
    const ink = new LineSegments(new EdgesGeometry(solid, 20), outlineMaterial);
    solid.dispose();
    ink.position.set(x, y + .010, z);
    ink.renderOrder = 4;
    silhouette.add(ink);
  }
  outline(seatX, rover.centerY, seatZ, rover.width, rover.height, rover.depth);
  outline(seatX, armAssembly.y, seatZ, .296, .127, .246);
  for (const x of [seatX - rover.axle, seatX + rover.axle]) {
    outline(x, .453, seatZ - .201, .11, .223, .208);
    outline(x, .453, seatZ + .201, .11, .223, .208);
  }
  const sheetMaterial = new MeshBasicMaterial({ color: ice, transparent: true, opacity: .10, side: DoubleSide, depthWrite: false });
  const height = scannerY - .168 - .337;
  const sweep = new Mesh(new PlaneGeometry(.912, height), sheetMaterial);
  sweep.position.set(seatX + .011, .337 + height / 2, park);
  sweep.renderOrder = 3;
  sweep.visible = false;
  root.add(sweep);

  const packetMat = m.trace.clone();
  packetMat.color.setScalar(1);
  const packets = new InstancedMesh(new BoxGeometry(1, 1, 1), packetMat, 14);
  packets.frustumCulled = false;
  root.add(packets);
  const marker = new Object3D();
  const tangent = point(0, 0, 0);
  const shade = quiet.clone();
  let count = 0, tick = -1, stage = 0, lastDetail = false, lastPaused = false, lastEmphasis = -1;
  let lastSignal: StationSignal | undefined;

  function send(path: CatmullRomCurve3, distance: number, repeats: number, power: number, reverse = false) {
    for (let index = 0; index < repeats && count < 14; index++) {
      const progress = distance - index * .079;
      if (progress <= 0 || progress >= 1) continue;
      const at = reverse ? 1 - progress : progress;
      const envelope = robotEase(progress, 0, .09) * (1 - robotEase(progress, .88, 1));
      path.getPointAt(at, marker.position);
      path.getTangentAt(at, tangent);
      marker.rotation.set(0, Math.atan2(-tangent.z, tangent.x), Math.asin(Math.max(-1, Math.min(1, tangent.y))));
      marker.scale.set(.084, .031, .032).multiplyScalar(.63 + envelope * .37);
      marker.updateMatrix();
      packets.setMatrixAt(count, marker.matrix);
      packets.setColorAt(count++, shade.copy(ice).lerp(bright, envelope * power).multiplyScalar(1 + envelope * .57));
    }
  }

  const target = point(0, 0, 0);
  const heldPoint = point(0, 0, 0);
  const joints = { yaw: 0, shoulder: 0, elbow: 0, wrist: 0 };
  return {
    ports: { input: worldPort(root.position,line,true), output: worldPort(root.position,line,true), tint: ice },
    animate(elapsed: number, emphasis: number, paused: boolean, detailed: boolean, status: StationSignal) {
      const nextTick = Math.floor(elapsed * 10);
      if (!detailed && nextTick === tick && lastDetail === detailed && lastPaused === paused &&
        lastSignal === status && Math.abs(emphasis - lastEmphasis) < .035) return stage;
      tick = nextTick;
      lastDetail = detailed;
      lastPaused = paused;
      lastEmphasis = emphasis;
      lastSignal = status;
      const t = paused ? robotStill : elapsed % robotCues[6];
      while (stage > 0 && t < robotCues[stage]) stage--;
      while (t >= robotCues[stage + 1]) stage++;

      robotArmTarget(t, target);
      if (solveRobotArm(target, joints)) arm.pose(joints, robotGrip(t));
      const attachment = robotPayload(t);
      if (attachment === "gripper") {
        arm.gripPoint.getWorldPosition(heldPoint);
        root.worldToLocal(heldPoint);
        payload.position.copy(heldPoint);
      } else {
        const seat = attachment === "fixture" ? armAssembly : armFeeder;
        payload.position.set(seat.x, seat.y, seat.z);
      }

      const scan = robotEase(t, 8.30, 9.93);
      const inspect = robotEase(t, 8.27, 8.68) * (1 - robotEase(t, 10.03, 10.39));
      const scanReturn = 1 - robotEase(t, 10.23, 11.54);
      scanner.position.z = park + (scan * scanReturn) * (.794 - park);
      sweep.visible = inspect > .03;
      sweep.position.z = scanner.position.z;
      sheetMaterial.opacity = .10 * inspect;
      const drawOutline = robotEase(t, 8.77, 9.58) * (1 - robotEase(t, 10.37, 11.66));
      silhouette.visible = detailed && drawOutline > .02;
      outlineMaterial.opacity = .69 * drawOutline;

      const command = robotEase(t, .51, 1.34) * (1 - robotEase(t, 2.38, 2.92));
      const feedback = robotEase(t, 10.55, 11.29) * (1 - robotEase(t, 12.23, 12.81));
      const movement = robotEase(t, 1.95, 2.53) * (1 - robotEase(t, 7.21, 8.31));
      const seated = robotEase(t, 6.81, 7.32) * (1 - robotEase(t, 13.83, 14.31));
      const pickup = robotEase(t, 2.98, 3.51) * (1 - robotEase(t, 4.13, 4.65));
      const level = .21 + emphasis * .23;
      controllerLight.color.copy(quiet).lerp(bright, level + .59 * Math.max(command, feedback));
      armLight.color.copy(quiet).lerp(ice, level + .53 * movement);
      probeLight.color.copy(quiet).lerp(bright, level + .54 * inspect);
      roverLight.color.copy(quiet).lerp(ice, level + .48 * seated);
      dockLight.color.copy(quiet).lerp(bright, level + .53 * pickup);

      count = 0;
      const repeats = detailed ? 5 : 2, power = .63 + .37 * emphasis;
      if (!paused && (status === "local" || status === "shared")) {
        if (stage === 0 && status === "local") send(line, (t - .02) / 1.28, repeats, power);
        if (stage === 1) send(hingeBus, (t - 1.66) / 1.09, repeats, power);
        if (stage === 2) send(deckBus, (t - 6.79) / .75, repeats, power);
        if (stage === 3) send(probeBus, (t - 7.79) / .82, repeats, power);
        if (stage === 4) {
          send(backBus, (t - 10.36) / 1.05, repeats, power);
          if (status === "local") send(line, (t - 11.11) / .87, detailed ? 3 : 1, power * .59, true);
        }
      }
      packets.count = count;
      packets.instanceMatrix.needsUpdate = true;
      if (packets.instanceColor) packets.instanceColor.needsUpdate = true;
      return stage;
    },
  };
}
