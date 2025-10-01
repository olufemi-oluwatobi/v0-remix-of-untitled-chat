# Code Generation Engine

## Overview

The code generation engine converts your design specifications into production-ready Next.js code. It functions as a transpiler with intelligent change detection and task-based workflows.

## Architecture

### Components

1. **Task Manager** (`lib/code-generation/task-manager.ts`)
   - Breaks generation into workflow steps
   - Manages task dependencies
   - Tracks progress

2. **Change Detector** (`lib/code-generation/change-detector.ts`)
   - Detects spec modifications using hash comparison
   - Only regenerates changed specs
   - Reduces unnecessary API calls

3. **Prompt Manager** (`lib/code-generation/prompts/prompt-manager.ts`)
   - High-quality prompt templates
   - Easy to extend and customize
   - Supports variable interpolation

4. **Code Generator** (`lib/code-generation/generator.ts`)
   - Orchestrates the generation process
   - Handles both template-based and AI-based generation
   - Maintains code cache

## Setup

### Environment Variables

Add the following to your Vercel project settings:

\`\`\`bash
OPENAI_API_KEY=sk-...  # Your OpenAI API key (server-side only)
\`\`\`

**Security Note:** Never use `NEXT_PUBLIC_` prefix for API keys. The generation API route handles authentication securely on the server.

### Usage

\`\`\`typescript
import { useCodeGenerationStore } from '@/lib/store/use-code-generation-store'

function MyComponent() {
  const { startGeneration, isGenerating, progress } = useCodeGenerationStore()
  
  const handleGenerate = async () => {
    await startGeneration(specMap, previousSpecMap)
  }
  
  return (
    <button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? `Generating... ${progress.percentage}%` : 'Generate Code'}
    </button>
  )
}
\`\`\`

## Workflow

1. **Style Guide** (Priority 1)
   - Template-based generation (no AI needed)
   - Generates `app/globals.css`

2. **Components** (Priority 2)
   - AI-powered generation
   - Depends on style guide
   - Generates reusable components

3. **Pages** (Priority 3)
   - AI-powered generation
   - Depends on components and style guide
   - Generates Next.js pages

4. **Integrations** (Priority 4)
   - API routes, configs, etc.
   - Future enhancement

## Customizing Prompts

\`\`\`typescript
import { promptManager } from '@/lib/code-generation/prompts/prompt-manager'

// Register custom prompt
promptManager.registerPrompt('component', `
Your custom component generation prompt here...
Variables: {componentSpec}, {styleGuide}, {referencedComponents}
`)
\`\`\`

## API Endpoints

### POST /api/generate
Generate code from spec map

**Request:**
\`\`\`json
{
  "specMap": { ... },
  "previousSpecMap": { ... },
  "existingCode": [ ... ],
  "model": "gpt-4o"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "code": [ ... ],
  "workflow": [ ... ],
  "progress": { "completed": 5, "total": 10, "percentage": 50 }
}
\`\`\`

### GET /api/generate
Get current generation status

## Best Practices

1. **Incremental Generation**: Always pass `previousSpecMap` to enable change detection
2. **Cache Management**: Store generated code to avoid regenerating unchanged specs
3. **Error Handling**: Check `error` state and display to users
4. **Progress Tracking**: Show progress percentage during generation
5. **Security**: Never expose API keys to client-side code
