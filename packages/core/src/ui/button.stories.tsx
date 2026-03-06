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
      options: ['solid', 'outline', 'ghost', 'link'],
    },
    color: {
      control: 'select',
      options: ['default', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'icon-sm', 'icon-md', 'icon-lg'],
    },
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
            <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary capitalize">{label}</p>
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
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Disabled</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {combos.map(({ variant, color, label }) => (
              <Button key={label} variant={variant} color={color} disabled>
                {label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Loading</p>
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

export const AllFeatures: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-07">
      {/* Row 1: Buttons with startIcon across all variants */}
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">
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
        <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">
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
        <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">
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
