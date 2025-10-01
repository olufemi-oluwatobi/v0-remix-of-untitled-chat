"use client"

import type React from "react"

import { useState } from "react"
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
import { PromptBuilder } from "@/components/editor/prompt-builder"
import { useWorkspaceStore, type Page } from "@/lib/store/use-workspace-store"
import { generateDummyComponent } from "@/lib/utils/dummy-component-generator"
import { Sparkles, Library, ChevronLeft } from "lucide-react"
import { useComponentLibraryContext } from "@/components/providers/component-library-provider"
import type { ComponentCategory } from "@/lib/hooks/use-component-library"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddComponentWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type WizardStep = "choose-source" | "library" | "custom"

export function AddComponentWizard({ open, onOpenChange }: AddComponentWizardProps) {
  const { addSpec, setSelectedItem, openTab } = useWorkspaceStore()
  const componentLibrary = useComponentLibraryContext()
  const [step, setStep] = useState<WizardStep>("choose-source")
  const [name, setName] = useState("")
  const [prompt, setPrompt] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>("ui")

  const handleReset = () => {
    setStep("choose-source")
    setName("")
    setPrompt("")
    setSelectedCategory("ui")
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const componentName = name || "CustomComponent"
    const generated = generateDummyComponent(prompt, componentName)
    const id = `component-${Date.now()}`

    addSpec<Page>("pages", {
      id,
      name: componentName,
      type: "component",
      icon: "Box",
      mainPrompt: prompt,
      referenceIds: [],
      componentSource: "custom",
      code: generated.code,
      props: generated.props,
      category: "ui",
    })

    openTab({
      id,
      type: "Components",
      title: componentName,
      itemId: id,
      content: null,
    })
    setSelectedItem(id)

    console.log("[v0] Created custom component:", { id, name: componentName, prompt })

    handleReset()
    onOpenChange(false)
  }

  const handleLibrarySelect = (componentId: string) => {
    const libraryComponent = componentLibrary.getComponent(componentId)
    if (!libraryComponent) {
      console.log("[v0] Library component not found:", componentId)
      return
    }

    const id = `component-${Date.now()}`
    const componentName = libraryComponent.name

    addSpec<Page>("pages", {
      id,
      name: componentName,
      type: "component",
      icon: "Box",
      mainPrompt: libraryComponent.mainPrompt,
      referenceIds: [],
      componentSource: "built-in",
      builtInComponentId: componentId,
      code: `// Component from library: ${componentName}`,
      props: libraryComponent.props || {},
      category: libraryComponent.category || "ui",
    })

    openTab({
      id,
      type: "Components",
      title: componentName,
      itemId: id,
      content: null,
    })
    setSelectedItem(id)

    console.log("[v0] Added library component:", { id, name: componentName, builtInComponentId: componentId })

    handleReset()
    onOpenChange(false)
  }

  const canSubmitCustom = !!name && !!prompt

  const categories: { id: ComponentCategory; label: string }[] = [
    { id: "ui", label: "UI Components" },
    { id: "form", label: "Form Elements" },
    { id: "layout", label: "Layout" },
    { id: "data", label: "Data Display" },
    { id: "navigation", label: "Navigation" },
    { id: "custom", label: "Custom" },
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handleReset()
        onOpenChange(open)
      }}
    >
      <DialogContent className="max-w-4xl max-h-[80vh]">
        {step === "choose-source" && (
          <>
            <DialogHeader>
              <DialogTitle>Add Component</DialogTitle>
              <DialogDescription>Choose how you want to add a component to your workspace</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-6">
              <Card
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setStep("library")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Library className="w-5 h-5 text-blue-600" />
                    Component Library
                  </CardTitle>
                  <CardDescription>Browse and select from pre-built components</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Choose from a collection of ready-to-use components with predefined styles and functionality.
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setStep("custom")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Custom Component
                  </CardTitle>
                  <CardDescription>Generate a component with AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Describe your component and we'll generate it with styling and live preview.
                  </p>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "library" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep("choose-source")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Library className="w-5 h-5 text-blue-600" />
                Component Library
              </DialogTitle>
              <DialogDescription>Browse and select components from your library</DialogDescription>
            </DialogHeader>

            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ComponentCategory)}>
              <TabsList className="grid w-full grid-cols-6">
                {categories.map((cat) => (
                  <TabsTrigger key={cat.id} value={cat.id}>
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    {componentLibrary.getComponentsByCategory(cat.id).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Library className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No components in this category yet</p>
                        <p className="text-sm text-muted-foreground mt-2">Components you create will appear here</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {componentLibrary.getComponentsByCategory(cat.id).map((component) => (
                          <Card
                            key={component.id}
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => handleLibrarySelect(component.id)}
                          >
                            <CardHeader>
                              <CardTitle className="text-base">{component.name}</CardTitle>
                              <CardDescription className="text-sm">{component.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="bg-muted rounded-md p-4 min-h-[100px] flex items-center justify-center">
                                <p className="text-xs text-muted-foreground">Component Preview</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("choose-source")}>
                Back
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "custom" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setStep("choose-source")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Sparkles className="w-5 h-5 text-purple-600" />
                Create Custom Component
              </DialogTitle>
              <DialogDescription>
                Describe your component and we'll generate it with styling and live preview
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCustomSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Component Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., PricingCard, HeroSection, FeatureGrid"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Describe Your Component</Label>
                <p className="text-sm text-muted-foreground">
                  Be specific about layout, colors, and functionality. Mention any buttons, titles, lists, or images you
                  want.
                </p>
                <PromptBuilder
                  value={prompt}
                  onChange={setPrompt}
                  placeholder="Example: A modern pricing card with a gradient background, featuring a plan name at the top, a large price display, a list of 5 features with checkmarks, and a prominent call-to-action button at the bottom. Use blue and purple colors."
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("choose-source")}>
                  Back
                </Button>
                <Button type="submit" disabled={!canSubmitCustom}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Component
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
