import { useMemo } from 'react'
import { COMPONENT_REGISTRY } from './ComponentRegistry'
import { PropControl } from './PropControl'

interface ComponentSandboxProps {
  selectedComponent?: string
  componentProps: Record<string, any>
  onSelectComponent: (name: string) => void
  onChangeProps: (props: Record<string, any>) => void
}

export function ComponentSandbox({
  selectedComponent,
  componentProps,
  onSelectComponent,
  onChangeProps,
}: ComponentSandboxProps) {
  const entry = COMPONENT_REGISTRY.find((c) => c.name === selectedComponent)

  const currentProps = useMemo(() => {
    if (!entry) return {}
    const defaults: Record<string, any> = {}
    for (const p of entry.props) {
      defaults[p.name] = p.defaultValue
    }
    return { ...defaults, ...componentProps }
  }, [entry, componentProps])

  const handlePropChange = (name: string, value: any) => {
    onChangeProps({ ...currentProps, [name]: value })
  }

  const codeString = useMemo(() => {
    if (!entry) return ''
    const propsStr = entry.props
      .filter((p) => currentProps[p.name] !== p.defaultValue && p.name !== 'children')
      .map((p) => {
        const v = currentProps[p.name]
        if (typeof v === 'boolean') return v ? p.name : null
        if (typeof v === 'number') return `${p.name}={${v}}`
        return `${p.name}="${v}"`
      })
      .filter(Boolean)
      .join(' ')

    const children = currentProps.children || ''
    const hasChildren = entry.props.some((p) => p.name === 'children')
    const tag = entry.name
    const space = propsStr ? ' ' : ''

    if (hasChildren && children) {
      return `<${tag}${space}${propsStr}>${children}</${tag}>`
    }
    return `<${tag}${space}${propsStr} />`
  }, [entry, currentProps])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-surface-fg-muted mb-1">Component</label>
        <select
          value={selectedComponent || ''}
          onChange={(e) => onSelectComponent(e.target.value)}
          className="w-full rounded border border-surface-border bg-surface-3 px-3 py-2 text-sm"
        >
          <option value="" disabled>Select a component...</option>
          {COMPONENT_REGISTRY.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {entry && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-surface-fg-subtle uppercase tracking-wider">Props</h4>
          {entry.props.map((schema) => (
            <PropControl
              key={schema.name}
              schema={schema}
              value={currentProps[schema.name]}
              onChange={(v) => handlePropChange(schema.name, v)}
            />
          ))}
        </div>
      )}

      {entry && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium text-surface-fg-subtle uppercase tracking-wider">Code</h4>
            <button
              onClick={() => navigator.clipboard.writeText(codeString)}
              className="text-xs text-info-9 hover:text-info-11"
            >
              Copy
            </button>
          </div>
          <pre className="rounded-md bg-surface-2 p-3 text-xs font-mono text-surface-fg overflow-x-auto">
            {codeString}
          </pre>
        </div>
      )}
    </div>
  )
}
