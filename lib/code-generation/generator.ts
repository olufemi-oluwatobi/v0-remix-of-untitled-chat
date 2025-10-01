import { generateText } from "ai"
import { promptManager } from "./prompts/prompt-manager"
import { changeDetector } from "./change-detector"
import { taskManager } from "./task-manager"
import { CodeManager } from "./code-manager"
import type { GeneratedCode, GeneratedFile, GenerationContext } from "./types"

export class CodeGenerator {
  private apiKey?: string
  private model = "gpt-4o"
  private codeManager: CodeManager = new CodeManager()

  configure(apiKey: string, model = "gpt-4o") {
    this.apiKey = apiKey
    this.model = model
  }

  initializeCodeManager(existingCode?: Map<string, GeneratedCode>) {
    if (existingCode) {
      const files = Array.from(existingCode.values()).flatMap((code) =>
        code.files.map((file) => ({
          path: file.path,
          content: file.content,
          hash: changeDetector.hashSpec(file.content),
          lastModified: Date.now(),
          type: file.type,
        })),
      )
      this.codeManager = new CodeManager(files)
    } else {
      this.codeManager = new CodeManager()
    }
  }

  async generate(
    specMap: any,
    previousSpecMap?: any,
    existingCode?: Map<string, GeneratedCode>,
  ): Promise<Map<string, GeneratedCode>> {
    console.log("[v0] Starting code generation...")

    this.initializeCodeManager(existingCode)

    // Detect changes
    const changedSpecs = previousSpecMap ? changeDetector.detectChanges(specMap, previousSpecMap) : []
    console.log(`[v0] Detected ${changedSpecs.length} changed specs:`, changedSpecs)

    // Create generation context
    const context: GenerationContext = {
      specMap,
      styleGuide: specMap.styles,
      existingCode,
      changedSpecs,
    }

    // Create workflow tasks
    const tasks = taskManager.createWorkflow(context)
    console.log(`[v0] Created ${tasks.length} generation tasks`)

    // Execute tasks in order
    const generatedCode = new Map<string, GeneratedCode>()

    for (const task of tasks) {
      try {
        console.log(`[v0] Executing task: ${task.type} for ${task.specId}`)
        taskManager.updateTaskStatus(task.id, "in-progress")

        const code = await this.executeTask(task, context, generatedCode)
        generatedCode.set(task.specId, code)

        taskManager.updateTaskStatus(task.id, "completed", code)
        console.log(`[v0] Completed task: ${task.type} for ${task.specId}`)
      } catch (error) {
        console.error(`[v0] Task failed: ${task.type} for ${task.specId}`, error)
        taskManager.updateTaskStatus(
          task.id,
          "failed",
          undefined,
          error instanceof Error ? error.message : "Unknown error",
        )
      }
    }

    console.log(`[v0] CodeManager operations:`, this.codeManager.getOperations())

    return generatedCode
  }

  private async executeTask(
    task: any,
    context: GenerationContext,
    generatedCode: Map<string, GeneratedCode>,
  ): Promise<GeneratedCode> {
    // Check if we can reuse existing code
    if (context.existingCode && !context.changedSpecs.includes(task.specId)) {
      const existing = context.existingCode.get(task.specId)
      if (existing) {
        console.log(`[v0] Reusing existing code for ${task.specId}`)
        return existing
      }
    }

    // Generate based on task type
    switch (task.type) {
      case "style-guide":
        return this.generateStyleGuide(context.styleGuide)
      case "component":
        return this.generateComponent(task.specId, context, generatedCode)
      case "page":
        return this.generatePage(task.specId, context, generatedCode)
      default:
        throw new Error(`Unknown task type: ${task.type}`)
    }
  }

  private generateStyleGuide(styleGuide: any): GeneratedCode {
    console.log("[v0] Generating style guide (template-based)...")

    const cssContent = this.styleGuideToCss(styleGuide)
    const filePath = "app/globals.css"

    if (this.codeManager.hasFile(filePath)) {
      this.codeManager.updateFile(filePath, cssContent)
    } else {
      this.codeManager.addFile(filePath, cssContent, "style")
    }

    return {
      files: [
        {
          path: filePath,
          content: cssContent,
          type: "style",
        },
      ],
      dependencies: [],
      metadata: {
        specId: "style-guide",
        specHash: changeDetector.hashSpec(styleGuide),
        generatedAt: new Date().toISOString(),
        model: "template",
      },
    }
  }

  private async generateComponent(
    specId: string,
    context: GenerationContext,
    generatedCode: Map<string, GeneratedCode>,
  ): Promise<GeneratedCode> {
    console.log(`[v0] Generating component: ${specId}`)

    const componentSpec = context.specMap.pages.find((p: any) => p.id === specId)
    if (!componentSpec) {
      throw new Error(`Component spec not found: ${specId}`)
    }

    // Get referenced components
    const referencedComponents = this.getReferencedComponents(componentSpec, context.specMap)

    const prompt = promptManager.getComponentPrompt(componentSpec, context.styleGuide, referencedComponents)

    const { text } = await generateText({
      model: this.model,
      system: promptManager.getSystemPrompt(),
      prompt,
    })

    const files = this.parseGeneratedCode(text, componentSpec)

    for (const file of files) {
      if (this.codeManager.hasFile(file.path)) {
        this.codeManager.updateFile(file.path, file.content)
      } else {
        this.codeManager.addFile(file.path, file.content, file.type)
      }
    }

    return {
      files,
      dependencies: referencedComponents.map((c: any) => c.id),
      metadata: {
        specId,
        specHash: changeDetector.hashSpec(componentSpec),
        generatedAt: new Date().toISOString(),
        model: this.model,
      },
    }
  }

  private async generatePage(
    specId: string,
    context: GenerationContext,
    generatedCode: Map<string, GeneratedCode>,
  ): Promise<GeneratedCode> {
    console.log(`[v0] Generating page: ${specId}`)

    const pageSpec = context.specMap.pages.find((p: any) => p.id === specId)
    if (!pageSpec) {
      throw new Error(`Page spec not found: ${specId}`)
    }

    // Get referenced components and contexts
    const referencedComponents = this.getReferencedComponents(pageSpec, context.specMap)
    const referencedContexts = this.getReferencedContexts(pageSpec, context.specMap)

    const prompt = promptManager.getPagePrompt(pageSpec, context.styleGuide, referencedComponents, referencedContexts)

    const { text } = await generateText({
      model: this.model,
      system: promptManager.getSystemPrompt(),
      prompt,
    })

    const files = this.parseGeneratedCode(text, pageSpec)

    for (const file of files) {
      if (this.codeManager.hasFile(file.path)) {
        this.codeManager.updateFile(file.path, file.content)
      } else {
        this.codeManager.addFile(file.path, file.content, file.type)
      }
    }

    return {
      files,
      dependencies: [...referencedComponents.map((c: any) => c.id), ...referencedContexts.map((c: any) => c.id)],
      metadata: {
        specId,
        specHash: changeDetector.hashSpec(pageSpec),
        generatedAt: new Date().toISOString(),
        model: this.model,
      },
    }
  }

  private parseGeneratedCode(generatedText: string, spec: any): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // Extract code blocks with file paths from AI response
    // Format: \`\`\`tsx file="path/to/file.tsx"
    const fileBlockRegex = /```(\w+)\s+file="([^"]+)"\s*\n([\s\S]*?)```/g
    let match

    while ((match = fileBlockRegex.exec(generatedText)) !== null) {
      const [, , filePath, content] = match

      // Determine file type from path
      let type: GeneratedFile["type"] = "component"
      if (filePath.includes("/page.tsx")) type = "page"
      else if (filePath.includes(".css")) type = "style"
      else if (filePath.includes("/api/")) type = "api"
      else if (filePath.includes("/lib/") || filePath.includes("/utils/")) type = "util"
      else if (filePath.includes("config")) type = "config"

      files.push({
        path: filePath,
        content: content.trim(),
        type,
      })
    }

    // If no file blocks found, create a default file
    if (files.length === 0) {
      const defaultPath =
        spec.type === "page"
          ? `app${spec.route}/page.tsx`
          : `components/${spec.name.toLowerCase().replace(/\s+/g, "-")}.tsx`

      files.push({
        path: defaultPath,
        content: generatedText.trim(),
        type: spec.type === "page" ? "page" : "component",
      })
    }

    console.log(`[v0] Parsed ${files.length} files from generated code`)
    return files
  }

  private styleGuideToCss(styleGuide: any): string {
    const { colors = {}, typography = {}, spacing = {}, effects = {} } = styleGuide

    return `@import 'tailwindcss';

@theme inline {
  /* Colors */
${Object.entries(colors)
  .map(([key, value]) => `  --color-${key}: ${value};`)
  .join("\n")}

  /* Typography */
${typography.fontFamily ? `  --font-sans: ${typography.fontFamily};` : ""}
${typography.headingFont ? `  --font-heading: ${typography.headingFont};` : ""}
${typography.monoFont ? `  --font-mono: ${typography.monoFont};` : ""}

  /* Spacing */
${Object.entries(spacing)
  .map(([key, value]) => `  --spacing-${key}: ${value};`)
  .join("\n")}

  /* Effects */
${effects.borderRadius ? `  --radius: ${effects.borderRadius};` : ""}
${effects.shadow ? `  --shadow: ${effects.shadow};` : ""}
}

/* Base Styles */
body {
  font-family: var(--font-sans, system-ui, sans-serif);
  color: var(--color-foreground, #000);
  background: var(--color-background, #fff);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading, var(--font-sans, system-ui, sans-serif));
}
`
  }

  private getReferencedComponents(spec: any, specMap: any): any[] {
    const componentIds = spec.components || []
    return specMap.pages.filter((p: any) => componentIds.includes(p.id) && p.type === "component")
  }

  private getReferencedContexts(spec: any, specMap: any): any[] {
    const contextIds = spec.contexts || []
    return specMap.pages.filter((p: any) => contextIds.includes(p.id) && p.type === "context")
  }

  getCodeManager(): CodeManager {
    return this.codeManager
  }

  exportForSandbox(): Record<string, string> {
    return this.codeManager.exportForSandbox()
  }

  getWorkflow() {
    return taskManager.getWorkflow()
  }

  getProgress() {
    return taskManager.getProgress()
  }
}

export const codeGenerator = new CodeGenerator()
