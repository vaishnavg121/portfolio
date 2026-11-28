import {
  CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, ShaderMaterial, SRGBColorSpace, Vector3,
} from "three";
import { modelGroup, type StudioMaterials } from "./studio-model";

export function studioScreen(parent:Group,m:StudioMaterials,location:Vector3,width:number,height:number) {
  const bezel=modelGroup(parent);
  bezel.box(m.rubber,location.x,location.y,location.z,width+.08,height+.078,.082,.025);
  bezel.box(m.edge,location.x+width*.37,location.y-height*.5-.022,location.z+.04,.039,.007,.012,.002);
  bezel.build();
  const picture=new ShaderMaterial({
    uniforms:{
      time:{value:0}, channel:{value:0}, gain:{value:.85},
      dark:{value:m.night.clone().multiplyScalar(.61)}, mauve:{value:m.mauve}, rose:{value:m.rose}, cream:{value:m.ivory},
    },
    vertexShader:"varying vec2 p;void main(){p=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:`
      varying vec2 p;
      uniform float time,channel,gain;
      uniform vec3 dark,mauve,rose,cream;
      void main() {
        vec3 ink;
        if(channel<.5) {
          vec2 uv=floor(p*vec2(120.,68.))/vec2(120.,68.);
          vec2 r=(uv-vec2(.66,.67))*vec2(1.77,1.);
          float sun=1.-smoothstep(.13,.144,length(r));
          float ridge=.32+.10*sin(uv.x*7.+.8)+.09*sin(uv.x*13.)+.035*cos(uv.x*36.);
          float bank=.21+.046*cos(uv.x*15.+time*.12)+.07*cos(uv.x*6.);
          ink=mix(dark,mauve,.23+uv.y*.28)+rose*exp(-length(r)*4.)*.23+cream*sun*.70;
          if(uv.y<ridge) ink=mix(dark,mauve,.35+uv.y*.28);
          if(uv.y<bank) ink=mix(dark,mauve,.12+uv.y*.18);
          float water=pow(.5+.5*sin(uv.y*135.+uv.x*37.+time*.65),8.);
          ink+=cream*water*.13*exp(-abs(uv.x-.65)*5.)*step(uv.y,.16);
        } else {
          vec2 r=(p-vec2(.5,.54))*vec2(1.77,1.);
          float sweep=length(r)+.055*sin(atan(r.y,r.x)*3.+time*.45);
          float lines=pow(.5+.5*cos(sweep*52.-time*.48),12.);
          float beam=1.-smoothstep(.09,.45,abs(p.x-p.y*.6-.28));
          ink=mix(dark,mauve,.23+beam*.34)+mix(rose,cream,beam)*lines*.26;
          ink+=cream*(1.-smoothstep(.151,.163,length(r-vec2(.16,.027))))*.46;
        }
        ink*=gain*(.84+.16*sin(p.y*3.));
        gl_FragColor=vec4(ink,1.);
        #include <colorspace_fragment>
      }`,
  });
  const pane=new Mesh(new PlaneGeometry(width,height),picture);
  pane.position.copy(location).add(new Vector3(0,0,.043));
  parent.add(pane);
  return (time:number,channel:number,active:boolean)=>{
    picture.uniforms.time.value=time;
    picture.uniforms.channel.value=channel;
    picture.uniforms.gain.value=active ? 1.10 : .89;
  };
}

export function studioPicture(parent:Group,m:StudioMaterials,location:Vector3,width:number,height:number,art:"ridge"|"arcade"|"ink") {
  const frame=modelGroup(parent);
  frame.box(m.rubber,location.x+.018,location.y-.025,location.z-.031,width+.045,height+.045,.05,.016);
  frame.box(m.edge,location.x,location.y,location.z,width+.05,height+.05,.052,.011);
  frame.build();
  const canvas=document.createElement("canvas");
  canvas.width=384;
  canvas.height=Math.round(384*height/width);
  const ctx=canvas.getContext("2d")!;
  const warm="#"+m.ivory.getHexString(), ink="#"+m.night.getHexString(), h=canvas.height;
  const texture=new CanvasTexture(canvas);
  texture.colorSpace=SRGBColorSpace;
  ctx.fillStyle=warm;
  ctx.fillRect(0,0,384,h);
  const tint=(a:typeof m.stone,b:typeof m.stone,mix:number)=>"#"+a.clone().lerp(b,mix).getHexString();
  ctx.save();
  ctx.beginPath();
  ctx.rect(13,13,358,h-26);
  ctx.clip();
  if(art==="ridge") {
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,tint(m.stone,m.mauve,.42));
    sky.addColorStop(.82,tint(m.ivory,m.rose,.25));
    ctx.fillStyle=sky;
    ctx.fillRect(0,0,384,h);
    ctx.fillStyle=warm;
    ctx.beginPath();
    ctx.arc(238,h*.30,40,0,Math.PI*2);
    ctx.fill();
    for(let layer=0;layer<5;layer++){
      ctx.fillStyle=tint(m.rose,m.night,.21+layer*.14);
      ctx.beginPath();
      for(let x=0;x<=388;x+=4){
        const u=x/384;
        ctx.lineTo(x,h*(.49+layer*.083 + .07*Math.sin(u*7+layer*1.4) + .039*Math.sin(u*17+layer*.78) + .012*Math.sin(u*52+layer)));
      }
      ctx.lineTo(388,h);
      ctx.lineTo(0,h);
      ctx.closePath();
      ctx.fill();
    }
  } else if(art==="arcade") {
    ctx.fillStyle=tint(m.night,m.stone,.52);
    ctx.fillRect(0,0,384,h);
    for(let i=0;i<5;i++){
      const radius=141-i*22, center=160+i*16, top=h*.43+i*7;
      ctx.fillStyle=tint(i%2?m.mauve:m.stone,m.ivory,i*.14);
      ctx.beginPath();
      ctx.moveTo(center-radius,h);
      ctx.lineTo(center-radius,top);
      ctx.arc(center,top,radius,Math.PI,Math.PI*2);
      ctx.lineTo(center+radius,h);
      ctx.fill();
    }
  } else {
    ctx.fillStyle=tint(m.ivory,m.stone,.29);
    ctx.fillRect(0,0,384,h);
    ctx.lineCap="round";
    for(let i=0;i<36;i++){
      ctx.strokeStyle=i%7===0?tint(m.stone,m.rose,.4):ink;
      ctx.lineWidth=i%7===0?2.5:.95;
      ctx.globalAlpha=.25+(i%5)*.087;
      ctx.beginPath();
      for(let x=25;x<=360;x+=4){
        const u=(x-25)/335;
        ctx.lineTo(x,h*.40 + i*3.1 + Math.sin(u*7+i*.052)*h*.15 + Math.sin(u*17+i*.13)*h*.036);
      }
      ctx.stroke();
    }
  }
  ctx.fillStyle=ink;
  ctx.globalAlpha=.10;
  for(let i=0;i<4100;i++) ctx.fillRect((i*193.37)%384,(i*89.13)%h,i%7===0?1.4:.65,.72);
  ctx.restore();
  const mesh=new Mesh(new PlaneGeometry(width-.045,height-.045),new MeshBasicMaterial({map:texture}));
  mesh.position.copy(location).add(new Vector3(0,0,.029));
  parent.add(mesh);
}
