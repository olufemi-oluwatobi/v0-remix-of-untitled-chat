export interface ManagedFile {
  path: string
  content: string
  hash: string
  lastModified: number
  type: "page" | "component" | "style" | "config" | "asset"
}

export interface FileOperation {
  type: "add" | "update" | "delete" | "move" | "replace"
  path: string
  content?: string
  newPath?: string
  oldContent?: string
  newContent?: string
}

export class CodeManager {
  private files: Map<string, ManagedFile> = new Map()
  private operations: FileOperation[] = []

  constructor(initialFiles?: ManagedFile[]) {
    if (initialFiles) {
      initialFiles.forEach((file) => this.files.set(file.path, file))
    }
  }

  // Get a file by path
  getFile(path: string): ManagedFile | undefined {
    return this.files.get(path)
  }

  // Get all files
  getAllFiles(): ManagedFile[] {
    return Array.from(this.files.values())
  }

  // Get files by type
  getFilesByType(type: ManagedFile["type"]): ManagedFile[] {
    return this.getAllFiles().filter((f) => f.type === type)
  }

  // Check if file exists
  hasFile(path: string): boolean {
    return this.files.has(path)
  }

  // Add a new file
  addFile(path: string, content: string, type: ManagedFile["type"]): void {
    if (this.files.has(path)) {
      throw new Error(`File already exists: ${path}`)
    }

    const file: ManagedFile = {
      path,
      content,
      hash: this.hashContent(content),
      lastModified: Date.now(),
      type,
    }

    this.files.set(path, file)
    this.operations.push({ type: "add", path, content })
  }

  // Update entire file content
  updateFile(path: string, content: string): void {
    const existing = this.files.get(path)
    if (!existing) {
      throw new Error(`File not found: ${path}`)
    }

    const newHash = this.hashContent(content)

    // Only update if content actually changed
    if (existing.hash !== newHash) {
      this.files.set(path, {
        ...existing,
        content,
        hash: newHash,
        lastModified: Date.now(),
      })
      this.operations.push({ type: "update", path, content })
    }
  }

  // Replace specific content within a file (surgical update)
  replaceContent(path: string, oldContent: string, newContent: string): void {
    const file = this.files.get(path)
    if (!file) {
      throw new Error(`File not found: ${path}`)
    }

    if (!file.content.includes(oldContent)) {
      throw new Error(`Content not found in file: ${path}`)
    }

    const updatedContent = file.content.replace(oldContent, newContent)
    const newHash = this.hashContent(updatedContent)

    this.files.set(path, {
      ...file,
      content: updatedContent,
      hash: newHash,
      lastModified: Date.now(),
    })

    this.operations.push({
      type: "replace",
      path,
      oldContent,
      newContent,
    })
  }

  // Delete a file
  deleteFile(path: string): void {
    if (!this.files.has(path)) {
      throw new Error(`File not found: ${path}`)
    }

    this.files.delete(path)
    this.operations.push({ type: "delete", path })
  }

  // Move/rename a file
  moveFile(fromPath: string, toPath: string): void {
    const file = this.files.get(fromPath)
    if (!file) {
      throw new Error(`File not found: ${fromPath}`)
    }

    if (this.files.has(toPath)) {
      throw new Error(`Destination file already exists: ${toPath}`)
    }

    this.files.delete(fromPath)
    this.files.set(toPath, {
      ...file,
      path: toPath,
      lastModified: Date.now(),
    })

    this.operations.push({ type: "move", path: fromPath, newPath: toPath })
  }

  // Get all operations performed
  getOperations(): FileOperation[] {
    return [...this.operations]
  }

  // Clear operations history
  clearOperations(): void {
    this.operations = []
  }

  // Get changed files since last clear
  getChangedFiles(): ManagedFile[] {
    const changedPaths = new Set(this.operations.map((op) => op.path))
    return this.getAllFiles().filter((f) => changedPaths.has(f.path))
  }

  // Export to format suitable for sandbox
  exportForSandbox(): Record<string, string> {
    const result: Record<string, string> = {}
    this.files.forEach((file, path) => {
      result[path] = file.content
    })
    return result
  }

  // Simple hash function for content comparison
  private hashContent(content: string): string {
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  // Get file tree structure for display
  getFileTree(): Record<string, any> {
    const tree: Record<string, any> = {}

    this.files.forEach((file) => {
      const parts = file.path.split("/")
      let current = tree

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // Leaf node (file)
          current[part] = {
            type: "file",
            content: file.content,
            fileType: file.type,
          }
        } else {
          // Directory node
          if (!current[part]) {
            current[part] = { type: "directory" }
          }
          current = current[part]
        }
      })
    })

    return tree
  }

  // Clone the manager
  clone(): CodeManager {
    return new CodeManager(this.getAllFiles())
  }
}
