import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import { Icon } from './icon'
import { DevalokGrain } from './devalok-grain'
import type { GrainIntensity } from './devalok-grain'
import {
  IconPlus,
  IconArrowRight,
  IconSend,
  IconDownload,
  IconTrash,
  IconCheck,
  IconEye,
  IconLock,
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
      { variant: 'solid', color: 'accent', label: 'solid' },
      { variant: 'soft', color: 'accent', label: 'soft' },
      { variant: 'outline', color: 'accent', label: 'outline' },
      { variant: 'ghost', color: 'accent', label: 'ghost' },
      { variant: 'solid', color: 'error', label: 'solid+error' },
      { variant: 'soft', color: 'error', label: 'soft+error' },
      { variant: 'outline', color: 'error', label: 'outline+error' },
      { variant: 'ghost', color: 'error', label: 'ghost+error' },
      { variant: 'solid', color: 'success', label: 'solid+success' },
      { variant: 'soft', color: 'success', label: 'soft+success' },
      { variant: 'solid', color: 'warning', label: 'solid+warning' },
      { variant: 'soft', color: 'warning', label: 'soft+warning' },
      { variant: 'solid', color: 'neutral', label: 'solid+neutral' },
      { variant: 'soft', color: 'neutral', label: 'soft+neutral' },
      { variant: 'link', color: 'accent', label: 'link' },
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
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Standard</p>
        <div className="flex flex-wrap items-end gap-ds-03">
          {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
            <Button key={size} size={size}>{size}</Button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Compact (padding-only height)</p>
        <div className="flex flex-wrap items-end gap-ds-03">
          {(['compact-xs', 'compact-sm', 'compact-md'] as const).map((size) => (
            <Button key={size} size={size}>{size.replace('compact-', 'c-')}</Button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Icon</p>
        <div className="flex flex-wrap items-end gap-ds-03">
          {(['icon-sm', 'icon-md', 'icon-lg'] as const).map((size) => (
            <Button key={size} size={size}>+</Button>
          ))}
        </div>
      </div>
    </div>
  ),
}

// --- New feature stories ---

export const WithStartIcon: Story = {
  args: {
    variant: 'solid',
    startIcon: <Icon icon={IconPlus} />,
    children: 'Add Item',
  },
}

export const WithEndIcon: Story = {
  args: {
    variant: 'solid',
    endIcon: <Icon icon={IconArrowRight} />,
    children: 'Continue',
  },
}

export const WithBothIcons: Story = {
  args: {
    variant: 'outline',
    startIcon: <Icon icon={IconDownload} />,
    endIcon: <Icon icon={IconArrowRight} />,
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
    endIcon: <Icon icon={IconSend} />,
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
      startIcon={<Icon icon={IconSend} />}
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
      startIcon={<Icon icon={IconSend} />}
      onClickAsync={() => new Promise((_r, reject) => setTimeout(() => reject(new Error('fail')), 1500))}
    >
      Save changes
    </Button>
  ),
}

export const AsyncAllVariants: Story = {
  name: 'Async — All Variants',
  render: () => {
    const variants = ['solid', 'soft', 'outline', 'ghost'] as const
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
            startIcon={<Icon icon={IconTrash} />}
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
      {/* Row 1: Icons across all variants */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Start Icon across variants
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button variant="solid" startIcon={<Icon icon={IconPlus} />}>Solid</Button>
          <Button variant="soft" startIcon={<Icon icon={IconPlus} />}>Soft</Button>
          <Button variant="outline" startIcon={<Icon icon={IconDownload} />}>Outline</Button>
          <Button variant="ghost" startIcon={<Icon icon={IconPlus} />}>Ghost</Button>
          <Button variant="solid" color="error" startIcon={<Icon icon={IconTrash} />}>Error</Button>
          <Button variant="soft" color="success" startIcon={<Icon icon={IconPlus} />}>Success</Button>
          <Button variant="link" startIcon={<Icon icon={IconArrowRight} />}>Link</Button>
        </div>
      </div>

      {/* Row 2: Pill + soft across colors */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Pill shape + soft variant
        </p>
        <div className="flex flex-wrap items-center gap-ds-03">
          <Button variant="soft" color="accent" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>Accent</Button>
          <Button variant="soft" color="error" size="xs" shape="pill" startIcon={<Icon icon={IconTrash} />}>Error</Button>
          <Button variant="soft" color="success" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>Success</Button>
          <Button variant="soft" color="warning" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>Warning</Button>
          <Button variant="soft" color="neutral" size="xs" shape="pill">Neutral</Button>
        </div>
      </div>

      {/* Row 3: Loading states */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Loading positions
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button loading loadingPosition="start">Start</Button>
          <Button variant="outline" loading loadingPosition="end" endIcon={<Icon icon={IconSend} />}>End</Button>
          <Button loading loadingPosition="center">Center</Button>
          <Button variant="soft" color="success" loading>Soft loading</Button>
        </div>
      </div>

      {/* Row 4: Sizes with icons */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Sizes with icons
        </p>
        <div className="flex flex-wrap items-end gap-ds-04">
          <Button size="xs" startIcon={<Icon icon={IconPlus} />}>xs</Button>
          <Button size="sm" startIcon={<Icon icon={IconPlus} />}>sm</Button>
          <Button size="md" startIcon={<Icon icon={IconPlus} />}>md</Button>
          <Button size="lg" startIcon={<Icon icon={IconPlus} />}>lg</Button>
        </div>
        <div className="flex flex-wrap items-end gap-ds-04 mt-ds-03">
          <Button size="compact-xs" startIcon={<Icon icon={IconPlus} />}>c-xs</Button>
          <Button size="compact-sm" startIcon={<Icon icon={IconPlus} />}>c-sm</Button>
          <Button size="compact-md" startIcon={<Icon icon={IconPlus} />}>c-md</Button>
        </div>
      </div>

      {/* Row 5: Weight comparison */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Weight: semibold vs normal
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button variant="ghost" color="neutral">Semibold (default)</Button>
          <Button variant="ghost" color="neutral" weight="normal">Normal weight</Button>
          <Button variant="soft" color="accent">Semibold</Button>
          <Button variant="soft" color="accent" weight="normal">Normal</Button>
        </div>
      </div>

      {/* Row 6: Disabled */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">
          Disabled (opacity + desaturate)
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button disabled>Solid</Button>
          <Button variant="soft" color="success" disabled>Soft</Button>
          <Button variant="outline" color="error" disabled>Outline</Button>
          <Button variant="ghost" disabled>Ghost</Button>
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
          <Button key={c} variant="soft" color={c} size="sm" startIcon={<Icon icon={IconPlus} />}>{c}</Button>
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
        <Button variant="soft" color="accent" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>In Progress</Button>
        <Button variant="soft" color="success" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>Approved</Button>
        <Button variant="soft" color="warning" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>Draft</Button>
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

export const IconStrokeWeight: Story = {
  name: 'Icon Stroke Weight',
  render: () => (
    <div className="space-y-ds-06">
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Regular stroke (default) — all sizes
        </p>
        <div className="flex flex-wrap items-end gap-ds-04">
          <Button size="xs" startIcon={<Icon icon={IconPlus} />}>xs</Button>
          <Button size="sm" startIcon={<Icon icon={IconPlus} />}>sm</Button>
          <Button size="md" startIcon={<Icon icon={IconPlus} />}>md</Button>
          <Button size="lg" startIcon={<Icon icon={IconPlus} />}>lg</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Light stroke — all sizes
        </p>
        <div className="flex flex-wrap items-end gap-ds-04">
          <Button size="xs" startIcon={<Icon icon={IconPlus} stroke="light" />}>xs (light)</Button>
          <Button size="sm" startIcon={<Icon icon={IconPlus} stroke="light" />}>sm (light)</Button>
          <Button size="md" startIcon={<Icon icon={IconPlus} stroke="light" />}>md (light)</Button>
          <Button size="lg" startIcon={<Icon icon={IconPlus} stroke="light" />}>lg (light)</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Comparison across variants (light vs regular)
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button variant="solid" startIcon={<Icon icon={IconPlus} />}>regular</Button>
          <Button variant="solid" startIcon={<Icon icon={IconPlus} stroke="light" />}>light</Button>
          <Button variant="soft" color="success" startIcon={<Icon icon={IconCheck} />}>regular</Button>
          <Button variant="soft" color="success" startIcon={<Icon icon={IconCheck} stroke="light" />}>light</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          With grain (light stroke)
        </p>
        <div className="flex flex-wrap items-center gap-ds-04">
          <Button variant="solid" startIcon={<Icon icon={IconPlus} stroke="light" />}>
            <DevalokGrain />
            Save
          </Button>
          <Button variant="solid" color="success" startIcon={<Icon icon={IconCheck} stroke="light" />}>
            <DevalokGrain />
            Approve
          </Button>
          <Button variant="soft" color="warning" size="xs" shape="pill" startIcon={<Icon icon={IconEye} stroke="light" />}>
            <DevalokGrain surface="soft" />
            Draft
          </Button>
        </div>
      </div>
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
          <Button variant="soft" color="accent" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>In Progress</Button>
          <Button variant="soft" color="neutral" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>Unassigned</Button>
          <Button variant="soft" color="warning" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>High</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">Review Actions</p>
        <div className="flex gap-ds-03">
          <Button variant="solid" color="success" size="sm" startIcon={<Icon icon={IconCheck} />}>Approve</Button>
          <Button variant="outline" color="error" size="sm">Request Changes</Button>
        </div>
      </div>
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">Form Actions</p>
        <div className="flex gap-ds-03">
          <Button>Save Changes</Button>
          <Button variant="outline" color="neutral">Cancel</Button>
          <Button variant="solid" color="error" startIcon={<Icon icon={IconTrash} />}>Delete</Button>
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

// --- Devalok Grain stories ---

export const DevalokGrainShowcase: Story = {
  name: 'Devalok Grain',
  render: () => {
    const intensities: GrainIntensity[] = ['subtle', 'medium', 'heavy']
    const colors = ['accent', 'error', 'success', 'warning', 'neutral'] as const
    return (
      <div className="space-y-ds-08">
        <div>
          <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
            Intensity comparison — solid
          </p>
          <div className="space-y-ds-04">
            {intensities.map(i => (
              <div key={i} className="flex flex-wrap items-center gap-ds-04">
                <span className="text-ds-xs font-semibold text-surface-fg-muted w-16">{i}</span>
                {colors.map(c => (
                  <Button key={c} variant="solid" color={c} size="sm">
                    <DevalokGrain intensity={i} />
                    {c}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
            Intensity comparison — soft
          </p>
          <div className="space-y-ds-04">
            {intensities.map(i => (
              <div key={i} className="flex flex-wrap items-center gap-ds-04">
                <span className="text-ds-xs font-semibold text-surface-fg-muted w-16">{i}</span>
                {colors.map(c => (
                  <Button key={c} variant="soft" color={c} size="sm">
                    <DevalokGrain intensity={i} surface="soft" />
                    {c}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
            Progressive polish — side by side
          </p>
          <div className="flex flex-wrap items-center gap-ds-04">
            <Button variant="solid">Plain</Button>
            <Button variant="solid">
              <DevalokGrain />
              + Grain
            </Button>
            <Button variant="solid">
              <DevalokGrain sheen />
              + Grain + Sheen
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-ds-04 mt-ds-03">
            <Button variant="soft" color="success">Plain</Button>
            <Button variant="soft" color="success">
              <DevalokGrain surface="soft" />
              + Grain
            </Button>
            <Button variant="soft" color="success">
              <DevalokGrain surface="soft" sheen />
              + Grain + Sheen
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-ds-04 mt-ds-03">
            <Button variant="solid" color="error">Plain</Button>
            <Button variant="solid" color="error">
              <DevalokGrain />
              + Grain
            </Button>
            <Button variant="solid" color="error">
              <DevalokGrain sheen />
              + Grain + Sheen
            </Button>
          </div>
        </div>

        <div>
          <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
            Pill + grain
          </p>
          <div className="flex flex-wrap items-center gap-ds-03">
            <Button variant="soft" color="accent" size="xs" shape="pill" startIcon={<Icon icon={IconPlus} />}>
              <DevalokGrain surface="soft" />
              In Progress
            </Button>
            <Button variant="soft" color="success" size="xs" shape="pill" startIcon={<Icon icon={IconCheck} />}>
              <DevalokGrain surface="soft" />
              Approved
            </Button>
            <Button variant="soft" color="warning" size="xs" shape="pill" startIcon={<Icon icon={IconEye} />}>
              <DevalokGrain surface="soft" />
              Draft
            </Button>
          </div>
        </div>
      </div>
    )
  },
}

export const DevalokGrainRealWorld: Story = {
  name: 'Devalok Grain — Real World',
  render: () => (
    <div className="space-y-ds-08 max-w-xl">
      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Review Actions (with grain)
        </p>
        <div className="flex gap-ds-03">
          <Button variant="solid" color="success" size="sm" startIcon={<Icon icon={IconCheck} />}>
            <DevalokGrain />
            Approve
          </Button>
          <Button variant="solid" color="error" size="sm">
            <DevalokGrain />
            Reject
          </Button>
          <Button variant="outline" color="neutral" size="sm">Cancel</Button>
        </div>
      </div>

      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Form Actions (with grain on primary only)
        </p>
        <div className="flex gap-ds-03">
          <Button>
            <DevalokGrain />
            Save Changes
          </Button>
          <Button variant="outline" color="neutral">Cancel</Button>
          <Button variant="solid" color="error" startIcon={<Icon icon={IconTrash} />}>
            <DevalokGrain />
            Delete
          </Button>
        </div>
      </div>

      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Status Pills (with grain)
        </p>
        <div className="flex flex-wrap gap-ds-02">
          <Button variant="soft" color="accent" size="xs" shape="pill">
            <DevalokGrain surface="soft" />
            In Progress
          </Button>
          <Button variant="soft" color="neutral" size="xs" shape="pill">
            <DevalokGrain surface="soft" />
            Unassigned
          </Button>
          <Button variant="soft" color="warning" size="xs" shape="pill">
            <DevalokGrain surface="soft" />
            High Priority
          </Button>
        </div>
      </div>

      <div>
        <p className="text-ds-xs font-semibold text-surface-fg-subtle uppercase tracking-wider mb-ds-03">
          Visibility Toggle (with grain)
        </p>
        <div className="flex gap-ds-03">
          <Button variant="soft" color="success" size="xs" shape="pill" startIcon={<Icon icon={IconEye} />}>
            <DevalokGrain surface="soft" />
            Client
          </Button>
          <Button variant="soft" color="neutral" size="xs" shape="pill" startIcon={<Icon icon={IconLock} />}>
            <DevalokGrain surface="soft" />
            Internal
          </Button>
        </div>
      </div>
    </div>
  ),
}
