export const motionTokens = {
  duration: {
    micro: 0.15,
    fast: 0.3,
    medium: 0.6,
    slow: 1.2,
    epic: 2.0,
  },
  ease: {
    sharp: [0.4, 0, 0.6, 1],
    soft: [0.2, 0, 0, 1],
    spring: { type: "spring", stiffness: 400, damping: 50 },
    backOut: "back.out(1.7)",
    power3Out: "power3.out",
  },
  distance: {
    micro: 10,
    short: 30,
    section: 100,
  },
  semantic: {
    FAST_STRIKE: { duration: 0.25, ease: "power4.inOut" },
    EDITORIAL_REVEAL: { duration: 1, ease: "power3.out" },
    MECHANICAL: { duration: 0.4, ease: "back.out(1.5)" },
    FLOW: { duration: 1.5, ease: "power2.inOut" },
    MAGNETIC: { type: "spring", stiffness: 150, damping: 15, mass: 0.1 },
    COMPANION_TRAVEL: { speedX: 5.0, speedY: 5.0 }, // lerp rates
    SETTLE: { duration: 0.8, ease: "power3.out" },
    HOVER: { duration: 0.3, ease: "power2.out" }
  }
};

