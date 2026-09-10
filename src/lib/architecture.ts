export type ArchitectureNodeType = "CLIENT" | "API" | "DATABASE" | "MODEL" | "SERVICE" | "WORKER" | "HARDWARE" | "SYSTEM";

export type ArchitectureNode = {
  id: string;
  label: string;
  type?: ArchitectureNodeType;
};

export type ArchitectureEdge = {
  from: string;
  to: string;
  label?: string;
};

export type ProjectArchitecture = {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
};
