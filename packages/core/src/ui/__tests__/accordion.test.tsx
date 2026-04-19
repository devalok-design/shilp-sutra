import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion'

function renderAccordion({
  chevronPosition,
  defaultValue,
}: {
  chevronPosition?: 'left' | 'right'
  defaultValue?: string
} = {}) {
  return render(
    <Accordion type="single" collapsible defaultValue={defaultValue}>
      <AccordionItem value="item-1">
        <AccordionTrigger chevronPosition={chevronPosition}>
          <span data-testid="trigger-text">Section One</span>
        </AccordionTrigger>
        <AccordionContent>Content for section one.</AccordionContent>
      </AccordionItem>
    </Accordion>,
  )
}

describe('AccordionTrigger chevronPosition', () => {
  it('renders chevron after trigger text by default (right)', () => {
    renderAccordion()
    const trigger = screen.getByRole('button', { name: /Section One/i })
    const children = Array.from(trigger.children)
    const textIndex = children.findIndex(
      (el) => el.getAttribute('data-testid') === 'trigger-text',
    )
    // The chevron is an SVG (rendered directly by Icon in static mode)
    const chevronIndex = children.findIndex(
      (el) => el.tagName.toLowerCase() === 'svg' || el.querySelector?.('svg') !== null,
    )
    expect(textIndex).toBeGreaterThanOrEqual(0)
    expect(chevronIndex).toBeGreaterThanOrEqual(0)
    expect(textIndex).toBeLessThan(chevronIndex)
  })

  it('renders chevron before trigger text when chevronPosition="left"', () => {
    renderAccordion({ chevronPosition: 'left' })
    const trigger = screen.getByRole('button', { name: /Section One/i })
    const children = Array.from(trigger.children)
    const textIndex = children.findIndex(
      (el) => el.getAttribute('data-testid') === 'trigger-text',
    )
    const chevronIndex = children.findIndex(
      (el) => el.tagName.toLowerCase() === 'svg' || el.querySelector?.('svg') !== null,
    )
    expect(textIndex).toBeGreaterThanOrEqual(0)
    expect(chevronIndex).toBeGreaterThanOrEqual(0)
    expect(chevronIndex).toBeLessThan(textIndex)
  })

  it('chevron has rotation class when open (right position)', async () => {
    const user = userEvent.setup()
    renderAccordion()
    const trigger = screen.getByRole('button', { name: /Section One/i })
    await user.click(trigger)
    // The chevron Icon gets the rotation transition class on its root element.
    // In static mode, this is the SVG itself.
    const chevron = trigger.querySelector('svg')
    expect(chevron).toBeInTheDocument()
    expect(chevron?.classList.toString()).toContain('rotate-180')
  })

  it('chevron has rotation class when open (left position)', async () => {
    const user = userEvent.setup()
    renderAccordion({ chevronPosition: 'left' })
    const trigger = screen.getByRole('button', { name: /Section One/i })
    await user.click(trigger)
    const chevron = trigger.querySelector('svg')
    expect(chevron).toBeInTheDocument()
    expect(chevron?.classList.toString()).toContain('rotate-180')
  })
})
