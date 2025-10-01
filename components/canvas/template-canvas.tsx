"use client"

import { useWorkspaceStore, type Template } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Undo2, Redo2, Plus, X, Sparkles } from "lucide-react"
import { PromptBuilder } from "@/components/editor/prompt-builder"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TemplateCanvasProps {
  template: Template
}

export function TemplateCanvas({ template }: TemplateCanvasProps) {
  const { canUndoSpec, canRedoSpec, undoSpec, redoSpec, updateSpec, specMap, addSpec } = useWorkspaceStore()
  const [isAddReferenceOpen, setIsAddReferenceOpen] = useState(false)
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>("")
  const [newTag, setNewTag] = useState("")

  const allReferences = [
    ...specMap.pages.map((p) => ({ ...p, specType: "pages" as const })),
    ...specMap.contexts.map((c) => ({ ...c, specType: "contexts" as const })),
    ...specMap.assets.map((a) => ({ ...a, specType: "assets" as const })),
    ...specMap.styles.map((s) => ({ ...s, specType: "styles" as const })),
  ]

  const referencedItems = allReferences.filter((ref) => template.referenceIds.includes(ref.id))

  const handlePromptChange = (value: string) => {
    updateSpec("templates", template.id, { mainPrompt: value })
  }

  const handleReferencesChange = (references: string[]) => {
    const uniqueRefs = [...new Set([...template.referenceIds, ...references])]
    updateSpec("templates", template.id, { referenceIds: uniqueRefs })
  }

  const handleAddReference = () => {
    if (selectedReferenceId && !template.referenceIds.includes(selectedReferenceId)) {
      updateSpec("templates", template.id, {
        referenceIds: [...template.referenceIds, selectedReferenceId],
      })
      setSelectedReferenceId("")
      setIsAddReferenceOpen(false)
    }
  }

  const handleRemoveReference = (refId: string) => {
    updateSpec("templates", template.id, {
      referenceIds: template.referenceIds.filter((id) => id !== refId),
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !template.tags.includes(newTag.trim())) {
      updateSpec("templates", template.id, {
        tags: [...template.tags, newTag.trim()],
      })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    updateSpec("templates", template.id, {
      tags: template.tags.filter((t) => t !== tag),
    })
  }

  const handleUseTemplate = () => {
    // Create a new page/component from this template
    const newItem = {
      id: `${template.category}-${Date.now()}`,
      name: `New ${template.name}`,
      type: template.category === "component" ? ("component" as const) : ("page" as const),
      icon: template.category === "component" ? "Box" : "FileText",
      mainPrompt: template.mainPrompt,
      referenceIds: [...template.referenceIds],
    }
    addSpec("pages", newItem)
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">{template.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="h-8 gap-1.5" onClick={handleUseTemplate}>
            <Sparkles className="w-4 h-4" />
            Use Template
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => undoSpec("templates", template.id)}
            disabled={!canUndoSpec("templates", template.id)}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => redoSpec("templates", template.id)}
            disabled={!canRedoSpec("templates", template.id)}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Template Name</Label>
              <Input
                value={template.name}
                onChange={(e) => updateSpec("templates", template.id, { name: e.target.value })}
                placeholder="Template name..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={template.category}
                onValueChange={(value) =>
                  updateSpec("templates", template.id, {
                    category: value as "page" | "component" | "layout" | "feature",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="layout">Layout</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={template.description}
              onChange={(e) => updateSpec("templates", template.id, { description: e.target.value })}
              placeholder="Describe what this template does..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Template Prompt</Label>
            <PromptBuilder
              value={template.mainPrompt}
              onChange={handlePromptChange}
              onReferencesChange={handleReferencesChange}
              placeholder="Describe the template structure and features..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button onClick={handleAddTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
                    <DialogDescription>Select an item to reference in this template</DialogDescription>
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
