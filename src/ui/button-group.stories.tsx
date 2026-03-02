import type { Meta, StoryObj } from '@storybook/react'
import { IconBold, IconItalic, IconUnderline, IconAlignLeft, IconAlignCenter, IconAlignRight } from '@tabler/icons-react'
import { Button } from './button'
import { ButtonGroup } from './button-group'

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Core/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger', 'danger-ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
}
export default meta
type Story = StoryObj<typeof ButtonGroup>

/** Default horizontal group with three buttons using the secondary variant. */
export const Default: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Left</Button>
      <Button>Center</Button>
      <Button>Right</Button>
    </ButtonGroup>
  ),
}

/** Vertical orientation stacks buttons top-to-bottom. */
export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical" variant="secondary">
      <Button>Top</Button>
      <Button>Middle</Button>
      <Button>Bottom</Button>
    </ButtonGroup>
  ),
}

/** All child buttons inherit the primary variant from the group. */
export const SharedVariant: Story = {
  render: () => (
    <ButtonGroup variant="primary">
      <Button>Save</Button>
      <Button>Update</Button>
      <Button>Publish</Button>
    </ButtonGroup>
  ),
}

/** All child buttons inherit the small size from the group. */
export const SharedSize: Story = {
  render: () => (
    <ButtonGroup size="sm" variant="secondary">
      <Button>Small</Button>
      <Button>Buttons</Button>
      <Button>Group</Button>
    </ButtonGroup>
  ),
}

/** The middle button overrides the group variant with danger. */
export const OverrideChild: Story = {
  render: () => (
    <ButtonGroup variant="secondary">
      <Button>Keep</Button>
      <Button variant="danger">Delete</Button>
      <Button>Cancel</Button>
    </ButtonGroup>
  ),
}

/** Buttons with startIcon props inside a group. */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <ButtonGroup variant="secondary">
        <Button startIcon={<IconBold />}>Bold</Button>
        <Button startIcon={<IconItalic />}>Italic</Button>
        <Button startIcon={<IconUnderline />}>Underline</Button>
      </ButtonGroup>

      <ButtonGroup variant="ghost">
        <Button startIcon={<IconAlignLeft />}>Left</Button>
        <Button startIcon={<IconAlignCenter />}>Center</Button>
        <Button startIcon={<IconAlignRight />}>Right</Button>
      </ButtonGroup>
    </div>
  ),
}
