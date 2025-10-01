"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { AlertCircle, ChevronDown } from "lucide-react"

interface LiveComponentPreviewProps {
  componentId: string
  props: Record<string, any>
}

export function LiveComponentPreview({ componentId, props }: LiveComponentPreviewProps) {
  const renderComponent = () => {
    switch (componentId) {
      case "button":
        return (
          <Button variant={props.variant || "default"} size={props.size || "default"}>
            {props.children || "Click me"}
          </Button>
        )

      case "card":
        return (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{props.title || "Card Title"}</CardTitle>
              <CardDescription>{props.description || "Card description"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{props.content || "Card content goes here"}</p>
            </CardContent>
          </Card>
        )

      case "badge":
        return <Badge variant={props.variant || "default"}>{props.children || "Badge"}</Badge>

      case "alert":
        return (
          <Alert variant={props.variant || "default"} className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{props.title || "Alert Title"}</AlertTitle>
            <AlertDescription>{props.description || "This is an alert message"}</AlertDescription>
          </Alert>
        )

      case "avatar":
        return (
          <Avatar>
            <AvatarImage src={props.src || "/placeholder.svg"} />
            <AvatarFallback>{props.fallback || "JD"}</AvatarFallback>
          </Avatar>
        )

      case "progress":
        return <Progress value={props.value || 50} className="w-full max-w-md" />

      case "skeleton":
        return <Skeleton style={{ width: props.width || "100%", height: props.height || "20px" }} />

      case "input":
        return (
          <div className="w-full max-w-md space-y-2">
            <Label>Input Field</Label>
            <Input type={props.type || "text"} placeholder={props.placeholder || "Enter text..."} />
          </div>
        )

      case "textarea":
        return (
          <div className="w-full max-w-md space-y-2">
            <Label>Textarea</Label>
            <Textarea rows={props.rows || 4} placeholder={props.placeholder || "Enter text..."} />
          </div>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox id="checkbox" checked={props.checked} />
            <Label htmlFor="checkbox">{props.label || "Accept terms"}</Label>
          </div>
        )

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch id="switch" checked={props.checked} />
            <Label htmlFor="switch">{props.label || "Enable notifications"}</Label>
          </div>
        )

      case "select":
        return (
          <div className="w-full max-w-md space-y-2">
            <Label>Select</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={props.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Option 1</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
                <SelectItem value="3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case "slider":
        return (
          <div className="w-full max-w-md space-y-2">
            <Label>Slider</Label>
            <Slider min={props.min || 0} max={props.max || 100} value={[props.value || 50]} />
          </div>
        )

      case "separator":
        return <Separator orientation={props.orientation || "horizontal"} className="my-4" />

      case "accordion":
        const accordionItems = props.items || [
          { title: "Item 1", content: "Content for item 1" },
          { title: "Item 2", content: "Content for item 2" },
        ]
        return (
          <Accordion type="single" collapsible className="w-full max-w-md">
            {accordionItems.map((item: any, index: number) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )

      case "tabs":
        const tabItems = props.tabs || [
          { label: "Tab 1", content: "Content for tab 1" },
          { label: "Tab 2", content: "Content for tab 2" },
          { label: "Tab 3", content: "Content for tab 3" },
        ]
        return (
          <Tabs defaultValue="tab-0" className="w-full max-w-md">
            <TabsList>
              {tabItems.map((tab: any, index: number) => (
                <TabsTrigger key={index} value={`tab-${index}`}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabItems.map((tab: any, index: number) => (
              <TabsContent key={index} value={`tab-${index}`}>
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        )

      case "collapsible":
        return (
          <Collapsible className="w-full max-w-md">
            <CollapsibleTrigger className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4" />
              {props.title || "Click to expand"}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">{props.content || "Hidden content"}</CollapsibleContent>
          </Collapsible>
        )

      case "table":
        const tableRows = props.rows || [
          { Name: "John Doe", Email: "john@example.com", Status: "Active" },
          { Name: "Jane Smith", Email: "jane@example.com", Status: "Active" },
          { Name: "Bob Johnson", Email: "bob@example.com", Status: "Inactive" },
        ]
        const columns = tableRows.length > 0 ? Object.keys(tableRows[0]) : []
        return (
          <Table className="w-full max-w-2xl">
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead key={col}>{col}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row: any, i: number) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col}>{row[col]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )

      case "pagination":
        return (
          <Pagination>
            <PaginationContent>
              {Array.from({ length: Math.min(props.totalPages || 5, 5) }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink isActive={i + 1 === (props.currentPage || 1)}>{i + 1}</PaginationLink>
                </PaginationItem>
              ))}
            </PaginationContent>
          </Pagination>
        )

      case "breadcrumb":
        const breadcrumbItems = props.items || [
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: "Details", href: "/products/details" },
        ]
        return (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item: any, index: number) => (
                <>
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink>{item.label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator key={`sep-${index}`} />}
                </>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )

      case "navigation-menu":
        const navItems = props.items || [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Contact", href: "/contact" },
        ]
        return (
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item: any, index: number) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink>{item.label}</NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        )

      case "dropdown-menu":
        const dropdownItems = props.items || [
          { label: "Profile", action: "profile" },
          { label: "Settings", action: "settings" },
          { label: "Logout", action: "logout" },
        ]
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{props.trigger || "Menu"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {dropdownItems.map((item: any, index: number) => (
                <DropdownMenuItem key={index}>{item.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )

      default:
        return (
          <div className="text-center text-muted-foreground p-8">
            <p>Component preview not available</p>
          </div>
        )
    }
  }

  return (
    <div className="w-full flex items-center justify-center p-8 bg-muted/30 rounded-lg border border-border min-h-[200px]">
      {renderComponent()}
    </div>
  )
}
