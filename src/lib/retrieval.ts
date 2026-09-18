import { knowledgeBase, KnowledgeChunk, ChatDomain } from "../data/chat";

export function detectDomain(query: string, routeContext?: string): ChatDomain {
  const q = query.toLowerCase();
  
  if (q.includes("imd") || q.includes("meteorological") || q.includes("vertical visibility") || q.includes("airport weather") || q.includes("aviation")) return "IMD";
  if (q.includes("swa.neeti") || q.includes("swaneeti") || q.includes("legal") || q.includes("indian law") || q.includes("rrf")) return "SWA_NEETI";
  if (q.includes("windy") || q.includes("duckdb") || q.includes("nemotron")) return "WINDY";
  if (q.includes("spenza") || q.includes("expense") || q.includes("split") || q.includes("settlement") || q.includes("ledger") || q.includes("idempotency")) return "SPENZA";
  if (q.includes("robotics") || q.includes("velociraptor") || q.includes("thriveforce") || q.includes("combat robot") || q.includes("fea") || q.includes("hardware")) return "ROBOTICS";
  if (q.includes("bits") || q.includes("college") || q.includes("cgpa") || q.includes("education") || q.includes("study") || q.includes("school") || q.includes("university")) return "EDUCATION";
  if (q.includes("game") || q.includes("gaming") || q.includes("sekiro") || q.includes("tsushima") || q.includes("wukong") || q.includes("spider-man") || q.includes("play")) return "GAMING";
  if (q.includes("anime") || q.includes("movie") || q.includes("death note") || q.includes("your name") || q.includes("pancreas")) return "MOVIES_ANIME";
  if (q.includes("finance") || q.includes("derivatives") || q.includes("risk") || q.includes("economics")) return "FINANCE";
  if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("c++") || q.includes("python")) return "SKILLS";
  if (q.includes("api key") || q.includes("phone number") || q.includes("password") || q.includes("secret") || q.includes("credentials")) return "SYSTEM";
  if (q.includes("tell me about him") || q.includes("who is") || q.includes("about vaishnav") || q.includes("tell me about vaishnav") || q.includes("biography") || q.includes("profile")) return "PROFILE";
  if (q.includes("project")) {
     if (routeContext?.includes("swa-neeti")) return "SWA_NEETI";
     if (routeContext?.includes("imd-pune")) return "IMD";
     if (routeContext?.includes("windy")) return "WINDY";
     if (routeContext?.includes("spenza")) return "SPENZA";
  }
  
  return "UNKNOWN";
}

export function retrieveChunks(query: string, routeContext?: string): { domain: ChatDomain, chunks: KnowledgeChunk[], debug: any } {
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  
  const domain = detectDomain(query, routeContext);
  
  if (queryWords.length === 0) return { domain, chunks: [], debug: {} };
  
  // Filter candidate pool
  let candidates = knowledgeBase;
  if (domain !== "UNKNOWN" && domain !== "PROFILE" && domain !== "SYSTEM") {
      // For narrow queries, strict filtering
      candidates = knowledgeBase.filter(c => 
          c.domain === domain || 
          (domain === "ROBOTICS" && (c.domain === "THRIVEFORCE" || c.domain === "VELOCIRAPTOR")) ||
          (domain === "EDUCATION" && c.domain === "PROFILE")
      );
  } else if (domain === "SYSTEM") {
      candidates = knowledgeBase.filter(c => c.domain === "SYSTEM");
  }
  
  if (candidates.length === 0) {
      candidates = knowledgeBase;
  }
  
  const scoredChunks = candidates.map(chunk => {
    let score = 0;
    
    // Domain match bonus
    if (chunk.domain === domain) score += 30;
    
    // Exact phrase match in content
    if (chunk.content.toLowerCase().includes(normalizedQuery)) {
      score += 25;
    }
    
    // Exact phrase match in title
    if (chunk.title.toLowerCase().includes(normalizedQuery)) {
      score += 20;
    }
    
    // Keyword matching
    chunk.keywords.forEach(kw => {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += 15;
      }
      queryWords.forEach(qw => {
        if (kw.toLowerCase().includes(qw) || qw.includes(kw.toLowerCase())) {
          score += 4;
        }
      });
    });
    
    // Word overlap in content
    const chunkContentWords = chunk.content.toLowerCase().split(/\s+/);
    queryWords.forEach(qw => {
      if (chunkContentWords.some(cw => cw.includes(qw))) {
        score += 2;
      }
    });
    
    return { chunk, score: score + (chunk.priority || 0) * 0.1 };
  });
  
  scoredChunks.sort((a, b) => b.score - a.score);
  
  // Dynamic topK based on intent
  const topK = (domain === "PROFILE" || domain === "UNKNOWN") ? 4 : 2;
  
  const threshold = 10; 
  const results = scoredChunks.filter(s => s.score >= threshold).slice(0, topK);
  
  const debug = {
      domain,
      candidateCount: candidates.length,
      selected: results.map(r => ({ id: r.chunk.id, score: r.score }))
  };
  
  return { domain, chunks: results.map(s => s.chunk), debug };
}
