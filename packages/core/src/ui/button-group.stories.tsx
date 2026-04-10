import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconBold, IconItalic, IconUnderline, IconAlignLeft, IconAlignCenter, IconAlignRight } from '@tabler/icons-react'
import { Button } from './button'
import { Icon } from './icon'
import { ButtonGroup } from './button-group'

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/Core/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs', 'stable'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'soft', 'outline', 'ghost', 'link'],
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
    variant: 'outline',
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
    <ButtonGroup orientation="vertical" variant="outline">
      <Button>Top</Button>
      <Button>Middle</Button>
      <Button>Bottom</Button>
    </ButtonGroup>
  ),
}

/** All child buttons inherit the primary variant from the group. */
export const SharedVariant: Story = {
  render: () => (
    <ButtonGroup variant="solid">
      <Button>Save</Button>
      <Button>Update</Button>
      <Button>Publish</Button>
    </ButtonGroup>
  ),
}

/** All child buttons inherit the small size from the group. */
export const SharedSize: Story = {
  render: () => (
    <ButtonGroup size="sm" variant="outline">
      <Button>Small</Button>
      <Button>Buttons</Button>
      <Button>Group</Button>
    </ButtonGroup>
  ),
}

/** The middle button overrides the group variant with danger. */
export const OverrideChild: Story = {
  render: () => (
    <ButtonGroup variant="outline">
      <Button>Keep</Button>
      <Button variant="solid" color="error">Delete</Button>
      <Button>Cancel</Button>
    </ButtonGroup>
  ),
}

/** Buttons with startIcon props inside a group. */
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      <ButtonGroup variant="outline">
        <Button startIcon={<Icon icon={IconBold} />}>Bold</Button>
        <Button startIcon={<Icon icon={IconItalic} />}>Italic</Button>
        <Button startIcon={<Icon icon={IconUnderline} />}>Underline</Button>
      </ButtonGroup>

      <ButtonGroup variant="ghost">
        <Button startIcon={<Icon icon={IconAlignLeft} />}>Left</Button>
        <Button startIcon={<Icon icon={IconAlignCenter} />}>Center</Button>
        <Button startIcon={<Icon icon={IconAlignRight} />}>Right</Button>
      </ButtonGroup>
    </div>
  ),
}

/** All buttons disabled via the group prop. */
export const DisabledGroup: Story = {
  render: () => (
    <ButtonGroup variant="solid" disabled>
      <Button>Save</Button>
      <Button>Update</Button>
      <Button>Publish</Button>
    </ButtonGroup>
  ),
}

/** Spaced (non-attached) mode — buttons retain individual rounding. */
export const Spaced: Story = {
  render: () => (
    <ButtonGroup variant="outline" attached={false}>
      <Button>One</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </ButtonGroup>
  ),
}

/** Soft variant group. */
export const Soft: Story = {
  render: () => (
    <ButtonGroup variant="soft">
      <Button>Save</Button>
      <Button>Update</Button>
      <Button>Publish</Button>
    </ButtonGroup>
  ),
}

/** Every variant side by side for comparison. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['solid', 'soft', 'outline', 'ghost'] as const).map((v) => (
        <div key={v} className="flex items-center gap-ds-04">
          <span className="w-16 text-ds-xs text-surface-fg-subtle font-medium">{v}</span>
          <ButtonGroup variant={v}>
            <Button>Left</Button>
            <Button>Center</Button>
            <Button>Right</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
}

/** Full width — buttons stretch to fill the container. */
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <ButtonGroup variant="outline" fullWidth>
        <Button>Left</Button>
        <Button>Center</Button>
        <Button>Right</Button>
      </ButtonGroup>
    </div>
  ),
}
