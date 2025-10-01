import type { BaseSpec } from "./baseSpec" // Assuming BaseSpec is declared in another file

export type SidebarSelection = "Views" | "Components" | "Styles" | "Contexts" | "Assets" | "Templates"

export type SpecificationEngine = {}

export interface AssetInsight {
  id: string
  text: string
  category: "quality" | "usage" | "accessibility" | "optimization" | "general"
  createdAt: string
}

export interface Asset extends BaseSpec {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document"
  link?: string
  metadata?: Record<string, any>
  insights?: AssetInsight[]
}
