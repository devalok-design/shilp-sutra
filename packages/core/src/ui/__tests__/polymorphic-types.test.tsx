/**
 * Polymorphism typetests for Text / Stack / Container.
 *
 * These tests have no runtime assertions — they exist purely so `tsc --noEmit`
 * (run during the test build) catches regressions in the polymorphic component
 * types. Documented in MIGRATION.md → "v0.40.0 — Polymorphic Text / Stack /
 * Container".
 *
 * If you add a component with an `as` prop, add it here.
 */
import { describe, expectTypeOf, it } from 'vitest'

import { Container } from '../container'
import { Stack } from '../stack'
import { Text } from '../text'

describe('Text — polymorphic as prop', () => {
  it('default renders as <p>: accepts <p> attrs', () => {
    const node = <Text variant="body-md">hi</Text>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  it('as="label" accepts htmlFor', () => {
    const node = <Text variant="label-md" as="label" htmlFor="email">Email</Text>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  it('as="a" accepts href + target', () => {
    const node = <Text variant="body-md" as="a" href="/x" target="_blank" rel="noreferrer">link</Text>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  it('as="div" still works without label-specific attrs', () => {
    const node = <Text variant="body-md" as="div">div text</Text>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  // Regression: htmlFor on <p> should still error (we widen — we don't break)
  it('@ts-expect-error — htmlFor on <p> (the default) is an error', () => {
    // @ts-expect-error htmlFor is not valid on <p>
    const node = <Text variant="body-md" htmlFor="x">hi</Text>
    void node
  })
})

describe('Stack — polymorphic as prop', () => {
  it('default renders as <div>: accepts no extra attrs', () => {
    const node = <Stack direction="vertical" gap="ds-04">item</Stack>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  it('as="ul" accepts <ul>-specific attrs', () => {
    const node = <Stack as="ul" role="list" aria-label="items">item</Stack>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  it('as="nav" accepts <nav>-specific attrs', () => {
    const node = <Stack as="nav" aria-label="primary">items</Stack>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })
})

describe('Container — polymorphic as prop', () => {
  it('default renders as <div>', () => {
    const node = <Container maxWidth="body">content</Container>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  it('as="main" accepts <main> attrs', () => {
    const node = <Container as="main" maxWidth="body" aria-label="main content">content</Container>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })

  it('as="section" works', () => {
    const node = <Container as="section" maxWidth="full" id="hero">content</Container>
    expectTypeOf(node).toMatchTypeOf<JSX.Element>()
  })
})
