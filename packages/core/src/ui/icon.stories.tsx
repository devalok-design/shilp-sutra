import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './icon'
import { IconProvider } from './icon-context'
import { IconGroup } from './icon-group'
import { Button } from './button'
import { DevalokGrain } from './devalok-grain'
import {
  IconPlus, IconCheck, IconTrash, IconSend, IconSearch,
  IconBold, IconItalic, IconUnderline, IconStrikethrough, IconLink,
  IconBell, IconLoader2, IconChevronDown, IconHeart,
  IconEye, IconLock, IconArrowRight,
} from '@tabler/icons-react'
import * as React from 'react'

const meta: Meta<typeof Icon> = {
  title: 'UI/Core/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] },
    stroke: { control: 'select', options: ['light', 'regular', 'bold'] },
    animate: { control: 'select', options: ['spin', 'pulse', 'bounce', 'none'] },
    state: { control: 'select', options: ['idle', 'loading', 'success', 'error'] },
  },
}
export default meta
type Story = StoryObj<typeof Icon>

/* ── 1. Default ─────────────────────────────────────────────────────── */

export const Default: Story = {
  args: {
    icon: IconPlus,
    size: 'md',
    stroke: 'regular',
  },
}

/* ── 2. Size Scale ──────────────────────────────────────────────────── */

export const SizeScale: Story = {
  render: () => (
    <div className="flex items-end gap-ds-06">
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((s) => (
        <div key={s} className="flex flex-col items-center gap-ds-02">
          <Icon icon={IconPlus} size={s} />
          <span className="text-xs text-text-secondary">{s}</span>
        </div>
      ))}
    </div>
  ),
}

/* ── 3. Stroke Weights ──────────────────────────────────────────────── */

export const StrokeWeights: Story = {
  render: () => (
    <div className="grid grid-cols-4 items-center gap-ds-04">
      {/* header row */}
      <span />
      {(['light', 'regular', 'bold'] as const).map((w) => (
        <span key={w} className="text-xs font-medium text-text-secondary text-center">{w}</span>
      ))}
      {/* size rows */}
      {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <React.Fragment key={s}>
          <span className="text-xs text-text-secondary">{s}</span>
          {(['light', 'regular', 'bold'] as const).map((w) => (
            <div key={w} className="flex justify-center">
              <Icon icon={IconHeart} size={s} stroke={w} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  ),
}

/* ── 4. In Button (context-driven sizing) ───────────────────────────── */

export const InButton: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-ds-04">
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
        <Button key={s} size={s} startIcon={<Icon icon={IconPlus} />}>
          {s}
        </Button>
      ))}
    </div>
  ),
}

/* ── 5. IconGroup Toolbar ───────────────────────────────────────────── */

export const IconGroupToolbar: Story = {
  render: () => (
    <div className="inline-flex rounded-ds-md border border-surface-border p-ds-01">
      <IconGroup size="md" stroke="regular" gap="tight" role="toolbar" label="Text formatting">
        <Icon icon={IconBold} />
        <Icon icon={IconItalic} />
        <Icon icon={IconUnderline} />
        <Icon icon={IconStrikethrough} />
        <Icon icon={IconLink} />
      </IconGroup>
    </div>
  ),
}

/* ── 6. Animation Presets ───────────────────────────────────────────── */

export const AnimatePresets: Story = {
  render: () => (
    <div className="flex items-center gap-ds-08">
      <div className="flex flex-col items-center gap-ds-02">
        <Icon icon={IconLoader2} size="xl" animate="spin" />
        <span className="text-xs text-text-secondary">spin</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <Icon icon={IconBell} size="xl" animate="pulse" />
        <span className="text-xs text-text-secondary">pulse</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <Icon icon={IconChevronDown} size="xl" animate="bounce" />
        <span className="text-xs text-text-secondary">bounce</span>
      </div>
    </div>
  ),
}

/* ── 7. State Machine ───────────────────────────────────────────────── */

export const StateMachine: Story = {
  render: () => {
    const [state, setState] = React.useState<'idle' | 'loading' | 'success'>('idle')

    const cycle = () => {
      setState('loading')
      setTimeout(() => setState('success'), 1500)
      setTimeout(() => setState('idle'), 3000)
    }

    return (
      <div className="flex items-center gap-ds-04">
        <Button onClick={cycle} disabled={state !== 'idle'}>
          Cycle state
        </Button>
        <Icon icon={IconSend} size="xl" state={state} />
        <span className="text-sm text-text-secondary font-mono">{state}</span>
      </div>
    )
  },
}

/* ── 8. Accessibility ───────────────────────────────────────────────── */

export const Accessibility: Story = {
  render: () => (
    <div className="flex items-center gap-ds-08">
      <div className="flex flex-col items-center gap-ds-02">
        <Icon icon={IconSearch} size="lg" />
        <span className="text-xs text-text-secondary">decorative (aria-hidden)</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <Icon icon={IconPlus} size="lg" label="Add item" />
        <span className="text-xs text-text-secondary">label=&quot;Add item&quot;</span>
      </div>
    </div>
  ),
}

/* ── 9. With Grain ──────────────────────────────────────────────────── */

export const WithGrain: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-ds-04">
      <Button variant="solid" color="success" startIcon={<Icon icon={IconCheck} />}>
        <DevalokGrain />
        Approve
      </Button>
      <Button variant="solid" color="error" startIcon={<Icon icon={IconTrash} />}>
        <DevalokGrain />
        Delete
      </Button>
      <Button variant="solid" startIcon={<Icon icon={IconArrowRight} />}>
        <DevalokGrain />
        Continue
      </Button>
    </div>
  ),
}

/* ── 10. Migration Guide ────────────────────────────────────────────── */

export const MigrationGuide: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-ds-06 rounded-ds-lg border border-surface-border p-ds-06">
      <div className="flex flex-col gap-ds-03">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Before</span>
        <code className="text-sm text-text-tertiary">{'startIcon={<IconPlus />}'}</code>
        <Button size="md" startIcon={<IconPlus size={18} />}>
          Add task
        </Button>
      </div>
      <div className="flex flex-col gap-ds-03">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">After</span>
        <code className="text-sm text-text-tertiary">{'startIcon={<Icon icon={IconPlus} />}'}</code>
        <Button size="md" startIcon={<Icon icon={IconPlus} />}>
          Add task
        </Button>
      </div>
    </div>
  ),
}
