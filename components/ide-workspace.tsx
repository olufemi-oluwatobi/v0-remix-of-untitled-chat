"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { Header } from "@/components/header/header"
import { CanvasArea } from "@/components/canvas/canvas-area"
import { ChatPanel } from "@/components/chat/chat-panel"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { FullAppPreview } from "@/components/preview/full-app-preview"

export function IDEWorkspace() {
  const { isSidebarOpen, viewMode, showOnboarding } = useWorkspaceStore()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {isSidebarOpen && !showOnboarding && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        {!showOnboarding && <Header />}
        {viewMode === "preview" ? <FullAppPreview /> : <CanvasArea />}
      </div>

      {!showOnboarding && <ChatPanel />}
    </div>
  )
}
