import { CompanionState } from "./companion.types";

export type CompanionBehaviorMode = "FREE_FOLLOW" | "CONSTRAINED_FOLLOW" | "DOCKED";

export interface CompanionProfile {
  mode: CompanionBehaviorMode;
  defaultState: CompanionState;
  safeAnchors: string[];
}

export const COMPANION_PROFILES: Record<string, CompanionProfile> = {
  home: {
    mode: "FREE_FOLLOW",
    defaultState: "IDLE",
    safeAnchors: ["bottom-left-middle", "lower-center", "lower-right"]
  },
  imd: {
    mode: "CONSTRAINED_FOLLOW",
    defaultState: "IDLE",
    safeAnchors: ["margin-left", "margin-right"]
  },
  swaNeeti: {
    mode: "CONSTRAINED_FOLLOW",
    defaultState: "READ",
    safeAnchors: ["margin-left", "margin-right"]
  },
  windy: {
    mode: "CONSTRAINED_FOLLOW",
    defaultState: "IDLE",
    safeAnchors: ["margin-left", "margin-right"]
  },
  spenza: {
    mode: "CONSTRAINED_FOLLOW",
    defaultState: "IDLE",
    safeAnchors: ["margin-left", "margin-right"]
  },
  robotics: {
    mode: "CONSTRAINED_FOLLOW",
    defaultState: "INSPECT",
    safeAnchors: ["margin-left", "margin-right"]
  }
};

export const VELOCITY_THRESHOLDS = {
  RUN: 800,
  WALK: 50,
};

