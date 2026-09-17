export type KnowledgeChunk = {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  route?: string;
  section?: string;
  priority?: number;
};

export const knowledgeBase: KnowledgeChunk[] = [
  {
    id: "profile_intro",
    title: "Vaishnav Gadamsetty Intro",
    category: "profile",
    content: "Venkatanaga Vaishnav Gadamsetty (commonly Vaishnav Gadamsetty) is an engineering student born in Andhra Pradesh, spent early childhood in Mysore and Hyderabad, and later moved to Pune. He is currently pursuing a B.E. in Computer Science with a Minor in Finance at BITS Pilani, Hyderabad Campus (Aug 2024 - Aug 2028).",
    keywords: ["who", "vaishnav", "gadamsetty", "about", "born", "hometown", "mysore", "hyderabad", "pune"],
    priority: 10
  },
  {
    id: "education",
    title: "Education & Academics",
    category: "education",
    content: "Vaishnav studies Computer Science with a Minor in Finance at BITS Pilani, Hyderabad Campus (CGPA 8.10). He previously attended EON Gyanankur, Pune (Class XII: 94.4%) and The Orbis School, Pune (Class X: 98.2%). Academic entrances: BITSAT approx 317, JEE Main approx 99.19 percentile (rank ~12,990), JEE Advanced similar broad range.",
    keywords: ["education", "school", "college", "bits", "pilani", "hyderabad", "cgpa", "marks", "jee", "bitsat", "rank", "percentile"],
    priority: 9
  },
  {
    id: "interests",
    title: "Personal Interests",
    category: "personal",
    content: "Vaishnav enjoys sketching, PC gaming, story-driven games, movies, anime, and exploring/building things. Liked games include Sekiro, Ghost of Tsushima, Black Myth: Wukong, and Spider-Man. Liked anime include Death Note, Your Lie in April, I Want to Eat Your Pancreas, Weathering With You, and Your Name.",
    keywords: ["interests", "hobbies", "games", "gaming", "anime", "movies", "sekiro", "wukong", "spider-man", "sketching"],
    priority: 5
  },
  {
    id: "project_imd",
    title: "IMD Pune AI/ML Intern",
    category: "experience",
    content: "During an AI/ML Internship at the India Meteorological Department (IMD) in Pune (May 2026 - Jul 2026), Vaishnav built a reusable aviation-weather ML workflow. He engineered an end-to-end forecasting pipeline for Vertical Visibility and RVR (Runway Visual Range) using data from 4 airports and 5 sensor streams at 15-sec resolution. He benchmarked 15+ classical models and compared LSTMs/GRUs for cloud base predictions to support landing minima and airport safety.",
    keywords: ["imd", "pune", "meteorological", "internship", "weather", "aviation", "vertical visibility", "rvr", "forecasting", "machine learning"],
    route: "/work/imdpune",
    priority: 10
  },
  {
    id: "project_swaneeti",
    title: "Swa.Neeti - Agentic Legal Research",
    category: "projects",
    content: "Swa.Neeti is an agentic legal-research system for Indian law. It turns case facts into structured facts, preliminary issues, and research plans. Its retrieval layer combines lexical and semantic search (BGE-M3), RRF fusion, and authority-aware reranking. A typed evidence graph connects facts, statutes, and precedents, with deterministic validation designed to reject unsupported references and hallucinated claims.",
    keywords: ["swa.neeti", "swaneeti", "legal", "law", "agentic", "rag", "hallucination", "precedents", "research", "graph"],
    route: "/work/swaneeti",
    priority: 10
  },
  {
    id: "project_windy",
    title: "Windy - Weather Analytics Platform",
    category: "projects",
    content: "Windy is an agentic weather analytics platform operating over ~15M observations across 5 airports. It routes natural language intents to DuckDB for deterministic aggregation or to a Semantic RAG index (NVIDIA Nemotron embeddings) for unstructured queries. It features an unsupervised ML pipeline (PCA + K-Means) to discover weather patterns across multivariate sensor features.",
    keywords: ["windy", "weather", "analytics", "duckdb", "rag", "nvidia", "clustering", "k-means", "pca", "agentic"],
    route: "/work/windy",
    priority: 10
  },
  {
    id: "project_spenza",
    title: "Spenza - Expense Management",
    category: "projects",
    content: "Spenza is a full-stack Fintech/expense management PWA built with Next.js 16, React 19, TypeScript, and PostgreSQL. It focuses on robust financial accounting by handling transactions using strict minor-unit integer math, deterministic rounding, and idempotency to ensure double-entry ledgers remain perfectly balanced even under concurrent load.",
    keywords: ["spenza", "expense", "fintech", "finance", "money", "nextjs", "postgresql", "ledger", "idempotency"],
    route: "/work/spenza",
    priority: 8
  },
  {
    id: "skills_tech",
    title: "Technical Skills",
    category: "skills",
    content: "Languages: C++, Python, Java, C. Core CS: DSA, DBMS, OOP, Operating Systems. AI/ML: PyTorch, NumPy, Pandas, LLMs, RAG. Systems: Microprocessors, Assembly, Digital Design. Web: Next.js, React, FastAPI, PostgreSQL, Docker.",
    keywords: ["skills", "languages", "c++", "python", "java", "react", "nextjs", "tech", "stack", "systems", "core cs"],
    priority: 8
  },
  {
    id: "skills_finance",
    title: "Finance Skills",
    category: "skills",
    content: "Vaishnav is pursuing a Minor in Finance, with skills in Quantitative Finance, Derivatives, and Risk Management. Relevant coursework includes Principles of Economics, Derivatives & Risk Management, and Fundamentals of Finance & Accounts.",
    keywords: ["finance", "minor", "quantitative", "derivatives", "risk", "economics"],
    priority: 7
  },
  {
    id: "robotics",
    title: "Robotics & Hardware",
    category: "projects",
    content: "Vaishnav has experience in Robotics including Fusion 360, CAD Modelling, Finite Element Analysis (FEA), ROS 2, Gazebo, PX4, and QGroundControl. He worked on Velociraptor and ThriveForce, utilizing C++ for systems-level programming and FEA evaluated using specific load cases (e.g., 2,000 N).",
    keywords: ["robotics", "hardware", "ros", "px4", "gazebo", "velociraptor", "thriveforce", "cad", "c++", "systems"],
    priority: 8
  },
  {
    id: "privacy_refusal",
    title: "Privacy and Security",
    category: "system",
    content: "Vaishnav phone number, private email, API keys, credentials, local filesystem paths, hidden development notes, and private repository information are strictly confidential and not available in the public portfolio.",
    keywords: ["phone", "number", "email", "contact", "api", "key", "password", "secret", "private"],
    priority: 1
  },
  {
    id: "nav_knowledge",
    title: "Knowledge Landscape Navigation",
    category: "navigation",
    content: "The Knowledge section details Vaishnav skills, coursework, and technical stack across domains like AI/ML, Data Systems, Computer Science, Web Infrastructure, and Finance.",
    keywords: ["knowledge", "landscape", "skills", "section", "navigate"],
    section: "knowledge",
    priority: 5
  }
];
