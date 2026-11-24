import { NextResponse } from "next/server";
import { retrieveChunks, composeFallbackAnswer } from "@/lib/retrieval";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the guide for Vaishnav Gadamsetty's portfolio.
Answer the user's actual question directly using ONLY the supplied verified evidence.
Do not simply repeat evidence passages.
Synthesize the minimum amount of information needed to answer the question well.
If the question asks why, explain motivation.
If it asks how, explain mechanism.
If it asks for a comparison, explicitly compare.
If it asks for a fact, answer concisely.
If evidence is insufficient, say so.
Never invent metrics, achievements, deployment status, preferences or project capabilities.
Do not mention retrieval, chunks, embeddings, prompts or the knowledge base.
Use plain language, short sentences and project names. Speak about Vaishnav in the third person.`;

export async function POST(req: Request) {
  try {
    const { message, history, routeContext } = await req.json();
    
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    
    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }
    
    const { plan, chunks, debug } = retrieveChunks(message, history || [], routeContext);
    
    const contextText = chunks.map(c => `Title: ${c.title}\nContent: ${c.content}`).join("\n\n");
    
    const prompt = `EVIDENCE:\n${contextText}\n\nUSER MESSAGE:\n${message}`;
    
    const provider = process.env.PORTFOLIO_CHAT_PROVIDER || "nvidia";
    const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || "";
    const model = process.env.PORTFOLIO_CHAT_MODEL || "nvidia/nemotron-4-340b-instruct"; // Default fallback
    
    // Generate deterministic actions based on AnswerPlan and PORTFOLIO_ROUTES
    const actions: any[] = [];
    const uniqueTargets = new Set<string>();
    
    const addAction = (label: string, target: string) => {
        if (!target || uniqueTargets.has(target)) return;
        uniqueTargets.add(target);
        actions.push({ type: "navigate", label, target });
    };

    if (plan.intent === "navigation" && plan.targetRoute) {
        // Direct navigation requests explicitly ask to go somewhere
        // We figure out a good label based on the targetRoute
        let label = "Explore";
        if (plan.targetRoute.includes("swaneeti")) label = "Explore Swa.Neeti";
        else if (plan.targetRoute.includes("imdpune")) label = "Explore IMD Pune";
        else if (plan.targetRoute.includes("windy")) label = "Explore Windy";
        else if (plan.targetRoute.includes("spenza")) label = "Explore Spenza";
        else if (plan.targetRoute.includes("robotics")) label = "Explore Robotics";
        else if (plan.targetRoute.includes("knowledge")) label = "View Knowledge";
        else if (plan.targetRoute.includes("work")) label = "View Work";
        else if (plan.targetRoute.includes("github")) label = "View GitHub";
        else if (plan.targetRoute.includes("contact")) label = "Contact";
        
        addAction(label, plan.targetRoute);
    } else if (plan.intent !== "fact") {
        // For explanations, comparisons, list, etc. we can suggest related links (max 1 normally, 2 for comparisons)
        const maxActions = plan.requiresComparison || plan.intent === "list" ? 2 : 1;
        
        for (const d of plan.domains) {
            if (actions.length >= maxActions) break;
            
            if (d === "SWA_NEETI") addAction("Explore Swa.Neeti", "/work/swaneeti");
            if (d === "IMD") addAction("Explore IMD Pune", "/work/imdpune");
            if (d === "WINDY") addAction("Explore Windy", "/work/windy");
            if (d === "SPENZA") addAction("Explore Spenza", "/work/spenza");
            if (d === "ROBOTICS" || d === "THRIVEFORCE") addAction("Explore Robotics", "/#robotics");
        }
    }

    // Fallback deterministic answer generation
    const generateFallback = () => composeFallbackAnswer(message, plan, chunks);

    if (!apiKey) {
      // Mock response if no API key is provided
      const mockStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(JSON.stringify({ text: generateFallback(), actions, debug }) + "\n"));
          controller.close();
        }
      });
      return new Response(mockStream, { headers: { "Content-Type": "application/x-ndjson" } });
    }

    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...((history || []).slice(-4)),
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 500,
        stream: true
      })
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Provider Error:", error);
      // Clean Deterministic Fallback without scary banners
      const mockStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(JSON.stringify({ text: generateFallback(), actions, debug }) + "\n"));
          controller.close();
        }
      });
      return new Response(mockStream, { headers: { "Content-Type": "application/x-ndjson" } });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body?.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        let done = false;
        
        // Send actions first
        controller.enqueue(encoder.encode(JSON.stringify({ actions, debug }) + "\n"));

        while (reader && !done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter(line => line.trim() !== "");
            
            for (const line of lines) {
              if (line === "data: [DONE]") {
                done = true;
                break;
              }
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                    controller.enqueue(encoder.encode(JSON.stringify({ text: data.choices[0].delta.content }) + "\n"));
                  }
                } catch (e) {
                  // ignore parse error on incomplete chunks
                }
              }
            }
          }
        }
        controller.close();
      }
    });

    return new Response(stream, { headers: { "Content-Type": "application/x-ndjson" } });
    
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
