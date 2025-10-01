"use client"

import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"

export function PropertiesPanel() {
  const { selectedItem, currentSection } = useWorkspaceStore()

  return (
    <aside className="w-80 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Properties</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          {selectedItem ? (
            <div className="text-sm text-muted-foreground">
              <p>Section: {currentSection}</p>
              <p>Selected: {selectedItem}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No item selected</p>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
