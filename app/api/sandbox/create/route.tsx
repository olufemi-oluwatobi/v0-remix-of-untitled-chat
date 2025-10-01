import { NextResponse } from "next/server"
import { Sandbox } from "@vercel/sandbox"

// Store active sandbox globally to reuse
declare global {
  var activeSandbox: any
  var sandboxData: any
  var sandboxCreationInProgress: boolean
  var sandboxCreationPromise: Promise<any> | null
}

export async function POST() {
  // Check if sandbox creation is already in progress
  if (global.sandboxCreationInProgress && global.sandboxCreationPromise) {
    console.log("[sandbox] Creation in progress, waiting...")
    try {
      const existingResult = await global.sandboxCreationPromise
      return NextResponse.json(existingResult)
    } catch (error) {
      console.error("[sandbox] Existing creation failed:", error)
    }
  }

  // Check if we already have an active sandbox
  if (global.activeSandbox && global.sandboxData) {
    console.log("[sandbox] Returning existing sandbox")
    return NextResponse.json({
      success: true,
      sandboxId: global.sandboxData.sandboxId,
      url: global.sandboxData.url,
    })
  }

  // Set the creation flag
  global.sandboxCreationInProgress = true
  global.sandboxCreationPromise = createSandboxInternal()

  try {
    const result = await global.sandboxCreationPromise
    return NextResponse.json(result)
  } catch (error) {
    console.error("[sandbox] Creation failed:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create sandbox",
      },
      { status: 500 },
    )
  } finally {
    global.sandboxCreationInProgress = false
    global.sandboxCreationPromise = null
  }
}

async function createSandboxInternal() {
  let sandbox: any = null

  try {
    console.log("[sandbox] Creating Vercel sandbox...")

    // Kill existing sandbox if any
    if (global.activeSandbox) {
      console.log("[sandbox] Stopping existing sandbox...")
      try {
        await global.activeSandbox.stop()
      } catch (e) {
        console.error("Failed to stop existing sandbox:", e)
      }
      global.activeSandbox = null
      global.sandboxData = null
    }

    // Prepare sandbox configuration
    const sandboxConfig: any = {
      timeout: 300000, // 5 minutes
      runtime: "node22",
      ports: [3000],
    }

    // Add authentication - prioritize OIDC token
    if (process.env.VERCEL_OIDC_TOKEN) {
      console.log("[sandbox] Using OIDC token authentication")
      sandboxConfig.oidcToken = process.env.VERCEL_OIDC_TOKEN
    } else if (process.env.VERCEL_TOKEN && process.env.VERCEL_TEAM_ID && process.env.VERCEL_PROJECT_ID) {
      console.log("[sandbox] Using personal access token authentication")
      sandboxConfig.teamId = process.env.VERCEL_TEAM_ID
      sandboxConfig.projectId = process.env.VERCEL_PROJECT_ID
      sandboxConfig.token = process.env.VERCEL_TOKEN
    } else {
      console.log("[sandbox] Using default Vercel authentication")
    }

    sandbox = await Sandbox.create(sandboxConfig)
    const sandboxId = sandbox.sandboxId
    console.log(`[sandbox] Created: ${sandboxId}`)

    // Get the sandbox URL
    const sandboxUrl = sandbox.domain(3000)
    const sandboxHostname = new URL(sandboxUrl).hostname
    console.log(`[sandbox] URL: ${sandboxUrl}`)

    // Create Vite config with proper hostname
    const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '${sandboxHostname}',
      '.vercel.run',
      '.vercel-sandbox.dev'
    ]
  }
})`

    // Create project files
    const projectFiles = [
      {
        path: "package.json",
        content: Buffer.from(
          JSON.stringify(
            {
              name: "sandbox-app",
              version: "1.0.0",
              type: "module",
              scripts: {
                dev: "vite --host --port 3000",
                build: "vite build",
                preview: "vite preview",
              },
              dependencies: {
                react: "^18.2.0",
                "react-dom": "^18.2.0",
              },
              devDependencies: {
                "@vitejs/plugin-react": "^4.0.0",
                vite: "^4.3.9",
                tailwindcss: "^3.3.0",
                postcss: "^8.4.31",
                autoprefixer: "^10.4.16",
              },
            },
            null,
            2,
          ),
        ),
      },
      {
        path: "vite.config.js",
        content: Buffer.from(viteConfigContent),
      },
      {
        path: "tailwind.config.js",
        content: Buffer.from(`/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`),
      },
      {
        path: "postcss.config.js",
        content: Buffer.from(`export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`),
      },
      {
        path: "index.html",
        content: Buffer.from(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`),
      },
      {
        path: "src/main.jsx",
        content: Buffer.from(`import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`),
      },
      {
        path: "src/App.jsx",
        content: Buffer.from(`function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Your App Preview
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          This is your live application running in a Vercel Sandbox.
        </p>
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Ready to Build
          </h2>
          <p className="text-gray-600">
            Start customizing your React app with Vite and Tailwind CSS!
          </p>
        </div>
      </div>
    </div>
  )
}

export default App`),
      },
      {
        path: "src/index.css",
        content: Buffer.from(`@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}`),
      },
    ]

    // Create directory structure
    await sandbox.runCommand({
      cmd: "mkdir",
      args: ["-p", "src"],
    })

    // Write all files
    await sandbox.writeFiles(projectFiles)
    console.log("[sandbox] ✓ Project files created")

    // Install dependencies
    console.log("[sandbox] Installing dependencies...")
    const installResult = await sandbox.runCommand({
      cmd: "npm",
      args: ["install", "--loglevel", "info"],
    })

    if (installResult.exitCode === 0) {
      console.log("[sandbox] ✓ Dependencies installed")
    } else {
      console.log("[sandbox] ⚠ npm install had issues but continuing...")
    }

    // Start Vite dev server in detached mode
    console.log("[sandbox] Starting Vite dev server...")
    await sandbox.runCommand({
      cmd: "npm",
      args: ["run", "dev"],
      detached: true,
    })

    console.log("[sandbox] ✓ Vite dev server started")

    // Wait for Vite to be ready
    await new Promise((resolve) => setTimeout(resolve, 7000))

    // Store sandbox globally
    global.activeSandbox = sandbox
    global.sandboxData = {
      sandboxId,
      url: sandboxUrl,
    }

    console.log("[sandbox] Ready at:", sandboxUrl)

    return {
      success: true,
      sandboxId,
      url: sandboxUrl,
      message: "Vercel sandbox created and Vite React app initialized",
    }
  } catch (error) {
    console.error("[sandbox] Error:", error)

    // Clean up on error
    if (sandbox) {
      try {
        await sandbox.stop()
      } catch (e) {
        console.error("Failed to stop sandbox on error:", e)
      }
    }

    global.activeSandbox = null
    global.sandboxData = null

    throw error
  }
}
