# Foundational house-style decisions (A–H) — LOCKED 2026-07-01

The rules every component inherits during the AI-giveaway polish. Locked with the design lead via the [foundational-decisions artifact](https://claude.ai/code/artifact/275ff231-7eb0-405c-b9ef-0aed5ccb729b). These drive Waves 2–9 and are the reference for anyone touching components (incl. the cards workstream).

The through-line (Card's "elevation over edge", generalized): **carry meaning through a soft tinted surface + a typed icon/dot + a text label — never a stripe, never color alone.**

---

## A. Wash tokens — `status-2`, as authored ✅
The tint that signals success/error/warning/info/accent = **`bg-{status}-2`**, the DS's own **"Subtle background"** step (per `generate-scale.ts` / primitives.css step ladder). **No new token, no `color-mix`.**
- It's the same `-2` the DS already uses for subtle backgrounds — one tint vocabulary.
- Green/blue read as quiet tints by design (their generated step-2 chroma is ~0.01); amber runs warmer because `amber-bright` is hand-authored ~4× hotter at low steps. That asymmetry is accepted.
- **Rejected:** mixing step-2/3 toward white (goes gray), and step-3 (that's "Component bg" — too strong for an ambient wash; it's what Alert `subtle` uses for a prominent callout, a deliberately louder context).
- Applies to: toast error tint (`bg-error-2`), AI block low-confidence (`bg-warning-2`), calendar events, chat-internal, and any future status surface.

## B. Motion contract ✅
- **Settle, don't bounce, by default** (confirmed 2026-07-01: calm everywhere; overshoot ONLY where it means something — e.g. a success celebration). Keep `springs.bouncy` but reserve it for those deliberate moments, never as ambient easing.
- Every animated component reads **`useReducedMotion()` locally** so it's correct standalone (not dependent on a consumer-mounted MotionConfig).
- Guard every infinite/loop animation behind reduced-motion.

## C. Controlled / uncontrolled contract ✅
Every stateful component supports **both** modes via one shared helper, with **one naming rule**: `value` / `defaultValue` / `onValueChange` (and `open`/`defaultOpen`/`onOpenChange`, etc.). No more `onChange(value)` / `onSelect` / `selectedId` divergence.
- **Decision (2026-07-01): BUILD a fresh shared `useControllableState` hook** (DS-owned), rather than reusing the vendored Radix one. Full control over behavior/naming; it becomes the single contract the ~24 components adopt in W7.

## D. Slots over corner-props — split ownership
Card's `CardAction` slot model is the direction; bespoke corner-props get deprecated at the clean-break.
- **Cards workstream owns the Card family only** (Card / StatCard / ContentCard / data-table-card) — hands off for me.
- **The polish sweeps (me) own the rest in Wave 8:** avatar `badge`, banner `actions`, popover `title`, split-button `dropdownContent`, status-dot `label`, tree-view `actions`/`secondaryLabel`, etc.

## E. Variant / color vocabulary ✅
Canonical axes everywhere: `variant` (solid/soft/outline/ghost/link), `size` (xs–xl), `color` (accent/neutral/success/warning/error/info). Off-taxonomy axes (`padding`, `display`, `status`, `variant="light|dark"`) renamed at the clean-break. Remove `color="default"` (→ `neutral`). Secondary actions default to `soft`, not `outline`.

## F. Surface & radius family ✅
Cards & card-like tiles are **elevation-led** (`shadow-raised`, `rounded-surface` 10px) — never border + shadow together. Border-led (`outline` variant) is a deliberate opt-in. Fix skeleton/loading tiles using the wrong `rounded-overlay-lg` + border.

## G. Touch targets — hit-area expansion, ON BY DEFAULT ✅ (2026-07-01)
Ship a `touch-target` utility that grows the **tap area** to ~44px via an invisible overlay (`::before` / negative-margin) — **the visual box and layout are unchanged**. **Decision: ON BY DEFAULT** (safe precisely because it never reflows layout — it only enlarges the invisible hit zone). **CAVEAT to verify in the G research:** even without reflow, two 44px hit zones on adjacent tightly-packed items (pagination, calendar grid) can *overlap* → wrong-target taps. The G research/spec must handle this (e.g. cap expansion at the inter-item gap, or a dense-grid exception) before applying globally. Still needs its short spec before its wave.

## H. State-coverage convention ✅
A shared `describeA11yStates` test helper + stories convention so every component demonstrates the same checklist: default/hover/focus-visible/disabled/loading/error/empty + dark + forced-colors + RTL + reduced-motion (the applicable ones become non-optional).

---

**Also decided earlier:** breaking API changes (C handler renames, E axis renames, `color="default"` removal, D deprecations) batch into **one clean-break release — target `0.45.0`** (stay on 0.x; keep 1.0 for later), with a migration guide + Karm DS notice. Deprecate-with-aliases as we go, remove at 0.45.0.

**Coordination (shared working tree with the cards-workstream Claude):** separate branches + strict file lanes. I do NOT touch `card.tsx`, `stat-card.tsx`, `content-card.tsx`, `data-table-card.tsx`, `ui/index.ts` (cards lane). Each agent commits only its own lane. Wave 1 branch: `feat/ai-giveaway-wave-1`.
