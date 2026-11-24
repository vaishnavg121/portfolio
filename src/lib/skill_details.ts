export type SkillDetail = {
  id: string;
  title: string;
  description: string;
  usedIn: { label: string; href?: string }[];
};

export const SKILL_DETAILS: Record<string, SkillDetail> = {
  "c__": {
    id: "c__",
    title: "C++ / SYSTEMS",
    description: "I use C++ for algorithms and systems work, including an order book.",
    usedIn: [{ label: "DSA" }, { label: "Systems" }, { label: "Order Book" }]
  },
  "python": {
    id: "python",
    title: "PYTHON / AI SYSTEMS",
    description: "Python is the language I use most for training models, working with data, and building tools such as Windy and Swa.Neeti.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" },
      { label: "IMD forecasting" }
    ]
  },
  "machine_learning": {
    id: "machine_learning",
    title: "MACHINE LEARNING",
    description: "I’ve used machine learning for airport weather forecasts and to look for patterns across several weather variables.",
    usedIn: [
      { label: "IMD Pune" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "time_series": {
    id: "time_series",
    title: "TIME SERIES",
    description: "At IMD, I used sequences of weather observations to compare LSTM, GRU, CNN-LSTM, and Attention-LSTM models.",
    usedIn: [{ label: "India Meteorological Department" }]
  },
  "rag": {
    id: "rag",
    title: "RETRIEVAL-AUGMENTED GENERATION",
    description: "I use retrieval to give a language model relevant excerpts it can cite. In Windy, those excerpts add context to calculations done in DuckDB.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "agentic_systems": {
    id: "agentic_systems",
    title: "AGENTIC SYSTEMS",
    description: "I split retrieval, reasoning and validation into separate stages so I can see where an answer comes from and what was checked.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "quant_finance": {
    id: "quant_finance",
    title: "QUANTITATIVE FINANCE",
    description: "I study derivatives and risk in my finance minor and explore market systems in AlphaCouncil.",
    usedIn: [
      { label: "BITS Finance minor" }
    ]
  },
  "postgresql": {
    id: "postgresql",
    title: "POSTGRESQL / DATA",
    description: "I use PostgreSQL to store the ledger in Spenza and structured research data in Swa.Neeti.",
    usedIn: [
      { label: "Spenza", href: "/work/spenza" },
      { label: "Swa.Neeti", href: "/work/swaneeti" }
    ]
  },
  "fastapi": {
    id: "fastapi",
    title: "FASTAPI / SYSTEM INTERFACE",
    description: "I use FastAPI to define the backend endpoints and stream progress in Windy and Swa.Neeti.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "robotic_systems": {
    id: "robotic_systems",
    title: "ROBOTICS / PHYSICAL SYSTEMS",
    description: "With ThriveForce, I work on CAD, simulation and fabrication for competition robots.",
    usedIn: [
      { label: "Team ThriveForce" },
      { label: "A7X" },
      { label: "Slipknut" }
    ]
  }
};
