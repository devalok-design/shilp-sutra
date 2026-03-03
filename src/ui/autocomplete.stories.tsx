import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
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
  title: 'UI/Forms/Autocomplete',
  component: Autocomplete,
  tags: ['autodocs'],
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
  render: () => {
    const [selected, setSelected] = useState<AutocompleteOption | null>(null)
    return (
      <div className="flex flex-col gap-ds-04">
        <Autocomplete
          options={fruitOptions}
          value={selected}
          onChange={setSelected}
          placeholder="Pick a fruit..."
        />
        <p className="text-ds-sm text-text-secondary">
          Selected: {selected ? selected.label : 'none'}
        </p>
      </div>
    )
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06" style={{ maxWidth: 320 }}>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">Default</p>
        <Autocomplete options={fruitOptions} placeholder="Search fruits..." />
      </div>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">Pre-selected</p>
        <Autocomplete
          options={fruitOptions}
          value={{ label: 'Cherry', value: 'cherry' }}
          placeholder="Search fruits..."
        />
      </div>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">Disabled</p>
        <Autocomplete options={fruitOptions} placeholder="Disabled" disabled />
      </div>
      <div>
        <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">Empty options</p>
        <Autocomplete options={[]} placeholder="No options" emptyText="Nothing to show" />
      </div>
    </div>
  ),
}
