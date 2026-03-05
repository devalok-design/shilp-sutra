import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { IconUser, IconBriefcase, IconCode } from '@tabler/icons-react'
import { Combobox, type ComboboxOption } from './combobox'

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'dragonfruit', label: 'Dragon Fruit' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
]

const teamMembers: ComboboxOption[] = [
  {
    value: 'alice',
    label: 'Alice Johnson',
    description: 'Engineering',
    icon: <IconUser className="h-4 w-4" />,
  },
  {
    value: 'bob',
    label: 'Bob Smith',
    description: 'Design',
    icon: <IconBriefcase className="h-4 w-4" />,
  },
  {
    value: 'carol',
    label: 'Carol Williams',
    description: 'Engineering',
    icon: <IconCode className="h-4 w-4" />,
  },
  {
    value: 'david',
    label: 'David Lee',
    description: 'Product',
    icon: <IconUser className="h-4 w-4" />,
  },
  {
    value: 'emma',
    label: 'Emma Davis',
    description: 'Marketing',
    icon: <IconBriefcase className="h-4 w-4" />,
  },
]

const meta: Meta<typeof Combobox> = {
  title: 'UI/Form Controls/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="p-ds-08"><Story /></div>],
}
export default meta
type Story = StoryObj<typeof Combobox>

// ---------------------------------------------------------------------------
// 1. Default — single select with search filtering
// ---------------------------------------------------------------------------
export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>('')
    return (
      <div className="w-[280px]">
        <Combobox
          options={fruits}
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Select a fruit..."
          searchPlaceholder="Search fruits..."
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')

    // Open the popover
    await userEvent.click(trigger)

    // Find the search input inside the popover (rendered via portal)
    const searchInput = await within(document.body).findByLabelText(
      'Search options',
    )
    await expect(searchInput).toBeVisible()

    // Type a search query to filter options
    await userEvent.type(searchInput, 'ch')

    // Cherry should be visible, Apple should not
    const listbox = within(document.body).getByRole('listbox')
    await expect(within(listbox).getByText('Cherry')).toBeVisible()
    await expect(within(listbox).queryByText('Apple')).toBeNull()

    // Press Escape to close
    await userEvent.keyboard('{Escape}')
  },
}

// ---------------------------------------------------------------------------
// 2. MultiSelect — multi-select with pre-selected pills
// ---------------------------------------------------------------------------
export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>(['apple', 'cherry'])
    return (
      <div className="w-[320px]">
        <Combobox
          options={fruits}
          value={value}
          onChange={(v) => setValue(v as string[])}
          placeholder="Select fruits..."
          multiple
        />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify pre-selected pills are visible
    await expect(canvas.getByText('Apple')).toBeVisible()
    await expect(canvas.getByText('Cherry')).toBeVisible()

    // Open the popover
    const trigger = canvas.getByRole('combobox')
    await userEvent.click(trigger)

    // Select an additional option (Banana)
    const listbox = await within(document.body).findByRole('listbox')
    const bananaOption = within(listbox).getByText('Banana')
    await userEvent.click(bananaOption)

    // Verify the new pill appears (Banana replaces Cherry in visible pills since max 2 visible)
    // Close popover first
    await userEvent.keyboard('{Escape}')

    // The "+1 more" indicator should appear since we now have 3 selected
    await expect(canvas.getByText('+1 more')).toBeVisible()
  },
}

// ---------------------------------------------------------------------------
// 3. WithDescriptionsAndIcons — options with description + icon fields
// ---------------------------------------------------------------------------
export const WithDescriptionsAndIcons: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>('')
    return (
      <div className="w-[320px]">
        <Combobox
          options={teamMembers}
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Select a team member..."
          searchPlaceholder="Search by name..."
        />
      </div>
    )
  },
}

// ---------------------------------------------------------------------------
// 4. CustomRenderOption — avatar initials + name + description
// ---------------------------------------------------------------------------
export const CustomRenderOption: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>('')

    const renderOption = (option: ComboboxOption, _selected: boolean) => (
      <span className="flex items-center gap-ds-03">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-ds-full bg-interactive-subtle text-ds-sm font-medium text-interactive">
          {option.label
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)}
        </span>
        <span className="flex flex-col">
          <span className="text-ds-md">{option.label}</span>
          {option.description && (
            <span className="text-ds-sm text-text-secondary">
              {option.description}
            </span>
          )}
        </span>
      </span>
    )

    return (
      <div className="w-[320px]">
        <Combobox
          options={teamMembers}
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Choose assignee..."
          renderOption={renderOption}
        />
      </div>
    )
  },
}

// ---------------------------------------------------------------------------
// 5. Disabled — disabled combobox
// ---------------------------------------------------------------------------
export const Disabled: Story = {
  render: () => (
    <div className="w-[280px]">
      <Combobox
        options={fruits}
        value="apple"
        onChange={() => {}}
        placeholder="Disabled combobox"
        disabled
      />
    </div>
  ),
}

// ---------------------------------------------------------------------------
// 6. EmptyState — empty options with custom emptyMessage
// ---------------------------------------------------------------------------
export const EmptyState: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>('')
    return (
      <div className="w-[280px]">
        <Combobox
          options={[]}
          value={value}
          onChange={(v) => setValue(v as string)}
          placeholder="Select..."
          emptyMessage="No options available. Try a different search."
        />
      </div>
    )
  },
}

// ---------------------------------------------------------------------------
// 7. ManyPills — multi-select with 4+ selected showing "+N more"
// ---------------------------------------------------------------------------
export const ManyPills: Story = {
  render: () => {
    const [value, setValue] = React.useState<string[]>([
      'apple',
      'banana',
      'cherry',
      'dragonfruit',
    ])
    return (
      <div className="w-[320px]">
        <Combobox
          options={fruits}
          value={value}
          onChange={(v) => setValue(v as string[])}
          placeholder="Select fruits..."
          multiple
        />
      </div>
    )
  },
}
