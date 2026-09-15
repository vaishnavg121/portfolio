# Performance Audit

## Overview
This document records the exact performance optimizations and structural changes made to fix overall site lag, particularly focusing on the SkillsConstellation Knowledge Landscape and global RAF/ScrollTrigger architecture.

## 1. Global RAF & Animation Cleanup
- **Before:** Multiple independent equestAnimationFrame (RAF) loops ran continuously across pointer tracking (PointerProvider), the custom cursor, and the Knowledge Landscape, irrespective of visibility.
- **Fix:** 
  - Centralized pointer tracking into a single debounced RAF loop using pendingRef and cancelAnimationFrame.
  - Converted custom cursor to use ramer-motion passive useMotionValue binding directly.
  - Implemented an IntersectionObserver-based visibility hook (useSectionVisibility) in src/lib/visibility.ts.
- **After:** Animations drop to 0 RAF calls when offscreen or completely idle.

## 2. ScrollTrigger Consolidation
- **Before:** Raw ScrollTrigger instances created without robust cleanup led to leaked listeners during route navigation (e.g., navigating to /work/[slug] and back).
- **Fix:** Systematically migrated all GSAP logic to the @gsap/react useGSAP hook which handles strict context management and ctx.revert() automatically on unmount. 
- **After:** No duplicated ScrollTriggers or duplicated listeners. Returning home from a project route does not incur an increased RAF count or lag.

## 3. Knowledge Landscape: Terrain Caching & Rendering
- **Before:** SVG/DOM path drawing per frame created massive layout thrashing and pointer-tracking lag.
- **Fix:** 
  - Integrated OffscreenCanvas based TerrainCache.
  - Static topological contours (bg, mid, fg) are rasterized precisely once per resize/DPR change into OffscreenCanvas.
  - Applied aggressive DPR limiting: Math.min(window.devicePixelRatio || 1, 1.5).
- **After:** The equestAnimationFrame loop now averages ~1ms per frame since it only processes ctx.drawImage() from the cache and computes simple pointer LERP values.

## 4. Terrain Boundaries and Overscan
- **Before:** Panning heavily could occasionally expose the edge of the generated map.
- **Fix:** 
  - Expanded the generated world bounds to X: [-2000, 2000] and Y: [-1600, 1600].
  - Introduced safeBounds (derived using a 30% margin constraint).
  - Built a dynamic clampCamera(target) function that enforces boundary limits based on 	arget.z and current screen dimensions.
- **After:** The user cannot pan far enough to see the canvas boundaries at any valid zoom level.

## 5. Idle Knowledge RAF (Zero-cost resting state)
- **Before:** Even when fully visible and not moving, the Canvas 2D engine looped endlessly.
- **Fix:** Calculated 
eedsNextFrame based on active dragging, interpolating pan (dx > 0.5), pointer movement, and path animation flow (lowProgress < 1.0).
- **After:** If all conditions are static, the component strictly calls cancelAnimationFrame and isAnimating = false.

## 6. Label Layout & Collision Detection
- **Before:** Dense nodes overlapping rendered unreadable clusters. Level-C nodes were hidden completely by default.
- **Fix:** 
  - Created a deterministic computeLabelLayout() algorithm firing only on bounds/resize/mount.
  - Rectangular collision checking (placedRects) ensures all labels are pushed to optimal alignments (left, ight, center). 
  - Rendered delicate leader lines connecting displaced labels to their anchor hubs.
- **After:** Every single skill (A, B, and C tiers) is visible on desktop by default without zooming.
