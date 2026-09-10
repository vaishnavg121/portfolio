import { CompanionState } from "./companion.types";

// Map section IDs to specific companion states
export const SECTION_BEHAVIORS: Record<string, CompanionState> = {
  hero: "IDLE", // Starts with SLEEP -> IDLE in Hero
  work: "WALK",
  alphacouncil: "INSPECT",
  swaneeti: "READ",
  windy: "WIND_BLOWN",
  spenza: "WALK",
  robotics: "INSPECT",
  github: "INSPECT",
  notes: "READ",
  contact: "WAVE",
};

// Map scroll velocity ranges to states
export const VELOCITY_THRESHOLDS = {
  RUN: 800,  // pixels per second threshold to trigger RUN
  WALK: 50,  // threshold to trigger WALK instead of IDLE
};
