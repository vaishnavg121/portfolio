export type ChatDomain = "PROFILE" | "EDUCATION" | "EXPERIENCE" | "IMD" | "SWA_NEETI" | "WINDY" | "SPENZA" | "ROBOTICS" | "THRIVEFORCE" | "VELOCIRAPTOR" | "SKILLS" | "FINANCE" | "GAMING" | "MOVIES_ANIME" | "GITHUB" | "CONTACT" | "NAVIGATION" | "SYSTEM" | "UNKNOWN";

export type KnowledgeChunk = {
  id: string;
  domain: ChatDomain;
  topic: string;
  source?: string;
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
    domain: "PROFILE",
    topic: "origin",
    title: "Vaishnav Gadamsetty Intro",
    category: "profile",
    content: "Venkatanaga Vaishnav Gadamsetty (commonly Vaishnav Gadamsetty) is an engineering student born in Andhra Pradesh, spent early childhood in Mysore and Hyderabad, and later moved to Pune.",
    keywords: ["who", "vaishnav", "gadamsetty", "about", "born", "hometown", "mysore", "hyderabad", "pune", "profile"],
    priority: 10
  },
  {
    id: "education_college",
    domain: "EDUCATION",
    topic: "college",
    title: "University Education",
    category: "education",
    content: "Vaishnav studies computer science and minors in finance at BITS Hyderabad (August 2024 to August 2028). His current CGPA is 8.10.",
    keywords: ["education", "college", "bits", "pilani", "hyderabad", "cgpa", "degree", "university", "cs", "computer science"],
    priority: 10
  },
  {
    id: "education_school",
    domain: "EDUCATION",
    topic: "school",
    title: "High School Education",
    category: "education",
    content: "Vaishnav previously attended EON Gyanankur, Pune (Class XII: 94.4%) and The Orbis School, Pune (Class X: 98.2%).",
    keywords: ["school", "class xii", "class x", "pune", "eon gyanankur", "orbis"],
    priority: 6
  },
  {
    id: "education_entrance",
    domain: "EDUCATION",
    topic: "exams",
    title: "Entrance Exams",
    category: "education",
    content: "Academic entrances: BITSAT approx 317, JEE Main approx 99.19 percentile (rank ~12,990), JEE Advanced similar broad range.",
    keywords: ["jee", "bitsat", "rank", "percentile", "main", "advanced", "score"],
    priority: 5
  },
  {
    id: "interests_gaming",
    domain: "GAMING",
    topic: "gaming",
    title: "Gaming Interests",
    category: "personal",
    content: "Vaishnav likes story-driven PC games, including Sekiro, Ghost of Tsushima, Black Myth: Wukong, and Spider-Man.",
    keywords: ["games", "gaming", "sekiro", "wukong", "spider-man", "ghost of tsushima", "play", "favorite game"],
    priority: 8
  },
  {
    id: "interests_anime",
    domain: "MOVIES_ANIME",
    topic: "anime",
    title: "Movies and Anime",
    category: "personal",
    content: "Vaishnav enjoys movies and anime. Liked anime include Death Note, Your Lie in April, I Want to Eat Your Pancreas, Weathering With You, and Your Name.",
    keywords: ["anime", "movies", "death note", "your lie in april", "weathering with you", "your name"],
    priority: 8
  },
  {
    id: "interests_general",
    domain: "PROFILE",
    topic: "hobbies",
    title: "General Hobbies",
    category: "personal",
    content: "Vaishnav enjoys sketching, exploring, and building things in his free time.",
    keywords: ["interests", "hobbies", "sketching", "free time"],
    priority: 5
  },
  {
    id: "project_imd",
    domain: "IMD",
    topic: "overview",
    source: "PS1_final_report",
    title: "IMD Pune AI/ML Intern",
    category: "experience",
    content: "During an AI/ML Internship at the India Meteorological Department (IMD) in Pune (May 2026 - Jul 2026), Vaishnav worked on aviation-weather ML, focusing on predicting visibility-related parameters from heterogeneous meteorological sensor data. He built preprocessing and data-alignment workflows across multiple airports, decoding cloud telegrams and aligning temporal data at 15-sec resolution.",
    keywords: ["imd", "pune", "meteorological", "internship", "weather", "aviation", "data", "alignment", "preprocessing", "telegrams"],
    priority: 10
  },
  {
    id: "project_imd_ml",
    domain: "IMD",
    topic: "machine_learning",
    source: "PS1_final_report",
    title: "IMD Pune ML Modeling",
    category: "experience",
    content: "At IMD, Vaishnav benchmarked classical models including XGBoost, LightGBM, and CatBoost, and evaluated sequential deep-learning models such as LSTM, GRU, CNN-LSTM, and Attention-LSTM for MOR (Meteorological Optical Range), vertical visibility, and cloud-base prediction.",
    keywords: ["imd", "models", "xgboost", "lstm", "gru", "deep learning", "mor", "visibility", "cloud base", "vertical visibility", "machine learning"],
    priority: 10
  },
  {
    id: "project_swaneeti",
    domain: "SWA_NEETI",
    topic: "overview",
    title: "Swa.Neeti - Agentic Legal Research",
    category: "projects",
    content: "Swa.Neeti is an agentic legal-research system for Indian law. It turns case facts into structured facts, preliminary issues, and research plans. Its retrieval layer combines lexical and semantic search (BGE-M3), RRF fusion, and authority-aware reranking. A typed evidence graph connects facts, statutes, and precedents, with deterministic validation designed to reject unsupported references and hallucinated claims.",
    keywords: ["swa.neeti", "swaneeti", "legal", "law", "agentic", "rag", "hallucination", "precedents", "research", "graph", "indian law", "rrf"],
    priority: 10
  },
  {
    id: "project_windy",
    domain: "WINDY",
    topic: "overview",
    title: "Windy - Weather Analytics Platform",
    category: "projects",
    content: "Windy is an agentic weather analytics platform operating over ~15M observations across 5 airports. It routes natural language intents to DuckDB for deterministic aggregation or to a Semantic RAG index (NVIDIA Nemotron embeddings) for unstructured queries. It features an unsupervised ML pipeline (PCA + K-Means) to discover weather patterns across multivariate sensor features.",
    keywords: ["windy", "weather", "analytics", "duckdb", "rag", "nvidia", "clustering", "k-means", "pca", "agentic"],
    priority: 10
  },
  {
    id: "project_spenza",
    domain: "SPENZA",
    topic: "overview",
    title: "Spenza - Expense Management",
    category: "projects",
    content: "Spenza is a full-stack Fintech/expense management PWA built with Next.js 16, React 19, TypeScript, and PostgreSQL. It focuses on robust financial accounting by handling transactions using strict minor-unit integer math, deterministic rounding, and idempotency to ensure double-entry ledgers remain perfectly balanced even under concurrent load.",
    keywords: ["spenza", "expense", "fintech", "finance", "money", "nextjs", "postgresql", "ledger", "idempotency", "split", "settlement"],
    priority: 10
  },
  {
    id: "skills_tech",
    domain: "SKILLS",
    topic: "technical",
    title: "Technical Skills",
    category: "skills",
    content: "Languages: C++, Python, Java, C. Core CS: DSA, DBMS, OOP, Operating Systems. AI/ML: PyTorch, NumPy, Pandas, LLMs, RAG. Systems: Microprocessors, Assembly, Digital Design. Web: Next.js, React, FastAPI, PostgreSQL, Docker.",
    keywords: ["skills", "languages", "c++", "python", "java", "react", "nextjs", "tech", "stack", "systems", "core cs"],
    priority: 8
  },
  {
    id: "skills_finance",
    domain: "FINANCE",
    topic: "finance",
    title: "Finance Skills",
    category: "skills",
    content: "Vaishnav is pursuing a Minor in Finance, with skills in Quantitative Finance, Derivatives, and Risk Management. Relevant coursework includes Principles of Economics, Derivatives & Risk Management, and Fundamentals of Finance & Accounts.",
    keywords: ["finance", "minor", "quantitative", "derivatives", "risk", "economics"],
    priority: 7
  },
  {
    id: "robotics_general",
    domain: "ROBOTICS",
    topic: "overview",
    title: "Robotics & Hardware",
    category: "projects",
    content: "Vaishnav has experience in Robotics including Fusion 360, CAD Modelling, Finite Element Analysis (FEA), ROS 2, Gazebo, PX4, and QGroundControl. He utilizes C++ for systems-level programming.",
    keywords: ["robotics", "hardware", "ros", "px4", "gazebo", "cad", "c++", "systems"],
    priority: 8
  },
  {
    id: "robotics_thriveforce",
    domain: "THRIVEFORCE",
    topic: "combat_robotics",
    title: "ThriveForce & Velociraptor",
    category: "projects",
    content: "Vaishnav worked on Velociraptor and ThriveForce in combat robotics. He worked on FEA (Finite Element Analysis) evaluated using specific load cases (e.g., 2,000 N static FEA load case).",
    keywords: ["velociraptor", "thriveforce", "combat robot", "fea", "load case", "undercutter"],
    priority: 9
  },
  {
    id: "privacy_refusal",
    domain: "SYSTEM",
    topic: "privacy",
    title: "Privacy and Security",
    category: "system",
    content: "Vaishnav's phone number, private email, API keys, credentials, local filesystem paths, hidden development notes, and private repository information are strictly confidential and not available in the public portfolio.",
    keywords: ["phone", "number", "email", "contact", "api", "key", "password", "secret", "private"],
    priority: 1
  },
  {
    id: "nav_knowledge",
    domain: "NAVIGATION",
    topic: "knowledge",
    title: "Knowledge Landscape Navigation",
    category: "navigation",
    content: "The Knowledge section details Vaishnav's skills, coursework, and technical stack across domains like AI/ML, Data Systems, Computer Science, Web Infrastructure, and Finance.",
    keywords: ["knowledge", "landscape", "skills", "section", "navigate"],
    section: "knowledge",
    priority: 5
  }
];
