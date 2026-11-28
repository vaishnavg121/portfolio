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
    summary: "During my internship at IMD Pune, I cleaned and aligned aviation-weather observations and compared forecasting models. I wanted to see how well they held up on messy sensor data.",
    phases: learningPhases,
    phaseLabel: "Forecasting stages",
    image: "station.webp",
    alt: "Forecasting workstation showing the sensor manifold, observation chamber, and plot planes",
    projects: [{ href: "/work/imdpune", label: "Vertical Visibility" }, { href: "/work/windy", label: "Windy" }],
  },
  agentic: {
    control: "Agentic / RAG",
    title: "Agentic intelligence & RAG",
    summary: "I like building LLM tools that can show where an answer came from. I used retrieval alongside weather analytics in Windy. In Swa.Neeti, I’ve been working on finding relevant legal sources and tracing answers back to them.",
    phases: ["Interpret the query", "Retrieve source passages", "Exchange findings", "Verify the evidence", "Assemble the response", "Transfer the result"],
    phaseLabel: "Agentic retrieval stages",
    image: "agentic.webp",
    alt: "Agentic workstation with a mechanical document archive, optical retrieval vault, agent modules, evidence gate, and output tray",
    projects: [{ href: "/work/swaneeti", label: "Swa.Neeti" }, { href: "/work/windy", label: "Windy" }],
  },
  markets: {
    control: "Finance & Markets",
    title: "Finance & markets",
    summary: "I’m doing a Finance minor alongside Computer Science. I’ve studied derivatives and risk, and I’ve been building Spenza, where even a rounding decision can change what someone owes.",
    phases: ["Receive market inputs", "Reprice the scenarios", "Measure the loss tail", "Allocate the expense", "Route the balanced output", "Return to rest"],
    phaseLabel: "Financial research stages",
    image: "markets.webp",
    alt: "Finance workstation with a three-dimensional protective-put scenario surface, a circular risk instrument, and a three-lane ledger engine",
    projects: [{ href: "/work/spenza", label: "Spenza" }],
  },
  software: {
    control: "Systems & Robotics",
    title: "Systems & robotics",
    summary: "I enjoy seeing software move something physical. I’ve studied microprocessors and digital design, and I’ve worked on mechanical design with ThriveForce. The arm here is an imagined test cell.",
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
    summary: "I enjoy sketching and taking photos outside coursework and projects. I put a sketchbook here for that part of the room.",
    image: "lounge.webp",
    alt: "A rounded sofa with three cushions, a sketchbook on the side table, and a floor lamp beside the curtains",
  },
  desk: {
    title: "Gaming desk",
    summary: "I enjoy PC gaming in my free time.",
    image: "desk.webp",
    alt: "A gaming desk with a monitor, keyboard, headphones, and a PC with lit fans",
  },
  television: {
    title: "Television",
    summary: "I enjoy watching movies, so I gave the lounge a small screen.",
    image: "television.webp",
    alt: "A television on a low console showing a pixel landscape beneath the window",
  },
  artwork: {
    title: "Wall prints",
    summary: "I put a print from my aviation-weather project next to a couple of abstract studies.",
    image: "artwork.webp",
    alt: "Framed aviation-weather illustration and abstract contour prints",
  },
} as const satisfies Record<StudioObjectId,{ title:string; summary:string; image:string; alt:string }>;
