import type { GenerationTask, GenerationContext, WorkflowStep } from "./types"

export class TaskManager {
  private tasks: Map<string, GenerationTask> = new Map()
  private workflow: WorkflowStep[] = []

  /**
   * Create generation workflow from spec map
   */
  createWorkflow(context: GenerationContext): WorkflowStep[] {
    this.workflow = []
    this.tasks.clear()

    // Step 1: Generate Style Guide (no dependencies)
    const styleStep = this.createStyleGuideStep(context)
    if (styleStep.tasks.length > 0) {
      this.workflow.push(styleStep)
    }

    // Step 2: Generate Components (depends on style guide)
    const componentStep = this.createComponentStep(context)
    if (componentStep.tasks.length > 0) {
      this.workflow.push(componentStep)
    }

    // Step 3: Generate Pages (depends on components and style guide)
    const pageStep = this.createPageStep(context)
    if (pageStep.tasks.length > 0) {
      this.workflow.push(pageStep)
    }

    // Step 4: Generate Integrations and Config
    const integrationStep = this.createIntegrationStep(context)
    if (integrationStep.tasks.length > 0) {
      this.workflow.push(integrationStep)
    }

    return this.workflow
  }

  /**
   * Create style guide generation step
   */
  private createStyleGuideStep(context: GenerationContext): WorkflowStep {
    const tasks: GenerationTask[] = []
    const { specMap, changedSpecs } = context

    for (const style of specMap.styles || []) {
      // Only generate if changed or no existing code
      if (changedSpecs.includes(style.id) || !context.existingCode?.has(style.id)) {
        const task: GenerationTask = {
          id: `task-${style.id}`,
          type: "style-guide",
          status: "pending",
          priority: 1, // Highest priority
          specId: style.id,
          dependencies: [],
          createdAt: new Date().toISOString(),
        }
        tasks.push(task)
        this.tasks.set(task.id, task)
      }
    }

    return {
      name: "Style Guide Generation",
      description: "Generate global styles and theme configuration",
      tasks,
      status: "pending",
    }
  }

  /**
   * Create component generation step
   */
  private createComponentStep(context: GenerationContext): WorkflowStep {
    const tasks: GenerationTask[] = []
    const { specMap, changedSpecs } = context

    // Get style guide task IDs as dependencies
    const styleDeps = Array.from(this.tasks.values())
      .filter((t) => t.type === "style-guide")
      .map((t) => t.id)

    const components = (specMap.pages || []).filter((p: any) => p.type === "component")

    for (const component of components) {
      if (changedSpecs.includes(component.id) || !context.existingCode?.has(component.id)) {
        const task: GenerationTask = {
          id: `task-${component.id}`,
          type: "component",
          status: "pending",
          priority: 2,
          specId: component.id,
          dependencies: styleDeps,
          createdAt: new Date().toISOString(),
        }
        tasks.push(task)
        this.tasks.set(task.id, task)
      }
    }

    return {
      name: "Component Generation",
      description: "Generate reusable React components",
      tasks,
      status: "pending",
    }
  }

  /**
   * Create page generation step
   */
  private createPageStep(context: GenerationContext): WorkflowStep {
    const tasks: GenerationTask[] = []
    const { specMap, changedSpecs } = context

    // Get component and style task IDs as dependencies
    const deps = Array.from(this.tasks.values())
      .filter((t) => t.type === "component" || t.type === "style-guide")
      .map((t) => t.id)

    const pages = (specMap.pages || []).filter((p: any) => p.type === "page")

    for (const page of pages) {
      if (changedSpecs.includes(page.id) || !context.existingCode?.has(page.id)) {
        const task: GenerationTask = {
          id: `task-${page.id}`,
          type: "page",
          status: "pending",
          priority: 3,
          specId: page.id,
          dependencies: deps,
          createdAt: new Date().toISOString(),
        }
        tasks.push(task)
        this.tasks.set(task.id, task)
      }
    }

    return {
      name: "Page Generation",
      description: "Generate Next.js page components",
      tasks,
      status: "pending",
    }
  }

  /**
   * Create integration and config step
   */
  private createIntegrationStep(context: GenerationContext): WorkflowStep {
    const tasks: GenerationTask[] = []

    // This step would handle things like:
    // - API routes
    // - Database schemas
    // - Auth configuration
    // - Environment variables
    // For now, we'll leave it empty

    return {
      name: "Integration & Configuration",
      description: "Generate API routes, configs, and integrations",
      tasks,
      status: "pending",
    }
  }

  /**
   * Get next task to execute
   */
  getNextTask(): GenerationTask | null {
    const pendingTasks = Array.from(this.tasks.values())
      .filter((t) => t.status === "pending")
      .filter((t) => {
        // Check if all dependencies are completed
        return t.dependencies.every((depId) => {
          const dep = this.tasks.get(depId)
          return dep?.status === "completed"
        })
      })
      .sort((a, b) => a.priority - b.priority)

    return pendingTasks[0] || null
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: GenerationTask["status"], result?: any, error?: string): void {
    const task = this.tasks.get(taskId)
    if (task) {
      task.status = status
      if (result) task.result = result
      if (error) task.error = error
      if (status === "completed") task.completedAt = new Date().toISOString()
      this.tasks.set(taskId, task)
      this.updateWorkflowStatus()
    }
  }

  /**
   * Update workflow step status based on tasks
   */
  private updateWorkflowStatus(): void {
    for (const step of this.workflow) {
      if (step.tasks.every((t) => t.status === "completed")) {
        step.status = "completed"
      } else if (step.tasks.some((t) => t.status === "failed")) {
        step.status = "failed"
      } else if (step.tasks.some((t) => t.status === "in-progress")) {
        step.status = "in-progress"
      }
    }
  }

  /**
   * Get workflow progress
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    const total = this.tasks.size
    const completed = Array.from(this.tasks.values()).filter((t) => t.status === "completed").length
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  }

  /**
   * Get current workflow
   */
  getWorkflow(): WorkflowStep[] {
    return this.workflow
  }

  /**
   * Get all tasks
   */
  getAllTasks(): GenerationTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Check if workflow is complete
   */
  isComplete(): boolean {
    return this.tasks.size > 0 && Array.from(this.tasks.values()).every((t) => t.status === "completed")
  }

  /**
   * Reset workflow
   */
  reset(): void {
    this.tasks.clear()
    this.workflow = []
  }
}

// Singleton instance
export const taskManager = new TaskManager()
