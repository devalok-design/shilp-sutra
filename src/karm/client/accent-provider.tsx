'use client'

import { useEffect } from 'react'

export interface AccentProviderProps {
  /** CSS custom properties string, e.g. "--color-accent: #d33163; --color-accent-light: #f7e9e9;" */
  accentCss?: string | null
}

/**
 * Injects accent CSS custom properties onto the document root element.
 * Uses useEffect to set properties imperatively rather than injecting a <style> tag.
 */
function AccentProvider({ accentCss }: AccentProviderProps) {
  useEffect(() => {
    if (!accentCss) return

    const root = document.documentElement

    // Parse the CSS string into individual property declarations
    const declarations = accentCss
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)

    const appliedProperties: string[] = []

    for (const declaration of declarations) {
      const colonIndex = declaration.indexOf(':')
      if (colonIndex === -1) continue
      const property = declaration.slice(0, colonIndex).trim()
      const value = declaration.slice(colonIndex + 1).trim()
      if (property && value) {
        root.style.setProperty(property, value)
        appliedProperties.push(property)
      }
    }

    // Cleanup: remove the properties when unmounting or when accentCss changes
    return () => {
      for (const property of appliedProperties) {
        root.style.removeProperty(property)
      }
    }
  }, [accentCss])

  return null
}

export { AccentProvider }
