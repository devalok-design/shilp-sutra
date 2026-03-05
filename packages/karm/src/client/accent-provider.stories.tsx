import type { Meta, StoryObj } from '@storybook/react'
import { AccentProvider } from './accent-provider'

const meta: Meta<typeof AccentProvider> = {
  title: 'Karm/Client/AccentProvider',
  component: AccentProvider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
}
export default meta
type Story = StoryObj<typeof AccentProvider>

// Helper decorator to visualize the CSS variables injected by AccentProvider
const AccentVisualizerDecorator = (Story: React.ComponentType) => (
  <div>
    <Story />
    <div className="flex flex-col gap-ds-04 p-ds-06 rounded-ds-xl border border-border-subtle">
      <h3 className="text-ds-sm font-semibold text-text-primary">
        AccentProvider injects CSS custom properties onto the document root. The
        swatches below read from the injected variables:
      </h3>
      <div className="flex gap-ds-03">
        <div className="flex flex-col items-center gap-ds-01">
          <div
            className="h-12 w-12 rounded-ds-lg border"
            style={{ backgroundColor: 'var(--color-accent, #ccc)' }}
          />
          <span className="text-ds-xs text-text-secondary">
            --color-accent
          </span>
        </div>
        <div className="flex flex-col items-center gap-ds-01">
          <div
            className="h-12 w-12 rounded-ds-lg border"
            style={{ backgroundColor: 'var(--color-accent-light, #eee)' }}
          />
          <span className="text-ds-xs text-text-secondary">
            --color-accent-light
          </span>
        </div>
        <div className="flex flex-col items-center gap-ds-01">
          <div
            className="h-12 w-12 rounded-ds-lg border"
            style={{ backgroundColor: 'var(--color-accent-dark, #999)' }}
          />
          <span className="text-ds-xs text-text-secondary">
            --color-accent-dark
          </span>
        </div>
      </div>
      <div className="mt-ds-02 flex items-center gap-ds-03">
        <button
          className="rounded-ds-lg px-ds-04 py-ds-02 text-ds-sm font-medium text-white"
          style={{ backgroundColor: 'var(--color-accent, #6366f1)' }}
        >
          Accent Button
        </button>
        <span
          className="rounded-ds-full px-ds-03 py-ds-01 text-ds-xs font-medium"
          style={{
            backgroundColor: 'var(--color-accent-light, #eef2ff)',
            color: 'var(--color-accent, #6366f1)',
          }}
        >
          Accent Badge
        </span>
      </div>
    </div>
  </div>
)

// ── Stories ─────────────────────────────────────────────────

export const PinkAccent: Story = {
  name: 'Pink Accent (Devalok Brand)',
  decorators: [AccentVisualizerDecorator],
  args: {
    accentCss:
      '--color-accent: #d33163; --color-accent-light: #f7e9e9; --color-accent-dark: #a12550;',
  },
}

export const BlueAccent: Story = {
  name: 'Blue Accent',
  decorators: [AccentVisualizerDecorator],
  args: {
    accentCss:
      '--color-accent: #2563eb; --color-accent-light: #dbeafe; --color-accent-dark: #1d4ed8;',
  },
}

export const GreenAccent: Story = {
  name: 'Green Accent',
  decorators: [AccentVisualizerDecorator],
  args: {
    accentCss:
      '--color-accent: #059669; --color-accent-light: #d1fae5; --color-accent-dark: #047857;',
  },
}

export const PurpleAccent: Story = {
  name: 'Purple Accent',
  decorators: [AccentVisualizerDecorator],
  args: {
    accentCss:
      '--color-accent: #7c3aed; --color-accent-light: #ede9fe; --color-accent-dark: #6d28d9;',
  },
}

export const OrangeAccent: Story = {
  name: 'Orange Accent',
  decorators: [AccentVisualizerDecorator],
  args: {
    accentCss:
      '--color-accent: #ea580c; --color-accent-light: #fff7ed; --color-accent-dark: #c2410c;',
  },
}

export const NoAccent: Story = {
  name: 'No Accent (null)',
  decorators: [AccentVisualizerDecorator],
  args: {
    accentCss: null,
  },
}

export const EmptyString: Story = {
  name: 'Empty String',
  decorators: [AccentVisualizerDecorator],
  args: {
    accentCss: '',
  },
}
