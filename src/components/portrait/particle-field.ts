import { tracePortraitSilhouette } from "./portrait-dispersion";

const TICK = 0.5; // 120 Hz, expressed in 60 Hz frame units.
const FRONT_YAW = 0;
const FRONT_PITCH = 0;
const YAW_RANGE = 0.205;
const PITCH_RANGE = 0.145;
const CAMERA_DRAG = 0.873;
const QUIET = 0.009;
const FLOW_DIRECTION_SCALE = 127 / 2;

export type Disturbance = {
  x: number;
  y: number;
  strength: number;
  tilt: number;
  vx: number;
  vy: number;
  pulse?: number;
};

export function createParticleField(data: ArrayBuffer) {
  // DP v3 records half-cell X/Y, depth, luminance/coverage, and two packed normals.
  const samples = new Uint8Array(data);
  const size = samples[4];
  const coreCount = (samples.length - 6) / 5;
  if (samples[0] !== 68 || samples[1] !== 80 || samples[2] !== 3 || samples[3] !== 0 ||
    !size || size !== samples[5] || !Number.isInteger(coreCount) || coreCount < 1 || coreCount > 65535) {
    throw new Error("Invalid portrait sculpture");
  }

  const { edge, fringe } = tracePortraitSilhouette(samples, size, coreCount);
  const count = Math.min(65535, coreCount + fringe.length);
  const focal = size * 1.58;
  const centerY = size * 0.45;
  const compact = size < 100;
  const home = new Float32Array(count * 3);
  const positions = new Float32Array(home.length);
  const velocities = new Float32Array(home.length);
  const targets = new Float32Array(home.length);
  const inks = new Float32Array(home.length);
  const flow = new Int8Array(home.length);
  const normals = new Float32Array(count * 2);
  const springs = new Float32Array(count);
  const damping = new Float32Array(count);
  const camera = new Float32Array([1, 0, 1, 0]);
  let yaw = FRONT_YAW;
  let pitch = FRONT_PITCH;
  let yawVelocity = 0;
  let pitchVelocity = 0;
  let accumulated = 0;

  for (let index = 0; index < coreCount; index++) {
    const record = 6 + index * 5;
    const slot = index * 3;
    const x = samples[record] * 0.5 + 0.25 - size * 0.5;
    const y = samples[record + 1] * 0.5 + 0.25 - centerY;
    const z = (samples[record + 2] / 255 - 0.5) * size * 0.5;
    const inverseZoom = (focal - z) / focal;
    // Anchor each point to its source pixel from the neutral camera.
    home[slot] = x * inverseZoom;
    home[slot + 1] = y * inverseZoom;
    home[slot + 2] = z;

    const tone = (samples[record + 3] >> 4) / 15;
    const coverage = (samples[record + 3] & 15) / 15;
    const normal = samples[record + 4];
    inks[slot] = tone;
    const rim = 1 - edge[index] * .21 * (1 - coverage);
    inks[slot + 1] = (0.33 + 0.64 * tone) * coverage ** 0.8 * (compact ? 1.11 : 1) * rim;
    inks[slot + 2] = (0.16 + 0.26 * Math.sqrt(tone)) * (0.79 + 0.21 * coverage) * (compact ? 1.10 : 1);
    normals[index * 2] = ((normal >> 4) / 15 - 0.5) * 1.52;
    normals[index * 2 + 1] = ((normal & 15) / 15 - 0.5) * 1.52;
    springs[index] = 0.146 + 0.034 * coverage;
    damping[index] = 0.865 - 0.016 * coverage;
  }
  for (let index = coreCount; index < count; index++) {
    const { x, y, depth, tone, opacity, radius, flowX, flowY, mobility } = fringe[index - coreCount];
    const slot = index * 3;
    const inverseZoom = (focal - depth) / focal;
    home[slot] = (x - size * .5) * inverseZoom;
    home[slot + 1] = (y - centerY) * inverseZoom;
    home[slot + 2] = depth;
    // Negative tone reserves the atmospheric material in the same particle pass.
    inks[slot] = -.01 - .98 * tone;
    inks[slot + 1] = opacity;
    inks[slot + 2] = radius;
    // Direction spans ±2 units and mobility 0–1. The shader reads normalized bytes.
    flow[slot] = Math.round(flowX * FLOW_DIRECTION_SCALE);
    flow[slot + 1] = Math.round(flowY * FLOW_DIRECTION_SCALE);
    flow[slot + 2] = Math.round(mobility * 127);
    springs[index] = .099 + .035 * opacity;
    damping[index] = .889;
  }

  positions.set(home);
  targets.set(home);

  function updateCamera(wantedYaw: number, wantedPitch: number, ticks: number) {
    const moving = Math.abs(wantedYaw - yaw) + Math.abs(wantedPitch - pitch) +
      Math.abs(yawVelocity) + Math.abs(pitchVelocity) > 0.0003;
    if (moving) {
      for (let tick = 0; tick < ticks; tick++) {
        yawVelocity = (yawVelocity + (wantedYaw - yaw) * 0.116 * TICK) * CAMERA_DRAG;
        pitchVelocity = (pitchVelocity + (wantedPitch - pitch) * 0.116 * TICK) * CAMERA_DRAG;
        yaw += yawVelocity * TICK;
        pitch += pitchVelocity * TICK;
      }
    } else {
      yaw = wantedYaw;
      pitch = wantedPitch;
      yawVelocity = pitchVelocity = 0;
    }
    camera[0] = Math.cos(yaw);
    camera[1] = Math.sin(yaw);
    camera[2] = Math.cos(pitch);
    camera[3] = Math.sin(pitch);
    return moving;
  }

  function hitSurface(force: Disturbance) {
    const cursorX = (force.x - 0.5) * size;
    const cursorY = force.y * size - centerY;
    const cosYaw = camera[0];
    const sinYaw = camera[1];
    const cosPitch = camera[2];
    const sinPitch = camera[3];
    let nearest = size * size * 0.009;
    let hit = -1;

    // Find the observed surface sample closest to the camera ray through the pointer.
    for (let slot = 0; slot < coreCount * 3; slot += 3) {
      if (inks[slot + 1] < 0.15) continue;
      const x = home[slot];
      const y = home[slot + 1];
      const z = home[slot + 2];
      const horizontal = x * cosYaw + z * sinYaw;
      const yawDepth = z * cosYaw - x * sinYaw;
      const vertical = y * cosPitch - yawDepth * sinPitch;
      const viewDepth = y * sinPitch + yawDepth * cosPitch;
      const zoom = focal / (focal - viewDepth);
      const dx = horizontal * zoom - cursorX;
      const dy = vertical * zoom - cursorY;
      const distance = dx * dx + dy * dy;
      if (distance < nearest) {
        nearest = distance;
        hit = slot;
      }
    }
    return hit;
  }

  function targetRipple(force: Disturbance, hit: number) {
    const centerX = home[hit];
    const centerY = home[hit + 1];
    const centerZ = home[hit + 2];
    const pulse = force.pulse;
    const reach = size * (pulse === undefined ? 0.136 : 0.197);
    const waveRadius = pulse === undefined ? 0 : reach * pulse;
    const scale = force.strength * size;
    const rangeSquared = reach * reach;

    for (let slot = 0; slot < coreCount * 3; slot += 3) {
      const dx = home[slot] - centerX;
      const dy = home[slot + 1] - centerY;
      const dz = home[slot + 2] - centerZ;
      const distanceSquared = dx * dx + dy * dy + dz * dz;
      if (distanceSquared >= rangeSquared) continue;

      const distance = Math.sqrt(distanceSquared);
      let envelope = 1 - distance / reach;
      if (pulse !== undefined) envelope *= Math.max(0, 1 - Math.abs(distance - waveRadius) / (reach * 0.38));
      const index = slot / 3;
      const amount = scale * envelope * envelope * (.56 + .44 * edge[index]);
      const direction = amount * .031 / Math.max(distance, .01);
      const lift = amount * (pulse === undefined ? -.042 : .068);
      const n = index * 2;
      targets[slot] += dx * direction + lift * normals[n] * 0.65;
      targets[slot + 1] += dy * direction + lift * normals[n + 1] * 0.65;
      targets[slot + 2] += dz * direction + lift;
    }
  }

  function disturbFringe(force: Disturbance) {
    const cursorX = (force.x - .5) * size, cursorY = force.y * size - centerY;
    const reach = size * (force.pulse === undefined ? .19 : .225);
    const waveRadius = reach * (force.pulse ?? 0);
    const reachSquared = reach * reach;
    const [cosYaw, sinYaw, cosPitch, sinPitch] = camera;

    for (let slot = coreCount * 3; slot < home.length; slot += 3) {
      const x = home[slot], y = home[slot + 1], z = home[slot + 2];
      const yawDepth = z * cosYaw - x * sinYaw;
      const zoom = focal / (focal - y * sinPitch - yawDepth * cosPitch);
      const dx = (x * cosYaw + z * sinYaw) * zoom - cursorX;
      const dy = (y * cosPitch - yawDepth * sinPitch) * zoom - cursorY;
      const distanceSquared = dx * dx + dy * dy;
      if (distanceSquared >= reachSquared) continue;

      const distance = Math.sqrt(distanceSquared);
      let envelope = 1 - distanceSquared / reachSquared;
      if (force.pulse !== undefined) envelope *= Math.max(0, 1 - Math.abs(distance - waveRadius) / (reach * .45));
      const flowX = flow[slot] / FLOW_DIRECTION_SCALE, flowY = flow[slot + 1] / FLOW_DIRECTION_SCALE;
      const mobility = flow[slot + 2] / 127;
      const pressure = envelope * envelope * force.strength * (.31 + .81 * mobility);
      const curl = .12 + .11 * (force.vx * flowY - force.vy * flowX);
      const transport = size * .049;
      targets[slot] += (dx * .24 - dy * curl + force.vx * transport + flowX * .81) * pressure;
      targets[slot + 1] += (dy * .24 + dx * curl + force.vy * transport + flowY * .81) * pressure;
      const lift = force.pulse === undefined ? -.041 : .070;
      targets[slot + 2] += (lift + .018 * mobility * (dy / reach)) * size * pressure;
    }
  }

  return {
    size, count, positions, inks, normals, flow, camera, focal, centerY,
    reset() {
      positions.set(home);
      velocities.fill(0);
      accumulated = 0;
      yaw = FRONT_YAW;
      pitch = FRONT_PITCH;
      yawVelocity = pitchVelocity = 0;
      camera.set([1, 0, 1, 0]);
    },
    scatter() {
      for (let slot = 0; slot < home.length; slot += 3) {
        const index = slot / 3;
        const phase = ((index * 149) % 251) / 251;
        const mobility = flow[slot + 2] / 127;
        const spread = 1 + phase * .033;
        const drift = size * mobility * (.019 + .043 * phase);
        positions[slot] = home[slot] * spread + flow[slot] / FLOW_DIRECTION_SCALE * drift;
        positions[slot + 1] = home[slot + 1] * spread + flow[slot + 1] / FLOW_DIRECTION_SCALE * drift;
        positions[slot + 2] = home[slot + 2] - size * (.024 + .061 * phase) + drift * .32;
      }
    },
    advance(step: number, force: Disturbance | null) {
      accumulated = Math.min(2.5, accumulated + step);
      const ticks = Math.floor(accumulated / TICK);
      if (!ticks) return "waiting";
      accumulated -= ticks * TICK;

      const tilt = force?.tilt ?? 0;
      const dx = force ? Math.max(-1, Math.min(1, (force.x - 0.5) * 2)) : 0;
      const dy = force ? Math.max(-1, Math.min(1, (force.y - 0.5) * 2)) : 0;
      let moving = updateCamera(FRONT_YAW + dx * tilt * YAW_RANGE, FRONT_PITCH - dy * tilt * PITCH_RANGE, ticks);
      targets.set(home);
      if (force?.strength) {
        const hit = hitSurface(force);
        if (hit >= 0) targetRipple(force, hit);
        disturbFringe(force);
      }

      for (let index = 0; index < count; index++) {
        const spring = springs[index] * TICK;
        const drag = damping[index];
        for (let axis = 0; axis < 3; axis++) {
          const slot = index * 3 + axis;
          const target = targets[slot];
          let position = positions[slot];
          let velocity = velocities[slot];
          if (Math.abs(target - position) + Math.abs(velocity) < QUIET) {
            positions[slot] = target;
            velocities[slot] = 0;
            continue;
          }
          for (let tick = 0; tick < ticks; tick++) {
            velocity = (velocity + (target - position) * spring) * drag;
            position += velocity * TICK;
          }
          positions[slot] = position;
          velocities[slot] = velocity;
          moving = true;
        }
      }
      if (!moving) accumulated = 0;
      return moving ? "moving" : "settled";
    },
  };
}
