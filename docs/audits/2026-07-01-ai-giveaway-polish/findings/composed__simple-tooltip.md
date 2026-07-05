# composed/simple-tooltip — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:1 P3:3

SimpleTooltip is a thin one-liner convenience wrapper over the `ui/tooltip` compound
(`TooltipProvider` + `Tooltip` + `TooltipTrigger asChild` + `TooltipContent`). It correctly
**composes the base primitive** rather than re-rolling surface/motion (F5 clean), inherits all
visual/motion styling from `TooltipContent`, and ships tests + stories + a doc. No visual tells,
no verbal tells, no re-rolled tokens. The gaps are (a) a wrong element/prop typing surface that
mis-describes where `...props`/`ref` land, (b) a doc claim the code contradicts about respecting an
ancestor provider, and (c) a couple of composability passthroughs that are absent.

## Findings

### [P1][I] Props/ref typing mis-describes the DOM surface
- **Category:** types
- **Evidence:** simple-tooltip.tsx:12 — `interface SimpleTooltipProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'content'>` and :20 `React.forwardRef<HTMLButtonElement, SimpleTooltipProps>` while :35 forwards `ref` to `<TooltipTrigger ref={ref} asChild>` and :36 spreads `{...props}` onto `<TooltipContent>`.
- **Why:** Three mismatched surfaces in one component: the prop bag is typed as `div` attributes but is spread onto `TooltipContent` (a `motion.div` rendered via Radix `Content`), while `ref` is typed `HTMLButtonElement` but — because `TooltipTrigger` is `asChild` — actually lands on whatever element `children` renders (could be an anchor, span, IconButton, etc.), not necessarily a button. A consumer passing e.g. `id`/`style`/`onClick` expects them on the trigger (the thing they hover), but they silently land on the tooltip content bubble.
- **Fix:** Split the contract intentionally. Either (a) keep it minimal: drop the `ComponentPropsWithoutRef<'div'>` extension entirely and only accept `content/side/align/delayDuration/children` (+ optional `className`/`contentProps` explicitly routed to `TooltipContent`); or (b) type the ref as `React.ElementRef<typeof TooltipPrimitive.Content>`-agnostic / `HTMLElement` since `asChild` makes the element unknown. Do not advertise `div` attributes that land on a portalled content node.

### [P1][docs] Doc claims ancestor-provider respect the code contradicts
- **Category:** docs
- **Evidence:** simple-tooltip.md:27 — "Auto-provides its own TooltipProvider … You can still wrap a broader TooltipProvider at layout level for shared `delayDuration`; SimpleTooltip respects it if present." vs simple-tooltip.tsx:33 `<TooltipProvider delayDuration={delayDuration}>` (unconditional).
- **Why:** SimpleTooltip **always** mounts its own `TooltipProvider` with its own `delayDuration` (default 300). The underlying `Tooltip`'s `AutoProvider` (tooltip.tsx:25) only skips re-wrapping when a provider context already exists — but SimpleTooltip creates that context itself every time, so an ancestor `TooltipProvider`'s `delayDuration` is shadowed, not respected. The doc describes behavior the component does not have.
- **Fix:** Either make the wrapper conditional (consume `TooltipProviderContext`; only wrap when absent, matching `AutoProvider`), or correct the doc to say SimpleTooltip always establishes its own provider and its `delayDuration` wins. Prefer the code fix — "respects the layout provider" is the better behavior.

### [P2][F6] No controlled/uncontrolled or open-state passthrough
- **Category:** composability
- **Evidence:** simple-tooltip.tsx:12-18 — prop surface is only `content/side/align/delayDuration/children`; the underlying `Tooltip` supports `open`/`defaultOpen`/`onOpenChange` (tooltip.tsx:42-58) but none are forwarded.
- **Why:** Card-bar composability expects controlled+uncontrolled parity where the primitive offers it. A consumer who wants to programmatically open the tooltip (onboarding hint, force-show) must drop down to the full compound, losing the one-liner. The doc even points them at `ui/Tooltip` "for controlled open" — but a single `open?`/`onOpenChange?` passthrough would cover the common case cheaply.
- **Fix:** Forward optional `open`, `defaultOpen`, `onOpenChange` to `<Tooltip>`. Keep them optional so the uncontrolled default is unchanged.

### [P3][composability] `sideOffset` not exposed
- **Category:** composability
- **Evidence:** simple-tooltip.tsx:36 — `<TooltipContent side={side} align={align} …>` never passes `sideOffset`; `TooltipContent` supports it (tooltip.tsx:86, default 4).
- **Why:** Minor: consumers can't nudge the gap without dropping to the compound. Low priority since 4px is a sane default.
- **Fix:** Optionally accept and forward `sideOffset?: number`.

### [P3][state-coverage] Tests/stories don't demonstrate the tooltip actually opening
- **Category:** state-coverage
- **Evidence:** simple-tooltip.test.tsx:9-26 — both tests only assert the trigger renders / axe-clean; neither hovers/focuses to assert `content` appears (open state, `role="tooltip"`, positioning). Stories (simple-tooltip.stories.tsx) render triggers but there's no interaction/`play` that opens one.
- **Why:** The whole point of the component (showing content on hover/focus) is untested and unshown in an automated way. The open state, keyboard-focus trigger, and reduced-motion path are uncovered. Not a defect in the component, but below the Card bar's "every applicable state shown + tested".
- **Fix:** Add a test using `userEvent.hover`/`.tab()` asserting `screen.findByRole('tooltip')` shows `content`; add a `play` function to the Default story that focuses the trigger so autodocs/interaction tests exercise the open state.

### [P3][a11y] Trigger contract undocumented — `asChild` requires a focusable child
- **Category:** a11y
- **Evidence:** simple-tooltip.tsx:35 `<TooltipTrigger ref={ref} asChild>{children}</TooltipTrigger>` — no runtime or type constraint that `children` is a single focusable element; doc/gotchas don't state it.
- **Why:** If a consumer passes a non-focusable child (a bare `<span>`, plain text), the tooltip won't be keyboard-reachable and axe won't catch it (the tests use a `<button>`). Radix `asChild` also requires exactly one element child that forwards ref/props.
- **Fix:** Document the "child must be a single focusable element (button/link/IconButton)" rule in the doc's Gotchas; consider a dev-only warning if `children` isn't a valid single element.

## Composability gaps
- No `open` / `defaultOpen` / `onOpenChange` passthrough — controlled mode requires abandoning the wrapper (F6).
- `sideOffset` (and `sideOffset`-adjacent Content props like `collisionPadding`, `avoidCollisions`) not surfaced.
- `...props` are typed/aimed at the content node, not the trigger — there is no clean way to add attributes to the actual interactive trigger through this wrapper (the ref also goes to the trigger while props go to content — split, confusing surface).
- No `contentClassName` vs `triggerClassName` split — `className` goes to content; you can't style the trigger wrapper through the component.

## Motion gaps
- None owned by this component. SimpleTooltip renders **no motion of its own** — all entrance/exit animation (scale 0.95→1, per-side slide, opacity fade) lives in `TooltipContent` (tooltip.tsx:102-106) using `springs.snappy` + `tweens.fade`, which is intentional and token-bound.
- Note (belongs to `ui/tooltip`, not here): `TooltipContent`'s motion has no `prefers-reduced-motion` guard (no `useReducedMotion()` / `withReducedMotion`), and `springs.snappy` (stiffness 500/damping 30) is a controlled micro-spring, not a bounce — M1 clean, but M3 is a gap at the primitive layer. Flag against `ui/tooltip`, not SimpleTooltip.

## Polish plan (ordered steps to reach the finish bar)
1. Fix the typing surface (P1): stop extending `div` attributes; decide whether `className`/extra props target the trigger or the content and split them explicitly (`className` → content is fine, but say so; add `triggerProps`/`asChild` clarity). Type `ref` honestly given `asChild` (element is consumer-determined).
2. Reconcile provider behavior (P1): make the internal `TooltipProvider` conditional on `TooltipProviderContext` (mirror `AutoProvider`) so an ancestor's `delayDuration` is genuinely respected — then the doc becomes true. Or fix the doc to state SimpleTooltip always wins.
3. Add `open`/`defaultOpen`/`onOpenChange` passthrough (P2) so the common controlled case doesn't force a drop to the compound.
4. Add an interaction test + a `play` story that opens the tooltip and asserts `role="tooltip"` content, covering hover + keyboard-focus (P3).
5. Optionally forward `sideOffset` (P3) and document the focusable-single-child requirement in Gotchas (P3).

## Clean (rubric dims that pass)
- **V1–V15 visual tells:** none. Component ships no classes of its own; all surface comes from `TooltipContent` (`bg-surface-inverted`, `shadow-floating`, `rounded-overlay-sm`, token spacing). No accent rail, no gradient, no emoji, no glass/glow, no framework palette.
- **F5 composes the base primitive:** exemplary — wraps the `ui/tooltip` compound instead of re-rolling a tooltip surface/portal/motion. This is the StatCard-style "compose, don't re-roll" pattern.
- **F2 asChild:** correctly uses `TooltipTrigger asChild` so the consumer's own trigger element is used (polymorphic by design).
- **G1–G5 drift/vocabulary:** no re-rolled tokens, no surface-level choice to get wrong (delegated), no variant-axis to drift.
- **E1–E8 verbal tells:** doc + JSDoc are direct and prescriptive; no em-dash tic abuse, no AI vocabulary, no hedging, no placeholders.
- **M1 bounce-by-default:** clean at this layer (no motion here); inherited motion is a controlled spring, not a bounce.
- **displayName / forwardRef:** present (simple-tooltip.tsx:20, 43).
- **Tests + stories + doc exist** (publish-gate items present), and prop tables in the doc match the source props.
