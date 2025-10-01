"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ImageIcon,
  Upload,
  X,
  Lightbulb,
  Check,
  Palette,
  Wand2,
  Loader2,
  Copy,
} from "lucide-react"
import type { Context, Asset, StyleGuide } from "@/lib/store/use-workspace-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const steps = [
  { id: "context", title: "Context", description: "Share your app vision" },
  { id: "assets", title: "Assets", description: "Upload resources" },
  { id: "style", title: "Style", description: "Define aesthetics" },
  { id: "generate", title: "Generate", description: "AI creates spec" },
]

export function OnboardingCanvas() {
  const [currentStep, setCurrentStep] = useState(0)
  const { completeOnboarding, onboardingData, updateOnboardingData } = useWorkspaceStore()
  const [showContextGuide, setShowContextGuide] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSkip = () => {
    completeOnboarding()
  }

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === steps.length - 1) {
      // Generate spec
      setIsGenerating(true)
      try {
        const response = await fetch("/api/generate-spec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(onboardingData),
        })
        const data = await response.json()
        console.log("[v0] Generated spec:", data)
      } catch (error) {
        console.error("[v0] Error generating spec:", error)
      } finally {
        setIsGenerating(false)
        completeOnboarding()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return onboardingData.contexts.length > 0
      case 1:
      case 2:
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Progress bar */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">Setup Your Workspace</h1>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Setup
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                        index < currentStep
                          ? "bg-primary text-primary-foreground"
                          : index === currentStep
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-muted text-muted-foreground"
                      }`}
                      initial={false}
                      animate={{
                        scale: index === currentStep ? 1.05 : 1,
                      }}
                    >
                      {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                    </motion.div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-medium">{step.title}</div>
                      <div className="text-[10px] text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                  <div className="h-0.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{
                        width: index <= currentStep ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                {index < steps.length - 1 && <div className="w-4 h-0.5 bg-border hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && <ContextStepContent onShowGuide={() => setShowContextGuide(true)} />}
              {currentStep === 1 && <AssetStepContent />}
              {currentStep === 2 && <StyleStepContent />}
              {currentStep === 3 && <GenerateStepContent isGenerating={isGenerating} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer with navigation */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0 || isGenerating}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </div>

          <Button onClick={handleNext} disabled={!canProceed() || isGenerating} className="gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                Complete
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      <ContextGuideDialog open={showContextGuide} onOpenChange={setShowContextGuide} />
    </div>
  )
}

function ContextStepContent({ onShowGuide }: { onShowGuide: () => void }) {
  const { onboardingData, updateOnboardingData } = useWorkspaceStore()
  const [contextText, setContextText] = useState("")
  const [images, setImages] = useState<{ id: string; url: string; file: File }[]>([])

  const handleAddContext = () => {
    if (!contextText.trim() && images.length === 0) return

    const newContexts: Context[] = []

    // Add text context if provided
    if (contextText.trim()) {
      newContexts.push({
        id: `context-${Date.now()}`,
        name: "App Context",
        type: "text",
        content: contextText.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      })
    }

    // Add image contexts
    images.forEach((img, index) => {
      newContexts.push({
        id: `context-img-${Date.now()}-${index}`,
        name: `Reference Image ${index + 1}`,
        type: "image",
        content: img.url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        previousStates: [],
        currentStateIndex: 0,
      })
    })

    updateOnboardingData({
      contexts: [...onboardingData.contexts, ...newContexts],
    })

    setContextText("")
    setImages([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random()}`,
            url: reader.result as string,
            file,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const removeContext = (id: string) => {
    updateOnboardingData({
      contexts: onboardingData.contexts.filter((c) => c.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-balance">Paste full context of the app</h2>
        <p className="text-sm text-muted-foreground text-pretty max-w-2xl mx-auto">
          Share your vision, goals, and any reference materials. The more context you provide, the better AI can help
          you.
        </p>
      </div>

      {/* Main input area */}
      <Card className="p-6 space-y-4">
        <Textarea
          placeholder="Paste your app description, requirements, user stories, or any relevant information here...

Example: I'm building a task management app for remote teams. It should have a clean, modern interface with drag-and-drop functionality, real-time collaboration, and mobile support. The design should feel professional but approachable."
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          rows={12}
          className="resize-none text-sm"
        />

        {/* Image upload area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Reference Images (Optional)</label>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                <Upload className="w-3.5 h-3.5 mr-2" />
                Upload Images
              </label>
            </Button>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden border">
                  <img src={img.url || "/placeholder.svg"} alt="Reference" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleAddContext} disabled={!contextText.trim() && images.length === 0} className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Add Context
          </Button>
          <Button variant="outline" onClick={onShowGuide}>
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Context Guide
          </Button>
        </div>
      </Card>

      {/* Added contexts */}
      {onboardingData.contexts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Added Contexts ({onboardingData.contexts.length})</h3>
          <div className="space-y-2">
            {onboardingData.contexts.map((context) => (
              <Card key={context.id} className="p-4 relative group">
                <button
                  onClick={() => removeContext(context.id)}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-background border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {context.type === "text" ? (
                  <p className="text-sm text-muted-foreground line-clamp-3 pr-8">{context.content}</p>
                ) : (
                  <img
                    src={context.content || "/placeholder.svg"}
                    alt={context.name}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AssetStepContent() {
  const { onboardingData, updateOnboardingData } = useWorkspaceStore()
  const [assets, setAssets] = useState<{ id: string; url: string; file: File; type: string }[]>([])

  const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAssets((prev) => [
          ...prev,
          {
            id: `asset-${Date.now()}-${Math.random()}`,
            url: reader.result as string,
            file,
            type: file.type.startsWith("image/") ? "image" : "file",
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAddAssets = () => {
    const newAssets: Asset[] = assets.map((asset, index) => ({
      id: `asset-${Date.now()}-${index}`,
      name: asset.file.name,
      type: asset.type as "image" | "video" | "audio" | "file",
      link: asset.url,
      insights: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previousStates: [],
      currentStateIndex: 0,
    }))

    updateOnboardingData({
      assets: [...onboardingData.assets, ...newAssets],
    })

    setAssets([])
  }

  const removeAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  const removeAddedAsset = (id: string) => {
    updateOnboardingData({
      assets: onboardingData.assets.filter((a) => a.id !== id),
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-balance">Upload your assets</h2>
        <p className="text-sm text-muted-foreground text-pretty max-w-2xl mx-auto">
          Add logos, images, icons, or any visual resources you want to use in your app.
        </p>
      </div>

      <Card className="p-8 border-2 border-dashed">
        <label className="cursor-pointer flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            multiple
            onChange={handleAssetUpload}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm font-medium">Click to upload assets</div>
            <div className="text-xs text-muted-foreground">Images, videos, or audio files</div>
          </div>
        </label>

        {assets.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="text-sm font-medium">Selected Files ({assets.length})</div>
            <div className="grid grid-cols-4 gap-3">
              {assets.map((asset) => (
                <div key={asset.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                  {asset.type === "image" ? (
                    <img
                      src={asset.url || "/placeholder.svg"}
                      alt={asset.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <button
                    onClick={() => removeAsset(asset.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Button onClick={handleAddAssets} className="w-full">
              Add {assets.length} Asset{assets.length > 1 ? "s" : ""}
            </Button>
          </div>
        )}
      </Card>

      {onboardingData.assets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Added Assets ({onboardingData.assets.length})</h3>
          <div className="grid grid-cols-4 gap-3">
            {onboardingData.assets.map((asset) => (
              <div key={asset.id} className="relative group aspect-square rounded-lg overflow-hidden border">
                <img src={asset.link || "/placeholder.svg"} alt={asset.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeAddedAsset(asset.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StyleStepContent() {
  const { onboardingData, updateOnboardingData } = useWorkspaceStore()
  const [selectedStyle, setSelectedStyle] = useState<string>("modern")

  const stylePresets = [
    { id: "modern", name: "Modern", colors: ["#3b82f6", "#8b5cf6", "#ec4899"] },
    { id: "minimal", name: "Minimal", colors: ["#000000", "#ffffff", "#6b7280"] },
    { id: "warm", name: "Warm", colors: ["#f59e0b", "#ef4444", "#dc2626"] },
    { id: "cool", name: "Cool", colors: ["#06b6d4", "#0ea5e9", "#3b82f6"] },
    { id: "nature", name: "Nature", colors: ["#10b981", "#059669", "#047857"] },
    { id: "elegant", name: "Elegant", colors: ["#8b7355", "#a0826d", "#6b9080"] },
  ]

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
    const preset = stylePresets.find((s) => s.id === styleId)
    if (preset) {
      updateOnboardingData({
        styleGuide: {
          name: `${preset.name} Theme`,
          colors: {
            light: {
              primary: preset.colors[0],
              secondary: preset.colors[1],
              accent: preset.colors[2],
              background: "#ffffff",
              surface: "#f9fafb",
              text: "#111827",
            },
            dark: {
              primary: preset.colors[0],
              secondary: preset.colors[1],
              accent: preset.colors[2],
              background: "#111827",
              surface: "#1f2937",
              text: "#f9fafb",
            },
            custom: [],
          },
        } as Partial<StyleGuide>,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-balance">Choose your style</h2>
        <p className="text-sm text-muted-foreground text-pretty max-w-2xl mx-auto">
          Select a style preset that matches your vision. You can customize it later.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stylePresets.map((preset) => (
          <Card
            key={preset.id}
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              selectedStyle === preset.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleStyleSelect(preset.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{preset.name}</span>
              </div>
              <div className="flex gap-2">
                {preset.colors.map((color, index) => (
                  <div key={index} className="w-full h-12 rounded-md" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function GenerateStepContent({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-balance">Ready to generate your workspace</h2>
        <p className="text-sm text-muted-foreground text-pretty max-w-2xl mx-auto">
          AI will analyze your context, assets, and style preferences to create a comprehensive specification for your
          app.
        </p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {isGenerating ? (
              <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
            ) : (
              <Wand2 className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">
              {isGenerating ? "Generating your workspace..." : "Click Complete to start"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {isGenerating
                ? "This may take a moment. AI is analyzing your inputs and creating pages, components, and styles."
                : "AI will create a complete specification including pages, components, and design system based on your inputs."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ContextGuideDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const contextQuestions = [
    {
      category: "Project Overview",
      questions: [
        "What is the main purpose of your app?",
        "Who is your target audience?",
        "What problem does it solve?",
        "What are the key features you need?",
      ],
    },
    {
      category: "User Experience",
      questions: [
        "What should users be able to do?",
        "What's the typical user journey?",
        "Are there different user roles or permissions?",
        "What devices will users primarily use?",
      ],
    },
    {
      category: "Design & Branding",
      questions: [
        "What feeling should the design evoke?",
        "Do you have brand colors or guidelines?",
        "Are there any design references you like?",
        "Should it be minimal, bold, playful, professional?",
      ],
    },
    {
      category: "Technical Requirements",
      questions: [
        "Do you need user authentication?",
        "Will you need a database?",
        "Are there any third-party integrations?",
        "Do you need real-time features?",
      ],
    },
  ]

  const copyToClipboard = () => {
    const text = contextQuestions
      .map((section) => `${section.category}:\n${section.questions.map((q) => `- ${q}`).join("\n")}`)
      .join("\n\n")

    navigator.clipboard.writeText(text)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Context Guide
          </DialogTitle>
          <DialogDescription>
            Use these questions with ChatGPT or Claude to gather comprehensive context for your app. Copy and paste them
            into your conversation.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {contextQuestions.map((section) => (
              <div key={section.category} className="space-y-3">
                <h3 className="font-semibold text-sm">{section.category}</h3>
                <ul className="space-y-2">
                  {section.questions.map((question, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Button onClick={copyToClipboard} className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copy All Questions
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
