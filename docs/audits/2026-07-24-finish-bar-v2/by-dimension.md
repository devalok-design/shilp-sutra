# Finish-Bar v2 — Systemic Findings (by dimension, full DS)

The value of a 125-component sweep is spotting the *systemic* weaknesses — a
dimension failing across many components — which are fixable once (codemod +
lint rule) rather than per-component. Ranked by blast radius.

## 🔴 Systemic — fix DS-wide, once

### S1. Reduced-motion not self-guarded (~motion axis, pervasive)
Components animate via framer-motion but rely on an **opt-in** `MotionProvider`
being mounted; without it, `prefers-reduced-motion` is ignored. `useReducedMotion`
/ `withReducedMotion` exist at `ui/lib/motion.ts:58` but are frequently unused.
Confirmed on select, tabs, stepper, switch, radio, stat-card, slider, and more
(motion referenced in **110/125** findings). **Fix:** make the motion primitives
default to `reducedMotion="user"` (MotionConfig) or self-guard each animation;
add a lint rule that flags a `motion.*` with a transition but no reduced-motion path.

### S2. Dead class `border-card-strong` (visual-integrity, 11 source files)
No `@utility border-card-strong` and no `--color-card-strong` token exist (only
`border-card` → `--color-surface-border-card`). These borders fall back to
`currentColor` or render nothing. Sites: ai/command-bar, composed/command-palette,
composed/error-boundary, composed/loading-skeleton, composed/page-skeletons,
composed/schedule-view, shell/notification-center, shell/top-bar, ui/code,
ui/data-table-header, ui/data-table-pagination. **Fix:** one sweep → `border-card`
(or add the missing utility/token if a stronger card edge is genuinely wanted).
*Verify against compiled CSS first.*

### S3. Doc↔source drift misinforms AI agents (docs-dx, several P1)
Multiple docs describe behavior the source doesn't implement — actively harmful
because agents consume these docs. Confirmed: ui/search-input (Escape-to-clear
never wired), ui/slider ("does NOT auto-consume FormField" — it does),
shell/command-registry (phantom register/search API + false isAdmin),
shell/app-command-palette (stale prop table + case-sensitive role example that
silently rejects), composed/simple-tooltip (false ancestor-provider claim),
composed/rich-chat-input (wrong onSubmit signature). **Fix:** per-component doc
correction; consider a doc↔source prop-signature gate beyond the existing CVA check.

### S4. Test coverage holes (testing, 41/125 findings flag it)
Missing or thin test files across the DS — notably **zero** tests for ui/sidebar,
ui/table-row-link, and several composed/shell pieces. **Fix:** backfill RTL+axe+
conformance; the stories publish-gate should extend to a test-presence gate.

### S5. Magic-number arbitrary values (visual-integrity drift)
`p-[..]`, `h-[..]`, off-cadence values recur (select, sidebar, slider,
split-button, switch, table, stat-card, command-bar, notification-*, etc.).
Mostly minor, but they drift from the ds spacing/size tokens. **Fix:** codemod to
nearest ds token; the `check-arbitrary-sizing.mjs` gate already exists — widen it.

### S6. Composition duplication (api-composability)
Components re-roll primitives instead of composing them (the StatCard-vs-Card
anti-pattern): split-button re-rolls Button's variant×color (already drifting —
Button has `hover:shadow-brand`, SplitButton doesn't); skeleton sub-components
re-roll the base with two divergent shimmer recipes; rich-chat-input re-rolls 5
buttons + popovers; content-card duplicates Card; bottom-navbar re-rolls a dialog.
**Fix:** derive from the canonical primitive; this is the biggest source of the
2/5 cluster.

## 🟠 Secondary
- **a11y specifics:** sub-44px touch targets (icon-button, sidebar chevrons, command-bar clear), missing accessible names (notification-preferences rows), missing nav landmark (shell/sidebar), forced-colors gaps (ui/table selection). Pattern-level ARIA is otherwise correct.
- **RTL:** ui/switch thumb travels wrong direction (hardcoded +x) — same class of bug segmented-control just fixed; sweep for hardcoded x-translation.
- **slide-no-fade:** `initial={{ y|x: N }}` without `opacity:0` (stat-card, ai layer, others) — codemod-able.
- **Content resilience:** overflow/scroll strategy missing (sheet, segmented many-item, master-detail).

## 🟢 Strengths (protect)
- **api-composability + system-cohesion** strong across ui primitives (Radix-vendored base pays off).
- **9 LEADS**: badge, button, dot, icon, spinner, surface, table, table-row-link, devadoot-icon.
- Motion *choreography* where it's deliberate (spinner state transitions, devadoot identity, conversation scroll-anchoring) genuinely leads.

## Recommended program (order by leverage)
1. **S1 reduced-motion** + **S2 dead-class** — two DS-wide sweeps, huge coverage, low risk. Do first.
2. **S3 doc drift** — cheap, high-value (agents rely on docs). Batch per layer.
3. **13 below-bar** worst-first, most are S6 composition fixes → in-place polish, not rebuilds.
4. **4 structural rebuilds** — scope individually (bottom-navbar a11y is the most urgent).
5. **S4 tests + S5 magic-numbers** — fold into each touch, plus widen the gates.
