import { knowledgeBase, KnowledgeChunk } from "../data/chat";

export function retrieveChunks(query: string, topK: number = 4): KnowledgeChunk[] {
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
  
  if (queryWords.length === 0) return [];
  
  const scoredChunks = knowledgeBase.map(chunk => {
    let score = 0;
    
    // Exact phrase match in content
    if (chunk.content.toLowerCase().includes(normalizedQuery)) {
      score += 15;
    }
    
    // Exact phrase match in title
    if (chunk.title.toLowerCase().includes(normalizedQuery)) {
      score += 20;
    }
    
    // Keyword matching
    chunk.keywords.forEach(kw => {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += 10;
      }
      queryWords.forEach(qw => {
        if (kw.toLowerCase().includes(qw) || qw.includes(kw.toLowerCase())) {
          score += 3;
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
  return scoredChunks.filter(s => s.score > 2).slice(0, topK).map(s => s.chunk);
}
