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

export function studioPicture(parent:Group,m:StudioMaterials,location:Vector3,width:number,height:number,weather:boolean) {
  const frame=modelGroup(parent);
  frame.box(m.rubber,location.x+.018,location.y-.025,location.z-.031,width+.045,height+.045,.05,.016);
  frame.box(m.edge,location.x,location.y,location.z,width+.05,height+.05,.052,.011);
  frame.build();
  const canvas=document.createElement("canvas");
  canvas.width=384;
  canvas.height=Math.round(384*height/width);
  const ctx=canvas.getContext("2d")!;
  const warm="#"+m.ivory.getHexString(), ink="#"+m.night.getHexString(), rose="#"+m.rose.getHexString(), h=canvas.height;
  const texture=new CanvasTexture(canvas);
  texture.colorSpace=SRGBColorSpace;
  ctx.fillStyle=warm;
  ctx.fillRect(0,0,384,h);
  if(weather) {
    ctx.fillStyle=ink;
    ctx.font="600 20px system-ui";
    ctx.fillText("AVIATION WEATHER",20,h-15);
    // Use the existing project illustration at print size through a compact derivative.
    const print=new Image();
    print.onload=()=>{
      if(!texture.source.data) return;
      ctx.drawImage(print,14,12,356,h-48);
      texture.needsUpdate=true;
    };
    texture.addEventListener("dispose",()=>{print.onload=null;});
    print.src="/images/research-studio/weather-print.webp";
  } else {
    ctx.fillStyle=ink;
    ctx.fillRect(13,13,358,h-26);
    ctx.lineWidth=2.2;
    const orbital = width > .8;
    for(let i=0;i<11;i++){
      ctx.strokeStyle=i%3===0?warm:rose;
      ctx.globalAlpha=.5+i*.037;
      ctx.beginPath();
      for(let j=0;j<=100;j++){
        const t=j/100*Math.PI*2;
        const radius=74+i*9+(orbital ? Math.sin(t*2+i*.18)*16 : Math.sin(t*3+i*.20)*15+Math.cos(t*5)*6);
        const x=192+radius*Math.cos(t), y=h*.53+radius*Math.sin(orbital ? t+i*.026 : t)*.78;
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
  }
  const mesh=new Mesh(new PlaneGeometry(width-.045,height-.045),new MeshBasicMaterial({map:texture}));
  mesh.position.copy(location).add(new Vector3(0,0,.029));
  parent.add(mesh);
}
