"use client"

import { useState } from "react"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2, Download, Copy, Wand2, ImageIcon, FileCode } from "lucide-react"

export function AssetBuilderCanvas() {
  const { addSpec } = useWorkspaceStore()
  const [assetType, setAssetType] = useState<"svg" | "image">("svg")
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAsset, setGeneratedAsset] = useState<{
    type: "svg" | "image"
    content: string
    url?: string
  } | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    console.log("[v0] Generating asset:", { type: assetType, prompt })

    try {
      const response = await fetch("/api/generate-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: assetType, prompt }),
      })

      if (!response.ok) throw new Error("Failed to generate asset")

      const data = await response.json()
      setGeneratedAsset(data)
      console.log("[v0] Asset generated:", data)
    } catch (error) {
      console.error("[v0] Error generating asset:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToLibrary = () => {
    if (!generatedAsset) return

    const assetId = crypto.randomUUID()
    const assetName = prompt.slice(0, 50) || "Generated Asset"

    addSpec("assets", {
      id: assetId,
      name: assetName,
      type: generatedAsset.type === "svg" ? "image" : "image",
      link: generatedAsset.url || generatedAsset.content,
      metadata: {
        generatedAt: new Date().toISOString(),
        prompt: prompt,
        assetType: generatedAsset.type,
      },
    })

    console.log("[v0] Asset saved to library:", assetId)
  }

  const handleCopyCode = () => {
    if (!generatedAsset) return
    navigator.clipboard.writeText(generatedAsset.content)
  }

  const handleDownload = () => {
    if (!generatedAsset) return

    const blob = new Blob([generatedAsset.content], {
      type: generatedAsset.type === "svg" ? "image/svg+xml" : "text/plain",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `generated-asset.${generatedAsset.type === "svg" ? "svg" : "png"}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Side - Generator */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            <h2 className="font-semibold text-foreground">AI Asset Builder</h2>
            <Badge variant="secondary">Beta</Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Asset</CardTitle>
                <CardDescription>
                  Use AI to generate vectorized SVG graphics and images for your design system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Tabs value={assetType} onValueChange={(v) => setAssetType(v as "svg" | "image")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="svg" className="gap-2">
                        <FileCode className="w-4 h-4" />
                        SVG Vector
                      </TabsTrigger>
                      <TabsTrigger value="image" className="gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label>Describe Your Asset</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A minimalist logo with a mountain and sun, using geometric shapes..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Asset
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedAsset && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Asset</CardTitle>
                  <CardDescription>Preview and save your generated asset</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-8 bg-muted/20 min-h-[300px] flex items-center justify-center">
                    {generatedAsset.type === "svg" ? (
                      <div dangerouslySetInnerHTML={{ __html: generatedAsset.content }} />
                    ) : (
                      <img
                        src={generatedAsset.url || generatedAsset.content}
                        alt="Generated asset"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveToLibrary} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Save to Library
                    </Button>
                    <Button onClick={handleCopyCode} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Side - Examples & Tips */}
      <div className="w-96 bg-card flex flex-col">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-semibold text-foreground">Tips & Examples</h3>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">SVG Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>• Use simple, geometric shapes for clean vectors</p>
                <p>• Specify colors and style preferences</p>
                <p>• Mention if you want outlined or filled shapes</p>
                <p>• Include size or aspect ratio preferences</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Example Prompts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium">Logo Icon</p>
                  <p className="text-xs text-muted-foreground">
                    "A minimalist mountain logo with a rising sun, using clean geometric shapes in blue and orange"
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Pattern</p>
                  <p className="text-xs text-muted-foreground">
                    "An abstract geometric pattern with triangles and circles, suitable for a background"
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium">Icon Set</p>
                  <p className="text-xs text-muted-foreground">
                    "A simple outlined icon of a shopping cart, 24x24px, single color"
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
