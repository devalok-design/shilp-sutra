import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import { Button } from './button'
import { Card } from './card'
import { Input } from './input'

const meta: Meta = {
  title: 'Foundations/Shape Presets',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `**Shape presets** let consumers re-skin the whole UI's roundness with a single \`[data-shape]\` attribute on \`<html>\` (or any subtree). Components reference semantic radius role tokens (\`--radius-control\`, \`--radius-surface\`, \`--radius-overlay\`, \`--radius-pill\`, etc.) — the preset blocks redeclare those tokens to make every component shift in lockstep.

Three presets ship by default: \`sharp\` (technical), \`slightly-rounded\` (the default, modern SaaS), and \`rounded\` (friendly, consumer). Pill shapes (Badge, Switch, Radio, Avatar circle) stay pill in every preset.

Override individual role tokens for fine-grained control — see the [shape customization recipe](https://shilp-sutra.devalok.in/docs/customize-brand#shape-presets).`,
      },
    },
  },
}
export default meta

type Story = StoryObj

const SAMPLE_PRESETS: { id: string; label: string; description: string }[] = [
  { id: 'sharp', label: 'Sharp', description: 'Technical, precise — Vercel / Linear / dev tools' },
  { id: 'slightly-rounded', label: 'Slightly Rounded (default)', description: 'Modern SaaS neutral — shadcn / Stripe / Notion sidebar' },
  { id: 'rounded', label: 'Rounded', description: 'Friendly, consumer — iOS / Notion content / soft landings' },
]

function PresetSample({ preset, label, description }: { preset: string; label: string; description: string }) {
  return (
    <div data-shape={preset} className="flex flex-col gap-ds-04 rounded-surface border border-surface-border bg-surface-raised p-ds-06">
      <div>
        <div className="text-ds-md font-semibold text-surface-fg">{label}</div>
        <div className="text-ds-sm text-surface-fg-muted">{description}</div>
        <code className="mt-ds-02 inline-block text-ds-xs text-surface-fg-subtle">
          [data-shape="{preset}"]
        </code>
      </div>

      <div className="flex flex-wrap items-end gap-ds-03">
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
        <Button size="md" variant="outline">outline</Button>
        <Button size="md" variant="ghost">ghost</Button>
      </div>

      <div className="flex w-full flex-col gap-ds-02">
        <Input size="md" placeholder="Medium input" />
        <Input size="lg" placeholder="Large input" />
      </div>

      <Card variant="default" className="p-ds-04">
        <div className="text-ds-md font-medium">Card surface</div>
        <div className="text-ds-sm text-surface-fg-muted">Cards use `--radius-surface`, distinct from controls.</div>
      </Card>
    </div>
  )
}

export const AllPresetsSideBySide: Story = {
  name: 'All presets side-by-side',
  render: () => (
    <div className="grid gap-ds-05 p-ds-06 md:grid-cols-3">
      {SAMPLE_PRESETS.map((p) => (
        <PresetSample key={p.id} preset={p.id} label={p.label} description={p.description} />
      ))}
    </div>
  ),
}

export const InteractiveSwitcher: Story = {
  name: 'Interactive switcher',
  render: () => {
    const [preset, setPreset] = React.useState('slightly-rounded')

    return (
      <div className="flex flex-col gap-ds-05 p-ds-06">
        <div className="flex items-center gap-ds-03">
          <span className="text-ds-sm font-medium text-surface-fg-muted">data-shape:</span>
          {SAMPLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={`rounded-control px-ds-04 py-ds-02 text-ds-sm font-medium transition-colors ${
                preset === p.id
                  ? 'bg-accent-9 text-accent-fg'
                  : 'bg-surface-raised-hover text-surface-fg-muted hover:bg-surface-raised-active'
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>

        <PresetSample
          preset={preset}
          label={SAMPLE_PRESETS.find((p) => p.id === preset)?.label ?? ''}
          description={SAMPLE_PRESETS.find((p) => p.id === preset)?.description ?? ''}
        />
      </div>
    )
  },
}

export const CustomPresetExample: Story = {
  name: 'Custom preset (override role tokens directly)',
  render: () => (
    <div className="flex flex-col gap-ds-04 p-ds-06">
      <p className="max-w-prose text-ds-sm text-surface-fg-muted">
        Beyond the three shipped presets, consumers can override any role token (`--radius-control`, `--radius-surface`, etc.) inline or per subtree. Here the wrapper sets unusually-soft controls but keeps the surface tight.
      </p>
      <div
        style={{
          // @ts-expect-error — custom-property type
          '--radius-control': '14px',
          '--radius-surface': '4px',
        }}
        className="flex flex-col gap-ds-04 rounded-surface border border-surface-border bg-surface-raised p-ds-06"
      >
        <div className="flex flex-wrap gap-ds-03">
          <Button size="md">Soft control</Button>
          <Button size="md" variant="outline">Soft control</Button>
        </div>
        <Input size="md" placeholder="Soft control" />
        <Card variant="default" className="p-ds-04">
          <div className="text-ds-md font-medium">Tight surface</div>
          <div className="text-ds-sm text-surface-fg-muted">Inherits the 4px override scoped to this card.</div>
        </Card>
      </div>
    </div>
  ),
}
