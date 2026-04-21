import { cleanup, render } from '@testing-library/react'
import * as React from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'

/**
 * Shared conformance test suite for design-system components.
 *
 * Runs the orthogonal checks that every component must satisfy (ref forwarding,
 * className merging, HTML attribute spread, axe audit, variant/size/color smoke
 * checks). Replaces per-file repetition of the same tests.
 *
 * Modelled on Base UI's `describeConformance` and Mantine's
 * `itSupportsSystemProps` — one helper call per component instead of N tests per
 * prop per file.
 */

export interface ConformanceOptions {
  /** Smoke-test that each variant renders without throwing. Pass the exact list from CVA. */
  variants?: readonly string[]
  /** Smoke-test that each size renders without throwing. */
  sizes?: readonly string[]
  /** Smoke-test that each color/intent renders without throwing. */
  colors?: readonly string[]
  /** Skip specific checks when they don't apply (e.g. `['ref']` for components that don't forwardRef). */
  skip?: ReadonlyArray<'ref' | 'className' | 'attrs' | 'axe' | 'variants' | 'sizes' | 'colors'>
}

type RenderFn = (props?: Record<string, unknown>) => React.ReactElement

/**
 * Registers a `describe('conformance')` block in the caller's test file.
 *
 * @example
 * describeConformance('Button', (props) => <Button {...props}>hi</Button>, {
 *   variants: ['solid', 'soft', 'outline', 'ghost', 'link'],
 *   sizes: ['xs', 'sm', 'md', 'lg'],
 *   colors: ['accent', 'error', 'success', 'warning', 'neutral'],
 * })
 */
export function describeConformance(
  name: string,
  renderComponent: RenderFn,
  options: ConformanceOptions = {},
) {
  const skip = new Set(options.skip ?? [])

  describe(`${name} — conformance`, () => {
    afterEach(cleanup)

    if (!skip.has('axe')) {
      it('passes axe audit in default state', async () => {
        const { container } = render(renderComponent())
        expect(await axe(container)).toHaveNoViolations()
      })
    }

    if (!skip.has('className')) {
      it('applies a custom className to the rendered tree', () => {
        const unique = 'conformance-cls-xyz'
        const { container } = render(renderComponent({ className: unique }))
        expect(container.querySelector(`.${unique}`)).not.toBeNull()
      })
    }

    if (!skip.has('ref')) {
      it('forwards ref to an HTMLElement', () => {
        const ref = React.createRef<HTMLElement>()
        render(renderComponent({ ref }))
        expect(ref.current).toBeInstanceOf(HTMLElement)
      })
    }

    if (!skip.has('attrs')) {
      it('spreads HTML attributes to the rendered tree', () => {
        const { container } = render(
          renderComponent({ 'data-testid': 'conformance-attr-xyz' }),
        )
        expect(
          container.querySelector('[data-testid="conformance-attr-xyz"]'),
        ).not.toBeNull()
      })
    }

    if (!skip.has('variants') && options.variants && options.variants.length > 0) {
      it(`renders all ${options.variants.length} variants without throwing`, () => {
        for (const variant of options.variants!) {
          const { unmount } = render(renderComponent({ variant }))
          unmount()
        }
      })
    }

    if (!skip.has('sizes') && options.sizes && options.sizes.length > 0) {
      it(`renders all ${options.sizes.length} sizes without throwing`, () => {
        for (const size of options.sizes!) {
          const { unmount } = render(renderComponent({ size }))
          unmount()
        }
      })
    }

    if (!skip.has('colors') && options.colors && options.colors.length > 0) {
      it(`renders all ${options.colors.length} colors without throwing`, () => {
        for (const color of options.colors!) {
          const { unmount } = render(renderComponent({ color }))
          unmount()
        }
      })
    }
  })
}
