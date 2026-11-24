export const profile = {
  name: "Venkatanaga Vaishnav Gadamsetty",
  displayName: "Vaishnav Gadamsetty",
  shortName: "Vaishnav",
  positioning: "Computer Science + Finance student interested in AI, RAG & Agentic Systems, Quantitative Finance, and Robotics.",
  about: "I'm Vaishnav, a Computer Science student with a Finance minor at BITS Pilani, Hyderabad Campus. I like exploring systems where algorithms, intelligence, markets and physical engineering intersect.\n\nMy work ranges from agentic financial systems and legal RAG to aviation weather analytics, financial software and combat robotics.",
  interests: ["Movies", "Sketching", "PC Gaming"]
};

export const education = {
  university: {
    name: "BITS Pilani, Hyderabad Campus",
    degree: "B.E. Computer Science",
    minor: "Minor in Finance",
    timeline: "August 2024 — August 2028",
    gpa: "CGPA: 8.10"
  },
  previous: [
    {
      name: "EON Gyanankur, Kharadi, Pune — CBSE",
      level: "Class XII",
      score: "94.4%",
      year: "2024"
    },
    {
      name: "The Orbis School, Pune — CBSE",
      level: "Class X",
      score: "98.2%",
      year: "2022"
    }
  ]
};

export const experience = [
  {
    company: "India Meteorological Department (IMD), Pune",
    role: "AI/ML Intern",
    timeline: "May 2026 — July 2026",
    description: "Core work in aviation-weather machine learning, time-series forecasting, and operational analytics.",
    details: [
      "aviation-weather machine learning",
      "time-series forecasting",
      "preprocessing and quality control",
      "heterogeneous meteorological sensor data",
      "feature engineering",
      "forecasting-model evaluation",
      "operational aviation-weather analytics"
    ]
  }
];

export const extracurricular = {
  team: "Team ThriveForce",
  role: "Treasurer & Engineer",
  description: "Combat robotics systems engineered for high-impact forces.",
  activities: [
    "combat robotics",
    "robot design",
    "simulation",
    "fabrication",
    "budgeting",
    "technical procurement",
    "sponsorship management"
  ],
  sponsors: ["PCBWay", "OnlyScrews", "Technobotix"],
  robots: ["A7X — 8 kg", "Slipknut — 15 kg"],
  patent: "Designed and filed a patent application for a custom combat-robotics Kill Switch."
};

export const skills = {
  core: ["C++", "Python", "Java", "C", "SQL", "TypeScript"],
  ai_ml: [
    "Machine Learning", "PyTorch", "NumPy", "Pandas", "Time-Series Forecasting", 
    "Feature Engineering", "Data Analysis", "LLMs", "RAG", "Agentic Systems", 
    "Embeddings", "Semantic Search", "Vector Retrieval"
  ],
  computer_science: [
    "Data Structures & Algorithms", "Object-Oriented Programming", "Database Systems",
    "Operating Systems", "Discrete Structures", "Logic in Computer Science"
  ],
  data_systems: [
    "SQL", "PostgreSQL", "DuckDB", "SQLite", "Vector Databases", 
    "Microprocessors", "Assembly Language", "Digital Design"
  ],
  finance: [
    "Quantitative Finance", "Derivatives", "Risk Management", 
    "Fundamentals of Finance", "Financial Markets"
  ],
  robotics: [
    "Fusion 360", "CAD Modelling", "Finite Element Analysis", "Robotic Systems",
    "ROS 2", "Gazebo", "PX4", "QGroundControl"
  ],
  web_infrastructure: [
    "Next.js", "React", "FastAPI", "Express", "Prisma", "PostgreSQL",
    "Git", "Linux", "Docker", "GitHub Actions"
  ]
};

export const coursework = [
  "Data Structures & Algorithms", "Database Systems", "Object-Oriented Programming",
  "Operating Systems", "Discrete Structures", "Logic in Computer Science",
  "Digital Design", "Microprocessors & Interfacing", "Principles of Economics",
  "Derivatives & Risk Management", "Fundamentals of Finance & Accounts"
];

export const socials = {
  github: "https://github.com/vaishnavg121",
  linkedin: "https://www.linkedin.com/in/venkatanaga-vaishnav-gadamsetty-27925a370/"
};

export const projects = [
  {
    slug: "imdpune",
    id: "01",
    title: "Vertical Visibility",
    category: "ML / AVIATION / TIME-SERIES",
    year: "2026",
    status: "Completed",
    description: "An advanced machine learning pipeline developed for the India Meteorological Department to predict vertical visibility and RVR at IGIA, New Delhi, using heterogeneous meteorological sensor data.",
    tags: ["Python", "PyTorch", "Time-Series", "Machine Learning", "Data Science"],
    theme: "blue / atmosphere / grid",
    architecture: ["DATA INGESTION", "PREPROCESSING", "MODELLING", "EVALUATION"],
    github: "", // Internal IMD Project, no public repo
    problem: "Accurate forecasting of runway visual range (RVR) and vertical visibility is critical for aviation safety, especially during dense fog events at major airports like IGIA.",
    idea: "Implement and evaluate various time-series forecasting models (Classical, Machine Learning, and Deep Learning) to predict vertical visibility based on historical multi-sensor meteorological data.",
    engineering: "Processed large-scale heterogeneous sensor data. Implemented handling for missing observations and extreme weather conditions. Built and evaluated models ranging from XGBoost and Random Forest to LSTMs and Attention networks.",
    challenges: "Dealing with highly imbalanced datasets where low-visibility events (dense fog) are rare but critical. Handling missing data from disparate sensors.",
    currentState: "Completed analysis and modeling phase, identifying optimal model architectures for RVR and Vertical Visibility prediction."
  },
  {
    slug: "swaneeti",
    id: "02",
    title: "Swa.Neeti",
    category: "RAG / AGENTIC AI / LEGAL RESEARCH",
    year: "2024",
    status: "Completed",
    description: "An agentic legal-research and case-reasoning system for Indian law, designed to reduce unsupported claims through provenance-aware retrieval and deterministic evidence validation.",
    tags: ["RAG", "Next.js", "PostgreSQL", "Reasoning", "Python", "FastAPI"],
    theme: "ink / paper spread",
    architecture: ["QUERY", "RETRIEVAL", "AUTHORITIES", "REASONING", "VALIDATION"],
    github: "https://github.com/vaishnavg121/swa-neeti",
    problem: "Standard LLMs frequently hallucinate case law and misinterpret legal precedents, inventing fictitious citations that make them unviable for actual legal research.",
    idea: "Build an intake-to-analysis vertical slice that extracts facts supported ONLY by the user's text, asks materially useful follow-up questions, and identifies preliminary issue categories using strict boundaries.",
    engineering: "Constructed an agentic legal-research engine using NVIDIA Nemotron models. Implemented page-aware sliding window chunking and hybrid retrieval (Cosine/Dot-product). Built a safe, deterministic pipeline that keeps LLM generation grounded by validating evidence and limiting answers strictly to provided context.",
    challenges: "Structuring case facts correctly and preventing the LLM from stating sweeping legal conclusions. Resolving adversarial reasoning loops required strict enforcement of source provenance.",
    currentState: "Delivered Milestone 0: a functional, safe intake-to-analysis vertical slice capable of analyzing legal text without searching external unverified law."
  },
  {
    slug: "windy",
    id: "03",
    title: "Windy",
    category: "ML / DATA / AVIATION / RAG",
    year: "2026",
    status: "Research Phase",
    description: "An evidence-grounded aviation meteorological analytics system combining deterministic sensor analytics, retrieval-augmented generation, and unsupervised pattern discovery.",
    tags: ["DuckDB", "Polars", "RAG", "NVIDIA Embeddings", "FastAPI", "React"],
    theme: "wind / flowing-line motion",
    architecture: ["INTENT CLASSIFICATION", "DUCKDB AGGREGATION", "SEMANTIC RAG", "K-MEANS PCA(2)"],
    github: "https://github.com/vaishnavg121/Windy",
    problem: "Large heterogeneous meteorological datasets (millions of observations across multiple airports) are hard to query through natural language without LLMs hallucinating the math.",
    idea: "Route natural-language questions to specialized tools: deterministic numerical aggregation goes to DuckDB, and unstructured knowledge queries go to a Semantic RAG vector index.",
    engineering: "Engineered an intelligent routing layer using NVIDIA Nemotron 3.5 Lightning. Exact numerical operations over 15M raw METAR/SPECI observations are handled by DuckDB and Polars. Natural-language investigation of recurrent patterns triggers a StandardScaler + PCA(2) + K-Means pipeline over sample blocks of 5,000 observations for rapid multivariate clustering.",
    challenges: "Ensuring real-time API responsiveness while performing complex unsupervised ML on massive time-series data. Maintaining a safe architecture that streams SSE metadata instead of raw LLM scratchpads.",
    currentState: "Active functional demonstrator pipeline processing a 15-million observation dataset across five major Indian airports."
  },
  {
    slug: "spenza",
    id: "04",
    title: "Spenza",
    category: "FINTECH / FINANCIAL SOFTWARE",
    year: "2024",
    status: "Completed",
    description: "An expense-sharing PWA platform built to handle robust financial accounting, utilizing deterministic minor-unit integers and double-entry ledger principles.",
    tags: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma"],
    theme: "clean grid / balance",
    architecture: ["USER ENTITY", "SPLIT LOGIC", "IDEMPOTENT WORKFLOWS", "LEDGER"],
    github: "https://github.com/vaishnavg121/spenza",
    problem: "Naive expense tracking applications struggle with floating-point inaccuracies and concurrency errors, leading to unbalanced group ledgers and lost minor units over time.",
    idea: "Build a robust, reliable expense-sharing PWA backed by strict minor-unit integer arithmetic, double-entry principles, and idempotent transactions.",
    engineering: "Structured the repository as a pnpm workspace with shared API contracts (Zod schemas). Engineered an Express API backed by Prisma and PostgreSQL to handle complex multi-way splits. Developed an idempotency mechanism ensuring that ledger transactions remain perfectly balanced even under concurrent load.",
    challenges: "Enforcing that the ledger sums to exactly zero during uneven fractional multi-way splits. Managing strict monorepo dependency boundaries between contracts and API logic.",
    currentState: "Fully tested (200+ integration and web tests) with a promoted PWA frontend and production-ready Express API."
  }
];
