import { knowledgeBase, KnowledgeChunk, ChatDomain } from "../data/chat";

export const PORTFOLIO_ROUTES = {
  home: "/",
  imd: "/work/imdpune",
  swaNeeti: "/work/swaneeti",
  windy: "/work/windy",
  spenza: "/work/spenza",
  robotics: "/#robotics",
  knowledge: "/#knowledge",
  work: "/#work",
  contact: "/#contact",
  github: "/#github"
} as const;

export type IntentType = "fact" | "explanation" | "comparison" | "list" | "summary" | "navigation" | "why" | "how" | "follow_up" | "unknown";

export type AnswerPlan = {
  intent: IntentType;
  entities: string[];
  domains: ChatDomain[];
  requestedAspect?: string;
  detailLevel: "short" | "normal" | "detailed";
  requiresComparison?: boolean;
  targetRoute?: string;
  needsClarification?: boolean;
};

function resolveEntitiesAndDomains(query: string, history: any[], routeContext?: string): { domains: ChatDomain[], entities: string[] } {
  const q = query.toLowerCase();
  const domains: Set<ChatDomain> = new Set();
  const entities: string[] = [];

  const add = (d: ChatDomain, e: string) => {
    domains.add(d);
    entities.push(e);
  };

  if (/\bimd\b/.test(q) || q.includes("meteorological") || q.includes("vertical visibility") || q.includes("airport") || q.includes("aviation") || q.includes("weather")) add("IMD", "IMD");
  if (q.includes("swa.neeti") || q.includes("swaneeti") || q.includes("swa neeti") || q.includes("legal") || q.includes("indian law") || q.includes("rrf") || /\brag\b/.test(q)) add("SWA_NEETI", "Swa.Neeti");
  if (q.includes("windy") || q.includes("weather agent") || q.includes("duckdb") || q.includes("nemotron") || q.includes("weather analytics") || /\brag\b/.test(q) || q.includes("weather")) add("WINDY", "Windy");
  if (q.includes("spenza") || q.includes("expense") || /\bsplit\b/.test(q) || q.includes("settlement") || q.includes("ledger") || q.includes("idempotency") || q.includes("money") || q.includes("finance project")) add("SPENZA", "Spenza");
  if (q.includes("robotics") || q.includes("velociraptor") || q.includes("thriveforce") || q.includes("combat robot") || /\bfea\b/.test(q) || q.includes("hardware") || q.includes("3lb") || q.includes("undercutter") || q.includes("c++") || q.includes("2000")) {
    add("ROBOTICS", "Robotics");
    if (q.includes("velociraptor") || q.includes("thriveforce") || q.includes("combat") || q.includes("3lb") || q.includes("undercutter") || q.includes("2000")) {
      add("THRIVEFORCE", "ThriveForce");
    }
  }
  
  if (q.includes("bits") || q.includes("college") || q.includes("cgpa") || q.includes("education") || q.includes("study") || q.includes("school") || q.includes("university")) add("EDUCATION", "Education");
  if (q.includes("game") || q.includes("gaming") || q.includes("sekiro") || q.includes("tsushima") || q.includes("wukong") || q.includes("spider-man") || q.includes("play") || q.includes("fun")) add("GAMING", "Gaming");
  if (q.includes("anime") || q.includes("movie") || q.includes("death note") || q.includes("your name") || q.includes("pancreas") || q.includes("watch")) add("MOVIES_ANIME", "Movies/Anime");
  if (q.includes("finance") || q.includes("derivatives") || q.includes("risk") || q.includes("economics")) add("FINANCE", "Finance");
  if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("c++") || q.includes("python") || q.includes("know") || q.includes("knowledge")) add("SKILLS", "Skills");
  if (q.includes("api key") || q.includes("phone number") || q.includes("password") || q.includes("secret") || q.includes("credentials") || q.includes("email") || q.includes("environment")) add("SYSTEM", "System");
  
  if (q.includes("tell me about him") || q.includes("who is") || q.includes("about vaishnav") || q.includes("biography") || q.includes("profile") || (q.includes("tell me about") && domains.size === 0)) add("PROFILE", "Profile");
  
  // Resolution of pronouns / context
  if (domains.size === 0) {
     // Inherit domain context from history by scanning backwards for explicit entities
     if (history && history.length > 0) {
         for (let i = history.length - 1; i >= 0; i--) {
             if (history[i].role === 'user') {
                 const prevMsg = history[i].content.toLowerCase();
                 // Call with empty history to avoid infinite recursion, looking only for EXPLICIT mentions
                 const hDomains = resolveEntitiesAndDomains(prevMsg, []).domains;
                 if (hDomains.length > 0 && !hDomains.includes("UNKNOWN") && !hDomains.includes("PROFILE")) {
                     hDomains.forEach(d => domains.add(d));
                     break;
                 }
             }
         }
     }
     
     // Route context fallback
     if (domains.size === 0) {
         if (routeContext?.includes("swa-neeti") || routeContext?.includes("swaneeti")) add("SWA_NEETI", "Swa.Neeti");
         if (routeContext?.includes("imd-pune") || routeContext?.includes("imdpune")) add("IMD", "IMD");
         if (routeContext?.includes("windy")) add("WINDY", "Windy");
         if (routeContext?.includes("spenza")) add("SPENZA", "Spenza");
     }
  }
  
  if (domains.size === 0) domains.add("UNKNOWN");
  
  return { domains: Array.from(domains), entities };
}

function detectIntent(query: string, domains: ChatDomain[]): AnswerPlan {
  const q = query.toLowerCase();
  
  let intent: IntentType = "fact";
  let detailLevel: "short" | "normal" | "detailed" = "normal";
  let requiresComparison = false;
  let targetRoute: string | undefined;
  
  if (q.includes("vs") || q.includes("difference") || q.includes("compare") || q.includes("how are these different")) {
      intent = "comparison";
      requiresComparison = true;
  } else if (q.includes("show me") || q.includes("take me") || q.includes("open") || q.includes("where can i see") || q.includes("explore") || q.includes("go to") || q.includes("view")) {
      intent = "navigation";
      detailLevel = "short";
      
      // Determine explicit route mapping
      if (domains.includes("SWA_NEETI")) targetRoute = PORTFOLIO_ROUTES.swaNeeti;
      else if (domains.includes("IMD")) targetRoute = PORTFOLIO_ROUTES.imd;
      else if (domains.includes("WINDY")) targetRoute = PORTFOLIO_ROUTES.windy;
      else if (domains.includes("SPENZA")) targetRoute = PORTFOLIO_ROUTES.spenza;
      else if (domains.includes("ROBOTICS") || domains.includes("THRIVEFORCE")) targetRoute = PORTFOLIO_ROUTES.robotics;
      else if (q.includes("knowledge") || q.includes("skills")) targetRoute = PORTFOLIO_ROUTES.knowledge;
      else if (q.includes("work") || q.includes("project")) targetRoute = PORTFOLIO_ROUTES.work;
      else if (q.includes("contact")) targetRoute = PORTFOLIO_ROUTES.contact;
      else if (q.includes("github")) targetRoute = PORTFOLIO_ROUTES.github;
      else if (q.includes("home")) targetRoute = PORTFOLIO_ROUTES.home;
      
  } else if (/\bwhy\b/.test(q)) {
      intent = "why";
  } else if (/\bhow\b/.test(q)) {
      intent = "how";
  } else if (/\bwhich\b/.test(q) || /\blist\b/.test(q)) {
      intent = "list";
  } else if (q.includes("tell me about") || q.includes("explain")) {
      intent = "summary";
      detailLevel = "normal";
  } else if (q.match(/what is .* cgpa/) || q.match(/favorite/) || q.includes("where does") || q.includes("what does") || /\bwhat\b/.test(q) || /\bwhen\b/.test(q)) {
      intent = "fact";
      detailLevel = "short";
  }
  
  return {
      intent,
      entities: [], // Filled above
      domains,
      detailLevel,
      requiresComparison,
      targetRoute
  };
}

export function buildAnswerPlan(query: string, history: any[], routeContext?: string): AnswerPlan {
    const { domains, entities } = resolveEntitiesAndDomains(query, history, routeContext);
    const plan = detectIntent(query, domains);
    plan.entities = entities;
    return plan;
}

export function composeFallbackAnswer(query: string, plan: AnswerPlan, chunks: KnowledgeChunk[]): string {
    if (chunks.length === 0) {
        return "I couldn't find enough information about that in Vaishnav's portfolio.";
    }
    
    // Strict safety for unknown entities in fallback mode
    const q = query.toLowerCase();
    if (plan.domains.includes("UNKNOWN") && (q.includes("google") || q.includes("microsoft") || q.includes("meta") || q.includes("apple") || q.includes("amazon") || q.includes("netflix") || q.includes("salary") || q.includes("championship"))) {
         return "I couldn't find enough information about that in Vaishnav's portfolio.";
    }
    
    if (plan.domains.includes("SYSTEM")) {
        return chunks[0].content;
    }
    
    if (plan.intent === "comparison") {
        return chunks.map(c => `- **${c.title}**: ${c.content}`).join("\n\n");
    }
    
    if (plan.intent === "navigation") {
        if (chunks.length > 0 && plan.entities.length > 0) {
            return `Sure, here is the link to explore ${plan.entities[0]}.`;
        }
        return chunks[0].content;
    }
    
    // For general fact, why, how, summary
    // Avoid concatenating everything blindly, just use 1-2 chunks
    const usedChunks = plan.detailLevel === "short" ? chunks.slice(0, 1) : chunks.slice(0, 3);
    
    return usedChunks.map(c => c.content).join(" ");
}

export function retrieveChunks(query: string, history: any[], routeContext?: string): { plan: AnswerPlan, chunks: KnowledgeChunk[], debug: any } {
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  
  const plan = buildAnswerPlan(query, history, routeContext);
  
  if (queryWords.length === 0) return { plan, chunks: [], debug: {} };
  
  // Filter candidate pool
  let candidates = knowledgeBase;
  if (plan.domains.includes("SYSTEM")) {
      candidates = knowledgeBase.filter(c => c.domain === "SYSTEM");
  } else if (!plan.domains.includes("UNKNOWN") && !plan.domains.includes("PROFILE")) {
      // Narrow queries
      candidates = knowledgeBase.filter(c => 
          plan.domains.includes(c.domain) || 
          (plan.domains.includes("ROBOTICS") && (c.domain === "THRIVEFORCE" || c.domain === "VELOCIRAPTOR")) ||
          (plan.domains.includes("EDUCATION") && c.domain === "PROFILE") ||
          (plan.domains.includes("GAMING") && c.domain === "PROFILE") ||
          (plan.domains.includes("MOVIES_ANIME") && c.domain === "PROFILE")
      );
  }
  
  if (candidates.length === 0) {
      candidates = knowledgeBase;
  }
  
  const scoredChunks = candidates.map(chunk => {
    let score = 0;
    
    // Domain match bonus
    if (plan.domains.includes(chunk.domain)) score += 30;
    
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
  const topK = (plan.domains.includes("PROFILE") || plan.domains.includes("UNKNOWN")) ? 4 : (plan.requiresComparison ? 4 : (plan.intent === "list" ? 4 : 2));
  
  const threshold = 10; 
  const results = scoredChunks.filter(s => s.score >= threshold).slice(0, topK);
  
  const debug = {
      plan,
      candidateCount: candidates.length,
      selected: results.map(r => ({ id: r.chunk.id, score: r.score }))
  };
  
  return { plan, chunks: results.map(s => s.chunk), debug };
}
