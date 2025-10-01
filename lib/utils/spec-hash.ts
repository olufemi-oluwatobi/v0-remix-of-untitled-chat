import type { SpecMap } from "@/lib/store/use-workspace-store"

/**
 * Generates a deterministic hash from a spec map state
 * This hash uniquely identifies the current state of the specification
 */
export async function generateSpecHash(specMap: SpecMap): Promise<string> {
  // Create a normalized representation of the spec map
  const normalized = normalizeSpecMap(specMap)

  // Convert to JSON string for hashing
  const jsonString = JSON.stringify(normalized)

  // Use Web Crypto API to generate SHA-256 hash
  const encoder = new TextEncoder()
  const data = encoder.encode(jsonString)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

/**
 * Normalizes the spec map by removing metadata that doesn't affect code generation
 * and sorting arrays to ensure consistent hashing
 */
function normalizeSpecMap(specMap: SpecMap): any {
  return {
    styles: specMap.styles
      .map((style) => ({
        id: style.id,
        name: style.name,
        themeMode: style.themeMode,
        colors: style.colors,
        typography: style.typography,
        spacing: style.spacing,
        borderRadius: style.borderRadius,
        animations: style.animations,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),

    pages: specMap.pages
      .map((page) => ({
        id: page.id,
        name: page.name,
        type: page.type,
        mainPrompt: page.mainPrompt,
        referenceIds: page.referenceIds.sort(),
        category: page.category,
        componentSource: page.componentSource,
        builtInComponentId: page.builtInComponentId,
        props: page.props,
        styling: page.styling,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),

    contexts: specMap.contexts
      .map((context) => ({
        id: context.id,
        name: context.name,
        type: context.type,
        content: context.content,
        mainPrompt: context.mainPrompt,
        referenceIds: context.referenceIds?.sort(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),

    assets: specMap.assets
      .map((asset) => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        link: asset.link,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),

    templates: specMap.templates
      .map((template) => ({
        id: template.id,
        name: template.name,
        category: template.category,
        mainPrompt: template.mainPrompt,
        referenceIds: template.referenceIds.sort(),
        tags: template.tags.sort(),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
  }
}

/**
 * Generates a hash for a specific page/component within the spec map
 * Useful for caching individual component code
 */
export async function generatePageHash(specMap: SpecMap, pageId: string): Promise<string> {
  const page = specMap.pages.find((p) => p.id === pageId)
  if (!page) {
    throw new Error(`Page with id ${pageId} not found`)
  }

  // Include the page itself and all its references
  const relevantData = {
    page: {
      id: page.id,
      name: page.name,
      type: page.type,
      mainPrompt: page.mainPrompt,
      referenceIds: page.referenceIds.sort(),
      category: page.category,
      componentSource: page.componentSource,
      builtInComponentId: page.builtInComponentId,
      props: page.props,
      styling: page.styling,
    },
    // Include referenced contexts
    contexts: specMap.contexts
      .filter((c) => page.referenceIds.includes(c.id))
      .map((c) => ({
        id: c.id,
        content: c.content,
        type: c.type,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    // Include referenced assets
    assets: specMap.assets
      .filter((a) => page.referenceIds.includes(a.id))
      .map((a) => ({
        id: a.id,
        link: a.link,
        type: a.type,
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    // Include active style guide
    styles: specMap.styles.map((s) => ({
      colors: s.colors,
      typography: s.typography,
      spacing: s.spacing,
      borderRadius: s.borderRadius,
    })),
  }

  const jsonString = JSON.stringify(relevantData)
  const encoder = new TextEncoder()
  const data = encoder.encode(jsonString)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)

  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}
