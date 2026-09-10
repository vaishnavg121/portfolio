export type ProjectAssetSet = {
  hero?: string; // Hero image or video
  texture?: string; // Optional overlay texture
  diagram?: string; // System architecture diagram
  gallery?: string[]; // Optional additional screenshots
};

export const MASCOT_ASSETS = {
  rive: "/assets/mascot/vaishnav-companion.riv",
};

export const GLOBAL_TEXTURES = {
  paperNoise: "/assets/textures/paper-noise.webp",
};

export const PROJECT_ASSETS: Record<string, ProjectAssetSet> = {
  alphacouncil: {
    hero: undefined,
    diagram: undefined,
  },
  swaneeti: {
    hero: undefined,
    diagram: undefined,
  },
  windy: {
    hero: undefined,
    diagram: undefined,
  },
  spenza: {
    hero: undefined,
    diagram: undefined,
  },
  thriveforce: {
    hero: undefined,
    diagram: undefined,
  },
};
