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

const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1,(value-a)/(b-a)));
  return t*t*(3-2*t);
};

// Heightfield material coordinates are kept in sync for GPU geometry and DOM labels.
export function anchorRipple(point: AtlasPosition, frame: Pick<SceneFrame,"motion"|"impulses">) {
  if(!frame.motion) return point;
  let { x, y, z } = point;
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
