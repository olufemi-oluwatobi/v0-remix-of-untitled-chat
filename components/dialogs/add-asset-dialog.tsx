"use client"

import { useState } from "react"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Wand2, ImageIcon, FileText, Music, Video } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AddAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  const { addSpec, setSelectedItem, openTab } = useWorkspaceStore()
  const [name, setName] = useState("")
  const [assetType, setAssetType] = useState<"image" | "video" | "audio" | "document">("image")
  const [uploadMethod, setUploadMethod] = useState<"upload" | "generate">("upload")
  const [fileUrl, setFileUrl] = useState("")
  const [generatePrompt, setGeneratePrompt] = useState("")

  const handleCreate = () => {
    if (!name.trim()) return

    const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newAsset = {
      id, // Add the generated ID
      name: name.trim(),
      type: assetType,
      link: uploadMethod === "upload" ? fileUrl : `/placeholder.svg?query=${encodeURIComponent(generatePrompt)}`,
      metadata: {
        createdAt: new Date().toISOString(),
        method: uploadMethod,
        ...(uploadMethod === "generate" && { prompt: generatePrompt }),
      },
    }

    addSpec("assets", newAsset)
    setSelectedItem(id)
    openTab({ id, title: name.trim(), type: "Assets", itemId: id, content: null })

    // Reset form
    setName("")
    setFileUrl("")
    setGeneratePrompt("")
    setAssetType("image")
    setUploadMethod("upload")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>Upload an existing asset or generate one using AI</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input
              id="asset-name"
              placeholder="e.g., Hero Image, Logo, Background Music"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Asset Type</Label>
            <RadioGroup value={assetType} onValueChange={(v: any) => setAssetType(v)}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="image" id="type-image" />
                  <Label htmlFor="type-image" className="flex items-center gap-2 cursor-pointer flex-1">
                    <ImageIcon className="w-4 h-4" />
                    Image
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="video" id="type-video" />
                  <Label htmlFor="type-video" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Video className="w-4 h-4" />
                    Video
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="audio" id="type-audio" />
                  <Label htmlFor="type-audio" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Music className="w-4 h-4" />
                    Audio
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="document" id="type-document" />
                  <Label htmlFor="type-document" className="flex items-center gap-2 cursor-pointer flex-1">
                    <FileText className="w-4 h-4" />
                    Document
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Tabs value={uploadMethod} onValueChange={(v: any) => setUploadMethod(v)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Generate with AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="file-url">File URL</Label>
                <Input
                  id="file-url"
                  placeholder="https://example.com/image.png or paste file path"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Enter a URL or file path for your asset</p>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Support for images, videos, audio, and documents</p>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="generate-prompt">Describe what you want to generate</Label>
                <textarea
                  id="generate-prompt"
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                  placeholder="e.g., A modern abstract background with blue and purple gradients, minimalist hero image for a tech startup, professional headshot photo..."
                  value={generatePrompt}
                  onChange={(e) => setGeneratePrompt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Our AI will generate an asset based on your description</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  AI Generation Tips
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Be specific about colors, style, and mood</li>
                  <li>Mention the intended use case</li>
                  <li>Include composition details if needed</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create Asset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
