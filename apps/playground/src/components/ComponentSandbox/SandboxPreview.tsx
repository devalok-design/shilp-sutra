import { useMemo } from 'react'
import { COMPONENT_REGISTRY } from './ComponentRegistry'

interface SandboxPreviewProps {
  selectedComponent?: string
  componentProps: Record<string, any>
}

export function SandboxPreview({ selectedComponent, componentProps }: SandboxPreviewProps) {
  const entry = COMPONENT_REGISTRY.find((c) => c.name === selectedComponent)

  const currentProps = useMemo(() => {
    if (!entry) return {}
    const defaults: Record<string, any> = {}
    for (const p of entry.props) {
      defaults[p.name] = p.defaultValue
    }
    return { ...defaults, ...componentProps }
  }, [entry, componentProps])

  if (!entry) {
    return (
      <div className="flex h-64 items-center justify-center text-text-tertiary text-sm">
        Select a component from the sidebar
      </div>
    )
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-border-subtle bg-layer-01 p-8">
      {entry.render(currentProps)}
    </div>
  )
}
