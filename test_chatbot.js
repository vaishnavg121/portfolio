const http = require('http');

async function testQuery(query, history = []) {
  return new Promise((resolve) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`\nUSER: ${query}`);
          const lines = data.split("\n").filter(l => l.trim());
          let fullText = "";
          let actions = [];
          lines.forEach(l => {
              try {
                 const obj = JSON.parse(l);
                 if (obj.debug) console.log(`[DEBUG] Intent: ${obj.debug.plan.intent}, Domains: ${obj.debug.plan.domains.join(", ")}, Candidates: ${obj.debug.candidateCount}`);
                 if (obj.text) fullText += obj.text;
                 if (obj.actions) actions = obj.actions;
              } catch(e) {}
          });
          console.log(`BOT: ${fullText}`);
          if (actions.length > 0) console.log(`[ACTIONS] ${actions.map(a => a.label).join(' | ')}`);
          
          history.push({ role: 'user', content: query });
          history.push({ role: 'assistant', content: fullText });
          resolve();
        });
      });
      req.write(JSON.stringify({ message: query, history }));
      req.end();
  });
}

async function runAll() {
  console.log("=== CONVERSATION 1: IMD Multi-turn ===");
  let history1 = [];
  await testQuery("What did Vaishnav do at IMD?", history1);
  await testQuery("What models did he try?", history1);
  await testQuery("Show me the project.", history1);

  console.log("\n=== CONVERSATION 2: Swa.Neeti Multi-turn ===");
  let history2 = [];
  await testQuery("Tell me about Swa.Neeti.", history2);
  await testQuery("How does retrieval work?", history2);
  await testQuery("Open it.", history2);

  console.log("\n=== CONVERSATION 3: RAG Comparison ===");
  let history3 = [];
  await testQuery("Which projects use RAG?", history3);
  await testQuery("How are they different?", history3);

  console.log("\n=== CONVERSATION 4: Personal ===");
  let history4 = [];
  await testQuery("What does he do for fun?", history4);
  await testQuery("Favorite game?", history4);
  
  console.log("\n=== SINGLE QUERIES ===");
  await testQuery("Where does he study?");
  await testQuery("What's his CGPA?");
  await testQuery("Tell me about Velociraptor.");
  await testQuery("What is his API key?");
}

runAll();
