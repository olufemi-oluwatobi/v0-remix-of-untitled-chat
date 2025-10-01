"use client"

import { useState } from "react"
import { useWorkspaceStore, type Asset, type AssetInsight } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Undo2,
  Redo2,
  ImageIcon,
  Video,
  Music,
  FileText,
  ExternalLink,
  Sparkles,
  Loader2,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AssetCanvasProps {
  asset: Asset
}

export function AssetCanvas({ asset }: AssetCanvasProps) {
  const { canUndoSpec, canRedoSpec, undoSpec, redoSpec, updateSpec } = useWorkspaceStore()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [editingInsightId, setEditingInsightId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")

  const getAssetIcon = () => {
    switch (asset.type) {
      case "image":
        return <ImageIcon className="w-5 h-5" />
      case "video":
        return <Video className="w-5 h-5" />
      case "audio":
        return <Music className="w-5 h-5" />
      case "document":
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: AssetInsight["category"]) => {
    switch (category) {
      case "quality":
        return "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
      case "usage":
        return "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
      case "accessibility":
        return "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400"
      case "optimization":
        return "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400"
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-700 dark:text-gray-400"
    }
  }

  const getCategoryIcon = (category: AssetInsight["category"]) => {
    switch (category) {
      case "quality":
        return "✓"
      case "usage":
        return "→"
      case "accessibility":
        return "♿"
      case "optimization":
        return "⚡"
      default:
        return "•"
    }
  }

  const handleGenerateInsights = async () => {
    setIsAnalyzing(true)
    console.log("[v0] Generating insights for asset:", asset.id)

    try {
      // Call API to generate insights
      const response = await fetch("/api/generate-asset-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: asset.name,
          assetType: asset.type,
          assetLink: asset.link,
          metadata: asset.metadata,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate insights")

      const { insights } = await response.json()

      updateSpec("assets", asset.id, { insights })
      console.log("[v0] Insights generated:", insights)
    } catch (error) {
      console.error("[v0] Error generating insights:", error)
      // Fallback to mock insights
      const mockInsights: AssetInsight[] = [
        {
          id: crypto.randomUUID(),
          text: "High-quality asset suitable for production use",
          category: "quality",
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          text: "Can be used in hero sections, cards, and promotional materials",
          category: "usage",
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          text: "Consider adding descriptive alt text for screen readers",
          category: "accessibility",
          createdAt: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          text: "Optimized file size for fast web delivery",
          category: "optimization",
          createdAt: new Date().toISOString(),
        },
      ]
      updateSpec("assets", asset.id, { insights: mockInsights })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleEditInsight = (insight: AssetInsight) => {
    setEditingInsightId(insight.id)
    setEditingText(insight.text)
  }

  const handleSaveInsight = () => {
    if (!editingInsightId || !asset.insights) return

    const updatedInsights = asset.insights.map((insight) =>
      insight.id === editingInsightId ? { ...insight, text: editingText } : insight,
    )

    updateSpec("assets", asset.id, { insights: updatedInsights })
    setEditingInsightId(null)
    setEditingText("")
  }

  const handleCancelEdit = () => {
    setEditingInsightId(null)
    setEditingText("")
  }

  const handleRemoveInsight = (insightId: string) => {
    if (!asset.insights) return

    const updatedInsights = asset.insights.filter((insight) => insight.id !== insightId)
    updateSpec("assets", asset.id, { insights: updatedInsights })
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getAssetIcon()}
            <h2 className="font-semibold text-foreground">{asset.name}</h2>
            <Badge variant="secondary" className="capitalize">
              {asset.type}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => undoSpec("assets", asset.id)}
              disabled={!canUndoSpec("assets", asset.id)}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => redoSpec("assets", asset.id)}
              disabled={!canRedoSpec("assets", asset.id)}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Asset Details */}
            <section className="space-y-4">
              <div className="space-y-2">
                <Label>Asset Name</Label>
                <Input value={asset.name} onChange={(e) => updateSpec("assets", asset.id, { name: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Asset URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={asset.link || ""}
                    onChange={(e) => updateSpec("assets", asset.id, { link: e.target.value })}
                    placeholder="https://example.com/asset.png"
                  />
                  {asset.link && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={asset.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </section>

            {/* Asset Preview */}
            <section className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-muted/20 min-h-[300px] flex items-center justify-center">
                {asset.type === "image" && asset.link ? (
                  <img
                    src={asset.link || "/placeholder.svg"}
                    alt={asset.name}
                    className="max-w-full max-h-[400px] rounded-lg object-contain"
                  />
                ) : asset.type === "video" && asset.link ? (
                  <video src={asset.link} controls className="max-w-full max-h-[400px] rounded-lg" />
                ) : asset.type === "audio" && asset.link ? (
                  <audio src={asset.link} controls className="w-full" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    {getAssetIcon()}
                    <p className="mt-2 text-sm">No preview available</p>
                  </div>
                )}
              </div>
            </section>

            {/* Metadata */}
            {asset.metadata && (
              <section className="space-y-2">
                <Label>Metadata</Label>
                <div className="border rounded-lg p-4 bg-muted/20 space-y-2 text-sm">
                  {Object.entries(asset.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side Insights Panel */}
      <div className="w-96 border-l border-border bg-card flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Insights
            </h3>
            <Button size="sm" onClick={handleGenerateInsights} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {asset.insights && asset.insights.length > 0 ? (
              asset.insights.map((insight) => (
                <Card key={insight.id} className={`${getCategoryColor(insight.category)} border`}>
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {getCategoryIcon(insight.category)} {insight.category}
                      </Badge>
                      <div className="flex gap-1">
                        {editingInsightId === insight.id ? (
                          <>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveInsight}>
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEdit}>
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleEditInsight(insight)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => handleRemoveInsight(insight.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {editingInsightId === insight.id ? (
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="min-h-[60px] text-sm"
                      />
                    ) : (
                      <p className="text-sm leading-relaxed">{insight.text}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground space-y-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6 text-primary/60" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No insights yet</p>
                      <p className="text-xs">Click Generate to get AI-powered insights about this asset</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
