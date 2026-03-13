import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AccentProvider } from '../accent-provider'

describe('AccentProvider', () => {
  it('renders without crashing (returns null)', () => {
    const { container } = render(<AccentProvider />)
    expect(container.firstChild).toBeNull()
  })

  it('sets CSS custom properties on document root', () => {
    render(
      <AccentProvider accentCss="--color-accent: #d33163; --color-accent-light: #f7e9e9;" />,
    )
    const root = document.documentElement
    expect(root.style.getPropertyValue('--color-accent')).toBe('#d33163')
    expect(root.style.getPropertyValue('--color-accent-light')).toBe('#f7e9e9')
  })

  it('cleans up CSS custom properties on unmount', () => {
    const { unmount } = render(
      <AccentProvider accentCss="--color-accent: #d33163;" />,
    )
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#d33163')

    unmount()
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('')
  })

  it('does nothing when accentCss is null', () => {
    const root = document.documentElement
    const before = root.style.cssText
    render(<AccentProvider accentCss={null} />)
    expect(root.style.cssText).toBe(before)
  })
})
