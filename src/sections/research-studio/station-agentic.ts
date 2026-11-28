import {
  BoxGeometry, CatmullRomCurve3, CylinderGeometry, Group, InstancedMesh, MathUtils, Mesh, Object3D, SphereGeometry,
  TubeGeometry, Vector3, type MeshBasicMaterial,
} from "three";
import { agenticMachinery, type AgenticComposition } from "./agentic-machinery";
import { modelGroup, type StudioMaterials } from "./studio-model";
import { agenticBay } from "./studio-plan";
import { railEnd, worldPort } from "./studio-ports";
import type { StationSignal } from "./studio-choreography";

const cue = [0, 1.65, 3.95, 5.95, 8.10, 10.15, 12.6];
const ease = (value: number, start: number, end: number) => MathUtils.smoothstep(value, start, end);
const point = (x: number, y: number, z: number) => new Vector3(x, y, z);

export function agenticStation(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, composition: AgenticComposition) {
  const root = new Group();
  root.position.set(agenticBay.x, .108, agenticBay.z);
  parent.add(root);
  const { center, radius, gate, output, archiveEntry, lights, picker, scanner, arm } =
    agenticMachinery(root, m, shadow, composition);
  const parser = point(-.99, .604, .51);
  const encoder = point(.60, .863, -.455);
  const reasoner = point(1.18, .553, -.51);
  const queryPort = point(-1.49, .38, .57);
  const vaultPort = center.clone().add(point(-.31, .016, .24));
  const vaultExit = center.clone().add(point(.41, -.074, .036));
  const archiveSlot = archiveEntry.clone().add(point(.252, -.168, -.14));
  const reader = point(-.72, .608, .30);
  const verified = gate.clone().add(point(.023, -.055, .06));
  const rejectTray = point(.34, .34, .96);
  const route = (...points: Vector3[]) => new CatmullRomCurve3(points);
  const query = route(queryPort, point(-1.28, .45, .61), parser);
  const encode = route(parser, point(-.77, .66, .39), point(-.72, .90, .20), vaultPort);
  const extraction = route(archiveSlot, archiveSlot.clone().add(point(0, .006, .37)), archiveEntry,
    point(-.88, .81, .38), reader);
  const feed = route(reader, point(-.53, .63, .50), point(-.32, .72, .32), vaultExit);
  const retrieval = route(vaultExit, point(.28, .90, -.27), encoder);
  const exchange = route(encoder, point(.87, .88, -.51), point(1.15, .71, -.52), reasoner);
  const returnMessage = route(reasoner, point(1.29, .68, -.70), point(.88, .91, -.70), encoder);
  const check = route(reasoner, point(1.47, .59, -.25), point(1.43, .72, .07), gate);
  const approve = route(gate, verified, point(1.33, .49, .47), output.clone().add(point(0, .11, 0)));
  const reject = route(gate, point(1.04, .58, .42), point(.75, .45, .73), rejectTray);
  const corridor = route(output.clone().add(point(0, .045, 0)), point(1.29, .086, .84),
    point(1.20, .030, 1.28), point(1.21, .033, 1.58), railEnd(root.position,1.37));
  const inlet = route(queryPort, point(-1.565,.20,.79), point(-1.641,.059,1.10),
    point(-1.66,.032,1.54), railEnd(root.position,-1.53));

  // Permanent connections remain visible throughout the cycle.
  const conduit = m.satin(m.mauve.clone().lerp(m.night, .43), .63, .40);
  const brass = m.satin(m.stone.clone().lerp(m.night, .36), .52, .42);
  const cables = modelGroup(root);
  for (const [index, path] of [query, encode, feed, retrieval, exchange, returnMessage, check, approve, reject, corridor, inlet].entries()) {
    const floor = path === corridor || path === inlet;
    cables.piece(new TubeGeometry(path, floor ? 46 : 18, floor ? .010 : .014, 5), index % 3 === 0 ? brass : conduit, 0, 0, 0);
    path.getLengths();
  }
  cables.build();
  extraction.getLengths();

  const fittings = modelGroup(root);
  for (const p of [parser, encoder, reasoner, queryPort, reader, vaultExit]) {
    fittings.cylinder(m.edge, p.x, p.y - .022, p.z, .045, .042, 8);
    fittings.cylinder(m.trace, p.x, p.y + .002, p.z, .025, .010, 8);
  }
  fittings.box(m.rubber, rejectTray.x, rejectTray.y - .074, rejectTray.z, .37, .078, .235, .027);
  fittings.box(m.metal, rejectTray.x, rejectTray.y - .033, rejectTray.z, .32, .027, .21, .015);
  for (const x of [-.146, .146]) fittings.box(m.alloy, rejectTray.x + x, rejectTray.y, rejectTray.z, .026, .049, .197, .009);
  fittings.build();

  const layerGroups = Array.from({ length: 3 }, (_, index) => {
    const layer = new Group();
    const shape = modelGroup(layer);
    shape.box(index === 1 ? m.alloy : m.ceramic, 0, 0, 0, .386 - index * .023, .036, .244, .014);
    shape.box(lights[4], -.098, .024, .02, .032, .012, .103, .004);
    for (const z of [-.072, -.022, .028]) {
      shape.box(m.metal, .028, .024, z, .177 - index * .015, .009, .013, .004);
    }
    shape.build();
    root.add(layer);
    return layer;
  });
  const citationMaterial = m.trace.clone();
  const citationGeometry = new CylinderGeometry(.012, .012, 1, 6);
  const citations = [0, 1].map(() => {
    const mesh = new Mesh(citationGeometry, citationMaterial);
    root.add(mesh);
    return mesh;
  });
  function sheet(mark: MeshBasicMaterial) {
    const group = new Group();
    const shape = modelGroup(group);
    shape.box(m.ceramic, 0, 0, 0, .191, .020, .244, .007);
    shape.box(m.metal, 0, .013, -.075, .153, .010, .030, .004);
    shape.box(mark, -.068, .017, -.075, .032, .010, .030, .004);
    for (const z of [-.031, .017, .058]) shape.box(m.edge, -.006, .013, z, .122, .008, .012, .004);
    shape.build();
    return group;
  }
  const rejectMark = m.trace.clone();
  rejectMark.color.copy(m.stone).lerp(m.night, .32);
  const source = sheet(lights[0]), kept = sheet(lights[3]), rejected = sheet(rejectMark);
  root.add(source, kept, rejected);

  const packetMat = m.trace.clone();
  packetMat.color.setScalar(1);
  const packets = new InstancedMesh(new BoxGeometry(1, 1, 1), packetMat, 17);
  packets.frustumCulled = false;
  root.add(packets);
  const clusterMat = m.trace.clone();
  clusterMat.color.setScalar(1);
  const embeddings = new InstancedMesh(new SphereGeometry(1, 7, 4), clusterMat, 27);
  embeddings.frustumCulled = false;
  root.add(embeddings);
  const stylus = new Object3D();
  const scratch = point(0, 0, 0);
  const across = point(0, 1, 0);
  const tangent = point(0, 0, 0);
  const color = m.ivory.clone();
  const quiet = m.mauve.clone().lerp(m.stone, .26);
  const signal = m.rose.clone().lerp(m.ivory, .57).multiplyScalar(1.48);
  const muted = m.stone.clone().lerp(m.night, .43);
  const centroids = [point(-.23, .03, -.06), point(.025, .13, .15), point(.244, -.13, -.09)]
    .map(local => local.add(center));
  const probe = center.clone().add(point(.09, .16, .23));
  const nearest = centroids.reduce((best, p, i) =>
    p.distanceToSquared(probe) < centroids[best].distanceToSquared(probe) ? i : best, 0);
  const scan = route(vaultPort, probe, centroids[nearest]);
  scan.getLengths();
  let packetCount = 0;
  let lastTick = -1, lastSignal: StationSignal | undefined, lastEmphasis = -1;
  let stage = 0;

  function send(path: CatmullRomCurve3, progress: number, count: number, strength: number, size = .051) {
    for (let i = 0; i < count && packetCount < 17; i++) {
      const t = progress - i * .084;
      if (t < 0 || t > 1) continue;
      const glow = Math.min(ease(t, 0, .055), 1 - ease(t, .935, 1));
      path.getPointAt(t, stylus.position);
      path.getTangentAt(t, tangent);
      stylus.rotation.set(0, Math.atan2(-tangent.z, tangent.x), Math.asin(MathUtils.clamp(tangent.y, -1, 1)));
      stylus.scale.set(size * (1.15 - i * .06), size * .48, size * .57).multiplyScalar(.50 + .50 * glow);
      stylus.updateMatrix();
      packets.setMatrixAt(packetCount, stylus.matrix);
      color.copy(quiet).lerp(signal, glow * strength * (1 - i * .085));
      packets.setColorAt(packetCount++, color);
    }
  }

  return {
    ports: { input: worldPort(root.position,inlet), output: worldPort(root.position,corridor) },
    animate(elapsed: number, emphasis: number, paused: boolean, detailed: boolean, status: StationSignal) {
      const t = paused ? 7.20 : elapsed % cue[6];
      const tick = detailed ? -1 : Math.floor(elapsed * 12);
      if (!paused && !detailed && tick === lastTick && lastSignal === status && Math.abs(emphasis-lastEmphasis) < .035) return stage;
      lastTick = tick;
      lastSignal = status;
      lastEmphasis = emphasis;
      while (stage > 0 && t < cue[stage]) stage--;
      while (t >= cue[stage + 1]) stage++;
      const part = (t - cue[stage]) / (cue[stage + 1] - cue[stage]);
      const scanProgress = ease(t, 1.99, 3.49);
      const getSource = ease(t, 1.77, 3.26);
      const checking = ease(t, 6.12, 6.82) * (1 - ease(t, 7.62, 8.19));
      const depart = ease(t, 10.61, 11.81);
      const traces = detailed ? 5 : 2;
      const energy = .60 + emphasis * .40;
      const archive = ease(t, 1.63, 1.95) * (1 - ease(t, 2.94, 3.49));
      const semantic = ease(t, 2.16, 2.98) * (1 - ease(t, 3.76, 4.4));
      const exchangeLight = ease(t, 3.68, 4.19) * (1 - ease(t, 5.47, 6.13));
      const verify = ease(t, 6.05, 6.88) * (1 - ease(t, 7.96, 8.48));
      const assembled = ease(t, 8.33, 9.57) * (1 - ease(t, 10.24, 11.45));
      const reason = ease(t, 4.45, 4.91) * (1 - ease(t, 5.79, 6.21));
      const interpret = ease(t, .59, 1.04) * (1 - ease(t, 1.35, 2.11));
      [archive, semantic, exchangeLight, verify, assembled, reason, interpret].forEach((activation, index) =>
        lights[index].color.copy(quiet).lerp(signal, .14 + emphasis * .14 + .70 * activation * energy));
      picker.position.copy(archiveEntry);
      picker.position.x = MathUtils.lerp(archiveEntry.x - .29, archiveSlot.x, ease(t, .95, 1.80));
      picker.position.x = MathUtils.lerp(picker.position.x, archiveEntry.x - .29, ease(t, 3.20, 4.15));
      picker.position.y = MathUtils.lerp(.87, archiveSlot.y + .055, ease(t, .92, 1.70) * (1 - ease(t, 3.06, 3.86)));
      picker.position.z = .168 + .133 * Math.sin(getSource * Math.PI);
      scanner.position.copy(center);
      scanner.position.x += radius * (.85 * scanProgress - .43) * (1 - ease(t, 4.12, 5.03));
      scanner.rotation.x = -.25 + scanProgress * (1 - ease(t, 4.00, 5.46)) * 4.4 + checking * .24;
      arm.position.y = gate.y + .023 + .061 * checking;
      arm.rotation.y = -.42 * (1 - checking);
      arm.rotation.z = -.13 * (1 - checking);

      source.visible = t > 1.72 && t < 4.09;
      if (source.visible) {
        if (t < 3.26) extraction.getPointAt(getSource, source.position);
        else feed.getPointAt(ease(t, 3.26, 4.09), source.position);
        source.rotation.set(-1.29 * (1 - ease(t, 2.03, 2.78)), .36 * Math.sin(getSource * Math.PI), 0);
        source.scale.setScalar(1.40 - .76 * ease(t, 3.64, 4.09));
      }
      kept.visible = t > 6.05 && t < 8.87;
      rejected.visible = t > 6.26 && t < 12.2;
      if (kept.visible) {
        const path = t < 7.15 ? check : approve;
        path.getPointAt(ease(t, t < 7.15 ? 6.05 : 7.15, t < 7.15 ? 7.15 : 8.61), kept.position);
        kept.position.y += .048;
        kept.rotation.set(checking * .72, -.24 + .51 * checking, 0);
      }
      if (rejected.visible) {
        reject.getPointAt(ease(t, 7.04, 8.15), rejected.position);
        rejected.position.add(scratch.set(0, .05 + .07 * checking, .032 * checking));
        rejected.rotation.set(-.77 * checking, .38 + .27 * checking, .32 * checking);
        rejected.scale.setScalar(.93 - .86 * ease(t, 11.8, 12.2));
      }
      for (const [index, layer] of layerGroups.entries()) {
        const formed = ease(t, 8.10 + index * .39, 8.71 + index * .39);
        const down = ease(t, 9.19, 9.94);
        layer.visible = paused || formed > .01 && depart < .96;
        layer.position.copy(output);
        layer.position.x += (index - 1) * (.015 + .14 * (1 - formed)) - depart * .18;
        layer.position.y += .090 + index * (.043 + .078 * (1 - down)) + (1 - formed) * .18;
        layer.rotation.y = (index - 1) * .13 * (1 - down);
        layer.scale.setScalar(paused ? 1 : Math.max(.07, formed * (1 - depart)));
      }
      citationMaterial.color.copy(quiet).lerp(signal, .45 + .46 * ease(t, 8.82, 9.53));
      for (const [index, citation] of citations.entries()) {
        const from = layerGroups[index], to = layerGroups[index + 1];
        citation.visible = (paused || t > 8.94 + index * .38) && from.visible && to.visible;
        if (!citation.visible) continue;
        tangent.subVectors(to.position, from.position);
        citation.position.copy(from.position).lerp(to.position, .5);
        citation.position.x -= .099;
        citation.position.z += .084;
        citation.scale.y = tangent.length();
        citation.quaternion.setFromUnitVectors(across, tangent.normalize());
      }

      packetCount = 0;
      if (status === "local" || status === "shared") {
        if (stage === 0) send(query, part * 1.29, traces, energy);
        if (stage === 0 || stage === 1) send(encode, (t - 1.09) / 1.02, traces, energy);
        if (stage === 1) send(scan, (t - 2.12) / 1.16, traces, energy);
        if (stage === 1 || stage === 2) send(retrieval, (t - 3.22) / 1.13, traces, energy);
        if (stage === 2) {
          send(exchange, part * 1.42, traces, energy);
          send(returnMessage, (part - .19) * 1.63, traces, energy * .75);
          send(check, (part - .51) * 2.17, traces, energy);
        }
        if (stage === 3) {
          send(check, part * 2.1, traces, energy);
          send(approve, (part - .45) * 1.88, traces, energy);
          send(reject, (part - .49) * 2.1, 2, energy * .35);
        }
        if (stage === 4) send(approve, part * 1.38, traces, energy);
        if (stage === 5 && status === "local") send(corridor, part * 1.23, traces + 2, energy, .093);
      }
      packets.count = packetCount;
      packets.instanceMatrix.needsUpdate = true;
      if (packets.instanceColor) packets.instanceColor.needsUpdate = true;

      const clusterSize = detailed || paused ? 9 : 5;
      let clusterIndex = 0;
      for (const [index, centroid] of centroids.entries()) {
        const match = index === nearest;
        const clusterGlow = match ? .30 + .66 * scanProgress * (1 - ease(t, 4.65, 6.11)) : .13;
        for (let i = 0; i < clusterSize; i++) {
          const angle = i * 2.399 + index * 1.06 + (detailed && !paused ? t * .23 : .28);
          const spread = .068 + (i % 4) * .017;
          stylus.position.copy(centroid).add(scratch.set(Math.cos(angle) * spread,
            (i / 8 - .5) * .145, Math.sin(angle) * spread));
          stylus.rotation.set(0, 0, 0);
          stylus.scale.setScalar((i % 3 === 0 ? .034 : .022) * (.87 + clusterGlow * .65));
          stylus.updateMatrix();
          embeddings.setMatrixAt(clusterIndex, stylus.matrix);
          color.copy(muted).lerp(match ? signal : quiet, clusterGlow + (i % 3) * .08);
          embeddings.setColorAt(clusterIndex++, color);
        }
      }
      embeddings.count = clusterIndex;
      embeddings.instanceMatrix.needsUpdate = true;
      if (embeddings.instanceColor) embeddings.instanceColor.needsUpdate = true;
      return stage;
    },
  };
}
