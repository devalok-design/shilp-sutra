import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Card, CardAction, CardContent, CardFooter,CardHeader } from './card'

describeConformance('Card', (props) => <Card {...props}>Content</Card>, {
  variants: ['default', 'elevated', 'outline', 'flat'],
  sizes: ['sm', 'md', 'lg'],
  colors: ['default', 'accent', 'error', 'success', 'warning', 'info', 'neutral'],
})

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('uses the gap model — flex column container owns vertical rhythm, no per-slot py', () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(container.firstChild).toHaveClass('flex', 'flex-col', 'py-ds-05b', 'gap-ds-04')
  })

  it('resets first/last child margins on CardContent (gap-model leak guard)', () => {
    render(
      <Card>
        <CardContent>Body</CardContent>
      </Card>,
    )
    const content = screen.getByText('Body').closest('div')!
    expect(content).toHaveClass('[&>:first-child]:mt-0', '[&>:last-child]:mb-0')
  })

  describe('size', () => {
    it('defaults to md — px-ds-05b slots, py-ds-05b/gap-ds-04 container', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      )
      expect(container.firstChild).toHaveClass('py-ds-05b', 'gap-ds-04')
      expect(screen.getByText('Header').closest('div')!).toHaveClass('px-ds-05b')
      expect(screen.getByText('Body').closest('div')!).toHaveClass('px-ds-05b')
      expect(screen.getByText('Footer').closest('div')!).toHaveClass('px-ds-05b')
    })

    it('applies sm — px-ds-05 slots, py-ds-05/gap-ds-03 container', () => {
      const { container } = render(
        <Card size="sm">
          <CardHeader>Header</CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      )
      expect(container.firstChild).toHaveClass('py-ds-05', 'gap-ds-03')
      expect(screen.getByText('Header').closest('div')!).toHaveClass('px-ds-05')
      expect(screen.getByText('Body').closest('div')!).toHaveClass('px-ds-05')
      expect(screen.getByText('Footer').closest('div')!).toHaveClass('px-ds-05')
    })

    it('applies lg — px-ds-06 slots, py-ds-06/gap-ds-05 container', () => {
      const { container } = render(
        <Card size="lg">
          <CardHeader>Header</CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      )
      expect(container.firstChild).toHaveClass('py-ds-06', 'gap-ds-05')
      expect(screen.getByText('Header').closest('div')!).toHaveClass('px-ds-06')
      expect(screen.getByText('Body').closest('div')!).toHaveClass('px-ds-06')
      expect(screen.getByText('Footer').closest('div')!).toHaveClass('px-ds-06')
    })
  })

  describe('CardAction', () => {
    it('renders its children', () => {
      render(
        <Card>
          <CardAction>
            <button type="button">More</button>
          </CardAction>
        </Card>,
      )
      expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()
    })

    it('positions top-right by default with the md inset', () => {
      render(
        <Card>
          <CardAction data-testid="action">x</CardAction>
        </Card>,
      )
      expect(screen.getByTestId('action')).toHaveClass('absolute', 'top-ds-05b', 'right-ds-05b')
    })

    it('honors placement + inherits the card size inset', () => {
      render(
        <Card size="lg">
          <CardAction data-testid="action" placement="bottom-right">
            x
          </CardAction>
        </Card>,
      )
      expect(screen.getByTestId('action')).toHaveClass('bottom-ds-06', 'right-ds-06')
    })

    it('applies the tuck offset when set', () => {
      render(
        <Card>
          <CardAction data-testid="action" tuck>
            x
          </CardAction>
        </Card>,
      )
      expect(screen.getByTestId('action')).toHaveClass('-m-ds-02')
    })
  })
})
