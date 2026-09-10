import { motion } from "framer-motion";
import { CompanionRendererProps } from "./companion.types";

export const CompanionPlaceholder = ({ state, direction }: CompanionRendererProps) => {
  // Simple state machine for visual
  const getVisualForState = () => {
    switch (state) {
      case "IDLE": return "(-_-)";
      case "WALK": return "(o_o)";
      case "RUN": return "(O_O)";
      case "WIND_BLOWN": return "(>_<)";
      case "SURPRISED": return "(!_!)";
      case "READ": return "(-_-)📖";
      case "SLEEP": return "(u_u)zZ";
      case "WAVE": return "\\(^_^)";
      case "INSPECT": return "(O_o)";
      default: return "(-_-)";
    }
  };

  const isMoving = state === "WALK" || state === "RUN";
  const speed = state === "RUN" ? 0.3 : 0.6;
  const skew = direction === "left" ? "20deg" : "-20deg";

  // TODO: Phase 2 Rive Integration Note
  // This component implements the CompanionRendererProps interface.
  // In the future, a Rive component will implement this exact same interface,
  // replacing this SVG placeholder without changing the controller logic.

  return (
    <motion.div
      animate={{
        y: isMoving ? [0, -10, 0] : 0,
      }}
      transition={{
        repeat: isMoving ? Infinity : 0,
        duration: speed,
      }}
      className="relative pointer-events-auto cursor-pointer"
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" className="fill-white transition-all duration-300" 
          style={{
            transformOrigin: "center",
            transform: state === "WIND_BLOWN" ? `skewX(${skew})` : "none"
          }}
        />
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="black" fontSize="10" fontWeight="bold" fontFamily="monospace">
          {getVisualForState()}
        </text>
        
        {/* Accent decoration */}
        {state === "SURPRISED" && (
           <circle cx="35" cy="5" r="3" fill="#cc3333" />
        )}
      </svg>
    </motion.div>
  );
};
