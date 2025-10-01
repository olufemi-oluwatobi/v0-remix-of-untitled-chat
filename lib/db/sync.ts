import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { useChatStore } from "@/lib/store/use-chat-store"
import * as queries from "./queries"

// ============================================================================
// SYNC UTILITIES - Local-First Architecture
// ============================================================================

/**
 * Loads workspace data from database into Zustand stores
 * Call this on app initialization or workspace switch
 */
export async function loadWorkspaceData(workspaceId: string) {
  try {
    // Load all workspace content in parallel
    const [contexts, assets, styleGuides, pages, components] = await Promise.all([
      queries.getWorkspaceContexts(workspaceId),
      queries.getWorkspaceAssets(workspaceId),
      queries.getWorkspaceStyleGuides(workspaceId),
      queries.getWorkspacePages(workspaceId),
      queries.getWorkspaceComponents(workspaceId),
    ])

    // Update Zustand store with loaded data
    const store = useWorkspaceStore.getState()

    store.specMap.contexts = contexts
    store.specMap.assets = assets
    store.specMap.styles = styleGuides
    store.specMap.pages = pages
    store.specMap.components = components

    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to load workspace data:", error)
    return { success: false, error }
  }
}

/**
 * Syncs a single spec to the database
 * Called after Zustand store updates
 */
export async function syncSpecToDb(
  workspaceId: string,
  type: "contexts" | "assets" | "styles" | "pages" | "components",
  specId: string,
  operation: "create" | "update" | "delete",
) {
  try {
    const store = useWorkspaceStore.getState()
    const spec = store.getSpec(type, specId)

    if (operation === "delete") {
      // Handle deletion
      switch (type) {
        case "contexts":
          await queries.deleteContext(specId)
          break
        case "assets":
          await queries.deleteAsset(specId)
          break
        case "pages":
          await queries.deletePage(specId)
          break
        case "components":
          await queries.deleteComponent(specId)
          break
      }
      return { success: true }
    }

    if (!spec) {
      throw new Error(`Spec not found: ${type}/${specId}`)
    }

    // Handle create/update
    switch (type) {
      case "contexts":
        if (operation === "create") {
          await queries.createContext(workspaceId, spec as any)
        } else {
          await queries.updateContext(specId, spec as any)
        }
        break

      case "assets":
        if (operation === "create") {
          await queries.createAsset(workspaceId, spec as any)
        } else {
          await queries.updateAsset(specId, spec as any)
        }
        break

      case "styles":
        if (operation === "create") {
          await queries.createStyleGuide(workspaceId, spec as any)
        } else {
          await queries.updateStyleGuide(specId, spec as any)
        }
        break

      case "pages":
        if (operation === "create") {
          await queries.createPage(workspaceId, spec as any)
        } else {
          await queries.updatePage(specId, spec as any)
        }
        break

      case "components":
        if (operation === "create") {
          await queries.createComponent(workspaceId, spec as any)
        } else {
          await queries.updateComponent(specId, spec as any)
        }
        break
    }

    return { success: true }
  } catch (error) {
    console.error(`[v0] Failed to sync ${type}/${specId}:`, error)
    return { success: false, error }
  }
}

/**
 * Syncs chat messages to database
 */
export async function syncChatToDb(
  workspaceId: string,
  userId: string,
  chatId: string,
  operation: "create" | "add_message",
) {
  try {
    if (operation === "create") {
      const chatStore = useChatStore.getState()
      await queries.createChat({
        id: chatId,
        workspaceId,
        userId,
        title: "New Chat",
      })
    } else if (operation === "add_message") {
      const chatStore = useChatStore.getState()
      const lastMessage = chatStore.messages[chatStore.messages.length - 1]

      if (lastMessage) {
        await queries.createMessage({
          id: lastMessage.id,
          chatId,
          role: lastMessage.role,
          content: lastMessage.content,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to sync chat:", error)
    return { success: false, error }
  }
}

/**
 * Loads chat history from database
 */
export async function loadChatHistory(chatId: string) {
  try {
    const messages = await queries.getChatMessages(chatId)

    const chatStore = useChatStore.getState()
    chatStore.clearMessages()

    messages.forEach((msg) => {
      chatStore.addMessage({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Failed to load chat history:", error)
    return { success: false, error }
  }
}
