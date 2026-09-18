const http = require('http');

async function testQuery(query) {
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
          console.log(`\nQUERY: ${query}`);
          // parse ndjson
          const lines = data.split("\n").filter(l => l.trim());
          let fullText = "";
          lines.forEach(l => {
              try {
                 const obj = JSON.parse(l);
                 if (obj.debug) console.log(`[DEBUG] Domain: ${obj.debug.domain}, Candidates: ${obj.debug.candidateCount}, Selected:`, obj.debug.selected);
                 if (obj.text) fullText += obj.text;
                 if (obj.actions) console.log(`[ACTIONS]`, obj.actions);
              } catch(e) {}
          });
          console.log(fullText);
          console.log('-----------------------');
          resolve();
        });
      });
      req.write(JSON.stringify({ message: query }));
      req.end();
  });
}

async function runAll() {
  const queries = [
    "What did Vaishnav do at IMD?",
    "What is Swa.Neeti?",
    "Explain Windy.",
    "What is Spenza?",
    "Where does Vaishnav study?",
    "What games does he like?",
    "Tell me about his robotics work.",
    "Tell me about Vaishnav.",
    "What's his CGPA?",
    "What is his favorite game?",
    "What is his API key?"
  ];
  
  for (const q of queries) {
      await testQuery(q);
  }
}

runAll();
