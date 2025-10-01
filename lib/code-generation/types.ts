export interface GenerationTask {
  id: string
  type: "style-guide" | "page" | "component" | "integration" | "routing" | "validation"
  status: "pending" | "in-progress" | "completed" | "failed"
  priority: number
  specId: string
  dependencies: string[] // Task IDs this task depends on
  output?: GeneratedCode
  error?: string
  createdAt: string
  completedAt?: string
}

export interface GeneratedCode {
  files: GeneratedFile[]
  dependencies: string[]
  metadata: {
    specId: string
    specHash: string
    generatedAt: string
    model: string
    tokensUsed?: number
  }
}

export interface GeneratedFile {
  path: string
  content: string
  type: "component" | "page" | "style" | "config" | "api" | "util"
}

export interface GenerationContext {
  specMap: any
  styleGuide?: any
  existingCode?: Map<string, GeneratedCode>
  changedSpecs: string[]
}

export interface WorkflowStep {
  name: string
  description: string
  tasks: GenerationTask[]
  status: "pending" | "in-progress" | "completed" | "failed"
}
