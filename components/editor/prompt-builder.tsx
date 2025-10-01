"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Mention from "@tiptap/extension-mention"
import { useEffect, useState } from "react"
import { useWorkspaceStore } from "@/lib/store/use-workspace-store"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import "./prompt-builder.css"

interface PromptBuilderProps {
  value: string
  onChange: (value: string) => void
  onReferencesChange?: (references: string[]) => void
  placeholder?: string
  onCleanup?: () => void
}

export function PromptBuilder({ value, onChange, onReferencesChange, placeholder, onCleanup }: PromptBuilderProps) {
  const { specMap } = useWorkspaceStore()
  const [mentionItems, setMentionItems] = useState<any[]>([])

  // Build mention items from all specs
  useEffect(() => {
    const items = [
      ...specMap.pages.map((p) => ({
        id: p.id,
        label: p.name,
        type: p.type,
        icon: p.icon,
      })),
      ...specMap.contexts.map((c) => ({
        id: c.id,
        label: c.name,
        type: "context",
        icon: "FileText",
      })),
      ...specMap.assets.map((a) => ({
        id: a.id,
        label: a.name,
        type: a.type,
        icon: "Image",
      })),
      ...specMap.styles.map((s) => ({
        id: s.id,
        label: s.name,
        type: "style",
        icon: "Palette",
      })),
    ]
    setMentionItems(items)
  }, [specMap])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          items: ({ query }) => {
            return mentionItems.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
          },
          render: () => {
            let component: any
            let popup: any

            return {
              onStart: (props: any) => {
                component = document.createElement("div")
                component.className = "mention-suggestions"

                const items = props.items.map((item: any) => {
                  const div = document.createElement("div")
                  div.className = "mention-item"
                  div.textContent = `${item.label} (${item.type})`
                  div.addEventListener("click", () => {
                    props.command({ id: item.id, label: item.label })
                  })
                  return div
                })

                items.forEach((item: any) => component.appendChild(item))

                if (props.clientRect) {
                  popup = {
                    getBoundingClientRect: props.clientRect,
                  }
                }

                document.body.appendChild(component)
              },

              onUpdate(props: any) {
                component.innerHTML = ""
                const items = props.items.map((item: any) => {
                  const div = document.createElement("div")
                  div.className = "mention-item"
                  div.textContent = `${item.label} (${item.type})`
                  div.addEventListener("click", () => {
                    props.command({ id: item.id, label: item.label })
                  })
                  return div
                })

                items.forEach((item: any) => component.appendChild(item))
              },

              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  component.remove()
                  return true
                }
                return false
              },

              onExit() {
                if (component) {
                  component.remove()
                }
              },
            }
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)

      // Extract mentioned IDs for references
      const mentions = editor.getJSON().content?.flatMap((node: any) => {
        if (node.type === "paragraph") {
          return (
            node.content?.filter((child: any) => child.type === "mention").map((child: any) => child.attrs.id) || []
          )
        }
        return []
      })

      if (onReferencesChange && mentions) {
        onReferencesChange([...new Set(mentions)])
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
          "prose-p:text-foreground prose-headings:text-foreground",
          "prose-strong:text-foreground prose-code:text-foreground",
        ),
      },
    },
  })

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Use <code className="bg-muted px-1 py-0.5 rounded">@</code> to mention references
        </span>
        {onCleanup && (
          <Button variant="ghost" size="sm" className="h-7 gap-1.5" onClick={onCleanup}>
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs">Clean up with AI</span>
          </Button>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
