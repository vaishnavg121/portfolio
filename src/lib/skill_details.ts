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
    description: "Used for algorithmic problem solving, DSA and systems-oriented engineering, including deterministic market/order-book work.",
    usedIn: [{ label: "DSA" }, { label: "Systems" }, { label: "Order Book" }]
  },
  "python": {
    id: "python",
    title: "PYTHON / AI SYSTEMS",
    description: "Primary language across machine-learning pipelines, RAG systems and agentic applications.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" },
      { label: "IMD forecasting" }
    ]
  },
  "machine_learning": {
    id: "machine_learning",
    title: "MACHINE LEARNING",
    description: "Applied to aviation-weather forecasting and multivariate data analysis, from classical models to recurrent neural-network architectures.",
    usedIn: [
      { label: "IMD Pune" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "time_series": {
    id: "time_series",
    title: "TIME SERIES",
    description: "Used during aviation-weather work to model temporal airport observations, including LSTM, GRU, CNN-LSTM and Attention-LSTM experiments.",
    usedIn: [{ label: "India Meteorological Department" }]
  },
  "rag": {
    id: "rag",
    title: "RETRIEVAL-AUGMENTED GENERATION",
    description: "Used to ground LLM reasoning against retrieved evidence rather than relying only on model knowledge.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "agentic_systems": {
    id: "agentic_systems",
    title: "AGENTIC SYSTEMS",
    description: "Designed multi-stage systems where specialized reasoning, retrieval, validation and execution components cooperate under explicit state and control flows.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "quant_finance": {
    id: "quant_finance",
    title: "QUANTITATIVE FINANCE",
    description: "Combines Finance-minor coursework in derivatives and risk with practical market-system experimentation through AlphaCouncil.",
    usedIn: [
      { label: "BITS Finance minor" }
    ]
  },
  "postgresql": {
    id: "postgresql",
    title: "POSTGRESQL / DATA",
    description: "Used for persistent structured data in financial-software and research systems.",
    usedIn: [
      { label: "Spenza", href: "/work/spenza" },
      { label: "Swa.Neeti", href: "/work/swaneeti" }
    ]
  },
  "fastapi": {
    id: "fastapi",
    title: "FASTAPI / SYSTEM INTERFACE",
    description: "Used for typed backend interfaces and streaming AI workflows across several agentic systems.",
    usedIn: [
      { label: "Swa.Neeti", href: "/work/swaneeti" },
      { label: "Windy", href: "/work/windy" }
    ]
  },
  "robotic_systems": {
    id: "robotic_systems",
    title: "ROBOTICS / PHYSICAL SYSTEMS",
    description: "Combat-robot engineering through Team ThriveForce, combining CAD, simulation, fabrication and competition constraints.",
    usedIn: [
      { label: "Team ThriveForce" },
      { label: "A7X" },
      { label: "Slipknut" }
    ]
  }
};
