import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { assetName, assetType, assetLink, metadata } = await request.json()

    console.log("[v0] Generating insights for asset:", assetName)

    // Generate insights using AI
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Analyze this ${assetType} asset and provide 4-6 specific, actionable insights.

Asset Details:
- Name: ${assetName}
- Type: ${assetType}
- Link: ${assetLink || "Not provided"}
- Metadata: ${JSON.stringify(metadata || {})}

Provide insights in the following categories:
1. Quality - Assessment of the asset's quality and production readiness
2. Usage - Specific use cases and where this asset works best
3. Accessibility - Accessibility considerations and recommendations
4. Optimization - Performance and optimization suggestions

Return ONLY a JSON array of insights in this exact format:
[
  {
    "text": "Specific insight text here",
    "category": "quality" | "usage" | "accessibility" | "optimization"
  }
]

Make each insight specific, actionable, and relevant to this particular asset.`,
    })

    // Parse the AI response
    const insightsData = JSON.parse(text)

    // Add IDs and timestamps
    const insights = insightsData.map((insight: any) => ({
      id: crypto.randomUUID(),
      text: insight.text,
      category: insight.category,
      createdAt: new Date().toISOString(),
    }))

    console.log("[v0] Generated insights:", insights)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[v0] Error generating insights:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
