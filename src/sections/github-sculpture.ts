import {
  Box3, Color, InstancedBufferAttribute, InstancedMesh, Matrix4, Mesh, OrthographicCamera, PlaneGeometry, Raycaster, Scene,
  ShaderMaterial, Vector2, Vector3, WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { contributionView, type ContributionColumn } from "@/lib/github-calendar";

const formationTime = .81;
const formationStagger = .31;
const formationRise = .49;
const footprintX = .71;
const footprintZ = .69;
const thickness = .115;

const vertexShader = `
  attribute vec4 aDay;
  uniform float uTime, uHover, uPinned, uPress, uLift, uMotion;
  varying vec3 vNormal, vLocal;
  varying vec4 vDay;
  void main() {
    float wave = clamp((uTime - aDay.z * ${formationStagger}) / ${formationRise}, 0., 1.);
    float rise = 1. - pow(1. - wave, 3.);
    float height = mix(.115, aDay.x, rise);
    float hovered = 1. - step(.5, abs(aDay.w - uHover));
    float pinned = 1. - step(.5, abs(aDay.w - uPinned));
    float bevel = min(.106, height * .34);
    float cap = (.5 - abs(position.y)) * bevel / .12;
    float y = position.y < 0. ? cap : height - cap;
    float pressed = 1. - step(.5, abs(aDay.w - uPress));
    float lift = uMotion * max(hovered * uLift, pinned * .044);
    vec3 p = vec3(position.x, y * (1. - pressed * uMotion * .035) + lift, position.z);
    vNormal = normalize(vec3(normal.x, normal.y * .12 / bevel, normal.z));
    vLocal = position;
    vDay = vec4(aDay.y, hovered, pinned, wave);
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.);
  }
`;

const fragmentShader = `
  uniform vec3 uNight, uRose, uStone, uIvory, uMauve, uView;
  uniform float uSweep;
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
    vec3 pigment = mix(mix(uMauve, uStone, .40), uRose, smoothstep(.05, .55, vDay.x));
    pigment = mix(pigment, mix(uStone, uIvory, .71), smoothstep(.40, 1., vDay.x));
    float lowerShade = mix(.57, 1., smoothstep(-.50, .28, vLocal.y));
    float sideFill = .34 + .46 * light + .14 * max(n.x, 0.);
    vec3 base = mix(uNight, uMauve, .016 + .031 * light + .027 * top);
    vec3 ceramic = pigment * (.29 + .49 * light + .09 * top) * lowerShade;
    float glint = pow(max(0., dot(n, normalize(key + uView))), 18.);
    float reflection = 1. - smoothstep(.03, .38, abs(vLocal.x + vLocal.z * .64 + .105));
    vec3 glass = mix(uNight, pigment, (.18 + .56 * upper) * sideFill) * lowerShade
      + uIvory * (top * (.10 + .12 * reflection) + rim * (.012 + .09 * upper) + glint * .085);
    vec3 hybrid = mix(ceramic * .72, glass, .17 + upper * .77) + pigment * upper * (.035 + .07 * light);
    vec3 material = hybrid;
    material *= .79 + amount * .29;
    material += uIvory * amount * amount * top * .095;
    vec3 color = mix(base, material, occupied);
    float focus = max(vDay.y * .71, vDay.z);
    color = mix(color, uIvory, focus * (.10 + top * .14 + rim * .1));
    float beam = 1. - smoothstep(.04, .28, abs(vLocal.y + .5 - uSweep));
    float forming = sin(vDay.w * 3.14159) * occupied;
    color += uIvory * (forming * (.018 + .045 * top) + beam * focus * (.07 + .06 * top));
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
    vec2 position = vUv - .5;
    float contact = (1. - smoothstep(.12, .49, length(position + vec2(.04, -.05)))) * .23;
    float echo = (1. - smoothstep(.01, .48, length(position - vec2(.16, -.13)))) * vStrength * .24;
    gl_FragColor = vec4(mix(uNight, uRose, echo / max(.13, contact + echo) * .62), contact + echo);
    #include <colorspace_fragment>
  }
`;

const groundVertex = `
  varying vec2 vGrid;
  void main() {
    vGrid = position.xz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

const groundFragment = `
  uniform vec3 uNight, uMauve, uStone;
  uniform float uWeeks, uTime;
  varying vec2 vGrid;
  void main() {
    float left = smoothstep(-.68, .54, vGrid.x);
    float right = 1. - smoothstep(uWeeks - 2.5, uWeeks + .1, vGrid.x);
    float sides = smoothstep(-.69, .08, vGrid.y) * (1. - smoothstep(6., 6.65, vGrid.y));
    vec2 line = abs(fract(vGrid) - .5);
    float horizontal = 1. - smoothstep(0., .063, line.y);
    float vertical = 1. - smoothstep(0., .051, line.x);
    float front = 1. - smoothstep(.005, .072, abs(vGrid.y - 6.42));
    float field = left * right * sides;
    float lineLight = max(horizontal * .115, vertical * .068) * field;
    float wave = (1. - smoothstep(.0, .13, abs(vGrid.x / uWeeks - uTime / .66))) * step(.001, uTime);
    float hue = lineLight * (1. + wave * .83) + front * left * right * .15;
    gl_FragColor = vec4(mix(uNight, mix(uMauve, uStone, .35), min(1., hue * 6.)), field * .065 + hue);
    #include <colorspace_fragment>
  }
`;

type Artwork = {
  canvas: HTMLCanvasElement;
  columns: ContributionColumn[];
  weekCount: number;
  reduced: boolean;
  animateEntrance: boolean;
  ready: (rendered: boolean) => void;
};

export function createContributionSculpture({ canvas, columns, weekCount, reduced, animateEntrance, ready }: Artwork) {
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
  const view = contributionView;
  const tint = (name: string) => ({ value: new Color(color.getPropertyValue(name).trim()) });
  const uniforms = {
    uTime: { value: reduced || !animateEntrance ? formationTime : 0 },
    uNight: tint("--background"),
    uRose: tint("--accent-source"),
    uStone: tint("--accent-stone"),
    uIvory: tint("--text-primary"),
    uMauve: tint("--accent-mauve"),
    uWeeks: { value: weekCount },
    uView: { value: direction },
    uHover: { value: -1 },
    uPinned: { value: -1 },
    uPress: { value: -1 },
    uLift: { value: 0 },
    uSweep: { value: 2 },
    uMotion: { value: reduced ? 0 : 1 },
  };
  const blank = new RoundedBoxGeometry(footprintX, 1, footprintZ, 2, .12);
  blank.deleteAttribute("uv");
  const geometry = mergeVertices(blank);
  blank.dispose();
  const attributes = new Float32Array(columns.length * 4);
  const weekOffsets = new Uint16Array(weekCount + 1);
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
  const mesh = new InstancedMesh(geometry, material, columns.length);
  const transform = new Matrix4();
  for (const [id, column] of columns.entries()) {
    attributes.set([column.height, column.intensity, column.x / Math.max(1, weekCount - 1), id], id * 4);
    mesh.setMatrixAt(id, transform.makeTranslation(column.x, 0, column.z));
    weekOffsets[column.x + 1]++;
  }
  for (let i = 1; i < weekOffsets.length; i++) weekOffsets[i] += weekOffsets[i - 1];
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
  const groundGeometry = new PlaneGeometry(weekCount + 1, 7.5).rotateX(-Math.PI / 2).translate((weekCount - 1) / 2, -.025, 2.99);
  const groundMaterial = new ShaderMaterial({
    uniforms, vertexShader: groundVertex, fragmentShader: groundFragment, transparent: true, depthWrite: false,
  });
  const ground = new Mesh(groundGeometry, groundMaterial);
  ground.renderOrder = -1;
  scene.add(ground);

  const raycaster = new Raycaster();
  const cursor = new Vector2();
  const box = new Box3();
  const intersection = new Vector3();
  const projected = new Vector3();
  let visible = false, frame = 0, previous = 0, first = true;
  let sweep = 1, velocity = 0, springTime = 0;
  let width = 0, height = 0, pitch = 1;

  function pose() {
    direction.set(view.eye.x + lean.x * .022, view.eye.y + lean.y * .022, view.eye.z).normalize();
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
    const seconds = previous ? Math.min(.05, (now - previous) / 1000) : 0;
    const time = Math.min(formationTime, uniforms.uTime.value + seconds);
    const ease = reduced ? 1 : 1 - Math.exp(-seconds / .045);
    previous = now;
    const targetLift = uniforms.uHover.value < 0 || reduced ? 0 : .11;
    uniforms.uTime.value = time;

    // Fixed steps keep the short, damped spring consistent across refresh rates.
    const step = 1 / 120;
    springTime += seconds;
    while (springTime >= step) {
      velocity += ((targetLift - uniforms.uLift.value) * 445 - velocity * 34) * step;
      uniforms.uLift.value += velocity * step;
      springTime -= step;
    }
    if (sweep < 1) sweep = Math.min(1, sweep + seconds / .26);
    uniforms.uSweep.value = reduced ? 2 : sweep * 1.56 - .27;
    if (lean.distanceToSquared(hover) > .00008) {
      lean.lerp(hover, ease);
      pose();
    }
    renderer.render(scene, camera);
    if (first) {
      first = false;
      ready(!shaderFailed);
      if (shaderFailed) {
        visible = false;
        return;
      }
    }
    const moving = time < formationTime || sweep < 1 || lean.distanceToSquared(hover) > .00008
      || Math.abs(targetLift - uniforms.uLift.value) > .0011 || Math.abs(velocity) > .028;
    if (moving) request();
    else previous = 0;
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
      else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
      }
    },
    emphasize(hot: number, pinned: number, x = 0, y = 0) {
      if (!reduced && ((hot >= 0 && hot !== uniforms.uHover.value) || (pinned >= 0 && pinned !== uniforms.uPinned.value))) {
        sweep = 0;
      }
      uniforms.uHover.value = hot;
      uniforms.uPinned.value = pinned;
      hover.set(reduced ? 0 : x, reduced ? 0 : y);
      request();
    },
    press(index: number) {
      uniforms.uPress.value = index;
      request();
    },
    hit(x: number, y: number, touch: boolean) {
      if (!width || !height || x < 0 || x >= width || y < 0 || y >= height) return -1;
      cursor.set(x / width * 2 - 1, 1 - y / height * 2);
      raycaster.setFromCamera(cursor, camera);
      const guess = x / pitch - view.left;
      let best = -1, nearest = Infinity, near = -1, distance = touch ? 95 : 26;
      const first = weekOffsets[Math.max(0, Math.floor(guess - 4.25))];
      const last = weekOffsets[Math.min(weekCount, Math.max(0, Math.ceil(guess + 4.25)))];
      for (let index = first; index < last; index++) {
        const column = columns[index];
        const wave = Math.max(0, Math.min(1, (uniforms.uTime.value - attributes[index * 4 + 2] * formationStagger) / formationRise));
        const compressed = !reduced && index === uniforms.uPress.value ? .965 : 1;
        const columnHeight = (thickness + (column.height - thickness) * (1 - (1 - wave) ** 3)) * compressed;
        const lift = reduced ? 0 : Math.max(index === uniforms.uHover.value ? uniforms.uLift.value : 0,
          index === uniforms.uPinned.value ? .044 : 0);
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
      groundGeometry.dispose();
      groundMaterial.dispose();
      renderer.dispose();
    },
  };
}
