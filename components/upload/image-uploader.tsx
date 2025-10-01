"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, LinkIcon, X, ImageIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
}

export function ImageUploader({ value, onChange, onRemove }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [linkInput, setLinkInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((file) => file.type.startsWith("image/"))

      if (imageFile) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onChange(event.target.result as string)
          }
        }
        reader.readAsDataURL(imageFile)
      }
    },
    [onChange],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            onChange(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [onChange],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items)
      const imageItem = items.find((item) => item.type.startsWith("image/"))

      if (imageItem) {
        const file = imageItem.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            if (event.target?.result) {
              onChange(event.target.result as string)
            }
          }
          reader.readAsDataURL(file)
        }
      }
    },
    [onChange],
  )

  const handleLinkSubmit = () => {
    if (linkInput.trim()) {
      onChange(linkInput.trim())
      setLinkInput("")
    }
  }

  if (value) {
    return (
      <Card className="relative overflow-hidden">
        <img src={value || "/placeholder.svg"} alt="Uploaded" className="w-full h-auto" />
        {onRemove && (
          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={onRemove}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </Card>
    )
  }

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="link">Link</TabsTrigger>
      </TabsList>
      <TabsContent value="upload" className="space-y-4">
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
        >
          <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Drop image here or click to upload</p>
              <p className="text-xs text-muted-foreground">You can also paste an image (Ctrl+V)</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Choose File
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
          </div>
        </Card>
      </TabsContent>
      <TabsContent value="link" className="space-y-4">
        <div className="space-y-2">
          <Label>Image URL</Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
            />
            <Button onClick={handleLinkSubmit} className="gap-2">
              <LinkIcon className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
