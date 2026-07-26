import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

import { Autocomplete } from './autocomplete'
import { Checkbox } from './checkbox'
import { ColorInput } from './color-input'
import { Combobox } from './combobox'
import { FormField } from './form'
import { Input } from './input'
import { Label } from './label'
import { NumberInput } from './number-input'
import { RadioGroup, RadioGroupItem } from './radio'
import { SearchInput } from './search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Slider } from './slider'
import { Switch } from './switch'
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
 *
 * 0.55.x — SECOND ROUND. The original fix covered the text-like controls and
 * stopped there. Checkbox, Switch and Slider read useFormField (state,
 * aria-describedby, aria-required) so they LOOKED integrated, yet never adopted
 * inputId — and none of them were asserted here. An accessibility-tree sweep
 * found all three with an EMPTY accessible name in the documented pattern; a
 * screen reader announced an unnamed checkbox. The three broken controls were
 * exactly the three untested ones, so every labellable control is covered now.
 *
 * Slider is the odd one: Radix renders Root as a <span> (not labellable) with
 * role="slider" on the THUMB, so htmlFor can never reach it — it takes
 * aria-labelledby instead. Assert the accessible NAME via role, not just label
 * association, since that is what a screen-reader user actually gets.
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

  // ── The controls the 0.49.x round missed ────────────────────────────────
  // Checkbox, Switch and Slider read useFormField (state, aria-describedby,
  // aria-required) so they LOOKED integrated, but never adopted inputId — and
  // none of them were covered here, which is exactly why it went unnoticed
  // until an accessibility-tree sweep in 0.55.x. Assert on the accessible NAME
  // via role, not just label association, because that is the property a
  // screen-reader user actually depends on.

  it('Checkbox', () => {
    render(
      <FormField>
        <Label>Accept terms</Label>
        <Checkbox />
      </FormField>,
    )
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Accept terms' })).toBeInTheDocument()
  })

  it('Switch', () => {
    render(
      <FormField>
        <Label>Email notifications</Label>
        <Switch />
      </FormField>,
    )
    expect(screen.getByLabelText('Email notifications')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Email notifications' })).toBeInTheDocument()
  })

  it('Slider names the thumb via aria-labelledby', () => {
    // Radix renders Slider.Root as a <span> — not a labellable element — and
    // puts role="slider" on the THUMB, so `<Label htmlFor>` can never name it
    // the way it names Input. The thumb points at the field label instead.
    render(
      <FormField>
        <Label>Volume</Label>
        <Slider defaultValue={[40]} />
      </FormField>,
    )
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument()
  })

  it('Slider with an explicit aria-label keeps it', () => {
    render(
      <FormField>
        <Label>Volume</Label>
        <Slider defaultValue={[40]} aria-label="Playback volume" />
      </FormField>,
    )
    expect(screen.getByRole('slider', { name: 'Playback volume' })).toBeInTheDocument()
  })

  it('range Slider does NOT borrow the field label for both thumbs', () => {
    // One label cannot disambiguate two thumbs; the consumer must name each.
    // Asserting this keeps a future "just add aria-labelledby to every thumb"
    // change from producing two identically-named sliders.
    render(
      <FormField>
        <Label>Price range</Label>
        <Slider defaultValue={[20, 60]} />
      </FormField>,
    )
    expect(screen.queryAllByRole('slider', { name: 'Price range' })).toHaveLength(0)
  })

  it('RadioGroup items are individually labellable', () => {
    render(
      <FormField>
        <Label>Plan</Label>
        <RadioGroup>
          <Label htmlFor="plan-free">Free</Label>
          <RadioGroupItem id="plan-free" value="free" />
        </RadioGroup>
      </FormField>,
    )
    expect(screen.getByRole('radio', { name: 'Free' })).toBeInTheDocument()
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
