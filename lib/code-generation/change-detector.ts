import { generateSpecHash } from "@/lib/utils/spec-hash"

export interface SpecChange {
  specId: string
  type: "added" | "modified" | "deleted"
  previousHash?: string
  currentHash?: string
}

export class ChangeDetector {
  private specHashes: Map<string, string> = new Map()

  /**
   * Detect changes in spec map
   */
  detectChanges(currentSpecMap: any, previousSpecMap?: any): SpecChange[] {
    const changes: SpecChange[] = []

    if (!previousSpecMap) {
      // First generation - all specs are new
      this.indexSpecs(currentSpecMap)
      return this.getAllSpecs(currentSpecMap).map((spec) => ({
        specId: spec.id,
        type: "added" as const,
        currentHash: this.specHashes.get(spec.id),
      }))
    }

    // Check for added and modified specs
    for (const type of ["styles", "pages", "contexts", "assets"] as const) {
      const currentSpecs = currentSpecMap[type] || []
      const previousSpecs = previousSpecMap[type] || []

      for (const spec of currentSpecs) {
        const previousSpec = previousSpecs.find((p: any) => p.id === spec.id)
        const currentHash = generateSpecHash(spec)

        if (!previousSpec) {
          // New spec
          changes.push({
            specId: spec.id,
            type: "added",
            currentHash,
          })
        } else {
          const previousHash = this.specHashes.get(spec.id) || generateSpecHash(previousSpec)

          if (currentHash !== previousHash) {
            // Modified spec
            changes.push({
              specId: spec.id,
              type: "modified",
              previousHash,
              currentHash,
            })
          }
        }

        this.specHashes.set(spec.id, currentHash)
      }
    }

    // Check for deleted specs
    for (const type of ["styles", "pages", "contexts", "assets"] as const) {
      const currentSpecs = currentSpecMap[type] || []
      const previousSpecs = previousSpecMap[type] || []

      for (const previousSpec of previousSpecs) {
        const exists = currentSpecs.find((s: any) => s.id === previousSpec.id)
        if (!exists) {
          changes.push({
            specId: previousSpec.id,
            type: "deleted",
            previousHash: this.specHashes.get(previousSpec.id),
          })
          this.specHashes.delete(previousSpec.id)
        }
      }
    }

    return changes
  }

  /**
   * Index all specs for future comparison
   */
  private indexSpecs(specMap: any): void {
    for (const spec of this.getAllSpecs(specMap)) {
      const hash = generateSpecHash(spec)
      this.specHashes.set(spec.id, hash)
    }
  }

  /**
   * Get all specs from spec map
   */
  private getAllSpecs(specMap: any): any[] {
    const specs: any[] = []
    for (const type of ["styles", "pages", "contexts", "assets"]) {
      specs.push(...(specMap[type] || []))
    }
    return specs
  }

  /**
   * Get current hash for a spec
   */
  getSpecHash(specId: string): string | undefined {
    return this.specHashes.get(specId)
  }

  /**
   * Clear all cached hashes
   */
  clear(): void {
    this.specHashes.clear()
  }
}

// Singleton instance
export const changeDetector = new ChangeDetector()
