"use client"

import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { Button } from "@/components/ui/button"
import { Moon, Sun, PanelLeftClose, PanelLeftOpen, Play, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const { isSidebarOpen, toggleSidebar, viewMode, setViewMode, tabs, activeTabId, closeTab, setActiveTab } =
    useWorkspaceStore()
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="border-b border-border bg-card">
      {/* Top Bar */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </Button>
          <div className="text-sm font-medium text-foreground">Computer Science Library</div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <Button
              variant={viewMode === "design" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setViewMode("design")}
            >
              Design
            </Button>
            <Button
              variant={viewMode === "code" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setViewMode("code")}
            >
              Code
            </Button>
            <Button
              variant={viewMode === "preview" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => setViewMode("preview")}
            >
              <Play className="w-3 h-3 mr-1" />
              Preview
            </Button>
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="flex items-center gap-1 px-2 bg-muted/30 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm border-b-2 transition-colors cursor-pointer ${
                tab.id === activeTabId
                  ? "border-primary text-foreground bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span className="truncate max-w-[150px]">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="hover:bg-muted rounded-sm p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
