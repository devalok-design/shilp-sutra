import { Accordion } from './Accordion'
import { ColorScaleEditor } from './ColorScaleEditor'
import { COLOR_SCALES, PRIMITIVE_DEFAULTS, SEMANTIC_GROUPS } from '../../lib/tokens'

interface TokenEditorProps {
  primitives: Record<string, string>
  semantic: Record<string, string>
  onChangePrimitive: (name: string, value: string) => void
  onChangeSemantic: (name: string, value: string) => void
  onResetToken: (name: string) => void
}

export function TokenEditor({
  primitives,
  semantic,
  onChangePrimitive,
  onChangeSemantic,
  onResetToken,
}: TokenEditorProps) {
  return (
    <div className="space-y-1">
      {/* Color Scales */}
      <Accordion
        label="Color Scales"
        description="Pick a base color to auto-generate each scale"
        defaultOpen
        hasChanges={Object.keys(primitives).length > 0}
      >
        <div className="space-y-6 pt-2">
          {COLOR_SCALES.map((scale) => {
            const scaleDefaults: Record<string, string> = {}
            for (const [key, val] of Object.entries(PRIMITIVE_DEFAULTS)) {
              if (key.startsWith(`--${scale}-`)) scaleDefaults[key] = val
            }
            return (
              <ColorScaleEditor
                key={scale}
                scaleName={scale}
                currentValues={primitives}
                defaults={scaleDefaults}
                onChangeShade={onChangePrimitive}
                onResetShade={onResetToken}
              />
            )
          })}
        </div>
      </Accordion>

      {/* Semantic token groups */}
      {SEMANTIC_GROUPS.map((group) => {
        const groupHasChanges = group.tokens.some((t) => t.name in semantic)
        return (
          <Accordion
            key={group.label}
            label={group.label}
            description={group.description}
            hasChanges={groupHasChanges}
          >
            <div className="space-y-3 pt-2">
              {group.tokens.map((token) => {
                const isOverridden = token.name in semantic
                const currentValue = semantic[token.name] || token.defaultValue

                if (token.type === 'color') {
                  return (
                    <div key={token.name} className="flex items-center gap-2">
                      <label className="w-24 text-xs text-text-secondary">{token.label}</label>
                      <input
                        type="color"
                        value={currentValue.startsWith('#') ? currentValue : '#888888'}
                        onChange={(e) => onChangeSemantic(token.name, e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded border border-border-subtle"
                      />
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => onChangeSemantic(token.name, e.target.value)}
                        className="flex-1 rounded border border-border-subtle bg-field px-2 py-1 text-xs font-mono"
                      />
                      {isOverridden && (
                        <button
                          onClick={() => onResetToken(token.name)}
                          className="text-xs text-text-tertiary hover:text-error"
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  )
                }

                // Size / number controls (slider + input)
                return (
                  <div key={token.name} className="flex items-center gap-2">
                    <label className="w-24 text-xs text-text-secondary">{token.label}</label>
                    <input
                      type="range"
                      min={token.min ?? 0}
                      max={token.max ?? 100}
                      step={token.step ?? 1}
                      value={parseFloat(currentValue) || 0}
                      onChange={(e) => {
                        const val = token.unit ? `${e.target.value}${token.unit}` : e.target.value
                        onChangeSemantic(token.name, val)
                      }}
                      className="flex-1"
                    />
                    <span className="w-16 text-right text-xs font-mono text-text-secondary">
                      {currentValue}
                    </span>
                    {isOverridden && (
                      <button
                        onClick={() => onResetToken(token.name)}
                        className="text-xs text-text-tertiary hover:text-error"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </Accordion>
        )
      })}
    </div>
  )
}
