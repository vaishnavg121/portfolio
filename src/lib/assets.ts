export type ProjectAssetSet = {
  hero?: string; // Hero image or video
  texture?: string; // Optional overlay texture
  diagram?: string; // System architecture diagram
  gallery?: string[]; // Optional additional screenshots
};

export const MASCOT_ASSETS = {
  rive: "/assets/mascot/ink-familiar.riv",
  static: "/assets/mascot/ink-familiar-static.webp",
  poster: "/assets/mascot/ink-familiar-poster.webp",
  poses: {
    idle: "/assets/mascot/poses/idle.png",
    walk: "/assets/mascot/poses/walk.png",
    run: "/assets/mascot/poses/run.png",
    sleep: "/assets/mascot/poses/sleep.png",
    read: "/assets/mascot/poses/read.png",
    surprised: "/assets/mascot/poses/surprised.png",
    windBlown: "/assets/mascot/poses/wind-blown.png",
    inspect: "/assets/mascot/poses/inspect.png",
    wave: "/assets/mascot/poses/wave.png",
    sitting: "/assets/mascot/poses/sitting.png",
    inkParticles: "/assets/mascot/poses/ink-particles.png"
  }
};

export const GLOBAL_TEXTURES = {
  paperNoise: "/assets/textures/paper-noise.webp",
};

export const THEME_ASSETS = {
  github: {
    inkLeft: "/assets/theme/github/github-ink-left.png",
    inkRight: "/assets/theme/github/github-ink-right.png",
    crescent: "/assets/theme/github/github-crescent.png",
    bottomBrush: "/assets/theme/github/github-bottom-brush.png",
    speckles: "/assets/theme/github/github-ink-speckles.png",
    grain: "/assets/theme/github/github-grain.webp",
  },
  global: {
    paperGrain: "/assets/theme/global/global-paper-grain.webp",
    inkBrushReveal: "/assets/theme/global/ink-brush-reveal.png",
    slashTransition: "/assets/theme/global/slash-transition.png",
    flowRibbon: "/assets/theme/global/flow-ribbon.png",
    emberFragments: "/assets/theme/global/ember-fragments.png",
    notebookInkFrame: "/assets/theme/global/notebook-ink-frame.png",
    inkTrail: "/assets/theme/global/ink-trail.png",
  }
};

export const PROJECT_ASSETS: Record<string, ProjectAssetSet> = {
  imdpune: {
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
