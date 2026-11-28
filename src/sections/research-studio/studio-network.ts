import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, CapsuleGeometry, DynamicDrawUsage, Group,
  InstancedMesh, LineBasicMaterial, LineCurve3, LineSegments, MathUtils,
  MeshBasicMaterial, Object3D, PlaneGeometry, TorusGeometry, Vector3, type Curve,
} from "three";
import { portStation, studioScenarios, scenarioIds, type ActiveBeat, type Port, type ScenarioId } from "./studio-choreography";
import { studioRail, type StationPorts } from "./studio-ports";
import { modelGroup, type StudioMaterials } from "./studio-model";
import { studioStationIds, type StudioStationId } from "./studio-plan";

type Section = { curve: Curve<Vector3>; size: number; reversed: boolean };
type Route = { source: Port; destination: Port; parts: Section[]; length: number; crossesCenter: boolean };
const point = (x: number, y: number, z: number) => new Vector3(x, y, z);
const onRail = (x: number) => point(x,studioRail.y,studioRail.z);
const smooth = MathUtils.smoothstep;

function floorReflection() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 32;
  const context = canvas.getContext("2d")!;
  const radial = context.createRadialGradient(16,16,1,16,16,16);
  radial.addColorStop(0,"rgba(255,255,255,.28)");
  radial.addColorStop(.36,"rgba(255,255,255,.12)");
  radial.addColorStop(1,"rgba(255,255,255,0)");
  context.fillStyle = radial;
  context.fillRect(0,0,32,32);
  return new CanvasTexture(canvas);
}

export function studioNetwork(parent: Group, m: StudioMaterials, ports: Record<StudioStationId, StationPorts>, hub: boolean) {
  const assembly = modelGroup(parent);
  const endpoints = new Map<Port, { curve?: Curve<Vector3>; terminal: Vector3 }>([["bus",{ terminal:onRail(0) }]]);
  const tint = {
    learning: m.rose.clone().lerp(m.ivory,.59),
    agentic: m.mauve.clone().lerp(m.rose,.28),
    markets: m.stone.clone().lerp(m.ivory,.46),
    software: ports.software.tint ?? m.stone.clone().lerp(m.ivory,.27),
    bus: m.ivory.clone().lerp(m.stone,.43),
  };
  const darkMetal = m.satin(m.stone.clone().lerp(m.night,.46),.42,.64);
  const optical = m.trace.clone();
  optical.color.copy(m.stone).lerp(m.mauve,.18).multiplyScalar(.47);
  for (const id of studioStationIds) {
    for (const [name,curve] of [["in",ports[id].input],["out",ports[id].output]] as const) {
      endpoints.set(`${id}:${name}`, { curve, terminal:curve.points[curve.points.length - 1] });
    }
  }
  const terminalXs = [...new Set([...endpoints.values()].flatMap(p => p.curve ? [p.terminal.x] : []))];
  const left = Math.min(...terminalXs), right = Math.max(...terminalXs);
  const center = (left + right) * .5;
  const length = right - left;
  assembly.box(darkMetal,center,.114,studioRail.z,length+.14,.036,.112,.015);
  for (const z of [studioRail.z-.046,studioRail.z+.046]) assembly.box(m.edge,center,.135,z,length+.11,.015,.012,.006);
  assembly.box(optical,center,.14,studioRail.z,length,.009,.025,.004);

  const terminalLamps = new Map<number, MeshBasicMaterial>();
  for (const x of terminalXs) {
    const terminal = m.trace.clone();
    terminal.color.copy(optical.color);
    terminalLamps.set(x,terminal);
    assembly.box(m.alloy,x,.130,studioRail.z,.211,.043,.183,.024);
    assembly.box(m.edge,x,.156,studioRail.z,.154,.016,.127,.012);
    assembly.box(darkMetal,x,.170,studioRail.z,.102,.014,.081,.008);
    assembly.box(terminal,x,.181,studioRail.z,.064,.010,.037,.005);
    for (const side of [-1,1]) assembly.cylinder(m.metal,x+side*.082,.158,studioRail.z,.013,.010,7);
  }
  const hubLamp = optical.clone();
  if (hub) {
    assembly.cylinder(darkMetal,0,.143,studioRail.z,.264,.054,24);
    assembly.cylinder(m.edge,0,.175,studioRail.z,.231,.029,24);
    assembly.cylinder(m.smoke,0,.201,studioRail.z,.205,.021,24);
    assembly.cylinder(m.alloy,0,.192,studioRail.z,.128,.027,18);
    assembly.piece(new TorusGeometry(.188,.011,6,26).rotateX(Math.PI * -.5),hubLamp,0,.198,studioRail.z);
    for (const x of [-.255,.255]) assembly.box(m.edge,x,.163,studioRail.z,.083,.036,.071,.013);
  } else {
    assembly.box(m.metal,0,.147,studioRail.z,.368,.022,.155,.015);
    assembly.box(hubLamp,0,.164,studioRail.z,.174,.012,.025,.006);
  }
  assembly.build();

  const routes = new Map<string, Route>();
  function route(from: Port,to: Port) {
    const key = `${from}/${to}`;
    const cached = routes.get(key);
    if (cached) return cached;
    const source = endpoints.get(from)!;
    const destination = endpoints.get(to)!;
    const sameTap = source.terminal.distanceToSquared(destination.terminal) < .000001;
    const parts: Section[] = [];
    function add(curve: Curve<Vector3>, reversed = false) {
      parts.push({curve,reversed,size:curve.getLength()});
    }
    if (source.curve) add(source.curve);
    if (!sameTap) add(new LineCurve3(source.terminal,destination.terminal));
    if (destination.curve) add(destination.curve,true);
    const result = {source:from,destination:to,parts,length:parts.reduce((count,part)=>count+part.size,0),
      crossesCenter: source.terminal.x * destination.terminal.x <= 0 };
    routes.set(key,result);
    return result;
  }
  for (const id of scenarioIds) {
    for (const cue of studioScenarios[id].beats) if (cue.kind === "transfer") route(cue.from,cue.to);
  }

  const packetMaterial = new MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false});
  const sheen = new MeshBasicMaterial({map:floorReflection(),color:m.ivory,transparent:true,depthWrite:false,blending:AdditiveBlending});
  const packets = new InstancedMesh(new CapsuleGeometry(.020,.104,3,7).rotateZ(-Math.PI*.5),packetMaterial,18);
  const floorGlow = new InstancedMesh(new PlaneGeometry(1,1).rotateX(-Math.PI*.5),sheen,10);
  const trailPosition = new BufferAttribute(new Float32Array(384),3).setUsage(DynamicDrawUsage);
  const trailColors = new BufferAttribute(new Float32Array(384),3).setUsage(DynamicDrawUsage);
  const trailGeometry = new BufferGeometry().setAttribute("position",trailPosition).setAttribute("color",trailColors);
  const trailPaint = new LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false});
  const trail = new LineSegments(trailGeometry,trailPaint);
  trail.frustumCulled = false;
  trail.visible = false;
  trail.renderOrder = 3;
  packets.frustumCulled = floorGlow.frustumCulled = false;
  packets.count = floorGlow.count = 0;
  packets.renderOrder = 4;
  floorGlow.renderOrder = 1;
  parent.add(floorGlow,trail,packets);

  const body = new Object3D();
  const ahead = new Vector3();
  const tapHead = new Vector3();
  const axis = new Vector3(1,0,0);
  const coloring = m.ivory.clone();
  const emission: Record<StudioStationId,number> = {learning:0,agentic:0,markets:0,software:0};
  let previous: Route | undefined, previousProgress = 0, intensity = 0;
  let lastStatic: ScenarioId | undefined;

  function sample(path: Route, distance: number, target: Vector3) {
    for (const part of path.parts) {
      if (distance <= part.size) {
        const t = MathUtils.clamp(distance / Math.max(.001,part.size),0,1);
        return part.curve.getPointAt(part.reversed ? 1-t : t,target);
      }
      distance -= part.size;
    }
    return target.copy(endpoints.get(path.destination)!.curve?.getPointAt(0) ?? endpoints.get(path.destination)!.terminal);
  }

  function tintOf(port: Port) {
    return tint[portStation(port) ?? "bus"];
  }

  function render(path: Route, progress: number, gain: number, detailed: boolean, fixed: boolean) {
    const markers = fixed ? 11 : detailed ? 14 : 9;
    let count = 0, reflected = 0;
    const head = path.length * progress;
    for (let i = 0; i < markers; i++) {
      const distance = fixed ? path.length * (i + .5) / markers : head - i * (detailed ? .175 : .203);
      if (distance <= .035 || distance >= path.length - .018) continue;
      sample(path,distance,body.position);
      sample(path,Math.min(path.length,distance+.026),ahead);
      ahead.sub(body.position).normalize();
      body.quaternion.setFromUnitVectors(axis,ahead);
      const lead = fixed ? .56 : 1 - i / markers;
      body.scale.set(.58 + lead * 1.18, .63 + lead * .85, .63 + lead * .85);
      body.position.y += .037;
      body.updateMatrix();
      packets.setMatrixAt(count,body.matrix);
      coloring.copy(tintOf(path.source)).lerp(tintOf(path.destination),smooth(distance/path.length,.47,.95))
        .lerp(m.ivory,.22 + .18 * lead).multiplyScalar(.72 + lead * 1.42);
      packets.setColorAt(count++,coloring);
      if (body.position.y > .242 || body.position.y < .09 || i % 2 > 0 || reflected >= 10) continue;
      body.position.y = .151;
      body.quaternion.identity();
      body.scale.setScalar(.35 + lead * .62);
      body.updateMatrix();
      floorGlow.setMatrixAt(reflected++,body.matrix);
    }
    packets.count = count;
    floorGlow.count = reflected;
    const span = fixed ? 64 : 16;
    const first = fixed ? 0 : Math.max(0,head - (detailed ? 1.75 : 1.15));
    const last = fixed ? path.length : Math.min(path.length,head);
    trail.visible = last > first + .025;
    for (let i = 0; i < span && trail.visible; i++) {
      for (const side of [0,1]) {
        const fade = (i + side) / span;
        const distance = first + (last - first) * fade;
        sample(path,distance,ahead);
        trailPosition.setXYZ(i*2+side,ahead.x,ahead.y+.032,ahead.z);
        coloring.copy(tintOf(path.source)).lerp(tintOf(path.destination),smooth(distance/path.length,.42,.97))
          .lerp(m.ivory,.26).multiplyScalar(fixed ? .98 : .24 + fade * 1.1);
        trailColors.setXYZ(i*2+side,coloring.r,coloring.g,coloring.b);
      }
    }
    trailGeometry.setDrawRange(0,span*2);
    trailPosition.needsUpdate = trailColors.needsUpdate = true;
    trailPaint.opacity = gain * (fixed ? .89 : .70);
    packetMaterial.opacity = gain * .96;
    sheen.opacity = gain * .63;
    packets.instanceMatrix.needsUpdate = floorGlow.instanceMatrix.needsUpdate = true;
    if (packets.instanceColor) packets.instanceColor.needsUpdate = true;
  }

  return {
    emission,
    stationPoint(id: StudioStationId) { return ports[id].input.points[0]; },
    update(active: ActiveBeat | null, fixed: ScenarioId | undefined, elapsed: number) {
      for (const id of studioStationIds) emission[id] = 0;
      const cue = active ? studioScenarios[active.id].beats[active.index] : null;
      const routeBeat = cue?.kind === "transfer" ? cue : null;
      const stationary = fixed ? studioScenarios[fixed].beats.find(step =>
        step.kind === "transfer" && step.from !== "bus" && step.to !== "bus") : null;
      let lane: Route | undefined;
      if (stationary?.kind === "transfer") {
        lane = route(stationary.from,stationary.to);
        if (lastStatic !== fixed) render(lane,.5,.76,true,true);
        previous = undefined;
        intensity = .76;
      } else if (active && routeBeat) {
        lane = route(routeBeat.from,routeBeat.to);
        previous = lane;
        previousProgress = active.progress;
        intensity = active.guided ? 1 : .79;
        render(lane,active.progress,intensity,active.guided,false);
        const source = portStation(routeBeat.from), destination = portStation(routeBeat.to);
        if (source) emission[source] = 1 - smooth(active.progress,.10,.52);
        if (destination) emission[destination] = smooth(active.progress,.77,1);
      } else if (previous && intensity > .018 && elapsed > 0) {
        intensity *= Math.exp(-elapsed * 9.8);
        render(previous,previousProgress,intensity,false,false);
      } else {
        packets.count = floorGlow.count = 0;
        trail.visible = false;
        previous = undefined;
        intensity = 0;
      }
      lastStatic = fixed;
      if (lane) sample(lane, lane.length * (active?.progress ?? .5), tapHead);
      const onTrench = !!lane && Math.abs(tapHead.z - studioRail.z) < .21 && tapHead.y < .23;
      for (const [x,light] of terminalLamps) {
        light.color.copy(optical.color);
        if (!lane || !onTrench) continue;
        const highlight = (1 - smooth(Math.abs(x - tapHead.x),.053,.48)) * intensity;
        light.color.lerp(tintOf(lane.destination), highlight);
      }
      hubLamp.color.copy(optical.color);
      if (lane?.crossesCenter && onTrench) hubLamp.color.lerp(m.ivory,.75 * intensity * (1 - smooth(Math.abs(tapHead.x),.04,.68)));
    },
  };
}
