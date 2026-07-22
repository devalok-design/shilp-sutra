import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { Autocomplete } from './autocomplete'
import { ColorInput } from './color-input'
import { Combobox } from './combobox'
import { FormField } from './form'
import { Input } from './input'
import { Label } from './label'
import { NumberInput } from './number-input'
import { SearchInput } from './search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Textarea } from './textarea'

/**
 * Regression guard for the FormField/Label auto-association bug (0.49.x):
 * `<Label>` inside a `<FormField>` resolves its `htmlFor` to the field's
 * auto-generated `inputId`, but only `Input` adopted that id — so the
 * documented `<FormField><Label/><Control/></FormField>` pattern left
 * Textarea, Select, NumberInput, Combobox, Autocomplete and ColorInput
 * with a label pointing at a non-existent element (no accessible name).
 *
 * `getByLabelText` succeeds ONLY when the control is programmatically
 * associated with its visible label — exactly the property that was broken.
 */

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

describe('FormField + Label association (each control adopts the field inputId)', () => {
  it('Input', () => {
    render(
      <FormField>
        <Label>Email</Label>
        <Input />
      </FormField>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('Textarea', () => {
    render(
      <FormField>
        <Label>Bio</Label>
        <Textarea />
      </FormField>,
    )
    expect(screen.getByLabelText('Bio')).toBeInTheDocument()
  })

  it('NumberInput', () => {
    render(
      <FormField>
        <Label>Quantity</Label>
        <NumberInput value={0} onValueChange={() => {}} />
      </FormField>,
    )
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
  })

  it('Select', () => {
    render(
      <FormField>
        <Label>Country</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pick one" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">India</SelectItem>
          </SelectContent>
        </Select>
      </FormField>,
    )
    expect(screen.getByLabelText('Country')).toBeInTheDocument()
  })

  it('Combobox', () => {
    render(
      <FormField>
        <Label>Tags</Label>
        <Combobox options={OPTIONS} />
      </FormField>,
    )
    expect(screen.getByLabelText('Tags')).toBeInTheDocument()
  })

  it('Autocomplete', () => {
    render(
      <FormField>
        <Label>City</Label>
        <Autocomplete options={OPTIONS} />
      </FormField>,
    )
    expect(screen.getByLabelText('City')).toBeInTheDocument()
  })

  it('ColorInput', () => {
    render(
      <FormField>
        <Label>Brand colour</Label>
        <ColorInput value="#3366ff" />
      </FormField>,
    )
    expect(screen.getByLabelText('Brand colour')).toBeInTheDocument()
  })

  it('SearchInput (delegates to Input)', () => {
    render(
      <FormField>
        <Label>Search</Label>
        <SearchInput />
      </FormField>,
    )
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
  })
})

describe('explicit id still wins over the FormField inputId', () => {
  it('Textarea', () => {
    render(
      <FormField>
        <Label htmlFor="my-bio">Bio</Label>
        <Textarea id="my-bio" />
      </FormField>,
    )
    expect(screen.getByLabelText('Bio')).toHaveAttribute('id', 'my-bio')
  })
})

describe('a11y: FormField + Label + control has no violations', () => {
  it('Textarea', async () => {
    const { container } = render(
      <FormField>
        <Label>Message</Label>
        <Textarea />
      </FormField>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
