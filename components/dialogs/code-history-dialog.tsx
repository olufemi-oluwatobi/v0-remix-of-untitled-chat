"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCodeCacheStore, type CodeCacheEntry } from "@/lib/store/use-code-cache-store"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { History, Eye, Code, Clock, Hash, Trash2 } from "lucide-react"
import { SandboxPreview } from "@/components/preview/sandbox-preview"
import { formatDistanceToNow } from "date-fns"

interface CodeHistoryDialogProps {
  pageId: string
  trigger?: React.ReactNode
}

export function CodeHistoryDialog({ pageId, trigger }: CodeHistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<CodeCacheEntry | null>(null)
  const { getPageHistory, removeCachedCode } = useCodeCacheStore()
  const { updateSpec, getSpec } = useWorkspaceStore()

  const history = getPageHistory(pageId)
  const page = getSpec("pages", pageId)

  const handleRestore = (entry: CodeCacheEntry) => {
    updateSpec("pages", pageId, {
      code: entry.code,
      mainPrompt: entry.specSnapshot.mainPrompt,
    })
    setOpen(false)
  }

  const handleDelete = (hash: string) => {
    removeCachedCode(hash)
    if (selectedEntry?.hash === hash) {
      setSelectedEntry(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-2" />
            View History ({history.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Code History - {page?.name}</DialogTitle>
          <DialogDescription>
            View and restore previous versions of generated code based on spec map snapshots
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4">
          {/* Left: History List */}
          <div className="w-1/3 border-r border-border pr-4">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {history.length === 0 ? (
                  <Card className="p-6 text-center text-sm text-muted-foreground">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No history available yet
                  </Card>
                ) : (
                  history.map((entry) => (
                    <Card
                      key={entry.hash}
                      className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedEntry?.hash === entry.hash ? "bg-muted border-primary" : ""
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{entry.pageName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(entry.generatedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {entry.specSnapshot.type}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2">{entry.specSnapshot.mainPrompt}</p>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            <span className="font-mono">{entry.hash.slice(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {entry.accessCount} access{entry.accessCount !== 1 ? "es" : ""}
                            </span>
                          </div>
                        </div>

                        {entry.specSnapshot.referenceIds.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>
                              {entry.specSnapshot.referenceIds.length} reference
                              {entry.specSnapshot.referenceIds.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedEntry ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">Version Preview</h3>
                    <p className="text-xs text-muted-foreground">
                      Generated {formatDistanceToNow(new Date(selectedEntry.generatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDelete(selectedEntry.hash)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                    <Button size="sm" onClick={() => handleRestore(selectedEntry)}>
                      Restore This Version
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
                  <TabsList>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="gap-2">
                      <Code className="w-4 h-4" />
                      Code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="flex-1 overflow-auto mt-4">
                    <Card className="h-full p-6">
                      <SandboxPreview code={selectedEntry.code} />
                    </Card>
                  </TabsContent>

                  <TabsContent value="code" className="flex-1 overflow-auto mt-4">
                    <Card className="h-full overflow-hidden">
                      <ScrollArea className="h-full">
                        <pre className="p-6 text-sm font-mono bg-muted/30">
                          <code>{selectedEntry.code}</code>
                        </pre>
                      </ScrollArea>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <History className="w-8 h-8 text-primary/60" />
                  </div>
                  <p className="text-sm">Select a version to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
