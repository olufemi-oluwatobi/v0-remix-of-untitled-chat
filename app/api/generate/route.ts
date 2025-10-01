import { type NextRequest, NextResponse } from "next/server"
import { codeGenerator } from "@/lib/code-generation/generator"

export async function POST(request: NextRequest) {
  try {
    const { specMap, previousSpecMap, existingCode, model } = await request.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      codeGenerator.configure(apiKey, model || "gpt-4o")
    }

    // Convert existingCode array to Map if provided
    const existingCodeMap = existingCode
      ? new Map(existingCode.map((item: any) => [item.specId, item.code]))
      : undefined

    // Generate code
    const generatedCode = await codeGenerator.generate(specMap, previousSpecMap, existingCodeMap)

    // Convert Map to array for JSON response
    const codeArray = Array.from(generatedCode.entries()).map(([specId, code]) => ({
      specId,
      code,
    }))

    const codeManager = codeGenerator.getCodeManager()

    return NextResponse.json({
      success: true,
      code: codeArray,
      workflow: codeGenerator.getWorkflow(),
      progress: codeGenerator.getProgress(),
      operations: codeManager.getOperations(),
      sandboxFiles: codeGenerator.exportForSandbox(),
      fileTree: codeManager.getFileTree(),
    })
  } catch (error) {
    console.error("[v0] Generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    workflow: codeGenerator.getWorkflow(),
    progress: codeGenerator.getProgress(),
  })
}
