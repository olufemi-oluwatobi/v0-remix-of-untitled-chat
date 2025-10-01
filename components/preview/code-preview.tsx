"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Eye, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CodePreviewProps {
  code?: string
  props?: Record<string, any>
  onCodeChange?: (code: string) => void
  onPropsChange?: (props: Record<string, any>) => void
}

export function CodePreview({ code = "", props = {}, onCodeChange, onPropsChange }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "props">("preview")
  const [propsJson, setPropsJson] = useState(JSON.stringify(props, null, 2))

  const handlePropsUpdate = () => {
    try {
      const parsed = JSON.parse(propsJson)
      onPropsChange?.(parsed)
    } catch (e) {
      console.error("Invalid JSON:", e)
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="props" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Props
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {code ? (
                <Card className="p-6 bg-muted/30">
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Component Preview</div>
                    <div className="p-4 bg-background rounded-lg border border-border">
                      <pre className="text-xs overflow-auto">
                        <code>{code}</code>
                      </pre>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Note: Live component rendering will be available in a future update. For now, you can view the
                      code structure.
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Eye className="w-12 h-12 opacity-20" />
                    <p className="text-sm">No code to preview yet</p>
                    <p className="text-xs">Add component code in the Code tab to see a preview</p>
                  </div>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="props" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Component Props (JSON)</Label>
                <Textarea
                  value={propsJson}
                  onChange={(e) => setPropsJson(e.target.value)}
                  placeholder='{\n  "title": "Hello World",\n  "variant": "primary"\n}'
                  className="font-mono text-sm min-h-[300px] resize-none"
                />
              </div>
              <Button onClick={handlePropsUpdate} className="w-full">
                Update Props
              </Button>
              <div className="text-xs text-muted-foreground">
                Define sample props to test your component with different data
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="code" className="flex-1 m-0 p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <Textarea
                value={code}
                onChange={(e) => onCodeChange?.(e.target.value)}
                placeholder="Enter your component code here..."
                className="font-mono text-sm min-h-[400px] resize-none"
              />
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
