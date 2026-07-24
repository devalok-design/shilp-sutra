# ui/textarea — finish-bar audit
Finish: 3/5   Market: PARITY (shadcn Textarea; slight lag vs React Aria TextField)   Rebuild: polish

Source-verified against `packages/core/src/ui/textarea.tsx`, its stories/test/doc, and the `Input` sibling it explicitly mirrors ("same pattern as Input") — so Input is both peer and cohesion baseline. Prior baseline (2026-07-01) scored 3/5; since then two of four magic min-heights were tokenized and `InputState`→`FieldState` unified, but the inert-motion and family-drift gaps persist.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | `rounded-control` role token ✓, edge-only (no border+shadow double edge) ✓, semantic tokens (accent-9/error-7/surface-*) ✓, no slop tells. BUT `min-h-[60px]`/`min-h-[120px]` (sm/lg) remain raw arbitrary values; xs/md were correctly tokenized to `min-h-ds-09`/`ds-11` (a code comment concedes 60/120 have no exact token). |
| accessibility | ✓ | `aria-invalid` on error, `aria-describedby`+`aria-required` merged from FormField context (explicit props win), `focus-visible:ring-2`+offset, native keyboard/focus semantics. Smallest size 48px ≥ 44px touch target. No explicit `forced-colors` block, but semantic border colors survive HCM. |
| api-composability | ✓ | Canonical `state: FieldState` (not `error`/`color`), size xs/sm/md/lg, controlled+uncontrolled via native, `forwardRef`+`displayName`, native `size` omitted correctly, no stringly types. Minor: `motionProps()` erases prop types to `Record<string,unknown>` internally; no `resize` prop (only `className="resize-none"` escape). |
| docs-dx | gap | doc.md has Props/Defaults/Example/Composability/Gotchas/Changes and lists all 4 sizes correctly. BUT the in-source JSDoc `**Sizes:**` line omits the shipped `xs` — drift in the tooltip/llms surface. |
| testing | gap | `describeConformance` across all 4 sizes ✓; render/change/disabled/read-only/rows + 3 state-border classes covered. Missing: focus-visible ring assertion, `aria-required` wiring assertion, and an axe/play test in stories. |
| motion | gap | `motion.textarea` ships with zero `initial`/`animate`/`whileFocus`/`transition` — an inert Framer element (bundle + type-erasure cost, no behavior). Feedback is CSS (`transition-colors duration-fast-01`), which is correct for a high-frequency input; the defect is the vestigial wrapper. Fix is to drop it to a plain `<textarea>` (as Input does), not to add motion. No reduced-motion guard needed while there is no JS motion. |
| state-coverage | ✓ | hover / active (bg tokens) / focus-visible / disabled / read-only / error / warning / success all deliberately styled; empty = placeholder. Loading N/A for a text field. Strong matrix. |
| content-resilience | ✓ | `resize-y` vertical grow, `w-full`, native overflow scroll, min-h floors. No auto-grow — acceptable, that scope lives in MessageInput. Native element handles RTL text direction. |
| theming-resilience | ✓ | All colors semantic → survives accent-9 swap; `rounded-control` honors `[data-shape]`; hover/read-only surfaces work light+dark; no sunken track to invert. |
| system-cohesion | gap | Drifts from its declared sibling Input on four points: (a) `motion.textarea` vs Input's plain `<input>`; (b) focus edge `focus-visible:border-accent-7` vs Input's `focus-within:border-surface-border`; (c) `transition-colors duration-fast-01` vs Input's explicit `transition-[...] duration-fast-02`; (d) heights via `min-h-ds-*`/arbitrary vs Input's clean `h-ds-*` ramp. A form mixing both shows inconsistent focus chrome. Each fix is a small class swap — accumulated drift, not a hard failure. |
| craft | ✓ | `disabled:cursor-not-allowed`, `read-only:cursor-default`, subtle placeholder token, resize handle, ring offset. No layout shift. Quietly correct. |
| perceived-performance | ✓ | Instant CSS feedback, no CLS, native element — nothing to load; motion-wrapper overhead negligible. |
| market-benchmark | gap | PARITY with shadcn Textarea (we add size ramp + `FieldState` + FormField auto-wiring it lacks). Lags React Aria's TextField on field ergonomics (auto-resize / field-sizing, char-count announcer). |
| cross-ds-adoption | gap | See ideas below — auto-grow, `resize` prop, char-count slot. |

## Top gaps (prioritized)
- [P1] motion / system-cohesion — inert `motion.textarea` + `motionProps()` type-erasure diverges from Input's plain element for no payoff. → Drop to plain `<textarea>`, remove the framer-motion + motionProps imports (restores prop types, matches the family).
- [P1] system-cohesion — focus edge `border-accent-7` contradicts Input's `border-surface-border`; align the whole input family (recommend Input's neutral border + accent ring so the ring alone carries focus accent). Also match Input's `duration-fast-02` timing.
- [P2] visual-integrity — `min-h-[60px]`/`min-h-[120px]` magic numbers. → Add textarea min-height tokens (or nearest `--spacing-ds-*`), finishing the xs/md tokenization already done.
- [P2] docs-dx — source JSDoc Sizes line omits shipped `xs`. → Add `xs` (min 48px) to the docstring.
- [P2] testing — no focus-ring / `aria-required` / dark coverage. → Add a focus-visible + required + dark story and assert the ring class + `aria-required` wiring.
- [P3] api-composability — no `resize` prop; the `resize-none` escape is undocumented in-source. → Expose `resize?: 'none'|'vertical'|'both'` or note the override in JSDoc.

## What it does well
- Clean a11y contract: `aria-invalid`/`describedby`/`required` all wired, FormField context merge with explicit-prop precedence, real native semantics.
- Canonical API — shared `FieldState`, no stringly-typed color, proper `forwardRef`/`displayName`, native controlled+uncontrolled, `InputState` kept as deprecated alias upstream (no hard break).
- No slop tells: single `rounded-control` radius (no radius-ds ship-blocker), edge-only model, semantic tokens throughout, no accent rails/gradients/emoji.
- Strong deliberate state matrix — every validation state recolors border + focus ring; disabled/read-only handled distinctly.

## Cross-DS adoption ideas
- React Aria / modern CSS: `field-sizing: content` (or JS auto-resize) so the textarea grows to fit content without a manual drag — the single biggest UX gap vs the best; ideal for chat/comment composers.
- Expose a typed `resize?: 'none'|'vertical'|'horizontal'|'both'` prop (Base UI style) instead of forcing `resize-y` + a `className` escape hatch — discoverable in the type surface.
- Character-count / max-length announcer slot (React Aria TextField, Carbon, MUI) — optional; keep the base minimal and layer it into a composed field.

## Rebuild note
Polish, not rebuild — structure and a11y are sound (native element, correct wiring, clean visuals, strong state coverage). Scope: (1) drop `motion.textarea` → plain `<textarea>`, remove framer-motion/motionProps imports to match Input and restore prop types; (2) reconcile focus-edge treatment and transition timing with Input; (3) tokenize the remaining sm/lg min-heights; (4) add `xs` to the JSDoc; (5) add focus/required/dark stories + assertions. All in-place; the only user-visible change is the focus-border reconciliation, which should ship as a deliberate family-wide decision.
