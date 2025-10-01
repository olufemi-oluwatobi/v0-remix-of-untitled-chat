"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

interface SandboxPreviewProps {
  code: string
}

export function SandboxPreview({ code }: SandboxPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code || !iframeRef.current) return

    setError(null)

    try {
      // Create a complete HTML document with the React component
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    
    ${code}
    
    // Find the component to render
    const componentName = Object.keys(window).find(key => 
      typeof window[key] === 'function' && 
      key !== 'App' &&
      /^[A-Z]/.test(key)
    );
    
    const Component = window[componentName] || window.App || (() => <div>No component found</div>);
    
    ReactDOM.render(<Component />, document.getElementById('root'));
  </script>
</body>
</html>
      `

      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    } catch (err) {
      console.error("[v0] Sandbox preview error:", err)
      setError(err instanceof Error ? err.message : "Failed to render component")
    }
  }, [code])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3 max-w-md">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-foreground">Preview Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0 rounded-lg bg-white"
      sandbox="allow-scripts"
      title="Component Preview"
    />
  )
}
