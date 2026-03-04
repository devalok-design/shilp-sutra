import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { DevalokLogo, _registerSvg } from './devalok-logo'
import * as React from 'react'

// Mock SVG component for testing inline variants
const MockSvg = React.forwardRef<
  SVGSVGElement,
  React.SVGAttributes<SVGSVGElement>
>((props, ref) => (
  <svg ref={ref} data-testid="mock-svg" {...props}>
    <title>Devalok</title>
  </svg>
))
MockSvg.displayName = 'MockSvg'

beforeEach(() => {
  // Register mock SVGs for inline-able types
  _registerSvg('wordmark-brand', MockSvg)
  _registerSvg('wordmark-white', MockSvg)
  _registerSvg('wordmark-black', MockSvg)
  _registerSvg('dass-brand', MockSvg)
  _registerSvg('chakra-brand', MockSvg)
  _registerSvg('chakra-black', MockSvg)
  _registerSvg('chakra-white', MockSvg)
  // Reset dark mode
  document.documentElement.classList.remove('dark')
})

describe('DevalokLogo (inline SVG types)', () => {
  it('renders with role="img" by default', () => {
    render(<DevalokLogo type="wordmark" color="brand" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('renders with default aria-label "Devalok"', () => {
    render(<DevalokLogo type="wordmark" color="brand" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Devalok')
  })

  it('supports custom aria-label', () => {
    render(
      <DevalokLogo type="wordmark" color="brand" aria-label="Company logo" />,
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      'Company logo',
    )
  })

  it('supports decorative mode with role="presentation"', () => {
    render(<DevalokLogo type="wordmark" color="brand" role="presentation" />)
    const svg = screen.getByTestId('mock-svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('aria-label')
  })

  it('sets focusable="false" on inline SVG', () => {
    render(<DevalokLogo type="wordmark" color="brand" />)
    expect(screen.getByRole('img')).toHaveAttribute('focusable', 'false')
  })

  it('applies size class for md (default)', () => {
    render(<DevalokLogo type="wordmark" color="brand" />)
    expect(screen.getByRole('img')).toHaveClass('h-10', 'w-auto')
  })

  it('applies size class for xs', () => {
    render(<DevalokLogo type="wordmark" color="brand" size="xs" />)
    expect(screen.getByRole('img')).toHaveClass('h-6', 'w-auto')
  })

  it('applies size class for xl', () => {
    render(<DevalokLogo type="wordmark" color="brand" size="xl" />)
    expect(screen.getByRole('img')).toHaveClass('h-20', 'w-auto')
  })

  it('applies custom className', () => {
    render(
      <DevalokLogo type="wordmark" color="brand" className="my-custom" />,
    )
    expect(screen.getByRole('img')).toHaveClass('my-custom')
  })

  it('resolves color="auto" to brand in light mode', () => {
    document.documentElement.classList.remove('dark')
    render(<DevalokLogo type="wordmark" color="auto" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('resolves color="auto" to white in dark mode', () => {
    document.documentElement.classList.add('dark')
    render(<DevalokLogo type="wordmark" color="auto" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('returns null for unregistered SVG key', () => {
    const { container } = render(
      // Cast to any to simulate an unknown type not in the registry
      <DevalokLogo type={'unknown-type' as any} color="brand" />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders chakra type as inline SVG', () => {
    render(<DevalokLogo type="chakra" color="brand" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('focusable', 'false')
  })

  it('renders chakra with correct size class', () => {
    render(<DevalokLogo type="chakra" color="brand" size="sm" />)
    expect(screen.getByRole('img')).toHaveClass('h-8', 'w-auto')
  })
})

describe('DevalokLogo (static image types)', () => {
  it('renders an img for monogram type', () => {
    render(<DevalokLogo type="monogram" color="brand" />)
    const img = screen.getByRole('img')
    expect(img.tagName).toBe('IMG')
  })

  it('renders with correct aria-label on img', () => {
    render(<DevalokLogo type="monogram" color="brand" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Devalok')
  })

  it('renders decorative img with empty alt', () => {
    const { container } = render(
      <DevalokLogo type="monogram" color="brand" role="presentation" />,
    )
    const img = container.querySelector('img')!
    expect(img).toHaveAttribute('alt', '')
    expect(img).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses .png extension for static asset path', () => {
    render(<DevalokLogo type="monogram" color="brand" />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toMatch(/\.png$/)
  })

  it('applies size class to img', () => {
    render(<DevalokLogo type="monogram" color="brand" size="lg" />)
    expect(screen.getByRole('img')).toHaveClass('h-14', 'w-auto')
  })

  it('simplifies monogram-wordmark to monogram at xs size', () => {
    render(
      <DevalokLogo type="monogram-wordmark" color="brand" size="xs" />,
    )
    // xs = 24px, simplifyBelow = 32 (default), so should simplify to monogram (img)
    const img = screen.getByRole('img')
    expect(img.tagName).toBe('IMG')
  })
})

describe('DevalokLogo.Link', () => {
  it('renders an anchor element', () => {
    render(
      <DevalokLogo.Link href="/">
        <DevalokLogo type="wordmark" color="brand" />
      </DevalokLogo.Link>,
    )
    expect(screen.getByRole('link')).toBeInTheDocument()
  })

  it('has default aria-label "Devalok home"', () => {
    render(
      <DevalokLogo.Link href="/">
        <DevalokLogo type="wordmark" color="brand" />
      </DevalokLogo.Link>,
    )
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Devalok home',
    )
  })

  it('supports custom aria-label', () => {
    render(
      <DevalokLogo.Link href="/" aria-label="Go home">
        <DevalokLogo type="wordmark" color="brand" />
      </DevalokLogo.Link>,
    )
    expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go home')
  })
})
