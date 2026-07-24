import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { within, userEvent, expect, waitFor } from 'storybook/test'
import { Autocomplete, type AutocompleteOption } from './autocomplete'

const fruitOptions: AutocompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' },
  { label: 'Orange', value: 'orange' },
  { label: 'Peach', value: 'peach' },
  { label: 'Strawberry', value: 'strawberry' },
]

const meta: Meta<typeof Autocomplete> = {
  title: 'Components/Selectors/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs', 'stable'],
  argTypes: {
    placeholder: { control: 'text' },
    emptyText: { control: 'text' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Autocomplete>

export const Default: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Search fruits...',
  },
}

export const WithPlaceholder: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Type to search...',
  },
}

export const WithPreselectedValue: Story = {
  args: {
    options: fruitOptions,
    value: { label: 'Mango', value: 'mango' },
    placeholder: 'Search fruits...',
  },
}

export const CustomEmptyText: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Search...',
    emptyText: 'No matching fruits found',
  },
}

export const Disabled: Story = {
  args: {
    options: fruitOptions,
    placeholder: 'Disabled',
    disabled: true,
  },
}

export const EmptyOptions: Story = {
  args: {
    options: [],
    placeholder: 'No options available',
    emptyText: 'Nothing to show',
  },
}

export const Controlled: Story = {
  parameters: { chromatic: { delay: 500 } },
  render: () => {
    const [selected, setSelected] = useState<AutocompleteOption | null>(null)
    return (
      <div className="flex flex-col gap-ds-04">
        <Autocomplete
          options={fruitOptions}
          value={selected}
          onValueChange={setSelected}
          placeholder="Pick a fruit..."
        />
        <p className="text-ds-sm text-surface-fg-muted">
          Selected: {selected ? selected.label : 'none'}
        </p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('combobox')

    // Type to filter options
    await userEvent.type(input, 'Che')

    // Autocomplete portals its dropdown out of canvasElement (Floating UI).
    // Query document.body to find the option after typing filters down.
    const body = within(document.body)
    const option = await body.findByRole('option', { name: /cherry/i })
    await waitFor(() => expect(option).toBeVisible())

    // Click to select
    await userEvent.click(option)

    // Wait for controlled state to propagate
    await waitFor(() => expect(input).toHaveValue('Cherry'))
    await waitFor(() => expect(canvas.getByText('Selected: Cherry')).toBeVisible())
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06" style={{ maxWidth: 320 }}>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">Default</p>
        <Autocomplete options={fruitOptions} placeholder="Search fruits..." />
      </div>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">Pre-selected</p>
        <Autocomplete
          options={fruitOptions}
          value={{ label: 'Cherry', value: 'cherry' }}
          placeholder="Search fruits..."
        />
      </div>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">Disabled</p>
        <Autocomplete options={fruitOptions} placeholder="Disabled" disabled />
      </div>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-surface-fg-muted">Empty options</p>
        <Autocomplete options={[]} placeholder="No options" emptyText="Nothing to show" />
      </div>
    </div>
  ),
}

export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Autocomplete options={fruitOptions} placeholder="Search…" isLoading loadingText="Searching…" />
    </div>
  ),
}

export const CustomOption: Story = {
  name: 'Custom option (renderOption)',
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Autocomplete
        options={fruitOptions}
        placeholder="Search fruits..."
        renderOption={(o) => (
          <span className="flex items-center justify-between gap-ds-03">
            <span>{o.label}</span>
            <span className="text-body-sm text-surface-fg-subtle">{o.value}</span>
          </span>
        )}
      />
    </div>
  ),
}

export const Uncontrolled: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Autocomplete options={fruitOptions} defaultValue={{ label: 'Banana', value: 'banana' }} placeholder="Search fruits..." />
    </div>
  ),
}
