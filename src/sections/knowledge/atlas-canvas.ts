import { ATLAS_TERRITORIES, SKILLS, projectAtlas } from "./atlas-model";
import { atlasGeometry, getSceneRoutes, screenPoint, type AtlasRenderer, type SceneFrame } from "./atlas-geometry";

export function makeCanvasAtlas(canvas: HTMLCanvasElement): AtlasRenderer | null {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const { territoryRings } = atlasGeometry(true);
  let width = 0;
  let height = 0;
  let routeKey = "";
  let routes = getSceneRoutes(null, 0);
  return {
    draw(frame: SceneFrame) {
      const key = [frame.selection?.type, frame.selection?.id, frame.level].join("/");
      if (key !== routeKey) {
        routeKey = key;
        routes = getSceneRoutes(frame.selection, frame.level);
      }
      const ratio = Math.min(1.5, window.devicePixelRatio || 1);
      if (width !== frame.width || height !== frame.height) {
        width = frame.width;
        height = frame.height;
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      for (const region of ATLAS_TERRITORIES) {
        const rings = territoryRings[region.index];
        for (let i = rings.length - 1; i >= 2; i--) {
          const ring = rings[i];
          context.beginPath();
          ring.forEach((p, j) => {
            const s = screenPoint(projectAtlas(p), frame);
            if (j === 0) context.moveTo(s.x, s.y);
            else context.lineTo(s.x, s.y);
          });
          context.closePath();
          if (i === rings.length - 1) {
            context.fillStyle = region.color + "2e";
            context.fill();
          }
          context.strokeStyle = region.color + (i === rings.length - 1 ? "91" : "55");
          context.stroke();
        }
      }
      for (const route of routes) {
        context.beginPath();
        route.points.forEach((p, index) => {
          const s = screenPoint(projectAtlas(p), frame);
          if (index === 0) context.moveTo(s.x, s.y);
          else context.lineTo(s.x, s.y);
        });
        context.setLineDash(route.bridge ? [4, 3] : []);
        context.strokeStyle = route.active ? "#d6a28d" : "#8977748f";
        context.stroke();
      }
      for (const skill of SKILLS) {
        const p = screenPoint(skill.anchor, frame);
        context.beginPath();
        context.arc(p.x, p.y, skill.rank === 0 ? 2.4 : 1.35, 0, Math.PI * 2);
        context.fillStyle = "#d9c2adbb";
        context.fill();
      }
    },
    dispose() { canvas.width = 1; canvas.height = 1; },
  };
}
