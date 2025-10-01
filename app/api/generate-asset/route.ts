import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { type, prompt } = await request.json()

    console.log("[v0] Generating asset:", { type, prompt })

    if (type === "svg") {
      // Generate SVG using AI
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Generate a clean, production-ready SVG based on this description: "${prompt}"

Requirements:
- Return ONLY the SVG code, no explanations
- Use semantic, clean SVG markup
- Include viewBox attribute
- Use appropriate colors and styling
- Make it scalable and responsive
- Keep it simple and optimized

Return the complete SVG code:`,
      })

      // Extract SVG from response
      const svgMatch = text.match(/<svg[\s\S]*<\/svg>/i)
      const svgContent = svgMatch ? svgMatch[0] : text

      return NextResponse.json({
        type: "svg",
        content: svgContent,
      })
    } else {
      // For images, we would use an image generation API
      // For now, return a placeholder
      return NextResponse.json({
        type: "image",
        content: "/placeholder.svg?height=400&width=400",
        url: "/placeholder.svg?height=400&width=400",
      })
    }
  } catch (error) {
    console.error("[v0] Error generating asset:", error)
    return NextResponse.json({ error: "Failed to generate asset" }, { status: 500 })
  }
}
