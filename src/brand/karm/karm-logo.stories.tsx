import type { Meta, StoryObj } from '@storybook/react'
import { KarmLogo } from './karm-logo'

const meta: Meta<typeof KarmLogo> = {
  title: 'Brand/Karm/Logo',
  component: KarmLogo,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['icon', 'wordmark', 'wordmark-icon'],
    },
    color: {
      control: 'select',
      options: ['brand', 'black', 'white', 'auto'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
}
export default meta
type Story = StoryObj<typeof KarmLogo>

export const Default: Story = {
  args: { type: 'icon', color: 'brand', size: 'lg' },
}

export const AllTypes: Story = {
  name: 'All Logo Types',
  render: () => (
    <div className="flex flex-col gap-6">
      {(['icon', 'wordmark', 'wordmark-icon'] as const).map((type) => (
        <div key={type} className="flex items-center gap-4">
          <span className="w-32 text-sm font-mono text-text-secondary">
            {type}
          </span>
          <KarmLogo type={type} color="brand" size="lg" />
        </div>
      ))}
    </div>
  ),
}

export const ColorVariants: Story = {
  name: 'Color Variants',
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 p-4 rounded bg-layer-01">
        <KarmLogo type="icon" color="brand" size="lg" />
        <span className="text-sm text-text-secondary">Brand (#D33163)</span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-01">
        <KarmLogo type="icon" color="black" size="lg" />
        <span className="text-sm text-text-secondary">Black</span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-inverse">
        <KarmLogo type="icon" color="white" size="lg" />
        <span className="text-sm text-white/60">White</span>
      </div>
    </div>
  ),
}

export const NavLink: Story = {
  name: 'Logo as Nav Link',
  render: () => (
    <KarmLogo.Link href="/">
      <KarmLogo type="icon" color="brand" size="sm" />
    </KarmLogo.Link>
  ),
}
