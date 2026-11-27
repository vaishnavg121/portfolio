import { DirectionalLight, HemisphereLight, PMREMGenerator, Scene, WebGLRenderer } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { StudioMaterials } from "./studio-model";

export function lightStudio(renderer: WebGLRenderer, scene: Scene, materials: StudioMaterials, style: string) {
  const environment = new RoomEnvironment();
  const generator = new PMREMGenerator(renderer);
  const reflections = generator.fromScene(environment, .045, .1, 100, { size: 64 });
  scene.environment = reflections.texture;
  scene.environmentIntensity = style === "soft" ? .88 : .56;
  environment.dispose();
  generator.dispose();

  const fill = new HemisphereLight(materials.ivory, materials.mauve.clone().multiplyScalar(.29), 1.18);
  const light = new DirectionalLight(materials.ivory, style === "soft" ? 1.66 : 2.28);
  light.position.set(-4, 8, 5);
  const rim = new DirectionalLight(materials.stone, style === "rim" ? 2.76 : 1.32);
  rim.position.set(4, 3, -7);
  const bounce = new DirectionalLight(materials.rose, .38);
  bounce.position.set(7, 2, 5);
  scene.add(fill, light, rim, bounce);
  return () => reflections.dispose();
}
