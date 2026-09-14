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
    slug: "alphacouncil",
    id: "01",
    title: "AlphaCouncil",
    category: "FINANCE / AI / AGENTIC SYSTEMS",
    description: "An AI-driven paper-trading research and execution system using a committee of specialized agents, deterministic risk controls and fail-closed execution. PAPER TRADING ONLY.",
    tags: ["Python", "FastAPI", "Alpaca", "NVIDIA models", "SQLite", "Next.js"],
    theme: "red / ember / market-line",
    architecture: ["MARKET", "DISCOVERY", "COMMITTEE", "RISK", "EXECUTION"],
    github: "https://github.com/vaishnavg121/AlphaCouncil"
  },
  {
    slug: "swaneeti",
    id: "02",
    title: "Swa.Neeti",
    category: "RAG / AGENTIC AI / LEGAL RESEARCH",
    description: "An agentic legal-research and case-reasoning system for Indian law, designed to reduce unsupported claims through provenance-aware retrieval and deterministic evidence validation.",
    tags: ["RAG", "Next.js", "PostgreSQL", "Reasoning"],
    theme: "ink / paper spread",
    architecture: ["QUERY", "RETRIEVAL", "AUTHORITIES", "REASONING", "VALIDATION"],
    github: "https://github.com/vaishnavg121/swa-neeti"
  },
  {
    slug: "windy",
    id: "03",
    title: "Windy",
    category: "ML / DATA / AVIATION / RAG",
    description: "An agentic aviation-weather analytics platform operating over large-scale airport meteorological observations (~15M weather observations).",
    tags: ["DuckDB", "Polars", "RAG", "NVIDIA embeddings"],
    theme: "wind / flowing-line motion",
    architecture: ["DATA INGESTION", "FEATURE ENG", "MODEL", "PREDICTION"],
    github: "https://github.com/vaishnavg121/Windy"
  },
  {
    slug: "spenza",
    id: "04",
    title: "Spenza",
    category: "FINTECH / FINANCIAL SOFTWARE",
    description: "An expense-sharing application focused on reliable financial accounting, group balances and deterministic transaction workflows.",
    tags: ["Next.js", "React", "TypeScript", "PostgreSQL", "Prisma"],
    theme: "clean grid / balance",
    architecture: ["USER", "TRANSACTION", "SPLIT LOGIC", "LEDGER"],
    github: "https://github.com/vaishnavg121/spenza"
  },
  {
    slug: "thriveforce",
    id: "05",
    title: "ThriveForce",
    category: "ENGINEERING / ROBOTICS / EXTRA-CURRICULAR",
    description: "Combat robotics systems engineered for high-impact forces. Work includes robot design, simulation, fabrication, budgeting, and sponsorship management.",
    tags: ["CAD", "Finite Element Analysis", "Fabrication", "C++"],
    theme: "blueprint / structural",
    architecture: ["CHASSIS", "DRIVETRAIN", "WEAPON SYSTEM", "ELECTRONICS"],
    github: "" 
  }
];
