import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Accordion, AccordionContent,AccordionItem, AccordionTrigger } from './accordion'

function renderAccordion() {
  return render(
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Section One</AccordionTrigger>
        <AccordionContent>Content of section one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section Two</AccordionTrigger>
        <AccordionContent>Content of section two</AccordionContent>
      </AccordionItem>
    </Accordion>,
  )
}

describe('Accordion', () => {
  it('passes axe audit', async () => {
    const { container } = renderAccordion()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders triggers', async () => {
    renderAccordion()
    // Radix accordion may defer role assignment via useLayoutEffect in jsdom;
    // waitFor avoids flakes under full-suite load.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Section One' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Section Two' })).toBeInTheDocument()
    })
  })

  it('content is hidden when collapsed', () => {
    renderAccordion()
    expect(screen.queryByText('Content of section one')).not.toBeInTheDocument()
  })

  it('expands content on trigger click', async () => {
    const user = userEvent.setup()
    renderAccordion()
    await user.click(screen.getByRole('button', { name: 'Section One' }))
    expect(screen.getByText('Content of section one')).toBeVisible()
  })

  it('collapses content on second click when collapsible', async () => {
    const user = userEvent.setup()
    renderAccordion()
    const trigger = screen.getByRole('button', { name: 'Section One' })
    await user.click(trigger)
    expect(screen.getByText('Content of section one')).toBeVisible()
    await user.click(trigger)
    expect(screen.queryByText('Content of section one')).not.toBeInTheDocument()
  })
})

describe('AccordionTrigger chevronPosition', () => {
  function renderWithChevron({
    chevronPosition,
  }: { chevronPosition?: 'left' | 'right' } = {}) {
    return render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger chevronPosition={chevronPosition}>
            <span data-testid="trigger-text">Section One</span>
          </AccordionTrigger>
          <AccordionContent>Content for section one.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
  }

  it('renders chevron after trigger text by default (right)', () => {
    renderWithChevron()
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
    expect(textIndex).toBeLessThan(chevronIndex)
  })

  it('renders chevron before trigger text when chevronPosition="left"', () => {
    renderWithChevron({ chevronPosition: 'left' })
    const trigger = screen.getByRole('button', { name: /Section One/i })
    const children = Array.from(trigger.children)
    const textIndex = children.findIndex(
      (el) => el.getAttribute('data-testid') === 'trigger-text',
    )
    const chevronIndex = children.findIndex(
      (el) => el.tagName.toLowerCase() === 'svg' || el.querySelector?.('svg') !== null,
    )
    expect(chevronIndex).toBeLessThan(textIndex)
  })

  it('chevron has rotation class when open', async () => {
    const user = userEvent.setup()
    renderWithChevron()
    const trigger = screen.getByRole('button', { name: /Section One/i })
    await user.click(trigger)
    const chevron = trigger.querySelector('svg')
    expect(chevron?.classList.toString()).toContain('rotate-180')
  })
})
