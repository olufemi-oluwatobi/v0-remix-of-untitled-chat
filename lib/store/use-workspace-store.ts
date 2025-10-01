import type React from "react"
import { create } from "zustand"
import type { SpecificationEngine } from "@/lib/specification/SpecificationEngine"
import type { SidebarSelection } from "@/lib/specification/types"
import type { CSSProperties } from "react"

const MAX_HISTORY_STACK = 5

export interface BaseSpec {
  id: string
  createdAt: string
  updatedAt: string
  previousStates: any[]
  currentStateIndex: number
}

export interface StyleGuide extends BaseSpec {
  name: string
  themeMode: "light" | "dark"
  colors: {
    light: {
      primary: string
      secondary: string
      accent: string
      background: string
      surface: string
      text: string
    }
    dark: {
      primary: string
      secondary: string
      accent: string
      background: string
      surface: string
      text: string
    }
    custom: {
      name: string
      value: string
    }[]
  }
  typography: {
    heading: string
    body: string
    code: string
  }
  spacing: number
  borderRadius: number
  animations: {
    name: string
    config: Record<string, any>
  }[]
}

export interface Page extends BaseSpec {
  name: string
  type: "page" | "component" | "folder" | "data-model" | "asset" | "style" | "ai-generation"
  icon: string
  mainPrompt: string
  referenceIds: string[]
  code?: string
  props?: Record<string, any>
  category?: "ui" | "form" | "layout" | "data" | "navigation"
  componentSource?: "built-in" | "custom"
  builtInComponentId?: string
  styling?: Record<string, any>
}

export interface StyleProps {
  borderRadius?: string
  spacing?: number
  backgroundColor?: string
  color?: string
  width?: string
  height?: string
  fontSize?: string
  fontWeight?: string
  fontFamily?: string
  boxShadow?: string
  border?: string
  opacity?: number
  zIndex?: number
}

export interface Component extends BaseSpec {
  name: string
  type: "component"
  mainPrompt: string
  referenceIds: string[]
  code?: string
  props?: Record<string, any>
  stylePropsMap?: Record<string, CSSProperties>
  category?: "ui" | "form" | "layout" | "data" | "navigation"
  componentSource?: "built-in" | "custom"
  builtInComponentId?: string
}

export interface BuiltInComponent {
  id: string
  name: string
  code?: string
  props?: Record<string, any>
  component: React.FC
}

export interface Template extends BaseSpec {
  name: string
  description: string
  category: "page" | "component" | "layout" | "feature"
  mainPrompt: string
  referenceIds: string[]
  previewImage?: string
  tags: string[]
}

export interface Context extends BaseSpec {
  name: string
  link?: string
  type: "text" | "image"
  content: string
  mainPrompt?: string
  referenceIds?: string[]
  analysis?: {
    points: {
      text: string
      color?: string
      position?: { x: number; y: number }
    }[]
    summary: string
  }
}

export interface Asset extends BaseSpec {
  id: string
  name: string
  type: "image" | "video" | "audio" | "file"
  link: string
  insights?: AssetInsight[]
  analysis?: {
    points: {
      text: string
      color?: string
      position?: { x: number; y: number }
    }[]
    summary: string
  }
}

export interface AssetInsight {
  id: string
  text: string
  category: "quality" | "usage" | "accessibility" | "optimization" | "general"
  createdAt: string
}

export interface ExplorerItem {
  id: string
  name: string
  type: "page" | "component" | "folder" | "data-model" | "asset" | "style"
  icon: string
  children?: ExplorerItem[]
  parentId?: string
}

export interface Tab {
  id: string
  type: "Views" | "Components" | "Styles" | "Contexts" | "Assets" | "Templates" | "AI Generator"
  title: string
  itemId: string
  content: any
  isActive: boolean
  isDirty?: boolean
}

export interface SpecMap {
  styles: StyleGuide[]
  pages: Page[]
  components: Component[]
  contexts: Context[]
  assets: Asset[]
  templates: Template[]
}

interface WorkspaceState {
  currentSection: SidebarSelection
  currentPage: string | null
  explorerItems: ExplorerItem[]
  selectedItem: string | null
  isSidebarOpen: boolean
  viewMode: "design" | "code" | "both" | "preview"
  filterType: string
  engine: SpecificationEngine | null
  tabs: Tab[]
  activeTabId: string | null
  specMap: SpecMap
  showOnboarding: boolean
  onboardingData: {
    contexts: Context[]
    assets: Asset[]
    styleGuide: Partial<StyleGuide> | null
  }

  // Generic CRUD operations
  addSpec: <T extends BaseSpec>(type: keyof SpecMap, spec: Omit<T, "previousStates" | "currentStateIndex">) => void
  updateSpec: <T extends BaseSpec>(
    type: keyof SpecMap,
    id: string,
    updates: Partial<Omit<T, "id" | "createdAt" | "previousStates" | "currentStateIndex">>,
  ) => void
  deleteSpec: (type: keyof SpecMap, id: string) => void
  getSpec: <T extends BaseSpec>(type: keyof SpecMap, id: string) => T | undefined
  renameSpec: (type: keyof SpecMap, id: string, newName: string) => void

  // Per-spec version control
  undoSpec: (type: keyof SpecMap, id: string) => void
  redoSpec: (type: keyof SpecMap, id: string) => void
  canUndoSpec: (type: keyof SpecMap, id: string) => boolean
  canRedoSpec: (type: keyof SpecMap, id: string) => boolean

  // UI Actions
  setCurrentSection: (section: SidebarSelection) => void
  setCurrentPage: (pageId: string) => void
  setSelectedItem: (itemId: string | null) => void
  toggleSidebar: () => void
  setViewMode: (mode: "design" | "code" | "both" | "preview") => void
  setExplorerItems: (items: ExplorerItem[]) => void
  setFilterType: (filter: string) => void
  setEngine: (engine: SpecificationEngine | null) => void
  getEngine: () => SpecificationEngine | null
  // Tab actions
  openTab: (tab: Omit<Tab, "isActive">) => void
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTab: (tabId: string, updates: Partial<Tab>) => void

  setShowOnboarding: (show: boolean) => void
  updateOnboardingData: (data: Partial<WorkspaceState["onboardingData"]>) => void
  completeOnboarding: () => void

  reset: () => void
}

const defaultState = {
  currentSection: "Views" as const,
  currentPage: null,
  explorerItems: [],
  selectedItem: null,
  isSidebarOpen: true,
  viewMode: "design" as const,
  filterType: "all",
  engine: null,
  tabs: [] as Tab[],
  activeTabId: null,
  specMap: {
    styles: [
      {
        id: "style-default",
        name: "Default Theme",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        themeMode: "light" as const,
        colors: {
          light: {
            primary: "#8b7355",
            secondary: "#a0826d",
            accent: "#6b9080",
            background: "#faf8f5",
            surface: "#f5f1ed",
            text: "#2d2a26",
          },
          dark: {
            primary: "#c4a57b",
            secondary: "#d4b896",
            accent: "#8fb8a9",
            background: "#1a1816",
            surface: "#2d2a26",
            text: "#faf8f5",
          },
          custom: [
            { name: "Warm Beige", value: "#e8dfd3" },
            { name: "Deep Brown", value: "#4a3f35" },
          ],
        },
        typography: {
          heading: "Inter, sans-serif",
          body: "Inter, sans-serif",
          code: "JetBrains Mono, monospace",
        },
        spacing: 4,
        borderRadius: 8,
        animations: [],
        previousStates: [],
        currentStateIndex: 0,
      },
    ] as StyleGuide[],
    pages: [
      {
        id: "page-home",
        name: "Home Page",
        type: "page" as const,
        icon: "FileText",
        mainPrompt: "Main landing page",
        referenceIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      },
      {
        id: "component-button",
        name: "Button Component",
        type: "component" as const,
        icon: "Box",
        mainPrompt: "Reusable button component",
        referenceIds: [],
        category: "ui" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      },
    ] as Page[],
    components: [
      {
        id: "component-button",
        name: "Button Component",
        type: "component" as const,
        mainPrompt: "Reusable button component",
        referenceIds: [],
        stylePropsMap: {},
        props: {},
        category: "ui" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      },
    ] as Component[],
    contexts: [
      {
        id: "context-design",
        name: "Design Guidelines",
        type: "text" as const,
        content: "Follow the warm, academic aesthetic with rounded corners and soft shadows.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      },
    ] as Context[],
    assets: [
      {
        id: "asset-logo",
        name: "Logo",
        type: "image" as const,
        link: "/placeholder.svg?height=100&width=100",
        insights: [],
        analysis: {
          points: [],
          summary: "",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      },
    ] as Asset[],
    templates: [
      {
        id: "template-landing",
        name: "Landing Page",
        description: "A modern landing page with hero section, features, and CTA",
        category: "page" as const,
        mainPrompt: "Create a landing page with a hero section, feature highlights, testimonials, and call-to-action",
        referenceIds: [],
        tags: ["marketing", "hero", "cta"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      },
      {
        id: "template-dashboard",
        name: "Dashboard Layout",
        description: "A dashboard layout with sidebar navigation and content area",
        category: "layout" as const,
        mainPrompt: "Create a dashboard layout with sidebar navigation, header, and main content area with cards",
        referenceIds: [],
        tags: ["dashboard", "layout", "navigation"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      },
    ] as Template[],
  },
  showOnboarding: true,
  onboardingData: {
    contexts: [],
    assets: [],
    styleGuide: null,
  },
}

// Helper to get spec state without history metadata
const getSpecState = <T extends BaseSpec>(spec: T) => {
  const { previousStates, currentStateIndex, ...state } = spec
  return JSON.parse(JSON.stringify(state))
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  ...defaultState,

  addSpec: (type, spec) => {
    const now = new Date().toISOString()
    const newSpec = {
      ...spec,
      createdAt: spec.createdAt || now,
      updatedAt: spec.updatedAt || now,
      // @ts-ignore
      previousStates: [getSpecState({ ...spec, createdAt: now, updatedAt: now })],
      currentStateIndex: 0,
    }

    set((state) => ({
      specMap: {
        ...state.specMap,
        [type]: [...state.specMap[type], newSpec],
      },
    }))
  },

  updateSpec: (type, id, updates) => {
    const now = new Date().toISOString()

    set((state) => ({
      specMap: {
        ...state.specMap,
        [type]: state.specMap[type].map((item: BaseSpec) => {
          if (item.id !== id) return item

          const currentState = getSpecState(item)

          // If we're not at the latest state, clear future history
          let historyStack =
            item.currentStateIndex < item.previousStates.length - 1
              ? item.previousStates.slice(0, item.currentStateIndex + 1)
              : [...item.previousStates]

          // Add current state to history
          historyStack.push(currentState)

          // Keep only last 5 states
          if (historyStack.length > MAX_HISTORY_STACK) {
            historyStack = historyStack.slice(-MAX_HISTORY_STACK)
          }

          return {
            ...item,
            ...updates,
            updatedAt: now,
            previousStates: historyStack,
            currentStateIndex: historyStack.length - 1,
          }
        }),
      },
    }))
  },

  deleteSpec: (type, id) => {
    set((state) => ({
      specMap: {
        ...state.specMap,
        [type]: state.specMap[type].filter((item: BaseSpec) => item.id !== id),
      },
    }))
  },

  // @ts-ignore
  getSpec: (type, id) => {
    return get().specMap[type].find((item: BaseSpec) => item.id === id)
  },

  undoSpec: (type, id) => {
    set((state) => ({
      specMap: {
        ...state.specMap,
        [type]: state.specMap[type].map((item: BaseSpec) => {
          if (item.id !== id || item.currentStateIndex === 0) return item

          const prevIndex = item.currentStateIndex - 1
          const prevState = item.previousStates[prevIndex]

          return {
            ...prevState,
            previousStates: item.previousStates,
            currentStateIndex: prevIndex,
          }
        }),
      },
    }))
  },

  redoSpec: (type, id) => {
    set((state) => ({
      specMap: {
        ...state.specMap,
        [type]: state.specMap[type].map((item: BaseSpec) => {
          if (item.id !== id || item.currentStateIndex >= item.previousStates.length - 1) {
            return item
          }

          const nextIndex = item.currentStateIndex + 1
          const nextState = item.previousStates[nextIndex]

          return {
            ...nextState,
            previousStates: item.previousStates,
            currentStateIndex: nextIndex,
          }
        }),
      },
    }))
  },

  canUndoSpec: (type, id) => {
    const spec = get().getSpec(type, id)
    return spec ? spec.currentStateIndex > 0 : false
  },

  canRedoSpec: (type, id) => {
    const spec = get().getSpec(type, id)
    return spec ? spec.currentStateIndex < spec.previousStates.length - 1 : false
  },

  setCurrentSection: (section) =>
    set({
      currentSection: section,
      selectedItem: null,
      filterType: "all",
    }),

  setCurrentPage: (pageId) => set({ currentPage: pageId }),
  setSelectedItem: (itemId) => set({ selectedItem: itemId }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setExplorerItems: (items) => set({ explorerItems: items }),
  setFilterType: (filter) => set({ filterType: filter }),
  setEngine: (engine) => set({ engine }),
  getEngine: () => get().engine,

  openTab: (tab) =>
    set((state) => {
      const exists = state.tabs.some((t) => t.id === tab.id)
      if (exists) {
        return {
          tabs: state.tabs.map((t) => ({
            ...t,
            isActive: t.id === tab.id,
          })),
          activeTabId: tab.id,
        }
      }
      return {
        tabs: [...state.tabs.map((t) => ({ ...t, isActive: false })), { ...tab, isActive: true }],
        activeTabId: tab.id,
      }
    }),

  closeTab: (tabId) =>
    set((state) => {
      const newTabs = state.tabs.filter((tab) => tab.id !== tabId)
      const newActiveTabId = state.activeTabId === tabId ? newTabs[newTabs.length - 1]?.id || null : state.activeTabId
      return {
        tabs: newTabs,
        activeTabId: newActiveTabId,
      }
    }),

  setActiveTab: (tabId) =>
    set({
      tabs: get().tabs.map((tab) => ({
        ...tab,
        isActive: tab.id === tabId,
      })),
      activeTabId: tabId,
    }),

  updateTab: (tabId, updates) =>
    set({
      tabs: get().tabs.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab)),
    }),

  renameSpec: (type, id, newName) => {
    get().updateSpec(type, id, { name: newName } as any)

    // Also update the tab title if this item has an open tab
    const tab = get().tabs.find((t) => t.id === id)
    if (tab) {
      get().updateTab(id, { title: newName })
    }
  },

  setShowOnboarding: (show) => set({ showOnboarding: show }),

  updateOnboardingData: (data) =>
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        ...data,
      },
    })),

  completeOnboarding: () => {
    const { onboardingData } = get()

    // Add collected contexts to spec map
    onboardingData.contexts.forEach((context) => {
      get().addSpec("contexts", context)
    })

    // Add collected assets to spec map
    onboardingData.assets.forEach((asset) => {
      get().addSpec("assets", asset)
    })

    // Update style guide if provided
    if (onboardingData.styleGuide) {
      const defaultStyle = get().specMap.styles[0]
      if (defaultStyle) {
        get().updateSpec("styles", defaultStyle.id, onboardingData.styleGuide)
      }
    }

    // Hide onboarding
    set({ showOnboarding: false })
  },

  reset: () => set({ ...defaultState }),
}))
