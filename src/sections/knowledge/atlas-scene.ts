import {
  cameraAt, constrainPan, fitCamera, moveCamera, resizeCamera, sampleCameraTransition, sampleGesture,
  type Camera, type CameraTransition, type GestureSample, type Point,
} from "@/lib/knowledge-camera";
import { ATLAS_TERRITORIES, SKILLS_BY_ID, TERRITORIES_BY_ID, type AtlasPosition, type Selection } from "./atlas-model";
import { OVERVIEW_BOUNDS, PAN_BOUNDS, PERSPECTIVE, landmarkPositions, pickSurface, projection, screenPoint, skillPose, territoryIndex, visibleSkills, type AtlasRenderer, type SceneFrame } from "./atlas-geometry";
import { makeCanvasAtlas } from "./atlas-canvas";
import { connectedSkillPose, connectionEndpoint, connectionsFor, routePoint, visibleProjects } from "./atlas-connections";

type AtlasElements = {
  stage: HTMLDivElement;
  webgl: HTMLCanvasElement;
  fallback: HTMLCanvasElement;
  labels: HTMLDivElement;
  scale: HTMLSpanElement;
  popup: HTMLElement;
};
type Marker = { element: HTMLElement; width: number; visible: boolean; anchor: number };
type Pointer = { x: number; y: number; pointerId: number; pointerType: string };

const clamp = (n: number, lower = 0, upper = 1) => Math.max(lower, Math.min(upper, n));
const ease = (n: number) => n * n * (3 - n * 2);

export function createAtlasScene(
  { stage, webgl, fallback, labels, scale, popup }: AtlasElements,
  leaveMap: () => void,
) {
  let world = { width: 1, height: 1, scale: 1 };
  let defaultView = fitCamera(OVERVIEW_BOUNDS, world);
  let camera = defaultView;
  let width = 1;
  let height = 1;
  let stretch = 1;
  let selection: Selection | null = null;
  let fitted = true;
  let level = 0;
  let motion: CameraTransition | null = null;
  let visible = false;
  let progress = 0;
  let formationStart = -1;
  let labelView = "";
  let hover = -1;
  let hoverTarget = -1;
  let hoverStrength = 0;
  let hoverFrom = 0;
  let pointer: Point | null = null;
  let previousPointer: Point | null = null;
  let lastImpulse = -Infinity;
  let nextImpulse = 0;
  const impulseData = new Float32Array(16);
  const impulseTimes = new Float64Array(4).fill(-Infinity);
  const expansion = new Float32Array(ATLAS_TERRITORIES.length);
  const fromExpansion = new Float32Array(expansion.length);
  let expandStart = -Infinity;
  let lastRender = 0;
  let ambientTimer = 0;
  let quality = 1;
  let slowFrames = 0;
  let healthyFrames = 0;
  let popupSlot = 0;
  let popupWidth = 0;
  let popupHeight = 0;
  let frameId = 0;
  let selectionTime = 0;
  let disposed = false;
  let started = false;
  let renderer: AtlasRenderer | null = null;
  let rendererType = "pending";
  let setupWebGL: typeof import("./atlas-webgl")["makeWebGLAtlas"] | undefined;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const compact = window.matchMedia("(pointer: coarse)").matches || (memory !== undefined && memory <= 4);
  stage.toggleAttribute("data-atlas-touch", navigator.maxTouchPoints > 0);
  const marks = new Map<string, Marker>();
  const touches = new Map<number, Point>();
  let inputStart: Pointer | null = null;
  let lastGesture: GestureSample | null = null;
  let dragged = false;

  for (const element of labels.querySelectorAll<HTMLElement>("[data-atlas-marker]")) {
    marks.set(element.dataset.atlasMarker!, { element, width: 0, visible: false, anchor: 0 });
  }

  const zoomLimits = () => [defaultView.z, Math.max(defaultView.z * 6, 3)] as const;
  const fit = () => {
    if (!selection) return defaultView;
    const skill = selection.type === "skill" ? SKILLS_BY_ID.get(selection.id) : null;
    const region = TERRITORIES_BY_ID.get(skill?.territoryId ?? selection.id);
    if (!region) return defaultView;
    const [min, max] = zoomLimits();
    if (skill) {
      const mobile = width < 640;
      const zoom = clamp(Math.min(width / (mobile ? 340 : 515), world.height / 260), min * 1.38, max);
      const point = projection(skillPose(skill,1),PERSPECTIVE);
      return cameraAt({x:point.x,y:point.y+(mobile? .055 : .035)*world.height/zoom},zoom);
    }
    const points = region.items.map(item => projection(skillPose(item,1),PERSPECTIVE));
    const peak = projection(landmarkPositions[region.index],PERSPECTIVE);
    const bounds = {
      left: Math.min(...points.map(p => p.x), peak.x) - 59,
      right: Math.max(...points.map(p => p.x), peak.x) + 59,
      top: Math.min(...points.map(p => p.y), peak.y) - 46,
      bottom: Math.max(...points.map(p => p.y), peak.y) + 53,
    };
    const target = fitCamera(bounds, world);
    const zoom = clamp(target.z, min * 1.17, Math.min(max, min * (width < 610 ? 2.32 : 1.78)));
    return cameraAt({ x: -target.x / target.z, y: -target.y / target.z }, zoom);
  };

  const displayLabels = (state: SceneFrame) => {
    const regionIndex = territoryIndex(selection);
    const amount = regionIndex < 0 ? 1 : expansion[regionIndex];
    const settledOverview = !selection && fitted && !motion;
    const labelKey = [width,height,camera.x,camera.y,camera.z,selection?.id,selection?.type,amount.toFixed(2),popupWidth,popupHeight,settledOverview].join("/");
    if (labelView === labelKey) return;
    labelView = labelKey;
    const skills = visibleSkills(selection);
    const counted = new Set<number>();
    const candidates = skills.length
      ? skills.flatMap(skill => {
        const index=TERRITORIES_BY_ID.get(skill.territoryId)!.index;
        if(index!==regionIndex && (width<600 || counted.has(index)))return [];
        counted.add(index);
        return [{key:"skill-"+skill.id,position:connectedSkillPose(skill,state),pinned:selection?.id===skill.id}];
      })
      : ATLAS_TERRITORIES.map(region => ({key:"territory-"+region.id,position:landmarkPositions[region.index],pinned:false}));
    if (regionIndex >= 0) {
      const region = ATLAS_TERRITORIES[regionIndex];
      candidates.splice(selection?.type === "skill" ? 1 : 0, 0, {key:"territory-"+region.id,position:landmarkPositions[region.index],pinned:false});
      candidates.splice(2, 0, ...visibleProjects(selection).map(project => ({key:"project-"+project.href,position:project.position,pinned:false})));
    }
    const accepted: {l:number; r:number; t:number; b:number}[] = [];
    const shown = new Set<string>();
    if (popupWidth && window.innerWidth >= 864 && selection) {
      const focus = selection.type === "skill" ? SKILLS_BY_ID.get(selection.id) : null;
      const anchor = screenPoint(focus ? skillPose(focus,amount) : landmarkPositions[regionIndex],state);
      const inset = Math.max(12,width*.027);
      const left=clamp(anchor.x-popupWidth-69,inset,width-inset-popupWidth);
      const right=clamp(anchor.x+69,inset,width-inset-popupWidth);
      const top=clamp(anchor.y-popupHeight-42,15,Math.max(15,height-popupHeight-15));
      const bottom=clamp(anchor.y+42,15,Math.max(15,height-popupHeight-15));
      const middle=clamp(anchor.y-popupHeight*.44,15,Math.max(15,height-popupHeight-15));
      const zones=[
        {x:right,y:middle},{x:left,y:middle},{x:right,y:top},{x:left,y:top},{x:right,y:bottom},{x:left,y:bottom},
        {x:inset,y:middle},{x:width-inset-popupWidth,y:middle},
      ];
      const linkSamples=connectionsFor(selection).filter(link=>link.weight>.4).flatMap(link=>{
        const a=connectionEndpoint(link.a,state),b=connectionEndpoint(link.b,state);
        return [.2,.4,.6,.8].map(t=>screenPoint(routePoint(a,b,t,link.bridge),state));
      });
      const score=({x,y}:Point)=>{
        const contains=(p:Point,margin:number)=>p.x>x-margin&&p.x<x+popupWidth+margin&&p.y>y-margin&&p.y<y+popupHeight+margin;
        return (contains(anchor,36)?32:0)
          + candidates.reduce((sum,item)=>sum+(contains(screenPoint(item.position,state),25)?item.pinned?18:2:0),0)
          + linkSamples.filter(p=>contains(p,4)).length*.65
          + Math.abs(y-middle)*.012
          + Math.min(Math.abs(x-left),Math.abs(x-right))*.009;
      };
      let best=score(zones[popupSlot]);
      zones.forEach((zone,index)=>{
        const cost=score(zone)+.9;
        if(cost<best){popupSlot=index;best=cost;}
      });
      const {x,y}=zones[popupSlot];
      popup.style.setProperty("--popup-x",x.toFixed(1)+"px");
      popup.style.setProperty("--popup-y",y.toFixed(1)+"px");
      accepted.push({l:x-7,r:x+popupWidth+7,t:y-7,b:y+popupHeight+7});
    }
    if (amount > .30) for (const target of candidates) {
      const mark = marks.get(target.key);
      if (!mark) continue;
      if (!mark.width) mark.width = mark.element.offsetWidth;
      const position = screenPoint(target.position, state);
      const region = target.key.startsWith("territory");
      // Keep labels close to their anchors. Prefer their previous arrangement as the camera passes thresholds.
      const offsets = region ? [[0, -24], [0, 22], [13, 0], [-13, 0]] : [[0, -20], [0, 22], [13, 0], [-13, 0]];
      const placements = settledOverview ? offsets.keys() : new Set([mark.anchor, ...offsets.keys()]);
      for (const index of placements) {
        const [dx, dy] = offsets[index];
        const x = position.x + dx + (index < 2 ? 0 : (index === 2 ? 0.5 : -0.5) * mark.width);
        const y = position.y + dy;
        const w = mark.width / 2;
        const h = (region ? 28 : 23) / 2;
        const rect = { l: x - w - 2, r: x + w + 2, t: y - h - 2, b: y + h + 2 };
        const edge = region ? 3 : 5;
        if (rect.l < edge || rect.r > width - edge || rect.t < edge || rect.b > height - edge) continue;
        if (!target.pinned && accepted.some(a => rect.l < a.r && rect.r > a.l && rect.t < a.b && rect.b > a.t)) continue;
        mark.element.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%)";
        mark.element.dataset.anchor = String(index);
        mark.anchor = index;
        shown.add(target.key);
        accepted.push(rect);
        break;
      }
    }
    for (const [key, mark] of marks) {
      const show = shown.has(key);
      if (mark.visible === show) continue;
      mark.visible = show;
      mark.element.toggleAttribute("data-visible", show);
      mark.element.tabIndex = show ? 0 : -1;
      mark.element.inert = !show;
    }
  };

  function render(now: number) {
    frameId = 0;
    if (!visible || document.hidden || disposed || width < 2 || rendererType === "pending") return;
    if (formationStart === -1) formationStart = now;
    const selectionRegion = territoryIndex(selection);
    const animated = rendererType === "webgl" && !reduced.matches;
    const expanding = animated && now - expandStart < 440;
    const morph = expanding ? ease(clamp((now-expandStart)/440)) : 1;
    for(let i=0;i<expansion.length;i++) expansion[i]=fromExpansion[i]+((i===selectionRegion?1:0)-fromExpansion[i])*morph;
    if (pointer && animated && now-lastImpulse>47) {
      force(pointer,previousPointer ? clamp(Math.hypot(pointer.x-previousPointer.x,pointer.y-previousPointer.y)/28,.40,1.05) : .74,now);
      previousPointer=pointer;
      pointer=null;
    }
    let disturbed = false;
    for(let i=0;i<4;i++){
      const age=(now-impulseTimes[i])/1000;
      impulseData[i*4+2]=Math.min(2,age);
      disturbed ||= age < .86;
    }
    const range=now-lastRender;
    const isActive=Boolean(motion||expanding||disturbed||progress<1);
    if (animated && isActive && lastRender > 0 && range < 190) {
      slowFrames=range>26 ? slowFrames+1 : Math.max(0,slowFrames-1);
      healthyFrames=range<18 ? healthyFrames+1 : 0;
      if(slowFrames>=5 && quality>.54){quality=Math.max(.54,quality-.23);slowFrames=0;}
      if(healthyFrames>=90 && quality<1){quality=Math.min(1,quality+.23);healthyFrames=0;}
    }
    lastRender=now;
    progress = reduced.matches || rendererType !== "webgl" ? 1 : clamp((now - formationStart) / 645, 0, 1);
    if (motion) {
      const sample = sampleCameraTransition(motion, animated ? now : motion.start + motion.duration);
      camera = sample.position;
      if (sample.done) motion = null;
    }
    const relative = camera.z / defaultView.z;
    const next = relative > (level === 2 ? 2.60 : 2.94) ? 2 : relative > (level > 0 ? 1.35 : 1.58) ? 1 : 0;
    level = next;
    const skill = selection?.type==="skill" ? SKILLS_BY_ID.get(selection.id) : null;
    const hoverProgress = animated ? ease(clamp((now-hoverChange)/155)) : 1;
    const target = hoverTarget >= 0 ? 1 : 0;
    hoverStrength = hoverFrom + (target - hoverFrom) * hoverProgress;
    if (target === 0 && hoverProgress === 1) hover = -1;
    const state: SceneFrame = {
      camera,width,height,stretch,progress,selection,time:now/1000,perspective:PERSPECTIVE,hover,expansion,
      impulses:impulseData,activeSkill:skill?skillPose(skill,1):null,motion:animated,quality,hoverStrength,
    };
    renderer?.draw(state);
    displayLabels(state);
    const magnification = relative.toFixed(1) + "×";
    if (scale.textContent !== magnification) scale.textContent = magnification;
    if (stage.dataset.atlasLevel !== String(level)) stage.dataset.atlasLevel = String(level);
    const formation = progress < 1 ? "assembling" : "settled";
    if (stage.dataset.atlasFormation !== formation) stage.dataset.atlasFormation = formation;
    stage.toggleAttribute("data-atlas-reacting",disturbed);
    stage.toggleAttribute("data-atlas-expanding",expanding);
    if (animated && (motion || progress<1 || disturbed || expanding || pointer || hoverProgress<1)) schedule();
    else if(animated) ambientTimer=window.setTimeout(schedule, compact ? 52 : 40);
  }

  let hoverChange=-Infinity;
  function schedule() {
    window.clearTimeout(ambientTimer);
    if (!frameId && visible && !document.hidden && !disposed) frameId = requestAnimationFrame(render);
  }

  function setRenderer(next: AtlasRenderer | null, type: string) {
    renderer = next;
    rendererType = type;
    stage.dataset.atlasRenderer = type;
    schedule();
  }

  function switchToFallback() {
    const fallbackRenderer = makeCanvasAtlas(fallback);
    setRenderer(fallbackRenderer, fallbackRenderer ? "canvas" : "labels");
  }

  const loseContext = (event: Event) => {
    event.preventDefault();
    renderer = null;
    switchToFallback();
  };

  const restoreContext = () => {
    if (!setupWebGL || disposed) return;
    const restored = setupWebGL(webgl, compact || width < 680);
    if (restored) {
      renderer?.dispose();
      setRenderer(restored, "webgl");
    }
  };

  async function setup() {
    if (started) return;
    started = true;
    try {
      setupWebGL = (await import("./atlas-webgl")).makeWebGLAtlas;
      if (disposed) return;
      if (!visible) {
        started = false;
        return;
      }
      const initial = setupWebGL(webgl, compact || width < 680);
      if (initial) {
        formationStart = -1;
        setRenderer(initial, "webgl");
        return;
      }
    } catch {
      if (disposed) return;
    }
    switchToFallback();
  }

  function measure() {
    popupWidth=popup.offsetWidth;
    popupHeight=popup.offsetHeight;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h || (w === width && h === height)) return;
    const wasUnmeasured = width === 1;
    width = w;
    height = h;
    // On short landscape screens, flatten the projection enough to use the width without clipping the atlas.
    stretch = height < 330 && width / height > 1.55 ? .81 : width < 575 ? 1.40 : 1;
    world = { width, height: height / stretch, scale: 1 };
    defaultView = fitCamera(OVERVIEW_BOUNDS, world);
    if(width<575)defaultView=cameraAt({x:-defaultView.x/defaultView.z,y:-defaultView.y/defaultView.z},defaultView.z*1.14);
    if (fitted || wasUnmeasured) camera = fit();
    else {
      const [min,max] = zoomLimits();
      camera = constrainPan(resizeCamera(camera, 1, 1, min, max), PAN_BOUNDS, world);
    }
    motion = null;
    for (const mark of marks.values()) mark.width = 0;
    stage.dataset.atlasCompact = width < 580 || height < 320 ? "true" : "false";
    schedule();
  }

  const resize = new ResizeObserver(measure);
  resize.observe(stage);
  const popupResize=new ResizeObserver(()=>{
    popupWidth=popup.offsetWidth;
    popupHeight=popup.offsetHeight;
    schedule();
  });
  popupResize.observe(popup);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      measure();
      void setup();
      schedule();
    } else {
      window.clearTimeout(ambientTimer);
      lastRender=0;
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      clearGesture();
      setHover(-1);
      pointer=null;
      if (formationStart >= 0) formationStart = -Infinity;
      leaveMap();
    }
  }, { threshold: 0.025 });
  intersection.observe(stage);

  const handleVisibility = () => {
    if (document.hidden) {
      window.clearTimeout(ambientTimer);
      lastRender=0;
      cancelAnimationFrame(frameId);
      frameId = 0;
    } else schedule();
  };
  document.addEventListener("visibilitychange", handleVisibility);
  reduced.addEventListener("change", schedule);
  webgl.addEventListener("webglcontextlost", loseContext);
  webgl.addEventListener("webglcontextrestored", restoreContext);

  function animateTo(target: Camera, duration = 590) {
    if (reduced.matches || !visible || rendererType !== "webgl") {
      camera = target;
      motion = null;
    } else {
      const now = performance.now();
      const current = motion ? sampleCameraTransition(motion, now) : null;
      motion = { from: current?.position ?? camera, to: target, start: now, duration, velocity: current?.speed };
    }
    schedule();
  }

  function local({x,y}: Point) {
    const rect = stage.getBoundingClientRect();
    return {x: x - rect.left - width / 2, y: (y - rect.top - height / 2) / stretch};
  }

  function move(from: GestureSample, to: GestureSample) {
    const [min,max] = zoomLimits();
    camera = constrainPan(moveCamera(camera, from, to, min, max), PAN_BOUNDS, world);
    fitted = false;
    schedule();
  }

  function force(point:Point,strength:number,now=performance.now(),at?:AtlasPosition) {
    if(reduced.matches||rendererType!=="webgl")return;
    let hit = at;
    if (!hit) {
      const screen = local(point);
      hit = pickSurface({x:(screen.x-camera.x)/camera.z,y:(screen.y-camera.y)/camera.z},PERSPECTIVE) ?? undefined;
    }
    lastImpulse=now;
    if(!hit)return;
    const i=nextImpulse++%4;
    impulseTimes[i]=now;
    impulseData.set([hit.x,hit.y,0,strength],i*4);
    schedule();
  }

  function trackPointer(point:Point) {
    if(reduced.matches)return;
    pointer=point;
    schedule();
  }

  function clearGesture() {
    const oldPointers = Array.from(touches.keys());
    touches.clear();
    inputStart = null;
    lastGesture = null;
    for (const id of oldPointers) if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
  }

  function setHover(next: number) {
    if (hoverTarget === next) return;
    if (next >= 0 && hover !== next) {
      hover = next;
      hoverStrength = 0;
    }
    hoverTarget = next;
    hoverFrom = hoverStrength;
    hoverChange = performance.now();
    schedule();
  }

  measure();
  return {
    select(next: Selection | null) {
      const now = performance.now();
      if (next?.id === selection?.id && next?.type === selection?.type && now - selectionTime < 70) return;
      fromExpansion.set(expansion);
      expandStart=now;
      selection = next;
      setHover(-1);
      popupSlot=0;
      if(next){
        const region=territoryIndex(next);
        if(region>=0)force({x:0,y:0},.94,now,landmarkPositions[region]);
      }
      selectionTime = now;
      dragged = false;
      fitted = true;
      animateTo(fit(), next ? 625 : 530);
    },
    scaleBy(factor: number, point?: Point) {
      motion = null;
      const center = point ? local(point) : {x:0, y:0};
      move({center,span:100}, {center,span:100 * factor});
    },
    pan(x: number, y: number) {
      motion = null;
      move({center: { x:0,y:0 },span:0},{center:{ x,y:y / stretch },span:0});
    },
    preview(id:string|null) {
      setHover(id ? TERRITORIES_BY_ID.get(id)?.index ?? -1 : -1);
    },
    track(point:Point|null) {
      pointer=point;
      if(!point)previousPointer=null;
      schedule();
    },
    impulse(point:Point) { force(point,1.43); },
    down(pointer: Pointer, exploring: boolean) {
      if (!touches.size) {
        dragged = false;
      } else dragged = true;
      if (pointer.pointerType === "touch" && !exploring) return;
      motion = null;
      if (!touches.size) inputStart = pointer;
      touches.set(pointer.pointerId, local(pointer));
      lastGesture = sampleGesture(touches.values());
    },
    move(pointer: Pointer) {
      if(pointer.pointerType!=="touch" || touches.size===1) {
        // Deform the surface as the visitor moves, without sending pointer frames through React.
        trackPointer(pointer);
      }
      if (!touches.has(pointer.pointerId) || !inputStart) return;
      const position = local(pointer);
      touches.set(pointer.pointerId, position);
      if (!dragged && Math.hypot(pointer.x - inputStart.x, pointer.y - inputStart.y) < 5) return;
      dragged = true;
      if (!stage.hasPointerCapture(pointer.pointerId)) stage.setPointerCapture(pointer.pointerId);
      const sample = sampleGesture(touches.values());
      if (lastGesture && sample) move(lastGesture, sample);
      lastGesture = sample;
    },
    up(pointerId: number) {
      if (!touches.delete(pointerId)) return;
      if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
      lastGesture = sampleGesture(touches.values());
      if (!lastGesture) inputStart = null;
    },
    clearGesture,
    discardClick() { return dragged; },
    nearest(point: Point): Selection | null {
      const click = local(point);
      const candidates = visibleSkills(selection);
      const active=territoryIndex(selection);
      const items = candidates.length ? candidates.filter(skill=>skill.territoryId===ATLAS_TERRITORIES[active].id).map(skill=>({
        type:"skill" as const,id:skill.id,anchor:projection(skillPose(skill,expansion[active]),PERSPECTIVE),
      })) : ATLAS_TERRITORIES.map(region=>({type:"territory" as const,id:region.id,anchor:projection(landmarkPositions[region.index],PERSPECTIVE)}));
      let nearest: Selection | null = null;
      let distance = candidates.length ? 17 : 28;
      for (const item of items) {
        const delta = Math.hypot(item.anchor.x * camera.z + camera.x - click.x, (item.anchor.y * camera.z + camera.y - click.y) * stretch);
        if (delta >= distance) continue;
        distance = delta;
        nearest = {type:item.type,id:item.id};
      }
      return nearest;
    },
    dispose() {
      disposed = true;
      resize.disconnect();
      popupResize.disconnect();
      window.clearTimeout(ambientTimer);
      intersection.disconnect();
      reduced.removeEventListener("change", schedule);
      document.removeEventListener("visibilitychange", handleVisibility);
      webgl.removeEventListener("webglcontextlost", loseContext);
      webgl.removeEventListener("webglcontextrestored", restoreContext);
      cancelAnimationFrame(frameId);
      clearGesture();
      renderer?.dispose();
    },
  };
}
