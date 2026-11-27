import {
  ACESFilmicToneMapping, Box3, Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera, Raycaster,
  Scene, Texture, Vector2, Vector3, WebGLRenderer, type BufferGeometry, type Material,
} from "three";
import { studioArchitecture } from "./studio-architecture";
import { lightStudio } from "./studio-light";
import { contactMaterial, studioMaterials } from "./studio-model";
import { learningBay } from "./studio-plan";
import { learningStation } from "./station-learning";

export function startStudio(canvas: HTMLCanvasElement, painted: () => void, onPhase: (phase: number) => void) {
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
  const station = learningStation(model, materials, contact);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = new Vector2();
  const ray = new Raycaster();
  const bay = new Box3(new Vector3(learningBay.x - 2.15, .21, .58),
    new Vector3(learningBay.x + 2.11, 2.58, 2.93));
  const intersection = new Vector3();
  const target = new Vector3(), eye = new Vector3();
  let width = 0, height = 0, frame = 0, timer = 0, last = 0, visible = false, first = true;
  let focus = false, zoom = 0, lean = 0, wantedLean = 0, highlighted = false;
  let time = 0, stage = -1, emphasis = 0;
  const still = params.get("still") === "1";

  function pose() {
    const aspect = width / height;
    const wide = Math.max(9.25, 14.55 / aspect);
    const close = Math.max(4.05, 6.4 / aspect);
    const span = wide + (close - wide) * zoom;
    target.set(learningBay.x * zoom, 1.04 + .20 * zoom, .12 + (learningBay.z - .23) * zoom);
    eye.set(7.7 - 1.1 * zoom + lean * 1.3, 6.05 - .75 * zoom, 11.3);
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
    const desired = Number(focus);
    zoom += (desired - zoom) * ease;
    lean += (wantedLean - lean) * ease;
    emphasis += (Number(focus || highlighted) - emphasis) * ease;
    if (Math.abs(desired - zoom) < .002) zoom = desired;
    if (Math.abs(wantedLean - lean) < .004) lean = wantedLean;
    pose();
    if (!paused) time += elapsed / 1000;
    const phase = station.animate(time, emphasis, paused);
    if (stage !== phase) {
      stage = phase;
      onPhase(phase);
    }
    renderer.render(scene, camera);
    if (first) {
      first = false;
      painted();
    }
    if (zoom !== desired || lean !== wantedLean) request();
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
    focus(next: boolean) {
      if (next && !focus) time = 0;
      focus = next;
      request();
    },
    highlight(next: boolean) { highlighted = next; request(); },
    lean(x: number) { wantedLean = reduced.matches ? 0 : x; request(); },
    hit(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointer.set((clientX - rect.left) / width * 2 - 1, 1 - (clientY - rect.top) / height * 2);
      ray.setFromCamera(pointer, camera);
      return ray.ray.intersectBox(bay, intersection) !== null;
    },
    dispose() {
      if (frame) cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", request);
      reduced.removeEventListener("change", request);
      const geometries = new Set<BufferGeometry>(), used = new Set<Material>();
      scene.traverse(object => {
        if (object instanceof Mesh) {
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
