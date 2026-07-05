import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColorInput } from './color-input'

const meta: Meta<typeof ColorInput> = {
  title: 'Components/Inputs/ColorInput',
  component: ColorInput,
  tags: ['autodocs', 'stable'],
  argTypes: {
    value: { control: 'color' },
    disabled: { control: 'boolean' },
    showPicker: { control: 'boolean' },
    defaultFormat: { control: 'select', options: ['hex', 'rgb', 'hsl'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    variant: { control: 'select', options: ['default', 'inline'] },
  },
  decorators: [
    (Story) => (
      <div className="p-ds-08">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ColorInput>

/** Default color picker with 10 named presets, interactive gradient picker, and HEX/RGB/HSL format switching. */
export const Default: Story = {
  args: {
    value: '#1479B0',
  },
}

/** Custom presets with labels for color-blind accessibility. */
export const CustomPresets: Story = {
  args: {
    value: '#D33163',
    presets: [
      { hex: '#C53637', label: 'Danger' },
      { hex: '#DF911A', label: 'Warning' },
      { hex: '#308639', label: 'Success' },
      { hex: '#1479B0', label: 'Info' },
      { hex: '#7D5FAD', label: 'Accent' },
    ],
  },
}

/** No presets — just the picker and format inputs. */
export const NoPresets: Story = {
  args: {
    value: '#1479B0',
    presets: false,
  },
}

/** Disabled state — trigger is dimmed and non-interactive. */
export const Disabled: Story = {
  args: {
    value: '#1479B0',
    disabled: true,
  },
}

/** Swatches-only mode — hides the interactive gradient picker. */
export const SwatchesOnly: Story = {
  args: {
    value: '#308639',
    showPicker: false,
  },
}

/** Start in RGB format mode. */
export const RGBFormat: Story = {
  args: {
    value: '#C53637',
    defaultFormat: 'rgb',
  },
}

/** Start in HSL format mode. */
export const HSLFormat: Story = {
  args: {
    value: '#7D5FAD',
    defaultFormat: 'hsl',
  },
}

/** Inline variant — entire trigger is the color, hex overlaid. Great for tags and labels. */
export const Inline: Story = {
  args: {
    value: '#1479B0',
    variant: 'inline',
  },
}

/** Inline variant with a light color — text auto-switches to dark for contrast. */
export const InlineLight: Story = {
  args: {
    value: '#FBBF24',
    variant: 'inline',
  },
}

/** Inline variant gallery — shows contrast-aware text across multiple colors. */
export const InlineGallery: Story = {
  render: function InlineGallery() {
    const colors = ['#C53637', '#DF911A', '#308639', '#1479B0', '#7D5FAD', '#1E293B', '#FBBF24', '#F9FAFB']
    const [selected, setSelected] = useState(colors[0])
    return (
      <div className="flex flex-wrap gap-ds-03">
        {colors.map((c) => (
          <ColorInput key={c} value={c} variant="inline" onChange={() => setSelected(c)} />
        ))}
      </div>
    )
  },
}

/** Fully controlled with live value display. */
export const Controlled: Story = {
  render: function Controlled() {
    const [color, setColor] = useState('#1479B0')
    return (
      <div className="flex flex-col gap-ds-05">
        <ColorInput value={color} onChange={setColor} />
        <div className="flex items-center gap-ds-03 text-ds-sm text-surface-fg-subtle">
          <span
            className="inline-block h-4 w-4 rounded-control-inner border border-surface-border"
            style={{ backgroundColor: color }}
          />
          <code className="font-mono">{color}</code>
        </div>
      </div>
    )
  },
}
