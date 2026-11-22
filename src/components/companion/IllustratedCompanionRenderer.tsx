"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CompanionRendererProps } from "./companion.types";
import { MASCOT_ASSETS, THEME_ASSETS } from "@/lib/assets";
import { CompanionPlaceholder } from "./CompanionPlaceholder";

type PoseConfig = { scale: number; yOffset: string };

const NORMALIZATION: Record<string, PoseConfig> = {
  "IDLE": { scale: 1, yOffset: "0%" },
  "WALK": { scale: 1, yOffset: "0%" },
  "RUN": { scale: 1.15, yOffset: "5%" },
  "SLEEP": { scale: 1, yOffset: "0%" },
  "READ": { scale: 1.05, yOffset: "2%" },
  "SURPRISED": { scale: 1.15, yOffset: "-5%" },
  "WIND_BLOWN": { scale: 1.15, yOffset: "5%" },
  "INSPECT": { scale: 1, yOffset: "0%" },
  "WAVE": { scale: 1.15, yOffset: "-5%" },
};

export const IllustratedCompanionRenderer = (props: CompanionRendererProps) => {
  const { state, direction } = props;
  const shouldReduceMotion = useReducedMotion();
  const [failedAssets, setFailedAssets] = useState<Set<string>>(new Set());
  const [idleFailed, setIdleFailed] = useState(false);

  // Map state to image path
  const getStateImage = () => {
    switch (state) {
      case "WALK": return MASCOT_ASSETS.poses.walk;
      case "RUN": return MASCOT_ASSETS.poses.run;
      case "SLEEP": return MASCOT_ASSETS.poses.sleep;
      case "READ": return MASCOT_ASSETS.poses.read;
      case "SURPRISED": return MASCOT_ASSETS.poses.surprised;
      case "WIND_BLOWN": return MASCOT_ASSETS.poses.windBlown;
      case "INSPECT": return MASCOT_ASSETS.poses.inspect;
      case "WAVE": return MASCOT_ASSETS.poses.wave;
      case "IDLE":
      default: return MASCOT_ASSETS.poses.idle;
    }
  };

  const originalImage = getStateImage();
  const isCurrentFailed = failedAssets.has(originalImage);
  const currentImage = isCurrentFailed ? MASCOT_ASSETS.poses.idle : originalImage;
  const norm = NORMALIZATION[isCurrentFailed ? "IDLE" : state] || NORMALIZATION.IDLE;

  if (idleFailed) {
    return <CompanionPlaceholder {...props} />;
  }

  const handleImageError = () => {
    if (currentImage === MASCOT_ASSETS.poses.idle) {
      setIdleFailed(true);
    } else {
      setFailedAssets((prev) => {
        const next = new Set(prev);
        next.add(originalImage);
        return next;
      });
    }
  };

  // Motion variants for state
  const getMotionVariants = () => {
    if (shouldReduceMotion) {
      return {
        animate: { y: 0, rotate: 0, scale: 1 },
        transition: { duration: 0.3 }
      };
    }

    switch (state) {
      case "IDLE":
        return {
          animate: { y: [0, -2, 0], rotate: [-0.5, 0.5, -0.5], scaleY: [1, 1.02, 1] },
          transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        };
      case "WALK":
        return {
          animate: { y: [0, -4, 0], rotate: [-2, 2, -2] },
          transition: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
        };
      case "RUN":
        return {
          animate: { y: [0, -6, 0], rotate: [0, 5, 0], scaleY: [1, 0.95, 1], scaleX: [1, 1.05, 1] },
          transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
        };
      case "SLEEP":
        return {
          animate: { scale: [1, 1.02, 1] },
          transition: { repeat: Infinity, duration: 6, ease: "easeInOut" }
        };
      case "READ":
        return {
          animate: { y: [0, -2, 0], rotate: [-1, 1, -1] },
          transition: { repeat: Infinity, duration: 5, ease: "easeInOut" }
        };
      case "SURPRISED":
        return {
          animate: { y: [0, -8, 0], scale: [1, 1.1, 1] },
          transition: { duration: 0.4, ease: "easeOut" }
        };
      case "WIND_BLOWN":
        return {
          animate: { rotate: [-2, 2, -1, 3, -2], x: [-1, 2, -1, 1, 0] },
          transition: { repeat: Infinity, duration: 0.5, ease: "linear" }
        };
      case "INSPECT":
        return {
          animate: { rotate: [-2, 2, -2], y: [0, 1, 0] },
          transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        };
      case "WAVE":
        return {
          animate: { rotate: [-5, 5, -5] },
          transition: { repeat: Infinity, duration: 1, ease: "easeInOut" }
        };
      default:
        return {
          animate: { y: 0, rotate: 0 },
          transition: { duration: 0.3 }
        };
    }
  };

  const motionProps = getMotionVariants();

  return (
    <motion.div
      className="relative w-[44px] h-[44px] sm:w-[58px] sm:h-[58px] md:w-[72px] md:h-[72px] lg:w-[90px] lg:h-[90px] flex-shrink-0"
      initial={false}
      animate={{
        scaleX: direction === "left" ? -1 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        transformOrigin: "center bottom",
      }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {(state === "RUN" || state === "WALK") && !shouldReduceMotion && (
          <motion.div
            key="ink-trail"
            className="absolute top-1/2 -translate-y-1/2 right-[60%] h-[80%] origin-right pointer-events-none opacity-40"
            style={{
              backgroundImage: `url(${THEME_ASSETS.global.inkTrail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
              backgroundRepeat: 'no-repeat',
              maskImage: 'linear-gradient(to left, black 20%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to left, black 20%, transparent 100%)',
            }}
            initial={{ opacity: 0, width: 0 }}
            animate={{ 
               opacity: state === "RUN" ? 0.6 : 0.25, 
               width: state === "RUN" ? "120px" : "40px"
            }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0, scale: 0.97 * norm.scale, y: norm.yOffset }}
          animate={{ opacity: 1, scale: norm.scale, y: norm.yOffset }}
          exit={{ opacity: 0, scale: 0.97 * norm.scale, y: norm.yOffset }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 origin-bottom z-10"
        >
          <motion.div
             animate={motionProps.animate}
             transition={motionProps.transition as import("framer-motion").Transition}
             className="w-full h-full relative origin-bottom"
          >
             <Image
                src={currentImage}
                alt=""
                fill
                sizes="(max-width: 640px) 44px, (max-width: 768px) 58px, (max-width: 1024px) 72px, 90px"
                className="object-contain"
                priority
                onError={handleImageError}
             />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
