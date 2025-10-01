# Spec-to-Code Engine Architecture

## Overview

The Spec-to-Code Engine is a transpiler-like system that converts design specifications into production-ready code. It operates in three main phases: **Spec Gathering**, **Code Generation**, and **Code Preview**. The engine uses AI to intelligently generate code while maintaining efficiency through change detection, surgical updates, and a managed file system.

---

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                     SPEC GATHERING PHASE                         │
│  User defines pages, components, style guide, and assets         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CODE GENERATION PHASE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Change       │→ │ Task         │→ │ Code         │          │
│  │ Detection    │  │ Manager      │  │ Generator    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                           │                                      │
│                           ▼                                      │
│                  ┌──────────────────┐                           │
│                  │  CodeManager     │                           │
│                  │  (File System)   │                           │
│                  └──────────────────┘                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CODE PREVIEW PHASE                            │
│  Generated code deployed to Vercel Sandbox for live preview     │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Phase 1: Spec Gathering

### Purpose
Collect all design specifications from the user in a structured format that can be processed by the code generation engine.

### Data Structure

The workspace specification is stored in Zustand state:

\`\`\`typescript
interface WorkspaceState {
  pages: Page[]           // All pages in the app
  components: Component[] // Reusable components
  styleGuide: StyleGuide  // Design system (colors, typography, spacing)
  assets: Asset[]         // Images, icons, fonts
}
\`\`\`

#### Page Specification
\`\`\`typescript
interface Page {
  id: string
  name: string           // e.g., "Home", "About", "Contact"
  route: string          // e.g., "/", "/about", "/contact"
  description: string    // What the page should contain
  sections: Section[]    // Page sections (hero, features, footer, etc.)
  components: string[]   // Component IDs used on this page
  metadata: {
    title: string
    description: string
  }
}
\`\`\`

#### Component Specification
\`\`\`typescript
interface Component {
  id: string
  name: string          // e.g., "Header", "Button", "Card"
  type: string          // e.g., "navigation", "ui", "layout"
  description: string   // What the component should do
  props: PropSpec[]     // Expected props
  variants?: string[]   // Different variants (e.g., "primary", "secondary")
}
\`\`\`

#### Style Guide Specification
\`\`\`typescript
interface StyleGuide {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  typography: {
    fontFamily: {
      sans: string
      serif: string
      mono: string
    }
    fontSize: Record<string, string>
    fontWeight: Record<string, number>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
}
\`\`\`

### How Specs Are Gathered

1. **User Input**: Users define specs through the IDE interface
2. **Validation**: Specs are validated for completeness
3. **Storage**: Specs are stored in Zustand store (`use-workspace-store.ts`)
4. **Hashing**: Each spec is hashed for change detection

---

## Phase 2: Code Generation

This is the core "transpiling" phase where specifications are converted to code.

### 2.1 Change Detection

**Purpose**: Only regenerate code for specs that have changed.

**Implementation** (`lib/code-generation/change-detector.ts`):

\`\`\`typescript
class ChangeDetector {
  detectChanges(currentSpec: WorkspaceSpec, previousSpec?: WorkspaceSpec): SpecChanges
}
\`\`\`

**Algorithm**:
1. Hash each spec item (page, component, style guide)
2. Compare hashes with previous generation
3. Identify: `added`, `modified`, `deleted`, `unchanged`
4. Return only items that need regeneration

**Benefits**:
- Reduces AI API calls
- Faster generation
- Preserves unchanged code
- Lower costs

### 2.2 Task Manager

**Purpose**: Break down code generation into manageable tasks with dependencies.

**Task Types**:
1. **Style Guide Generation** (Priority: 1) - Always runs first, creates `app/globals.css`, no AI needed
2. **Component Generation** (Priority: 2) - Runs after style guide, creates `components/*.tsx`, uses AI
3. **Page Generation** (Priority: 3) - Runs after components, creates `app/**/page.tsx`, uses AI

**Task Workflow**:
\`\`\`
1. Analyze changes → Create task list
2. Sort by priority and dependencies
3. Execute tasks sequentially
4. Track progress and errors
5. Return results
\`\`\`

### 2.3 Code Manager

**Purpose**: Manage the virtual file system and perform surgical code updates.

**Key Methods**:
- `addFile(path, content)` - Add new file
- `updateFile(path, content)` - Replace entire file
- `replaceContent(path, search, replace)` - Surgical update
- `deleteFile(path)` - Remove file
- `moveFile(from, to)` - Rename/move file
- `exportForSandbox()` - Export for preview

**Why CodeManager?**
- **Surgical Updates**: Only update parts that changed
- **Dependency Tracking**: Know what files depend on each other
- **History**: Track all operations for debugging
- **Efficiency**: Avoid redundant rewrites

### 2.4 Code Generator

**Purpose**: Orchestrate the entire generation process using AI and templates.

**Generation Strategies**:

1. **Template-Based** (Style Guide):
   - No AI needed
   - Direct conversion from spec to CSS
   - Fast and deterministic

2. **AI-Based** (Components & Pages):
   - Uses OpenAI API
   - Structured prompts with context
   - Parses multi-file responses

### 2.5 Prompt Management

**Purpose**: High-quality, maintainable prompts for consistent code generation.

**Prompt Structure**:

1. **System Prompt** - Defines AI behavior and rules
2. **User Prompt** - Specific generation request with context
3. **Context Builders** - Add style guide, components, and dependencies

**Key Principles**:
- Clear output format requirements
- Multi-file generation instructions
- Style guide adherence
- Component reuse
- Best practices enforcement

### 2.6 AI Response Parsing

**Purpose**: Extract multiple files from AI response.

**Expected Format**:
\`\`\`
\`\`\`tsx file="components/header.tsx"
export default function Header() { ... }
\`\`\`

\`\`\`tsx
