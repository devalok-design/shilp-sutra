import { render, screen } from '@testing-library/react'
import { describe, expect,it } from 'vitest'
import { axe } from 'vitest-axe'

import { Avatar, AvatarFallback } from '../avatar'

// ── Fallback colors ─────────────────────────────────────────────────────────

describe('AvatarFallback deterministic colors', () => {
  it('renders with deterministic color class based on children', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const fallback = container.querySelector('[data-slot="avatar-fallback"]')
    expect(fallback).not.toBeNull()
    // Should have a bg-*-3 and text-*-11 class (FALLBACK_COLORS uses step 3)
    const classes = fallback!.className
    expect(classes).toMatch(/bg-[\w-]+-3/)
    expect(classes).toMatch(/text-[\w-]+-11/)
  })

  it('same name always produces same color', () => {
    const { container: container1 } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    const { container: container2 } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    )
    const fb1 = container1.querySelector('[data-slot="avatar-fallback"]')!
    const fb2 = container2.querySelector('[data-slot="avatar-fallback"]')!
    expect(fb1.className).toBe(fb2.className)
  })

  it('different names produce multiple unique colors (>=3 out of 8)', () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Hank']
    const bgClasses = new Set<string>()

    for (const name of names) {
      const { container } = render(
        <Avatar>
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>,
      )
      const fallback = container.querySelector('[data-slot="avatar-fallback"]')!
      const match = fallback.className.match(/bg-[\w-]+-3/)
      if (match) bgClasses.add(match[0])
    }

    expect(bgClasses.size).toBeGreaterThanOrEqual(3)
  })

  it('colorSeed overrides children for color computation', () => {
    const { container: withSeed } = render(
      <Avatar>
        <AvatarFallback colorSeed="unique-seed-xyz">JD</AvatarFallback>
      </Avatar>,
    )
    const { container: withoutSeed } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const { container: sameSeed } = render(
      <Avatar>
        <AvatarFallback colorSeed="unique-seed-xyz">ZZ</AvatarFallback>
      </Avatar>,
    )

    const fbWithSeed = withSeed.querySelector('[data-slot="avatar-fallback"]')!
    const fbWithoutSeed = withoutSeed.querySelector('[data-slot="avatar-fallback"]')!
    const fbSameSeed = sameSeed.querySelector('[data-slot="avatar-fallback"]')!

    // Same seed with different children should produce same color
    expect(fbWithSeed.className).toBe(fbSameSeed.className)
    // Seed should override children-derived color (they may coincidentally match,
    // but with different seeds they are independently computed)
  })
})

// ── Role ring ───────────────────────────────────────────────────────────────

describe('Avatar role ring', () => {
  it('has no a11y violations with ring', async () => {
    const { container } = render(
      <Avatar ring="lead">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('renders ring-accent-7 for lead', () => {
    const { container } = render(
      <Avatar ring="lead">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('ring-accent-7')
  })

  it('renders ring-warning-7 for admin', () => {
    const { container } = render(
      <Avatar ring="admin">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('ring-warning-7')
  })

  it('renders ring-info-7 for client', () => {
    const { container } = render(
      <Avatar ring="client">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('ring-info-7')
  })

  it('no ring classes when ring not set', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).not.toContain('ring-accent-7')
    expect(wrapper.className).not.toContain('ring-warning-7')
    expect(wrapper.className).not.toContain('ring-info-7')
    expect(wrapper.className).not.toContain('ring-2')
  })
})

// ── Badge ───────────────────────────────────────────────────────────────────

describe('Avatar badge', () => {
  it('renders number badge text', () => {
    const { container } = render(
      <Avatar badge={5}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const badge = container.querySelector('[data-slot="avatar-badge"]')
    expect(badge).not.toBeNull()
    expect(badge!.textContent).toBe('5')
  })

  it('renders 99+ for badge > 99', () => {
    const { container } = render(
      <Avatar badge={150}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const badge = container.querySelector('[data-slot="avatar-badge"]')
    expect(badge).not.toBeNull()
    expect(badge!.textContent).toBe('99+')
  })

  it('hides badge when 0', () => {
    const { container } = render(
      <Avatar badge={0}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const badge = container.querySelector('[data-slot="avatar-badge"]')
    const dot = container.querySelector('[data-slot="avatar-badge-dot"]')
    expect(badge).toBeNull()
    expect(dot).toBeNull()
  })

  it('renders dot badge with data-slot', () => {
    const { container } = render(
      <Avatar badge="dot">
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const dot = container.querySelector('[data-slot="avatar-badge-dot"]')
    expect(dot).not.toBeNull()
  })

  it('renders custom ReactNode badge', () => {
    const { container } = render(
      <Avatar badge={<span data-testid="custom-badge">★</span>}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const custom = container.querySelector('[data-slot="avatar-badge-custom"]')
    expect(custom).not.toBeNull()
    expect(screen.getByTestId('custom-badge')).toBeTruthy()
  })

  it('has no a11y violations with badge', async () => {
    const { container } = render(
      <Avatar badge={3}>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ── Loading ─────────────────────────────────────────────────────────────────

describe('Avatar loading skeleton', () => {
  it('renders animate-pulse skeleton when loading', () => {
    const { container } = render(
      <Avatar loading>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).not.toBeNull()
  })

  it('does not render children when loading', () => {
    const { container } = render(
      <Avatar loading>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const fallback = container.querySelector('[data-slot="avatar-fallback"]')
    expect(fallback).toBeNull()
  })

  it('has no a11y violations when loading', async () => {
    const { container } = render(
      <Avatar loading>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
