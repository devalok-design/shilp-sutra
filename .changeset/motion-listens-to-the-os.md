---
"@devalok/shilp-sutra": minor
---

Reduced motion is now the default, with no provider to mount

Every animated component in the library ran its full animation for a reader with
`prefers-reduced-motion` set, unless the consumer had mounted `<MotionProvider>`.
Nothing forced them to, and the docs described the provider as optional setup, so
the accessible behaviour was opt-in by accident.

The cause is a Framer Motion default: `MotionConfigContext` initialises to
`reducedMotion: "never"`, which means a `motion.*` element ignores the OS setting
until some ancestor overrides it. `<MotionProvider>` was the only thing in the
library that ever did.

**What changed.** A new `<MotionPreference>` wrapper supplies that ancestor from
inside each component, so the OS setting is honoured whether or not a provider is
mounted. It is applied across the 46 components that animate position, and
exported for anyone writing their own:

```tsx
import { MotionPreference } from '@devalok/shilp-sutra/motion'

<MotionPreference>
  <motion.div animate={{ x: 100 }} />
</MotionPreference>
```

It renders no DOM, and nesting is self-cancelling — only the outermost one in a
tree configures anything — so wrapping is always safe.

**"Reduced" does not mean "frozen".** Under Framer's `"user"` mode the suppressed
set is every transform plus `width`, `height`, `top`, `left`, `right`, `bottom`,
and layout animations — the vestibular triggers WCAG 2.3.3 is concerned with.
`opacity`, colour and `filter` keep animating, so a cross-fade still reads as a
state change. Components that animate opacity only were left alone, because for
them the setting changes nothing.

**Overrides still win.** A mounted `<MotionProvider>` owns the decision for its
subtree, including the deliberate `reducedMotion={false}` "animate regardless"
override — the wrapper defers to it rather than re-enabling reduction underneath.
The one case it cannot read is a hand-rolled `<MotionConfig reducedMotion="never">`,
which is indistinguishable from the framework default; use
`<MotionProvider reducedMotion={false}>` to express that intent.

Roughly half the library already handled this by calling `useReducedMotion()` and
branching by hand. Those were left as they are — but note the two mechanisms
differ on overrides: Framer's `useReducedMotion()` reads the media query directly,
so it honours the OS without a provider *and* ignores a `reducedMotion={false}`
override.

Also in this change:

- `pre-publish-audit` gains a **Positional animations respect reduced motion**
  gate. It derives the requirement from what each file actually animates rather
  than keeping an allowlist, so adding a transform to a previously opacity-only
  component fails the build instead of shipping.
- The one-time dev `console.info` suggesting you mount `<MotionProvider>` is
  removed. Its stated reason — that reduced motion needs the provider — is no
  longer true.
- `motion.mdx` corrected. It claimed reduced motion "suppresses all animations"
  and that the provider "handles it globally"; neither was accurate.
