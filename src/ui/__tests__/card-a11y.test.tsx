import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card'

describe('Card accessibility', () => {
  it('should have no violations with full content', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Project Alpha</CardTitle>
          <CardDescription>A description of the project.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here.</p>
        </CardContent>
        <CardFooter>
          <button type="button">View Details</button>
        </CardFooter>
      </Card>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have no violations with interactive card', async () => {
    const { container } = render(
      <Card interactive>
        <CardHeader>
          <CardTitle>Clickable Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card is interactive.</p>
        </CardContent>
      </Card>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
