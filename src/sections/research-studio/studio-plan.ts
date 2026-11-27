export const studioBays = [
  { id: "software", title: "Systems & robotics", x: -3.25, z: 1.76 },
  { id: "agentic", title: "Agentic intelligence & RAG", x: -3.25, z: -1.68 },
  { id: "markets", title: "Finance & markets", x: 3.15, z: -1.68 },
  { id: "learning", title: "AI & machine learning", x: 3.15, z: 1.76 },
] as const;

export const agenticBay = studioBays[1];
export const learningBay = studioBays[3];
export type StudioStationId = "learning" | "agentic";
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
} as const;
