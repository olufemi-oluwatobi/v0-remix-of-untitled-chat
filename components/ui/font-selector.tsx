"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const POPULAR_FONTS = [
  { name: "Inter", category: "Sans Serif" },
  { name: "Roboto", category: "Sans Serif" },
  { name: "Open Sans", category: "Sans Serif" },
  { name: "Lato", category: "Sans Serif" },
  { name: "Montserrat", category: "Sans Serif" },
  { name: "Poppins", category: "Sans Serif" },
  { name: "Raleway", category: "Sans Serif" },
  { name: "Ubuntu", category: "Sans Serif" },
  { name: "Playfair Display", category: "Serif" },
  { name: "Merriweather", category: "Serif" },
  { name: "Lora", category: "Serif" },
  { name: "PT Serif", category: "Serif" },
  { name: "Crimson Text", category: "Serif" },
  { name: "Fira Code", category: "Monospace" },
  { name: "JetBrains Mono", category: "Monospace" },
  { name: "Source Code Pro", category: "Monospace" },
  { name: "IBM Plex Mono", category: "Monospace" },
]

interface FontSelectorProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function FontSelector({ value, onChange, label }: FontSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal bg-transparent"
          >
            <span style={{ fontFamily: value }}>{value || "Select font..."}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search fonts..." />
            <CommandList>
              <CommandEmpty>No font found.</CommandEmpty>
              <ScrollArea className="h-[300px]">
                <CommandGroup heading="Sans Serif">
                  {POPULAR_FONTS.filter((f) => f.category === "Sans Serif").map((font) => (
                    <CommandItem
                      key={font.name}
                      value={font.name}
                      onSelect={() => {
                        onChange(font.name)
                        setOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === font.name ? "opacity-100" : "opacity-0")} />
                      <span style={{ fontFamily: font.name }} className="text-base">
                        {font.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Serif">
                  {POPULAR_FONTS.filter((f) => f.category === "Serif").map((font) => (
                    <CommandItem
                      key={font.name}
                      value={font.name}
                      onSelect={() => {
                        onChange(font.name)
                        setOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === font.name ? "opacity-100" : "opacity-0")} />
                      <span style={{ fontFamily: font.name }} className="text-base">
                        {font.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandGroup heading="Monospace">
                  {POPULAR_FONTS.filter((f) => f.category === "Monospace").map((font) => (
                    <CommandItem
                      key={font.name}
                      value={font.name}
                      onSelect={() => {
                        onChange(font.name)
                        setOpen(false)
                      }}
                      className="cursor-pointer"
                    >
                      <Check className={cn("mr-2 h-4 w-4", value === font.name ? "opacity-100" : "opacity-0")} />
                      <span style={{ fontFamily: font.name }} className="text-base">
                        {font.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
