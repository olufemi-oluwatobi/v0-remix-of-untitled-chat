import { SYSTEM_PROMPT, STYLE_GUIDE_PROMPT, PAGE_PROMPT, COMPONENT_PROMPT } from "./system-prompt"

export class PromptManager {
  private customPrompts: Map<string, string> = new Map()

  /**
   * Get the system prompt for code generation
   */
  getSystemPrompt(): string {
    return this.customPrompts.get("system") || SYSTEM_PROMPT
  }

  /**
   * Get prompt for style guide generation
   */
  getStyleGuidePrompt(styleGuide: any): string {
    const template = this.customPrompts.get("style-guide") || STYLE_GUIDE_PROMPT
    return this.interpolate(template, { styleGuide: JSON.stringify(styleGuide, null, 2) })
  }

  /**
   * Get prompt for page generation
   */
  getPagePrompt(pageSpec: any, styleGuide: any, referencedComponents: any[], referencedContexts: any[]): string {
    const template = this.customPrompts.get("page") || PAGE_PROMPT
    return this.interpolate(template, {
      pageSpec: JSON.stringify(pageSpec, null, 2),
      styleGuide: JSON.stringify(styleGuide, null, 2),
      referencedComponents: JSON.stringify(referencedComponents, null, 2),
      referencedContexts: JSON.stringify(referencedContexts, null, 2),
    })
  }

  /**
   * Get prompt for component generation
   */
  getComponentPrompt(componentSpec: any, styleGuide: any, referencedComponents: any[]): string {
    const template = this.customPrompts.get("component") || COMPONENT_PROMPT
    return this.interpolate(template, {
      componentSpec: JSON.stringify(componentSpec, null, 2),
      styleGuide: JSON.stringify(styleGuide, null, 2),
      referencedComponents: JSON.stringify(referencedComponents, null, 2),
    })
  }

  /**
   * Register a custom prompt template
   */
  registerPrompt(key: string, template: string): void {
    this.customPrompts.set(key, template)
  }

  /**
   * Get all registered prompts
   */
  getAllPrompts(): Record<string, string> {
    return {
      system: this.getSystemPrompt(),
      "style-guide": this.customPrompts.get("style-guide") || STYLE_GUIDE_PROMPT,
      page: this.customPrompts.get("page") || PAGE_PROMPT,
      component: this.customPrompts.get("component") || COMPONENT_PROMPT,
    }
  }

  /**
   * Interpolate variables in template
   */
  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match
    })
  }
}

// Singleton instance
export const promptManager = new PromptManager()
