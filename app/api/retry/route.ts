import type { NextRequest } from "next/server"
import { Together } from "together-ai"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    const systemPrompt = `Retry generating this code it has errors:`
    const userPrompt = prompt

    if (!process.env.TOGETHER_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const together = new Together({
      apiKey: process.env.TOGETHER_API_KEY,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode("Starting retry process...\n"))

          const stream = await together.chat.completions.create({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userPrompt,
              },
            ],
            model: "deepseek-ai/DeepSeek-V3",
            stream: true,
            max_tokens: 12000,
            temperature: 0.9,
          })

          for await (const chunk of stream) {
            const content = chunk.choices?.[0]?.delta?.content || ""
            if (content) controller.enqueue(encoder.encode(content))
          }
        } catch (err) {
          controller.enqueue(encoder.encode("[Error retrying game]\n"))
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Error retrying game",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
} 