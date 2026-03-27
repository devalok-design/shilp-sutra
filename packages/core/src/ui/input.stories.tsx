import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { IconSearch, IconX, IconMail, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react'
import { Input } from './input'
import { Icon } from './icon'
import { Button } from './button'
import { Label } from './label'

const meta: Meta<typeof Input> = {
  title: 'UI/Core/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg'] },
    state: { control: 'select', options: ['default', 'error', 'warning', 'success'] },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Input>

/** Basic input with Storybook controls for size, state, disabled, and readOnly. */
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

/** All four sizes side-by-side, each with a search icon to show automatic icon scaling. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-sm">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-ds-01">
          <Label className="text-ds-xs text-surface-fg-muted uppercase tracking-wider">{size}</Label>
          <Input
            size={size}
            startSection={<Icon icon={IconSearch} />}
            placeholder={`Size ${size}`}
          />
        </div>
      ))}
    </div>
  ),
}

/** Leading search icon via startSection — icon size auto-scales with input size. */
export const WithSearchIcon: Story = {
  args: {
    size: 'md',
    startSection: <Icon icon={IconSearch} />,
    placeholder: 'Search projects...',
  },
}

/** Clickable clear button in endSection. Type to see the clear button appear. */
export const WithClearButton: Story = {
  render: () => {
    const [value, setValue] = useState('Hello, world!')
    return (
      <div className="max-w-sm">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          startSection={<Icon icon={IconSearch} />}
          endSection={
            value ? (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setValue('')}
                aria-label="Clear"
              >
                <Icon icon={IconX} />
              </Button>
            ) : null
          }
          endSectionClickable={!!value}
          placeholder="Type something..."
        />
      </div>
    )
  },
}

/** Start icon + end button together — email field with a mail icon and visibility toggle. */
export const BothSections: Story = {
  render: () => {
    const [show, setShow] = useState(false)
    return (
      <div className="max-w-sm">
        <Input
          type={show ? 'text' : 'password'}
          startSection={<Icon icon={IconLock} />}
          endSection={
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide password' : 'Show password'}
            >
              <Icon icon={show ? IconEyeOff : IconEye} />
            </Button>
          }
          endSectionClickable
          placeholder="Enter password..."
          defaultValue="secret123"
        />
      </div>
    )
  },
}

/** startSection with a plain text node — useful for currency prefixes, URL protocols, etc. */
export const TextPrefix: Story = {
  render: () => (
    <div className="max-w-sm">
      <Input
        startSection="$"
        placeholder="0.00"
        type="number"
      />
    </div>
  ),
}

/** Label sections — strings get a tinted background and border separator automatically. */
export const LabelSections: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-md">
      <div className="flex flex-col gap-ds-01">
        <Label>Currency</Label>
        <Input startSection="$" placeholder="0.00" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>URL protocol</Label>
        <Input startSection="https://" placeholder="example.com" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Domain suffix</Label>
        <Input endSection=".com" placeholder="yoursite" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Both sides</Label>
        <Input startSection="$" endSection=".00" placeholder="0" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Email handle</Label>
        <Input startSection="@" placeholder="username" />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Unit suffix</Label>
        <Input startSection="kg" endSection="per item" placeholder="0" />
      </div>
    </div>
  ),
}

/** Mixed sections — label on one side, icon on the other. */
export const MixedSections: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-md">
      <div className="flex flex-col gap-ds-01">
        <Label>Label start + icon end</Label>
        <Input
          startSection="https://"
          endSection={<Icon icon={IconSearch} />}
          placeholder="Search URL..."
        />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Icon start + label end</Label>
        <Input
          startSection={<Icon icon={IconMail} />}
          endSection="@gmail.com"
          placeholder="username"
        />
      </div>
    </div>
  ),
}

/** All validation states with labels showing the border/ring color treatment. */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-sm">
      {([
        { state: 'default', label: 'Default', placeholder: 'Default state' },
        { state: 'error', label: 'Error', value: 'invalid-email' },
        { state: 'warning', label: 'Warning', value: 'weak-password' },
        { state: 'success', label: 'Success', value: 'verified@example.com' },
      ] as const).map(({ state, label, ...rest }) => (
        <div key={state} className="flex flex-col gap-ds-01">
          <Label>{label}</Label>
          <Input
            state={state === 'default' ? undefined : state}
            startSection={<Icon icon={IconMail} />}
            {...rest}
          />
        </div>
      ))}
    </div>
  ),
}

/** Disabled input — shows reduced opacity and not-allowed cursor on the wrapper. */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this',
    startSection: <Icon icon={IconLock} />,
  },
}

/**
 * Focus ring demo — click the input to see the container-level focus ring
 * wrap around the entire input + icons as one visual unit.
 */
export const FocusRing: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03 max-w-sm">
      <p className="text-ds-sm text-surface-fg-muted">
        Click the input below. The focus ring wraps the entire container
        (input + icons), not just the text field.
      </p>
      <Input
        startSection={<Icon icon={IconSearch} />}
        endSection={
          <Button variant="ghost" size="icon-xs" aria-label="Clear">
            <Icon icon={IconX} />
          </Button>
        }
        endSectionClickable
        placeholder="Focus me..."
      />
    </div>
  ),
}

/** wrapperClassName overrides the wrapper div's styles — here we add a custom background and border radius. */
export const WrapperClassName: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04 max-w-sm">
      <div className="flex flex-col gap-ds-01">
        <Label>Custom wrapper background</Label>
        <Input
          wrapperClassName="bg-accent-2 border-accent-6"
          startSection={<Icon icon={IconSearch} />}
          placeholder="Tinted wrapper..."
        />
      </div>
      <div className="flex flex-col gap-ds-01">
        <Label>Rounded full</Label>
        <Input
          wrapperClassName="rounded-full"
          startSection={<Icon icon={IconSearch} />}
          placeholder="Pill-shaped input..."
        />
      </div>
    </div>
  ),
}
