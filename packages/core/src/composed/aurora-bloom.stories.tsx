import type { Meta, StoryObj } from '@storybook/react-vite'
import { AuroraBloom } from './aurora-bloom'

const Frame = ({ children, height = '24rem' }: { children: React.ReactNode; height?: string }) => (
  <div
    className="relative isolate overflow-hidden rounded-ds-lg border border-surface-border"
    style={{ height, background: 'var(--color-surface-base)' }}
  >
    {children}
  </div>
)

const Copy = ({ label = 'Aurora preview' }: { label?: string }) => (
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-ds-03 px-ds-08 text-center">
    <div className="text-ds-xs uppercase tracking-wider text-surface-fg-subtle">{label}</div>
    <h2 className="text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] text-surface-fg max-w-2xl text-balance">
      The library that <span className="text-accent-11">looks like yours.</span>
    </h2>
  </div>
)

const meta: Meta<typeof AuroraBloom> = {
  title: 'Components/Visual/AuroraBloom',
  component: AuroraBloom,
  tags: ['autodocs', 'unstable'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Theme-reactive WebGL aurora curtain. Drop inside a `relative isolate overflow-hidden` parent.',
      },
    },
  },
  argTypes: {
    intensity: { control: 'select', options: ['subtle', 'medium', 'strong'] },
    shape: { control: 'select', options: ['curtain', 'ribbon', 'halo', 'full'] },
    position: { control: 'select', options: ['top', 'bottom', 'center', 'full'] },
    layers: { control: 'select', options: [1, 2, 3] },
    parallax: { control: 'select', options: ['mouse', 'scroll', 'off'] },
    grain: { control: 'select', options: ['paper', 'match', 'off'] },
    breathing: { control: 'boolean' },
    speed: { control: { type: 'range', min: 0, max: 1.5, step: 0.05 } },
  },
  decorators: [
    (Story) => (
      <div className="p-ds-06">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AuroraBloom>

export const Default: Story = {
  args: { intensity: 'medium', shape: 'curtain', position: 'top', layers: 2 },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy />
    </Frame>
  ),
}

export const Subtle: Story = {
  args: { intensity: 'subtle', layers: 1, parallax: 'off' },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy label="Subtle · 1 layer · static" />
    </Frame>
  ),
}

export const Strong: Story = {
  args: { intensity: 'strong', layers: 3 },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy label="Strong · 3 layers" />
    </Frame>
  ),
}

export const Halo: Story = {
  args: { shape: 'halo', position: 'center', layers: 3 },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy label="Halo · centred" />
    </Frame>
  ),
}

export const Ribbon: Story = {
  args: { shape: 'ribbon', position: 'bottom' },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy label="Ribbon · bottom" />
    </Frame>
  ),
}

export const FullBleed: Story = {
  args: { shape: 'full', position: 'full', intensity: 'subtle', layers: 3 },
  render: (args) => (
    <Frame height="32rem">
      <AuroraBloom {...args} />
      <Copy label="Full bleed · subtle" />
    </Frame>
  ),
}

export const DevalokGrain: Story = {
  args: { grain: 'match' },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy label="Devalok grain" />
    </Frame>
  ),
}

export const CustomPalette: Story = {
  args: {
    palette: {
      colors: ['#0d1117', '#1a2b4a', '#2e7df6', '#7ab8ff', '#aeefff'],
      ground: '#0d1117',
      isDark: true,
    },
  },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy label="Custom (oceanic) palette" />
    </Frame>
  ),
}

export const NoMotion: Story = {
  args: { speed: 0, parallax: 'off', breathing: false },
  render: (args) => (
    <Frame>
      <AuroraBloom {...args} />
      <Copy label="Frozen (speed=0, breathing off)" />
    </Frame>
  ),
}
