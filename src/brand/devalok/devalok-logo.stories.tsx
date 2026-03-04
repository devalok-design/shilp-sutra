import type { Meta, StoryObj } from '@storybook/react'
import { DevalokLogo } from './devalok-logo'

const meta: Meta<typeof DevalokLogo> = {
  title: 'Brand/Devalok/Logo',
  component: DevalokLogo,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: [
        'monogram',
        'monogram-wordmark',
        'monogram-shell',
        'monogram-shell-wordmark',
        'monogram-coin-wordmark',
        'wordmark',
        'dass',
        'shloka',
        'chakra',
      ],
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
type Story = StoryObj<typeof DevalokLogo>

export const Default: Story = {
  args: { type: 'monogram', color: 'brand', size: 'lg' },
}

export const Wordmark: Story = {
  args: { type: 'wordmark', color: 'brand', size: 'lg' },
}

export const Dass: Story = {
  args: { type: 'dass', color: 'brand', size: 'lg' },
}

export const Chakra: Story = {
  name: 'Chakra (Favicon Mark)',
  args: { type: 'chakra', color: 'brand', size: 'lg' },
}

export const AllTypes: Story = {
  name: 'All Logo Types',
  render: () => (
    <div className="flex flex-col gap-6">
      {(
        [
          'monogram',
          'monogram-wordmark',
          'monogram-shell',
          'monogram-shell-wordmark',
          'monogram-coin-wordmark',
          'wordmark',
          'dass',
          'shloka',
          'chakra',
        ] as const
      ).map((type) => (
        <div key={type} className="flex items-center gap-4">
          <span className="w-56 text-sm font-mono text-text-secondary">
            {type}
          </span>
          <DevalokLogo type={type} color="brand" size="lg" />
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
        <DevalokLogo type="wordmark" color="brand" size="lg" />
        <span className="text-sm text-text-secondary">
          Brand (Padmavarna #D33163)
        </span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-01">
        <DevalokLogo type="wordmark" color="black" size="lg" />
        <span className="text-sm text-text-secondary">Black (print)</span>
      </div>
      <div className="flex items-center gap-4 p-4 rounded bg-layer-inverse">
        <DevalokLogo type="wordmark" color="white" size="lg" />
        <span className="text-sm text-white/60">
          White (dark backgrounds)
        </span>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div className="flex items-end gap-4">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <DevalokLogo type="wordmark" color="brand" size={size} />
          <span className="text-xs text-text-secondary">{size}</span>
        </div>
      ))}
    </div>
  ),
}

export const NavLink: Story = {
  name: 'Logo as Nav Link',
  render: () => (
    <DevalokLogo.Link href="/">
      <DevalokLogo type="monogram" color="brand" size="sm" />
    </DevalokLogo.Link>
  ),
}
