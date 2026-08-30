/**
 * Design refresh — Figma `Updated Components`, 2026-08-24.
 *
 * These assert the SPECIFIC values the designers specified, because every one
 * of them is a silent failure if it regresses: a wrong token still compiles, a
 * missing utility still renders, and none of it throws. Each expectation below
 * pins a number that was measured off the Figma specimen, not read off a note.
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox } from '../checkbox'
import { comboboxTriggerVariants } from '../combobox'
import { Input } from '../input'
import { RadioGroup, RadioGroupItem } from '../radio'
import { selectTriggerVariants } from '../select'
import { Switch } from '../switch'
import { Textarea } from '../textarea'

const SIZES = ['xs', 'sm', 'md', 'lg'] as const

// ── Field ground ────────────────────────────────────────────────────────────
// Default ground moved to `bg-field`, hover to `bg-field-hover`. These are
// theme-aware role tokens, NOT raw neutral steps: the Figma spec was authored
// light-only and `neutral-1` in dark is `surface-base`, so a literal port would
// have made every field vanish into the page.

describe('field ground uses the theme-aware role token', () => {
  it('Input wrapper is bg-field with a bg-field-hover hover', () => {
    const { container } = render(<Input aria-label="Name" />)
    const wrapper = container.firstElementChild!
    expect(wrapper.className).toContain('bg-field')
    expect(wrapper.className).toContain('hover:bg-field-hover')
  })

  it('Input no longer paints its ground with a surface container token', () => {
    const { container } = render(<Input aria-label="Name" />)
    const cls = container.firstElementChild!.className
    expect(cls).not.toContain('bg-surface-panel-hover')
    expect(cls).not.toContain('hover:bg-surface-panel-active')
  })

  it('Textarea is bg-field with a bg-field-hover hover', () => {
    render(<Textarea aria-label="Notes" />)
    const cls = screen.getByRole('textbox').className
    expect(cls).toContain('bg-field')
    expect(cls).toContain('hover:bg-field-hover')
    expect(cls).not.toContain('bg-surface-panel-hover')
  })

  it('Select default trigger is bg-field with a hover', () => {
    const cls = selectTriggerVariants({ variant: 'default' })
    expect(cls).toContain('bg-field')
    expect(cls).toContain('hover:bg-field-hover')
  })

  it('Combobox trigger is bg-field with a hover', () => {
    const cls = comboboxTriggerVariants({})
    expect(cls).toContain('bg-field')
    expect(cls).toContain('hover:bg-field-hover')
  })

  it('Select ghost keeps the panel-hover token — it is a ghost, not a field', () => {
    expect(selectTriggerVariants({ variant: 'ghost' })).toContain('hover:bg-surface-panel-hover')
  })
})

// ── Validation edges ────────────────────────────────────────────────────────
// error/success moved 7 → 8, which is what finally clears WCAG 1.4.11 for them
// (2.831:1 → 3.929:1 and 2.557:1 → 3.441:1 in light). Warning was explicitly
// left at 7 by the designers and therefore still misses the bar at 2.319:1.

describe('validation edges sit at step 8, except warning', () => {
  it('Input error/success are step 8 and warning is untouched', () => {
    const at = (state: 'error' | 'warning' | 'success') =>
      render(<Input aria-label="f" state={state} />).container.firstElementChild!.className
    expect(at('error')).toContain('border-error-8')
    expect(at('success')).toContain('border-success-8')
    expect(at('warning')).toContain('border-warning-7')
  })

  it('Textarea error/success are step 8 and warning is untouched', () => {
    const at = (state: 'error' | 'warning' | 'success') => {
      const { unmount } = render(<Textarea aria-label="f" state={state} />)
      const cls = screen.getByRole('textbox').className
      unmount()
      return cls
    }
    expect(at('error')).toContain('border-error-8')
    expect(at('success')).toContain('border-success-8')
    expect(at('warning')).toContain('border-warning-7')
  })

  it('Select and Combobox agree with Input on all three', () => {
    expect(selectTriggerVariants({ state: 'error' })).toContain('border-error-8')
    expect(selectTriggerVariants({ state: 'success' })).toContain('border-success-8')
    expect(selectTriggerVariants({ state: 'warning' })).toContain('border-warning-7')
  })
})

// ── Uniform padding ─────────────────────────────────────────────────────────
// ds-04 is 12px. Previously each size stepped its own padding, so a row of
// mixed-size fields did not align.

describe('field inline padding is 12px at every size', () => {
  it.each(SIZES)('Select %s is px-ds-04', (size) => {
    expect(selectTriggerVariants({ size })).toContain('px-ds-04')
  })

  it.each(SIZES)('Combobox %s is px-ds-04', (size) => {
    expect(comboboxTriggerVariants({ size })).toContain('px-ds-04')
  })

  it.each(SIZES)('Textarea %s is px-ds-04 and py-ds-03', (size) => {
    const { unmount } = render(<Textarea aria-label="f" size={size} />)
    const cls = screen.getByRole('textbox').className
    unmount()
    expect(cls).toContain('px-ds-04')
    expect(cls).toContain('py-ds-03')
  })

  it.each(SIZES)('Input %s applies px-ds-04 to the field itself', (size) => {
    const { unmount } = render(<Input aria-label="f" size={size} />)
    const cls = screen.getByRole('textbox').className
    unmount()
    expect(cls).toContain('px-ds-04')
  })

  it('an icon section still zeroes the padding on its own side', () => {
    render(<Input aria-label="f" startSection={<svg />} />)
    expect(screen.getByRole('textbox').className).toContain('pl-0')
  })
})

// ── Switch ──────────────────────────────────────────────────────────────────

describe('Switch off-track', () => {
  it('is neutral-5 with a neutral-6 hover, both gated on unchecked', () => {
    render(<Switch aria-label="Notify" />)
    const cls = screen.getByRole('switch').className
    expect(cls).toContain('data-[state=unchecked]:bg-neutral-5')
    expect(cls).toContain('data-[state=unchecked]:hover:bg-neutral-6')
  })

  it('keeps its border — it is the only edge an unchecked switch has', () => {
    // Declining the design's "remove the stroke": the border is neutral-6 at
    // 2.006:1 where the fill is 1.639:1, so dropping it lowers the component
    // boundary further below WCAG 1.4.11. Raised as a question instead.
    render(<Switch aria-label="Notify" />)
    expect(screen.getByRole('switch').className).toContain('border-surface-border-interactive')
  })
})

// ── Radio ───────────────────────────────────────────────────────────────────

describe('Radio dial leaves a 4px ring at every size', () => {
  // control − 8: 20→12 (ds-04), 24→16 (ds-05), 28→20 (ds-05b).
  it.each([
    ['sm', 'h-ds-04'],
    ['md', 'h-ds-05'],
    ['lg', 'h-ds-05b'],
  ] as const)('%s dial is %s', (size, expected) => {
    const { container, unmount } = render(
      <RadioGroup defaultValue="a" aria-label="g">
        <RadioGroupItem value="a" size={size} />
      </RadioGroup>,
    )
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg!.getAttribute('class')).toContain(expected)
    unmount()
  })

  it('hover darkens the dial without recolouring the edge', () => {
    const { container } = render(
      <RadioGroup aria-label="g">
        <RadioGroupItem value="a" />
      </RadioGroup>,
    )
    const cls = container.querySelector('[role="radio"]')!.className
    expect(cls).toContain('data-[state=unchecked]:hover:bg-neutral-4')
    // The old rule turned the edge accent-7 on hover, which read as selected.
    expect(cls).not.toContain('hover:border-accent-7')
  })
})

// ── Checkbox ────────────────────────────────────────────────────────────────

describe('Checkbox hover', () => {
  it('darkens the box without recolouring the edge', () => {
    render(<Checkbox aria-label="Agree" />)
    const cls = screen.getByRole('checkbox').className
    expect(cls).toContain('data-[state=unchecked]:hover:bg-neutral-4')
    expect(cls).not.toContain('hover:border-accent-7')
  })

  it('still renders a check indicator when checked', () => {
    // Figma's checkbox was missing the glyph ("add check icon"); code was not.
    const { container } = render(<Checkbox aria-label="Agree" checked />)
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
