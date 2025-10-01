"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SandboxPreview } from "@/components/preview/sandbox-preview"
import { useCodeCacheStore } from "@/lib/store/use-code-cache-store"
import { useWorkspaceStore, type Page } from "@/lib/store/use-workspace-store"
import { History, Zap, Code } from "lucide-react"
import { CodeHistoryDialog } from "@/components/dialogs/code-history-dialog"

interface WorkspacePreviewProps {
  page: Page
}

export function WorkspacePreview({ page }: WorkspacePreviewProps) {
  const [showCode, setShowCode] = useState(false)
  const { getPageHistory } = useCodeCacheStore()
  const { specMap } = useWorkspaceStore()
  const [codeHistory, setCodeHistory] = useState<any[]>([])

  useEffect(() => {
    const history = getPageHistory(page.id)
    setCodeHistory(history)
  }, [page.id, getPageHistory])

  if (!page.code) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
              <Code className="w-10 h-10 text-primary/60" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">No code generated yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Switch to Design mode and generate code to see a preview
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{page.name} - Preview</h2>
              <p className="text-sm text-muted-foreground">Live preview of generated code</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {codeHistory.length > 0 && (
              <Badge variant="outline" className="gap-1">
                <History className="w-3 h-3" />
                {codeHistory.length} version{codeHistory.length !== 1 ? "s" : ""}
              </Badge>
            )}
            {codeHistory.length > 0 && <CodeHistoryDialog pageId={page.id} />}
            <Button variant="outline" size="sm" onClick={() => setShowCode(!showCode)}>
              <Code className="w-4 h-4 mr-2" />
              {showCode ? "Hide Code" : "Show Code"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        {showCode ? (
          <Card className="h-full overflow-hidden">
            <div className="h-full overflow-auto">
              <pre className="p-6 text-sm font-mono bg-muted/30">
                <code>{page.code}</code>
              </pre>
            </div>
          </Card>
        ) : (
          <Card className="h-full overflow-hidden p-6">
            <SandboxPreview code={page.code} />
          </Card>
        )}
      </div>

      {/* Footer with metadata */}
      {page.mainPrompt && (
        <div className="border-t border-border bg-card px-6 py-3">
          <div className="flex items-start gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Prompt:</span>
            <span className="text-foreground flex-1">{page.mainPrompt}</span>
          </div>
        </div>
      )}
    </div>
  )
}
