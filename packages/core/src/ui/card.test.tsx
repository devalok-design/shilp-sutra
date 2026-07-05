import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { describeConformance } from '../test-utils/conformance'
import { Card, CardAction, CardBleed, CardContent, CardFooter,CardHeader, CardSection } from './card'

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

  it('uses the variable gap model — container owns py/gap via --card-spacing/--card-gap', () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    )
    expect(container.firstChild).toHaveClass(
      'flex',
      'flex-col',
      'py-(--card-spacing)',
      'gap-(--card-gap)',
    )
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
    it('defaults to md — assigns the 20px/12px variable pair; slots read the variable', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
          <CardContent>Body</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>,
      )
      expect(container.firstChild).toHaveClass(
        '[--card-spacing:var(--spacing-ds-05b)]',
        '[--card-gap:var(--spacing-ds-04)]',
      )
      expect(screen.getByText('Header').closest('div')!).toHaveClass('px-(--card-spacing)')
      expect(screen.getByText('Body').closest('div')!).toHaveClass('px-(--card-spacing)')
      expect(screen.getByText('Footer').closest('div')!).toHaveClass('px-(--card-spacing)')
    })

    it('applies sm — 16px/8px variable pair', () => {
      const { container } = render(<Card size="sm">Content</Card>)
      expect(container.firstChild).toHaveClass(
        '[--card-spacing:var(--spacing-ds-05)]',
        '[--card-gap:var(--spacing-ds-03)]',
      )
    })

    it('applies lg — 24px/16px variable pair', () => {
      const { container } = render(<Card size="lg">Content</Card>)
      expect(container.firstChild).toHaveClass(
        '[--card-spacing:var(--spacing-ds-06)]',
        '[--card-gap:var(--spacing-ds-05)]',
      )
    })
  })

  describe('orientation', () => {
    it('horizontal drops the container py/gap and lays out as a row', () => {
      const { container } = render(
        <Card orientation="horizontal">
          <CardSection>
            <CardHeader>Header</CardHeader>
          </CardSection>
        </Card>,
      )
      expect(container.firstChild).toHaveClass('flex-row', 'items-stretch')
      expect(container.firstChild).not.toHaveClass('py-(--card-spacing)', 'gap-(--card-gap)')
    })

    it('CardSection re-establishes the vertical rhythm from the same variables', () => {
      render(
        <Card orientation="horizontal">
          <CardSection data-testid="section">
            <CardHeader>Header</CardHeader>
          </CardSection>
        </Card>,
      )
      expect(screen.getByTestId('section')).toHaveClass(
        'flex-col',
        'py-(--card-spacing)',
        'gap-(--card-gap)',
        'min-w-0',
        'flex-1',
      )
    })
  })

  describe('CardBleed', () => {
    it('defaults to side="x" — negates the slot inset', () => {
      render(
        <Card>
          <CardContent>
            <CardBleed data-testid="bleed">band</CardBleed>
          </CardContent>
        </Card>,
      )
      expect(screen.getByTestId('bleed')).toHaveClass('-mx-(--card-spacing)')
    })

    it('side="top" negates the container edge and inherits the top radius', () => {
      render(
        <Card>
          <CardBleed data-testid="bleed" side="top">
            media
          </CardBleed>
        </Card>,
      )
      expect(screen.getByTestId('bleed')).toHaveClass(
        '-mt-(--card-spacing)',
        'rounded-t-surface',
        'overflow-hidden',
      )
    })

    it('side="bottom" negates the bottom edge with the bottom radius', () => {
      render(
        <Card>
          <CardBleed data-testid="bleed" side="bottom">
            band
          </CardBleed>
        </Card>,
      )
      expect(screen.getByTestId('bleed')).toHaveClass(
        '-mb-(--card-spacing)',
        'rounded-b-surface',
      )
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

    it('positions top-right by default with the variable inset', () => {
      render(
        <Card>
          <CardAction data-testid="action">x</CardAction>
        </Card>,
      )
      expect(screen.getByTestId('action')).toHaveClass(
        'absolute',
        'top-(--card-spacing)',
        'right-(--card-spacing)',
      )
    })

    it('honors placement — inset tracks the variable at every size', () => {
      render(
        <Card size="lg">
          <CardAction data-testid="action" placement="bottom-right">
            x
          </CardAction>
        </Card>,
      )
      expect(screen.getByTestId('action')).toHaveClass(
        'bottom-(--card-spacing)',
        'right-(--card-spacing)',
      )
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
