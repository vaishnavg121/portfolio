export const motionTokens = {
  duration: {
    micro: 0.15,
    fast: 0.3,
    medium: 0.6,
    slow: 1.2,
    epic: 2.0,
  },
  ease: {
    sharp: [0.4, 0, 0.6, 1], // standard sharp transition
    soft: [0.2, 0, 0, 1], // fluid decel
    spring: { type: "spring", stiffness: 400, damping: 50 },
    backOut: "back.out(1.7)", // used in GSAP
    power3Out: "power3.out", // used in GSAP
  },
  distance: {
    micro: 10,
    short: 30,
    section: 100,
  }
};
