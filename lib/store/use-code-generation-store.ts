import { create } from "zustand"
import type { GeneratedCode, WorkflowStep } from "@/lib/code-generation/types"

interface CodeGenerationState {
  isGenerating: boolean
  generatedCode: Map<string, GeneratedCode>
  workflow: WorkflowStep[]
  progress: { completed: number; total: number; percentage: number }
  error: string | null

  // Actions
  startGeneration: (specMap: any, previousSpecMap?: any) => Promise<void>
  stopGeneration: () => void
  getCodeForSpec: (specId: string) => GeneratedCode | undefined
  clearGeneration: () => void
}

export const useCodeGenerationStore = create<CodeGenerationState>((set, get) => ({
  isGenerating: false,
  generatedCode: new Map(),
  workflow: [],
  progress: { completed: 0, total: 0, percentage: 0 },
  error: null,

  startGeneration: async (specMap, previousSpecMap) => {
    set({ isGenerating: true, error: null })

    try {
      // Convert existing code Map to array for API
      const existingCodeArray = Array.from(get().generatedCode.entries()).map(([specId, code]) => ({
        specId,
        code,
      }))

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specMap,
          previousSpecMap,
          existingCode: existingCodeArray,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Convert code array back to Map
        const codeMap = new Map(data.code.map((item: any) => [item.specId, item.code]))

        set({
          generatedCode: codeMap,
          workflow: data.workflow,
          progress: data.progress,
          isGenerating: false,
        })
      } else {
        set({ error: data.error, isGenerating: false })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isGenerating: false,
      })
    }
  },

  stopGeneration: () => {
    set({ isGenerating: false })
  },

  getCodeForSpec: (specId) => {
    return get().generatedCode.get(specId)
  },

  clearGeneration: () => {
    set({
      generatedCode: new Map(),
      workflow: [],
      progress: { completed: 0, total: 0, percentage: 0 },
      error: null,
    })
  },
}))
