import type { Meta, StoryObj } from '@storybook/react'
import { VisuallyHidden } from './visually-hidden'

const meta: Meta<typeof VisuallyHidden> = {
  title: 'UI/Core/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof VisuallyHidden>

export const Default: Story = {
  render: () => (
    <div>
      <p className="text-sm text-text-secondary mb-4">
        The text below is visually hidden but accessible to screen readers.
        Inspect the DOM to see it.
      </p>
      <button className="inline-flex items-center justify-center w-10 h-10 rounded-ds-md border border-border">
        <span aria-hidden="true">X</span>
        <VisuallyHidden>Close dialog</VisuallyHidden>
      </button>
    </div>
  ),
}

export const IconButtonExample: Story = {
  render: () => (
    <div className="flex gap-4">
      <button className="inline-flex items-center justify-center w-10 h-10 rounded-ds-md border border-border">
        <span aria-hidden="true">+</span>
        <VisuallyHidden>Add item</VisuallyHidden>
      </button>
      <button className="inline-flex items-center justify-center w-10 h-10 rounded-ds-md border border-border">
        <span aria-hidden="true">&#9998;</span>
        <VisuallyHidden>Edit item</VisuallyHidden>
      </button>
      <button className="inline-flex items-center justify-center w-10 h-10 rounded-ds-md border border-border">
        <span aria-hidden="true">&#128465;</span>
        <VisuallyHidden>Delete item</VisuallyHidden>
      </button>
    </div>
  ),
}
