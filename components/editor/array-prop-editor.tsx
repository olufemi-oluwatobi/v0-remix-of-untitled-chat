"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { useState } from "react"

interface ArrayPropEditorProps {
  value: any[]
  itemSchema: Record<string, "string" | "number" | "boolean">
  onChange: (value: any[]) => void
  label: string
  description?: string
}

export function ArrayPropEditor({ value, itemSchema, onChange, label, description }: ArrayPropEditorProps) {
  const [items, setItems] = useState<any[]>(value || [])

  const handleAddItem = () => {
    const newItem: any = {}
    Object.keys(itemSchema).forEach((key) => {
      const type = itemSchema[key]
      newItem[key] = type === "string" ? "" : type === "number" ? 0 : false
    })
    const newItems = [...items, newItem]
    setItems(newItems)
    onChange(newItems)
  }

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    setItems(newItems)
    onChange(newItems)
  }

  const handleItemChange = (index: number, key: string, itemValue: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [key]: itemValue }
    setItems(newItems)
    onChange(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs">{label}</Label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={handleAddItem} className="h-7 bg-transparent">
          <Plus className="w-3 h-3 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <Card className="p-4 text-center text-sm text-muted-foreground">
            No items yet. Click "Add Item" to start.
          </Card>
        ) : (
          items.map((item, index) => (
            <Card key={index} className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              <div className="grid gap-3">
                {Object.keys(itemSchema).map((key) => {
                  const type = itemSchema[key]
                  return (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs capitalize">{key}</Label>
                      {type === "string" && (
                        <Input
                          value={item[key] || ""}
                          onChange={(e) => handleItemChange(index, key, e.target.value)}
                          placeholder={`Enter ${key}...`}
                          className="h-8"
                        />
                      )}
                      {type === "number" && (
                        <Input
                          type="number"
                          value={item[key] || 0}
                          onChange={(e) => handleItemChange(index, key, Number.parseInt(e.target.value))}
                          placeholder={`Enter ${key}...`}
                          className="h-8"
                        />
                      )}
                      {type === "boolean" && (
                        <select
                          value={item[key]?.toString() || "false"}
                          onChange={(e) => handleItemChange(index, key, e.target.value === "true")}
                          className="w-full h-8 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
