# ui/input-otp — finish-bar audit
Finish: 4/5   Market: PARITY (shadcn/input-otp)   Rebuild: polish

Underlying lib: `input-otp` (Guilherme Rodz) — same primitive shadcn wraps. We add a `size` axis, `state`/FormField integration, and role-radius tokens on top. Source verified against `packages/core/src/ui/input-otp.tsx` (CVA-free; compound slots + size context).

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | ✓ | Role radius (`rounded-l/r-control`), semantic borders (`surface-border-strong`), `error-7`, `accent-9` ring, transparent input fill (not a card). Border-collapse via `border-r` + `first:border-l`. No slop tells. Caret now `h-ds-05 w-px` — the prior `h-[16px]` magic number is FIXED. No `border-card-strong`, no `rounded-ds-*`/`rounded-full`. |
| a11y | gap | `aria-invalid`/`aria-describedby`/`aria-required` correctly wired from `useFormField()`; axe-clean test; disabled handled. GAP: active-slot affordance is `ring-2 ring-accent-9` only, with **no `forced-colors:` fallback** — under Windows High Contrast the ring/caret position can vanish. Per-slot boxes are md=36px (< 44px), but the real target is one contiguous hidden input, so touch-target isn't a hard fail. |
| api-composability | gap | Canonical compound API (`InputOTP`/`Group`/`Slot`/`Separator`), size via context (mirrors Card), `state` (default/error), controlled+uncontrolled delegated to lib, forwardRef+displayName on all four. GAP (P1): `size` intersects the native numeric `input size` attr → union `string\|number`, laundered through a `typeof sizeProp === 'string'` runtime guard; `size={4}` silently falls back to `'md'`. Separator hardcodes `IconMinus`, ignores `children`. |
| docs-dx | gap | Doc has Props/Compound/Defaults/Example/Composability/Gotchas and matches source. GAP: presents lib pass-through props (`value`/`onComplete`/`pattern`) as first-class; no `WithinFormField`/`onComplete` story. |
| testing | gap | unit+RTL+axe; covers input/maxLength/separator/multi-char. GAP: axe runs default only (not error/disabled/FormField-wrapped); no FormField-inheritance assertion; no `describeConformance`. |
| motion | gap | Only motion = `animate-caret-blink` (1.25s `ease-out` infinite, opacity) + a token-driven `transition-[box-shadow,border-color]` on active. Motion is appropriately minimal. GAP: infinite caret blink is guarded only by the **global** reduced-motion reset, not a component-level `motion-reduce:` opt-out — verify caret freezes visible (opacity 1), not hidden. |
| state-coverage | gap | default/active/disabled/error all deliberately designed. GAP: no filled/complete visual state, no success, no read-only; `onComplete` behavior undocumented in stories. |
| content-resilience | gap | maxLength flexible (4/6), optional separator, composable groups, one char/slot so no overflow. GAP: `first:rounded-l-control`/`last:rounded-r-control` + `border-l`/`border-r` are PHYSICAL, not logical — corners/borders won't mirror in RTL (low impact; OTP digits are LTR-universal). |
| theming-resilience | ✓ | `accent-9`/`error-7`/`surface-border-strong`/`*-control` — survives accent-9 swap, honors `[data-shape]` via role radius. Transparent slots with borders → no sunken track to vanish in dark. |
| system-cohesion | ✓ | Size-context pattern mirrors Card's `CardSizeContext`; shared `Icon`, `useFormField`, role radius, semantic tokens. No bespoke drift. "In tune." |
| craft | ✓ | Border-collapse avoids double borders between slots; `z-raised` on active so ring isn't clipped by neighbors; fake-caret centered via absolute inset; `has-[:disabled]:opacity-action-disabled` on container. |
| perceived-perf | ✓ | Instant per-keystroke feedback from lib; no CLS; smooth active transition. |
| market-benchmark | gap | PARITY with shadcn (same `input-otp` primitive). We LEAD on FormField auto-inheritance + `size` axis + role tokens; we LAG on separator overridability and forced-colors resilience. React Aria has no dedicated OTP; nothing clearly ahead of us in market. |
| cross-ds-ideas | ✓ | Concrete imports identified below. |

## Top gaps (prioritized)
- [P1] api-composability — `size` collides with native numeric `input size`, forcing a runtime `typeof` guard and letting `size={4}` silently no-op → `Omit<React.ComponentPropsWithoutRef<typeof OTPInput>, 'size'> & { size?: InputOTPSize }` on both the forwardRef generic and exported `InputOTPProps`; delete the guard.
- [P2] a11y — active-slot ring has no forced-colors fallback → add `forced-colors:ring-[Highlight]` (or a surviving `outline`) so caret position stays visible under Windows High Contrast.
- [P2] state/testing — headline FormField auto-inheritance has zero story/test → add `WithinFormField` story + a test asserting `aria-invalid`/`aria-describedby` propagate; add a filled/`onComplete` story.
- [P2] motion — infinite caret blink relies on the global reduced-motion reset only → add explicit `motion-reduce:animate-none motion-reduce:opacity-100` on the caret bar so it reads as present, not frozen-invisible.
- [P3] composability — `InputOTPSeparator` hardcodes `IconMinus` and ignores `children` → render `children ?? <Icon icon={IconMinus} size="sm" />` or accept an `icon` prop.
- [P3] docs — mark pass-through props "(from `input-otp`)" and note `size` is the DS string axis, not the native numeric attr.

## What it does well
- Structurally near the Card bar: clean compound slots, size propagated via context, full library prop pass-through, no corner-props.
- Correct a11y wiring from FormField context (`aria-invalid`/`describedby`/`required`).
- Border-collapse + `z-raised`-on-active + centered fake caret = quiet craft most OTP wrappers skip.
- Pure role/semantic tokens throughout; the prior `h-[16px]` caret magic number was resolved to `h-ds-05`.

## Cross-DS adoption ideas
- shadcn/input-otp keeps the same primitive but ships a **paste-friendly** demo + `REGEXP_ONLY_DIGITS` pattern preset — we could expose a `pattern` convenience prop/story and document paste behavior (the lib already supports it).
- React Aria's field patterns model **description + error message** as first-class slots — we could add a `WithinFormField` recipe showing helper/error text wiring end-to-end.
- Consider a **masked/`password` mode** (render `•` instead of the char) for sensitive codes — no peer's OTP does this well; would be a genuine lead.
- Separator override slot (children/icon) — table-stakes composability we're missing vs our own family standard.

## Rebuild note
Polish, not rebuild. The structure, tokens, cohesion, and craft are all at bar — no structural defect justifies a rebuild. Ship the P1 `size` type fix (removes a real silent-failure API hole), the P2 forced-colors + FormField story/test + reduced-motion caret guard, then the P3 separator slot and doc tidy. All in-place edits.
