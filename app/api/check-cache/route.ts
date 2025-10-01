import { NextResponse } from "next/server"
import { generatePageHash } from "@/lib/utils/spec-hash"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { specMap, pageId } = await req.json()

    if (!specMap || !pageId) {
      return NextResponse.json({ error: "specMap and pageId are required" }, { status: 400 })
    }

    const hash = await generatePageHash(specMap, pageId)

    return NextResponse.json({ hash })
  } catch (error) {
    console.error("[v0] Cache check error:", error)
    return NextResponse.json({ error: "Failed to generate hash" }, { status: 500 })
  }
}
