import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '../sheet'

describe('Sheet accessibility', () => {
  it('should have no violations in open state with title and description', async () => {
    const { container } = render(
      <Sheet open>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your preferences.</SheetDescription>
        </SheetContent>
      </Sheet>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
