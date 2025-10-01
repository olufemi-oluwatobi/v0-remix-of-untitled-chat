import { Sparkles, FileText, Box, Palette, BookOpen, ImageIcon, Layout } from "lucide-react"

const sections = [
  { id: "Views" as const, label: "Views", icon: FileText },
  { id: "Components" as const, label: "Components", icon: Box },
  { id: "Styles" as const, label: "Styles", icon: Palette },
  { id: "Contexts" as const, label: "Contexts", icon: BookOpen },
  { id: "Assets" as const, label: "Assets", icon: ImageIcon },
  { id: "Templates" as const, label: "Templates", icon: Layout },
  { id: "AI Generator" as const, label: "AI Generator", icon: Sparkles },
]
