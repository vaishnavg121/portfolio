import {
  BufferAttribute, BufferGeometry, DoubleSide, DynamicDrawUsage, Group, LineBasicMaterial, LineSegments,
  MathUtils, Mesh, MeshStandardMaterial, type Color,
} from "three";
import { protectedSharePnl } from "./markets-math";

type SurfaceDimensions = { width: number; depth: number; height: number };
const columns = 24;
const rows = 12;

export function marketSurface(parent: Group, dimensions: SurfaceDimensions, low: Color, high: Color, trace: Color, scanner: Color) {
  const { width, depth, height } = dimensions;
  const meshPosition = new BufferAttribute(new Float32Array((columns + 1) * (rows + 1) * 3), 3).setUsage(DynamicDrawUsage);
  const tint = new BufferAttribute(new Float32Array(meshPosition.count * 3), 3);
  const faces: number[] = [], major: number[] = [], minor: number[] = [];
  const color = high.clone();
  for (let i = 0; i < meshPosition.count; i++) {
    const column = i % (columns + 1);
    const row = Math.floor(i / (columns + 1));
    const x = column / columns, time = row / rows;
    // Put the rising side toward the camera so the sloped face reads in the overview.
    meshPosition.setXYZ(i, (.5 - x) * width, .035, (time - .5) * depth);
    color.copy(low).lerp(high, .25 + .61 * MathUtils.smoothstep(x, .30, 1) + time * .12);
    tint.setXYZ(i, color.r, color.g, color.b);
    if (column < columns) (row % 3 === 0 ? major : minor).push(i, i + 1);
    if (row < rows) {
      (column % 4 === 0 ? major : minor).push(i, i + columns + 1);
      if (column < columns) faces.push(i, i + 1, i + columns + 1, i + 1, i + columns + 2, i + columns + 1);
    }
  }

  const surface = new BufferGeometry().setAttribute("position", meshPosition).setAttribute("color", tint).setIndex(faces);
  const glass = new MeshStandardMaterial({
    side: DoubleSide, vertexColors: true, transparent: true, opacity: .51, depthWrite: false,
    metalness: .19, roughness: .36, emissive: low, emissiveIntensity: .07,
  });
  const sheet = new Mesh(surface, glass);
  sheet.frustumCulled = false;
  parent.add(sheet);

  const lattice = new BufferGeometry().setAttribute("position", meshPosition).setIndex([...major, ...minor]);
  const gridMaterial = new LineBasicMaterial({ color: trace, transparent: true, opacity: .48, depthWrite: false });
  const grid = new LineSegments(lattice, gridMaterial);
  grid.position.y = .008;
  grid.frustumCulled = false;
  grid.renderOrder = 2;
  parent.add(grid);

  const scanPosition = new BufferAttribute(new Float32Array(columns * 6), 3).setUsage(DynamicDrawUsage);
  const scanMaterial = new LineBasicMaterial({ color: scanner, transparent: true, depthWrite: false });
  const contour = new LineSegments(new BufferGeometry().setAttribute("position", scanPosition), scanMaterial);
  contour.frustumCulled = false;
  contour.renderOrder = 3;
  parent.add(contour);

  function elevation(spot: number, time: number, volatility: number, formation: number) {
    const pnl = protectedSharePnl(spot, time * .5, volatility);
    const a = .10 + ((pnl + 6.3) / 32) * .83;
    const ready = MathUtils.smoothstep(formation, time * .42, .58 + time * .42);
    return .035 + height * a * ready;
  }
  let previousVolatility = -1, previousFormation = -1;

  return {
    update(volatility: number, formation: number, section: number, scan: number, emphasis: number, detailed: boolean) {
      if (previousVolatility !== volatility || previousFormation !== formation) {
        previousVolatility = volatility;
        previousFormation = formation;
        for (let z = 0; z <= rows; z++) {
          for (let x = 0; x <= columns; x++) {
            meshPosition.setY(z * (columns + 1) + x, elevation(74 + 56 * x / columns, z / rows, volatility, formation));
          }
        }
        meshPosition.needsUpdate = true;
        surface.computeVertexNormals();
      }
      glass.opacity = .24 + formation * .36;
      gridMaterial.opacity = .38 + emphasis * .22;
      lattice.setDrawRange(0, detailed ? major.length + minor.length : major.length);
      contour.visible = scan > .015;
      if (!contour.visible) return;
      scanMaterial.opacity = scan * (.71 + .20 * emphasis);
      let previous = elevation(74, section, volatility, formation);
      for (let i = 0; i < columns; i++) {
        const next = elevation(74 + 56 * (i + 1) / columns, section, volatility, formation);
        scanPosition.setXYZ(2 * i, (.5 - i / columns) * width, previous + .019, (section - .5) * depth);
        scanPosition.setXYZ(2 * i + 1, (.5 - (i + 1) / columns) * width, next + .019, (section - .5) * depth);
        previous = next;
      }
      scanPosition.needsUpdate = true;
    },
  };
}
