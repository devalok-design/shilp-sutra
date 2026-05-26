---
"@devalok/shilp-sutra": minor
---

feat: polymorphic types for `Text`, `Stack`, `Container` — element-specific attrs now typecheck

Components with an `as` prop now widen their accepted props based on the
rendered element. Previously the `as` prop accepted any element at runtime
but TypeScript only allowed props of the default element (`<p>` for `Text`,
`<div>` for `Stack` + `Container`).

## Before

```tsx
import { Text } from '@devalok/shilp-sutra/ui/text'

// Runtime: works. TypeScript: ERROR.
<Text as="label" htmlFor="email">Email</Text>
//                ^^^^^^^ Property 'htmlFor' does not exist on type
//                        '... & Omit<ComponentPropsWithRef<"p">, ...>'.
//                        Did you mean 'for'?
```

Same shape for `<Stack as="ul" role="list">`, `<Container as="main" aria-label>`.

## After

All `as`-prop components now use a polymorphic type signature that preserves
the generic across the call site. Element-specific attrs (`htmlFor` on
`<label>`, `href`/`target` on `<a>`, `aria-label` on `<nav>`, etc.) typecheck
correctly.

```tsx
<Text as="label" htmlFor="email">Email</Text>      // OK
<Text as="a" href="/x" target="_blank">link</Text> // OK
<Stack as="ul" role="list">items</Stack>           // OK
<Stack as="nav" aria-label="primary">items</Stack> // OK
<Container as="main" aria-label="main">…</Container> // OK
```

Default behavior unchanged — `<Text>`, `<Stack>`, `<Container>` without `as`
keep their original element + accept original attrs.

## Why not just use the generic at the impl?

`React.forwardRef` can't keep a generic parameter live across its return
type — at the call site, `T` would be erased to the default. Fix is the
standard polymorphic-component cast pattern (Radix, Mantine, Chakra all use
the same shape):

```ts
type TextComponent = <T extends React.ElementType = 'p'>(
  props: TextProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
) => React.ReactElement | null

const TextImpl = React.forwardRef<HTMLElement, TextProps>(...)
const Text = TextImpl as unknown as TextComponent
```

Runtime: identical. Types: strictly wider.

## Files

- `packages/core/src/ui/text.tsx` — `TextComponent` cast added; `as?: React.ElementType` → `as?: T`.
- `packages/core/src/ui/stack.tsx` — `StackComponent` cast added.
- `packages/core/src/ui/container.tsx` — `ContainerComponent` cast added.
- `packages/core/src/ui/__tests__/polymorphic-types.test.tsx` — new
  11-test typetest suite using Vitest's `expectTypeOf` covering `<label>`,
  `<a>`, `<nav>`, `<ul>`, `<main>`, `<section>`. Includes a
  `@ts-expect-error` regression check that `htmlFor` on `<p>` (the default
  for `<Text>`) still errors — we widen, we don't break.

## Breaking

None. Strictly accepts more valid code. Existing code that typechecks today
keeps typechecking.

## Closes

- tbf-tracker F-01 — `<Text as="label" htmlFor="...">` and
  `<Stack as="ul">` now typecheck.
