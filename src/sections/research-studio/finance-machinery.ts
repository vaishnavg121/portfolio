import { Color, CylinderGeometry, Group, Mesh, PlaneGeometry, TorusGeometry, Vector3, type MeshBasicMaterial } from "three";
import { modelGroup, placeShadow, plateMaterial, type StudioMaterials } from "./studio-model";

export type FinanceComposition = "research" | "engineering" | "hybrid";

const layouts = {
  research: { width: 1.86, depth: .90, height: 1.05, x: -.73, riskRadius: .44, ledgerWidth: 1.18 },
  engineering: { width: 1.28, depth: .72, height: .79, x: -.89, riskRadius: .38, ledgerWidth: 1.84 },
  hybrid: { width: 1.71, depth: .90, height: .96, x: -.78, riskRadius: .42, ledgerWidth: 1.58 },
} as const;

export function financeMachinery(root: Group, m: StudioMaterials, shadow: MeshBasicMaterial, composition: FinanceComposition) {
  const layout = layouts[composition];
  const { width, depth, height, ledgerWidth } = layout;
  const lab = modelGroup(root);
  const { box, piece, cylinder } = lab;
  const sage = new Color(0x587164);
  const bronze = m.satin(m.stone.clone().lerp(m.night, .22), .46, .51);
  const enamel = m.satin(m.night.clone().lerp(sage, .33), .42, .31);
  const stone = m.satin(m.stone.clone().lerp(m.night, .56), .45, .24);
  const measurement = m.satin(sage.clone().lerp(m.ivory, .22), .46, .48);
  const glaze = m.smoke.clone();
  glaze.color.copy(sage).lerp(m.ivory, .29);
  glaze.opacity = .19;
  const indicator = () => {
    const light = m.trace.clone();
    light.color.copy(sage).lerp(m.ivory, .31);
    return light;
  };
  const marketLight = indicator(), riskLight = indicator(), ledgerLight = indicator();
  const market = new Vector3(layout.x, .53, -.18);
  const risk = new Vector3(1.05, .868, -.43);
  const ledger = new Vector3(.83, .35, .49);
  const riskRadius = layout.riskRadius;
  const input = new Vector3(market.x - width / 2 + .04, .38, .352);
  const marketExit = new Vector3(market.x + width / 2 + .096, .422, -.27);
  const riskInput = new Vector3(risk.x - .46, .434, risk.z + .03);
  const riskExit = new Vector3(risk.x + .398, .397, risk.z + .225);
  const ledgerIn = new Vector3(ledger.x + ledgerWidth / 2 - .105, .441, ledger.z - .262);
  const ledgerOut = new Vector3(ledger.x - ledgerWidth / 2 - .078, .471, ledger.z + .144);

  // Shared mount and shadow. Each instrument has separate vibration-isolating feet.
  placeShadow(root, shadow, new Vector3(0, .005, -.038), 3.94, 1.88);
  box(m.rubber, 0, .057, -.034, 3.63, .110, 1.69, .09);
  box(stone, 0, .126, -.034, 3.57, .090, 1.63, .055);
  box(m.ceramic, 0, .187, -.034, 3.47, .055, 1.53, .035);
  for (const x of [-1.63, 1.61]) for (const z of [-.67, .64]) {
    cylinder(m.edge, x, .223, z, .030, .033, 9);
    cylinder(m.rubber, x, .243, z, .012, .007, 8);
  }

  // A suspended measurement plane framed by a shallow instrument deck and three rails.
  box(enamel, market.x, .279, market.z, width + .31, .173, depth + .24, .083);
  box(m.alloy, market.x, .372, market.z, width + .27, .055, depth + .21, .030);
  box(stone, market.x, .409, market.z, width + .11, .042, depth + .095, .020);
  box(m.rubber, market.x, .429, market.z, width, .021, depth, .018);
  const rails = [.0, .5, 1];
  for (const t of rails) {
    box(m.metal, market.x, .45, market.z + (t - .5) * depth, width + .052, .015, .019, .006);
  }
  for (const side of [-1, 1]) {
    const x = market.x + side * (width / 2 + .076);
    for (const z of [market.z - depth / 2, market.z + depth / 2]) {
      box(bronze, x, .50, z, .079, .17, .079, .023);
      cylinder(m.edge, x, .59, z, .046, .039, 12);
      cylinder(m.rubber, x, .612, z, .019, .01, 8);
    }
    box(bronze, x, .599, market.z, .038, .032, depth + .13, .014);
  }
  box(bronze, market.x, .572, market.z + depth / 2 + .013, width + .125, .028, .027, .014);
  box(bronze, market.x - width / 2 - .075, .837, market.z - depth / 2, .037, .49, .043, .017);
  box(marketLight, market.x - width / 2 - .072, 1.089, market.z - depth / 2, .046, .029, .048, .013);
  for (let i = 0; i <= 12; i++) {
    const x = market.x + (i / 12 - .5) * width;
    box(i % 3 ? measurement : m.edge, x, .589, market.z + depth / 2 + .013, .011, .009, i % 3 ? .015 : .028, .004);
  }
  for (let i = 0; i < 6; i++) {
    box(m.edge, market.x - width / 2 - .051, .655 + i * .08, market.z - depth / 2, .023, .008, .023, .003);
  }
  for (const x of [market.x - .21, market.x + .19]) {
    cylinder(bronze, x, .432, .364, .047, .044, 12);
    cylinder(m.edge, x, .463, .364, .034, .018, 12);
  }
  box(marketLight, market.x, .320, .381, .28, .019, .021, .008);

  // A graduated gimbal carries the loss distribution above its base.
  box(m.alloy, risk.x, .280, risk.z, 1.02, .137, .69, .075);
  box(enamel, risk.x, .361, risk.z, .95, .085, .63, .042);
  box(m.edge, risk.x, .405, risk.z, .73, .023, .48, .012);
  for (const side of [-1, 1]) {
    const x = risk.x + side * riskRadius;
    box(bronze, x, .597, risk.z - .024, .078, .40, .134, .028);
    cylinder(m.edge, x, .797, risk.z - .022, .061, .046, 12);
    box(riskLight, x, .452, risk.z + .08, .032, .014, .049, .006);
  }
  piece(new TorusGeometry(riskRadius, .040, 8, 36), bronze, risk.x, risk.y, risk.z);
  piece(new TorusGeometry(riskRadius + .013, .012, 6, 32), m.edge, risk.x, risk.y, risk.z + .036);
  piece(new CylinderGeometry(riskRadius * .87, riskRadius * .87, .020, 30).rotateX(Math.PI / 2), glaze, risk.x, risk.y, risk.z - .050);
  for (let index = 0; index < 20; index++) {
    const angle = index * Math.PI / 10;
    box(index % 5 ? bronze : m.edge, risk.x + Math.cos(angle) * riskRadius, risk.y + Math.sin(angle) * riskRadius,
      risk.z + .050, index % 5 ? .015 : .028, .012, .024, .004);
  }
  box(m.metal, risk.x, risk.y - .11, risk.z + .005, riskRadius * 1.65, .023, .057, .010);
  const gimbal = new Group();
  gimbal.position.copy(risk);
  root.add(gimbal);
  const ring = modelGroup(gimbal);
  ring.piece(new TorusGeometry(riskRadius * .84, .016, 7, 32), measurement, 0, 0, .010);
  ring.piece(new TorusGeometry(riskRadius * .79, .007, 5, 24), riskLight, 0, 0, .012);
  ring.box(m.edge, 0, riskRadius * .83, .015, .098, .041, .059, .016);
  ring.cylinder(bronze, 0, -riskRadius * .83, .009, .031, .06, 10);
  ring.build();

  // One intake, three channels, and a balance cradle share the engine's cold plate.
  box(m.alloy, ledger.x, .277, ledger.z, ledgerWidth + .13, .121, .722, .064);
  box(enamel, ledger.x, .353, ledger.z, ledgerWidth + .075, .069, .676, .045);
  box(stone, ledger.x, .393, ledger.z, ledgerWidth, .027, .628, .018);
  const manifoldX = ledger.x + ledgerWidth * .26;
  box(m.metal, manifoldX, .453, ledger.z, .30, .102, .533, .059);
  box(glaze, manifoldX, .528, ledger.z, .255, .072, .424, .035);
  box(bronze, manifoldX, .553, ledger.z, .052, .035, .359, .018);
  const lanes = [-.197, 0, .197].map((offset, index) => {
    const z = ledger.z + offset;
    const x = ledger.x - ledgerWidth * .14;
    box(m.rubber, x, .421, z, ledgerWidth * .59, .034, .15, .021);
    box(measurement, x, .449, z - .064, ledgerWidth * .57, .033, .020, .008);
    box(bronze, x, .449, z + .064, ledgerWidth * .57, .033, .020, .008);
    box(m.ceramic, x - ledgerWidth * .19, .482, z, .228, .089 + index * .012, .145, .031);
    const carriage = new Group();
    carriage.position.set(x - ledgerWidth * .19, .549 + index * .006, z);
    const slider = modelGroup(carriage);
    slider.box(glaze, 0, 0, 0, .180, .044, .115, .022);
    slider.box(m.edge, 0, .018, 0, .055, .017, .084, .008);
    slider.build();
    root.add(carriage);
    const light = indicator();
    box(light, x - ledgerWidth * .19, .478, z + .079, .096, .016, .014, .006);
    return { light, z, carriage, account: new Vector3(x - ledgerWidth * .19, .552 + index * .006, z) };
  });
  for (const [index, x] of [ledgerIn.x, manifoldX, ledgerOut.x].entries()) {
    const z = index === 0 ? ledgerIn.z : index === 1 ? ledger.z + .345 : ledgerOut.z;
    cylinder(bronze, x, .428, z, .046, .052, 12);
    cylinder(ledgerLight, x, .457, z, .022, .013, 10);
  }

  const gate = new Group();
  gate.position.set(manifoldX, .565, ledger.z);
  root.add(gate);
  const allocator = modelGroup(gate);
  allocator.box(m.edge, 0, 0, 0, .075, .030, .393, .012);
  for (const z of [-.17, 0, .17]) allocator.box(m.metal, 0, -.037, z, .102, .069, .046, .018);
  allocator.build();

  const balance = new Group();
  balance.position.set(ledgerOut.x + .03, .514, ledgerOut.z);
  root.add(balance);
  const lever = modelGroup(balance);
  lever.box(bronze, 0, 0, 0, .316, .031, .125, .015);
  lever.box(m.edge, 0, -.022, 0, .060, .062, .085, .019);
  for (const x of [-.126, .126]) {
    lever.cylinder(m.edge, x, .026, 0, .041, .034, 12);
    lever.cylinder(ledgerLight, x, .045, 0, .018, .008, 9);
  }
  lever.build();
  box(m.rubber, balance.position.x, .408, balance.position.z, .30, .112, .21, .027);
  box(m.metal, balance.position.x, .472, balance.position.z, .28, .026, .186, .013);
  for (const p of [input, marketExit, riskInput, riskExit]) {
    cylinder(bronze, p.x, p.y - .018, p.z, .044, .055, 10);
    cylinder(m.edge, p.x, p.y + .007, p.z, .027, .014, 10);
  }
  lab.build();

  function plate(label: string, note: string, x: number, y: number, z: number, size: number) {
    const plaque = new Mesh(new PlaneGeometry(size, size * .225), plateMaterial(m, label, note, true));
    plaque.position.set(x, y, z);
    plaque.rotation.x = -1.21;
    root.add(plaque);
  }
  plate("SCENARIO P&L", "← SPOT  /  TIME REMAINING", market.x, .425, .41, .66);
  plate("LOSS DISTRIBUTION", "95% CUT  /  TAIL MEAN", risk.x - .11, .426, -.104, .58);
  plate("TRANSACTION", "INTEGER MINOR UNITS", ledger.x + .075, .431, .83, .56);

  return {
    market, risk, ledger, width, depth, height, riskRadius, lanes, gimbal, gate, balance, sage,
    input, marketExit, riskInput, riskExit, ledgerIn, ledgerOut, marketLight, riskLight, ledgerLight,
  };
}
