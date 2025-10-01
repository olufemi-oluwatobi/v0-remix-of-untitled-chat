"use client"

import { Label } from "@/components/ui/label"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Undo2, Redo2, Code2, Eye, Columns2, Sparkles } from "lucide-react"
import { PromptBuilder } from "@/components/editor/prompt-builder"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SandboxPreview } from "@/components/preview/sandbox-preview"
import { Separator } from "@/components/ui/separator"
import type { Component } from "@/lib/store/use-workspace-store"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ComponentStyleEditor } from "@/components/editor/component-style-editor"
import { generateDummyComponent } from "@/lib/utils/dummy-component-generator"

interface ComponentCanvasProps {
  component: Component
}

export function ComponentCanvas({ component }: ComponentCanvasProps) {
  const { canUndoSpec, canRedoSpec, undoSpec, redoSpec, updateSpec } = useWorkspaceStore()
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split")

  const handlePromptChange = (value: string) => {
    updateSpec<Component>("components", component.id, { mainPrompt: value })
  }

  const handleGenerateComponent = () => {
    const generated = generateDummyComponent(component.mainPrompt, component.name)
    updateSpec<Component>("components", component.id, {
      code: generated.code,
      props: generated.props,
      stylePropsMap: generated.styleMap,
    })
  }

  const handleStyleChange = (styleMap: Record<string, any>) => {
    updateSpec<Component>("components", component.id, {
      stylePropsMap: styleMap,
    })
    if (component.code) {
      const generated = generateDummyComponent(component.mainPrompt, component.name)
      updateSpec<Component>("components", component.id, {
        code: generated.code,
      })
    }
  }

  const EditorPanel = () => (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <h3 className="text-sm font-semibold">Component Editor</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Prompt Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Component Description</Label>
              <Button onClick={handleGenerateComponent} size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                {component.code ? "Regenerate" : "Generate"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Describe what you want this component to look like and what it should do
            </p>
            <PromptBuilder
              value={component.mainPrompt}
              onChange={handlePromptChange}
              placeholder="Example: A modern pricing card with a gradient background, featuring a plan name at the top, a large price display, a list of 5 features with checkmarks, and a prominent call-to-action button at the bottom. Use blue and purple colors."
            />
          </div>

          <Separator />

          {/* Style Editor Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Component Styling</Label>
            <p className="text-sm text-muted-foreground">
              Customize colors, typography, spacing, and layout for each element
            </p>

            {component.stylePropsMap && Object.keys(component.stylePropsMap).length > 0 ? (
              <ComponentStyleEditor
                componentId={component.id}
                styleMap={component.stylePropsMap}
                onStyleChange={handleStyleChange}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">Generate the component first to see styling options</p>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  // Preview Panel
  const PreviewPanel = () => (
    <div className="h-full flex flex-col bg-muted/20">
      <div className="border-b border-border bg-card px-4 py-3">
        <h3 className="text-sm font-semibold">Live Preview</h3>
      </div>
      <div className="flex-1 p-6">
        {component.code ? (
          <Card className="h-full overflow-hidden bg-white">
            <SandboxPreview code={component.code} />
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center bg-white">
            <div className="text-center space-y-2">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">No preview available</p>
              <p className="text-xs text-muted-foreground">Generate the component to see a live preview</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-foreground">{component.name}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="edit" className="h-7 px-3">
                <Code2 className="w-4 h-4 mr-1" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="split" className="h-7 px-3">
                <Columns2 className="w-4 h-4 mr-1" />
                Split
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-7 px-3">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => undoSpec("components", component.id)}
            disabled={!canUndoSpec("components", component.id)}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => redoSpec("components", component.id)}
            disabled={!canRedoSpec("components", component.id)}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "edit" && <EditorPanel />}

        {viewMode === "preview" && <PreviewPanel />}

        {viewMode === "split" && (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={30}>
              <EditorPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <PreviewPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  )
}
