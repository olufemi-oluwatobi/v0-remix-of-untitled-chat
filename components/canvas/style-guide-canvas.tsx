"use client"

import { useWorkspaceStore, type StyleGuide } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Undo2, Redo2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { FontSelector } from "@/components/ui/font-selector"

interface StyleGuideCanvasProps {
  style: StyleGuide
}

export function StyleGuideCanvas({ style }: StyleGuideCanvasProps) {
  const { updateSpec, canUndoSpec, canRedoSpec, undoSpec, redoSpec } = useWorkspaceStore()
  const [activeColorMode, setActiveColorMode] = useState<"light" | "dark">("light")

  const handleColorChange = (key: keyof StyleGuide["colors"]["light"], value: string) => {
    updateSpec<StyleGuide>("styles", style.id, {
      colors: {
        ...style.colors,
        [activeColorMode]: {
          ...style.colors[activeColorMode],
          [key]: value,
        },
      },
    })
  }

  const handleTypographyChange = (key: keyof StyleGuide["typography"], value: string) => {
    updateSpec<StyleGuide>("styles", style.id, {
      typography: {
        ...style.typography,
        [key]: value,
      },
    })
  }

  const handleSpacingChange = (value: number) => {
    updateSpec<StyleGuide>("styles", style.id, { spacing: value })
  }

  const handleBorderRadiusChange = (value: number) => {
    updateSpec<StyleGuide>("styles", style.id, { borderRadius: value })
  }

  const addCustomColor = () => {
    updateSpec<StyleGuide>("styles", style.id, {
      colors: {
        ...style.colors,
        custom: [...style.colors.custom, { name: "New Color", value: "#000000" }],
      },
    })
  }

  const removeCustomColor = (index: number) => {
    updateSpec<StyleGuide>("styles", style.id, {
      colors: {
        ...style.colors,
        custom: style.colors.custom.filter((_, i) => i !== index),
      },
    })
  }

  const updateCustomColor = (index: number, field: "name" | "value", value: string) => {
    const newCustom = [...style.colors.custom]
    newCustom[index] = { ...newCustom[index], [field]: value }
    updateSpec<StyleGuide>("styles", style.id, {
      colors: {
        ...style.colors,
        custom: newCustom,
      },
    })
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Canvas Header */}
      <div className="border-b border-border bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground">{style.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => undoSpec("styles", style.id)}
            disabled={!canUndoSpec("styles", style.id)}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => redoSpec("styles", style.id)}
            disabled={!canRedoSpec("styles", style.id)}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          {/* Colors Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Colors</h3>
              <div className="flex items-center gap-2 bg-muted rounded-md p-1">
                <Button
                  variant={activeColorMode === "light" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setActiveColorMode("light")}
                >
                  Light
                </Button>
                <Button
                  variant={activeColorMode === "dark" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-xs"
                  onClick={() => setActiveColorMode("dark")}
                >
                  Dark
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(style.colors[activeColorMode]).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as any, e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key as any, e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Colors */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-semibold">Custom Colors</Label>
                <Button variant="outline" size="sm" onClick={addCustomColor}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Color
                </Button>
              </div>
              <div className="space-y-2">
                {style.colors.custom.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateCustomColor(index, "name", e.target.value)}
                      placeholder="Color name"
                      className="flex-1"
                    />
                    <Input
                      type="color"
                      value={color.value}
                      onChange={(e) => updateCustomColor(index, "value", e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={color.value}
                      onChange={(e) => updateCustomColor(index, "value", e.target.value)}
                      className="w-32 font-mono text-sm"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCustomColor(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Typography</h3>
            <div className="space-y-4">
              <FontSelector
                label="Heading Font"
                value={style.typography.heading}
                onChange={(value) => handleTypographyChange("heading", value)}
              />
              <FontSelector
                label="Body Font"
                value={style.typography.body}
                onChange={(value) => handleTypographyChange("body", value)}
              />
              <FontSelector
                label="Monospace Font"
                value={style.typography.monospace}
                onChange={(value) => handleTypographyChange("monospace", value)}
              />
            </div>
          </section>

          {/* Spacing Section */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Spacing</h3>
            <div className="space-y-2">
              <Label className="text-sm">Base Spacing Unit (px)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={style.spacing}
                  onChange={(e) => handleSpacingChange(Number(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={style.spacing}
                  onChange={(e) => handleSpacingChange(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </section>

          {/* Border Radius Section */}
          <section>
            <h3 className="text-lg font-semibold text-foreground mb-4">Border Radius</h3>
            <div className="space-y-2">
              <Label className="text-sm">Base Border Radius (px)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={style.borderRadius}
                  onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={style.borderRadius}
                  onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
                  className="w-20"
                />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}
