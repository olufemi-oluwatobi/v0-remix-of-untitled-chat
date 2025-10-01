"use client"

import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { StyleGuideCanvas } from "./style-guide-canvas"
import { PageCanvas } from "./page-canvas"
import { ComponentCanvas } from "./component-canvas"
import { ContextCanvas } from "./context-canvas"
import { AssetCanvas } from "./asset-canvas"
import { TemplateCanvas } from "./template-canvas"
import { AIGeneratorCanvas } from "./ai-generator-canvas"
import { AssetBuilderCanvas } from "./asset-builder-canvas"
import { OnboardingCanvas } from "./onboarding-canvas"
import { Layers } from "lucide-react"

export function CanvasArea() {
  const { tabs, activeTabId, specMap, showOnboarding } = useWorkspaceStore()

  if (showOnboarding) {
    return <OnboardingCanvas />
  }

  const renderCanvas = () => {
    const activeTab = tabs.find((tab) => tab.id === activeTabId)

    if (!activeTab) {
      return (
        <div className="flex-1 flex items-center justify-center text-muted-foreground h-full">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Layers className="w-10 h-10 text-primary/60" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">No tab open</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Select an item from the explorer to open it in a tab and start editing
              </p>
            </div>
          </div>
        </div>
      )
    }

    const itemId = activeTab.itemId

    if (itemId === "asset-builder") {
      return <AssetBuilderCanvas />
    }

    switch (activeTab.type) {
      case "Styles":
        const style = specMap.styles.find((s) => s.id === itemId)
        return style ? <StyleGuideCanvas style={style} /> : null
      case "Views":
        const page = specMap.pages.find((p) => p.id === itemId && p.type === "page")
        return page ? <PageCanvas page={page} /> : null
      case "Components":
        const component = specMap.pages.find((p) => p.id === itemId && p.type === "component")
        return component ? <ComponentCanvas component={component} /> : null
      case "Contexts":
        const context = specMap.contexts.find((c) => c.id === itemId)
        return context ? <ContextCanvas context={context} /> : null
      case "Assets":
        const asset = specMap.assets.find((a) => a.id === itemId)
        return asset ? <AssetCanvas asset={asset} /> : null
      case "Templates":
        const template = specMap.templates.find((t) => t.id === itemId)
        return template ? <TemplateCanvas template={template} /> : null
      case "AI Generator":
        const generation = specMap.pages.find((p) => p.id === itemId && p.type === "ai-generation")
        return generation ? <AIGeneratorCanvas generationId={generation.id} /> : null
      default:
        return null
    }
  }

  return <div className="flex-1 overflow-hidden bg-background">{renderCanvas()}</div>
}
