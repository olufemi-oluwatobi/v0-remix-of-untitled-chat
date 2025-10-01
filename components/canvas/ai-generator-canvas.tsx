"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Code, Eye, Loader2, Copy, Check, History, Zap } from "lucide-react"
import { SandboxPreview } from "@/components/preview/sandbox-preview"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { useCodeCacheStore } from "@/lib/store/use-code-cache-store"
import { CodeHistoryDialog } from "@/components/dialogs/code-history-dialog"

interface AIGeneratorCanvasProps {
  generationId: string
}

export function AIGeneratorCanvas({ generationId }: AIGeneratorCanvasProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [cacheStatus, setCacheStatus] = useState<"checking" | "hit" | "miss" | null>(null)
  const [currentHash, setCurrentHash] = useState<string | null>(null)

  const { updateSpec, specMap, getSpec } = useWorkspaceStore()
  const { getCachedCode, setCachedCode, getPageHistory } = useCodeCacheStore()

  useEffect(() => {
    const page = getSpec("pages", generationId)
    if (page?.code) {
      setGeneratedCode(page.code)
    }
    if (page?.mainPrompt) {
      setPrompt(page.mainPrompt)
    }
  }, [generationId, getSpec])

  const checkCache = async () => {
    setCacheStatus("checking")
    try {
      const response = await fetch("/api/check-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specMap,
          pageId: generationId,
        }),
      })

      if (!response.ok) {
        setCacheStatus("miss")
        return null
      }

      const { hash } = await response.json()
      setCurrentHash(hash)

      const cached = getCachedCode(hash)
      if (cached) {
        console.log("[v0] Cache hit! Using cached code")
        setCacheStatus("hit")
        setGeneratedCode(cached.code)
        setPrompt(cached.specSnapshot.mainPrompt)

        updateSpec("pages", generationId, {
          code: cached.code,
          mainPrompt: cached.specSnapshot.mainPrompt,
        })

        return cached
      }

      setCacheStatus("miss")
      return null
    } catch (error) {
      console.error("[v0] Cache check error:", error)
      setCacheStatus("miss")
      return null
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    const cached = await checkCache()
    if (cached) {
      return // Use cached code
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          previousCode: generatedCode || undefined,
          specMap,
          pageId: generationId,
        }),
      })

      if (!response.ok) throw new Error("Generation failed")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let code = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("0:")) {
              const data = line.slice(2)
              code += data
              setGeneratedCode(code)
            }
          }
        }
      }

      if (currentHash && code) {
        const page = getSpec("pages", generationId)
        setCachedCode({
          hash: currentHash,
          pageId: generationId,
          pageName: page?.name || "Untitled",
          code,
          generatedAt: new Date().toISOString(),
          specSnapshot: {
            mainPrompt: prompt,
            referenceIds: page?.referenceIds || [],
            type: page?.type || "component",
          },
        })
        console.log("[v0] Code cached with hash:", currentHash)
      }

      updateSpec("pages", generationId, {
        code,
        mainPrompt: prompt,
      })
    } catch (error) {
      console.error("[v0] Generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeHistory = getPageHistory(generationId)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Code Generator</h2>
              <p className="text-sm text-muted-foreground">Generate React components with AI</p>
            </div>
          </div>

          {cacheStatus && (
            <div className="flex items-center gap-2 text-sm">
              {cacheStatus === "checking" && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking cache...
                </span>
              )}
              {cacheStatus === "hit" && (
                <span className="text-green-600 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Loaded from cache
                </span>
              )}
              {cacheStatus === "miss" && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <History className="w-3 h-3" />
                  New generation
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-4 p-6">
        {/* Left: Prompt Input */}
        <Card className="lg:w-1/3 p-6 flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Describe your component</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Create a pricing card with three tiers, each with a title, price, features list, and a call-to-action button"
              className="min-h-[200px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full" size="lg">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {generatedCode ? "Regenerate" : "Generate"}
              </>
            )}
          </Button>

          {generatedCode && (
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-sm font-medium text-foreground">Actions</p>
              <Button onClick={handleCopy} variant="outline" className="w-full bg-transparent" size="sm">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>

              {codeHistory.length > 0 && <CodeHistoryDialog pageId={generationId} />}
            </div>
          )}

          {codeHistory.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <History className="w-3 h-3" />
                {codeHistory.length} version{codeHistory.length !== 1 ? "s" : ""} in history
              </p>
            </div>
          )}
        </Card>

        {/* Right: Preview & Code */}
        <Card className="flex-1 overflow-hidden">
          {generatedCode ? (
            <Tabs defaultValue="preview" className="h-full flex flex-col">
              <div className="border-b border-border px-4">
                <TabsList className="h-12">
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2">
                    <Code className="w-4 h-4" />
                    Code
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="preview" className="flex-1 overflow-auto m-0 p-6">
                <SandboxPreview code={generatedCode} />
              </TabsContent>

              <TabsContent value="code" className="flex-1 overflow-auto m-0">
                <pre className="p-6 text-sm font-mono bg-muted/30 h-full overflow-auto">
                  <code>{generatedCode}</code>
                </pre>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-600/60" />
                </div>
                <p className="text-sm">Enter a prompt to generate code</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
