"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useComponentLibrary, type ComponentLibrary } from "@/lib/hooks/use-component-library"

const ComponentLibraryContext = createContext<ComponentLibrary | null>(null)

export function ComponentLibraryProvider({ children }: { children: ReactNode }) {
  const library = useComponentLibrary()

  useEffect(() => {
    // Initialize the library with built-in components
    library.initialize()
  }, [])

  return <ComponentLibraryContext.Provider value={library}>{children}</ComponentLibraryContext.Provider>
}

export function useComponentLibraryContext() {
  const context = useContext(ComponentLibraryContext)
  if (!context) {
    throw new Error("useComponentLibraryContext must be used within ComponentLibraryProvider")
  }
  return context
}
