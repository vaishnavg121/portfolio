import { NextResponse } from "next/server";
import { retrieveChunks } from "@/lib/retrieval";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are the conversational guide for Vaishnav Gadamsetty's portfolio.
Answer questions about Vaishnav only from the supplied portfolio evidence.
Never invent: achievements, metrics, technologies, employment, education, dates, rankings, project capabilities, personal information.
If the evidence does not support an answer, say that the portfolio does not contain enough information to answer confidently.
Do not pretend to know Vaishnav personally.
Differentiate approximate figures from exact verified figures.
Prefer concise, technically useful responses. Default answer length: 2-5 short paragraphs maximum.
When relevant, suggest the associated portfolio project or section.
Return your response.`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    
    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }
    
    const chunks = retrieveChunks(message, 4);
    
    const contextText = chunks.map(c => `Title: ${c.title}\nContent: ${c.content}`).join("\n\n");
    
    const prompt = `EVIDENCE:\n${contextText}\n\nUSER MESSAGE:\n${message}`;
    
    const provider = process.env.PORTFOLIO_CHAT_PROVIDER || "nvidia";
    const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY || "";
    const model = process.env.PORTFOLIO_CHAT_MODEL || "nvidia/nemotron-4-340b-instruct"; // Default fallback
    
    const actions = chunks
      .filter(c => c.route || c.section)
      .map(c => ({
        type: "navigate",
        label: c.route ? `Explore ${c.title.split(" -")[0]}` : `Jump to ${c.title}`,
        target: c.route || `#${c.section}`
      })).slice(0, 2);

    if (!apiKey) {
      // Mock response if no API key is provided
      const mockStream = new ReadableStream({
        async start(controller) {
          const text = "API key not configured. I am a grounded assistant but I need an LLM provider to process this request. Based on my retrieval, here is what I found:\n\n" + chunks.map(c => c.content).join(" ");
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(JSON.stringify({ text, actions }) + "\n"));
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
      return NextResponse.json({ error: "Provider error" }, { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body?.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        let done = false;
        
        // Send actions first
        controller.enqueue(encoder.encode(JSON.stringify({ actions }) + "\n"));

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
