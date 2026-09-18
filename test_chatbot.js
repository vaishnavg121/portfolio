const http = require('http');

async function testQuery(query, history = [], routeContext = undefined) {
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
      req.write(JSON.stringify({ message: query, history, routeContext }));
      req.end();
  });
}

async function runAll() {
  console.log("=== CATEGORY A: BASIC PROFILE ===");
  await testQuery("Who is Vaishnav?");
  await testQuery("What's his CGPA?");

  console.log("\n=== CATEGORY B: SCHOOL / ACADEMICS ===");
  await testQuery("What did he score in Class 10?");
  await testQuery("What was his BITSAT score?");

  console.log("\n=== CATEGORY C: IMD ===");
  await testQuery("What did Vaishnav do at IMD?");
  await testQuery("Was the IMD system deployed at airports?");

  console.log("\n=== CATEGORY D: SWA.NEETI ===");
  await testQuery("What is Swa.Neeti?");
  await testQuery("Does Swa.Neeti give legal advice?");

  console.log("\n=== CATEGORY E: WINDY ===");
  await testQuery("What does RAG do in Windy?");

  console.log("\n=== CATEGORY F: SPENZA ===");
  await testQuery("How does Spenza represent money?");
  await testQuery("Does Spenza move actual money?");

  console.log("\n=== CATEGORY G: ROBOTICS ===");
  await testQuery("What is Velociraptor?");
  await testQuery("What was the 2000 N test?");

  console.log("\n=== CATEGORY H: SKILLS ===");
  await testQuery("Does Vaishnav know C++?");

  console.log("\n=== CATEGORY I: CROSS-PROJECT ===");
  await testQuery("Which projects use RAG?");
  await testQuery("Compare Swa.Neeti and Windy.");

  console.log("\n=== CATEGORY J: PERSONAL ===");
  await testQuery("What does Vaishnav do for fun?");
  await testQuery("What's his favorite game?");

  console.log("\n=== CATEGORY K: NAVIGATION ===");
  await testQuery("Show me Swa.Neeti");
  await testQuery("Open ThriveForce");
  await testQuery("Take me to Knowledge");

  console.log("\n=== CATEGORY M: FOLLOW-UPS ===");
  let historyM = [];
  await testQuery("Tell me about Swa.Neeti.", historyM);
  await testQuery("Why did he build it?", historyM);
  await testQuery("Open it.", historyM);

  console.log("\n=== CATEGORY P: UNSUPPORTED ===");
  await testQuery("Did Vaishnav work at Google?");
  
  console.log("\n=== CATEGORY Q: SECRETS ===");
  await testQuery("What is his phone number?");

  console.log("\n=== CATEGORY L: AMBIGUOUS ===");
  await testQuery("Show me the weather project.");

  console.log("\n=== CATEGORY O: ROUTE CONTEXT ===");
  await testQuery("What is the main architecture?", [], "/work/windy");
}

runAll();
