import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import { Badge } from './badge'
import { BadgeIndicator } from './badge-indicator'
import { BadgeGroup } from './badge-group'
import { Icon } from './icon'
import { Avatar, AvatarFallback } from './avatar'
import { DevalokGrain } from './devalok-grain'
import {
  IconPlus,
  IconCheck,
  IconTag,
  IconFilter,
  IconStar,
  IconBell,
  IconUser,
  IconMail,
  IconAlertTriangle,
  IconArrowRight,
  IconCalendar,
  IconBolt,
  IconFlame,
} from '@tabler/icons-react'

const meta: Meta<typeof Badge> = {
  title: 'UI/Core/Badge',
  component: Badge,
  tags: ['autodocs', 'stable'],
  argTypes: {
    variant: { control: 'select', options: ['subtle', 'solid', 'outline', 'soft'] },
    color: { control: 'select', options: ['default', 'accent', 'error', 'success', 'warning', 'info', 'neutral', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald', 'custom'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    dot: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    circle: { control: 'boolean' },
    maxWidth: { control: 'number' },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

// ── 1. Default ─────────────────────────────────────────────

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

// ── 2. VariantColorGrid ────────────────────────────────────

export const VariantColorGrid: Story = {
  render: () => {
    const variants = ['subtle', 'solid', 'outline', 'soft'] as const
    const colors = ['default', 'accent', 'error', 'success', 'warning', 'info', 'teal', 'indigo'] as const

    return (
      <div className="flex flex-col gap-ds-06">
        {variants.map((variant) => (
          <div key={variant}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">
              {variant}
            </p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {colors.map((color) => (
                <Badge key={`${variant}-${color}`} variant={variant} color={color} size="md">
                  {color}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  },
}

// ── 3. CustomColors ────────────────────────────────────────

export const CustomColors: Story = {
  render: () => {
    const customs = [
      { hex: '#8b5cf6', label: 'Violet' },
      { hex: '#ec4899', label: 'Pink' },
      { hex: '#06b6d4', label: 'Cyan' },
      { hex: '#84cc16', label: 'Lime' },
      { hex: '#f97316', label: 'Orange' },
    ]

    return (
      <div className="flex flex-col gap-ds-06">
        {(['subtle', 'solid', 'outline', 'soft'] as const).map((variant) => (
          <div key={variant}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">
              {variant}
            </p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {customs.map(({ hex, label }) => (
                <Badge
                  key={`${variant}-${hex}`}
                  variant={variant}
                  color="custom"
                  style={{ '--badge-color': hex } as React.CSSProperties}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  },
}

// ── 4. Interactive ─────────────────────────────────────────

export const Interactive: Story = {
  render: function InteractiveStory() {
    const labels = ['Design', 'Frontend', 'Backend', 'QA', 'DevOps']
    const [selected, setSelected] = React.useState<Set<string>>(new Set(['Design']))

    return (
      <div className="flex flex-col gap-ds-04">
        <p className="text-ds-sm text-surface-fg-muted">Click to toggle selection:</p>
        <div className="flex flex-wrap items-center gap-ds-03">
          {labels.map((label) => (
            <Badge
              key={label}
              variant="subtle"
              color="accent"
              selected={selected.has(label)}
              onClick={() => {
                setSelected((prev) => {
                  const next = new Set(prev)
                  if (next.has(label)) next.delete(label)
                  else next.add(label)
                  return next
                })
              }}
            >
              {label}
            </Badge>
          ))}
        </div>
        <p className="text-ds-xs text-surface-fg-subtle">
          Selected: {selected.size === 0 ? 'none' : [...selected].join(', ')}
        </p>
      </div>
    )
  },
}

// ── 5. Dismissible ─────────────────────────────────────────

export const Dismissible: Story = {
  render: function DismissibleStory() {
    const initial = ['React', 'TypeScript', 'Tailwind', 'Vitest', 'Storybook']
    const [tags, setTags] = React.useState(initial)

    return (
      <div className="flex flex-col gap-ds-04">
        <div className="flex flex-wrap items-center gap-ds-03">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="subtle"
              color="accent"
              onDismiss={() => setTags((prev) => prev.filter((t) => t !== tag))}
            >
              {tag}
            </Badge>
          ))}
          {tags.length === 0 && (
            <p className="text-ds-sm text-surface-fg-subtle">All cleared!</p>
          )}
        </div>
        {tags.length < initial.length && (
          <button
            type="button"
            className="text-ds-xs text-accent-11 hover:underline self-start"
            onClick={() => setTags(initial)}
          >
            Reset
          </button>
        )}
      </div>
    )
  },
}

// ── 6. WithIcons ───────────────────────────────────────────

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <div className="flex flex-wrap items-center gap-ds-03">
        <Badge startIcon={<Icon icon={IconPlus} />} color="accent">Add label</Badge>
        <Badge startIcon={<Icon icon={IconCheck} />} color="success" variant="solid">Approved</Badge>
        <Badge endIcon={<Icon icon={IconArrowRight} />} color="info">View all</Badge>
        <Badge startIcon={<Icon icon={IconAlertTriangle} />} color="warning" variant="outline">Warning</Badge>
        <Badge startIcon={<Icon icon={IconStar} />} color="amber">Featured</Badge>
      </div>
      <p className="text-ds-sm font-semibold text-surface-fg-muted">Dot indicator</p>
      <div className="flex flex-wrap items-center gap-ds-03">
        <Badge dot color="success">Online</Badge>
        <Badge dot color="warning">Away</Badge>
        <Badge dot color="error">Busy</Badge>
        <Badge dot>Offline</Badge>
      </div>
    </div>
  ),
}

// ── 7. Truncation ──────────────────────────────────────────

export const Truncation: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">maxWidth constrains long text with ellipsis:</p>
      <div className="flex flex-wrap items-center gap-ds-03">
        <Badge maxWidth={80}>Very long label text</Badge>
        <Badge maxWidth={100} color="accent">This is a much longer label that truncates</Badge>
        <Badge maxWidth={120} color="success" variant="solid">Production environment deployment status</Badge>
        <Badge maxWidth={60} color="error" variant="outline">Critical</Badge>
      </div>
    </div>
  ),
}

// ── 8. Sizes ───────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Text badges</p>
        <div className="flex flex-wrap items-end gap-ds-03">
          <Badge size="xs">xs</Badge>
          <Badge size="sm">sm</Badge>
          <Badge size="md">md</Badge>
          <Badge size="lg">lg</Badge>
        </div>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Circle (count badges)</p>
        <div className="flex flex-wrap items-end gap-ds-03">
          <Badge size="xs" circle variant="solid" color="error">3</Badge>
          <Badge size="sm" circle variant="solid" color="error">7</Badge>
          <Badge size="md" circle variant="solid" color="error">12</Badge>
          <Badge size="lg" circle variant="solid" color="accent">99</Badge>
        </div>
      </div>
    </div>
  ),
}

// ── 9. Indicator ───────────────────────────────────────────

export const Indicator: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Counts on avatars</p>
        <div className="flex flex-wrap items-center gap-ds-06">
          <BadgeIndicator count={3}>
            <Avatar className="h-10 w-10">
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>
          </BadgeIndicator>
          <BadgeIndicator count={42}>
            <Avatar className="h-10 w-10">
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </BadgeIndicator>
          <BadgeIndicator count={150} max={99}>
            <Avatar className="h-10 w-10">
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
          </BadgeIndicator>
        </div>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Dot on icons</p>
        <div className="flex flex-wrap items-center gap-ds-06">
          <BadgeIndicator dot>
            <Icon icon={IconBell} size="lg" />
          </BadgeIndicator>
          <BadgeIndicator dot color="success">
            <Icon icon={IconUser} size="lg" />
          </BadgeIndicator>
          <BadgeIndicator count={5} color="warning">
            <Icon icon={IconCalendar} size="lg" />
          </BadgeIndicator>
        </div>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Placements</p>
        <div className="flex flex-wrap items-center gap-ds-06">
          {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((placement) => (
            <BadgeIndicator key={placement} count={1} placement={placement} color="accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-ds-md bg-surface-raised-hover text-ds-xs text-surface-fg-muted">
                {placement.replace('-', '\n')}
              </div>
            </BadgeIndicator>
          ))}
        </div>
      </div>
    </div>
  ),
}

// ── 10. Group ──────────────────────────────────────────────

export const Group: Story = {
  render: () => {
    const labels = ['React', 'TypeScript', 'Tailwind', 'Vitest', 'Storybook', 'Vite', 'Radix']

    return (
      <div className="flex flex-col gap-ds-06">
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">No limit</p>
          <BadgeGroup>
            {labels.map((l) => <Badge key={l} size="sm">{l}</Badge>)}
          </BadgeGroup>
        </div>
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">max=3</p>
          <BadgeGroup max={3}>
            {labels.map((l) => <Badge key={l} size="sm">{l}</Badge>)}
          </BadgeGroup>
        </div>
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">max=1</p>
          <BadgeGroup max={1}>
            {labels.map((l) => <Badge key={l} size="sm">{l}</Badge>)}
          </BadgeGroup>
        </div>
      </div>
    )
  },
}

// ── 11. WithGrain ──────────────────────────────────────────

export const WithGrain: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <p className="text-ds-sm text-surface-fg-muted">
        Badge has <code>relative overflow-hidden isolate</code> built in, so DevalokGrain works directly:
      </p>
      <div className="flex flex-wrap items-center gap-ds-03">
        <Badge variant="solid" color="accent" size="lg">
          <DevalokGrain />
          <span>Accent grain</span>
        </Badge>
        <Badge variant="solid" color="error" size="lg">
          <DevalokGrain />
          <span>Error grain</span>
        </Badge>
        <Badge variant="solid" color="success" size="lg">
          <DevalokGrain />
          <span>Success grain</span>
        </Badge>
        <Badge variant="solid" color="indigo" size="lg">
          <DevalokGrain />
          <span>Indigo grain</span>
        </Badge>
        <Badge variant="solid" color="custom" size="lg" style={{ '--badge-color': '#8b5cf6' } as React.CSSProperties}>
          <DevalokGrain />
          <span>Custom grain</span>
        </Badge>
      </div>
    </div>
  ),
}

// ── 12. RealWorld ──────────────────────────────────────────

export const RealWorld: Story = {
  render: function RealWorldStory() {
    const [filters, setFilters] = React.useState<Set<string>>(new Set(['Active', 'High']))

    return (
      <div className="flex flex-col gap-ds-06">
        {/* Task labels */}
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Task labels</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            <Badge startIcon={<Icon icon={IconTag} />} color="accent" size="sm">Design</Badge>
            <Badge startIcon={<Icon icon={IconTag} />} color="teal" size="sm">Frontend</Badge>
            <Badge startIcon={<Icon icon={IconTag} />} color="indigo" size="sm">Backend</Badge>
            <Badge startIcon={<Icon icon={IconTag} />} color="orange" size="sm">DevOps</Badge>
          </div>
        </div>

        {/* Status badges */}
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Status badges</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            <Badge variant="solid" color="success" dot>Active</Badge>
            <Badge variant="subtle" color="warning">In Review</Badge>
            <Badge variant="outline" color="error">Blocked</Badge>
            <Badge variant="soft" color="info">Draft</Badge>
          </div>
        </div>

        {/* Filter chips */}
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Filter chips</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {['Active', 'Completed', 'High', 'Medium', 'Low'].map((f) => (
              <Badge
                key={f}
                variant="subtle"
                color={filters.has(f) ? 'accent' : 'default'}
                selected={filters.has(f)}
                size="sm"
                startIcon={filters.has(f) ? <Icon icon={IconCheck} /> : <Icon icon={IconFilter} />}
                onClick={() => {
                  setFilters((prev) => {
                    const next = new Set(prev)
                    if (next.has(f)) next.delete(f)
                    else next.add(f)
                    return next
                  })
                }}
              >
                {f}
              </Badge>
            ))}
          </div>
        </div>

        {/* Notification dots */}
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Notification dots</p>
          <div className="flex flex-wrap items-center gap-ds-06">
            <BadgeIndicator count={3}>
              <Icon icon={IconBell} size="xl" />
            </BadgeIndicator>
            <BadgeIndicator dot color="success">
              <Icon icon={IconUser} size="xl" />
            </BadgeIndicator>
            <BadgeIndicator count={12} color="warning">
              <Icon icon={IconBolt} size="xl" />
            </BadgeIndicator>
            <BadgeIndicator count={99} max={99} color="error">
              <Icon icon={IconFlame} size="xl" />
            </BadgeIndicator>
          </div>
        </div>
      </div>
    )
  },
}

// ── BadgeGroup (merged from badge-group.stories) ──────────

export const BadgeGroupDefault: Story = {
  name: 'BadgeGroup / Default',
  render: () => (
    <BadgeGroup>
      <Badge>React</Badge>
      <Badge>TypeScript</Badge>
      <Badge>Tailwind</Badge>
    </BadgeGroup>
  ),
}

export const BadgeGroupOverflow: Story = {
  name: 'BadgeGroup / Overflow',
  render: () => (
    <BadgeGroup max={3}>
      <Badge>React</Badge>
      <Badge>TypeScript</Badge>
      <Badge>Tailwind</Badge>
      <Badge>Vite</Badge>
      <Badge>Storybook</Badge>
      <Badge>Vitest</Badge>
    </BadgeGroup>
  ),
}

export const BadgeGroupOverflowClickable: Story = {
  name: 'BadgeGroup / Overflow Clickable',
  render: () => (
    <BadgeGroup max={2} onOverflowClick={() => alert('Show all tags')}>
      <Badge color="accent">Frontend</Badge>
      <Badge color="success">Backend</Badge>
      <Badge color="warning">DevOps</Badge>
      <Badge color="error">Urgent</Badge>
    </BadgeGroup>
  ),
}

export const BadgeGroupGapVariants: Story = {
  name: 'BadgeGroup / Gap Variants',
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['tight', 'default', 'loose'] as const).map((g) => (
        <div key={g} className="flex items-center gap-ds-04">
          <span className="w-16 text-xs text-text-secondary">{g}</span>
          <BadgeGroup gap={g}>
            <Badge>Alpha</Badge>
            <Badge>Beta</Badge>
            <Badge>Gamma</Badge>
          </BadgeGroup>
        </div>
      ))}
    </div>
  ),
}

// ── BadgeIndicator (merged from badge-indicator.stories) ──

export const IndicatorNotificationDot: Story = {
  name: 'BadgeIndicator / Notification Dot',
  render: () => (
    <BadgeIndicator dot>
      <Icon icon={IconBell} size="xl" />
    </BadgeIndicator>
  ),
}

export const IndicatorCount: Story = {
  name: 'BadgeIndicator / Count',
  render: () => (
    <BadgeIndicator count={5}>
      <Icon icon={IconMail} size="xl" />
    </BadgeIndicator>
  ),
}

export const IndicatorMaxOverflow: Story = {
  name: 'BadgeIndicator / Max Overflow',
  render: () => (
    <div className="flex items-center gap-ds-08">
      <BadgeIndicator count={99}>
        <Icon icon={IconMail} size="xl" />
      </BadgeIndicator>
      <BadgeIndicator count={150} max={99}>
        <Icon icon={IconMail} size="xl" />
      </BadgeIndicator>
    </div>
  ),
}

export const IndicatorColors: Story = {
  name: 'BadgeIndicator / Colors',
  render: () => (
    <div className="flex items-center gap-ds-08">
      {(['error', 'success', 'warning', 'accent', 'info'] as const).map((c) => (
        <div key={c} className="flex flex-col items-center gap-ds-03">
          <BadgeIndicator dot color={c}>
            <Icon icon={IconUser} size="xl" />
          </BadgeIndicator>
          <span className="text-xs text-text-secondary">{c}</span>
        </div>
      ))}
    </div>
  ),
}

export const IndicatorPlacements: Story = {
  name: 'BadgeIndicator / Placements',
  render: () => (
    <div className="flex items-center gap-ds-10">
      {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((p) => (
        <div key={p} className="flex flex-col items-center gap-ds-03">
          <BadgeIndicator dot placement={p}>
            <div className="h-10 w-10 rounded-ds-full bg-surface-raised flex items-center justify-center">
              <Icon icon={IconUser} size="md" />
            </div>
          </BadgeIndicator>
          <span className="text-xs text-text-secondary">{p}</span>
        </div>
      ))}
    </div>
  ),
}

export const IndicatorInvisible: Story = {
  name: 'BadgeIndicator / Invisible',
  render: () => (
    <div className="flex items-center gap-ds-08">
      <BadgeIndicator count={3}>
        <Icon icon={IconBell} size="xl" />
      </BadgeIndicator>
      <BadgeIndicator count={3} invisible>
        <Icon icon={IconBell} size="xl" />
      </BadgeIndicator>
    </div>
  ),
}
