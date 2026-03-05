import type { Meta, StoryObj } from '@storybook/react'
import { DevalokLogo } from '.'

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
  args: { type: 'monogram', color: 'brand', size: 'xl' },
}

export const Wordmark: Story = {
  args: { type: 'wordmark', color: 'brand', size: 'xl' },
}

export const Dass: Story = {
  args: { type: 'dass', color: 'brand', size: 'xl' },
}

export const Chakra: Story = {
  name: 'Chakra (Compact Mark)',
  args: { type: 'chakra', color: 'brand', size: 'xl' },
}

export const AllTypes: Story = {
  name: 'All Logo Types',
  render: () => (
    <div className="flex flex-col gap-ds-07">
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
        <div key={type} className="flex items-center gap-ds-06">
          <span className="w-56 text-ds-sm font-mono text-text-secondary shrink-0">
            {type}
          </span>
          <DevalokLogo type={type} color="brand" size="xl" />
        </div>
      ))}
    </div>
  ),
}

export const ColorVariants: Story = {
  name: 'Color Variants',
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <div className="flex items-center gap-ds-06 p-ds-08 rounded-ds-md bg-layer-01">
        <DevalokLogo type="monogram-wordmark" color="brand" size="xl" />
        <span className="text-ds-sm text-text-secondary">
          Brand — Padmavarna #D33163
        </span>
      </div>
      <div className="flex items-center gap-ds-06 p-ds-08 rounded-ds-md bg-layer-01">
        <DevalokLogo type="monogram-wordmark" color="black" size="xl" />
        <span className="text-ds-sm text-text-secondary">Black — print / single colour</span>
      </div>
      <div className="flex items-center gap-ds-06 p-ds-08 rounded-ds-md bg-layer-inverse">
        <DevalokLogo type="monogram-wordmark" color="white" size="xl" />
        <span className="text-ds-sm text-white/60">White — dark backgrounds</span>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div className="flex items-end gap-ds-07">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-ds-03">
          <DevalokLogo type="monogram" color="brand" size={size} />
          <span className="text-ds-xs text-text-secondary font-mono">{size}</span>
        </div>
      ))}
    </div>
  ),
}

export const UsageGuidelines: Story = {
  name: 'Usage Guidelines',
  render: () => (
    <div className="flex flex-col gap-10 max-w-2xl">

      {/* Prime space — full monogram */}
      <div>
        <p className="text-ds-sm font-semibold text-text-primary mb-1">
          Prime spaces — use the full monogram
        </p>
        <p className="text-ds-xs text-text-secondary mb-ds-04">
          Hero sections, splash screens, about pages, and anywhere the logo is
          the centrepiece with generous whitespace on all sides. Minimum clear
          space: 0.5× the logo height on every side.
        </p>
        <div className="flex items-center justify-center p-16 rounded-ds-md border border-border bg-layer-01">
          <DevalokLogo type="monogram-wordmark" color="brand" size="xl" />
        </div>
      </div>

      {/* Compact / repeated — chakra only */}
      <div>
        <p className="text-ds-sm font-semibold text-text-primary mb-1">
          All other contexts — use the Chakra
        </p>
        <p className="text-ds-xs text-text-secondary mb-ds-04">
          Navigation bars, footers, favicons, app icons, side drawers, loading
          indicators, and anywhere the logo appears small or repeatedly. The
          Swadhisthana Chakra is the compact mark of Devalok.
        </p>
        <div className="flex items-center gap-ds-06 p-ds-06 rounded-ds-md border border-border bg-layer-01">
          {/* Nav bar mockup */}
          <div className="flex items-center gap-ds-02 px-ds-04 py-ds-02 rounded-ds-md bg-layer-02 border border-border">
            <DevalokLogo type="chakra" color="brand" size="sm" />
            <span className="text-ds-sm text-text-primary font-medium">Devalok</span>
          </div>
          <div className="flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-ds-md bg-layer-02 border border-border">
            <DevalokLogo type="chakra" color="brand" size="xs" />
          </div>
          <div className="flex flex-col items-center gap-ds-01">
            <DevalokLogo type="chakra" color="brand" size="sm" />
            <span className="text-ds-xs text-text-secondary font-mono">footer</span>
          </div>
        </div>
      </div>

      {/* Don't do this */}
      <div>
        <p className="text-ds-sm font-semibold text-error mb-1">
          Don't — full monogram in compact contexts
        </p>
        <p className="text-ds-xs text-text-secondary mb-ds-04">
          Never use the full monogram at small sizes or cramped into a nav bar.
          The sacred geometry detail is lost and the logo looks cluttered.
        </p>
        <div className="flex items-center gap-ds-04 px-ds-04 py-ds-02 rounded-ds-md border border-error/40 bg-error/5 w-fit">
          <DevalokLogo type="monogram" color="brand" size="xs" />
          <span className="text-ds-sm text-text-primary">Navigation</span>
        </div>
      </div>

    </div>
  ),
}

export const NavLink: Story = {
  name: 'Logo as Nav Link',
  render: () => (
    <DevalokLogo.Link href="/">
      <DevalokLogo type="chakra" color="brand" size="sm" />
    </DevalokLogo.Link>
  ),
}
