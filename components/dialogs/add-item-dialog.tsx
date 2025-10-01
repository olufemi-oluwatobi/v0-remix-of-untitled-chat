"use client"

import type React from "react"

import { useState } from "react"
import {
  useWorkspaceStore,
  type StyleGuide,
  type Page,
  type Context,
  type Template,
} from "@/lib/store/use-workspace-store"
import type { SidebarSelection } from "@/lib/specification/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddAssetDialog } from "./add-asset-dialog"
import { AddComponentWizard } from "./add-component-wizard"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: SidebarSelection
}

export function AddItemDialog({ open, onOpenChange, section }: AddItemDialogProps) {
  const { addSpec, setSelectedItem } = useWorkspaceStore()
  const [name, setName] = useState("")
  const [type, setType] = useState<"text" | "image">("text")
  const [content, setContent] = useState("")
  const [link, setLink] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"page" | "component" | "layout" | "feature">("page")
  const [componentCategory, setComponentCategory] = useState<"ui" | "form" | "layout" | "data" | "navigation">("ui")
  const [componentSource, setComponentSource] = useState<"built-in" | "custom">("built-in")
  const [selectedBuiltInComponent, setSelectedBuiltInComponent] = useState<string>("")

  if (section === "Components") {
    return <AddComponentWizard open={open} onOpenChange={onOpenChange} />
  }

  if (section === "Assets") {
    return <AddAssetDialog open={open} onOpenChange={onOpenChange} />
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const id = `${section.toLowerCase()}-${Date.now()}`

    switch (section) {
      case "Styles":
        addSpec<StyleGuide>("styles", {
          id,
          name: name || "New Style Guide",
          themeMode: "light",
          colors: {
            light: {
              primary: "#3b82f6",
              secondary: "#8b5cf6",
              accent: "#10b981",
              background: "#ffffff",
              surface: "#f9fafb",
              text: "#111827",
            },
            dark: {
              primary: "#60a5fa",
              secondary: "#a78bfa",
              accent: "#34d399",
              background: "#111827",
              surface: "#1f2937",
              text: "#f9fafb",
            },
            custom: [],
          },
          typography: {
            heading: "Inter",
            body: "Inter",
            code: "JetBrains Mono",
          },
          spacing: 4,
          borderRadius: 8,
          animations: [],
        })
        break

      case "Views":
        addSpec<Page>("pages", {
          id,
          name: name || "New Page",
          type: "page",
          icon: "FileText",
          mainPrompt: "",
          referenceIds: [],
        })
        break

      case "Contexts":
        addSpec<Context>("contexts", {
          id,
          name: name || "New Context",
          type,
          content: content || "",
          link: link || undefined,
        })
        break

      case "Templates":
        addSpec<Template>("templates", {
          id,
          name: name || "New Template",
          description: description || "",
          category,
          mainPrompt: "",
          referenceIds: [],
          tags: [],
        })
        break
    }

    setSelectedItem(id)
    setName("")
    setContent("")
    setLink("")
    setDescription("")
    setCategory("page")
    setComponentCategory("ui")
    setComponentSource("built-in")
    setSelectedBuiltInComponent("")
    onOpenChange(false)
  }

  const getDialogContent = () => {
    switch (section) {
      case "Styles":
        return (
          <>
            <DialogDescription>Create a new style guide with default theme settings.</DialogDescription>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Theme"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </>
        )

      case "Views":
        return (
          <>
            <DialogDescription>Create a new page for your application.</DialogDescription>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="e.g., Home Page" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
          </>
        )

      case "Contexts":
        return (
          <>
            <DialogDescription>Add context information like documentation or references.</DialogDescription>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Design System Docs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as "text" | "image")}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {type === "text" ? (
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter your context information..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="link">Image URL</Label>
                  <Input
                    id="link"
                    placeholder="https://example.com/image.png"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
              )}
            </div>
          </>
        )

      case "Templates":
        return (
          <>
            <DialogDescription>Create a reusable template for pages, components, or layouts.</DialogDescription>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dashboard Layout"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as any)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="layout">Layout</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this template does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New {section === "Views" ? "Page" : section.slice(0, -1)}</DialogTitle>
          </DialogHeader>
          {getDialogContent()}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={section === "Components" && componentSource === "built-in" && !selectedBuiltInComponent}
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
