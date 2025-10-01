"use client"

import { useWorkspaceStore, type Context } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Undo2, Redo2, Plus, X, FileText, Box, Palette, ImageIcon } from "lucide-react"
import { PromptBuilder } from "@/components/editor/prompt-builder"
import { AssetAnalysis } from "@/components/analysis/asset-analysis"
import { ImageUploader } from "@/components/upload/image-uploader"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ContextCanvasProps {
  context: Context
}

export function ContextCanvas({ context }: ContextCanvasProps) {
  const { canUndoSpec, canRedoSpec, undoSpec, redoSpec, updateSpec, specMap } = useWorkspaceStore()
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false)
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>("")

  // Get all available items for references
  const allItems = [
    ...specMap.pages.map((p) => ({ ...p, section: "Views" })),
    ...specMap.contexts.map((c) => ({ ...c, section: "Contexts" })),
    ...specMap.assets.map((a) => ({ ...a, section: "Assets" })),
    ...specMap.styles.map((s) => ({ ...s, section: "Styles" })),
  ].filter((item) => item.id !== context.id)

  const references = (context.referenceIds || [])
    .map((refId) => allItems.find((item) => item.id === refId))
    .filter(Boolean)

  const handlePromptChange = (value: string) => {
    updateSpec("contexts", context.id, { mainPrompt: value })
  }

  const handleReferencesChange = (refs: string[]) => {
    updateSpec("contexts", context.id, { referenceIds: refs })
  }

  const handleImageChange = (url: string) => {
    updateSpec("contexts", context.id, { link: url })
  }

  const handleImageRemove = () => {
    updateSpec("contexts", context.id, { link: undefined })
  }

  const handleAddReference = () => {
    if (selectedReferenceId) {
      const currentRefs = context.referenceIds || []
      if (!currentRefs.includes(selectedReferenceId)) {
        updateSpec("contexts", context.id, {
          referenceIds: [...currentRefs, selectedReferenceId],
        })
      }
      setSelectedReferenceId("")
      setIsAddReferenceOpen(false)
    }
  }

  const handleRemoveReference = (refId: string) => {
    const currentRefs = context.referenceIds || []
    updateSpec("contexts", context.id, {
      referenceIds: currentRefs.filter((id) => id !== refId),
    })
  }

  const handleCleanup = async () => {
    // Simulate AI cleanup
    console.log("[v0] Cleaning up prompt with AI...")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // In a real implementation, this would call an AI service
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "page":
      case "component":
        return <FileText className="w-4 h-4" />
      case "style":
        return <Palette className="w-4 h-4" />
      case "image":
      case "video":
        return <ImageIcon className="w-4 h-4" />
      default:
        return <Box className="w-4 h-4" />
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{context.name}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => undoSpec("contexts", context.id)}
            disabled={!canUndoSpec("contexts", context.id)}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => redoSpec("contexts", context.id)}
            disabled={!canRedoSpec("contexts", context.id)}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Context Type Badge */}
          <div>
            <Badge variant="outline" className="capitalize">
              {context.type} Context
            </Badge>
          </div>

          {context.type === "image" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Image</Label>
              <ImageUploader value={context.link} onChange={handleImageChange} onRemove={handleImageRemove} />
            </div>
          )}

          {/* Main Prompt Builder */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Context Description</Label>
            <PromptBuilder
              value={context.mainPrompt || context.content || ""}
              onChange={handlePromptChange}
              onReferencesChange={handleReferencesChange}
              placeholder="Describe this context..."
              onCleanup={handleCleanup}
            />
          </div>

          {/* Image/Asset Analysis */}
          {(context.type === "image" || context.link) && context.link && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Visual Analysis</Label>
              <AssetAnalysis item={context} type="contexts" />
            </div>
          )}

          {/* References Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">References</Label>
              <Dialog open={isAddReferenceOpen} onOpenChange={setIsAddReferenceOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 bg-transparent">
                    <Plus className="w-3.5 h-3.5" />
                    Add Reference
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Reference</DialogTitle>
                    <DialogDescription>
                      Add a reference to another page, component, asset, or style guide.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Item</Label>
                      <Select value={selectedReferenceId} onValueChange={setSelectedReferenceId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an item..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.section})
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

            {references.length === 0 ? (
              <Card className="p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground text-center">
                  No references added yet. Click "Add Reference" to link pages, components, or assets.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {references.map((ref: any) => (
                  <Card key={ref.id} className="p-3 bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <div className="mt-0.5 text-muted-foreground">{getIcon(ref.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ref.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{ref.section}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 flex-shrink-0"
                        onClick={() => handleRemoveReference(ref.id)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
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
