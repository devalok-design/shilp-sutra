import type { PropSchema } from './ComponentRegistry'

interface PropControlProps {
  schema: PropSchema
  value: any
  onChange: (value: any) => void
}

export function PropControl({ schema, value, onChange }: PropControlProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-28 text-xs text-text-secondary shrink-0">{schema.label}</label>
      {schema.type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-border-subtle bg-field px-2 py-1.5 text-xs"
        >
          {schema.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
      {schema.type === 'text' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded border border-border-subtle bg-field px-2 py-1.5 text-xs"
        />
      )}
      {schema.type === 'boolean' && (
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded"
        />
      )}
      {schema.type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 rounded border border-border-subtle bg-field px-2 py-1.5 text-xs"
        />
      )}
    </div>
  )
}
