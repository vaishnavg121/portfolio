export type ArmPoint = { x: number; y: number; z: number };
export type ArmPose = { yaw: number; shoulder: number; elbow: number; wrist: number };

export const armGeometry = {
  pivot: { x: -.46, y: .56, z: -.32 },
  upper: .75,
  forearm: .73,
  tool: .245,
  limits: {
    yaw: [-2.80, -.15], shoulder: [-.14, 2.08], elbow: [-2.68, -.22], wrist: [-2.49, .62],
  },
} as const;

export const armFeeder = { x: -1.25, y: .423, z: .49 } as const;
export const armAssembly = { x: .62, y: .556, z: .37 } as const;
export const robotCues = [0, 1.65, 3.7, 7.75, 10.35, 12, 18.6] as const;
export const robotStill = 6.17;

const rest = { x: -.39, y: 1.025, z: .32 };
const overFeeder = { ...armFeeder, y: .77 };
const overAssembly = { ...armAssembly, y: .897 };
const beats = { grip: 3.98, install: 6.83, lift: 14.22, return: 16.9 } as const;

type Step = [time: number, point: ArmPoint, arc?: number];
const steps: Step[] = [
  [0, rest], [1.69, rest], [2.99, overFeeder], [3.6, armFeeder], [beats.grip, armFeeder],
  [4.56, overFeeder], [6.04, overAssembly, .085], [6.70, armAssembly], [7.13, armAssembly],
  [7.70, overAssembly], [8.81, rest], [12.83, rest], [13.48, overAssembly], [13.95, armAssembly],
  [beats.lift, armAssembly], [14.82, overAssembly], [16.26, overFeeder, .085], [16.75, armFeeder],
  [17.18, armFeeder], [17.68, overFeeder], [18.35, rest], [18.6, rest],
];

export function robotEase(t: number, start: number, end: number) {
  const v = Math.min(1, Math.max(0, (t - start) / (end - start)));
  return v * v * v * (v * (v * 6 - 15) + 10);
}

export function robotArmTarget(time: number, target: ArmPoint) {
  let index = 1;
  while (index < steps.length - 1 && time >= steps[index][0]) index++;
  const [start, a] = steps[index - 1];
  const [end, b, arch = 0] = steps[index];
  const mix = robotEase(time, start, end);
  const rise = arch * Math.sin(Math.PI * mix) ** 2;
  target.x = a.x + (b.x - a.x) * mix;
  target.y = a.y + (b.y - a.y) * mix + rise;
  target.z = a.z + (b.z - a.z) * mix + rise * 1.23;
}

export function robotGrip(time: number) {
  const outbound = robotEase(time, 3.7, beats.grip) * (1 - robotEase(time, beats.install, 7.13));
  const inbound = robotEase(time, 13.96, beats.lift) * (1 - robotEase(time, beats.return, 17.19));
  return Math.max(outbound, inbound);
}

export function robotPayload(time: number): "gripper" | "fixture" | "feeder" {
  if (time >= beats.grip && time < beats.install || time >= beats.lift && time < beats.return) return "gripper";
  return time >= beats.install && time < beats.lift ? "fixture" : "feeder";
}

export function solveRobotArm(target: ArmPoint, arm: ArmPose) {
  const { pivot, upper, forearm, tool, limits } = armGeometry;
  const dx = target.x - pivot.x;
  const dz = target.z - pivot.z;
  const radial = Math.hypot(dx, dz);
  const dy = target.y + tool - pivot.y;
  const cosine = (radial ** 2 + dy ** 2 - upper ** 2 - forearm ** 2) / (2 * upper * forearm);
  if (cosine < -1 || cosine > 1 || radial < .01) return false;

  // Fixed elbow-up branch keeps every move in the same joint configuration.
  const yaw = -Math.atan2(dz, dx);
  const elbow = -Math.acos(cosine);
  const shoulder = Math.atan2(dy, radial) - Math.atan2(forearm * Math.sin(elbow), upper + forearm * cosine);
  const wrist = -Math.PI / 2 - elbow - shoulder;
  if (yaw < limits.yaw[0] || yaw > limits.yaw[1] || shoulder < limits.shoulder[0] || shoulder > limits.shoulder[1] ||
    elbow < limits.elbow[0] || elbow > limits.elbow[1] || wrist < limits.wrist[0] || wrist > limits.wrist[1]) return false;
  arm.yaw = yaw;
  arm.shoulder = shoulder;
  arm.elbow = elbow;
  arm.wrist = wrist;
  return true;
}
