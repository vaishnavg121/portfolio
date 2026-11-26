import { landmarkPositions, lens, screenPoint, territoryIndex, visibleSkills, type AtlasRenderer } from "./atlas-geometry";
import { connectedSkillPose, visibleProjects } from "./atlas-connections";
import { createAtlasStreams, STREAM_STRIDE } from "./atlas-streams";
import { readAtlasPalette } from "./atlas-palette";
import { createTerrainTiles, FOG_FAR, FOG_NEAR, makeAtlasMarkers, terrainCenter } from "./atlas-terrain";

const vertex = `
precision highp float;
attribute vec3 aPosition;
attribute vec4 aStyle;
attribute float aPhase;
uniform vec3 uCam;
uniform vec4 uFrame, uMotion, uSkill, uLens;
uniform float uHover;
uniform vec2 uGround;
uniform vec3 uShadow, uMuted, uLight, uAccent, uPetal, uStone;
uniform vec4 uImpulses[4], uPeaks[8];
varying mediump vec4 vColor;
varying mediump float vKind;
void main() {
  vec3 p=aPosition;
  int id=int(max(0.0,aStyle.x));
  float kind=aStyle.w, phase=aPhase, ink=aStyle.y, size=aStyle.z, time=uMotion.x;
  vec4 peak=uPeaks[id];
  float expand=peak.w, aura=0.0, tonal=0.0, fog=1.0;
  bool hovered=abs(float(id)-uMotion.w)<.2;
  bool selected=abs(float(id)-uMotion.z)<.2;
  if(kind<.5) {
    float groundDistance=length(p.xy-uGround);
    if(groundDistance>${FOG_FAR}.0) {
      gl_Position=vec4(2.0,2.0,0.0,1.0);
      gl_PointSize=1.0;
      vColor=vec4(0.0);
      vKind=0.0;
      return;
    }
    fog=1.0-smoothstep(${FOG_NEAR}.0,${FOG_FAR}.0,groundDistance);
    vec2 around=p.xy-peak.xy;
    float response=exp(-dot(around,around)/18800.0);
    p.z+=expand*response*5.0;
    aura+=response*(expand*.16+(hovered?.19*uHover:0.0));
    if(uMotion.z>=0.0) ink*=.70+.30*expand;
    if(time>=0.0) {
      tonal=sin(p.x*.013+p.y*.017-time*.81)*.064;
      p.z+=sin(p.x*.012+p.y*.017-time*.79)*.96+sin(p.y*.022+time*.53)*.54;
      for(int k=0;k<4;k++) {
        vec4 impulse=uImpulses[k];
        if(impulse.w<.006||impulse.z>=.86) continue;
        vec2 d=p.xy-impulse.xy;
        float distanceSquared=dot(d,d), t=impulse.z;
        float reach=t*102.0+69.0;
        if(distanceSquared>reach*reach)continue;
        float radius=sqrt(distanceSquared);
        float ring=(radius-t*102.0)/24.0, local=exp(-distanceSquared/3300.0), wave=exp(-ring*ring);
        float envelope=smoothstep(0.0,.065,t)*(1.0-smoothstep(.52,.86,t));
        float force=impulse.w*exp(-3.0*t)*envelope;
        p.z+=force*(local*(-4.6)+wave*2.7);
        p.xy+=d/max(radius,9.0)*local*force*1.6;
        aura+=(local*.17+wave*.23)*force;
      }
    }
    ink*=mix(.54,1.0,smoothstep(0.0,1.0,uMotion.y));
  } else if(kind<1.5) {
    aura=selected?.42:(hovered?.37*uHover:0.0);
    if(uMotion.z>=0.0 && !selected) ink*=.55;
    if(phase<.5) size+=aura*11.0;
  } else if(kind<2.5) {
    p=mix(peak.xyz,p,expand);
    ink*=smoothstep(.18,.8,expand);
    aura=exp(-length((p-uSkill.xyz)*vec3(.83,.83,.48))*.075)*.34*expand;
  }
  float x=p.x*uLens.z-p.y*uLens.w, y=p.x*uLens.w+p.y*uLens.z;
  float distanceToCamera=uCam.z-y*uLens.x-p.z*uLens.y;
  float magnification=uCam.z/max(uCam.z*.22,distanceToCamera);
  vec2 clip=(vec2(x,y*uLens.y-p.z*uLens.x)*magnification*uFrame.z+uCam.xy)*vec2(1.0,uFrame.w)*2.0/uFrame.xy;
  gl_Position=vec4(clip.x,-clip.y,0.0,1.0);
  float edge=(1.0-smoothstep(.70,1.0,abs(clip.x)))*(1.0-smoothstep(.69,1.0,abs(clip.y)));
  float zoomSize=clamp(pow(max(uFrame.z,.15),.29),.76,1.32);
  gl_PointSize=max(1.0,size*uSkill.w*(kind<.5?clamp(magnification,.62,1.48)*zoomSize:1.0));
  vec3 color;
  if(kind<.5) {
    float relief=smoothstep(-27.0,133.0,aPosition.z);
    float shade=clamp(-kind,0.0,1.0);
    float light=clamp(.34+shade*.42+relief*.24+phase*.10+tonal,0.0,1.0);
    vec3 mineral=mix(uStone,uPetal,smoothstep(.10,.84,fract(aStyle.x)));
    vec3 surface=mix(uMuted,mineral,.66+relief*.19);
    surface=mix(surface,uLight,relief*shade*.48+phase*.12);
    color=mix(uShadow,surface,light);
    color=mix(color,uPetal,aura*.43);
    ink*=.70+.46*shade;
    ink+=aura*.29;
  } else {
    color=mix(uAccent,mix(uPetal,uLight,.78),phase*.94);
    ink+=aura*(kind<1.5?.46:.73);
  }
  vColor=vec4(color,clamp(ink*fog*edge*smoothstep(uCam.z*.20,uCam.z*.39,distanceToCamera),0.0,1.0));
  vKind=kind;
}
`;
const fragment = `
precision mediump float;
varying vec4 vColor;
varying float vKind;
void main() {
  vec2 fromCenter=abs(gl_PointCoord-.5);
  float radius=vKind>3.5?fromCenter.x+fromCenter.y:length(fromCenter);
  float alpha=1.0-smoothstep(vKind>.5?.12:.16,.51,radius);
  if(alpha*vColor.a<.018) discard;
  gl_FragColor=vec4(vColor.rgb,vColor.a*alpha);
}
`;

const streamVertex = `
attribute vec2 aPixels;
attribute vec4 aFlow;
attribute vec3 aState;
uniform mediump vec2 uSize;
varying mediump vec4 vFlow;
varying mediump vec3 vState;
varying mediump vec2 vClip;
void main() {
  vClip=aPixels/uSize*2.0-1.0;
  gl_Position=vec4(vClip.x,-vClip.y,0.0,1.0);
  vFlow=aFlow;
  vState=aState;
}
`;

const streamFragment = `
precision mediump float;
uniform vec3 uAccent, uLight, uPetal;
uniform vec3 uPointer;
uniform mediump vec2 uSize;
uniform float uTime;
varying vec4 vFlow;
varying vec3 vState;
varying vec2 vClip;
void main() {
  float t=vFlow.y;
  float reveal=1.0-smoothstep(vState.z-.040,vState.z+.016,t);
  if(reveal<.01)discard;
  float edge=(1.0-smoothstep(.82,1.0,abs(vClip.x)))*(1.0-smoothstep(.82,1.0,abs(vClip.y)));
  float shoulder=sin(t*3.14159);
  float reach=clamp(1.0-length((vClip-uPointer.xy)*uSize*.5)/136.0,0.0,1.0);
  float nearby=reach*reach*uPointer.z;
  float pulse=0.0;
  if(uTime>=0.0&&vState.y>.01) {
    float phase=fract(uTime/max(2.6,vFlow.z/56.0)+vState.x);
    float center=1.0-abs(2.0*phase-1.0);
    float span=(t-center)*vFlow.z/28.0;
    pulse=exp(-span*span)*smoothstep(.02,.12,center)*(1.0-smoothstep(.84,.98,center))*vState.y;
  }
  float core=1.0-smoothstep(.095,.38,abs(vFlow.x));
  float glow=exp(-vFlow.x*vFlow.x*6.0)*(1.0-smoothstep(.77,1.0,abs(vFlow.x)));
  float front=(t-vState.z+.035)*18.0;
  float leading=exp(-front*front)*(1.0-step(1.0,vState.z));
  float alpha=edge*reveal*(core*(vFlow.w*(.64+.36*shoulder+nearby*.24+leading*.40)+pulse*.39)+glow*(vFlow.w*.13+pulse*.14));
  if(alpha<.007)discard;
  vec3 tint=mix(uAccent,uPetal,.20+.66*shoulder);
  vec3 color=mix(tint,uLight,clamp(core*(.21+nearby*.11+pulse*.65+leading*.18),0.0,.85));
  gl_FragColor=vec4(color,alpha);
}
`;

function compile(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const program=gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]] as const) {
    const shader=gl.createShader(type);
    if(!shader) { gl.deleteProgram(program);return null; }
    gl.shaderSource(shader,source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      gl.deleteProgram(program);
      return null;
    }
    gl.attachShader(program,shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (gl.getProgramParameter(program,gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

export function makeWebGLAtlas(canvas:HTMLCanvasElement,compact:boolean):AtlasRenderer|null {
  const gl=canvas.getContext("webgl",{alpha:true,depth:false,antialias:false,premultipliedAlpha:true,powerPreference:"low-power"});
  if(!gl) return null;
  const program=compile(gl,vertex,fragment);
  const streamProgram=compile(gl,streamVertex,streamFragment);
  if(!program||!streamProgram) {
    if(program)gl.deleteProgram(program);
    if(streamProgram)gl.deleteProgram(streamProgram);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return null;
  }
  const terrain = createTerrainTiles(!compact);
  const markerData = makeAtlasMarkers();
  const palette = readAtlasPalette(canvas);
  const field=gl.createBuffer()!,markers=gl.createBuffer()!,streamBuffer=gl.createBuffer()!,contextPins=gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER,markers);
  gl.bufferData(gl.ARRAY_BUFFER,markerData,gl.STATIC_DRAW);
  let currentField: ReturnType<typeof terrain> | undefined;
  const streams=createAtlasStreams();
  const pins=new Float32Array(32*8);
  gl.bindBuffer(gl.ARRAY_BUFFER,streamBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,streams.data.byteLength,gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,contextPins);
  gl.bufferData(gl.ARRAY_BUFFER,pins.byteLength,gl.DYNAMIC_DRAW);
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0,0,0,0);
  const attribs = [["aPosition",3,0],["aStyle",4,12],["aPhase",1,28]] as const;
  const attrs=attribs.map(([name,size,offset])=>({index:gl.getAttribLocation(program,name),size,offset}));

  const streamAttribs = [["aPixels",2,0],["aFlow",4,8],["aState",3,24]] as const;
  const streamAttrs=streamAttribs.map(([name,size,offset])=>({index:gl.getAttribLocation(streamProgram,name),size,offset}));
  const streamUniforms=["uSize","uAccent","uLight","uPetal","uTime","uPointer"] as const;
  const stream=Object.fromEntries(streamUniforms.map(name=>[name,gl.getUniformLocation(streamProgram,name)]));
  const names=["uCam","uFrame","uMotion","uSkill","uLens","uHover","uGround","uShadow","uMuted","uLight","uAccent","uPetal","uStone","uImpulses[0]","uPeaks[0]"] as const;
  const u=Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.uniform4f(u.uLens,lens.COS,lens.SIN,lens.CY,lens.SY);
  const peaks=new Float32Array(32);
  gl.uniform3fv(u.uShadow,palette.shadow.rgb);
  gl.uniform3fv(u.uMuted,palette.muted.rgb);
  gl.uniform3fv(u.uLight,palette.light.rgb);
  gl.uniform3fv(u.uAccent,palette.accent.rgb);
  gl.uniform3fv(u.uPetal,palette.petal.rgb);
  gl.uniform3fv(u.uStone,palette.stone.rgb);
  gl.useProgram(streamProgram);
  gl.uniform3fv(stream.uAccent,palette.accent.rgb);
  gl.uniform3fv(stream.uLight,palette.light.rgb);
  gl.uniform3fv(stream.uPetal,palette.petal.rgb);
  const markerCount=markerData.length / 8;
  landmarkPositions.forEach((p,i)=>peaks.set([p.x,p.y,p.z,0],i*4));
  const draw=(buffer:WebGLBuffer,count:number)=>{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    for (const {index,size,offset} of attrs) {
      gl.enableVertexAttribArray(index);
      gl.vertexAttribPointer(index,size,gl.FLOAT,false,32,offset);
    }
    gl.drawArrays(gl.POINTS,0,count);
  };
  let lastCount=0;
  return {
    draw(frame) {
      const deviceRatio=Math.min(window.devicePixelRatio||1,compact?1.25:1.55);
      const dpr=deviceRatio*(frame.quality<.57 ? .78 : frame.quality<.8 ? .89 : 1);
      const w=Math.max(1,Math.round(frame.width*dpr)),h=Math.max(1,Math.round(frame.height*dpr));
      if (canvas.width!==w||canvas.height!==h) { canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h); }
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      const active=territoryIndex(frame.selection);
      gl.uniform3f(u.uCam,frame.camera.x,frame.camera.y,frame.perspective);
      gl.uniform4f(u.uFrame,frame.width,frame.height,frame.camera.z,frame.stretch);
      gl.uniform4f(u.uMotion,frame.motion?frame.time:-1,frame.progress,active,frame.hover);
      gl.uniform1f(u.uHover,frame.hoverStrength);
      const s=frame.activeSkill;
      gl.uniform4f(u.uSkill,s?.x??99999,s?.y??99999,s?.z??0,dpr);
      gl.uniform4fv(u["uImpulses[0]"],frame.impulses);
      for (let i=0;i<landmarkPositions.length;i++) peaks[i*4+3]=frame.expansion[i];
      gl.uniform4fv(u["uPeaks[0]"],peaks);
      const center=terrainCenter(frame);
      gl.uniform2f(u.uGround,center.x,center.y);
      const nextField=terrain(center.x,center.y);
      if(nextField!==currentField) {
        currentField=nextField;
        gl.bindBuffer(gl.ARRAY_BUFFER,field);
        gl.bufferData(gl.ARRAY_BUFFER,nextField,gl.STATIC_DRAW);
        canvas.dataset.particles=String(nextField.length/8);
      }
      const visibleCount=Math.floor(nextField.length/8*frame.quality);
      if(visibleCount!==lastCount){canvas.dataset.drawnParticles=String(visibleCount);lastCount=visibleCount;}
      draw(field,visibleCount);
      const paths=streams.update(frame);
      if(paths.count) {
        gl.useProgram(streamProgram);
        gl.uniform2f(stream.uSize,frame.width,frame.height);
        gl.uniform1f(stream.uTime,frame.motion?frame.time:-1);
        let impulse=-1, age=.78;
        for(let i=0;i<frame.impulses.length;i+=4) {
          if(frame.impulses[i+2]<age) { impulse=i;age=frame.impulses[i+2]; }
        }
        if(impulse>=0&&frame.motion) {
          const p=screenPoint({x:frame.impulses[impulse],y:frame.impulses[impulse+1],z:18},frame);
          gl.uniform3f(stream.uPointer,p.x/frame.width*2-1,p.y/frame.height*2-1,1-age/.78);
        } else gl.uniform3f(stream.uPointer,0,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,streamBuffer);
        if(paths.changed)gl.bufferSubData(gl.ARRAY_BUFFER,0,streams.data.subarray(0,paths.count*STREAM_STRIDE));
        for (const {index,size,offset} of streamAttrs) {
          gl.enableVertexAttribArray(index);
          gl.vertexAttribPointer(index,size,gl.FLOAT,false,STREAM_STRIDE*Float32Array.BYTES_PER_ELEMENT,offset);
        }
        gl.drawArrays(gl.TRIANGLES,0,paths.count);
      }
      gl.useProgram(program);
      draw(markers,markerCount);
      if(frame.selection?.type==="skill") {
        let offset=0;
        const add=(p:{x:number;y:number;z:number},kind:number,size:number,opacity:number)=>{
          pins.set([p.x,p.y,p.z,active,opacity,size,kind,1],offset);
          offset+=8;
        };
        for(const project of visibleProjects(frame.selection))add(project.position,4,10,.89);
        const skills=visibleSkills(frame.selection);
        const own=skills[0]?.territoryId;
        for(const item of skills) {
          if(item.territoryId!==own)add(connectedSkillPose(item,frame),3,5,.72);
        }
        if(offset) {
          gl.bindBuffer(gl.ARRAY_BUFFER,contextPins);
          gl.bufferSubData(gl.ARRAY_BUFFER,0,pins.subarray(0,offset));
          draw(contextPins,offset/8);
        }
      }
    },
    dispose(){
      for(const buffer of [field,markers,streamBuffer,contextPins])gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteProgram(streamProgram);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
