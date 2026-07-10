import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmojiPicker, EmojiPickerPopover, type EmojiData } from './emoji-picker'
import { Button } from '../ui/button'

const meta: Meta<typeof EmojiPicker> = {
  title: 'Components/Selectors/EmojiPicker',
  component: EmojiPicker,
  tags: ['autodocs', 'stable'],
  parameters: {
    layout: 'centered',
  },
}
export default meta
type Story = StoryObj<typeof EmojiPicker>

export const Default: Story = {
  args: {
    onSelect: (emoji: EmojiData) => {
      // eslint-disable-next-line no-console
      console.log('Selected emoji:', emoji.native)
    },
  },
}

function InPopoverDemo() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-ds-04">
      <EmojiPickerPopover
        onSelect={(emoji) => setSelected(emoji.native)}
      >
        <Button variant="soft">
          {selected ? `${selected} Change emoji` : 'Pick an emoji'}
        </Button>
      </EmojiPickerPopover>
      {selected && (
        <span className="text-ds-sm text-surface-fg-muted">
          Selected: {selected}
        </span>
      )}
    </div>
  )
}

export const InPopover: Story = {
  render: () => <InPopoverDemo />,
}

// Native-only since the frimousse migration — the picker renders each
// platform's own emoji glyphs. The former apple/google/twitter/facebook
// art-style stories were removed with `@emoji-mart/react`.
