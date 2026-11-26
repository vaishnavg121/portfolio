const HOME_YAW = -0.112;
const HOME_PITCH = -0.058;
const TILT_LIMIT = 0.27;
const SPRING = 0.126;
const DRAG = 0.73;

export type Disturbance = {
  x: number;
  y: number;
  strength: number;
  tilt: number;
  pulse?: number;
};

export function createParticleField(data: ArrayBuffer) {
  // DP v2 stores a square grid followed by column, row, tone/alpha, depth.
  const samples = new Uint8Array(data);
  const size = samples[4];
  const count = (samples.length - 6) / 4;
  if (samples[0] !== 68 || samples[1] !== 80 || samples[2] !== 2 || samples[3] !== 0 ||
    !size || size !== samples[5] || !Number.isInteger(count) || count < 1) {
    throw new Error("Invalid portrait relief");
  }

  const home = new Float32Array(count * 3);
  const positions = new Float32Array(home.length);
  const velocity = new Float32Array(home.length);
  const inks = new Float32Array(home.length);
  const mobility = new Float32Array(count);
  const hitX = new Float32Array(count);
  const hitY = new Float32Array(count);
  const camera = new Float32Array(4);
  const centerY = size * 0.46;
  const focal = size * 1.64;
  const compact = size < 100;
  let yaw = HOME_YAW;
  let pitch = HOME_PITCH;
  let yawVelocity = 0;
  let pitchVelocity = 0;

  function updateCamera() {
    camera[0] = Math.cos(yaw);
    camera[1] = Math.sin(yaw);
    camera[2] = Math.cos(pitch);
    camera[3] = Math.sin(pitch);
  }
  updateCamera();

  for (let index = 0; index < count; index++) {
    const sample = 6 + index * 4;
    const slot = index * 3;
    const x = samples[sample] + 0.5 - size * 0.5;
    const y = samples[sample + 1] + 0.5 - centerY;
    const z = (samples[sample + 3] / 255 - 0.5) * size * 0.32;
    const tone = (samples[sample + 2] >> 4) / 15;
    const opacity = (samples[sample + 2] & 15) / 15;
    home[slot] = x;
    home[slot + 1] = y;
    home[slot + 2] = z;
    inks[slot] = tone;
    inks[slot + 1] = (0.32 + 0.64 * tone) * opacity ** 0.75 * (compact ? 1.10 : 1);
    inks[slot + 2] = (0.16 + 0.255 * Math.sqrt(tone)) * (0.78 + 0.22 * opacity) * (compact ? 1.14 : 1);

    const rotatedX = x * camera[0] + z * camera[1];
    const rotatedZ = z * camera[0] - x * camera[1];
    const rotatedY = y * camera[2] - rotatedZ * camera[3];
    const zoom = focal / (focal - (y * camera[3] + rotatedZ * camera[2]));
    hitX[index] = size * 0.5 + rotatedX * zoom;
    hitY[index] = centerY + rotatedY * zoom;
    mobility[index] = 0.45 + 0.55 * (((index * 97) % 127) / 127);
  }

  positions.set(home);
  const reach = size * 0.146;

  function updatePoint(slot: number, target: number, step: number, drag: number) {
    const delta = target - positions[slot];
    if (Math.abs(delta) + Math.abs(velocity[slot]) < 0.015) {
      positions[slot] = target;
      velocity[slot] = 0;
      return false;
    }
    velocity[slot] = (velocity[slot] + delta * SPRING * step) * drag;
    positions[slot] += velocity[slot] * step;
    return true;
  }

  return {
    size, count, positions, inks, camera, focal, centerY,
    reset() {
      positions.set(home);
      velocity.fill(0);
      yaw = HOME_YAW;
      pitch = HOME_PITCH;
      yawVelocity = pitchVelocity = 0;
      updateCamera();
    },
    scatter() {
      for (let index = 0; index < count; index++) {
        const slot = index * 3;
        const phase = ((index * 149) % 251) / 251;
        positions[slot] = home[slot] * (1 + 0.07 * phase);
        positions[slot + 1] = home[slot + 1] * (1 + 0.065 * phase);
        positions[slot + 2] = home[slot + 2] - size * 0.12 * phase;
      }
    },
    advance(step: number, force: Disturbance | null) {
      const tilt = force?.tilt ?? 0;
      const px = force ? Math.max(-1, Math.min(1, (force.x - 0.5) * 2)) : 0;
      const py = force ? Math.max(-1, Math.min(1, (force.y - 0.5) * 2)) : 0;
      const yawTarget = HOME_YAW + px * tilt * TILT_LIMIT;
      const pitchTarget = HOME_PITCH - py * tilt * TILT_LIMIT * 0.65;
      const yawDelta = yawTarget - yaw;
      const pitchDelta = pitchTarget - pitch;
      let moving = Math.abs(yawDelta) + Math.abs(pitchDelta) + Math.abs(yawVelocity) + Math.abs(pitchVelocity) > 0.00035;
      if (moving) {
        const damping = 0.76 ** step;
        yawVelocity = (yawVelocity + yawDelta * 0.085 * step) * damping;
        pitchVelocity = (pitchVelocity + pitchDelta * 0.085 * step) * damping;
        yaw += yawVelocity * step;
        pitch += pitchVelocity * step;
      } else {
        yaw = yawTarget;
        pitch = pitchTarget;
        yawVelocity = pitchVelocity = 0;
      }
      updateCamera();

      const drag = DRAG ** step;
      const centerX = (force?.x ?? -1) * size;
      const forceY = (force?.y ?? -1) * size;
      const strength = (force?.strength ?? 0) * size;
      const wave = force?.pulse;
      const range = wave === undefined ? reach : reach * (0.74 + wave * 0.63);

      for (let index = 0; index < count; index++) {
        const slot = index * 3;
        let x = home[slot];
        let y = home[slot + 1];
        let z = home[slot + 2];
        const dx = hitX[index] - centerX;
        const dy = hitY[index] - forceY;
        const distanceSquared = dx * dx + dy * dy;
        if (strength && distanceSquared < range * range) {
          const distance = Math.sqrt(distanceSquared);
          const falloff = 1 - distance / range;
          const forceAtPoint = strength * falloff * falloff * mobility[index];
          x += (distance > .001 ? dx / distance : 1) * forceAtPoint * 0.044;
          y += (distance > .001 ? dy / distance : 0) * forceAtPoint * 0.044;
          // Most grains recede. A thin band lifts as the intentional pulse spreads.
          const lift = wave === undefined ? (index % 5 === 0 ? 0.027 : -0.060)
            : 0.065 * Math.cos(Math.PI * (distance / range - wave * 0.73));
          z += forceAtPoint * lift;
        }

        if (updatePoint(slot, x, step, drag)) moving = true;
        if (updatePoint(slot + 1, y, step, drag)) moving = true;
        if (updatePoint(slot + 2, z, step, drag)) moving = true;
      }
      return moving;
    },
  };
}
