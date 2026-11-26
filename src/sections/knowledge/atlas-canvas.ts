import { ATLAS_TERRITORIES, SKILLS, projectAtlas, type AtlasPosition } from "./atlas-model";
import { sampleAtlasTerrains, getSceneRoutes, territoryIndex, type AtlasRenderer, type SceneFrame } from "./atlas-geometry";

function projectedPath(points: AtlasPosition[], close = false) {
  const path = new Path2D();
  points.forEach((point, index) => {
    const {x,y} = projectAtlas(point);
    if (index === 0) path.moveTo(x,y);
    else path.lineTo(x,y);
  });
  if (close) path.closePath();
  return path;
}

export function makeCanvasAtlas(canvas: HTMLCanvasElement): AtlasRenderer | null {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const territories = sampleAtlasTerrains(true).terrains.map(terrain =>
    terrain.slice(2).reverse().map(ring => projectedPath(ring, true)));
  const markerPaths = SKILLS.map(skill => {
    const path = new Path2D();
    path.arc(skill.anchor.x, skill.anchor.y, skill.rank === 0 ? 5 : 2.6, 0, Math.PI * 2);
    return path;
  });
  let routeKey = "";
  let routes: (ReturnType<typeof getSceneRoutes>[number] & {path: Path2D})[] = [];
  let selected = -1;

  return {
    draw(frame: SceneFrame) {
      const key = [frame.selection?.type, frame.selection?.id, frame.level].join("/");
      if (key !== routeKey) {
        routeKey = key;
        selected = territoryIndex(frame.selection);
        routes = getSceneRoutes(frame.selection, frame.level).map(route => ({...route, path: projectedPath(route.points)}));
      }
      const ratio = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(frame.width * ratio));
      const h = Math.max(1, Math.round(frame.height * ratio));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const {camera, stretch, width, height} = frame;
      const zoom = camera.z * ratio;
      context.resetTransform();
      context.clearRect(0,0,w,h);
      context.setTransform(zoom,0,0,zoom * stretch,ratio * (width / 2 + camera.x),ratio * (height / 2 + camera.y * stretch));
      context.setLineDash([]);
      context.lineWidth = 0.82 / camera.z;
      for (const region of ATLAS_TERRITORIES) {
        context.globalAlpha = selected === -1 || selected === region.index ? 1 : .49;
        for (const [index, ring] of territories[region.index].entries()) {
          if (index === 0) {
            context.fillStyle = region.color + "2e";
            context.fill(ring);
          }
          context.strokeStyle = region.color + (index === 0 ? "91" : "55");
          context.stroke(ring);
        }
      }
      context.globalAlpha = 1;
      for (const route of routes) {
        context.setLineDash(route.bridge ? [4 / camera.z, 3 / camera.z] : []);
        context.strokeStyle = route.active ? "#d6a28d" : "#8977748f";
        context.stroke(route.path);
      }
      context.fillStyle = "#d9c2adbb";
      for (const marker of markerPaths) context.fill(marker);
    },
    dispose() { canvas.width = 1; canvas.height = 1; },
  };
}
