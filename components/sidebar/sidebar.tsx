"use client"

import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Box,
  Palette,
  Database,
  ImageIcon,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Clipboard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
} from "lucide-react"
import { useState, useEffect } from "react"
import { AddItemDialog } from "@/components/dialogs/add-item-dialog"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

const sections = [
  { id: "Views" as const, label: "Pages", icon: FileText },
  { id: "Components" as const, label: "Components", icon: Box },
  { id: "Styles" as const, label: "Style Guide", icon: Palette },
  { id: "Contexts" as const, label: "Contexts", icon: Database },
  { id: "Assets" as const, label: "Assets", icon: ImageIcon },
  { id: "Templates" as const, label: "Templates", icon: Sparkles },
]

const ITEMS_PER_PAGE = 20

export function Sidebar() {
  const { currentSection, setCurrentSection, activeTabId, tabs, openTab, specMap, renameSpec, deleteSpec, addSpec } =
    useWorkspaceStore()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [clipboard, setClipboard] = useState<{ item: any; section: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()

  const handleAddItem = () => {
    if (currentSection === "Assets") {
      openTab({
        id: "asset-builder",
        title: "Asset Builder",
        type: "AI Generator",
        itemId: "asset-builder",
      })
    } else {
      setShowAddDialog(true)
    }
  }

  const getCurrentSectionItems = () => {
    switch (currentSection) {
      case "Views":
        return specMap.pages.filter((p) => p.type === "page")
      case "Components":
        return specMap.pages.filter((p) => p.type === "component")
      case "Styles":
        return specMap.styles
      case "Contexts":
        return specMap.contexts
      case "Assets":
        return specMap.assets
      case "Templates":
        return specMap.templates
      default:
        return []
    }
  }

  const allItems = getCurrentSectionItems()

  const totalPages = Math.ceil(allItems.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const items = allItems.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [currentSection])

  const handleItemClick = (item: any) => {
    openTab({
      id: item.id,
      title: item.name,
      type: currentSection,
      itemId: item.id,
    })
  }

  const handleRenameStart = (item: any) => {
    setRenamingId(item.id)
    setRenameValue(item.name)
  }

  const handleRenameSubmit = (itemId: string) => {
    if (renameValue.trim()) {
      const typeMap = {
        Views: "pages",
        Components: "pages",
        Styles: "styles",
        Contexts: "contexts",
        Assets: "assets",
        Templates: "templates",
      } as const
      renameSpec(typeMap[currentSection], itemId, renameValue.trim())
    }
    setRenamingId(null)
  }

  const handleRenameCancel = () => {
    setRenamingId(null)
    setRenameValue("")
  }

  const handleDelete = (item: any) => {
    const typeMap = {
      Views: "pages",
      Components: "pages",
      Styles: "styles",
      Contexts: "contexts",
      Assets: "assets",
      Templates: "templates",
    } as const
    deleteSpec(typeMap[currentSection], item.id)
  }

  const handleCopy = (item: any) => {
    setClipboard({ item, section: currentSection })
    toast({
      title: "Copied",
      description: `${item.name} copied to clipboard`,
    })
  }

  const handlePaste = () => {
    if (!clipboard) return

    const typeMap = {
      Views: "pages",
      Components: "pages",
      Styles: "styles",
      Contexts: "contexts",
      Assets: "assets",
      Templates: "templates",
    } as const

    const newItem = {
      ...clipboard.item,
      id: `${clipboard.item.id}-copy-${Date.now()}`,
      name: `${clipboard.item.name} (Copy)`,
    }

    addSpec(typeMap[currentSection], newItem)
    toast({
      title: "Pasted",
      description: `${newItem.name} created`,
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        const activeItem = allItems.find((item) => item.id === activeTabId)
        if (activeItem) {
          e.preventDefault()
          handleCopy(activeItem)
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        if (clipboard) {
          e.preventDefault()
          handlePaste()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTabId, allItems, clipboard])

  const activeItemId = tabs.find((t) => t.id === activeTabId)?.itemId

  return (
    <>
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">IDE Workspace</h1>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-sidebar-border">
          <ScrollArea className="w-full">
            <div className="flex flex-col p-2 gap-1">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = currentSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Explorer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-sidebar-border flex items-center justify-between">
            <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">Explorer</h3>
            <div className="flex items-center gap-1">
              {clipboard && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handlePaste} title="Paste (Ctrl+V)">
                  <Clipboard className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleAddItem}
                title={currentSection === "Assets" ? "Open Asset Builder" : "Add Item"}
              >
                {currentSection === "Assets" ? <Wand2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {allItems.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-sidebar-foreground/50">
                  {currentSection === "Assets"
                    ? "No assets yet. Click the wand to create one."
                    : "No items yet. Click + to add."}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger asChild>
                        {renamingId === item.id ? (
                          <div className="px-3 py-1.5">
                            <Input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => handleRenameSubmit(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleRenameSubmit(item.id)
                                } else if (e.key === "Escape") {
                                  handleRenameCancel()
                                }
                              }}
                              className="h-7 text-sm"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleItemClick(item)}
                            onDoubleClick={() => handleRenameStart(item)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors ${
                              activeItemId === item.id
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground/70"
                            }`}
                          >
                            <span className="flex-1 truncate text-left">{item.name}</span>
                          </button>
                        )}
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => handleCopy(item)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleRenameStart(item)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Rename
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => handleDelete(item)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {totalPages > 1 && (
            <div className="p-2 border-t border-sidebar-border flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs text-sidebar-foreground/60">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} section={currentSection} />
    </>
  )
}
