import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect,it } from 'vitest'

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
