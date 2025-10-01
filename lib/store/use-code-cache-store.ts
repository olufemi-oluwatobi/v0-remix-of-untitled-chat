import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CachedCode {
  hash: string
  pageId: string
  pageName: string
  code: string
  generatedAt: string
  specSnapshot: {
    mainPrompt: string
    referenceIds: string[]
    type: string
  }
}

export interface CodeCacheEntry {
  hash: string
  code: string
  pageId: string
  pageName: string
  generatedAt: string
  lastAccessedAt: string
  accessCount: number
  specSnapshot: {
    mainPrompt: string
    referenceIds: string[]
    type: string
  }
}

interface CodeCacheState {
  // Map of hash -> cached code entry
  cache: Map<string, CodeCacheEntry>

  // Map of pageId -> array of hashes (for history tracking)
  pageHistory: Map<string, string[]>

  // Actions
  getCachedCode: (hash: string) => CodeCacheEntry | undefined
  setCachedCode: (entry: Omit<CodeCacheEntry, "lastAccessedAt" | "accessCount">) => void
  getPageHistory: (pageId: string) => CodeCacheEntry[]
  clearCache: () => void
  removeCachedCode: (hash: string) => void
  getRecentCodes: (limit?: number) => CodeCacheEntry[]
  getCacheStats: () => {
    totalEntries: number
    totalPages: number
    mostUsedCode: CodeCacheEntry | null
    recentlyGenerated: CodeCacheEntry[]
  }
}

export const useCodeCacheStore = create<CodeCacheState>()(
  persist(
    (set, get) => ({
      cache: new Map(),
      pageHistory: new Map(),

      getCachedCode: (hash: string) => {
        const entry = get().cache.get(hash)
        if (entry) {
          // Update access tracking
          set((state) => {
            const newCache = new Map(state.cache)
            newCache.set(hash, {
              ...entry,
              lastAccessedAt: new Date().toISOString(),
              accessCount: entry.accessCount + 1,
            })
            return { cache: newCache }
          })
          return entry
        }
        return undefined
      },

      setCachedCode: (entry) => {
        const now = new Date().toISOString()
        const newEntry: CodeCacheEntry = {
          ...entry,
          lastAccessedAt: now,
          accessCount: 1,
        }

        set((state) => {
          const newCache = new Map(state.cache)
          newCache.set(entry.hash, newEntry)

          const newPageHistory = new Map(state.pageHistory)
          const pageHashes = newPageHistory.get(entry.pageId) || []

          // Add hash to page history if not already present
          if (!pageHashes.includes(entry.hash)) {
            newPageHistory.set(entry.pageId, [...pageHashes, entry.hash])
          }

          return {
            cache: newCache,
            pageHistory: newPageHistory,
          }
        })
      },

      getPageHistory: (pageId: string) => {
        const hashes = get().pageHistory.get(pageId) || []
        const cache = get().cache

        return hashes
          .map((hash) => cache.get(hash))
          .filter((entry): entry is CodeCacheEntry => entry !== undefined)
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      },

      clearCache: () => {
        set({ cache: new Map(), pageHistory: new Map() })
      },

      removeCachedCode: (hash: string) => {
        set((state) => {
          const newCache = new Map(state.cache)
          const entry = newCache.get(hash)
          newCache.delete(hash)

          const newPageHistory = new Map(state.pageHistory)
          if (entry) {
            const pageHashes = newPageHistory.get(entry.pageId) || []
            newPageHistory.set(
              entry.pageId,
              pageHashes.filter((h) => h !== hash),
            )
          }

          return {
            cache: newCache,
            pageHistory: newPageHistory,
          }
        })
      },

      getRecentCodes: (limit = 10) => {
        const cache = get().cache
        return Array.from(cache.values())
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
          .slice(0, limit)
      },

      getCacheStats: () => {
        const cache = get().cache
        const pageHistory = get().pageHistory
        const entries = Array.from(cache.values())

        const mostUsedCode =
          entries.length > 0
            ? entries.reduce((max, entry) => (entry.accessCount > max.accessCount ? entry : max))
            : null

        const recentlyGenerated = entries
          .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
          .slice(0, 5)

        return {
          totalEntries: cache.size,
          totalPages: pageHistory.size,
          mostUsedCode,
          recentlyGenerated,
        }
      },
    }),
    {
      name: "code-cache-storage",
      // Custom serialization for Map objects
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const { state } = JSON.parse(str)
          return {
            state: {
              ...state,
              cache: new Map(state.cache),
              pageHistory: new Map(state.pageHistory),
            },
          }
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              cache: Array.from(newValue.state.cache.entries()),
              pageHistory: Array.from(newValue.state.pageHistory.entries()),
            },
          })
          localStorage.setItem(name, str)
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
)
