import { ExtrudeGeometry, Group, Mesh, PlaneGeometry, ShaderMaterial, Shape, Vector3, type Material } from "three";
import { modelGroup, placeShadow, plateMaterial, type StudioMaterials } from "./studio-model";
import { studioBays } from "./studio-plan";
import type { MeshBasicMaterial } from "three";

const nameplates = [
  ["SYSTEMS", "ROBOTICS BAY"], ["AGENTIC", "RAG BAY"], ["MARKETS", "FINANCE BAY"], ["FORECASTING", "AI / MACHINE LEARNING"],
] as const;

function foundation(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, straight: boolean) {
  const outline = new Shape();
  outline.moveTo(-5.91,3.53);
  outline.lineTo(10.26,3.53);
  outline.lineTo(10.26,-(straight ? 4.16 : 4.45));
  if (!straight) {
    outline.lineTo(6.21,-4.45);
    outline.lineTo(4.66,-3.66);
  }
  outline.lineTo(-5.91,-(straight ? 4.16 : 3.66));
  outline.closePath();

  const floor = m.satin(m.night.clone().lerp(m.stone,.118),.79,.08);
  floor.onBeforeCompile = shader => {
    shader.vertexShader = "varying vec2 floorPosition;\n"+shader.vertexShader.replace("#include <begin_vertex>",
      "#include <begin_vertex>\nfloorPosition = position.xz;");
    shader.fragmentShader = "varying vec2 floorPosition;\n"+shader.fragmentShader.replace("#include <color_fragment>",`
      #include <color_fragment>
      float row = floor(floorPosition.y / .91);
      vec2 panel = vec2(floorPosition.x / 1.54 + mod(row, 2.) * .33, floorPosition.y / .91);
      vec2 edge = min(fract(panel), 1. - fract(panel));
      float joint = smoothstep(.003,.013,min(edge.x,edge.y));
      float tone = fract(sin(dot(floor(panel),vec2(12.9898,78.233))) * 43758.546);
      diffuseColor.rgb *= mix(.76,.95 + tone*.085,joint);
    `);
  };
  function layer(material: Material, y: number, height: number, bevel: number) {
    const section = new ExtrudeGeometry(outline,{depth:height,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:bevel,bevelThickness:bevel});
    section.rotateX(-Math.PI/2);
    const mesh = new Mesh(section,material);
    mesh.position.y = y;
    parent.add(mesh);
  }
  layer(m.rubber,-.72,.145,.043);
  layer(m.alloy,-.57,.105,.072);
  layer(m.edge,-.444,.031,.050);
  layer(m.ceramic,-.37,.30,.085);
  layer(floor,-.052,.071,.022);
  placeShadow(parent,shadow,new Vector3(2.14,-.77,.47),19.4,11.5);
}

export function studioArchitecture(parent: Group, m: StudioMaterials, shadow: MeshBasicMaterial, variant: string, straight: boolean) {
  const room = modelGroup(parent);
  foundation(parent,m,shadow,straight);
  const floorShades = [.046, .066, .077].map(m.tile);

  // The two service trenches and their crossing spine connect all bay plinths.
  room.box(m.rubber,0,.063,.015,11.43,.038,.31,.019);
  for (const z of [-.123,.153]) room.box(m.metal,0,.091,z,11.35,.014,.018,.007);
  room.box(m.rubber,0,.052,.04,.16,.020,6.94,.009);
  room.box(m.metal,0,.067,.04,.024,.014,6.94,.006);
  room.box(m.alloy, 0, .099, .024, .42, .030, .41, .066);
  room.cylinder(m.edge, 0, .125, .024, .11, .035, 18);

  for (const [index, bay] of studioBays.entries()) {
    const { x, z } = bay;
    const active = bay.id === "learning";
    const width = active ? 4.40 : index === 1 ? 3.79 : 3.97;
    const depth = active ? 2.27 : index === 2 ? 1.90 : 2.02;
    const level = active ? .25 : .070;
    placeShadow(parent, shadow, new Vector3(x, .049, z), width + 1.13, depth + .86);
    room.box(m.rubber, x, .065, z, width + .08, .09, depth + .07, .054);
    if (active) room.box(m.alloy, x, .171, z, width + .08, .094, depth + .08, .055);
    room.box(active ? m.grout : floorShades[index], x, level, z, width, active ? .105 : .056, depth, .058);
    room.box(active ? m.trace : m.metal, x, level, z + depth / 2 + .015, width - .43, .015, .023);
    room.box(m.edge, x - width * .5 + .23, level + .057, z - depth * .5 + .12, .20, .017, .038);
    room.box(m.metal, x + width * .5 - .23, level + .057, z - depth * .5 + .12, .20, .017, .038);
    if (!active) {
      const track = index === 0 ? m.alloy : m.metal;
      room.box(track, x, .105, z - .61, width - .32, .018, .02);
      if (index === 0) {
        for (const offset of [-.61, .61]) room.box(m.rubber, x + offset, .096, z, .095, .027, 1.44);
      } else {
        for (const offset of [-1.03, 1.03]) room.box(m.rubber, x + offset, .096, z, .064, .027, .88);
      }
    }
    const [label, sub] = nameplates[index];
    const plaque = new Mesh(new PlaneGeometry(active ? 1.54 : 1.36, .33), plateMaterial(m, label, sub, active));
    plaque.rotation.x = -Math.PI / 2;
    plaque.position.set(x, level + .061, z + depth / 2 - .22);
    parent.add(plaque);
    const direction = Math.sign(z);
    room.box(m.alloy, x, .072, z - direction * 1.22, .31, .04, .45, .02);
    room.box(m.strip, x, .102, z - direction * 1.18, .074, .012, .43);
    for (const dx of [-1, 1]) {
      room.cylinder(m.metal, x + dx * (width / 2 - .18), level + .058, z + depth / 2 - .16, .038, .014, 10);
      room.cylinder(m.metal, x + dx * (width / 2 - .18), level + .058, z - depth / 2 + .16, .038, .014, 10);
    }
  }

  const rearHeight = 3.18, rear = -3.38;
  if (variant !== "A") {
    for (const x of [-5.61, -2.86, 0, 2.86, 5.61]) {
      room.box(m.rubber, x, .13, rear, .31, .24, .39, .04);
      room.box(m.metal, x, rearHeight * .5, rear, .16, rearHeight, .23, .039);
      room.box(m.edge, x, rearHeight * .5, rear + .122, .031, 2.91, .024);
    }
    room.box(m.alloy, 2.31, rearHeight, rear, 16.07, .198, .32, .06);
    room.box(m.edge, 2.31, rearHeight - .077, rear + .16, 15.92, .023, .035);
    room.box(m.strip, 2.31, rearHeight - .13, rear + .14, 15.65, .029, .048);
    room.box(m.metal, 2.30, .49, rear, 15.94, .078, .16, .025);
    room.box(m.alloy, 0, 2.35, rear, 11.39, .065, .13, .025);
    const sheen = new ShaderMaterial({
      uniforms: { tint: { value: m.ivory } },
      vertexShader: `varying vec2 pane; void main(){pane=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `uniform vec3 tint; varying vec2 pane;
        void main(){
          float diagonal = pane.x + pane.y * .78;
          float streak = (1. - smoothstep(.04, .34, abs(diagonal - .94))) * .17;
          float frost = (1. - smoothstep(0., .93, pane.y)) * .10;
          gl_FragColor = vec4(tint, streak+frost);
          #include <colorspace_fragment>
        }`,
      transparent: true, depthWrite: false,
    });
    for (const x of [-4.23, -1.43, 1.43, 4.23]) {
      room.box(m.smoke, x, 1.405, rear, 2.63, 1.78, .095, .04);
      const shine = new Mesh(new PlaneGeometry(2.60, 1.77), sheen);
      shine.position.set(x, 1.405, rear + .056);
      parent.add(shine);
      room.box(m.grout, x, .33, rear, 2.58, .18, .14, .04);
      for (const y of [.65, .72, .79]) room.box(m.strip, x, y, rear + .054, 2.45, .011, .011);
    }
    for (const z of [-1.0, 1.12]) {
      const height = variant === "B" ? rearHeight : 1.71;
      room.box(m.metal, -5.61, height * .5, z, .19, height, .16, .04);
      room.box(m.rubber, -5.61, .095, z, .30, .17, .32, .049);
    }
    const sideTop = variant === "B" ? rearHeight : 1.71;
    room.box(m.alloy, -5.61, sideTop, -1.12, .23, .14, 4.52);
    room.box(m.edge, -5.49, sideTop, -1.12, .024, .036, 4.36);
    room.box(m.smoke, -5.61, (sideTop + .38) / 2, -2.15, .082, sideTop - .48, 2.27, .03);
    room.box(m.smoke, -5.61, (sideTop + .38) / 2, .08, .082, sideTop - .48, 1.94, .03);
    if (variant === "B") {
      room.box(m.alloy, 5.61, rearHeight, -1.72, .26, .18, 3.4);
      room.box(m.metal, 5.61, 1.6, -.10, .18, 3.20, .22);
      room.box(m.smoke, 5.61, 1.63, -1.70, .086, 2.47, 3.16);
    } else {
      room.box(m.alloy, 0, .68, -2.25, .10, 1.31, .14, .024);
      room.box(m.smoke, 0, .87, -2.36, .061, 1.00, 1.58, .025);
      room.box(m.metal, 0, 1.39, -2.36, .12, .053, 1.70);
    }
  } else {
    room.box(m.alloy, 0, .48, rear, 11.36, .85, .24, .07);
    room.box(m.strip, 0, .91, rear, 11.31, .033, .22);
  }

  for (const x of [-5.44, -.28, .28, 4.52]) {
    room.box(m.grout, x, -.25, 3.64, .14, .10, .028, .014);
    room.box(m.strip, x, -.22, 3.659, .066, .021, .012);
  }
  room.build();
}
