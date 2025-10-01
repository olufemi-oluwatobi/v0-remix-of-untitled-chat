import { streamText } from "ai"
import { generatePageHash } from "@/lib/utils/spec-hash"

export const runtime = "nodejs"
export const maxDuration = 30

const SYSTEM_PROMPT = `You are an expert React and Next.js developer. Generate clean, modern, production-ready code based on user prompts.

Guidelines:
- Use TypeScript and modern React patterns (hooks, functional components)
- Use Tailwind CSS for styling
- Include proper TypeScript types
- Make components responsive and accessible
- Use shadcn/ui components when appropriate
- Generate complete, working code that can be rendered immediately
- Keep code clean and well-structured

Return ONLY the React component code, no explanations or markdown.`

export async function POST(req: Request) {
  try {
    const { prompt, previousCode, specMap, pageId } = await req.json()

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 })
    }

    if (specMap && pageId) {
      try {
        const hash = await generatePageHash(specMap, pageId)

        // Return hash in response header for client-side cache handling
        const headers = new Headers()
        headers.set("X-Spec-Hash", hash)

        // Client will check cache before streaming
        // If cache hit, client won't need to stream
      } catch (error) {
        console.log("[v0] Hash generation failed:", error)
      }
    }

    const userMessage = previousCode
      ? `Update this code based on the following request: ${prompt}\n\nCurrent code:\n${previousCode}`
      : `Create a React component: ${prompt}`

    // Try OpenAI first (via Vercel AI Gateway)
    try {
      const result = streamText({
        model: "openai/gpt-4o",
        system: SYSTEM_PROMPT,
        prompt: userMessage,
        temperature: 0.7,
        maxTokens: 4000,
      })

      return result.toDataStreamResponse()
    } catch (openaiError) {
      console.log("[v0] OpenAI failed, falling back to Gemini:", openaiError)

      // Fallback to Gemini
      const result = streamText({
        model: "google/gemini-2.0-flash-exp",
        system: SYSTEM_PROMPT,
        prompt: userMessage,
        temperature: 0.7,
        maxTokens: 4000,
      })

      return result.toDataStreamResponse()
    }
  } catch (error) {
    console.error("[v0] Code generation error:", error)
    return new Response("Failed to generate code", { status: 500 })
  }
}
