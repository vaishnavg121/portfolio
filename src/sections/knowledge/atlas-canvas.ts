import { landmarkPositions, makeTerrainParticles, routePoint, sceneRoutes, screenPoint, skillPose, territoryIndex, type AtlasRenderer } from "./atlas-geometry";
import { TERRITORIES_BY_ID } from "./atlas-model";

export function makeCanvasAtlas(canvas: HTMLCanvasElement): AtlasRenderer | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const { field } = makeTerrainParticles(false);
  return {
    draw(frame) {
      const ratio = Math.min(1.45, window.devicePixelRatio || 1);
      const w = Math.ceil(frame.width * ratio), h = Math.ceil(frame.height * ratio);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.clearRect(0,0,frame.width,frame.height);
      const region = territoryIndex(frame.selection);
      ctx.fillStyle = "#ded4c9";
      for (let i=0; i<field.length; i+=24) {
        const p = screenPoint({x:field[i],y:field[i+1],z:field[i+2]},frame);
        const edge=Math.min(1,p.x/22,p.y/22,(frame.width-p.x)/22,(frame.height-p.y)/22);
        if(edge<=0)continue;
        ctx.globalAlpha=edge*field[i+4]*(region<0||region===field[i+3]?1:.48);
        ctx.fillRect(p.x,p.y,1.25,1.25);
      }
      ctx.globalAlpha=.55;
      ctx.strokeStyle="#caa894";
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
      ctx.globalAlpha=1;
    },
    dispose(){canvas.width=canvas.height=1;},
  };
}
