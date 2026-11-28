export const studioBays = [
  { id: "software", title: "Systems & robotics", x: -3.25, z: 1.76 },
  { id: "agentic", title: "Agentic intelligence & RAG", x: -3.25, z: -1.68 },
  { id: "markets", title: "Finance & markets", x: 3.15, z: -1.68 },
  { id: "learning", title: "AI & machine learning", x: 3.15, z: 1.76 },
] as const;

export const agenticBay = studioBays[1];
export const marketsBay = studioBays[2];
export const learningBay = studioBays[3];
export const studioStationIds = ["learning", "agentic", "markets"] as const;
export type StudioStationId = typeof studioStationIds[number];
export const learningPhases = ["Ingest observations", "Condition & encode", "Build a forecast", "Route the result"] as const;
export const stationDetails = {
  learning: {
    control: "Inspect AI / ML",
    title: "Sensor to forecast",
    summary: "Follow observations through conditioning, model inference and a visibility forecast. The animation illustrates the pipeline.",
    phases: learningPhases,
    phaseLabel: "Forecasting stages",
    image: "station.webp",
    alt: "Forecasting workstation showing the sensor manifold, observation chamber, and plot planes",
    projects: [{ href: "/work/imdpune", label: "Vertical Visibility" }, { href: "/work/windy", label: "Windy" }],
  },
  agentic: {
    control: "Inspect Agentic / RAG",
    title: "Question to sourced response",
    summary: "Follow a query through the document archive, semantic retrieval and an evidence gate. The floor conduit depicts a conceptual handoff.",
    phases: ["Interpret the query", "Retrieve source passages", "Exchange findings", "Verify the evidence", "Assemble the response", "Transfer the result"],
    phaseLabel: "Agentic retrieval stages",
    image: "agentic.webp",
    alt: "Agentic workstation with a mechanical document archive, optical retrieval vault, agent modules, evidence gate, and output tray",
    projects: [{ href: "/work/swaneeti", label: "Swa.Neeti" }],
  },
  markets: {
    control: "Inspect Finance & Markets",
    title: "Markets, risk and ledgers",
    summary: "An illustrative protective-put surface shows profit or loss by spot price and time remaining. In the separate loss model, VaR marks the worst 5% cutoff and Expected Shortfall is the mean of that tail.",
    note: "Illustrative ledger in minor units. 1,200 − 500 − 400 − 300 = 0.",
    phases: ["Receive market inputs", "Reprice the scenarios", "Measure the loss tail", "Allocate the expense", "Route the balanced output", "Return to rest"],
    phaseLabel: "Financial research stages",
    image: "markets.webp",
    alt: "Finance workstation with a three-dimensional protective-put scenario surface, a circular risk instrument, and a three-lane ledger engine",
    projects: [{ href: "/work/spenza", label: "Spenza" }],
  },
} as const;
