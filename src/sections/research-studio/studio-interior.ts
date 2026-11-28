import {
  Box3, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, Vector3,
} from "three";
import { modelGroup, placeShadow, type StudioMaterials } from "./studio-model";
import { buildLounge, buildDesk } from "./studio-furniture";
import { studioPicture, studioScreen } from "./studio-interior-media";
import type { StudioObjectId } from "./studio-choreography";

export const studioObjectIds = ["lounge", "desk", "television", "artwork"] as const;

export function studioInterior(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, straightWing: boolean) {
  const room = modelGroup(parent);
  const wall = m.satin(m.night.clone().lerp(m.stone,.30),.88);
  const plaster = m.satin(m.stone.clone().lerp(m.ivory,.15).lerp(m.night,.23),.91);
  const oak = m.satin(m.stone.clone().lerp(m.night,.67),.65);
  const boards = [.175,.205,.235,.217].map(tone => m.satin(m.night.clone().lerp(m.stone,tone).lerp(m.rose,.042),.74));
  const fabric = m.satin(m.mauve.clone().lerp(m.stone,.35).lerp(m.night,.27),1);
  fabric.side = DoubleSide;
  const front = straightWing ? 3.62 : 4.54;
  const center = (front - 3.62) * .5;
  const depth = front + 3.62;
  const wingWidth = 4.35;
  const wingX = 8.155;
  const back = -3.39;
  placeShadow(parent,shadow,new Vector3(7.65,-.77,center),8.5,depth+3.1);
  room.box(m.rubber,wingX,-.66,center,wingWidth-.06,.20,depth-.25,.08);
  room.box(m.alloy,wingX,-.50,center,wingWidth,.17,depth-.12,.07);
  room.box(m.edge,wingX,-.414,center,wingWidth,.050,depth-.10,.022);
  room.box(m.ceramic,wingX,-.24,center,wingWidth,.32,depth,.12);
  room.box(oak,wingX,-.058,center,wingWidth-.04,.13,depth-.10,.045);
  for (let i=0;i<10;i++) {
    const z = -3.62 + (i + .5)*depth/10;
    const shift = i%3 * .35;
    room.box(boards[i%4],6.92+shift*.5,.024,z,1.79+shift,.045,depth/10-.026,.018);
    room.box(boards[(i+2)%4],9.08+shift*.5,.024,z,2.45-shift,.045,depth/10-.026,.018);
  }
  room.box(m.metal,6.035,.043,0,.10,.018,7.03,.012);

  // Deep window reveals and solid panels keep the original front cutaway open.
  room.box(wall,8.11,.32,back,4.36,.60,.29,.035);
  room.box(plaster,8.11,3.19,back,4.36,.41,.31,.036);
  for (const [x,width] of [[6.32,.70],[8.81,.22],[10.06,.55]]) {
    room.box(wall,x,1.80,back,width,2.64,.29,.027);
    room.box(m.metal,x+width*.5-.03,1.81,back+.17,.052,2.72,.10,.018);
  }
  room.box(m.smoke,7.70,1.83,back-.055,2.08,2.32,.08,.020);
  room.box(m.smoke,9.35,1.83,back-.055,.87,2.32,.08,.020);
  room.box(plaster,8.27,.64,back+.13,3.63,.090,.52,.025);
  room.box(m.edge,8.15,2.98,back+.21,3.65,.052,.068,.022);
  room.box(m.lamp,8.12,2.969,back+.12,3.47,.024,.075,.008);
  room.box(m.metal,7.7,1.84,back+.015,.055,2.32,.08,.008);
  room.box(m.metal,8.26,1.88,back+.02,3.60,.055,.08,.008);
  room.box(plaster,10.25,.42,-2.01,.22,.74,2.65,.043);
  room.box(m.edge,10.25,.82,-2.01,.26,.088,2.67,.034);

  for (const [x,width] of [[-4.24,2.60],[-1.42,2.58],[1.41,2.51],[4.24,2.58]]) {
    room.box(wall,x,.30,back-.06,width,.55,.25,.033);
    room.box(plaster,x,2.77,back-.05,width,.58,.25,.038);
    room.box(m.metal,x,.56,back+.095,width,.036,.08,.013);
  }
  room.box(wall,-4.28,1.59,back-.043,2.63,2.18,.29,.029);
  room.box(wall,-1.56,1.51,back-.05,1.42,1.92,.27,.032);
  room.box(m.lamp,-2.82,2.48,back+.087,5.22,.026,.055,.01);
  room.build();

  const curtain = (x:number, w:number, sign:number) => {
    const shape = new PlaneGeometry(w,2.34,24,17);
    const position = shape.attributes.position;
    const material = new Mesh(shape,fabric);
    material.position.set(x,1.79,back+.29);
    parent.add(material);
    return (time:number) => {
      for(let i=0;i<position.count;i++){
        const u=(i%25)/24, v=Math.floor(i/25)/17;
        const fold=Math.sin(u*30+v*.9+sign*.6);
        const sway=Math.sin(time*.73+u*3.1+sign)*.036*v*v;
        position.setXYZ(i,(u-.5)*w+sign*.24*v*v,1.17-v*2.34 + .039*v*Math.cos(u*21), (.08+v*.044)*fold + sway);
      }
      position.needsUpdate = true;
      shape.computeVertexNormals();
    };
  };
  const curtains = [curtain(6.69,.56,-1),curtain(9.78,.58,1)];
  curtains.forEach(animate=>animate(0));

  const windowLight = new Mesh(new PlaneGeometry(3.75,4.2),new ShaderMaterial({
    uniforms:{ shade:{value:m.stone.clone().lerp(m.ivory,.65)} },
    vertexShader:"varying vec2 p; void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:`varying vec2 p; uniform vec3 shade; void main(){vec2 g=(p-vec2(.5,.10))*vec2(2.1,1.15);
      gl_FragColor=vec4(shade,.30*max(0.,1.-length(g))*smoothstep(0.,.16,p.y));
      #include <colorspace_fragment>
    }`,
    transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,
  }));
  windowLight.rotation.x=-Math.PI/2;
  windowLight.position.set(8.12,.049,-1.12);
  parent.add(windowLight);

  const television = new Group();
  television.position.set(8.29,0,-2.79);
  parent.add(television);
  const console = modelGroup(television);
  console.box(oak,0,.30,-.06,2.39,.48,.66,.065);
  console.box(plaster,0,.57,-.055,2.45,.083,.67,.028);
  console.box(wall,0,.31,.28,2.18,.285,.034,.030);
  for (const x of [-.82,0,.82]) {
    console.box(m.edge,x,.34,.31,.24,.021,.024,.008);
    console.box(m.rubber,x,.10,-.04,.18,.11,.39,.025);
  }
  console.box(m.rubber,0,.66,.01,.63,.035,.32,.016);
  console.box(m.metal,0,.82,-.11,.11,.31,.16,.025);
  console.build();
  const tv = studioScreen(television,m,new Vector3(0,1.29,.005),2.26,1.28);
  const loungeZ = straightWing ? .04 : .31;
  const lounge = buildLounge(parent,m,shadow,8.53,loungeZ);
  const deskZ = straightWing ? 2.11 : 3.15;
  const desk = buildDesk(parent,m,shadow,8.16,deskZ);

  studioPicture(parent,m,new Vector3(-4.53,1.74,back+.15),1.52,1.17,true);
  studioPicture(parent,m,new Vector3(-3.22,1.92,back+.15),.77,.89,false);
  studioPicture(parent,m,new Vector3(-1.65,1.81,back+.12),.93,1.08,false);

  const bounds: Record<StudioObjectId, Box3> = {
    desk:new Box3(new Vector3(6.72,.12,deskZ-.66),new Vector3(9.66,2.03,deskZ+.93)),
    television:new Box3(new Vector3(7.12,.12,-3.17),new Vector3(9.48,1.97,-2.42)),
    lounge:new Box3(new Vector3(6.69,.09,loungeZ-1.13),new Vector3(9.91,1.28,loungeZ+.84)),
    artwork:new Box3(new Vector3(-5.40,1.10,back+.07),new Vector3(-2.80,2.52,back+.19)),
  };
  const centers = Object.fromEntries(studioObjectIds.map(id=>[id,bounds[id].getCenter(new Vector3())])) as Record<StudioObjectId,Vector3>;
  let lastCurtain = -1;
  return {
    bounds, centers,
    animate(time:number, selected:StudioObjectId | null, hovered:StudioObjectId | null, channel:number, lean:number) {
      const tick = Math.floor(time*12);
      if(tick!==lastCurtain) {
        curtains.forEach(animate=>animate(time));
        lastCurtain=tick;
      }
      tv(time,channel,selected==="television" || hovered==="television");
      desk(time,selected==="desk" || hovered==="desk",lean);
      lounge(time,selected==="lounge");
    },
  };
}
