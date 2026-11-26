import { landmarkPositions, lens, mix, routePoint, sceneRoutes, skillPose, territoryIndex, type AtlasRenderer } from "./atlas-geometry";
import { TERRITORIES_BY_ID } from "./atlas-model";
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
uniform vec3 uShadow, uMuted, uLight, uAccent;
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
      tonal=sin(p.x*.015+p.y*.020-time*.83)*.055;
      p.z+=sin(p.x*.012+p.y*.017-time*.82)*1.1+sin(p.y*.022+time*.64)*.62;
      for(int k=0;k<4;k++) {
        vec4 impulse=uImpulses[k];
        if(impulse.w<.006) continue;
        vec2 d=p.xy-impulse.xy;
        float distanceSquared=dot(d,d), t=impulse.z;
        float reach=t*106.0+62.0;
        if(distanceSquared>reach*reach)continue;
        float radius=sqrt(distanceSquared);
        float ring=(radius-t*106.0)/23.0, local=exp(-distanceSquared/3850.0), wave=exp(-ring*ring);
        float force=impulse.w*exp(-3.25*t);
        p.z+=force*(local*(-6.2)+wave*3.5*cos(ring*1.7));
        p.xy+=d/max(radius,9.0)*local*force*2.7;
        aura+=(local*.16+wave*.21)*force;
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
    float relief=smoothstep(-22.0,139.0,p.z);
    float light=clamp(.51+relief*.28+phase*.16+tonal,0.0,1.0);
    color=mix(uShadow,mix(uMuted,uLight,relief*.58+phase*.15),light);
    color=mix(color,uAccent,clamp(.12+relief*.10+aura*.52,0.0,.60));
    ink+=aura*.29;
  } else {
    color=mix(uAccent,uLight,kind>=2.5?phase*.78:phase*.79);
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
  float radius=length(gl_PointCoord-.5);
  float alpha=1.0-smoothstep(vKind>.5?.12:.16,.51,radius);
  if(alpha*vColor.a<.018) discard;
  gl_FragColor=vec4(vColor.rgb,vColor.a*alpha);
}
`;

function compile(gl: WebGLRenderingContext) {
  const program=gl.createProgram();
  if (!program) return null;
  for (const [type, source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]] as const) {
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
  const program=compile(gl);
  if(!program){gl.getExtension("WEBGL_lose_context")?.loseContext();return null;}
  const terrain = createTerrainTiles(!compact);
  const markerData = makeAtlasMarkers();
  const palette = readAtlasPalette(canvas);
  const field=gl.createBuffer()!,markers=gl.createBuffer()!,signals=gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER,markers);
  gl.bufferData(gl.ARRAY_BUFFER,markerData,gl.STATIC_DRAW);
  let currentField: ReturnType<typeof terrain> | undefined;
  const paths=new Float32Array(16*180*8);
  gl.bindBuffer(gl.ARRAY_BUFFER,signals);
  gl.bufferData(gl.ARRAY_BUFFER,paths.byteLength,gl.DYNAMIC_DRAW);
  gl.useProgram(program);
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0,0,0,0);
  const attribs = [["aPosition",3,0],["aStyle",4,12],["aPhase",1,28]] as const;
  const attrs=attribs.map(([name,size,offset])=>({index:gl.getAttribLocation(program,name),size,offset}));
  attrs.forEach(({index}) => gl.enableVertexAttribArray(index));
  const names=["uCam","uFrame","uMotion","uSkill","uLens","uHover","uGround","uShadow","uMuted","uLight","uAccent","uImpulses[0]","uPeaks[0]"] as const;
  const u=Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.uniform4f(u.uLens,lens.COS,lens.SIN,lens.CY,lens.SY);
  const peaks=new Float32Array(32);
  gl.uniform3fv(u.uShadow,palette.shadow.rgb);
  gl.uniform3fv(u.uMuted,palette.muted.rgb);
  gl.uniform3fv(u.uLight,palette.light.rgb);
  gl.uniform3fv(u.uAccent,palette.accent.rgb);
  const markerCount=markerData.length / 8;
  landmarkPositions.forEach((p,i)=>peaks.set([p.x,p.y,p.z,0],i*4));
  const draw=(buffer:WebGLBuffer,count:number)=>{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    attrs.forEach(({index,size,offset})=>gl.vertexAttribPointer(index,size,gl.FLOAT,false,32,offset));
    gl.drawArrays(gl.POINTS,0,count);
  };
  let routeKey="";
  let routes: ReturnType<typeof sceneRoutes> = [];
  let retiring: typeof routes = [];
  let routeTime=0;
  let lastCount=0;
  return {
    draw(frame) {
      const deviceRatio=Math.min(window.devicePixelRatio||1,compact?1.25:1.55);
      const dpr=deviceRatio*(frame.quality<.57 ? .78 : frame.quality<.8 ? .89 : 1);
      const w=Math.max(1,Math.round(frame.width*dpr)),h=Math.max(1,Math.round(frame.height*dpr));
      if (canvas.width!==w||canvas.height!==h) { canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h); }
      gl.clear(gl.COLOR_BUFFER_BIT);
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
      draw(markers,markerCount);
      const key=[frame.selection?.id,frame.selection?.type,frame.hover].join("/");
      if(key!==routeKey) {
        routeKey=key;retiring=routes;routes=sceneRoutes(frame.selection,frame.hover);routeTime=frame.time;
      }
      const age=frame.motion?frame.time-routeTime:1;
      let written=0;
      const emit=(p:{x:number;y:number;z:number},alpha:number,size:number,phase:number)=>{
        paths[written++]=p.x;paths[written++]=p.y;paths[written++]=p.z;paths[written++]=-1;
        paths[written++]=alpha;paths[written++]=size;paths[written++]=3;paths[written++]=phase;
      };
      const sample=(pathsToDraw:typeof routes,outgoing:boolean)=>{
        pathsToDraw.forEach(({a,b,bridge},i)=>{
          const ax=TERRITORIES_BY_ID.get(a.territoryId)!.index, bx=TERRITORIES_BY_ID.get(b.territoryId)!.index;
          const ev=(skill:typeof a,index:number)=>frame.expansion[index]>.02 ? skillPose(skill,frame.expansion[index]) : landmarkPositions[index];
          const p=ev(a,ax),q=ev(b,bx);
          const traced=outgoing?Math.max(0,1-age*3.45):Math.min(1,Math.max(0,(age-(frame.selection?.type==="territory"?.16:0)-i*.013)/.53));
          if(traced<=0)return;
          const segments=bridge?67:41,trace=traced*traced*(3-2*traced);
          for(let j=0;j<=segments*trace;j++){
            const t=j/segments,span=bridge&&j%7>4?.40:1;
            emit(routePoint(p,q,t,bridge),(frame.selection ? .61 : .28)*span*(outgoing?trace:1),bridge?1.85:1.9,t);
          }
          if(outgoing||!frame.selection||!frame.motion)return;
          const beat=(frame.signal-.18-i*.032)*1.32;
          for(let j=0;j<5;j++){
            const t=beat-j*.024;
            if(t<0||t>trace||t>1)continue;
            emit(routePoint(p,q,t,bridge),mix(.95,.22,j/5),mix(4,1.65,j/5),t);
          }
          if(beat>.91&&beat<1.25){
            const glow=Math.sin((beat-.91)/.34*Math.PI);
            emit(q,glow*.89,3+glow*6,1);
          }
        });
      };
      if(age<.29)sample(retiring,true);
      sample(routes,false);
      if(written){
        gl.bindBuffer(gl.ARRAY_BUFFER,signals);
        gl.bufferSubData(gl.ARRAY_BUFFER,0,paths.subarray(0,written));
        draw(signals,written/8);
      }
    },
    dispose(){
      for(const buffer of [field,markers,signals])gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
