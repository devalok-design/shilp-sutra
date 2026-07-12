# Wave 1 Audit — Core Form Primitives

> Component-by-component audit against (a) our own DS hard-rules and cross-component consistency, and (b) four reference design systems: **shadcn/ui**, **Radix Themes**, **IBM Carbon**, **MUI / Material 3**.
>
> Scope: `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Label`, `Badge`, `Text`.
> Date: 2026-07-12 · Auditor: Claude Code · Method: source read (`packages/core/src/ui/*.tsx`) + docs/stories coverage check.

---

## How to read this

Each component gets two halves:

- **Internal** — surface layering, token hygiene, CVA-axis consistency vs siblings, a11y, SSR, docs+stories, composition. Graded against CLAUDE.md hard rules.
- **External** — code quality, visual/feature richness, and completeness vs the four reference DS.

Scores are `A–F` per half, with the specific defects that pull the grade down. **Grades are relative to our own maturity bar, not absolute** — a `B` here still ships.

---

## Cross-cutting findings (apply across the whole wave)

These are the systemic issues. Fixing them is higher-leverage than any single-component tweak.

### X-1 — Validation-state API is fragmented three ways 🔴 HIGH
Same concept ("this field is invalid/warned/ok"), three different prop shapes:

| Component | API | Values |
|---|---|---|
| Input, Textarea | `state` (string) | `default \| error \| warning \| success` |
| Select (on Trigger) | `color` (string) | `default \| error \| success \| warning` |
| Checkbox, Radio, Switch | `error` (boolean) | on/off only — **no warning/success** |

A consumer wiring validation across a form must remember three idioms. Worse, Select overloads `color` (which on Button/Badge means *palette*) to mean *validation*. **Recommendation:** unify on a single `state` prop (string union) across all form controls; keep `error` boolean as a deprecated alias on the toggles. Carbon and MUI both use one uniform invalid/warn API — this is the single biggest ergonomics gap vs mature DS.

### X-2 — Token hygiene: raw-px sizing on half the wave 🟡 MEDIUM
Button/Input/Select size their heights with scale tokens (`h-ds-md`, `h-ds-lg`). But:

- **Textarea** — `min-h-[48px] / [60px] / [80px] / [120px]` (all arbitrary)
- **Checkbox** — `h-5 w-5 / h-6 w-6 / h-7 w-7`, icons `h-[14px] / h-[18px]`
- **Radio** — same raw `h-5..h-7`; indicator `h-1.5 / h-2.5` (md correctly uses `h-ds-03`)
- **Switch** — track `h-6 w-[38px] / w-11 / h-7 w-[52px]`, `travel: 16/20/24` hardcoded
- **Badge** — `h-4/h-5/h-6/h-7`, `px-2.5` (self-flagged "no exact DS token"), `dot h-1.5`
- **Input** — `sectionWidthMap: w-[26px]..w-[46px]`

Two of these are really *scale gaps* (the DS spacing/size scale has no token at 10px or at the control heights toggles need), which is itself the finding: **the token scale doesn't cover the control-sizing needs, so components leak arbitrary values.** The pre-publish audit's token-hygiene gate isn't catching height/width arbitraries — only surface/shadow. **Recommendation:** add `--size-control-*` tokens for the toggle/badge heights and extend the audit gate to flag `h-[Npx]`/`w-[Npx]` in `src/ui`.

### X-3 — `color` prop means four different things 🟡 MEDIUM
- Button: intent palette (`accent/error/success/warning/neutral`)
- Badge: intent + 16-color category palette + `custom`
- Switch: accent-tint only (`accent/success/warning`) — no error/neutral
- Select: validation state (see X-1)
- Checkbox/Radio: **no `color` prop** — always accent

There's no shared `color` vocabulary. Radix Themes (our clear design ancestor) uses one `color` scale prop everywhere; MUI uses one `color` enum everywhere. **Recommendation:** define one canonical intent-color union, let components subset it, but never *redefine* it (Select's usage should move to `state`).

### X-4 — Size vocabulary splits into two families 🟢 LOW (defensible)
Text fields: `xs/sm/md/lg`. Toggles (Checkbox/Radio/Switch): `sm/md/lg` (no `xs`). Defensible — a 16px checkbox fails WCAG target size — but worth documenting explicitly so it reads as intentional, not accidental drift.

### X-5 — What's genuinely strong ✅
- **FormField context wiring is excellent and uniform** — every control (`Input/Textarea/Checkbox/Radio/Switch/Label/Select`) reads `useFormField()` and threads `aria-describedby / aria-required / aria-invalid`. This is more composable than Carbon/MUI's monolithic fields and better than shadcn (which has no equivalent). Keep it.
- **Focus ring is uniform** — `ring-2 ring-accent-9 ring-offset-2` everywhere, error-state swaps ring color. Consistent.
- **SSR discipline is correct** — all interactive components `'use client'`; only `Text` is `// @server-safe` (right call — pure, no hooks/motion).
- **All 10 have docs + stories.** No coverage gaps.

---

## Component scorecards

### 1. Button — Internal A− · External A
The most feature-dense component in the wave; arguably beyond any of the four reference DS on state handling.

**Internal**
- ✅ CVA 2-axis (`variant` × `color`) + `size` + `weight`; full compoundVariants matrix (5 variants × 5 colors). Clean.
- ✅ Tokenized sizing (`h-ds-*`, `px-ds-*`, `shadow-raised/brand/error/...`), colored hover-shadows per intent — a genuinely nice touch.
- ✅ `asChild` via Slot, `forwardRef`, ButtonGroup context propagation, DevalokGrain layering, reduced-motion aware.
- ✅ a11y: `aria-busy`, `aria-disabled` on processing, focus ring, disabled saturate.
- 🟡 `gap-2.5` (lg) and `py-[3px]/py-[5px]` (compact) are arbitrary values — minor scale-gap leak (X-2).
- 🟡 `ghost+accent` silently renders neutral for "backward compat" — documented, but it's a surprise footgun (asking for accent and getting grey).
- 🟡 540 lines. The async state machine + processing overlay + width-animation `useEffect` are a lot of surface to maintain in the base primitive. Not wrong — but it's three features fused into one component.

**External**
- vs **shadcn** (~50-line button, `variant`+`size`, no loading): we vastly exceed — built-in `loading`, `onClickAsync` state machine (idle→loading→success/error), `processing` ants. shadcn has none of this.
- vs **Radix Themes**: our `variant`×`color` is directly modeled on RT (solid/soft/outline/ghost + the 1–12 step scale — `accent-9`, `accent-11`). Missing RT's `highContrast` and per-button `radius`.
- vs **Carbon**: Carbon bakes intent into named *kinds* (primary/secondary/tertiary/danger/ghost) — less composable than our 2-axis. Carbon has no motion.
- vs **MUI**: comparable 2-axis; MUI isolates loading into `<LoadingButton>`, we inline it (nicer DX). MUI's systematic state-layer opacity vs our hand-tuned per-variant `active:` classes — MUI is more uniform, ours is more tuned.
- **Verdict:** richest button of the five. Cost is maintenance surface.

### 2. Input — Internal A− · External A
**Internal**
- ✅ Container-first wrapper architecture, section slots (`startSection/endSection`) with auto icon/label inference (string→label, element→icon) — clever and more capable than shadcn/RT input.
- ✅ Tokenized heights (`h-ds-*`), FormField wiring, `focus-within` ring on wrapper (correct for the container pattern).
- 🟡 `sectionWidthMap` raw `w-[26px]..w-[46px]` (X-2).
- 🟡 `className` targets the `<input>`, `wrapperClassName` targets the wrapper — documented but a two-target className API is a known confusion source; make sure examples always show both.

**External**
- vs **shadcn/RT**: both ship a bare styled `<input>` (~20 lines). Our section system + FormField integration is materially richer.
- vs **Carbon/MUI**: they embed label+helper+invalid *inside* the field. Ours delegates to FormField — more composable, slightly less foolproof. Feature parity otherwise.

### 3. Textarea — Internal B · External A−
**Internal**
- 🟡 **Raw `min-h-[48/60/80/120px]`** — the only sizing in the wave with zero token backing (X-2). Input, its sibling, uses `h-ds-*`; Textarea should mirror.
- 🟡 Wrapped in `motion.textarea` purely to pass `motionProps` — no actual animation defined. Overkill; a plain `<textarea>` would drop a framer-motion dependency from a leaf input. Verify this isn't dead weight.
- ✅ Shares `InputState` with Input, FormField wiring, resize-y, tokenized padding/text.

**External**
- vs **shadcn/RT**: richer (size axis + validation). vs **Carbon/MUI**: parity minus the in-field label. Solid.

### 4. Select — Internal A− · External A
**Internal**
- ✅ Full Radix compound (`Trigger/Content/Item/Label/Separator/ScrollButtons`), portal, `z-popover`, `bg-surface-overlay` + `shadow-floating` (correct overlay surface tier per CLAUDE.md).
- ✅ Motion on content (spring + fade), tokenized spacing throughout, FormField wiring on Trigger.
- 🔴 **`color` overloaded for validation** (X-1/X-3) — `color="error"` on the Trigger is the validation API here, inconsistent with Input's `state`.
- 🟢 Good self-documenting JSDoc warning that `size` goes on Trigger not Root (a real Radix footgun) — nice.

**External**
- vs **shadcn**: shadcn Select is the same Radix wrap; ours adds motion + validation + size axis on trigger. Ahead.
- vs **RT**: RT Select has a cleaner single-element API (`<Select.Root>` with `size`/`variant`/`color` on Root, not Trigger). RT's ergonomics are better here — ours inherits Radix's split-prop awkwardness.
- vs **Carbon/MUI**: comparable; MUI's `<Select>` + `<MenuItem>` is heavier. Parity.

### 5. Checkbox — Internal B+ · External A−
**Internal**
- ✅ Radix-powered, indeterminate support with animated SVG draw (check + dash), controlled/uncontrolled internal-state tracking for AnimatePresence, `touch-target`, FormField error wiring.
- 🟡 **Raw `h-5/h-6/h-7` + icon `h-[14px]/h-[18px]`** (X-2).
- 🔴 **No `color` prop** — always accent. Switch has `color`, Checkbox doesn't. Inconsistent within the toggle family (X-3).
- 🟡 Validation is `error` boolean only — no warning/success (X-1).

**External**
- vs **shadcn/RT**: ours adds indeterminate animation + size axis + error state. Ahead on features.
- vs **MUI**: MUI checkbox has uniform `color` + `size` — ours lacks `color`. MUI wins on consistency, ours wins on the animated indicator.
- vs **Carbon**: Carbon checkbox is simpler, stricter tokens. Parity minus tokens.

### 6. Radio — Internal B+ · External A−
**Internal**
- ✅ `RadioGroup` + `RadioGroupItem`, spring-animated indicator, `touch-target`, FormField wiring on the group.
- 🟡 **Raw `h-5/h-6/h-7`**; indicator `h-1.5/h-2.5` raw (md uses `h-ds-03`) — inconsistent even *within* the same size map (X-2).
- 🔴 No `color` prop; `error` inferred from FormField only (no explicit `error` prop like Checkbox/Switch have) — third variation of the error API within the toggle family.

**External** — mirrors Checkbox. Ahead of shadcn/RT on motion, behind MUI on `color` uniformity.

### 7. Switch — Internal B · External A−
**Internal**
- ✅ Framer-motion thumb travel, `whileTap` scale, three colors, `thumbIcon` slot, `touch-target`, FormField wiring.
- 🟡 **Everything raw-px**: `h-6 w-[38px] / w-11 / h-7 w-[52px]`, `travel: 16/20/24` as JS numbers, `h-ico-md` mixed with `h-5/h-6`. Most token-leaky component in the wave (X-2).
- 🟡 `color` = `accent/success/warning` (no error — error is a separate boolean; no neutral). Yet another color-subset shape (X-3).
- 🟢 `border-2` + `shadow-raised` track gives a nice physical feel — good visual.

**External**
- vs **shadcn/RT**: ahead (motion, color, thumbIcon). vs **MUI**: MUI switch has the Material thumb-elevation + ripple; ours has spring travel — stylistic parity, MUI more systematic. vs **Carbon**: Carbon toggle has explicit on/off text labels (accessibility feature) — **we don't offer label text inside the track**; consider for parity.

### 8. Label — Internal A · External A
**Internal**
- ✅ Tiny, correct, `forwardRef`, FormField `htmlFor` + `required` fallback, `peer-disabled` opacity, required-asterisk with `aria-hidden`. Nothing to fix.
- 🟢 Only quibble: `text-ds-md` fixed size — no size axis to match field sizes (a `sm` field with an `md` label). Minor; most DS do the same.

**External** — parity with shadcn/RT/MUI/Carbon labels; our FormField auto-`htmlFor` is a small DX edge.

### 9. Badge — Internal B+ · External A
**Internal**
- ✅ Enormously capable: 4 variants × 16 colors + custom (`color-mix` CSS vars), dot pulse, dismiss button, selected-toggle with animated check, truncate+title, circle, `asChild`, and smart `div[role=button]` fallback when `onClick`+`onDismiss` coexist (avoids nested `<button>`) — a genuinely thoughtful a11y call.
- 🟡 **Raw `h-4/h-5/h-6/h-7` + `px-2.5`/`pl-2.5`** (self-flagged no-token) (X-2).
- 🟡 338 lines — a mini-system. Compare shadcn badge (~30 lines). Feature richness is real but so is the maintenance surface; worth asking if `selected`/`onClick`/`onDismiss` should live in a separate interactive-chip component.
- 🟡 Interactive badge (`onClick`) has focus ring but **no `touch-target`** — small badges as buttons may miss the 44px target (a11y). Checkbox/Radio/Switch got `touch-target`; Badge didn't.

**External**
- vs **shadcn**: no contest — shadcn badge is a static label; ours is interactive, dismissible, categorized.
- vs **RT**: RT Badge has variant+color+size+radius+highContrast but is non-interactive. Ours exceeds on interaction, matches on palette.
- vs **Carbon (Tag)** / **MUI (Chip)**: MUI's `<Chip>` is the real comparison (clickable/deletable/avatar) — we're at Chip parity, and our category-color palette is broader. Missing MUI Chip's avatar slot.

### 10. Text — Internal A · External A−
**Internal**
- ✅ Correct `// @server-safe` (pure, no client deps), polymorphic `as` with proper generic-preserving cast (Radix pattern), semantic default-element map (`heading-2xl→h1`…), full type scale via CSS vars. Clean.
- 🟢 No defect worth flagging. The polymorphic cast is the standard unavoidable TS dance.

**External**
- vs **shadcn**: shadcn has no Text component (uses raw Tailwind classes) — we're ahead on systemization.
- vs **RT** (`<Text>`/`<Heading>`) / **MUI** (`<Typography>`): parity. MUI Typography has `gutterBottom`/`noWrap`/`paragraph` conveniences we lack; RT splits Text vs Heading (we unify — arguably cleaner). We lack a `truncate`/`lineClamp` prop that both MUI and RT offer (we have a separate `TruncatedText` component — check that's not duplication).

---

## Wave 1 grade summary

| Component | Internal | External | Top defect |
|---|---|---|---|
| Button | A− | A | 540-line maintenance surface; ghost+accent footgun |
| Input | A− | A | dual-className API; raw section widths |
| Textarea | **B** | A− | raw `min-h[]`; pointless `motion.textarea` |
| Select | A− | A | `color` overloaded for validation |
| Checkbox | B+ | A− | no `color` prop; raw px |
| Radio | B+ | A− | error-API third variant; raw px |
| Switch | **B** | A− | most token-leaky; color subset odd |
| Label | A | A | (none material) |
| Badge | B+ | A | no touch-target when interactive; 338 lines |
| Text | A | A− | no lineClamp prop |

**Wave verdict:** Against shadcn and Radix Themes — our real siblings — we **meet or exceed** on features and richness everywhere, at the cost of 3–5× the code. Against Carbon and MUI — the governance benchmarks — we **lag on two things**: (1) uniform validation API, (2) token discipline (raw-px sizing that their audits would reject). Both are the cross-cutting findings X-1 and X-2, and both are fixable without touching visual design.

---

## Recommended actions (ranked)

1. **X-1 — Unify validation API.** One `state` prop across all form controls; `error` boolean deprecated-alias on toggles. *Breaking-adjacent* — needs a changeset + Karm DS notice. Highest ergonomics payoff.
2. **X-2 — Close the size-token gaps + extend the audit gate.** Add control-size tokens for toggle/badge heights; make `pre-publish-audit.mjs` flag `h-[Npx]`/`w-[Npx]` in `src/ui`. Prevents future leak.
3. **Badge — add `touch-target` when interactive.** Small a11y fix, non-breaking.
4. **Checkbox/Radio — add `color` prop** to match Switch, or explicitly document that toggles are accent-only by design.
5. **Textarea — replace `min-h[]` with tokens; verify `motion.textarea` isn't dead weight.**
6. **Button — consider extracting** async/processing into a composed `AsyncButton` if the base primitive's surface keeps growing.

> Next: **Wave 2 — Overlay/interaction** (Dialog, Popover, Tooltip, DropdownMenu, Sheet, Toast, Combobox, Tabs, Accordion). Awaiting checkpoint approval.
