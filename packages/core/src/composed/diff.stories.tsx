import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Diff } from './diff'

const meta: Meta<typeof Diff> = {
  title: 'Components/Data/Diff',
  component: Diff,
  tags: ['autodocs', 'beta'],
  parameters: {
    docs: {
      description: {
        component:
          'Version-compare viewer. Renders the difference between two versions of text — added / removed / changed — split or inline, line or word level, plus a structured `fields` mode for JSON and per-hunk accept/reject for review flows.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Diff>

// A prose brand-voice dimension (markdown) — committed vs pending.
const proseBefore = `Our voice is warm and direct. We write short sentences.

We avoid jargon and speak plainly to every client.`

const proseAfter = `Our voice is warm, direct, and specific. We write short, load-bearing sentences.

We avoid jargon and speak plainly to every client, in their own register.`

// A structured (YAML-shaped, shown as JSON) dimension — committed vs pending.
const jsonBefore = JSON.stringify(
  {
    tagline: 'Different by Design',
    palette: { primary: '#d33163', structure: '#712846' },
    tone: ['warm', 'direct'],
    channels: { email: 'formal' },
  },
  null,
  2,
)

const jsonAfter = JSON.stringify(
  {
    tagline: 'Different by Design',
    palette: { primary: '#d33163', structure: '#5e2039' },
    tone: ['warm', 'direct', 'specific'],
    channels: { email: 'warm-formal', social: 'fiery' },
  },
  null,
  2,
)

// A longer config to show collapse of unchanged runs.
const configBefore = `name: setu
version: 0.49.2
theme:
  ground: white
  accent: padmavarna
  radius: 12
features:
  diff: false
  review: false
  history: true
  export: true
runtime:
  node: 20
  react: 19`

const configAfter = `name: setu
version: 0.50.0
theme:
  ground: white
  accent: padmavarna
  radius: 12
features:
  diff: true
  review: true
  history: true
  export: true
runtime:
  node: 20
  react: 19`

export const InlineLine: Story = {
  args: { before: configBefore, after: configAfter, mode: 'inline', granularity: 'line' },
}

export const SplitLine: Story = {
  args: { before: configBefore, after: configAfter, mode: 'split', granularity: 'line' },
}

export const WordProse: Story = {
  name: 'Word (prose)',
  args: { before: proseBefore, after: proseAfter, granularity: 'word' },
}

export const Fields: Story = {
  name: 'Fields (structured)',
  args: { before: jsonBefore, after: jsonAfter, mode: 'fields' },
}

export const SplitWordHighlight: Story = {
  name: 'Split + intra-line words',
  args: { before: proseBefore, after: proseAfter, mode: 'split', granularity: 'line' },
}

export const CollapseUnchanged: Story = {
  name: 'Collapse unchanged',
  render: (args) => (
    <div style={{ maxWidth: 640 }}>
      <Diff {...args} />
    </div>
  ),
  args: { before: configBefore, after: configAfter, mode: 'inline', collapseThreshold: 4, contextLines: 2 },
}

export const WithReviewControls: Story = {
  name: 'Review (accept / reject)',
  render: (args) => {
    const [log, setLog] = React.useState<string[]>([])
    return (
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Diff
          {...args}
          onAcceptHunk={(h) => setLog((l) => [`Accepted change #${h.index + 1}`, ...l])}
          onRejectHunk={(h) => setLog((l) => [`Rejected change #${h.index + 1}`, ...l])}
        />
        <div style={{ fontSize: 13, color: 'var(--color-surface-fg-subtle)', fontFamily: 'var(--font-mono, monospace)' }}>
          {log.length === 0 ? 'Hover a change, then Accept (✓) or Reject (✕)…' : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    )
  },
  args: { before: configBefore, after: configAfter, mode: 'split', granularity: 'line' },
}

/** Compose your own layout from the parts: custom header + scrollable body. */
export const Composable: Story = {
  render: () => (
    <div style={{ maxWidth: 720, borderRadius: 12, border: '1px solid var(--color-surface-border)', overflow: 'hidden', background: 'var(--color-surface-2)' }}>
      <Diff.Root before={configBefore} after={configAfter} mode="split">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-surface-border-subtle)' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-surface-fg)' }}>setu.config.yaml</span>
            <Diff.ColumnLabels />
          </div>
          <Diff.Summary />
        </div>
        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
          <Diff.Body />
        </div>
      </Diff.Root>
    </div>
  ),
}

/**
 * Border experiment — same Diff, three card-edge treatments, on the page ground.
 * Toggle Storybook's light/dark to judge separation in both. Pick A, B, or C to
 * set the DS-wide card-edge rule (anti-slop program Phase 0).
 */
export const BorderExperiment: Story = {
  name: 'Border experiment (pick one)',
  render: () => {
    const label = (t: string) => (
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-surface-fg-subtle)', marginBottom: 8 }}>{t}</div>
    )
    return (
      <div style={{ background: 'var(--color-surface-1)', padding: 24, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 28, width: 760, maxWidth: '100%' }}>
        <div>
          {label('A · Current — 1px surface-border')}
          <Diff before={configBefore} after={configAfter} mode="split" />
        </div>
        <div>
          {label('B · Setu tonal — no border, surface shade only')}
          <Diff before={configBefore} after={configAfter} mode="split" className="border-0" />
        </div>
        <div>
          {label('C · Hairline — border-subtle (full alpha)')}
          <Diff before={configBefore} after={configAfter} mode="split" className="border-surface-border-subtle" />
        </div>
        <div>
          {label('D · Fainter — border-subtle / 50%')}
          <Diff before={configBefore} after={configAfter} mode="split" className="border-surface-border-subtle/50" />
        </div>
        <div>
          {label('E · Faintest — border-subtle / 30%')}
          <Diff before={configBefore} after={configAfter} mode="split" className="border-surface-border-subtle/30" />
        </div>
      </div>
    )
  },
}
