"use client"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import { DialogDescription } from "@/components/ui/dialog"

import { DialogTitle } from "@/components/ui/dialog"

import { DialogHeader } from "@/components/ui/dialog"

import { DialogContent } from "@/components/ui/dialog"

import { DialogTrigger } from "@/components/ui/dialog"

import { Dialog } from "@/components/ui/dialog"

import { Label } from "@/components/ui/label"

import { useWorkspaceStore, type Page } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Undo2, Redo2, Plus, X } from "lucide-react"
import { PromptBuilder } from "@/components/editor/prompt-builder"
import { useState } from "react"
import { SandboxPreview } from "@/components/preview/sandbox-preview"
import { CodePreview } from "@/components/preview/code-preview"

interface PageCanvasProps {
  page: Page
}

export function PageCanvas({ page }: PageCanvasProps) {
  const { canUndoSpec, canRedoSpec, undoSpec, redoSpec, updateSpec, specMap, viewMode } = useWorkspaceStore()
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false)
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>("")

  // Get all available references
  const allReferences = [
    ...specMap.pages.map((p) => ({ ...p, specType: "pages" as const })),
    ...specMap.contexts.map((c) => ({ ...c, specType: "contexts" as const })),
    ...specMap.assets.map((a) => ({ ...a, specType: "assets" as const })),
    ...specMap.styles.map((s) => ({ ...s, specType: "styles" as const })),
  ].filter((ref) => ref.id !== page.id) // Don't show current page

  // Get referenced items
  const referencedItems = allReferences.filter((ref) => page.referenceIds.includes(ref.id))

  const handlePromptChange = (value: string) => {
    updateSpec("pages", page.id, { mainPrompt: value })
  }

  const handleReferencesChange = (references: string[]) => {
    // Auto-update references based on mentions in the prompt
    const uniqueRefs = [...new Set([...page.referenceIds, ...references])]
    updateSpec("pages", page.id, { referenceIds: uniqueRefs })
  }

  const handleAddReference = () => {
    if (selectedReferenceId && !page.referenceIds.includes(selectedReferenceId)) {
      updateSpec("pages", page.id, {
        referenceIds: [...page.referenceIds, selectedReferenceId],
      })
      setSelectedReferenceId("")
      setIsAddReferenceOpen(false)
    }
  }

  const handleRemoveReference = (refId: string) => {
    updateSpec("pages", page.id, {
      referenceIds: page.referenceIds.filter((id) => id !== refId),
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "page":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "component":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "context":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "image":
      case "video":
      case "audio":
      case "file":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "style":
        return "bg-pink-500/10 text-pink-500 border-pink-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  // Code view rendering
  if (viewMode === "code") {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{page.name} - Code</h2>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {page.code ? (
            <CodePreview code={page.code} language="tsx" />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No code generated yet</p>
                <p className="text-xs text-muted-foreground">Generate code to view it here</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Preview view rendering
  if (viewMode === "preview") {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">{page.name} - Preview</h2>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          {page.code ? (
            <Card className="h-full overflow-hidden">
              <SandboxPreview code={page.code} />
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-foreground">No code to preview</p>
                <p className="text-xs text-muted-foreground">Generate code to see a live preview</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{page.name}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => undoSpec("pages", page.id)}
            disabled={!canUndoSpec("pages", page.id)}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => redoSpec("pages", page.id)}
            disabled={!canRedoSpec("pages", page.id)}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Main Prompt</Label>
            <PromptBuilder
              value={page.mainPrompt}
              onChange={handlePromptChange}
              onReferencesChange={handleReferencesChange}
              placeholder="Describe your page or component..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">References</Label>
              <Dialog open={isAddReferenceOpen} onOpenChange={setIsAddReferenceOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 bg-transparent">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Reference
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Reference</DialogTitle>
                    <DialogDescription>Select an item to reference in this {page.type}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Item</Label>
                      <Select value={selectedReferenceId} onValueChange={setSelectedReferenceId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allReferences.map((ref) => (
                            <SelectItem key={ref.id} value={ref.id}>
                              {"type" in ref ? `${ref.name} (${ref.type})` : ref.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddReference} className="w-full">
                      Add Reference
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {referencedItems.length === 0 ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">
                No references added yet. Use @ in the prompt or click "Add Reference" above.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {referencedItems.map((ref) => (
                  <Card key={ref.id} className="p-4 relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveReference(ref.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{ref.name}</h4>
                          {"type" in ref && (
                            <Badge variant="outline" className={`mt-1 text-xs ${getTypeColor(ref.type)}`}>
                              {ref.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {"content" in ref && <p className="text-xs text-muted-foreground line-clamp-2">{ref.content}</p>}
                      {"link" in ref && <p className="text-xs text-muted-foreground truncate">{ref.link}</p>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
