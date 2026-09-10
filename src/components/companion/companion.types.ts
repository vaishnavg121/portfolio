export type CompanionState = "IDLE" | "WALK" | "RUN" | "READ" | "SLEEP" | "SURPRISED" | "WIND_BLOWN" | "INSPECT" | "WAVE";

export type CompanionDirection = "left" | "right";

export type CompanionAnchor = "fixed-bottom-right" | "hero-title" | "work-track" | "github-grid" | "notes-edge";

export interface CompanionRendererProps {
  state: CompanionState;
  direction: CompanionDirection;
  intensity: number; // 0 to 1 based on scroll velocity or interaction
}

