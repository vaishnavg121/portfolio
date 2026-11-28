import {
  ACESFilmicToneMapping, Box3, Group, InstancedMesh, LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera,
  Raycaster, Scene, Texture, Vector2, Vector3, Vector4, WebGLRenderer, type BufferGeometry, type Material,
} from "three";
import { studioArchitecture } from "./studio-architecture";
import { lightStudio } from "./studio-light";
import { contactMaterial, studioMaterials } from "./studio-model";
import { agenticBay, learningBay, marketsBay, roboticsBay, studioStationIds, type StudioStationId } from "./studio-plan";
import { agenticStation } from "./station-agentic";
import { financeStation } from "./station-finance";
import { learningStation } from "./station-learning";
import { roboticsStation } from "./station-robotics";
import { createStudioDirector, portStation, studioScenarios, type StudioActivity, type StudioObjectId, type StudioView } from "./studio-choreography";
import { studioNetwork } from "./studio-network";
import { studioInterior, studioObjectIds } from "./studio-interior";

export function startStudio(
  canvas: HTMLCanvasElement,
  painted: () => void,
  onPhase: (station: StudioStationId, phase: number) => void,
  onActivity: (activity: StudioActivity) => void,
  placePanel: (side: "left" | "right") => void,
) {
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" });
  if (!context) return null;
  const renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: true });
  renderer.setClearColor(0, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, .1, 90);
  const model = new Group();
  scene.add(model);
  const params = new URLSearchParams(location.search);
  const materials = studioMaterials(canvas);
  const contact = contactMaterial();
  const removeLight = lightStudio(renderer, scene, materials, params.get("light") ?? "");
  studioArchitecture(model, materials, contact, params.get("shell") ?? "C");
  const straightWing = params.get("room") === "straight";
  const interior = studioInterior(model,materials,contact,straightWing);
  const variant = params.get("agentic");
  const financeVariant = params.get("finance");
  const roboticsVariant = params.get("robotics");
  const stations = {
    learning: learningStation(model, materials, contact),
    agentic: agenticStation(model, materials, contact, variant === "mechanical" || variant === "optical" ? variant : "hybrid"),
    markets: financeStation(model, materials, contact, financeVariant === "research" || financeVariant === "engineering" ? financeVariant : "hybrid"),
    software: roboticsStation(model, materials, contact, roboticsVariant === "assembly" || roboticsVariant === "computing" ? roboticsVariant : "hybrid"),
  };
  const network = studioNetwork(model, materials, {
    learning: stations.learning.ports, agentic: stations.agentic.ports, markets: stations.markets.ports, software: stations.software.ports,
  }, params.get("hub") !== "0");
  const director = createStudioDirector(params.get("mode") !== "exhibit");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = new Vector2();
  const ray = new Raycaster();
  type Hit = StudioStationId | StudioObjectId;
  const bays: [Hit, Box3][] = [
    ["learning", new Box3(new Vector3(learningBay.x - 2.15, .21, .58), new Vector3(learningBay.x + 2.11, 2.58, 2.93))],
    ["agentic", new Box3(new Vector3(agenticBay.x - 1.89, .25, agenticBay.z - .82), new Vector3(agenticBay.x + 1.84, 1.73, agenticBay.z + .93))],
    ["markets", new Box3(new Vector3(marketsBay.x - 1.86, .24, marketsBay.z - .72), new Vector3(marketsBay.x + 1.78, 1.64, marketsBay.z + .83))],
    ["software", new Box3(new Vector3(roboticsBay.x - 1.83, .24, roboticsBay.z - .82), new Vector3(roboticsBay.x + 1.83, .66, roboticsBay.z + .86))],
    ["software", new Box3(new Vector3(roboticsBay.x - 1.24, .66, roboticsBay.z - .60), new Vector3(roboticsBay.x + .74, 1.72, roboticsBay.z + .68))],
    ["software", new Box3(new Vector3(roboticsBay.x + .50, .66, roboticsBay.z - .51), new Vector3(roboticsBay.x + 1.63, 1.28, roboticsBay.z + .82))],
    ...studioObjectIds.map((id): [StudioObjectId,Box3] => [id,interior.bounds[id]]),
  ];
  const boundsById = new Map<Hit,Box3>();
  for (const [id,bounds] of bays) {
    const total = boundsById.get(id) ?? new Box3();
    boundsById.set(id,total.union(bounds));
  }
  const intersection = new Vector3();
  const midpoint = new Vector3(2.25, 1.04, .29);
  const target = midpoint.clone(), eye = new Vector3();
  const destinations = {
    learning: new Vector3(learningBay.x, 1.24, learningBay.z - .11),
    agentic: new Vector3(agenticBay.x - .04, .87, agenticBay.z + .035),
    markets: new Vector3(marketsBay.x - .095, .88, marketsBay.z + .035),
    software: new Vector3(roboticsBay.x - .026, .90, roboticsBay.z - .035),
  };
  // Each inspection pose has its own vertical span, minimum width, and viewing angle.
  const views = {
    learning: new Vector4(4.05, 6.4, 6.6, 5.3),
    agentic: new Vector4(3.27, 5.12, 5.97, 5.07),
    markets: new Vector4(3.38, 5.20, 9.15, 7.1),
    software: new Vector4(3.09, 4.56, 6.4, 5.95),
  };
  const view = views.learning.clone(), gap = new Vector4();
  const objectViews = {
    desk: new Vector4(3.15,4.88,4.2,5.5),
    lounge: new Vector4(3.70,5.8,10.5,7.6),
    television: new Vector4(3.30,4.8,3.4,5.3),
    artwork: new Vector4(3.08,4.45,4.0,4.0),
  };
  const pairFrame = {
    evidence: new Vector4(7.80,13.13,7.35,6.72),
    risk: new Vector4(5.52,8.85,8.78,6.77),
    feedback: new Vector4(5.65,8.98,6.48,6.34),
  };
  const pairCenter = {
    evidence: destinations.learning.clone().lerp(destinations.agentic,.5),
    risk: destinations.learning.clone().lerp(destinations.markets,.5),
    feedback: destinations.software.clone().lerp(destinations.agentic,.5),
  };
  let width = 0, height = 0, frame = 0, timer = 0, last = 0, visible = false, first = true;
  let selection: StudioView = {kind:"overview"};
  let highlighted: Hit | null = null;
  let zoom = 0, lean = 0, wantedLean = 0, depth = 12.4, stage = -1;
  const emphasis = { learning: 0, agentic: 0, markets: 0, software: 0 };
  const still = params.get("still") === "1";
  const glancePoint = new Vector3();
  let glance: Hit | null = null;
  let ambient = 0, activityKey = "";
  let priorTransfer: string | null = null;
  let channel = 0;
  const probe = params.get("probe") === "1";
  const sample = new Vector3();
  const isObject = (id: Hit): id is StudioObjectId => Object.hasOwn(interior.centers,id);

  function panelSide(id: Hit) {
    const {min,max} = boundsById.get(id)!;
    let left = Infinity, right = -Infinity;
    for (const x of [min.x,max.x]) for (const y of [min.y,max.y]) for (const z of [min.z,max.z]) {
      const horizontal = sample.set(x,y,z).project(camera).x;
      left = Math.min(left,horizontal);
      right = Math.max(right,horizontal);
    }
    if (Math.abs(left + right) > .30) return left + right > 0 ? "left" : "right";
    return (min.x + max.x) * .5 > midpoint.x ? "left" : "right";
  }

  function pose() {
    const aspect = width / height;
    const wide = Math.max(11.18, 18.55 / aspect);
    const close = Math.max(view.x, view.y / aspect);
    const span = wide + (close - wide) * zoom;
    eye.set(6.6 + (view.z - 6.6) * zoom + lean * 1.3, 8.95 + (view.w - 8.95) * zoom, depth);
    camera.position.copy(target).add(eye);
    camera.lookAt(target);
    camera.left = -span * aspect / 2;
    camera.right = -camera.left;
    camera.top = span / 2;
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  const running = () => visible && !document.hidden && width > 0 && height > 0;
  function request() {
    if (timer) window.clearTimeout(timer);
    timer = 0;
    if (!frame && running()) frame = requestAnimationFrame(paint);
  }

  function suspend() {
    if (frame) cancelAnimationFrame(frame);
    if (timer) window.clearTimeout(timer);
    frame = timer = last = 0;
  }

  function onVisibility() {
    if (document.hidden) suspend();
    else request();
  }

  function paint(now: number) {
    frame = 0;
    if (!running()) return;
    const elapsed = last ? Math.min(75, now - last) : 16;
    last = now;
    const paused = reduced.matches || still;
    const seconds = paused ? 0 : elapsed / 1000;
    director.setReduced(paused);
    director.update(seconds);
    ambient += seconds;
    const active = director.beat;
    const beat = active ? studioScenarios[active.id].beats[active.index] : null;
    const focus = selection.kind === "station" ? selection.id : null;
    const object = selection.kind === "object" ? selection.id : null;
    const connection = selection.kind === "connection" ? selection.id : null;
    const activity = active ? `${active.id}/${active.index}/${active.guided}` : "";
    const key = `${activity}/${director.completed}/${paused}`;
    if (activityKey !== key) {
      activityKey = key;
      onActivity({beat:active ? {id:active.id,index:active.index,guided:active.guided} : null,completed:director.completed,paused});
    }
    if (!paused && selection.kind === "connection" && active?.guided && beat?.kind === "transfer" && active.progress > .93) {
      const receiver = portStation(beat.to);
      if (receiver && priorTransfer !== activity) {
        priorTransfer = activity;
        glance = receiver;
      }
    }
    network.update(active,paused && connection ? connection : undefined,seconds);
    const ease = paused ? 1 : 1 - Math.exp(-elapsed / 120);
    const desired = focus || object || connection ? 1 : 0;
    zoom += (desired - zoom) * ease;
    lean += (wantedLean - lean) * ease;
    const preferredDepth = object === "lounge" ? -2.6 : 12.4;
    depth += (preferredDepth-depth)*ease;
    if (Math.abs(preferredDepth-depth)<.02) depth=preferredDepth;
    const destination = focus ? destinations[focus] : object ? interior.centers[object] : connection ? pairCenter[connection] : midpoint;
    target.lerp(destination, ease);
    if (target.distanceToSquared(destination) < .000025) target.copy(destination);
    const destinationView = focus ? views[focus] : object ? objectViews[object] : connection ? pairFrame[connection] : views.learning;
    view.lerp(destinationView, ease);
    if (gap.subVectors(view, destinationView).lengthSq() < .00001) view.copy(destinationView);
    for (const id of studioStationIds) {
      const clock = director.station[id];
      const detailed = focus === id || (beat?.kind === "process" && beat.at === id && !!active?.guided);
      const awake = focus === id ? 1 : clock.signal === "shared" ? (active?.guided ? .89 : .47) : 0;
      const cue = Math.max(awake,highlighted === id ? .69 : 0,network.emission[id] * .93);
      emphasis[id] += (cue - emphasis[id]) * ease;
      const phase = stations[id].animate(clock.time,emphasis[id],paused,detailed,clock.signal,ambient);
      if (probe) canvas.setAttribute(`data-phase-${id}`,String(phase));
      if (focus === id && stage !== phase) {
        stage = phase;
        onPhase(id, phase);
      }
    }
    if (Math.abs(desired - zoom) < .002) zoom = desired;
    if (Math.abs(wantedLean - lean) < .004) lean = wantedLean;
    pose();
    interior.animate(paused ? 0 : ambient,object,highlighted && isObject(highlighted) ? highlighted : null,channel,lean);
    if (glance && !paused) {
      glancePoint.copy(isObject(glance) ? interior.centers[glance] : network.stationPoint(glance)).project(camera);
      const bounds = canvas.getBoundingClientRect();
      const x = bounds.left + (1 + Math.max(-.9,Math.min(.9,glancePoint.x))) * bounds.width * .5;
      window.dispatchEvent(new CustomEvent("companionInteract",{detail:{type:"studio-glance",data:{x}}}));
    }
    glance = null;
    renderer.render(scene, camera);
    if (first) {
      first = false;
      painted();
    }
    if (zoom !== desired || lean !== wantedLean || depth !== preferredDepth || !target.equals(destination) || !view.equals(destinationView)) request();
    else if (!paused) timer = window.setTimeout(request, focus || object || connection ? 23 : 31);
    else last = 0;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    const pixelBudget = width < 680 ? 310_000 : 775_000;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.46,Math.sqrt(pixelBudget/(width*height))));
    renderer.setSize(width, height, false);
    pose();
    request();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  reduced.addEventListener("change", request);
  resize();

  return {
    visible(next: boolean) {
      visible = next;
      if (visible) request();
      else suspend();
    },
    select(next: StudioView) {
      if (next === selection) return;
      selection = next;
      director.setView(next);
      activityKey = "";
      priorTransfer = null;
      glance = next.kind === "station" || next.kind === "object" ? next.id : null;
      // Reserve the opposite gutter once per selection so drag never moves the panel.
      if (glance) placePanel(panelSide(glance));
      stage = -1;
      request();
    },
    highlight(next: Hit | null) { highlighted = next; request(); },
    tune(next: number) { channel = next; request(); },
    lean(x: number) { wantedLean = reduced.matches ? 0 : x; request(); },
    hit(clientX: number, clientY: number) {
      if (!width || !height) return null;
      const rect = canvas.getBoundingClientRect();
      pointer.set((clientX - rect.left) / width * 2 - 1, 1 - (clientY - rect.top) / height * 2);
      ray.setFromCamera(pointer, camera);
      let closest: Hit | null = null;
      let distance = Infinity;
      for (const [id, bounds] of bays) {
        if (!ray.ray.intersectBox(bounds, intersection)) continue;
        const squared = ray.ray.origin.distanceToSquared(intersection);
        if (squared >= distance) continue;
        closest = id;
        distance = squared;
      }
      return closest;
    },
    dispose() {
      suspend();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", request);
      const geometries = new Set<BufferGeometry>(), used = new Set<Material>();
      scene.traverse(object => {
        if (object instanceof Mesh || object instanceof LineSegments) {
          if (object instanceof InstancedMesh) object.dispose();
          geometries.add(object.geometry);
          if (Array.isArray(object.material)) object.material.forEach(mat => used.add(mat));
          else used.add(object.material);
        }
      });
      for (const material of Object.values(materials)) {
        if (material instanceof MeshBasicMaterial || material instanceof MeshStandardMaterial) used.add(material);
      }
      geometries.forEach(geometry => geometry.dispose());
      used.forEach(material => {
        if ("map" in material && material.map instanceof Texture) material.map.dispose();
        material.dispose();
      });
      removeLight();
      renderer.dispose();
    },
  };
}
