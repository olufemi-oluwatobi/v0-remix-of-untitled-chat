"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export function FullAppPreview() {
  const [sandboxUrl, setSandboxUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    createSandbox()
  }, [])

  const createSandbox = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/sandbox/create", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create sandbox")
      }

      const data = await response.json()

      if (data.success && data.url) {
        setSandboxUrl(data.url)
      } else {
        throw new Error(data.error || "Failed to get sandbox URL")
      }
    } catch (err) {
      console.error("Sandbox creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create sandbox")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Setting up sandbox environment...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-sm text-destructive mb-2">Error: {error}</p>
            <button onClick={createSandbox} className="text-xs text-primary hover:underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {sandboxUrl && !isLoading && (
        <iframe
          src={sandboxUrl}
          className="w-full h-full border-0"
          title="App Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      )}
    </div>
  )
}
