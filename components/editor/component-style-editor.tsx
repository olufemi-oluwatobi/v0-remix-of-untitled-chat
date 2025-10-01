"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { Palette, Droplet, Type, Box } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CSSProperties } from "react"

interface ComponentStyleEditorProps {
  componentId: string
  styleMap: Record<string, CSSProperties>
  onStyleChange: (styleMap: Record<string, CSSProperties>) => void
}

export function ComponentStyleEditor({ componentId, styleMap, onStyleChange }: ComponentStyleEditorProps) {
  const { specMap } = useWorkspaceStore()
  const [selectedElement, setSelectedElement] = useState<string>(Object.keys(styleMap)[0] || "root")

  const styleGuide = specMap.styles[0]
  const elements = Object.keys(styleMap)

  const handleStyleUpdate = (element: string, property: string, value: string) => {
    const updatedStyleMap = {
      ...styleMap,
      [element]: {
        ...styleMap[element],
        [property]: value,
      },
    }
    onStyleChange(updatedStyleMap)
  }

  const currentStyles = styleMap[selectedElement] || {}

  const colorProperties = Object.entries(currentStyles).filter(([key]) =>
    ["color", "backgroundColor", "borderColor", "fill", "stroke"].includes(key),
  )
  const spacingProperties = Object.entries(currentStyles).filter(([key]) =>
    ["padding", "margin", "gap", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"].includes(key),
  )
  const typographyProperties = Object.entries(currentStyles).filter(([key]) =>
    ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign", "fontFamily"].includes(key),
  )
  const layoutProperties = Object.entries(currentStyles).filter(
    ([key]) =>
      ![...colorProperties, ...spacingProperties, ...typographyProperties].some(([propKey]) => propKey === key),
  )

  const isColorValue = (value: string) => {
    return (
      value.startsWith("#") ||
      value.startsWith("rgb") ||
      value.startsWith("hsl") ||
      value.startsWith("var(--") ||
      ["transparent", "currentColor"].includes(value)
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Element</Label>
        <Select value={selectedElement} onValueChange={setSelectedElement}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {elements.map((element) => (
              <SelectItem key={element} value={element}>
                <span className="capitalize">{element}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[450px] pr-4">
        <div className="space-y-6">
          {/* Colors Section */}
          {colorProperties.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" />
                Colors
              </h4>
              <Card className="p-4 space-y-4">
                {colorProperties.map(([property, value]) => (
                  <div key={property} className="space-y-2">
                    <Label className="text-xs font-medium capitalize">
                      {property.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          value={value as string}
                          onChange={(e) => handleStyleUpdate(selectedElement, property, e.target.value)}
                          placeholder={`Enter ${property}...`}
                          className="pr-10"
                        />
                        {isColorValue(value as string) && (
                          <div
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border-2 border-border shadow-sm"
                            style={{ backgroundColor: value as string }}
                          />
                        )}
                      </div>
                      <input
                        type="color"
                        value={(value as string).startsWith("#") ? (value as string) : "#3b82f6"}
                        onChange={(e) => handleStyleUpdate(selectedElement, property, e.target.value)}
                        className="w-10 h-10 rounded border-2 border-border cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Typography Section */}
          {typographyProperties.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-600" />
                Typography
              </h4>
              <Card className="p-4 space-y-4">
                {typographyProperties.map(([property, value]) => (
                  <div key={property} className="space-y-2">
                    <Label className="text-xs font-medium capitalize">
                      {property.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      value={value as string}
                      onChange={(e) => handleStyleUpdate(selectedElement, property, e.target.value)}
                      placeholder={`Enter ${property}...`}
                    />
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Spacing Section */}
          {spacingProperties.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Droplet className="w-4 h-4 text-teal-600" />
                Spacing
              </h4>
              <Card className="p-4 space-y-4">
                {spacingProperties.map(([property, value]) => (
                  <div key={property} className="space-y-2">
                    <Label className="text-xs font-medium capitalize">
                      {property.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      value={value as string}
                      onChange={(e) => handleStyleUpdate(selectedElement, property, e.target.value)}
                      placeholder={`e.g., 16px, 1rem`}
                    />
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Layout Section */}
          {layoutProperties.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Box className="w-4 h-4 text-orange-600" />
                Layout & Other
              </h4>
              <Card className="p-4 space-y-4">
                {layoutProperties.map(([property, value]) => (
                  <div key={property} className="space-y-2">
                    <Label className="text-xs font-medium capitalize">
                      {property.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <Input
                      value={value as string}
                      onChange={(e) => handleStyleUpdate(selectedElement, property, e.target.value)}
                      placeholder={`Enter ${property}...`}
                    />
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
