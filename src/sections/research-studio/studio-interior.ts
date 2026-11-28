import {
  Box3, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, Vector3,
} from "three";
import { modelGroup, type StudioMaterials } from "./studio-model";
import { buildLounge, buildDesk } from "./studio-furniture";
import { studioPicture, studioScreen } from "./studio-interior-media";
import type { StudioObjectId } from "./studio-choreography";

export const studioObjectIds = ["lounge", "desk", "television", "artwork"] as const;

export function studioInterior(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, straight: boolean) {
  const room = modelGroup(parent);
  const wall = m.satin(m.night.clone().lerp(m.stone,.30),.88);
  const plaster = m.satin(m.stone.clone().lerp(m.ivory,.15).lerp(m.night,.23),.91);
  const oak = m.satin(m.stone.clone().lerp(m.night,.67),.65);
  const fabric = m.satin(m.mauve.clone().lerp(m.stone,.38).lerp(m.night,.21),.94);
  fabric.side = DoubleSide;
  const back = -3.39;

  // Deep window reveals and solid panels keep the original front cutaway open.
  room.box(wall,7.99,.30,back-.03,4.44,.55,.25,.036);
  room.box(plaster,7.98,2.77,back-.05,4.45,.58,.25,.038);
  for (const [x,width] of [[5.94,.43],[8.80,.18],[10.04,.29]]) {
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
  for (const x of [6.34,6.46,6.58,6.70,6.82,9.42,9.55,9.68,9.81,9.94]) {
    room.cylinder(m.metal,x,2.945,back+.29,.025,.083,10);
  }
  room.box(wall,10.14,.36,-2.01,.22,.63,2.65,.052);
  room.box(m.edge,10.14,.69,-2.01,.25,.058,2.67,.034);
  room.box(m.alloy,10.14,.33,-.65,.24,.57,.13,.055);

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
        const fold=Math.sin(u*32+v*.9+sign*.6) + .19*Math.cos(u*63-v*.8);
        const sway=Math.sin(time*.73+u*3.1+sign)*.033*v*v;
        const drape=(.88+v*.23)*w;
        position.setXYZ(i,(u-.5)*drape+sign*.20*v*v,1.17-v*2.34 + .045*v*Math.cos(u*24+sign), (.051+v*.031)*fold + sway);
      }
      position.needsUpdate = true;
      shape.computeVertexNormals();
    };
  };
  const curtains = [curtain(6.69,.56,-1),curtain(9.78,.58,1)];
  curtains.forEach(animate=>animate(0));

  const windowLight = new Mesh(new PlaneGeometry(7.8,5.4),new ShaderMaterial({
    uniforms:{ shade:{value:m.stone.clone().lerp(m.ivory,.65)} },
    vertexShader:"varying vec2 p; void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:`varying vec2 p; uniform vec3 shade; void main(){vec2 g=(p-vec2(.76-p.y*.31,.09))*vec2(2.35,1.15);
      gl_FragColor=vec4(shade,.21*max(0.,1.-length(g))*smoothstep(0.,.20,p.y)*(1.-smoothstep(.74,1.,p.y)));
      #include <colorspace_fragment>
    }`,
    transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,
  }));
  windowLight.rotation.x=-Math.PI/2;
  windowLight.position.set(6.36,.046,-.60);
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
  const loungeX = straight ? 8.48 : 8.23;
  const loungeZ = straight ? .47 : -.13;
  const lounge = buildLounge(parent,m,shadow,loungeX,loungeZ);
  const deskX = straight ? 8.45 : 7.05;
  const deskZ = straight ? 2.89 : 3.30;
  const desk = buildDesk(parent,m,shadow,deskX,deskZ);

  studioPicture(parent,m,new Vector3(-4.55,1.78,back+.15),1.57,1.14,"ridge");
  studioPicture(parent,m,new Vector3(-3.29,1.96,back+.15),.69,.84,"arcade");
  studioPicture(parent,m,new Vector3(-1.65,1.80,back+.12),.91,1.13,"ink");

  const bounds: Record<StudioObjectId, Box3> = {
    desk:new Box3(new Vector3(deskX-1.44,.12,deskZ-.62),new Vector3(deskX+1.5,2.03,deskZ+.98)),
    television:new Box3(new Vector3(7.12,.12,-3.17),new Vector3(9.48,1.97,-2.42)),
    lounge:new Box3(new Vector3(loungeX-1.64,.09,loungeZ-1.17),new Vector3(loungeX+1.38,1.29,loungeZ+1.18)),
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
