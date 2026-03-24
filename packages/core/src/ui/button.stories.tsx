import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import {
  IconPlus,
  IconArrowRight,
  IconSend,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'

const meta: Meta<typeof Button> = {
  title: 'UI/Core/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'soft', 'outline', 'ghost', 'link'],
    },
    color: {
      control: 'select',
      options: ['accent', 'error', 'success', 'warning', 'neutral'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'compact-xs', 'compact-sm', 'compact-md', 'icon-sm', 'icon-md', 'icon-lg'],
    },
    shape: { control: 'radio', options: ['default', 'pill'] },
    weight: { control: 'radio', options: ['semibold', 'normal'] },
    disabled: { control: 'boolean' },
    asChild: { control: 'boolean' },
    startIcon: { control: false },
    endIcon: { control: false },
    loading: { control: 'boolean' },
    loadingPosition: {
      control: 'select',
      options: ['start', 'end', 'center'],
    },
    fullWidth: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Primary: Story = {
  args: {
    variant: 'solid',
    children: 'Primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'outline',
    children: 'Secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Danger: Story = {
  args: {
    variant: 'solid', color: 'error',
    children: 'Danger',
  },
}

export const DangerGhost: Story = {
  args: {
    variant: 'outline', color: 'error',
    children: 'Danger Ghost',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const LinkVariant: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const IconSmall: Story = {
  args: {
    size: 'icon-sm',
    children: '+',
  },
}

export const IconMedium: Story = {
  args: {
    size: 'icon-md',
    children: '+',
  },
}

export const IconLarge: Story = {
  args: {
    size: 'icon-lg',
    children: '+',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

export const AllVariants: Story = {
  render: () => {
    const combos = [
      { variant: 'solid', color: 'default', label: 'solid' },
      { variant: 'outline', color: 'default', label: 'outline' },
      { variant: 'ghost', color: 'default', label: 'ghost' },
      { variant: 'solid', color: 'error', label: 'solid+error' },
      { variant: 'outline', color: 'error', label: 'outline+error' },
      { variant: 'ghost', color: 'error', label: 'ghost+error' },
      { variant: 'link', color: 'default', label: 'link' },
    ] as const
    const sizes = ['sm', 'md', 'lg'] as const
    return (
      <div className="flex flex-col gap-ds-06">
        {combos.map(({ variant, color, label }) => (
          <div key={label}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">{label}</p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {sizes.map((size) => (
                <Button key={`${label}-${size}`} variant={variant} color={color} size={size}>
                  {size}
                </Button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Disabled</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {combos.map(({ variant, color, label }) => (
              <Button key={label} variant={variant} color={color} disabled>
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Loading</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {combos.map(({ variant, color, label }) => (
              <Button key={label} variant={variant} color={color} loading>
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  },
}

export const AllSizes: Story = {
  render: () => {
    const sizes = ['sm', 'md', 'lg', 'icon-sm', 'icon-md', 'icon-lg'] as const
    return (
      <div className="flex flex-wrap items-center gap-ds-03">
        {sizes.map((size) => (
          <Button key={size} size={size}>
            {size.startsWith('icon') ? '+' : size}
          </Button>
        ))}
      </div>
    )
  },
}

// --- New feature stories ---

export const WithStartIcon: Story = {
  args: {
    variant: 'solid',
    startIcon: <IconPlus size={16} />,
    children: 'Add Item',
  },
}

export const WithEndIcon: Story = {
  args: {
    variant: 'solid',
    endIcon: <IconArrowRight size={16} />,
    children: 'Continue',
  },
}

export const WithBothIcons: Story = {
  args: {
    variant: 'outline',
    startIcon: <IconDownload size={16} />,
    endIcon: <IconArrowRight size={16} />,
    children: 'Download',
  },
}

export const Loading: Story = {
  args: {
    variant: 'solid',
    loading: true,
    children: 'Saving...',
  },
}

export const LoadingEnd: Story = {
  args: {
    variant: 'outline',
    loading: true,
    loadingPosition: 'end',
    endIcon: <IconSend size={16} />,
    children: 'Sending',
  },
}

export const LoadingCenter: Story = {
  args: {
    variant: 'solid',
    loading: true,
    loadingPosition: 'center',
    children: 'Processing',
  },
}

export const FullWidth: Story = {
  render: () => (
    <div className="max-w-sm">
      <Button fullWidth>Full Width Button</Button>
    </div>
  ),
}

/* ---------------------------------------------------------------------------
 * Async Button — promise-driven loading → success / error
 * ------------------------------------------------------------------------ */

export const AsyncSuccess: Story = {
  name: 'Async → Success',
  render: () => (
    <Button
      startIcon={<IconSend size={16} />}
      onClickAsync={() => new Promise((resolve) => setTimeout(resolve, 1500))}
    >
      Save changes
    </Button>
  ),
}

export const AsyncError: Story = {
  name: 'Async → Error',
  render: () => (
    <Button
      variant="solid"
      startIcon={<IconSend size={16} />}
      onClickAsync={() => new Promise((_r, reject) => setTimeout(() => reject(new Error('fail')), 1500))}
    >
      Save changes
    </Button>
  ),
}

export const AsyncAllVariants: Story = {
  name: 'Async — All Variants',
  render: () => {
    const variants = ['solid', 'outline', 'ghost'] as const
    return (
      <div className="flex flex-col gap-ds-06">
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">
            Click each — 1.5s loading → success
          </p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {variants.map((v) => (
              <Button
                key={v}
                variant={v}
                onClickAsync={() => new Promise((resolve) => setTimeout(resolve, 1500))}
              >
                {v}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">
            Click each — 1.5s loading → error
          </p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {variants.map((v) => (
              <Button
                key={v}
                variant={v}
                onClickAsync={() => new Promise((_r, reject) => setTimeout(() => reject(new Error('fail')), 1500))}
              >
                {v}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">
            Destructive — delete with error chance
          </p>
          <Button
            variant="solid"
            color="error"
            startIcon={<IconTrash size={16} />}
            onClickAsync={() =>
              new Promise((resolve, reject) =>
                setTimeout(() => (Math.random() > 0.5 ? resolve() : reject(new Error('fail'))), 1500),
              )
            }
          >
            Delete project
          </Button>
        </div>
      </div>
    )
  },
}

export const AllFeatures: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-07">
      {/* Row 1: Buttons with startIcon across all variants */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Start Icon across variants
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button variant="solid" startIcon={<IconPlus size={16} />}>
            Solid
          </Button>
          <Button variant="outline" startIcon={<IconDownload size={16} />}>
            Outline
          </Button>
          <Button variant="ghost" startIcon={<IconPlus size={16} />}>
            Ghost
          </Button>
          <Button variant="solid" color="error" startIcon={<IconTrash size={16} />}>
            Solid Error
          </Button>
          <Button variant="outline" color="error" startIcon={<IconTrash size={16} />}>
            Outline Error
          </Button>
          <Button variant="link" startIcon={<IconArrowRight size={16} />}>
            Link
          </Button>
        </div>
      </div>

      {/* Row 2: Loading states (start, end, center) */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Loading positions
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button loading loadingPosition="start">
            Loading Start
          </Button>
          <Button variant="outline" loading loadingPosition="end" endIcon={<IconSend size={16} />}>
            Loading End
          </Button>
          <Button loading loadingPosition="center">
            Loading Center
          </Button>
        </div>
      </div>

      {/* Row 3: Sizes with icons (sm, md, lg) */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Sizes with icons
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button size="sm" startIcon={<IconPlus size={14} />}>
            Small
          </Button>
          <Button size="md" startIcon={<IconPlus size={16} />}>
            Medium
          </Button>
          <Button size="lg" startIcon={<IconPlus size={18} />}>
            Large
          </Button>
          <Button size="sm" endIcon={<IconArrowRight size={14} />}>
            Small
          </Button>
          <Button size="md" endIcon={<IconArrowRight size={16} />}>
            Medium
          </Button>
          <Button size="lg" endIcon={<IconArrowRight size={18} />}>
            Large
          </Button>
        </div>
      </div>
    </div>
  ),
}

// --- V2 stories: variant×color grid, soft, pill, compact, weight, real-world ---

export const VariantColorGrid: Story = {
  name: 'Variant × Color Grid',
  render: () => {
    const variants = ['solid', 'soft', 'outline', 'ghost', 'link'] as const
    const colors = ['accent', 'error', 'success', 'warning', 'neutral'] as const
    return (
      <div className="space-y-ds-06">
        <div className="grid grid-cols-6 gap-ds-04 items-center">
          <div />
          {colors.map(c => (
            <span key={c} className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider text-center">{c}</span>
          ))}
        </div>
        {variants.map(v => (
          <div key={v} className="grid grid-cols-6 gap-ds-04 items-center">
            <span className="text-ds-xs font-semibold text-surface-fg-muted">{v}</span>
            {colors.map(c => (
              <Button key={c} variant={v} color={c} size="sm">
                {v === 'link' ? 'Action' : 'Button'}
              </Button>
            ))}
          </div>
        ))}
      </div>
    )
  },
}

export const SoftShowcase: Story = {
  name: 'Soft Variant',
  render: () => (
    <div className="space-y-ds-04">
      <div className="flex flex-wrap gap-ds-03">
        {(['accent', 'error', 'success', 'warning', 'neutral'] as const).map(c => (
          <Button key={c} variant="soft" color={c} size="sm">{c}</Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-ds-03">
        {(['accent', 'error', 'success', 'warning', 'neutral'] as const).map(c => (
          <Button key={c} variant="soft" color={c} size="sm" startIcon={<IconPlus />}>{c}</Button>
        ))}
      </div>
    </div>
  ),
}

export const PillButtons: Story = {
  name: 'Pill Shape',
  render: () => (
    <div className="space-y-ds-04">
      <div className="flex flex-wrap gap-ds-03">
        {(['accent', 'error', 'success', 'warning', 'neutral'] as const).map(c => (
          <Button key={c} variant="soft" color={c} size="xs" shape="pill">{c}</Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-ds-03">
        <Button variant="soft" color="accent" size="xs" shape="pill" startIcon={<IconPlus />}>In Progress</Button>
        <Button variant="soft" color="success" size="xs" shape="pill" startIcon={<IconPlus />}>Approved</Button>
        <Button variant="soft" color="warning" size="xs" shape="pill" startIcon={<IconPlus />}>Draft</Button>
      </div>
    </div>
  ),
}

export const CompactSizes: Story = {
  name: 'Compact Sizes',
  render: () => (
    <div className="space-y-ds-04">
      <div className="flex flex-wrap gap-ds-03 items-end">
        <Button size="compact-xs">compact-xs</Button>
        <Button size="compact-sm">compact-sm</Button>
        <Button size="compact-md">compact-md</Button>
      </div>
      <p className="text-ds-xs text-surface-fg-subtle">Compact sizes use padding-only height (no fixed h-* class). Compare with standard:</p>
      <div className="flex flex-wrap gap-ds-03 items-end">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
      </div>
    </div>
  ),
}

export const WeightNormal: Story = {
  name: 'Weight Normal',
  render: () => (
    <div className="flex gap-ds-04">
      <Button variant="ghost" color="neutral" weight="semibold">Semibold (default)</Button>
      <Button variant="ghost" color="neutral" weight="normal">Normal weight</Button>
    </div>
  ),
}

export const RealWorldPatterns: Story = {
  name: 'Real-World Patterns',
  render: () => (
    <div className="space-y-ds-08 max-w-xl">
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">Status Pills</p>
        <div className="flex flex-wrap gap-ds-02">
          <Button variant="soft" color="accent" size="xs" shape="pill" startIcon={<IconPlus />}>In Progress</Button>
          <Button variant="soft" color="neutral" size="xs" shape="pill" startIcon={<IconPlus />}>Unassigned</Button>
          <Button variant="soft" color="warning" size="xs" shape="pill" startIcon={<IconPlus />}>High</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">Review Actions</p>
        <div className="flex gap-ds-03">
          <Button variant="solid" color="success" size="sm" startIcon={<IconPlus />}>Approve</Button>
          <Button variant="outline" color="error" size="sm">Request Changes</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">Form Actions</p>
        <div className="flex gap-ds-03">
          <Button>Save Changes</Button>
          <Button variant="outline" color="neutral">Cancel</Button>
          <Button variant="solid" color="error" startIcon={<IconPlus />}>Delete</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">Popover Options (compact + normal weight)</p>
        <div className="w-48 rounded-ds-md border border-surface-border-strong p-ds-01">
          <Button variant="ghost" color="neutral" size="compact-sm" weight="normal" className="w-full justify-start">Backlog</Button>
          <Button variant="ghost" color="neutral" size="compact-sm" weight="normal" className="w-full justify-start">In Progress</Button>
          <Button variant="ghost" color="neutral" size="compact-sm" weight="normal" className="w-full justify-start">Done</Button>
        </div>
      </div>
    </div>
  ),
}
