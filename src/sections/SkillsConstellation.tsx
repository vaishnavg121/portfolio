/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus, X, Search, MousePointer2 } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

const getProject = (slug: string) => projects.find(p => p.slug === slug);

interface CameraState {
  x: number;
  y: number;
  z: number;
}

interface PointerState {
  x: number;
  y: number;
  active: boolean;
}

interface TerrainCache {
  bg: OffscreenCanvas | HTMLCanvasElement | null;
  mid: OffscreenCanvas | HTMLCanvasElement | null;
  fg: OffscreenCanvas | HTMLCanvasElement | null;
  width: number;
  height: number;
  dpr: number;
  valid: boolean;
}

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const terrainCacheRef = useRef<TerrainCache>({
    bg: null, mid: null, fg: null, width: 0, height: 0, dpr: 1, valid: false
  });

  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof NODES>([]);
  const [isSectionVisible, setIsSectionVisible] = useState(true);
  const [labelPositions, setLabelPositions] = useState<Map<string, { x: number; y: number; align: string; leader: boolean }>>(new Map());
  const animationLoopRef = useRef<() => void>(() => {});

  const stateRef = useRef({
    camera: { x: 0, y: 0, z: 0.85 } as CameraState,
    targetCamera: { x: 0, y: 0, z: 0.85 } as CameraState,
    pointer: { x: -1000, y: -1000, active: false } as PointerState,
    activeNodeId: null as string | null,
    flowProgress: 0,
      popupRect: null as any,
    isDragging: false,
    lastPan: { x: 0, y: 0 },
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    dpr: 1,
    rafId: 0 as number,
    isAnimating: false,
    terrainBounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
    safeBounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  });

  const getConnectedNodes = useCallback((nodeId: string) => {
    const connected = new Set<string>();
    CONNECTIONS.forEach(([a, b]) => {
      if (a === nodeId) connected.add(b);
      if (b === nodeId) connected.add(a);
    });
    return connected;
  }, []);

  const { firstOrder, secondOrder } = useMemo(() => {
    const first = activeNode ? getConnectedNodes(activeNode) : new Set<string>();
    const second = new Set<string>();
    if (activeNode) {
      first.forEach(f => {
        getConnectedNodes(f).forEach(s => {
          if (s !== activeNode && !first.has(s)) second.add(s);
        });
      });
    }
    return { firstOrder: first, secondOrder: second };
  }, [activeNode, getConnectedNodes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
      const t = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const st = stateRef.current;
    if (st.activeNodeId !== activeNode) {
      st.activeNodeId = activeNode;
      st.flowProgress = 0;
    }
  }, [activeNode]);

  const geometry = useMemo(() => {
    const getZ = (x: number, y: number) => {
      let z = 0;
      z += 420 * Math.exp(-(Math.pow(x - 0, 2) / 55000 + Math.pow(y - (-450), 2) / 45000));
      z += 280 * Math.exp(-(Math.pow(x - (-700), 2) / 95000 + Math.pow(y - (-150), 2) / 140000));
      z += 220 * Math.exp(-(Math.pow(x - 750, 2) / 110000 + Math.pow(y - (-250), 2) / 75000));
      z += 300 * Math.exp(-(Math.pow(x - (-550), 2) / 38000 + Math.pow(y - 400, 2) / 38000));
      z += 280 * Math.exp(-(Math.pow(x - 600, 2) / 42000 + Math.pow(y - 400, 2) / 42000));
      z += 100 * Math.exp(-(Math.pow(x - 0, 2) / 180000 + Math.pow(y - 350, 2) / 140000));
      z += 150 * Math.exp(-(Math.pow(x - 1000, 2) / 80000 + Math.pow(y - 0, 2) / 100000));
      z += 120 * Math.exp(-(Math.pow(x - (-1000), 2) / 85000 + Math.pow(y - 100, 2) / 90000));
      z += 180 * Math.exp(-(Math.pow(x - 0, 2) / 250000 + Math.pow(y - 0, 2) / 200000));
      const noise1 = Math.sin(x / 35) * Math.cos(y / 35) * 14;
      const noise2 = Math.sin(x / 12 + y / 18) * 6;
      const noise3 = Math.sin(x / 60 - y / 40) * 4;
      z += (noise1 + noise2 + noise3) * (z / 140);
      return z;
    };

    const angle = -20 * Math.PI / 180;
    const tilt = 65 * Math.PI / 180;
    const project = (x: number, y: number, z: number) => {
      const x1 = x * Math.cos(angle) - y * Math.sin(angle);
      const y1 = x * Math.sin(angle) + y * Math.cos(angle);
      return { x: x1, y: y1 * Math.cos(tilt) - z * Math.sin(tilt) };
    };

    const yMin = -1600, yMax = 1600, xMin = -2000, xMax = 2000;
    const step = 50;

    const projectedNodes = NODES.map((n: any) => {
      const z = getZ(n.x, n.y);
      return { id: n.id, level: n.level, proj: project(n.x, n.y, z), x: n.x, y: n.y, label: n.label, domainId: n.domainId };
    });

    const projectedDomains = DOMAINS.map((d: any) => {
      const z = getZ(d.x, d.y);
      return { id: d.id, proj: project(d.x, d.y, z), label: d.label };
    });

    let allMinX = Infinity, allMaxX = -Infinity, allMinY = Infinity, allMaxY = -Infinity;
    projectedNodes.forEach((n: any) => {
      allMinX = Math.min(allMinX, n.proj.x);
      allMaxX = Math.max(allMaxX, n.proj.x);
      allMinY = Math.min(allMinY, n.proj.y);
      allMaxY = Math.max(allMaxY, n.proj.y);
    });
    projectedDomains.forEach((d: any) => {
      allMinX = Math.min(allMinX, d.proj.x);
      allMaxX = Math.max(allMaxX, d.proj.x);
      allMinY = Math.min(allMinY, d.proj.y);
      allMaxY = Math.max(allMaxY, d.proj.y);
    });

    const eProj = CONNECTIONS.map(([a, b]) => {
      const nA = NODES.find(n => n.id === a);
      const nB = NODES.find(n => n.id === b);
      if (!nA || !nB) return null;
      const pts = [];
      const segments = 16;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const nx = nA.x + (nB.x - nA.x) * t;
        const ny = nA.y + (nB.y - nA.y) * t;
        pts.push(project(nx, ny, getZ(nx, ny) + 4));
      }
      return { a, b, pts };
    }).filter(Boolean) as { a: string, b: string, pts: {x:number, y:number}[] }[];

    const margin = 0.3;
    const worldWidth = allMaxX - allMinX;
    const worldHeight = allMaxY - allMinY;
    const safeMinX = allMinX + worldWidth * margin;
    const safeMaxX = allMaxX - worldWidth * margin;
    const safeMinY = allMinY + worldHeight * margin;
    const safeMaxY = allMaxY - worldHeight * margin;

    let terrainPaths: { bg: Path2D, mid: Path2D, fg: Path2D } | null = null;
    if (typeof window !== "undefined") {
      terrainPaths = { bg: new Path2D(), mid: new Path2D(), fg: new Path2D() };
      for (let y = yMin; y <= yMax; y += step) {
        const targetPath = y < -300 ? terrainPaths.bg : y < 300 ? terrainPaths.mid : terrainPaths.fg;
        for (let x = xMin; x <= xMax; x += step) {
          const p = project(x, y, getZ(x, y));
          if (x === xMin) targetPath.moveTo(p.x, p.y);
          else targetPath.lineTo(p.x, p.y);
        }
      }
      for (let x = xMin; x <= xMax; x += step) {
        for (let y = yMin; y <= yMax; y += step) {
          const targetPath = y < -300 ? terrainPaths.bg : y < 300 ? terrainPaths.mid : terrainPaths.fg;
          const p = project(x, y, getZ(x, y));
          if (y === yMin) targetPath.moveTo(p.x, p.y);
          else targetPath.lineTo(p.x, p.y);
        }
      }
    }

    return {
      getZ, project, angle, tilt,
      nProj: projectedNodes, dProj: projectedDomains, eProj,
      terrainPaths,
      worldBounds: { minX: allMinX, maxX: allMaxX, minY: allMinY, maxY: allMaxY },
      safeBounds: { minX: safeMinX, maxX: safeMaxX, minY: safeMinY, maxY: safeMaxY },
      xMin, xMax, yMin, yMax, step
    };
  }, []);

  const clampCamera = useCallback((target: CameraState) => {
    const st = stateRef.current;
    const minZ = 0.85, maxZ = 3.0;
    target.z = Math.max(minZ, Math.min(maxZ, target.z));

    const safe = st.safeBounds;
    target.x = Math.max(st.width - safe.maxX * target.z, Math.min(-safe.minX * target.z, target.x));
    target.y = Math.max(st.height - safe.maxY * target.z, Math.min(-safe.minY * target.z, target.y));
  }, []);

  const focusOn = useCallback((x: number, y: number, z: number) => {
    const st = stateRef.current;
    st.targetCamera = {
      x: st.width / 2 - x * z,
      y: st.height / 2 - y * z,
      z
    };
    clampCamera(st.targetCamera);
  }, [clampCamera]);

  const buildTerrainCache = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !geometry.terrainPaths) return;

    const st = stateRef.current;
    const cache = terrainCacheRef.current;
    const dpr = st.dpr;

    const offW = Math.ceil(geometry.xMax - geometry.xMin);
    const offH = Math.ceil(geometry.yMax - geometry.yMin);

    const createLayer = (paths: Path2D, strokeStyle: string, lineWidth: number) => {
      const off = new OffscreenCanvas(offW * dpr, offH * dpr);
      const octx = off.getContext("2d")!;
      octx.scale(dpr, dpr);
      octx.translate(-geometry.xMin, -geometry.yMin);
      octx.strokeStyle = strokeStyle;
      octx.lineWidth = lineWidth;
      octx.lineJoin = "round";
      octx.lineCap = "round";
      octx.stroke(paths);
      return off;
    };

    cache.bg = createLayer(geometry.terrainPaths.bg, "rgba(245, 237, 227, 0.05)", 1);
    cache.mid = createLayer(geometry.terrainPaths.mid, "rgba(245, 237, 227, 0.12)", 1.2);
    cache.fg = createLayer(geometry.terrainPaths.fg, "rgba(245, 237, 227, 0.22)", 1.5);
    cache.width = offW;
    cache.height = offH;
    cache.dpr = dpr;
    cache.valid = true;
  }, [geometry]);

  const computeLabelLayout = useCallback(() => {
    const st = stateRef.current;
    const positions = new Map<string, { x: number; y: number; align: string; leader: boolean }>();
    const placedRects: { x: number; y: number; w: number; h: number; id: string }[] = [];

    const candidates = [
      { dx: 1, dy: 0, align: "left" },
      { dx: -1, dy: 0, align: "right" },
      { dx: 1, dy: -1, align: "left" },
      { dx: -1, dy: -1, align: "right" },
      { dx: 1, dy: 1, align: "left" },
      { dx: -1, dy: 1, align: "right" },
    ];

    const sortedNodes = [...geometry.nProj].sort((a, b) => {
      const aHub = a.level === 'A';
      const bHub = b.level === 'A';
      if (aHub !== bHub) return bHub ? 1 : -1;
      return a.level.localeCompare(b.level);
    });

    for (const n of sortedNodes) {
      const isHub = n.level === 'A';
      const fontSize = isHub ? 14 : n.level === 'B' ? 11 : 10;
      const approxW = n.label.length * fontSize * 0.55;
      const approxH = fontSize * 1.3;
      const baseX = st.camera.x + n.proj.x * st.camera.z;
      const baseY = st.camera.y + n.proj.y * st.camera.z;

      let bestPos = { x: baseX + 16, y: baseY - 4, align: "left", leader: false };

      for (const c of candidates) {
        const tx = baseX + c.dx * 16;
        const ty = baseY + c.dy * (isHub ? 20 : 16);
        const rect = { x: tx - (c.align === "right" ? approxW : 0), y: ty - approxH / 2, w: approxW, h: approxH, id: n.id };

        let collides = false;
        for (const p of placedRects) {
          if (!(rect.x + rect.w < p.x || rect.x > p.x + p.w || rect.y + rect.h < p.y || rect.y > p.y + p.h)) {
            collides = true;
            break;
          }
        }
        if (!collides && tx > 40 && tx < st.width - 40 && ty > 40 && ty < st.height - 40) {
          bestPos = { x: tx, y: ty, align: c.align, leader: false };
          placedRects.push(rect);
          break;
        }
      }

      if (placedRects.length === 0 || placedRects[placedRects.length - 1].id !== n.id) {
        bestPos.leader = true;
        placedRects.push({ x: bestPos.x - (bestPos.align === "right" ? approxW : 0), y: bestPos.y - approxH / 2, w: approxW, h: approxH, id: n.id });
      }

      positions.set(n.id, bestPos);
    }

    for (const d of geometry.dProj) {
      const dx = st.camera.x + d.proj.x * st.camera.z;
      const dy = st.camera.y + d.proj.y * st.camera.z - 40;
      positions.set(`domain_${d.id}`, { x: dx, y: dy, align: "center", leader: false });
    }

    setLabelPositions(positions);
  }, [geometry]);

  useEffect(() => {
    const st = stateRef.current;
    st.width = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
    st.height = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;
    st.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = st.width * st.dpr;
      canvas.height = st.height * st.dpr;
    }

    st.camera = { x: st.width / 2, y: st.height / 2 - 100, z: 0.85 };
    st.targetCamera = { ...st.camera };

    st.terrainBounds = geometry.worldBounds;
    st.safeBounds = geometry.safeBounds;

    buildTerrainCache();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    computeLabelLayout();

    const handleResize = () => {
      st.width = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
      st.height = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;
      const newDpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (newDpr !== st.dpr) {
        st.dpr = newDpr;
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = st.width * st.dpr;
          canvas.height = st.height * st.dpr;
        }
        buildTerrainCache();
      } else {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = st.width * st.dpr;
          canvas.height = st.height * st.dpr;
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      computeLabelLayout();
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [geometry, buildTerrainCache, computeLabelLayout]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSectionVisible(entry.isIntersecting || entry.intersectionRatio > 0.01);
      });
    }, { rootMargin: "100px", threshold: [0, 0.01, 0.1, 0.5, 1] });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const scheduleRaf = useCallback(() => {
    const st = stateRef.current;
    if (!st.isAnimating && isSectionVisible) {
      st.isAnimating = true;
      st.rafId = requestAnimationFrame(animationLoopRef.current);
    }
  }, [isSectionVisible]);

    useEffect(() => {
    if (activeNode && popupRef.current && canvasRef.current) {
      const p = popupRef.current.getBoundingClientRect();
      const c = canvasRef.current.getBoundingClientRect();
      stateRef.current.popupRect = {
        left: p.left - c.left,
        right: p.right - c.left,
        top: p.top - c.top,
        height: p.height
      };
    } else {
      stateRef.current.popupRect = null;
    }
  }, [activeNode, geometry]);

  const animationLoop = useCallback(() => {
    
    const st = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !geometry.terrainPaths || !terrainCacheRef.current.valid) {
      st.isAnimating = false;
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) { st.isAnimating = false; return; }

    let needsNextFrame = false;

    const cam = st.camera;
    const tcam = st.targetCamera;
    const dx = tcam.x - cam.x;
    const dy = tcam.y - cam.y;
    const dz = tcam.z - cam.z;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || Math.abs(dz) > 0.001) {
      cam.x += dx * 0.12;
      cam.y += dy * 0.12;
      cam.z += dz * 0.12;
      needsNextFrame = true;
    }

    if (st.flowProgress < 1.0 && st.activeNodeId) {
      st.flowProgress += 0.035;
      needsNextFrame = true;
    }

    if (st.pointer.active && !st.isDragging) needsNextFrame = true;

    if (st.isDragging) needsNextFrame = true;

    if (!needsNextFrame) {
      st.isAnimating = false;
      return;
    }

    st.rafId = requestAnimationFrame(animationLoopRef.current);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.scale(st.dpr, st.dpr);
    ctx.fillStyle = "#030303";
    ctx.fillRect(0, 0, st.width, st.height);

    const cache = terrainCacheRef.current;
    const cw = cache.width;
    const ch = cache.height;
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.scale(cam.z, cam.z);

    if (cache.bg) ctx.drawImage(cache.bg, geometry.xMin, geometry.yMin, cw, ch);
    if (cache.mid) ctx.drawImage(cache.mid, geometry.xMin, geometry.yMin, cw, ch);
    if (cache.fg) ctx.drawImage(cache.fg, geometry.xMin, geometry.yMin, cw, ch);

    if (st.pointer.active && !st.isDragging) {
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "color-dodge";
      const grad = ctx.createRadialGradient(st.pointer.x, st.pointer.y, 0, st.pointer.x, st.pointer.y, 350);
      grad.addColorStop(0, "rgba(245, 240, 220, 0.45)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, st.width, st.height);
      ctx.restore();
      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.scale(cam.z, cam.z);
    }

    const actN = geometry.nProj.find((n: any) => n.id === st.activeNodeId);
    if (actN) {
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "color-dodge";
      const cx = cam.x + actN.proj.x * cam.z;
      const cy = cam.y + actN.proj.y * cam.z;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400 * cam.z);
      grad.addColorStop(0, "rgba(220, 38, 38, 0.55)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, st.width, st.height);
      ctx.restore();
      ctx.save();
      ctx.translate(cam.x, cam.y);
      ctx.scale(cam.z, cam.z);
    }

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    geometry.eProj.forEach(e => {
      const isDirect = st.activeNodeId && ((st.activeNodeId === e.a && firstOrder.has(e.b)) || (st.activeNodeId === e.b && firstOrder.has(e.a)));
      const isSecond = st.activeNodeId && !isDirect && (
        (firstOrder.has(e.a) && secondOrder.has(e.b)) ||
        (firstOrder.has(e.b) && secondOrder.has(e.a)) ||
        (firstOrder.has(e.a) && firstOrder.has(e.b))
      );

      if (st.activeNodeId && !isDirect && !isSecond) return;

      ctx.beginPath();
      let maxIdx = e.pts.length - 1;
      if (isDirect && st.flowProgress < 1.0) {
        maxIdx = Math.max(1, Math.floor(st.flowProgress * (e.pts.length - 1)));
      }

      e.pts.forEach((pt, i) => {
        if (i > maxIdx) return;
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });

      if (isDirect) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = 8 / cam.z;
        ctx.stroke();
        ctx.strokeStyle = "rgba(220, 38, 38, 0.45)";
        ctx.lineWidth = 6 / cam.z;
        ctx.stroke();
        ctx.strokeStyle = "rgba(245, 237, 227, 1)";
        ctx.lineWidth = 1.5 / cam.z;
        ctx.stroke();
      } else if (isSecond) {
        ctx.strokeStyle = "rgba(180, 180, 180, 0.45)";
        ctx.lineWidth = 1 / cam.z;
        ctx.stroke();
      } else {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1 / cam.z;
        ctx.stroke();
      }
    });

    ctx.restore();

    const popRect = st.popupRect;
    if (actN && popRect && st.flowProgress > 0.5) {
      const cx = cam.x + actN.proj.x * cam.z;
      const cy = cam.y + actN.proj.y * cam.z;
      let px = (popRect.left < cx ? popRect.right : popRect.left);
      const py = popRect.top + popRect.height / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = "rgba(220, 38, 38, 0.7)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = "#050505";
      ctx.fillRect(px - 3, py - 3, 6, 6);
      ctx.strokeStyle = "rgba(220, 38, 38, 1)";
      ctx.strokeRect(px - 3, py - 3, 6, 6);
    }
  }, [geometry, firstOrder, secondOrder]);

  useEffect(() => {
    animationLoopRef.current = animationLoop;
  }, [animationLoop]);

  useLayoutEffect(() => {
    if (isSectionVisible) {
      scheduleRaf();
    } else {
      const st = stateRef.current;
      if (st.rafId) cancelAnimationFrame(st.rafId);
      st.isAnimating = false;
    }
    return () => {
      const st = stateRef.current;
      if (st.rafId) cancelAnimationFrame(st.rafId);
      st.isAnimating = false;
    };
  }, [isSectionVisible, scheduleRaf]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();

    const zoomFactor = e.deltaY > 0 ? 0.90 : 1.10;
    const st = stateRef.current;

    const wx = (e.clientX - st.targetCamera.x) / st.targetCamera.z;
    const wy = (e.clientY - st.targetCamera.y) / st.targetCamera.z;

    st.targetCamera.z *= zoomFactor;
    clampCamera(st.targetCamera);

    st.targetCamera.x = e.clientX - wx * st.targetCamera.z;
    st.targetCamera.y = e.clientY - wy * st.targetCamera.z;

    scheduleRaf();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('.no-pan') || (e.target as Element).closest('.interactive-ui')) return;
    const st = stateRef.current;
    st.isDragging = true;
    st.lastPan = { x: e.clientX, y: e.clientY };
    scheduleRaf();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = stateRef.current;
    st.pointer = { x: e.clientX, y: e.clientY, active: true };

    if (st.isDragging) {
      const dx = e.clientX - st.lastPan.x;
      const dy = e.clientY - st.lastPan.y;
      st.targetCamera.x += dx;
      st.targetCamera.y += dy;

      const vpW = st.width / st.targetCamera.z;
      const vpH = st.height / st.targetCamera.z;
      const halfW = vpW / 2;
      const halfH = vpH / 2;
      const safe = st.safeBounds;

      st.targetCamera.x = Math.max(safe.minX * st.targetCamera.z + halfW, Math.min(safe.maxX * st.targetCamera.z + halfW, st.targetCamera.x));
      st.targetCamera.y = Math.max(safe.minY * st.targetCamera.z + halfH, Math.min(safe.maxY * st.targetCamera.z + halfH, st.targetCamera.y));

      st.lastPan = { x: e.clientX, y: e.clientY };
      scheduleRaf();
    }
  };

  const onPointerUp = () => {
    stateRef.current.isDragging = false;
  };

  const onPointerLeave = () => {
    const st = stateRef.current;
    st.isDragging = false;
    st.pointer.active = false;
  };

  const resetCamera = () => {
    setActiveDomain(null);
    setActiveNode(null);
    setSearchQuery("");
    const st = stateRef.current;
    st.targetCamera = { x: st.width / 2, y: st.height / 2 - 100, z: 0.85 };
    scheduleRaf();
  };

  const detail = activeNode ? SKILL_DETAILS[activeNode] : null;
  const activeNodeData = geometry.nProj.find((n: any) => n.id === activeNode);

  const isRichNode = (nodeId: string) => !!SKILL_DETAILS[nodeId];

  return (
    <section
      className="relative bg-[#030303] overflow-hidden select-none h-[100vh] w-full flex flex-col touch-none"
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onClick={(e) => {
        if (!stateRef.current.isDragging && !(e.target as Element).closest('.no-pan') && !(e.target as Element).closest('.interactive-ui')) {
          setActiveNode(null);
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div id="world-overlay" ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
        {geometry.dProj.map((d: any) => {
          const pos = labelPositions.get(`domain_${d.id}`);
          return (
            <div
              key={d.id} id={`mk_domain_${d.id}`}
              className="absolute font-display text-4xl tracking-[0.2em] font-bold text-text-muted/20 uppercase -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={pos ? { transform: `translate(${pos.x}px, ${pos.y}px) translateX(-50%)` } : { transform: 'none' }}
            >
              {d.label.split('// ')[1]}
            </div>
          );
        })}

        {geometry.nProj.map((n: any) => {
          const isSelected = activeNode === n.id;
          const isFirst = firstOrder.has(n.id);
          const isSecond = secondOrder.has(n.id);
          const isRich = isRichNode(n.id);

          let opacity = 1;
          if (activeNode) {
            opacity = isSelected ? 1 : isFirst ? 0.9 : isSecond ? 0.5 : 0.35;
          } else if (activeDomain) {
            opacity = activeDomain === n.domainId ? 1 : 0.35;
          }

          const isHub = n.level === 'A';
          const size = isHub ? "w-2.5 h-2.5" : n.level === 'B' ? "w-1.5 h-1.5" : "w-1 h-1";
          const labelPos = labelPositions.get(n.id);

          const labelStyle: React.CSSProperties = {
            fontSize: isHub ? "14px" : n.level === 'B' ? "11px" : "10px",
            fontWeight: isHub ? 600 : 400,
            color: (isSelected || isFirst) ? "var(--text-primary)" : "var(--text-muted)",
            textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
            textAlign: (labelPos?.align as "left" | "right" | "center") || "left",
          };

          return (
            <div
              key={n.id} id={`mk_node_${n.id}`}
              className="absolute pointer-events-auto flex flex-col items-center gap-1 group no-pan transition-opacity duration-300"
              style={{
                opacity,
                transform: labelPos ? `translate(${labelPos.x}px, ${labelPos.y}px) translateX(${labelPos.align === 'right' ? '-100%' : labelPos.align === 'center' ? '-50%' : '0'}) translateY(-50%)` : 'none',
              }}
              onClick={() => {
                setActiveNode(isSelected ? null : n.id);
                if (!isSelected) focusOn(n.proj.x, n.proj.y, 1.4);
              }}
              onMouseEnter={() => { if (isRich) scheduleRaf(); }}
            >
              <div
                className={`relative ${size} rounded-full transition-all duration-300 ${
                  isSelected ? 'bg-text-primary ring-2 ring-accent ring-offset-2 ring-offset-[#030303]' :
                  isFirst ? 'bg-text-primary' :
                  'bg-text-muted group-hover:bg-text-primary'
                }`}
              >
                {isRich && !isSelected && !isFirst && (
                  <div className="absolute inset-[-3px] rounded-full border border-accent/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}
                {isRich && (
                  <div className="absolute inset-[-1px] rounded-full bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}
              </div>
              <div
                className="font-mono tracking-widest uppercase pointer-events-none"
                style={labelStyle}
              >
                {n.label.toUpperCase()}
              </div>
              {labelPos?.leader && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    width: "1px",
                    height: "8px",
                    background: "linear-gradient(to bottom, transparent, rgba(245,237,227,0.15))",
                    left: labelPos.align === "right" ? "0" : "auto",
                    right: labelPos.align === "left" ? "0" : "auto",
                    top: "-8px",
                    transform: labelPos.align === "right" ? "translateX(2px)" : "translateX(-2px)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeNode && detail && activeNodeData && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
            animate={{ opacity: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            className="absolute z-50 interactive-ui no-pan drop-shadow-2xl right-12 md:right-24 top-1/2 -translate-y-1/2"
          >
            <div className="w-[320px] md:w-[360px] bg-[#080808]/90 backdrop-blur-md relative">
              <div className="absolute inset-0 border-l border-t border-b border-border/50" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }} />
              <div className="absolute top-0 right-0 w-full h-[20px] bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-accent flex items-center justify-center border-t-2 border-l-2 border-[#050505]">
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
              </div>

              <div className="relative p-6 md:p-8 flex flex-col">
                <button onClick={() => setActiveNode(null)} className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-accent transition-colors">
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1.5 h-1.5 bg-accent transform rotate-45 shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                  <div className="font-mono text-[9px] tracking-[0.2em] text-text-muted uppercase">MK_ID // {activeNodeData.id.replace(/_/g, ' ')}</div>
                </div>

                <h3 className="text-2xl md:text-3xl font-display font-medium text-text-primary mb-1 uppercase tracking-tight leading-none">
                  {activeNodeData.label}
                </h3>
                <div className="font-mono text-[10px] text-accent tracking-widest mb-6 uppercase">
                  {DOMAINS.find(d => d.id === activeNodeData.domainId)?.label.split('// ')[1]}
                </div>

                <p className="text-text-muted/90 text-[13px] font-light leading-relaxed mb-6">
                  {detail.description}
                </p>

                <div className="border-t border-border/40 pt-5 mb-5">
                  <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3 uppercase flex items-center gap-2">
                    <div className="w-1 h-1 bg-text-muted/50" /> Application Context
                  </div>
                  <div className="flex flex-col gap-2">
                    {detail.usedIn.map((u, i) => {
                      if (u.href) {
                        const slug = u.href.split('/').pop();
                        const proj = getProject(slug || '');
                        return (
                          <Link key={i} href={proj ? `/work/${proj.slug}` : u.href}
                            className="group/chip flex items-center justify-between px-3 py-2 bg-[#111] border border-border/60 hover:border-accent/50 transition-all"
                          >
                            <span className="font-mono text-[10px] text-text-primary uppercase tracking-widest">{u.label}</span>
                            <ArrowUpRight className="w-3 h-3 text-text-muted group-hover/chip:text-accent" />
                          </Link>
                        );
                      }
                      return (
                        <div key={i} className="flex items-center gap-3 px-3 py-2 bg-[#111]/50 border border-border/30">
                          <span className="font-mono text-[10px] text-text-muted uppercase tracking-widest">{u.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4">
                  <div className="font-mono text-[9px] text-text-muted tracking-widest mb-3 uppercase flex items-center gap-2">
                    <div className="w-1 h-1 bg-text-muted/50" /> Topology Ties
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(firstOrder).slice(0, 8).map(relId => {
                      const n = geometry.nProj.find((x: any) => x.id === relId);
                      if (!n) return null;
                      return (
                        <button key={relId} onClick={() => { setActiveNode(relId); focusOn(n.proj.x, n.proj.y, 1.4); }}
                          className="px-2.5 py-1 font-mono text-[9px] tracking-[0.1em] border border-border bg-[#0a0a0a] text-text-muted hover:border-accent/50 hover:text-text-primary transition-colors cursor-pointer"
                        >
                          {n.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        <div className="flex justify-between items-start w-full pointer-events-auto">
          <div className="max-w-sm interactive-ui">
            <h2 className="text-[10px] font-mono text-text-muted mb-4 tracking-widest uppercase flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-accent" /> KNOWLEDGE LANDSCAPE
            </h2>
            <p className="text-xl font-light text-text-primary leading-tight mb-2 uppercase tracking-wide">
              A landscape of ideas.<br/>Connected by purpose.
            </p>
          </div>

          <div className="relative interactive-ui flex flex-col items-end">
            <div className="flex items-center border border-border bg-[#0a0a0a]/90 backdrop-blur-md px-3 py-2">
              <Search className="w-3.5 h-3.5 text-text-muted mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="SEARCH_SKILL /"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length > 1) {
                    setSearchResults(NODES.filter((n: any) => n.label.toLowerCase().includes(e.target.value.toLowerCase())));
                  } else setSearchResults([]);
                }}
                className="bg-transparent border-none outline-none text-xs font-mono text-text-primary w-24 md:w-32 focus:w-48 transition-all placeholder:text-text-muted/40 uppercase tracking-widest"
              />
            </div>
            {searchQuery.length > 1 && searchResults.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] bg-[#0a0a0a]/95 border border-border flex flex-col max-h-64 overflow-y-auto">
                {searchResults.map(res => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setActiveNode(res.id);
                      setSearchQuery("");
                      const n = geometry.nProj.find((x: any) => x.id === res.id);
                      if (n) focusOn(n.proj.x, n.proj.y, 1.4);
                    }}
                    className="text-left px-4 py-3 font-mono text-[10px] tracking-widest text-text-muted hover:text-text-primary hover:bg-white/5 uppercase transition-colors border-b border-border/50 last:border-b-0"
                  >
                    {res.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-40 bg-[#111]/80 backdrop-blur-md px-5 py-2.5 border border-border font-mono text-[10px] tracking-widest text-text-muted rounded-full pointer-events-none flex items-center gap-3 shadow-2xl"
          >
            <MousePointer2 className="w-3 h-3 text-accent" /> DRAG TO PAN | {isMac ? '⌘' : 'CTRL'} + SCROLL TO ZOOM
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 md:gap-4 px-6 py-3 bg-[#0a0a0a]/90 backdrop-blur-md border border-border overflow-x-auto max-w-[90vw] no-scrollbar interactive-ui shadow-2xl no-pan">
        <button
          onClick={resetCamera}
          className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${!activeDomain && !activeNode ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
        >
          LENS // ALL
        </button>
        {DOMAINS.map((d: any) => (
          <button
            key={d.id}
            onClick={() => {
              setActiveDomain(d.id); setActiveNode(null);
              const proj = geometry.dProj.find((dp: any) => dp.id === d.id)?.proj;
              if (proj) focusOn(proj.x, proj.y, 1.1);
            }}
            className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${activeDomain === d.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            {d.label.split('// ')[1]}
          </button>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 z-30 hidden md:flex items-end gap-4 interactive-ui no-pan">
        <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-border flex flex-col gap-1 p-1 shadow-2xl">
          <button onClick={() => { stateRef.current.targetCamera.z *= 1.2; clampCamera(stateRef.current.targetCamera); scheduleRaf(); }} className="p-2 text-text-muted hover:text-white" aria-label="Zoom In"><Plus className="w-3.5 h-3.5" /></button>
          <button onClick={() => { stateRef.current.targetCamera.z *= 0.8; clampCamera(stateRef.current.targetCamera); scheduleRaf(); }} className="p-2 text-text-muted hover:text-white" aria-label="Zoom Out"><Minus className="w-3.5 h-3.5" /></button>
          <button onClick={resetCamera} className="p-2 text-text-muted hover:text-white" aria-label="Reset"><Maximize className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </section>
  );
};