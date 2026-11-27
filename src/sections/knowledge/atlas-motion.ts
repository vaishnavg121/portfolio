import type { SceneFrame } from "./atlas-geometry";
import type { AtlasPosition } from "./atlas-model";

export const IMPULSE_DURATION = .94;
const SPEED = 139;
const REACH = 78;
const FALL = 3150;
const RING_WIDTH = 23;
const DECAY = 2.45;
const SINK = 4.8;
const CREST = 4.75;
const SIDE = 2.2;
const FIELD_DEPTH = 3.8;
const FIELD_RIM = 5.2;
const FIELD_SIDE = .031;

const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1,(value-a)/(b-a)));
  return t*t*(3-2*t);
};

export function createSurfacePointer() {
  const values = new Float32Array(4);
  let target: { x: number; y: number; pressure: number; radius: number } | null = null;
  let sampled = -Infinity;
  return {
    values,
    track(x: number, y: number, pressure: number, radius: number, now: number) {
      if (!target || values[2] < .02 || Math.hypot(x - values[0], y - values[1]) > radius * 2) {
        values[0] = x;
        values[1] = y;
        values[3] = radius;
      }
      target = { x, y, pressure: Math.max(0, Math.min(1, pressure)), radius };
      sampled = now;
    },
    release() { sampled = -Infinity; },
    reset() { target = null; values.fill(0); sampled = -Infinity; },
    advance(now: number, elapsed: number) {
      if (!target) return false;
      const dt = Math.max(0, Math.min(70, elapsed));
      const positionBlend = 1 - Math.exp(-dt / 25);
      values[0] += (target.x - values[0]) * positionBlend;
      values[1] += (target.y - values[1]) * positionBlend;
      values[3] += (target.radius - values[3]) * positionBlend;
      const desired = target.pressure * (1 - smooth(48, 180, now - sampled));
      const pressureBlend = 1 - Math.exp(-dt / (desired > values[2] ? 26 : 62));
      values[2] += (desired - values[2]) * pressureBlend;
      if (desired === 0 && values[2] < .008) {
        values[2] = 0;
        return false;
      }
      return true;
    },
  };
}

// Heightfield material coordinates are kept in sync for GPU geometry and DOM labels.
export function anchorRipple(point: AtlasPosition, frame: Pick<SceneFrame,"motion"|"impulses"|"pointerField">) {
  if(!frame.motion) return point;
  let { x, y, z } = point;
  const [px, py, pressure, radius] = frame.pointerField;
  if (pressure > 0 && radius > 0) {
    const dx = x - px, dy = y - py;
    const distance = (dx * dx + dy * dy) / (radius * radius);
    if (distance < 1) {
      const core = (1 - distance) ** 2;
      const ridge = distance * core;
      z += pressure * (ridge * FIELD_RIM - core * FIELD_DEPTH);
      x += dx * core * pressure * FIELD_SIDE;
      y += dy * core * pressure * FIELD_SIDE;
    }
  }
  for(let i=0;i<frame.impulses.length;i+=4) {
    const age=frame.impulses[i+2], strength=frame.impulses[i+3];
    if(strength<.006||age>=IMPULSE_DURATION)continue;
    const dx=x-frame.impulses[i],dy=y-frame.impulses[i+1];
    const square=dx*dx*.86+dy*dy*1.17;
    const reach=age*SPEED+REACH;
    if(square>reach*reach)continue;
    const radius=Math.sqrt(square);
    const cross=(radius-age*SPEED)/RING_WIDTH;
    const local=Math.exp(-square/FALL), wave=Math.exp(-cross*cross);
    const force=strength*Math.exp(-DECAY*age)*smooth(0,.055,age)*(1-smooth(.54,IMPULSE_DURATION,age));
    const side=local*force*SIDE/Math.max(radius,9);
    x+=dx*side;
    y+=dy*side;
    z+=force*(wave*CREST-local*SINK);
  }
  return {x,y,z};
}

export const terrainRippleGLSL = `
float ripple(inout vec3 p) {
  float light=0.0;
  if(uPointerField.z>0.0) {
    vec2 offset=p.xy-uPointerField.xy;
    float distance=dot(offset,offset)/(uPointerField.w*uPointerField.w);
    if(distance<1.0) {
      float core=(1.0-distance)*(1.0-distance);
      float ridge=distance*core;
      p.z+=uPointerField.z*(ridge*${FIELD_RIM}-core*${FIELD_DEPTH});
      p.xy+=offset*core*uPointerField.z*${FIELD_SIDE};
      light+=uPointerField.z*(ridge*.53+core*.07);
    }
  }
  for(int k=0;k<4;k++){
    vec4 impulse=uImpulses[k];
    float age=impulse.z;
    if(impulse.w<.006||age>=${IMPULSE_DURATION})continue;
    vec2 offset=p.xy-impulse.xy;
    float square=dot(offset*offset,vec2(.86,1.17));
    float reach=age*${SPEED}.0+${REACH}.0;
    if(square>reach*reach)continue;
    float radius=sqrt(square);
    float cross=(radius-age*${SPEED}.0)/${RING_WIDTH}.0;
    float local=exp(-square/${FALL}.0), wave=exp(-cross*cross);
    float force=impulse.w*exp(-${DECAY}*age)*smoothstep(0.0,.055,age)*(1.0-smoothstep(.54,${IMPULSE_DURATION},age));
    p.xy+=offset*(local*force*${SIDE}/max(radius,9.0));
    p.z+=force*(wave*${CREST}-local*${SINK});
    light+=(local*.22+wave*.51)*force;
  }
  return light;
}
`;
