export const studioBays = [
  { id: "software", title: "Systems & robotics", x: -3.25, z: 1.76 },
  { id: "agentic", title: "Agentic intelligence & RAG", x: -3.25, z: -1.68 },
  { id: "markets", title: "Finance & markets", x: 3.15, z: -1.68 },
  { id: "learning", title: "AI & machine learning", x: 3.15, z: 1.76 },
] as const;

export const roboticsBay = studioBays[0];
export const agenticBay = studioBays[1];
export const marketsBay = studioBays[2];
export const learningBay = studioBays[3];
export const studioStationIds = ["learning", "agentic", "markets", "software"] as const;
export type StudioStationId = typeof studioStationIds[number];
export const learningPhases = ["Ingest observations", "Condition & encode", "Build a forecast", "Route the result"] as const;
export const stationDetails = {
  learning: {
    control: "AI / ML",
    title: "AI & machine learning",
    summary: "I enjoy figuring out what a model can learn from messy data. Aviation weather got me interested in time-series forecasting, especially when observations come from different sensors.",
    phases: learningPhases,
    phaseLabel: "Forecasting stages",
    image: "station.webp",
    alt: "Forecasting workstation showing the sensor manifold, observation chamber, and plot planes",
    projects: [{ href: "/work/imdpune", label: "Vertical Visibility" }, { href: "/work/windy", label: "Windy" }],
  },
  agentic: {
    control: "Agentic / RAG",
    title: "Agentic intelligence & RAG",
    summary: "I’m curious what LLMs can do when they can look things up and use tools. In Swa.Neeti and Windy, I’ve explored how to keep answers tied to the evidence behind them.",
    phases: ["Interpret the query", "Retrieve source passages", "Exchange findings", "Verify the evidence", "Assemble the response", "Transfer the result"],
    phaseLabel: "Agentic retrieval stages",
    image: "agentic.webp",
    alt: "Agentic workstation with a mechanical document archive, optical retrieval vault, agent modules, evidence gate, and output tray",
    projects: [{ href: "/work/swaneeti", label: "Swa.Neeti" }, { href: "/work/windy", label: "Windy" }],
  },
  markets: {
    control: "Finance & Markets",
    title: "Finance & markets",
    summary: "My Finance minor got me interested in how markets price risk and how a small change in an assumption can change a decision. I like working through those questions with code.",
    phases: ["Receive market inputs", "Reprice the scenarios", "Measure the loss tail", "Allocate the expense", "Route the balanced output", "Return to rest"],
    phaseLabel: "Financial research stages",
    image: "markets.webp",
    alt: "Finance workstation with a three-dimensional protective-put scenario surface, a circular risk instrument, and a three-lane ledger engine",
    projects: [{ href: "/work/spenza", label: "Spenza" }],
  },
  software: {
    control: "Systems & Robotics",
    title: "Systems & robotics",
    summary: "I like seeing what happens when software meets something physical. Working with ThriveForce gave me a chance to explore that from the mechanical side too.",
    phases: ["Process the input", "Move the arm", "Fit the cassette", "Scan the assembly", "Return sensor feedback", "Settle and reset"],
    phaseLabel: "Robotics engineering stages",
    image: "robotics.webp",
    alt: "Robotics workstation showing an articulated arm, a four-wheel demonstration rover, a circuit board, and an optical inspection rail",
    projects: [{ href: "#robotics", label: "ThriveForce" }],
  },
} as const;
import type { StudioObjectId } from "./studio-choreography";


export const studioObjects = {
  lounge: {
    title: "The lounge",
    summary: "I like sketching when I get the time. Taking photos is another way I notice little details I would usually walk past.",
    image: "lounge.webp",
    alt: "A rounded sofa with three cushions, a sketchbook on the side table, and a floor lamp beside the curtains",
  },
  desk: {
    title: "Gaming desk",
    summary: "PC gaming is one of my favourite ways to unwind after class or a long stretch of coding.",
    image: "desk.webp",
    alt: "A gaming desk with a monitor, keyboard, headphones, and a PC with lit fans",
  },
  television: {
    title: "Television",
    summary: "I like watching movies when I have an evening free. I put a couple of short visual loops on this screen.",
    image: "television.webp",
    alt: "A television on a low console showing a pixel landscape beneath the window",
  },
  artwork: {
    title: "Wall prints",
    summary: "I wanted this corner to feel quiet, so I went with a mountain scene, a study of arches, and an ink print.",
    image: "artwork.webp",
    alt: "Framed mountain landscape, architectural arches, and an abstract ink print",
  },
} as const satisfies Record<StudioObjectId,{ title:string; summary:string; image:string; alt:string }>;
