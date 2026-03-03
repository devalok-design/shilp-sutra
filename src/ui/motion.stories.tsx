import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { durations } from './lib/motion'

const meta: Meta = {
  title: 'Foundations/Motion',
  tags: ['autodocs'],
}
export default meta

/**
 * Interactive visualization of all 7 duration tokens.
 * Click "Animate" to see each duration in action.
 */
export const DurationScale: StoryObj = {
  render: () => {
    const [active, setActive] = useState(false)
    const tokens = Object.entries(durations) as [string, string][]
    return (
      <div className="space-y-ds-04">
        <button
          type="button"
          onClick={() => setActive((p) => !p)}
          className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors duration-fast-01 ease-productive-standard"
        >
          {active ? 'Reset' : 'Animate'}
        </button>
        <div className="space-y-ds-03">
          {tokens.map(([name, value]) => (
            <div key={name} className="flex items-center gap-ds-04">
              <code className="w-40 text-[length:var(--font-size-xs)] text-text-secondary font-mono">
                {name} ({value})
              </code>
              <div className="relative h-8 flex-1 rounded-ds-sm bg-layer-02 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-ds-sm bg-interactive"
                  style={{
                    width: active ? '100%' : '0%',
                    transition: `width ${value} var(--ease-productive-standard)`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

/**
 * Side-by-side comparison of productive vs. expressive easing.
 * Both use 400ms duration so you can see the easing difference clearly.
 */
export const EasingComparison: StoryObj = {
  render: () => {
    const [active, setActive] = useState(false)
    const categories = ['standard', 'entrance', 'exit'] as const
    return (
      <div className="space-y-ds-04">
        <button
          type="button"
          onClick={() => setActive((p) => !p)}
          className="rounded-ds-md border border-border px-ds-04 py-ds-02 text-[length:var(--font-size-sm)] text-text-primary hover:bg-layer-02 transition-colors duration-fast-01 ease-productive-standard"
        >
          {active ? 'Reset' : 'Animate'}
        </button>
        <div className="grid grid-cols-2 gap-ds-06">
          <div>
            <h3 className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-primary mb-ds-03">
              Productive
            </h3>
            {categories.map((cat) => (
              <div key={cat} className="mb-ds-03">
                <code className="text-[length:var(--font-size-xs)] text-text-secondary">{cat}</code>
                <div className="relative h-6 mt-ds-01 rounded-ds-sm bg-layer-02 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-ds-sm bg-interactive"
                    style={{
                      width: active ? '100%' : '0%',
                      transition: `width 400ms var(--ease-productive-${cat})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-[length:var(--font-size-sm)] font-[number:var(--font-weight-semibold)] text-text-primary mb-ds-03">
              Expressive
            </h3>
            {categories.map((cat) => (
              <div key={cat} className="mb-ds-03">
                <code className="text-[length:var(--font-size-xs)] text-text-secondary">{cat}</code>
                <div className="relative h-6 mt-ds-01 rounded-ds-sm bg-layer-02 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-ds-sm bg-brand-primary"
                    style={{
                      width: active ? '100%' : '0%',
                      transition: `width 400ms var(--ease-expressive-${cat})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
