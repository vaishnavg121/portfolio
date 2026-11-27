import {
  Box3, Color, InstancedBufferAttribute, InstancedMesh, Matrix4, OrthographicCamera, PlaneGeometry, Raycaster, Scene,
  ShaderMaterial, Vector2, Vector3, WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { contributionView, type ContributionColumn } from "@/lib/github-calendar";

const formationTime = .76;
const footprintX = .71;
const footprintZ = .74;
const thickness = .115;

const vertexShader = `
  attribute vec4 aDay;
  uniform float uTime, uHover, uPinned, uLift;
  varying vec3 vNormal, vLocal;
  varying vec4 vDay;
  void main() {
    float wave = clamp((uTime - aDay.z * .24) / .49, 0., 1.);
    float rise = 1. - pow(1. - wave, 3.);
    float height = mix(.115, aDay.x, rise);
    float hovered = 1. - step(.5, abs(aDay.w - uHover));
    float pinned = 1. - step(.5, abs(aDay.w - uPinned));
    vec3 p = vec3(position.x, (position.y + .5) * height + hovered * uLift, position.z);
    vNormal = normalize(vec3(normal.x, normal.y / max(.22, height), normal.z));
    vLocal = position;
    vDay = vec4(aDay.y, hovered, pinned, rise);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.);
  }
`;

const fragmentShader = `
  uniform vec3 uNight, uRose, uStone, uIvory, uMauve, uView;
  varying vec3 vNormal, vLocal;
  varying vec4 vDay;
  void main() {
    vec3 n = normalize(vNormal);
    float top = max(0., n.y);
    vec3 key = normalize(vec3(-.53, .77, .35));
    float light = max(0., dot(n, key));
    float rim = pow(1. - max(0., dot(n, uView)), 2.);
    float upper = smoothstep(.04, .52, vLocal.y + .50);
    float occupied = step(.001, vDay.x);
    float amount = pow(vDay.x, .64);
    vec3 pigment = mix(uMauve, mix(uRose, uStone, amount * .57), .53 + amount * .17);
    vec3 base = mix(uNight, uMauve, .023 + .048 * light + .018 * top);
    vec3 ceramic = mix(pigment, uStone, .34) * (.35 + .45 * light);
    float glint = pow(max(0., dot(n, normalize(key + uView))), 21.);
    float reflection = 1. - smoothstep(.008, .105, abs(vLocal.x + vLocal.z * .74 + .07));
    vec3 glass = mix(uNight, pigment, (.12 + .39 * upper) * (.41 + .59 * light))
      + uIvory * (top * (.155 + .075 * reflection) + rim * (.025 + .155 * upper) + glint * .20);
    float shade = smoothstep(-.44, .22, vLocal.y);
    vec3 material = mix(ceramic, glass, .25 + shade * .71) + pigment * upper * .09;
    material *= .61 + amount * .59;
    material += uIvory * pow(amount, 2.) * top * .135;
    vec3 color = mix(base, material, occupied);
    float focus = max(vDay.y * .71, vDay.z);
    color = mix(color, uIvory, focus * (.10 + top * .14 + rim * .1));
    gl_FragColor = vec4(color, 1.);
    #include <colorspace_fragment>
  }
`;

const reflectionVertex = `
  attribute vec4 aDay;
  varying vec2 vUv;
  varying float vStrength;
  void main() {
    vUv = uv;
    vStrength = aDay.y;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.);
  }
`;

const reflectionFragment = `
  uniform vec3 uNight, uRose;
  varying vec2 vUv;
  varying float vStrength;
  void main() {
    float soft = 1. - smoothstep(.12, .50, length(vUv - .5));
    float echo = sqrt(vStrength);
    gl_FragColor = vec4(mix(uNight, uRose, echo * .66), soft * (.065 + echo * .19));
    #include <colorspace_fragment>
  }
`;

type Artwork = {
  canvas: HTMLCanvasElement;
  columns: ContributionColumn[];
  weekCount: number;
  reduced: boolean;
  ready: (rendered: boolean) => void;
};

export function createContributionSculpture({ canvas, columns, weekCount, reduced, ready }: Artwork) {
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "low-power" });
  if (!context) return null;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  let shaderFailed = false;
  renderer.debug.onShaderError = () => { shaderFailed = true; };
  renderer.setClearColor(0, 0);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, .1, 150);
  const hover = new Vector2(), lean = new Vector2();
  const direction = new Vector3(), up = new Vector3(), right = new Vector3(), center = new Vector3();
  const color = getComputedStyle(canvas);
  const tint = (name: string) => ({ value: new Color(color.getPropertyValue(name).trim()) });
  const uniforms = {
    uTime: { value: reduced ? formationTime : 0 },
    uNight: tint("--background"),
    uRose: tint("--accent-source"),
    uStone: tint("--accent-stone"),
    uIvory: tint("--text-primary"),
    uMauve: tint("--accent-mauve"),
    uView: { value: direction },
    uHover: { value: -1 },
    uPinned: { value: -1 },
    uLift: { value: 0 },
  };
  const geometry = new RoundedBoxGeometry(footprintX, 1, footprintZ, 1, .12);
  const attributes = new Float32Array(columns.length * 4);
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
  const mesh = new InstancedMesh(geometry, material, columns.length);
  const transform = new Matrix4();
  for (const [id, column] of columns.entries()) {
    attributes.set([column.height, column.intensity, column.x / Math.max(1, weekCount - 1), id], id * 4);
    mesh.setMatrixAt(id, transform.makeTranslation(column.x, 0, column.z));
  }
  geometry.setAttribute("aDay", new InstancedBufferAttribute(attributes, 4));
  mesh.frustumCulled = false;
  scene.add(mesh);
  const reflectionGeometry = new PlaneGeometry(1.3, 1.33).rotateX(-Math.PI / 2).translate(.09, -.012, .1);
  reflectionGeometry.setAttribute("aDay", new InstancedBufferAttribute(attributes, 4));
  const reflectionMaterial = new ShaderMaterial({
    uniforms, vertexShader: reflectionVertex, fragmentShader: reflectionFragment, transparent: true, depthWrite: false,
  });
  const reflections = new InstancedMesh(reflectionGeometry, reflectionMaterial, columns.length);
  reflections.instanceMatrix = mesh.instanceMatrix;
  reflections.frustumCulled = false;
  scene.add(reflections);

  const raycaster = new Raycaster();
  const cursor = new Vector2();
  const box = new Box3();
  const intersection = new Vector3();
  const projected = new Vector3();
  let visible = false, frame = 0, start = -1, previous = 0, first = true;
  let width = 0, height = 0, pitch = 1;

  function pose() {
    const view = contributionView;
    direction.set(view.eye.x + lean.x * .041, view.eye.y + lean.y * .027, view.eye.z).normalize();
    up.set(0, direction.z, -direction.y).normalize();
    right.crossVectors(up, direction);
    const scale = pitch / right.x;
    center.copy(right).multiplyScalar((width * .5 - view.left * pitch) / scale)
      .addScaledVector(up, (height * .5 - view.floor * pitch) / scale);
    camera.position.copy(center).addScaledVector(direction, 60);
    camera.up.copy(up);
    camera.lookAt(center);
    camera.left = -width / (2 * scale);
    camera.right = -camera.left;
    camera.top = height / (2 * scale);
    camera.bottom = -camera.top;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  function request() {
    if (visible && !document.hidden && width && height && !frame) frame = requestAnimationFrame(paint);
  }

  function paint(now: number) {
    frame = 0;
    if (!visible || document.hidden) return;
    if (start < 0) start = now;
    const time = reduced ? formationTime : Math.min(formationTime, (now - start) / 1000);
    const ease = reduced ? 1 : 1 - Math.exp(-Math.min(80, now - (previous || now - 16)) / 45);
    previous = now;
    const targetLift = uniforms.uHover.value < 0 || reduced ? 0 : .095;
    uniforms.uTime.value = time;
    uniforms.uLift.value += (targetLift - uniforms.uLift.value) * ease;
    lean.lerp(hover, ease);
    pose();
    renderer.render(scene, camera);
    if (first) {
      first = false;
      ready(!shaderFailed);
      if (shaderFailed) {
        visible = false;
        return;
      }
    }
    if (time < formationTime || lean.distanceToSquared(hover) > .000015 || Math.abs(targetLift - uniforms.uLift.value) > .001) request();
  }

  return {
    resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      pitch = parseFloat(getComputedStyle(canvas).getPropertyValue("--gh-unit")) || 11.5;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, pitch > 14 ? 1.45 : 1.6, 1450 / width));
      renderer.setSize(width, height, false);
      pose();
      request();
    },
    setVisible(next: boolean) {
      visible = next;
      if (visible) request();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    emphasize(hot: number, pinned: number, x = 0, y = 0) {
      uniforms.uHover.value = hot;
      uniforms.uPinned.value = pinned;
      hover.set(reduced ? 0 : x, reduced ? 0 : y);
      request();
    },
    hit(x: number, y: number, touch: boolean) {
      if (!width || !height || x < 0 || x >= width || y < 0 || y >= height) return -1;
      cursor.set(x / width * 2 - 1, 1 - y / height * 2);
      raycaster.setFromCamera(cursor, camera);
      const guess = x / pitch - contributionView.left;
      let best = -1, nearest = Infinity, near = -1, distance = touch ? 95 : 26;
      for (const [index, column] of columns.entries()) {
        if (Math.abs(column.x - guess) > 3.4) continue;
        const wave = Math.max(0, Math.min(1, (uniforms.uTime.value - attributes[index * 4 + 2] * .24) / .49));
        const columnHeight = thickness + (column.height - thickness) * (1 - (1 - wave) ** 3);
        const lift = index === uniforms.uHover.value ? uniforms.uLift.value : 0;
        box.min.set(column.x - footprintX * .5, lift, column.z - footprintZ * .5);
        box.max.set(column.x + footprintX * .5, columnHeight + lift, column.z + footprintZ * .5);
        if (raycaster.ray.intersectBox(box, intersection)) {
          const depth = raycaster.ray.origin.distanceToSquared(intersection);
          if (depth < nearest) { nearest = depth; best = index; }
        }
        projected.set(column.x, columnHeight * .65 + lift, column.z).project(camera);
        const dx = (projected.x - cursor.x) * width * .5;
        const dy = (projected.y - cursor.y) * height * .5;
        const screen = dx * dx + dy * dy;
        if (screen < distance) { distance = screen; near = index; }
      }
      return best < 0 ? near : best;
    },
    dispose() {
      if (frame) cancelAnimationFrame(frame);
      geometry.dispose();
      material.dispose();
      mesh.dispose();
      reflectionGeometry.dispose();
      reflectionMaterial.dispose();
      reflections.dispose();
      renderer.dispose();
    },
  };
}
