export interface Domain { id: string; label: string; x: number; y: number; }
export interface Node { id: string; label: string; x: number; y: number; level: 'A' | 'B' | 'C'; domainId: string; }

export const DOMAINS: Domain[] = [
  {
    "id": "cs",
    "label": "DOMAIN_01 // COMPUTER SCIENCE",
    "x": -400,
    "y": -250
  },
  {
    "id": "ai",
    "label": "DOMAIN_02 // AI / ML & DATA",
    "x": 0,
    "y": 0
  },
  {
    "id": "finance",
    "label": "DOMAIN_03 // FINANCE & MARKETS",
    "x": 400,
    "y": -250
  },
  {
    "id": "web",
    "label": "DOMAIN_04 // WEB & INFRASTRUCTURE",
    "x": -400,
    "y": 300
  },
  {
    "id": "robotics",
    "label": "DOMAIN_05 // ROBOTICS & ENGINEERING",
    "x": 400,
    "y": 300
  }
];
export const NODES: Node[] = [
  {
    "id": "c__",
    "label": "C++",
    "x": -386,
    "y": -249,
    "level": "A",
    "domainId": "cs"
  },
  {
    "id": "dsa",
    "label": "DSA",
    "x": -468,
    "y": -203,
    "level": "B",
    "domainId": "cs"
  },
  {
    "id": "c",
    "label": "C",
    "x": -343,
    "y": -409,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "java",
    "label": "Java",
    "x": -370,
    "y": -112,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "oop",
    "label": "OOP",
    "x": -519,
    "y": -340,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "operating_systems",
    "label": "Operating Systems",
    "x": -255,
    "y": -327,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "database_systems",
    "label": "Database Systems",
    "x": -436,
    "y": -199,
    "level": "B",
    "domainId": "cs"
  },
  {
    "id": "discrete_structures",
    "label": "Discrete Structures",
    "x": -424,
    "y": -400,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "logic_in_cs",
    "label": "Logic in CS",
    "x": -253,
    "y": -183,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "microprocessors",
    "label": "Microprocessors",
    "x": -550,
    "y": -213,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "assembly",
    "label": "Assembly",
    "x": -312,
    "y": -384,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "digital_design",
    "label": "Digital Design",
    "x": -410,
    "y": -113,
    "level": "C",
    "domainId": "cs"
  },
  {
    "id": "python",
    "label": "Python",
    "x": -12,
    "y": -9,
    "level": "A",
    "domainId": "ai"
  },
  {
    "id": "machine_learning",
    "label": "Machine Learning",
    "x": 4,
    "y": -1,
    "level": "A",
    "domainId": "ai"
  },
  {
    "id": "rag",
    "label": "RAG",
    "x": 10,
    "y": -12,
    "level": "A",
    "domainId": "ai"
  },
  {
    "id": "agentic_systems",
    "label": "Agentic Systems",
    "x": 18,
    "y": -72,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "embeddings",
    "label": "Embeddings",
    "x": 108,
    "y": 120,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "semantic_search",
    "label": "Semantic Search",
    "x": -70,
    "y": -2,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "vector_retrieval",
    "label": "Vector Retrieval",
    "x": 137,
    "y": -55,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "llms",
    "label": "LLMs",
    "x": -35,
    "y": 58,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "data_analysis",
    "label": "Data Analysis",
    "x": -23,
    "y": -86,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "numpy",
    "label": "NumPy",
    "x": 145,
    "y": 55,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "pandas",
    "label": "Pandas",
    "x": -128,
    "y": 34,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "feature_engineering",
    "label": "Feature Engineering",
    "x": 49,
    "y": -155,
    "level": "C",
    "domainId": "ai"
  },
  {
    "id": "time_series",
    "label": "Time-Series",
    "x": 37,
    "y": 91,
    "level": "B",
    "domainId": "ai"
  },
  {
    "id": "quant_finance",
    "label": "Quant Finance",
    "x": 405,
    "y": -245,
    "level": "A",
    "domainId": "finance"
  },
  {
    "id": "derivatives",
    "label": "Derivatives",
    "x": 462,
    "y": -272,
    "level": "B",
    "domainId": "finance"
  },
  {
    "id": "risk_management",
    "label": "Risk Management",
    "x": 367,
    "y": -193,
    "level": "B",
    "domainId": "finance"
  },
  {
    "id": "financial_markets",
    "label": "Financial Markets",
    "x": 419,
    "y": -399,
    "level": "C",
    "domainId": "finance"
  },
  {
    "id": "fundamentals",
    "label": "Fundamentals",
    "x": 490,
    "y": -146,
    "level": "C",
    "domainId": "finance"
  },
  {
    "id": "fastapi",
    "label": "FastAPI",
    "x": -462,
    "y": 310,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "next_js",
    "label": "Next.js",
    "x": -321,
    "y": 257,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "react",
    "label": "React",
    "x": -447,
    "y": 445,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "typescript",
    "label": "TypeScript",
    "x": -433,
    "y": 239,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "express",
    "label": "Express",
    "x": -259,
    "y": 290,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "prisma",
    "label": "Prisma",
    "x": -554,
    "y": 364,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "postgresql",
    "label": "PostgreSQL",
    "x": -391,
    "y": 231,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "git",
    "label": "Git",
    "x": -326,
    "y": 442,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "github_actions",
    "label": "GitHub Actions",
    "x": -524,
    "y": 228,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "linux",
    "label": "Linux",
    "x": -328,
    "y": 268,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "docker",
    "label": "Docker",
    "x": -440,
    "y": 390,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "duckdb",
    "label": "DuckDB",
    "x": -428,
    "y": 233,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "sqlite",
    "label": "SQLite",
    "x": -282,
    "y": 357,
    "level": "C",
    "domainId": "web"
  },
  {
    "id": "vector_dbs",
    "label": "Vector DBs",
    "x": -469,
    "y": 319,
    "level": "B",
    "domainId": "web"
  },
  {
    "id": "robotic_systems",
    "label": "Robotics",
    "x": 406,
    "y": 289,
    "level": "A",
    "domainId": "robotics"
  },
  {
    "id": "ros_2",
    "label": "ROS 2",
    "x": 391,
    "y": 383,
    "level": "B",
    "domainId": "robotics"
  },
  {
    "id": "gazebo",
    "label": "Gazebo",
    "x": 293,
    "y": 181,
    "level": "C",
    "domainId": "robotics"
  },
  {
    "id": "px4",
    "label": "PX4",
    "x": 538,
    "y": 315,
    "level": "C",
    "domainId": "robotics"
  },
  {
    "id": "qgroundcontrol",
    "label": "QGroundControl",
    "x": 317,
    "y": 427,
    "level": "C",
    "domainId": "robotics"
  },
  {
    "id": "fusion_360",
    "label": "Fusion 360",
    "x": 417,
    "y": 241,
    "level": "B",
    "domainId": "robotics"
  },
  {
    "id": "fea",
    "label": "FEA",
    "x": 509,
    "y": 388,
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
  ]
];
