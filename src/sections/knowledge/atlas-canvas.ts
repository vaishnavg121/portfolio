import { clamp, landmarkPositions, lens, routePoint, sceneRoutes, screenPoint, skillPose, territoryIndex, type AtlasRenderer } from "./atlas-geometry";
import { ATLAS_TERRITORIES, TERRITORIES_BY_ID } from "./atlas-model";
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
      ctx.globalAlpha=.55;
      ctx.strokeStyle=palette.accent.css;
      for(const {a,b,bridge} of sceneRoutes(frame.selection,frame.hover)){
        const pose=(skill:typeof a)=>{
          const r=TERRITORIES_BY_ID.get(skill.territoryId)!;
          return frame.expansion[r.index]>.5?skillPose(skill,1):landmarkPositions[r.index];
        };
        const p=pose(a),q=pose(b);
        ctx.beginPath();
        for(let i=0;i<=24;i++){
          const v=screenPoint(routePoint(p,q,i/24,bridge),frame);
          if(i===0)ctx.moveTo(v.x,v.y);else ctx.lineTo(v.x,v.y);
        }
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
      if(region>=0)ATLAS_TERRITORIES[region].items.forEach(skill=>node(skillPose(skill,1),1.8));
      ctx.globalAlpha=1;
    },
    dispose(){canvas.width=canvas.height=1;},
  };
}
