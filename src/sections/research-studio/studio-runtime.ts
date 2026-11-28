import {
  ACESFilmicToneMapping, Box3, Group, InstancedMesh, LineSegments, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera,
  Raycaster, Scene, Texture, Vector2, Vector3, Vector4, WebGLRenderer, type BufferGeometry, type Material,
} from "three";
import { studioArchitecture } from "./studio-architecture";
import { lightStudio } from "./studio-light";
import { contactMaterial, studioMaterials } from "./studio-model";
import { agenticBay, learningBay, marketsBay, studioStationIds, type StudioStationId } from "./studio-plan";
import { agenticStation } from "./station-agentic";
import { financeStation } from "./station-finance";
import { learningStation } from "./station-learning";

export function startStudio(canvas: HTMLCanvasElement, painted: () => void, onPhase: (station: StudioStationId, phase: number) => void) {
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
  const variant = params.get("agentic");
  const financeVariant = params.get("finance");
  const stations = {
    learning: learningStation(model, materials, contact),
    agentic: agenticStation(model, materials, contact, variant === "mechanical" || variant === "optical" ? variant : "hybrid"),
    markets: financeStation(model, materials, contact, financeVariant === "research" || financeVariant === "engineering" ? financeVariant : "hybrid"),
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = new Vector2();
  const ray = new Raycaster();
  const bays = [
    ["learning", new Box3(new Vector3(learningBay.x - 2.15, .21, .58), new Vector3(learningBay.x + 2.11, 2.58, 2.93))],
    ["agentic", new Box3(new Vector3(agenticBay.x - 1.89, .25, agenticBay.z - .82), new Vector3(agenticBay.x + 1.84, 1.73, agenticBay.z + .93))],
    ["markets", new Box3(new Vector3(marketsBay.x - 1.86, .24, marketsBay.z - .72), new Vector3(marketsBay.x + 1.78, 1.64, marketsBay.z + .83))],
  ] as const;
  const intersection = new Vector3();
  const midpoint = new Vector3(0, 1.04, .12);
  const target = midpoint.clone(), eye = new Vector3();
  const destinations = {
    learning: new Vector3(learningBay.x, 1.24, learningBay.z - .11),
    agentic: new Vector3(agenticBay.x - .04, .87, agenticBay.z + .035),
    markets: new Vector3(marketsBay.x - .095, .88, marketsBay.z + .035),
  };
  // Each inspection pose has its own vertical span, minimum width, and viewing angle.
  const views = {
    learning: new Vector4(4.05, 6.4, 6.6, 5.3),
    agentic: new Vector4(3.27, 5.12, 5.97, 5.07),
    markets: new Vector4(3.38, 5.20, 9.15, 7.1),
  };
  const view = views.learning.clone(), gap = new Vector4();
  let width = 0, height = 0, frame = 0, timer = 0, last = 0, visible = false, first = true;
  let focus: StudioStationId | null = null, highlighted: StudioStationId | null = null;
  let zoom = 0, lean = 0, wantedLean = 0, stage = -1;
  const time = { learning: 0, agentic: 0, markets: 0 };
  const emphasis = { learning: 0, agentic: 0, markets: 0 };
  const still = params.get("still") === "1";

  function pose() {
    const aspect = width / height;
    const wide = Math.max(9.25, 14.55 / aspect);
    const close = Math.max(view.x, view.y / aspect);
    const span = wide + (close - wide) * zoom;
    eye.set(7.7 + (view.z - 7.7) * zoom + lean * 1.3, 6.05 + (view.w - 6.05) * zoom, 11.3);
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

  function paint(now: number) {
    frame = 0;
    if (!running()) return;
    const elapsed = last ? Math.min(75, now - last) : 16;
    last = now;
    const paused = reduced.matches || still;
    const ease = paused ? 1 : 1 - Math.exp(-elapsed / 120);
    const desired = focus ? 1 : 0;
    zoom += (desired - zoom) * ease;
    lean += (wantedLean - lean) * ease;
    const destination = focus ? destinations[focus] : midpoint;
    target.lerp(destination, ease);
    if (target.distanceToSquared(destination) < .000025) target.copy(destination);
    const destinationView = views[focus ?? "learning"];
    view.lerp(destinationView, ease);
    if (gap.subVectors(view, destinationView).lengthSq() < .00001) view.copy(destinationView);
    for (const id of studioStationIds) {
      emphasis[id] += (Number(focus === id || highlighted === id) - emphasis[id]) * ease;
      if (!paused && (!focus || focus === id)) time[id] += elapsed / 1000;
      const phase = stations[id].animate(time[id], emphasis[id], paused, focus === id);
      if (focus === id && stage !== phase) {
        stage = phase;
        onPhase(id, phase);
      }
    }
    if (Math.abs(desired - zoom) < .002) zoom = desired;
    if (Math.abs(wantedLean - lean) < .004) lean = wantedLean;
    pose();
    renderer.render(scene, camera);
    if (first) {
      first = false;
      painted();
    }
    if (zoom !== desired || lean !== wantedLean || !target.equals(destination) || !view.equals(destinationView)) request();
    else if (!paused) timer = window.setTimeout(request, focus ? 23 : 38);
    else last = 0;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width > 680 ? 1.5 : 1.48, 1460 / width));
    renderer.setSize(width, height, false);
    pose();
    request();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", request);
  reduced.addEventListener("change", request);
  resize();

  return {
    visible(next: boolean) {
      visible = next;
      if (visible) request();
      else {
        if (frame) cancelAnimationFrame(frame);
        if (timer) window.clearTimeout(timer);
        frame = timer = last = 0;
      }
    },
    focus(next: StudioStationId | null) {
      if (next === focus) return;
      if (next) time[next] = 0;
      stage = -1;
      focus = next;
      request();
    },
    highlight(next: StudioStationId | null) { highlighted = next; request(); },
    lean(x: number) { wantedLean = reduced.matches ? 0 : x; request(); },
    hit(clientX: number, clientY: number) {
      if (!width || !height) return null;
      const rect = canvas.getBoundingClientRect();
      pointer.set((clientX - rect.left) / width * 2 - 1, 1 - (clientY - rect.top) / height * 2);
      ray.setFromCamera(pointer, camera);
      let closest: StudioStationId | null = null;
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
      if (frame) cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", request);
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
