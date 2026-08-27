import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { DevalokGrain } from './devalok-grain'
import { Button } from './button'
import { Badge } from './badge'
import { Icon } from './icon'
import { IconPlus, IconCheck, IconHeart, IconStar, IconSend } from '@tabler/icons-react'

const meta: Meta<typeof DevalokGrain> = {
  title: 'Utilities/DevalokGrain',
  component: DevalokGrain,
  tags: ['autodocs', 'stable'],
  argTypes: {
    intensity: { control: 'select', options: ['subtle', 'medium', 'heavy'] },
    surface: { control: 'select', options: ['solid', 'soft'] },
    sheen: { control: 'boolean' },
    animated: { control: 'boolean' },
    hoverIntensify: { control: 'boolean' },
    tint: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          '**DevalokGrain** — The Devalok brand signature. A composable noise texture + directional gradient that gives surfaces a warm, tactile, paper-like feel. Drop it inside any element with `relative overflow-hidden isolate`.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof DevalokGrain>

// ── Helpers ──

function Surface({
  children,
  className = '',
  label,
  group,
}: {
  children: React.ReactNode
  className?: string
  label?: string
  group?: boolean
}) {
  return (
    <div className="flex flex-col gap-ds-02">
      {label && (
        <span className="text-ds-xs font-medium text-surface-fg-subtle">{label}</span>
      )}
      <div
        className={`relative overflow-hidden isolate rounded-overlay-lg p-ds-06 ${group ? 'group' : ''} ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

// ── 1. Default ──

export const Default: Story = {
  render: (args) => (
    <Surface className="bg-accent-9 text-accent-fg" label="Default (solid accent)">
      <DevalokGrain {...args} />
      <p className="relative z-[2] text-ds-lg font-semibold">Devalok Grain</p>
      <p className="relative z-[2] text-ds-sm opacity-80">
        The signature texture of Devalok Design & Strategy Studio
      </p>
    </Surface>
  ),
  args: {
    intensity: 'subtle',
    surface: 'solid',
  },
}

// ── 2. Intensity Comparison ──

export const IntensityComparison: Story = {
  name: 'Intensity Levels',
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <div className="grid grid-cols-3 gap-ds-04">
        {(['subtle', 'medium', 'heavy'] as const).map((level) => (
          <Surface key={level} className="bg-accent-9 text-accent-fg" label={level}>
            <DevalokGrain intensity={level} />
            <p className="relative z-[2] text-ds-sm font-semibold">Solid surface</p>
          </Surface>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-ds-04">
        {(['subtle', 'medium', 'heavy'] as const).map((level) => (
          <Surface key={level} className="bg-accent-3 text-accent-11" label={`${level} (soft)`}>
            <DevalokGrain intensity={level} surface="soft" />
            <p className="relative z-[2] text-ds-sm font-semibold">Soft surface</p>
          </Surface>
        ))}
      </div>
    </div>
  ),
}

// ── 3. Color Tints ──

export const ColorTints: Story = {
  name: 'Color Tints',
  render: () => {
    const tints = [
      { name: 'Accent (pink)', color: 'var(--color-accent-9)', bg: 'bg-accent-9 text-accent-fg' },
      { name: 'Success (green)', color: 'var(--color-success-9)', bg: 'bg-success-9 text-success-fg' },
      { name: 'Error (red)', color: 'var(--color-error-9)', bg: 'bg-error-9 text-error-fg' },
      { name: 'Warning (amber)', color: 'var(--color-warning-9)', bg: 'bg-warning-9 text-warning-fg' },
      { name: 'Neutral', color: undefined, bg: 'bg-neutral-7 text-white' },
    ]
    return (
      <div className="grid grid-cols-5 gap-ds-04">
        {tints.map(({ name, color, bg }) => (
          <Surface key={name} className={bg} label={name}>
            <DevalokGrain tint={color} />
            <p className="relative z-[2] text-ds-sm font-semibold">{name}</p>
          </Surface>
        ))}
      </div>
    )
  },
}

// ── 4. Animated Entrance ──

export const AnimatedEntrance: Story = {
  name: 'Animated Entrance',
  render: function AnimatedStory() {
    const [key, setKey] = React.useState(0)
    return (
      <div className="flex flex-col gap-ds-04">
        <p className="text-ds-sm text-surface-fg-muted">
          Click "Remount" to see the entrance animation:
        </p>
        <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
          Remount
        </Button>
        <Surface key={key} className="bg-accent-9 text-accent-fg">
          <DevalokGrain animated intensity="medium" />
          <p className="relative z-[2] text-ds-lg font-semibold">Fades in on mount</p>
          <p className="relative z-[2] text-ds-sm opacity-80">
            600ms ease-productive-standard entrance
          </p>
        </Surface>
      </div>
    )
  },
}

// ── 5. Hover Intensify ──

export const HoverIntensify: Story = {
  name: 'Hover Intensify',
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">
        Hover over the cards to see the grain intensify. Parent needs the `group` class.
      </p>
      <div className="grid grid-cols-3 gap-ds-04">
        <Surface className="bg-accent-9 text-accent-fg cursor-pointer" label="Solid + hover" group>
          <DevalokGrain hoverIntensify />
          <p className="relative z-[2] text-ds-sm font-semibold">Hover me</p>
        </Surface>
        <Surface className="bg-success-9 text-success-fg cursor-pointer" label="Success + hover" group>
          <DevalokGrain hoverIntensify tint="var(--color-success-9)" />
          <p className="relative z-[2] text-ds-sm font-semibold">Hover me</p>
        </Surface>
        <Surface className="bg-error-9 text-error-fg cursor-pointer" label="Error + hover" group>
          <DevalokGrain hoverIntensify tint="var(--color-error-9)" />
          <p className="relative z-[2] text-ds-sm font-semibold">Hover me</p>
        </Surface>
      </div>
    </div>
  ),
}

// ── 6. On Buttons ──

export const OnButtons: Story = {
  name: 'On Buttons',
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Solid buttons with grain
        </p>
        <div className="flex flex-wrap items-center gap-ds-03">
          <Button variant="solid" startIcon={<Icon icon={IconSend} />}>
            <DevalokGrain />
            Send
          </Button>
          <Button variant="solid" color="success" startIcon={<Icon icon={IconCheck} />}>
            <DevalokGrain />
            Approve
          </Button>
          <Button variant="solid" color="error">
            <DevalokGrain />
            Delete
          </Button>
          <Button variant="solid" color="warning">
            <DevalokGrain />
            Caution
          </Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Soft pills with grain
        </p>
        <div className="flex flex-wrap items-center gap-ds-02">
          <Button variant="soft" color="accent" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>
            <DevalokGrain surface="soft" />
            In Progress
          </Button>
          <Button variant="soft" color="success" size="xs" shape="pill" startIcon={<Icon icon={IconCheck} />}>
            <DevalokGrain surface="soft" />
            Approved
          </Button>
          <Button variant="soft" color="warning" size="xs" shape="pill">
            <DevalokGrain surface="soft" />
            Draft
          </Button>
        </div>
      </div>
    </div>
  ),
}

// ── 7. On Badges ──

export const OnBadges: Story = {
  name: 'On Badges',
  render: () => (
    <div className="flex flex-wrap items-center gap-ds-03">
      <Badge variant="solid" color="accent">
        <DevalokGrain />
        Premium
      </Badge>
      <Badge variant="solid" color="success">
        <DevalokGrain />
        Verified
      </Badge>
      <Badge variant="solid" color="error">
        <DevalokGrain />
        Critical
      </Badge>
    </div>
  ),
}

// ── 8. On Cards / Surfaces ──

export const OnSurfaces: Story = {
  name: 'On Cards & Surfaces',
  render: () => (
    <div className="grid grid-cols-2 gap-ds-06">
      <Surface className="bg-accent-9 text-accent-fg" label="Hero banner">
        <DevalokGrain intensity="medium" animated tint="var(--color-accent-9)" />
        <h2 className="relative z-[2] text-ds-lg font-bold mb-ds-02">Welcome to Karm</h2>
        <p className="relative z-[2] text-ds-sm opacity-80">
          Your project management workspace, crafted by Devalok.
        </p>
      </Surface>
      <Surface className="bg-surface-panel border border-surface-border" label="Card with subtle grain">
        <DevalokGrain intensity="subtle" surface="soft" tint="var(--color-accent-9)" />
        <h3 className="relative z-[2] text-ds-sm font-semibold text-surface-fg mb-ds-01">
          Project Update
        </h3>
        <p className="relative z-[2] text-ds-xs text-surface-fg-muted">
          3 tasks completed this week. Sprint velocity is improving.
        </p>
      </Surface>
    </div>
  ),
}

// ── 9. Sheen ──

export const WithSheen: Story = {
  name: 'With Sheen (Inner Highlight)',
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">
        Sheen adds an inner highlight — light top edge, dark bottom edge — for a 3D embossed feel.
      </p>
      <div className="grid grid-cols-3 gap-ds-04">
        <Surface className="bg-accent-9 text-accent-fg" label="Grain only">
          <DevalokGrain />
          <p className="relative z-[2] text-ds-sm font-semibold">No sheen</p>
        </Surface>
        <Surface className="bg-accent-9 text-accent-fg" label="Grain + sheen">
          <DevalokGrain sheen />
          <p className="relative z-[2] text-ds-sm font-semibold">With sheen</p>
        </Surface>
        <Surface className="bg-accent-9 text-accent-fg" label="Heavy + sheen">
          <DevalokGrain intensity="heavy" sheen />
          <p className="relative z-[2] text-ds-sm font-semibold">Heavy + sheen</p>
        </Surface>
      </div>
    </div>
  ),
}

// ── 10. Full Feature Demo ──

export const FullFeatureDemo: Story = {
  name: 'Full Feature Demo',
  render: function FullDemo() {
    const [key, setKey] = React.useState(0)
    return (
      <div className="flex flex-col gap-ds-06">
        <p className="text-ds-sm text-surface-fg-muted">
          All features combined: animated entrance + hover intensify + tint + sheen.
          Hover the card and click "Remount" to replay the entrance.
        </p>
        <Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}>
          Remount
        </Button>
        <Surface
          key={key}
          className="bg-accent-9 text-accent-fg cursor-pointer"
          group
        >
          <DevalokGrain
            intensity="medium"
            animated
            hoverIntensify
            sheen
            tint="var(--color-accent-9)"
          />
          <div className="relative z-[2] flex items-center gap-ds-03 mb-ds-03">
            <Icon icon={IconHeart} size="lg" className="text-accent-fg" />
            <h2 className="text-ds-lg font-bold">Devalok Design Studio</h2>
          </div>
          <p className="relative z-[2] text-ds-sm opacity-80">
            Warm. Tactile. Handcrafted. The grain texture adds a paper-like quality
            that connects digital interfaces to physical craft.
          </p>
        </Surface>
      </div>
    )
  },
}
