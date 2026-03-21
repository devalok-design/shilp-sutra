import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ColorInput } from './color-input'

const meta: Meta<typeof ColorInput> = {
  title: 'UI/Core/ColorInput',
  component: ColorInput,
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'color' },
    disabled: { control: 'boolean' },
    showPicker: { control: 'boolean' },
    defaultFormat: { control: 'select', options: ['hex', 'rgb', 'hsl'] },
    align: { control: 'select', options: ['start', 'center', 'end'] },
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
    value: '#6366F1',
  },
}

/** Custom presets with labels for color-blind accessibility. */
export const CustomPresets: Story = {
  args: {
    value: '#D33163',
    presets: [
      { hex: '#EF4444', label: 'Danger' },
      { hex: '#F59E0B', label: 'Warning' },
      { hex: '#10B981', label: 'Success' },
      { hex: '#3B82F6', label: 'Info' },
      { hex: '#8B5CF6', label: 'Accent' },
    ],
  },
}

/** No presets — just the picker and format inputs. */
export const NoPresets: Story = {
  args: {
    value: '#3B82F6',
    presets: false,
  },
}

/** Disabled state — trigger is dimmed and non-interactive. */
export const Disabled: Story = {
  args: {
    value: '#6366F1',
    disabled: true,
  },
}

/** Swatches-only mode — hides the interactive gradient picker. */
export const SwatchesOnly: Story = {
  args: {
    value: '#10B981',
    showPicker: false,
  },
}

/** Start in RGB format mode. */
export const RGBFormat: Story = {
  args: {
    value: '#EF4444',
    defaultFormat: 'rgb',
  },
}

/** Start in HSL format mode. */
export const HSLFormat: Story = {
  args: {
    value: '#8B5CF6',
    defaultFormat: 'hsl',
  },
}

/** Fully controlled with live value display. */
export const Controlled: Story = {
  render: function Controlled() {
    const [color, setColor] = useState('#3B82F6')
    return (
      <div className="flex flex-col gap-ds-05">
        <ColorInput value={color} onChange={setColor} />
        <div className="flex items-center gap-ds-03 text-ds-sm text-surface-fg-subtle">
          <span
            className="inline-block h-4 w-4 rounded-ds-sm border border-surface-border"
            style={{ backgroundColor: color }}
          />
          <code className="font-mono">{color}</code>
        </div>
      </div>
    )
  },
}
