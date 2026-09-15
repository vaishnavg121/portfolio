"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Maximize, Minus, Plus, X, Search, MousePointer2 } from "lucide-react";

import { NODES, CONNECTIONS, DOMAINS } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";
import { projects } from "@/lib/profile";

const getProject = (slug: string) => projects.find(p => p.slug === slug);

export const SkillsConstellation = () => {
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof NODES>([]);
  
  const stateRef = useRef({
    camera: { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 1000, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 500, z: 0.85 },
    targetCamera: { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 1000, y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 500, z: 0.85 },
    pointer: { x: -1000, y: -1000, active: false },
    activeNodeId: null as string | null,
    flowProgress: 0,
    isDragging: false,
    lastPan: { x: 0, y: 0 },
    width: typeof window !== 'undefined' ? window.innerWidth : 1000,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    dpr: 1
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
      z += 350 * Math.exp(-(Math.pow(x - 0, 2) / 60000 + Math.pow(y - (-400), 2) / 50000)); 
      z += 200 * Math.exp(-(Math.pow(x - (-600), 2) / 100000 + Math.pow(y - (-100), 2) / 150000)); 
      z += 180 * Math.exp(-(Math.pow(x - 600, 2) / 120000 + Math.pow(y - (-200), 2) / 80000)); 
      z += 220 * Math.exp(-(Math.pow(x - (-450), 2) / 40000 + Math.pow(y - 350, 2) / 40000)); 
      z += 240 * Math.exp(-(Math.pow(x - 500, 2) / 45000 + Math.pow(y - 350, 2) / 45000)); 
      z += 80 * Math.exp(-(Math.pow(x - 0, 2) / 200000 + Math.pow(y - 300, 2) / 150000)); 
      const noise1 = Math.sin(x / 40) * Math.cos(y / 40) * 12;
      const noise2 = Math.sin(x / 15 + y / 20) * 5;
      z += (noise1 + noise2) * (z / 150); 
      return z;
    };

    const angle = -20 * Math.PI / 180;
    const tilt = 65 * Math.PI / 180;
    const project = (x: number, y: number, z: number) => {
       const x1 = x * Math.cos(angle) - y * Math.sin(angle);
       const y1 = x * Math.sin(angle) + y * Math.cos(angle);
       return { x: x1, y: y1 * Math.cos(tilt) - z * Math.sin(tilt) };
    };

    let terrainPaths: { bg: Path2D, mid: Path2D, fg: Path2D } | null = null;
    if (typeof window !== "undefined") {
      terrainPaths = { bg: new Path2D(), mid: new Path2D(), fg: new Path2D() };
      const step = 45;
      const yMin = -1200, yMax = 1200, xMin = -1500, xMax = 1500;

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

    const nProj = NODES.map(n => {
       const z = getZ(n.x, n.y);
       return { id: n.id, level: n.level, proj: project(n.x, n.y, z), x: n.x, y: n.y, label: n.label, domainId: n.domainId };
    });

    const dProj = DOMAINS.map(d => {
       const z = getZ(d.x, d.y);
       return { id: d.id, proj: project(d.x, d.y, z), label: d.label };
    });

    const eProj = CONNECTIONS.map(([a, b]) => {
       const nA = NODES.find(n => n.id === a);
       const nB = NODES.find(n => n.id === b);
       if (!nA || !nB) return null;
       const pts = [];
       const segments = 20;
       for(let i=0; i<=segments; i++) {
         const t = i / segments;
         const nx = nA.x + (nB.x - nA.x) * t;
         const ny = nA.y + (nB.y - nA.y) * t;
         pts.push(project(nx, ny, getZ(nx, ny) + 4));
       }
       return { a, b, pts };
    }).filter(Boolean) as { a: string, b: string, pts: {x:number, y:number}[] }[];

    return { terrainPaths, nProj, dProj, eProj };
  }, []);

  const clampCamera = (target: {x:number, y:number, z:number}) => {
    const minZ = 0.85, maxZ = 3.0;
    target.z = Math.max(minZ, Math.min(maxZ, target.z));
  };

  const focusOn = useCallback((x: number, y: number, z: number) => {
    const st = stateRef.current;
    st.targetCamera = { 
      x: st.width / 2 - x * z, 
      y: st.height / 2 - y * z, 
      z 
    };
    clampCamera(st.targetCamera);
  }, []);

  useEffect(() => {
    let rafId: number;
    const canvas = canvasRef.current;
    if (!canvas || !geometry.terrainPaths) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const handleResize = () => {
      const st = stateRef.current;
      st.width = window.innerWidth;
      st.height = window.innerHeight;
      st.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = st.width * st.dpr;
      canvas.height = st.height * st.dpr;
      ctx.scale(st.dpr, st.dpr);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const loop = () => {
      const st = stateRef.current;
      
      st.camera.x += (st.targetCamera.x - st.camera.x) * 0.12;
      st.camera.y += (st.targetCamera.y - st.camera.y) * 0.12;
      st.camera.z += (st.targetCamera.z - st.camera.z) * 0.12;

      geometry.nProj.forEach(n => {
        const el = document.getElementById(`mk_node_${n.id}`);
        if (el) {
          const px = st.camera.x + n.proj.x * st.camera.z;
          const py = st.camera.y + n.proj.y * st.camera.z;
          el.style.transform = `translate(${px}px, ${py}px)`;
          
          const isSelected = st.activeNodeId === n.id || firstOrder.has(n.id);
          if (n.level === 'C' && !isSelected) {
            el.style.opacity = st.camera.z > 1.3 ? "0.3" : "0";
            el.style.pointerEvents = st.camera.z > 1.3 ? "auto" : "none";
          }
        }
      });

      geometry.dProj.forEach(d => {
        const el = document.getElementById(`mk_domain_${d.id}`);
        if (el) {
          const px = st.camera.x + d.proj.x * st.camera.z;
          const py = st.camera.y + d.proj.y * st.camera.z;
          el.style.transform = `translate(${px}px, ${py - 40}px)`;
        }
      });

      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, st.width, st.height);

      ctx.save();
      ctx.translate(st.camera.x, st.camera.y);
      ctx.scale(st.camera.z, st.camera.z);

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      
      const paths = geometry.terrainPaths!;
      ctx.strokeStyle = "rgba(245, 237, 227, 0.05)";
      ctx.lineWidth = 1;
      ctx.stroke(paths.bg);
      
      ctx.strokeStyle = "rgba(245, 237, 227, 0.12)";
      ctx.lineWidth = 1.2;
      ctx.stroke(paths.mid);

      ctx.strokeStyle = "rgba(245, 237, 227, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.stroke(paths.fg);

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
         ctx.translate(st.camera.x, st.camera.y);
         ctx.scale(st.camera.z, st.camera.z);
      }

      const actN = geometry.nProj.find(n => n.id === st.activeNodeId);
      if (actN) {
         ctx.restore();
         ctx.save();
         ctx.globalCompositeOperation = "color-dodge";
         const cx = st.camera.x + actN.proj.x * st.camera.z;
         const cy = st.camera.y + actN.proj.y * st.camera.z;
         const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 400 * st.camera.z);
         grad.addColorStop(0, "rgba(220, 38, 38, 0.55)"); 
         grad.addColorStop(1, "transparent");
         ctx.fillStyle = grad;
         ctx.fillRect(0, 0, st.width, st.height);
         ctx.restore();
         
         ctx.save();
         ctx.translate(st.camera.x, st.camera.y);
         ctx.scale(st.camera.z, st.camera.z);
      }

      if (st.activeNodeId && st.flowProgress < 1.0) {
        st.flowProgress += 0.035; 
      }

      geometry.eProj.forEach(e => {
        const isDirect = st.activeNodeId && ((st.activeNodeId === e.a && firstOrder.has(e.b)) || (st.activeNodeId === e.b && firstOrder.has(e.a)));
        const isSecond = st.activeNodeId && !isDirect && ((firstOrder.has(e.a) && secondOrder.has(e.b)) || (firstOrder.has(e.b) && secondOrder.has(e.a)) || (firstOrder.has(e.a) && firstOrder.has(e.b)));
        
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
           ctx.strokeStyle = "rgba(220, 38, 38, 0.35)"; 
           ctx.lineWidth = 6 / st.camera.z;
           ctx.stroke();
           
           ctx.strokeStyle = "rgba(245, 237, 227, 1)"; 
           ctx.lineWidth = 1.5 / st.camera.z;
           ctx.stroke();
        } else if (isSecond) {
           ctx.strokeStyle = "rgba(180, 180, 180, 0.45)";
           ctx.lineWidth = 1 / st.camera.z;
           ctx.stroke();
        } else {
           ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
           ctx.lineWidth = 1 / st.camera.z;
           ctx.stroke();
        }
      });

      ctx.restore(); 

      if (actN && popupRef.current && st.flowProgress > 0.5) {
         const cx = st.camera.x + actN.proj.x * st.camera.z;
         const cy = st.camera.y + actN.proj.y * st.camera.z;
         
         const popRect = popupRef.current.getBoundingClientRect();
         let px = popRect.left;
         if (popRect.left < cx) px = popRect.right; 
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

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, [firstOrder, secondOrder, geometry]);

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
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('.no-pan') || (e.target as Element).closest('.interactive-ui')) return;
    const st = stateRef.current;
    st.isDragging = true;
    st.lastPan = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = stateRef.current;
    st.pointer = { x: e.clientX, y: e.clientY, active: true };
    
    if (st.isDragging) {
      const dx = e.clientX - st.lastPan.x;
      const dy = e.clientY - st.lastPan.y;
      st.targetCamera.x += dx;
      st.targetCamera.y += dy;
      st.lastPan = { x: e.clientX, y: e.clientY };
    }
  };

  const onPointerUp = () => {
    stateRef.current.isDragging = false;
  };

  const resetCamera = () => {
    setActiveDomain(null);
    setActiveNode(null);
    setSearchQuery("");
    const st = stateRef.current;
    st.targetCamera = { x: window.innerWidth / 2, y: window.innerHeight / 2 - 100, z: 0.85 };
  };

  const detail = activeNode ? SKILL_DETAILS[activeNode] : null;
  const activeNodeData = geometry.nProj.find(n => n.id === activeNode);

  return (
    <section 
      className="relative bg-[#030303] overflow-hidden select-none h-[100vh] w-full flex flex-col touch-none" 
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => { stateRef.current.isDragging = false; stateRef.current.pointer.active = false; }}
      onClick={(e) => {
        if (!stateRef.current.isDragging && !(e.target as Element).closest('.no-pan') && !(e.target as Element).closest('.interactive-ui')) {
          setActiveNode(null);
        }
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div id="world-overlay" ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden">
         {geometry.dProj.map(d => (
           <div 
             key={d.id} id={`mk_domain_${d.id}`}
             className="absolute font-display text-4xl tracking-[0.2em] font-bold text-text-muted/20 uppercase -translate-x-1/2 -translate-y-1/2"
             style={{ transform: 'none' }}
           >
             {d.label.split('// ')[1]}
           </div>
         ))}
         
         {geometry.nProj.map(n => {
           const isSelected = activeNode === n.id;
           const isFirst = firstOrder.has(n.id);
           const isSecond = secondOrder.has(n.id);
           
           let opacity = 1;
           if (activeNode) {
              opacity = isSelected ? 1 : isFirst ? 0.9 : isSecond ? 0.5 : 0.1;
           } else if (activeDomain) {
              opacity = activeDomain === n.domainId ? 1 : 0.15;
           }

           const isHub = n.level === 'A';
           const size = isHub ? "w-2.5 h-2.5" : n.level === 'B' ? "w-1.5 h-1.5" : "w-1 h-1";

           return (
             <div 
               key={n.id} id={`mk_node_${n.id}`}
               className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer flex flex-col items-center gap-1 group no-pan transition-opacity duration-300"
               style={{ opacity, transform: 'none' }}
               onClick={() => {
                 setActiveNode(isSelected ? null : n.id);
                 if (!isSelected) focusOn(n.proj.x, n.proj.y, 1.4);
               }}
             >
               <div className={`${size} rounded-full transition-colors duration-300 ${isSelected ? 'bg-text-primary ring-2 ring-accent ring-offset-2 ring-offset-[#030303]' : isFirst ? 'bg-text-primary' : 'bg-text-muted group-hover:bg-text-primary'}`} />
               <div className={`absolute top-full mt-1 font-mono tracking-widest whitespace-nowrap ${isHub ? 'text-[11px] font-bold' : n.level === 'B' ? 'text-[9px]' : 'text-[8px]'} ${isSelected || isFirst ? 'text-text-primary' : 'text-text-muted group-hover:text-text-primary'}`} style={{ textShadow: "0 2px 10px rgba(0,0,0,1)" }}>
                 {n.label.toUpperCase()}
               </div>
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
                      const n = geometry.nProj.find(x => x.id === relId);
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
                    setSearchResults(NODES.filter(n => n.label.toLowerCase().includes(e.target.value.toLowerCase())));
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
                      const n = geometry.nProj.find(x => x.id === res.id);
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
        {DOMAINS.map(d => (
          <button 
            key={d.id}
            onClick={() => { 
              setActiveDomain(d.id); setActiveNode(null); 
              const proj = geometry.dProj.find(dp => dp.id === d.id)?.proj;
              if(proj) focusOn(proj.x, proj.y, 1.1); 
            }}
            className={`font-mono text-[10px] tracking-widest px-3 py-1 uppercase whitespace-nowrap transition-colors ${activeDomain === d.id ? 'text-accent' : 'text-text-muted hover:text-text-primary'}`}
          >
            {d.label.split('// ')[1]}
          </button>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 z-30 hidden md:flex items-end gap-4 interactive-ui no-pan">
        <div className="bg-[#0a0a0a]/90 backdrop-blur-md border border-border flex flex-col gap-1 p-1 shadow-2xl">
          <button onClick={() => { stateRef.current.targetCamera.z *= 1.2; clampCamera(stateRef.current.targetCamera); }} className="p-2 text-text-muted hover:text-white" aria-label="Zoom In"><Plus className="w-3.5 h-3.5" /></button>
          <button onClick={() => { stateRef.current.targetCamera.z *= 0.8; clampCamera(stateRef.current.targetCamera); }} className="p-2 text-text-muted hover:text-white" aria-label="Zoom Out"><Minus className="w-3.5 h-3.5" /></button>
          <button onClick={resetCamera} className="p-2 text-text-muted hover:text-white" aria-label="Reset"><Maximize className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </section>
  );
};
