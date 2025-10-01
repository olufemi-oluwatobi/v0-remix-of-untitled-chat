"use client"

import type React from "react"

import { useState } from "react"
import { Button as ButtonComponent } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Component, StyleProps } from "./use-workspace-store"

// Define component categories
export type ComponentCategory = "ui" | "form" | "layout" | "data" | "navigation" | "custom"

// Extended component interface with category
export interface LibraryComponent extends Omit<Component, "type" | "category"> {
  category: ComponentCategory
  description: string
  component: React.ComponentType<any>
  styleMap?: Record<string, StyleProps>
}

// Component library state
interface ComponentLibraryState {
  components: Record<string, LibraryComponent>
  categories: Record<ComponentCategory, string[]>
}

// Initial state
const initialState: ComponentLibraryState = {
  components: {},
  categories: {
    ui: [],
    form: [],
    layout: [],
    data: [],
    navigation: [],
    custom: [],
  },
}

export const useComponentLibrary = () => {
  const [state, setState] = useState<ComponentLibraryState>(initialState)

  // Register a new component
  const registerComponent = (
    id: string,
    component: React.ComponentType<any>,
    options: {
      name: string
      category?: ComponentCategory
      description?: string
      defaultProps?: Record<string, any>
      styleMap?: Record<string, StyleProps>
    },
  ) => {
    const category = options.category || "ui"

    const newComponent: LibraryComponent = {
      id,
      name: options.name,
      component,
      description: options.description || "",
      props: options.defaultProps || {},
      category,
      styleMap: options.styleMap,
      referenceIds: [],
      mainPrompt: `Create a ${options.name} component`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previousStates: [],
      currentStateIndex: 0,
    }

    setState((prev) => {
      // Don't register if component already exists
      if (prev.components[id]) return prev

      return {
        ...prev,
        components: {
          ...prev.components,
          [id]: newComponent,
        },
        categories: {
          ...prev.categories,
          [category]: [...(prev.categories[category] || []), id],
        },
      }
    })

    return newComponent
  }

  // Get a component by ID
  const getComponent = (id: string): LibraryComponent | undefined => {
    return state.components[id]
  }

  // Get all components in a category
  const getComponentsByCategory = (category: ComponentCategory): LibraryComponent[] => {
    return (state.categories[category] || []).map((id) => state.components[id]).filter(Boolean)
  }

  // Get all components
  const getAllComponents = (): LibraryComponent[] => {
    return Object.values(state.components)
  }

  // Create a component instance with props
  // ... (lines 100-111 remain the same)

  // Create a component instance with props
  // Get a component by ID

  // Create a component instance with props
  // const createComponent = (id: string, props: Record<string, any> = {}): React.ReactNode => {
  //   const component = getComponent(id);
  //   if (!component) return null;

  //   // FIX: component.component is already of type React.ComponentType<any>,
  //   // so we can assign it directly without any assertions.
  //   const Compo = component.component as React.ComponentType<any>;

  //   // The type of ComponentReact is now correct, and can be used in JSX.

  //   // @ts-ignore
  //   return <Compo {...props} />;
  // };

  // ... (rest of the code remains the same)

  // Get style map for a component
  const getStyleMap = (id: string): Record<string, StyleProps> | undefined => {
    return state.components[id]?.styleMap
  }

  // Register built-in components
  const registerBuiltInComponents = () => {
    // Register Button component
    registerComponent("button", ButtonComponent, {
      name: "Button",
      category: "ui",
      description: "A versatile button component with multiple variants",
      defaultProps: {
        variant: "default",
        size: "default",
        children: "Click me",
      },
      styleMap: {
        root: {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          borderRadius: "0.375rem",
          border: "none",
        },
      },
    })

    // Register Card component
    registerComponent("card", Card, {
      name: "Card",
      category: "ui",
      description: "A card container for grouping related content",
      defaultProps: {
        className: "w-[350px]",
      },
      styleMap: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
        },
      },
    })

    // Register Input component
    registerComponent("input", Input, {
      name: "Input",
      category: "form",
      description: "A text input field for forms",
      defaultProps: {
        type: "text",
        placeholder: "Enter text...",
      },
      styleMap: {
        root: {
          backgroundColor: "#ffffff",
          borderRadius: "0.375rem",
          border: "1px solid #d1d5db",
        },
      },
    })

    // Register Label component
    registerComponent("label", Label, {
      name: "Label",
      category: "form",
      description: "A label for form inputs",
      defaultProps: {
        children: "Label",
      },
      styleMap: {
        root: {
          color: "#374151",
        },
      },
    })
  }

  // Initialize with built-in components
  const initialize = () => {
    registerBuiltInComponents()
  }

  return {
    // State
    components: state.components,
    categories: state.categories,

    // Methods
    registerComponent,
    getComponent,
    getComponentsByCategory,
    getAllComponents,
    // createComponent,
    getStyleMap,
    initialize,
  }
}

// Create a singleton instance
let componentLibrary: ReturnType<typeof useComponentLibrary> | null = null

export const getComponentLibrary = () => {
  if (!componentLibrary) {
    const hook = useComponentLibrary
    componentLibrary = {
      ...hook(),
      // Override to allow usage outside React components
      initialize: () => {
        const instance = hook()
        instance.initialize()
        componentLibrary = {
          ...instance,
          initialize: componentLibrary!.initialize,
        }
      },
    }
  }
  return componentLibrary
}

// Types
export type ComponentLibrary = ReturnType<typeof useComponentLibrary>
export type { StyleProps }
