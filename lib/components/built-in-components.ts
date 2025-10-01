export interface BuiltInComponent {
  id: string
  name: string
  category: "ui" | "form" | "layout" | "data" | "navigation"
  description: string
  defaultProps: Record<string, any>
  propSchema: PropSchemaItem[]
}

export type PropSchemaItem = {
  name: string
  description?: string
} & (
  | {
      type: "string" | "number" | "boolean" | "color"
      default: any
    }
  | {
      type: "select"
      default: any
      options: string[]
    }
  | {
      type: "array"
      default: any[]
      itemSchema: {
        [key: string]: "string" | "number" | "boolean"
      }
    }
)

export const BUILT_IN_COMPONENTS: BuiltInComponent[] = [
  // UI Components
  {
    id: "button",
    name: "Button",
    category: "ui",
    description: "A clickable button component with multiple variants",
    defaultProps: {
      variant: "default",
      size: "default",
      children: "Click me",
    },
    propSchema: [
      {
        name: "children",
        type: "string",
        default: "Click me",
        description: "Button text",
      },
      {
        name: "variant",
        type: "select",
        default: "default",
        options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
        description: "Button style variant",
      },
      {
        name: "size",
        type: "select",
        default: "default",
        options: ["default", "sm", "lg", "icon"],
        description: "Button size",
      },
    ],
  },
  {
    id: "card",
    name: "Card",
    category: "ui",
    description: "A card container with header, content, and footer",
    defaultProps: {
      title: "Card Title",
      description: "Card description goes here",
      content: "Card content",
    },
    propSchema: [
      {
        name: "title",
        type: "string",
        default: "Card Title",
        description: "Card header title",
      },
      {
        name: "description",
        type: "string",
        default: "Card description",
        description: "Card header description",
      },
      {
        name: "content",
        type: "string",
        default: "Card content",
        description: "Main card content",
      },
    ],
  },
  {
    id: "badge",
    name: "Badge",
    category: "ui",
    description: "A small badge for labels and tags",
    defaultProps: {
      variant: "default",
      children: "Badge",
    },
    propSchema: [
      {
        name: "children",
        type: "string",
        default: "Badge",
        description: "Badge text",
      },
      {
        name: "variant",
        type: "select",
        default: "default",
        options: ["default", "secondary", "destructive", "outline"],
        description: "Badge style variant",
      },
    ],
  },
  {
    id: "alert",
    name: "Alert",
    category: "ui",
    description: "An alert component for important messages",
    defaultProps: {
      variant: "default",
      title: "Alert Title",
      description: "This is an alert message",
    },
    propSchema: [
      {
        name: "title",
        type: "string",
        default: "Alert Title",
        description: "Alert title",
      },
      {
        name: "description",
        type: "string",
        default: "Alert message",
        description: "Alert description",
      },
      {
        name: "variant",
        type: "select",
        default: "default",
        options: ["default", "destructive"],
        description: "Alert style variant",
      },
    ],
  },
  {
    id: "avatar",
    name: "Avatar",
    category: "ui",
    description: "A user avatar with fallback",
    defaultProps: {
      src: "/placeholder.svg?height=40&width=40",
      fallback: "JD",
    },
    propSchema: [
      {
        name: "src",
        type: "string",
        default: "/placeholder.svg?height=40&width=40",
        description: "Avatar image URL",
      },
      {
        name: "fallback",
        type: "string",
        default: "JD",
        description: "Fallback text when image fails",
      },
    ],
  },
  {
    id: "progress",
    name: "Progress",
    category: "ui",
    description: "A progress bar indicator",
    defaultProps: {
      value: 50,
    },
    propSchema: [
      {
        name: "value",
        type: "number",
        default: 50,
        description: "Progress value (0-100)",
      },
    ],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    category: "ui",
    description: "A loading skeleton placeholder",
    defaultProps: {
      width: "100%",
      height: "20px",
    },
    propSchema: [
      {
        name: "width",
        type: "string",
        default: "100%",
        description: "Skeleton width",
      },
      {
        name: "height",
        type: "string",
        default: "20px",
        description: "Skeleton height",
      },
    ],
  },

  // Form Components
  {
    id: "input",
    name: "Input",
    category: "form",
    description: "A text input field",
    defaultProps: {
      type: "text",
      placeholder: "Enter text...",
    },
    propSchema: [
      {
        name: "type",
        type: "select",
        default: "text",
        options: ["text", "email", "password", "number", "tel", "url"],
        description: "Input type",
      },
      {
        name: "placeholder",
        type: "string",
        default: "Enter text...",
        description: "Placeholder text",
      },
    ],
  },
  {
    id: "textarea",
    name: "Textarea",
    category: "form",
    description: "A multi-line text input",
    defaultProps: {
      placeholder: "Enter text...",
      rows: 4,
    },
    propSchema: [
      {
        name: "placeholder",
        type: "string",
        default: "Enter text...",
        description: "Placeholder text",
      },
      {
        name: "rows",
        type: "number",
        default: 4,
        description: "Number of rows",
      },
    ],
  },
  {
    id: "checkbox",
    name: "Checkbox",
    category: "form",
    description: "A checkbox input",
    defaultProps: {
      label: "Accept terms",
      checked: false,
    },
    propSchema: [
      {
        name: "label",
        type: "string",
        default: "Accept terms",
        description: "Checkbox label",
      },
      {
        name: "checked",
        type: "boolean",
        default: false,
        description: "Checked state",
      },
    ],
  },
  {
    id: "switch",
    name: "Switch",
    category: "form",
    description: "A toggle switch",
    defaultProps: {
      label: "Enable notifications",
      checked: false,
    },
    propSchema: [
      {
        name: "label",
        type: "string",
        default: "Enable notifications",
        description: "Switch label",
      },
      {
        name: "checked",
        type: "boolean",
        default: false,
        description: "Checked state",
      },
    ],
  },
  {
    id: "select",
    name: "Select",
    category: "form",
    description: "A dropdown select input",
    defaultProps: {
      placeholder: "Select an option",
      options: ["Option 1", "Option 2", "Option 3"],
    },
    propSchema: [
      {
        name: "placeholder",
        type: "string",
        default: "Select an option",
        description: "Placeholder text",
      },
    ],
  },
  {
    id: "slider",
    name: "Slider",
    category: "form",
    description: "A range slider input",
    defaultProps: {
      min: 0,
      max: 100,
      value: 50,
    },
    propSchema: [
      {
        name: "min",
        type: "number",
        default: 0,
        description: "Minimum value",
      },
      {
        name: "max",
        type: "number",
        default: 100,
        description: "Maximum value",
      },
      {
        name: "value",
        type: "number",
        default: 50,
        description: "Current value",
      },
    ],
  },

  // Layout Components
  {
    id: "separator",
    name: "Separator",
    category: "layout",
    description: "A visual divider",
    defaultProps: {
      orientation: "horizontal",
    },
    propSchema: [
      {
        name: "orientation",
        type: "select",
        default: "horizontal",
        options: ["horizontal", "vertical"],
        description: "Separator orientation",
      },
    ],
  },
  {
    id: "accordion",
    name: "Accordion",
    category: "layout",
    description: "An expandable accordion component",
    defaultProps: {
      items: [
        { title: "Item 1", content: "Content for item 1" },
        { title: "Item 2", content: "Content for item 2" },
      ],
    },
    propSchema: [
      {
        name: "items",
        type: "array",
        default: [
          { title: "Item 1", content: "Content for item 1" },
          { title: "Item 2", content: "Content for item 2" },
        ],
        itemSchema: {
          title: "string",
          content: "string",
        },
        description: "Accordion items",
      },
    ],
  },
  {
    id: "tabs",
    name: "Tabs",
    category: "layout",
    description: "A tabbed interface",
    defaultProps: {
      tabs: [
        { label: "Tab 1", content: "Content for tab 1" },
        { label: "Tab 2", content: "Content for tab 2" },
        { label: "Tab 3", content: "Content for tab 3" },
      ],
    },
    propSchema: [
      {
        name: "tabs",
        type: "array",
        default: [
          { label: "Tab 1", content: "Content for tab 1" },
          { label: "Tab 2", content: "Content for tab 2" },
          { label: "Tab 3", content: "Content for tab 3" },
        ],
        itemSchema: {
          label: "string",
          content: "string",
        },
        description: "Tab items",
      },
    ],
  },
  {
    id: "collapsible",
    name: "Collapsible",
    category: "layout",
    description: "A collapsible content section",
    defaultProps: {
      title: "Click to expand",
      content: "Hidden content",
    },
    propSchema: [
      {
        name: "title",
        type: "string",
        default: "Click to expand",
        description: "Collapsible title",
      },
      {
        name: "content",
        type: "string",
        default: "Hidden content",
        description: "Collapsible content",
      },
    ],
  },

  // Data Components
  {
    id: "table",
    name: "Table",
    category: "data",
    description: "A data table component",
    defaultProps: {
      columns: ["Name", "Email", "Status"],
      rows: [
        { Name: "John Doe", Email: "john@example.com", Status: "Active" },
        { Name: "Jane Smith", Email: "jane@example.com", Status: "Active" },
        { Name: "Bob Johnson", Email: "bob@example.com", Status: "Inactive" },
      ],
    },
    propSchema: [
      {
        name: "rows",
        type: "array",
        default: [
          { Name: "John Doe", Email: "john@example.com", Status: "Active" },
          { Name: "Jane Smith", Email: "jane@example.com", Status: "Active" },
          { Name: "Bob Johnson", Email: "bob@example.com", Status: "Inactive" },
        ],
        itemSchema: {
          Name: "string",
          Email: "string",
          Status: "string",
        },
        description: "Table rows",
      },
    ],
  },
  {
    id: "pagination",
    name: "Pagination",
    category: "data",
    description: "A pagination component",
    defaultProps: {
      currentPage: 1,
      totalPages: 10,
    },
    propSchema: [
      {
        name: "currentPage",
        type: "number",
        default: 1,
        description: "Current page number",
      },
      {
        name: "totalPages",
        type: "number",
        default: 10,
        description: "Total number of pages",
      },
    ],
  },

  // Navigation Components
  {
    id: "breadcrumb",
    name: "Breadcrumb",
    category: "navigation",
    description: "A breadcrumb navigation",
    defaultProps: {
      items: [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Details", href: "/products/details" },
      ],
    },
    propSchema: [
      {
        name: "items",
        type: "array",
        default: [
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: "Details", href: "/products/details" },
        ],
        itemSchema: {
          label: "string",
          href: "string",
        },
        description: "Breadcrumb items",
      },
    ],
  },
  {
    id: "navigation-menu",
    name: "Navigation Menu",
    category: "navigation",
    description: "A navigation menu component",
    defaultProps: {
      items: [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Contact", href: "/contact" },
      ],
    },
    propSchema: [
      {
        name: "items",
        type: "array",
        default: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Services", href: "/services" },
          { label: "Contact", href: "/contact" },
        ],
        itemSchema: {
          label: "string",
          href: "string",
        },
        description: "Menu items",
      },
    ],
  },
  {
    id: "dropdown-menu",
    name: "Dropdown Menu",
    category: "navigation",
    description: "A dropdown menu",
    defaultProps: {
      trigger: "Menu",
      items: [
        { label: "Profile", action: "profile" },
        { label: "Settings", action: "settings" },
        { label: "Logout", action: "logout" },
      ],
    },
    propSchema: [
      {
        name: "trigger",
        type: "string",
        default: "Menu",
        description: "Menu trigger text",
      },
      {
        name: "items",
        type: "array",
        default: [
          { label: "Profile", action: "profile" },
          { label: "Settings", action: "settings" },
          { label: "Logout", action: "logout" },
        ],
        itemSchema: {
          label: "string",
          action: "string",
        },
        description: "Menu items",
      },
    ],
  },
]

export function getComponentsByCategory(category: string) {
  return BUILT_IN_COMPONENTS.filter((c) => c.category === category)
}

export function getComponentById(id: string) {
  return BUILT_IN_COMPONENTS.find((c) => c.id === id)
}

export const COMPONENT_CATEGORIES = [
  { id: "ui", name: "UI", description: "Basic UI components" },
  { id: "form", name: "Form", description: "Form inputs and controls" },
  { id: "layout", name: "Layout", description: "Layout and structure" },
  { id: "data", name: "Data", description: "Data display components" },
  { id: "navigation", name: "Navigation", description: "Navigation components" },
]
