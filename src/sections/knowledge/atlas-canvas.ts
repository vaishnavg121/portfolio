import { clamp, landmarkPositions, lens, screenPoint, territoryIndex, type AtlasRenderer } from "./atlas-geometry";
import { ATLAS_TERRITORIES } from "./atlas-model";
import { connectedSkillPose, connectionEndpoint, connectionsFor, routePoint, visibleProjects } from "./atlas-connections";
import { readAtlasPalette } from "./atlas-palette";
import { createTerrainTiles, FOG_FAR, FOG_NEAR, terrainCenter } from "./atlas-terrain";

export function makeCanvasAtlas(canvas: HTMLCanvasElement): AtlasRenderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const terrain = createTerrainTiles(false);
  const palette = readAtlasPalette(canvas);
  return {
    draw(frame) {
      const ratio = Math.min(1.45, window.devicePixelRatio || 1);
      const w = Math.ceil(frame.width * ratio), h = Math.ceil(frame.height * ratio);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.clearRect(0,0,frame.width,frame.height);
      const region = territoryIndex(frame.selection);
      const center = terrainCenter(frame);
      const field = terrain(center.x, center.y);
      ctx.fillStyle = palette.muted.css;
      for (let i=0; i<field.length; i+=40) {
        const x=field[i],y=field[i+1],z=field[i+2];
        const depth = (x*lens.SY+y*lens.CY)*lens.COS+z*lens.SIN;
        if(depth>frame.perspective*.66)continue;
        const fog=clamp((FOG_FAR-Math.hypot(x-center.x,y-center.y))/(FOG_FAR-FOG_NEAR));
        if(fog<=0)continue;
        const p = screenPoint({x,y,z},frame);
        const edge=clamp(Math.min(p.x/(frame.width*.15),p.y/(frame.height*.15),(frame.width-p.x)/(frame.width*.15),(frame.height-p.y)/(frame.height*.15)));
        if(edge<=0)continue;
        ctx.globalAlpha=edge*fog*fog*(3-2*fog)*field[i+4]*(region<0||region===field[i+3]?1:.62);
        ctx.fillRect(p.x,p.y,1.45,1.45);
      }
      for(const {a,b,bridge,weight} of connectionsFor(frame.selection,frame.hover)){
        const p=connectionEndpoint(a,frame),q=connectionEndpoint(b,frame);
        ctx.beginPath();
        for(let i=0;i<=28;i++){
          const v=screenPoint(routePoint(p,q,i/28,bridge),frame);
          if(i===0)ctx.moveTo(v.x,v.y);else ctx.lineTo(v.x,v.y);
        }
        ctx.strokeStyle=palette.accent.css;
        ctx.globalAlpha=weight*.18;
        ctx.lineWidth=4;
        ctx.stroke();
        ctx.globalAlpha=weight;
        ctx.lineWidth=1.2;
        ctx.stroke();
      }
      ctx.fillStyle=palette.accent.css;
      ctx.globalAlpha=.24;
      const node=(world: typeof landmarkPositions[number], radius: number) => {
        const p=screenPoint(world,frame);
        if(p.x<0||p.x>frame.width||p.y<0||p.y>frame.height)return;
        ctx.beginPath();
        ctx.arc(p.x,p.y,radius,0,Math.PI*2);
        ctx.fill();
      };
      landmarkPositions.forEach(p=>node(p,8));
      ctx.fillStyle=palette.light.css;
      ctx.globalAlpha=.92;
      landmarkPositions.forEach(p=>node(p,2.8));
      if(region>=0)ATLAS_TERRITORIES[region].items.forEach(skill=>node(connectedSkillPose(skill,frame),1.8));
      for(const { position } of visibleProjects(frame.selection)) {
        const p=screenPoint(position,frame);
        ctx.fillStyle=palette.accent.css;
        ctx.beginPath();
        ctx.moveTo(p.x,p.y-4);
        ctx.lineTo(p.x+4,p.y);
        ctx.lineTo(p.x,p.y+4);
        ctx.lineTo(p.x-4,p.y);
        ctx.fill();
      }
      ctx.globalAlpha=1;
    },
    dispose(){canvas.width=canvas.height=1;},
  };
}
