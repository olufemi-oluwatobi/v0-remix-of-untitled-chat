"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, X } from "lucide-react"
import { useState } from "react"
import { useWorkspaceStore, type Context, type Asset } from "@/lib/store/use-workspace-store"

interface AssetAnalysisProps {
  item: Context | Asset
  type: "contexts" | "assets"
}

export function AssetAnalysis({ item, type }: AssetAnalysisProps) {
  const { updateSpec } = useWorkspaceStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Check if item has analysis
  const analysis = "analysis" in item ? item.analysis : undefined

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockAnalysis = {
      summary: "This image shows a modern interface design with clean typography and balanced composition.",
      points: [
        {
          text: "Primary navigation bar with clear hierarchy",
          color: "#3b82f6",
          position: { x: 50, y: 10 },
        },
        {
          text: "Hero section with compelling call-to-action",
          color: "#10b981",
          position: { x: 50, y: 30 },
        },
        {
          text: "Feature cards with consistent spacing",
          color: "#f59e0b",
          position: { x: 50, y: 60 },
        },
        {
          text: "Footer with organized link structure",
          color: "#8b5cf6",
          position: { x: 50, y: 90 },
        },
      ],
    }

    updateSpec(type, item.id, { analysis: mockAnalysis } as any)
    setIsAnalyzing(false)
  }

  const handleRemoveAnalysis = () => {
    updateSpec(type, item.id, { analysis: undefined } as any)
  }

  if (!analysis) {
    return (
      <Card className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">AI Analysis</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="gap-1.5 bg-transparent"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Get AI-powered insights about this {type === "contexts" ? "context" : "asset"}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">AI Analysis</h3>
        <Button variant="ghost" size="sm" onClick={handleRemoveAnalysis} className="h-7 w-7 p-0">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Summary</p>
          <p className="text-sm">{analysis.summary}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Key Points</p>
          <div className="space-y-2">
            {analysis.points.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                {point.color && (
                  <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: point.color }} />
                )}
                <p className="text-sm flex-1">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
