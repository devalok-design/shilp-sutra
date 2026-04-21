import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { describeConformance } from '../test-utils/conformance'
import { Avatar, AvatarFallback,AvatarImage } from './avatar'

describeConformance(
  'Avatar',
  (props) => (
    <Avatar {...props}>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
  { sizes: ['xs', 'sm', 'md', 'lg', 'xl'] },
)

describe('Avatar', () => {
  // ── Default variants ───────────────────────────────────────────────────────
  it('defaults to size=md and shape=circle', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    // The Radix root gets the CVA class for md + circle
    const root = container.querySelector('.h-ds-md.w-ds-md')
    expect(root).toBeInTheDocument()
    expect(root?.className).toContain('rounded-ds-full')
  })

  // ── Fallback rendering ─────────────────────────────────────────────────────
  it('renders fallback initials when no image is loaded', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('fallback inherits shape from parent Avatar', () => {
    const { container } = render(
      <Avatar shape="square">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    const fallback = container.querySelector('[data-slot="avatar-fallback"]')
    expect(fallback?.className).toContain('rounded-ds-none')
  })

  it('fallback inherits size from parent Avatar for text scaling', () => {
    const { container } = render(
      <Avatar size="xl">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    const fallback = container.querySelector('[data-slot="avatar-fallback"]')
    expect(fallback?.className).toContain('text-ds-lg')
  })

  it('deterministic fallback color is consistent for the same seed', () => {
    const { container: c1 } = render(
      <Avatar><AvatarFallback colorSeed="alice">AL</AvatarFallback></Avatar>,
    )
    const { container: c2 } = render(
      <Avatar><AvatarFallback colorSeed="alice">AL</AvatarFallback></Avatar>,
    )
    const fb1 = c1.querySelector('[data-slot="avatar-fallback"]')
    const fb2 = c2.querySelector('[data-slot="avatar-fallback"]')
    expect(fb1?.className).toEqual(fb2?.className)
  })

  // ── Status indicator ───────────────────────────────────────────────────────
  it.each(['online', 'offline', 'busy', 'away'] as const)(
    'renders status=%s with role="img" and aria-label',
    (status) => {
      render(
        <Avatar status={status}>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>,
      )
      const dot = screen.getByRole('img')
      expect(dot).toHaveAttribute(
        'aria-label',
        status.charAt(0).toUpperCase() + status.slice(1),
      )
    },
  )

  it('does not render status dot when status is not set', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  // ── Badge ──────────────────────────────────────────────────────────────────
  it('renders numeric badge', () => {
    render(
      <Avatar badge={5}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '5 notifications')
  })

  it('caps badge display at 99+', () => {
    render(
      <Avatar badge={150}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '99+ notifications')
  })

  it('renders dot badge', () => {
    const { container } = render(
      <Avatar badge="dot">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('[data-slot="avatar-badge-dot"]')).toBeInTheDocument()
  })

  it('hides badge when value is 0', () => {
    const { container } = render(
      <Avatar badge={0}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(container.querySelector('[data-slot="avatar-badge"]')).not.toBeInTheDocument()
    expect(container.querySelector('[data-slot="avatar-badge-dot"]')).not.toBeInTheDocument()
  })

  it('renders custom badge ReactNode', () => {
    render(
      <Avatar badge={<span data-testid="custom-badge">!</span>}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
  })

  // ── Loading state ──────────────────────────────────────────────────────────
  it('renders skeleton placeholder when loading', () => {
    const { container } = render(<Avatar loading />)
    expect(container.querySelector('[data-slot="avatar-skeleton"]')).toBeInTheDocument()
  })

  // ── AvatarImage ────────────────────────────────────────────────────────────
  it('renders AvatarImage wrapper (img not available in jsdom)', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/photo.jpg" alt="User photo" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    // In jsdom, Radix Avatar doesn't fire onLoad so the <img> may not render.
    // Verify the AvatarImage motion wrapper is rendered.
    const wrapper = container.querySelector('.absolute.inset-0')
    expect(wrapper).toBeInTheDocument()
  })

  // ── Ring ───────────────────────────────────────────────────────────────────
  it('renders role ring classes', () => {
    const { container } = render(
      <Avatar ring="lead">
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('ring-accent-7')
  })

  // ── a11y — status indicator (not covered by conformance default render) ──
  it('has no a11y violations with status indicator', async () => {
    const { container } = render(
      <Avatar status="online">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
