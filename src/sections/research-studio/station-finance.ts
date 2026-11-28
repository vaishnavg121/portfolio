import {
  BoxGeometry, CatmullRomCurve3, Group, InstancedMesh, MathUtils, Object3D, TubeGeometry, Vector3, type MeshBasicMaterial,
} from "three";
import { financeMachinery, type FinanceComposition } from "./finance-machinery";
import { expenseExample, normalDensity, normalLossTail } from "./markets-math";
import { marketSurface } from "./markets-surface";
import { marketsBay } from "./studio-plan";
import { modelGroup, type StudioMaterials } from "./studio-model";
import { railEnd, worldPort } from "./studio-ports";
import type { StationSignal } from "./studio-choreography";

const cues = [0, 1.9, 4.35, 7.35, 10.52, 12.35, 14];
const point = (x: number, y: number, z: number) => new Vector3(x, y, z);
const ease = MathUtils.smoothstep;

export function financeStation(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, composition: FinanceComposition) {
  const root = new Group();
  root.position.set(marketsBay.x, .108, marketsBay.z);
  parent.add(root);
  const {
    market, risk, ledger, width, depth, height, riskRadius, lanes, gimbal, gate, balance, sage,
    input, marketExit, riskInput, riskExit, ledgerIn, ledgerOut, marketLight, riskLight, ledgerLight,
  } = financeMachinery(root, m, shadow, composition);

  const sageTrace = sage.clone().lerp(m.ivory, .49);
  const ivoryTrace = m.ivory.clone().lerp(m.stone, .26);
  const tailTrace = m.stone.clone().lerp(m.rose, .39).lerp(m.ivory, .45);
  const rest = sage.clone().lerp(m.night, .14);
  const barTint = sage.clone().lerp(m.stone, .24);
  const surfaceGroup = new Group();
  surfaceGroup.position.copy(market);
  root.add(surfaceGroup);
  const surface = marketSurface(surfaceGroup, { width, height, depth }, sage.clone().lerp(m.night, .28),
    m.ivory.clone().lerp(sage, .53), sageTrace, ivoryTrace);

  const route = (...points: Vector3[]) => new CatmullRomCurve3(points);
  const inlet = route(railEnd(root.position,-1.76), point(-1.95, .031, 1.60), point(-1.96, .025, 1.36),
    point(-1.98, .026, .70), point(-1.90, .109, .447), input);
  const analysis = route(marketExit, point(.34, .403, -.323), riskInput);
  const scenario = route(riskInput, point(risk.x - riskRadius + .07, .58, risk.z + .11),
    point(risk.x - .18, .69, risk.z + .087), point(risk.x, .81, risk.z + .071));
  const accounting = route(riskExit, point(1.53, .38, .028), point(1.68, .33, .134), ledgerIn);
  const distributor = point(gate.position.x, .5, ledger.z);
  const entries = lanes.map(({ z, account }) => route(ledgerIn, distributor.clone(),
    point(distributor.x - .144, .472, z), account.clone()));
  const settlement = lanes.map(({ account, z }) => route(account.clone(),
    point(ledgerOut.x + .145, .53, z), balance.position.clone().add(point(0, .055, 0))));
  const corridor = route(balance.position.clone().add(point(-.08, .033, 0)), point(ledgerOut.x - .19, .256, .843),
    point(ledgerOut.x - .22, .035, 1.18), point(ledgerOut.x - .23, .031, 1.55), railEnd(root.position,-.57));
  const report = route(riskExit, point(1.59,.244,.018), point(1.70,.090,.451),
    point(1.80,.040,.99), point(1.80,.033,1.52), railEnd(root.position,1.68));

  const wire = m.satin(sage.clone().lerp(m.night, .37), .52, .36);
  const edge = m.satin(m.stone.clone().lerp(m.night, .34), .50, .56);
  const fixtures = modelGroup(root);
  for (const [index, path] of [inlet, analysis, accounting, ...entries, ...settlement, corridor, report].entries()) {
    fixtures.piece(new TubeGeometry(path, path === inlet || path === corridor ? 38 : 15, index < 3 ? .016 : .010, 5),
      index % 2 === 0 ? edge : wire, 0, 0, 0);
    path.getLengths();
  }
  scenario.getLengths();

  const lossSpan = riskRadius * .74;
  const toLossX = (z: number) => risk.x + z / 3.1 * lossSpan;
  const lossBase = risk.y - .103;
  const thresholdX = toLossX(normalLossTail.threshold);
  const meanX = toLossX(normalLossTail.conditionalMean);
  const threshold = marketLight.clone(), mean = marketLight.clone();
  fixtures.box(threshold, thresholdX, lossBase + .067, risk.z + .067, .008, .165, .028, .003);
  fixtures.box(mean, meanX, lossBase - .029, risk.z + .069, .020, .013, .056, .006);
  fixtures.box(m.edge, (thresholdX + toLossX(3.1)) / 2, lossBase - .018, risk.z + .064,
    toLossX(3.1) - thresholdX, .011, .014, .004);
  for (const p of [point(-2.04,.022,1.69), point(-.49,.026,1.69), point(-2.60,.026,1.69)]) {
    fixtures.box(m.edge, p.x, p.y, p.z, .065, .014, .070, .009);
  }
  fixtures.build();

  const box = new BoxGeometry(1, 1, 1);
  const glow = m.trace.clone();
  glow.color.setScalar(1);
  const packets = new InstancedMesh(box, glow, 16);
  const density = new InstancedMesh(box, glow, 31);
  packets.frustumCulled = density.frustumCulled = false;
  root.add(density, packets);

  const matrix = new Object3D();
  const tangent = point(0, 0, 0);
  const color = sage.clone();
  const spacing = (2 * lossSpan) / (density.count - 1);
  const lossBins = Array.from({ length: density.count }, (_, index) => {
    const z = (index / (density.count - 1) * 2 - 1) * 3.1;
    return { x: toLossX(z), shape: normalDensity(z) / normalDensity(0), inTail: z >= normalLossTail.threshold };
  });
  let packetCount = 0, tick = -1, lastDetail = false, lastPaused = false, stage = 0, lastSignal: StationSignal | undefined;
  let activeLedger = true, lastEmphasis = -1;

  function send(path: CatmullRomCurve3, progress: number, length: number, count: number, energy: number, highlight = ivoryTrace) {
    for (let i = 0; i < count && packetCount < 16; i++) {
      const at = progress - i * .073;
      if (at <= 0 || at >= 1) continue;
      const envelope = ease(at, 0, .095) * (1 - ease(at, .90, 1));
      path.getPointAt(at, matrix.position);
      path.getTangentAt(at, tangent);
      matrix.rotation.set(0, Math.atan2(-tangent.z, tangent.x), Math.asin(MathUtils.clamp(tangent.y, -1, 1)));
      matrix.scale.set(length, .026, .038).multiplyScalar(.5 + envelope * .5);
      matrix.updateMatrix();
      packets.setMatrixAt(packetCount, matrix.matrix);
      packets.setColorAt(packetCount++, color.copy(sageTrace).lerp(highlight, envelope * energy).multiplyScalar(1 + envelope * .8));
    }
  }

  return {
    ports: { input: worldPort(root.position,inlet,true), output: worldPort(root.position,report) },
    animate(elapsed: number, emphasis: number, paused: boolean, detailed: boolean, status: StationSignal) {
      const nextTick = Math.floor(elapsed * 12);
      if (!detailed && nextTick === tick && detailed === lastDetail && paused === lastPaused &&
        lastSignal === status && Math.abs(emphasis-lastEmphasis) < .035) return stage;
      tick = nextTick;
      lastDetail = detailed;
      lastPaused = paused;
      lastSignal = status;
      lastEmphasis = emphasis;
      if (status !== "settling") activeLedger = status === "local";
      const t = paused ? 10.28 : elapsed % cues[6];
      while (stage > 0 && t < cues[stage]) stage--;
      while (t >= cues[stage + 1]) stage++;

      const intro = ease(t, .18, 2.26), settle = 1 - ease(t, 12.45, 14);
      const shock = ease(t, 1.72, 2.98) * (1 - ease(t, 3.09, 5.02));
      const formation = .22 + .78 * intro * settle;
      const scan = ease(t, 1.75, 2.15) * (1 - ease(t, 3.81, 4.55));
      surface.update(.21 + shock * .092, formation, .085 + ease(t, 1.86, 4.19) * .86, scan, emphasis, detailed);
      marketLight.color.copy(rest).lerp(ivoryTrace, .29 + .21 * emphasis + .34 * shock);

      const sample = ease(t, 4.88, 6.16);
      const tail = ease(t, 5.95, 6.58) * (1 - ease(t, 11.8, 13.76));
      const riskForm = .19 + sample * settle * .81;
      const riskActive = ease(t, 4.35, 5.29) * (1 - ease(t, 7.01, 8.05));
      gimbal.rotation.set(.33 * (1 - riskActive), -.48 + .61 * riskActive, -.27 + .52 * sample * settle);
      riskLight.color.copy(rest).lerp(ivoryTrace, .25 + .20 * emphasis + .44 * riskActive);
      threshold.color.copy(rest).lerp(ivoryTrace, .36 + .60 * tail);
      mean.color.copy(rest).lerp(tailTrace, .24 + .73 * tail);

      matrix.rotation.set(0, 0, 0);
      for (const [index, { x, shape, inTail }] of lossBins.entries()) {
        const level = .006 + .262 * shape * riskForm;
        matrix.position.set(x, lossBase + level / 2, risk.z + .041);
        matrix.scale.set(spacing * .72, level, .037);
        matrix.updateMatrix();
        density.setMatrixAt(index, matrix.matrix);
        density.setColorAt(index, color.copy(barTint).lerp(inTail ? tailTrace : ivoryTrace,
          inTail ? .14 + tail * .85 : .08 + shape * .30));
      }
      density.instanceMatrix.needsUpdate = true;
      if (density.instanceColor) density.instanceColor.needsUpdate = true;

      const ledgerTime = paused || activeLedger ? t : Math.min(t,7.4);
      const routing = ease(ledgerTime, 7.57, 8.22) * (1 - ease(ledgerTime, 9.56, 10.26));
      let credited = 0;
      const available = ease(ledgerTime, 7.47, 8.16) * expenseExample.total;
      for (const [index, { light, carriage, account }] of lanes.entries()) {
        const close = ease(ledgerTime, 8.76 + index * .32, 9.10 + index * .32);
        credited += expenseExample.credits[index] * close;
        carriage.position.y = account.y + .065 * close * (1 - ease(t, 9.74 + index * .18, 10.42 + index * .18));
        light.color.copy(rest).lerp(ivoryTrace, .19 + .24 * emphasis + .55 * close * settle);
      }
      const residual = (available - credited) / expenseExample.total;
      const balanced = ease(ledgerTime, 9.53, 10.29) * (1 - ease(ledgerTime, 12, 13.5));
      gate.rotation.y = -.27 + routing * .42;
      gate.position.y = .566 + routing * .042;
      balance.rotation.z = -.12 * (1 - balanced) + .24 * residual;
      ledgerLight.color.copy(rest).lerp(ivoryTrace, .18 + .17 * emphasis + .57 * Math.max(routing, balanced));

      packetCount = 0;
      const traces = detailed ? 5 : 2;
      const strength = .63 + .37 * emphasis;
      if (!paused && (status === "local" || status === "shared")) {
        if (stage === 0 && status === "local") send(inlet, (t - .03) / 1.43, .080, traces, strength);
        if (stage === 1 || stage === 2) send(analysis, (t - 3.75) / 1.07, .070, traces, strength);
        if (stage === 2) send(scenario, (t - 4.77) / .90, .055, traces, strength);
        if ((stage === 2 || stage === 3) && status === "local") send(accounting, (t - 7.04) / .86, .073, traces, strength);
        if (stage === 3 && status === "local") {
          for (const [index, path] of entries.entries()) {
            const length = .056 + expenseExample.credits[index] / expenseExample.total * .084;
            const start = 8.04 + index * .28;
            send(path, (t - start) / .78, length, detailed ? 3 : 1, strength);
            send(settlement[index], (t - start - .71) / .69, length * .84, 1, strength);
          }
        }
        if (stage === 4 && status === "local") send(corridor, (t - 10.43) / 1.43, .091, traces + 1, strength);
      }
      packets.count = packetCount;
      packets.instanceMatrix.needsUpdate = true;
      if (packets.instanceColor) packets.instanceColor.needsUpdate = true;
      return stage;
    },
  };
}
