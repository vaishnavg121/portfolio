export interface Domain { id: string; label: string; x: number; y: number; }
export interface Node { id: string; label: string; x: number; y: number; level: 'A' | 'B' | 'C'; domainId: string; }

export const DOMAINS: Domain[] = [
  {
    "id": "cs",
    "label": "DOMAIN_01 // COMPUTER SCIENCE",
    "x": -500,
    "y": -100
  },
  {
    "id": "ai",
    "label": "DOMAIN_02 // AI / ML & DATA",
    "x": 0,
    "y": -400
  },
  {
    "id": "finance",
    "label": "DOMAIN_03 // FINANCE & MARKETS",
    "x": -400,
    "y": 300
  },
  {
    "id": "web",
    "label": "DOMAIN_04 // WEB & INFRASTRUCTURE",
    "x": 0,
    "y": 350
  },
  {
    "id": "robotics",
    "label": "DOMAIN_05 // ROBOTICS & ENGINEERING",
    "x": 450,
    "y": 300
  }
];
export const NODES: Node[] = [
  {
    "id": "c__",
    "label": "C++",
    "x": -529,
    "y": -150,
    "level": "A",
    "domainId": "cs"
  },
  {
    "id": "dsa",
    "label": "DSA",
    "x": -495,
    "y": -200,
    "level": "B",
    "domainId": "cs"
  },
  {
    "id": "c",
    "label": "C",
    "x": -458,
    "y": -45,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "java",
    "label": "Java",
    "x": -579,
    "y": -150,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "oop",
    "label": "OOP",
    "x": -425,
    "y": -148,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "operating_systems",
    "label": "Operating Systems",
    "x": -525,
    "y": -5,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "database_systems",
    "label": "Database Systems",
    "x": -549,
    "y": -194,
    "level": "B",
    "domainId": "cs"
  },
  {
    "id": "discrete_structures",
    "label": "Discrete Structures",
    "x": -394,
    "y": -200,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "logic_in_cs",
    "label": "Logic in CS",
    "x": -611,
    "y": -200,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "microprocessors",
    "label": "Microprocessors",
    "x": -446,
    "y": 0,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "assembly",
    "label": "Assembly",
    "x": -460,
    "y": 50,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "digital_design",
    "label": "Digital Design",
    "x": -620,
    "y": -50,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "python",
    "label": "Python",
    "x": -29,
    "y": -480,
    "level": "A",
    "domainId": "ai"
  },
  {
    "id": "machine_learning",
    "label": "Machine Learning",
    "x": 5,
    "y": -550,
    "level": "A",
    "domainId": "ai"
  },
  {
    "id": "rag",
    "label": "RAG",
    "x": 42,
    "y": -600,
    "level": "A",
    "domainId": "ai"
  },
  {
    "id": "agentic_systems",
    "label": "Agentic Systems",
    "x": -79,
    "y": -600,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "embeddings",
    "label": "Embeddings",
    "x": 75,
    "y": -448,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "semantic_search",
    "label": "Semantic Search",
    "x": -25,
    "y": -305,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "vector_retrieval",
    "label": "Vector Retrieval",
    "x": -49,
    "y": -494,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "llms",
    "label": "LLMs",
    "x": 106,
    "y": -361,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "data_analysis",
    "label": "Data Analysis",
    "x": -111,
    "y": -354,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "numpy",
    "label": "NumPy",
    "x": 54,
    "y": -515,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "pandas",
    "label": "Pandas",
    "x": 40,
    "y": -273,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "feature_engineering",
    "label": "Feature Engineering",
    "x": -120,
    "y": -470,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "time_series",
    "label": "Time-Series",
    "x": 141,
    "y": -431,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "quant_finance",
    "label": "Quant Finance",
    "x": -429,
    "y": 100,
    "level": "A",
    "domainId": "finance"
  },
  {
    "id": "derivatives",
    "label": "Derivatives",
    "x": -395,
    "y": 200,
    "level": "B",
    "domainId": "finance"
  },
  {
    "id": "risk_management",
    "label": "Risk Management",
    "x": -358,
    "y": 355,
    "level": "B",
    "domainId": "finance"
  },
  {
    "id": "financial_markets",
    "label": "Financial Markets",
    "x": -479,
    "y": 150,
    "level": "C",
    "domainId": "finance"
  },
  {
    "id": "fundamentals",
    "label": "Fundamentals",
    "x": -325,
    "y": 252,
    "level": "C",
    "domainId": "finance"
  },
  {
    "id": "fastapi",
    "label": "FastAPI",
    "x": -29,
    "y": 350,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "next_js",
    "label": "Next.js",
    "x": 5,
    "y": 400,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "react",
    "label": "React",
    "x": 42,
    "y": 350,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "typescript",
    "label": "TypeScript",
    "x": -79,
    "y": 336,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "express",
    "label": "Express",
    "x": 75,
    "y": 302,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "prisma",
    "label": "Prisma",
    "x": -25,
    "y": 445,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "postgresql",
    "label": "PostgreSQL",
    "x": -49,
    "y": 350,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "git",
    "label": "Git",
    "x": 106,
    "y": 450,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "github_actions",
    "label": "GitHub Actions",
    "x": -111,
    "y": 450,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "linux",
    "label": "Linux",
    "x": 54,
    "y": 235,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "docker",
    "label": "Docker",
    "x": 40,
    "y": 500,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "duckdb",
    "label": "DuckDB",
    "x": -120,
    "y": 400,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "sqlite",
    "label": "SQLite",
    "x": 141,
    "y": 400,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "vector_dbs",
    "label": "Vector DBs",
    "x": -86,
    "y": 472,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "robotic_systems",
    "label": "Robotics",
    "x": 421,
    "y": 327,
    "level": "A",
    "domainId": "robotics"
  },
  {
    "id": "ros_2",
    "label": "ROS 2",
    "x": 455,
    "y": 244,
    "level": "B",
    "domainId": "robotics"
  },
  {
    "id": "gazebo",
    "label": "Gazebo",
    "x": 492,
    "y": 355,
    "level": "C",
    "domainId": "robotics"
  },
  {
    "id": "px4",
    "label": "PX4",
    "x": 371,
    "y": 300,
    "level": "C",
    "domainId": "robotics"
  },
  {
    "id": "qgroundcontrol",
    "label": "QGroundControl",
    "x": 525,
    "y": 400,
    "level": "C",
    "domainId": "robotics"
  },
  {
    "id": "fusion_360",
    "label": "Fusion 360",
    "x": 425,
    "y": 395,
    "level": "B",
    "domainId": "robotics"
  },
  {
    "id": "fea",
    "label": "FEA",
    "x": 401,
    "y": 350,
    "level": "C",
    "domainId": "robotics"
  }
];
export const CONNECTIONS: [string, string][] = [
[
    "python",
    "machine_learning"
  ],
  [
    "python",
    "rag"
  ],
  [
    "python",
    "agentic_systems"
  ],
  [
    "rag",
    "embeddings"
  ],
  [
    "rag",
    "semantic_search"
  ],
  [
    "rag",
    "vector_retrieval"
  ],
  [
    "fastapi",
    "python"
  ],
  [
    "fastapi",
    "agentic_systems"
  ],
  [
    "quant_finance",
    "risk_management"
  ],
  [
    "quant_finance",
    "derivatives"
  ],
  [
    "agentic_systems",
    "llms"
  ],
  [
    "machine_learning",
    "data_analysis"
  ],
  [
    "data_analysis",
    "pandas"
  ],
  [
    "data_analysis",
    "numpy"
  ],
  [
    "time_series",
    "machine_learning"
  ],
  [
    "time_series",
    "data_analysis"
  ],
  [
    "c__",
    "dsa"
  ],
  [
    "c__",
    "operating_systems"
  ],
  [
    "c",
    "operating_systems"
  ],
  [
    "database_systems",
    "postgresql"
  ],
  [
    "postgresql",
    "prisma"
  ],
  [
    "next_js",
    "react"
  ],
  [
    "next_js",
    "typescript"
  ],
  [
    "fastapi",
    "next_js"
  ],
  [
    "vector_dbs",
    "vector_retrieval"
  ],
  [
    "duckdb",
    "data_analysis"
  ],
  [
    "docker",
    "linux"
  ],
  [
    "docker",
    "fastapi"
  ],
  [
    "robotic_systems",
    "fusion_360"
  ],
  [
    "robotic_systems",
    "ros_2"
  ],
  [
    "ros_2",
    "gazebo"
  ],
  [
    "ros_2",
    "c__"
  ],
  [
    "px4",
    "robotic_systems"
  ],
  [
    "agentic_systems",
    "quant_finance"
  ],
  [
    "python",
    "quant_finance"
  ],
  [
    "machine_learning",
    "rag"
  ],
  [
    "rag",
    "agentic_systems"
  ],
  [
    "java",
    "oop"
  ],
  [
    "c__",
    "oop"
  ],
  [
    "discrete_structures",
    "logic_in_cs"
  ],
  [
    "discrete_structures",
    "dsa"
  ],
  [
    "microprocessors",
    "assembly"
  ],
  [
    "digital_design",
    "microprocessors"
  ],
  [
    "assembly",
    "c"
  ],
  [
    "feature_engineering",
    "machine_learning"
  ],
  [
    "financial_markets",
    "quant_finance"
  ],
  [
    "fundamentals",
    "financial_markets"
  ],
  [
    "express",
    "next_js"
  ],
  [
    "git",
    "github_actions"
  ],
  [
    "sqlite",
    "database_systems"
  ],
  [
    "qgroundcontrol",
    "px4"
  ],
  [
    "fea",
    "fusion_360"
  ],
  [
    "feature_engineering",
    "time_series"
  ],
  [
    "sqlite",
    "python"
  ],
  [
    "java",
    "database_systems"
  ],
  [
    "logic_in_cs",
    "agentic_systems"
  ]
];
