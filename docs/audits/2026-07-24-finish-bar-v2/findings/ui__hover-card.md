# ui/hover-card — finish-bar audit
Finish: 4/5   Market: PARITY (Radix HoverCard)   Rebuild: polish

Pointer-hover preview overlay: a thin, well-behaved wrapper over vendored Radix
HoverCard that adds a controlled/uncontrolled state shim and a framer-motion
enter/exit. Clean visuals, correct tokens, honest a11y posture. Held at the
prior 4/5 — nothing regressed since 2026-07-01, but none of the open polish
items were closed either.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Single edge treatment (`shadow-floating`, no competing border → no edge-soup), overlay tier `bg-surface-overlay`, role radius `rounded-overlay`, `p-ds-05` cadence, `z-popover`, `outline-hidden`. No slop tells. Only soft spot: raw `w-64` default width (not `--spacing-ds-*`), but overridable via className. |
| a11y | gap | Pointer-only by design (WAI-ARIA has no HoverCard APG pattern) — honestly documented in source JSDoc + doc, with an explicit "use Popover for essential content" escape hatch. axe-clean test present; forced-colors covered by the `Canvas` mapping on `--color-surface-overlay`. Radix opens on focus too, but focus-open is neither storied nor tested, and no focus-visible treatment on content. Hover-only is invisible on touch (documented). Not a ✗ — it's a deliberate, disclosed limitation — but under-demonstrated. |
| api-composability | gap | Controlled + uncontrolled fully handled (`open`/`defaultOpen`/`onOpenChange`, `isControlled` guard); canonical vocabulary; `asChild` on trigger; free-form `ReactNode` content slot; `HoverCardContent` is `forwardRef` + `displayName`; `HoverCardContentProps` exported. Blemish: `HoverCard` root is `React.FC` (banned by the repo's own rubric; no ref on root, implicit children) — deviates from the popover/dialog `forwardRef` sibling pattern. |
| docs-dx | gap | Doc has Example / Composability / Gotchas / Changes and matches source; Tooltip-vs-Popover distinction is well drawn. But no explicit Props/Defaults table (leans entirely on "it's Radix") and stories are a single `Default` — below the publish-gate finish bar. |
| testing | ✓ | 8 tests: renders, default-closed, controlled-open, pointerEnter-open, `onOpenChange`, className merge, `defaultOpen`, axe-clean. Good state + a11y coverage. Missing `describeConformance` and a focus-open case. |
| motion | gap | Good bones: animates opacity+scale only (HW-accel), `springs.snappy` (≈critically damped, bounce-free — right call for an overlay), `tweens.fade` for opacity, symmetric exit, `AnimatePresence`+`forceMount`+portal (interruptible). Gap: **no standalone `useReducedMotion` guard** — the scale transform only degrades if the consumer wraps the tree in `MotionProvider`/`MotionConfig`; framer's `reducedMotion="user"` is not on by default. Fails the Emil motion-safe axis for standalone use. |
| state-coverage | gap | Open/closed/enter/exit deliberately handled (the states that matter for an overlay); loading/error/empty are N/A here. But focus-open state and focus-visible-on-content are not designed or demonstrated. |
| content-resilience | ✓ | Free-form children slot; `w-64` default overridable (story uses `w-80`); Radix owns collision/flip/avoidance and RTL-aware positioning; no arrow to mirror. No truncation strategy, but content is the consumer's. Fine for an overlay. |
| theming-resilience | ✓ | `--color-surface-overlay` ships light/dark/forced-colors(`Canvas`) variants; `rounded-overlay` honors the `[data-shape]` presets (verified in semantic.css); `shadow-floating` role shadow; no hardcoded accent → survives an accent-9 swap. Strong. |
| system-cohesion | ✓ | Shares `springs.snappy`, `tweens.fade`, `rounded-overlay`, `z-popover` (== Popover/Dropdown), `shadow-floating` with its overlay siblings. Reads as one system. Minor: root `React.FC` diverges from the forwardRef sibling convention. |
| craft | gap | Scale-in pop is tasteful, but grows **from center** always — no origin-aware `transform-origin` keyed to the collision-resolved side. Radix exposes `--radix-hover-card-content-transform-origin` exactly so the panel scales *from the trigger*; not wired here. The micro-detail a best-in-class popover nails. |
| perceived-performance | ✓ | Instant; `forceMount`+portal, no CLS; open/close delays handled by Radix; transform/opacity only → no jank. |
| market-benchmark | gap | Built directly on vendored Radix so it inherits all of Radix's positioning/delays/focus-open. But vs upstream Radix it drops two things: no `HoverCardArrow` exposed, and no origin-aware transform-origin. PARITY on behavior, a hair behind on animation polish. |
| cross-DS-adoption | ✓ | Concrete imports available — see below. |

## Top gaps (prioritized)
- [P1] motion — no standalone `useReducedMotion` guard; scale ignores OS reduced-motion unless consumer mounts `MotionProvider`. → Gate the `scale` behind a local `useReducedMotion()`, keeping opacity-only fade (or zero) when reduced. Makes the component correct in isolation.
- [P1] api-composability — `HoverCard` root is `React.FC` (self-imposed-rule violation). → Convert to an explicit function component with a props interface matching the popover/dialog siblings; keep `displayName`.
- [P2] craft/motion — center-origin scale. → Wire `transform-origin` to `var(--radix-hover-card-content-transform-origin)` so the panel scales from the trigger side (Radix already emits it).
- [P2] docs-dx / state-coverage — single `Default` story. → Add Controlled, alignment/side, openDelay/closeDelay, interactive-content (button in content — the documented Tooltip differentiator), and focus-open + dark/forced-colors stories.
- [P3] visual/content — raw `w-64` default width. → Tokenize to a `--spacing-ds-*`-derived width or document it as the intended default.

## What it does well
- Zero visual slop: one edge treatment, correct overlay surface tier, role radius + role shadow, spacing on cadence — a textbook clean overlay.
- Full controlled/uncontrolled contract with a proper `isControlled` guard and `onOpenChange` passthrough.
- Motion is spatially right for an overlay: bounce-free spring for scale, dedicated fade tween for opacity, symmetric interruptible enter/exit via `AnimatePresence` + `forceMount`.
- Honest a11y: the pointer-only limitation is documented in the source JSDoc *and* the doc, with a clear "use Popover instead" pointer — better than silently shipping an inaccessible pattern.
- Strong theming resilience: forced-colors and dark are token-handled; `[data-shape]` presets flow through automatically.

## Cross-DS adoption ideas
- **Radix** emits `--radix-hover-card-content-transform-origin` — adopt it for origin-aware scale so the card grows from the trigger, not from center (the single biggest craft upgrade available, near-zero cost).
- **Radix `HoverCardArrow`** — offer an optional arrow slot for link/user-preview cards where the pointer relationship reads better with a beak.
- **Base UI** splits positioner from panel and exposes `collisionPadding`/`sticky` knobs on the positioner — worth surfacing these (Radix supports them on `Content`) as documented props rather than opaque passthrough, so consumers discover collision tuning.

## Rebuild note
**Polish, not rebuild.** The structure is sound — a clean Radix wrapper with correct tokens and good motion. Four in-place fixes get it to 5/5: (1) local `useReducedMotion` guard, (2) drop `React.FC` on the root for the sibling forwardRef/function-component pattern, (3) origin-aware `transform-origin`, (4) flesh out stories to the publish-gate bar. No structural or API change required; controlled/uncontrolled and composition are already correct.
