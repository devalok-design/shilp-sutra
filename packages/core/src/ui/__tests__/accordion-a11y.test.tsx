import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../accordion'

describe('Accordion accessibility', () => {
  it('should have no violations in collapsed state', async () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>What is your return policy?</AccordionTrigger>
          <AccordionContent>
            You can return items within 30 days.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>How do I track my order?</AccordionTrigger>
          <AccordionContent>
            Check your email for tracking information.
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations in expanded state', async () => {
    const { container } = render(
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is your return policy?</AccordionTrigger>
          <AccordionContent>
            You can return items within 30 days.
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
