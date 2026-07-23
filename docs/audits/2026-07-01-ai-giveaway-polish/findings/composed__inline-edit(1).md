# composed/inline-edit — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:5 P3:2

InlineEdit is visually clean — no accent rail, no gradient, no double-edge, real icon (IconPencil), token-bound colors/spacing/radius/durations, thoughtful a11y label forwarding. It does NOT reach the Card bar because of: a controlled-only API with no uncontrolled mode and an `onSave`-not-`onValueChange` naming choice; a deprecated `document.execCommand`; keyboard-only users can't discover the affordance (pencil is hover-only); no reduced-motion consideration for its CSS transitions; and thin state coverage (no forced-colors/RTL/reduced-motion demos, focus ring is JS-`focused`-driven not `:focus-visible`).

## Findings

### [P1][F6] Controlled-only, no uncontrolled mode; `onSave` not `onValueChange`
- **Category:** composability
- **Evidence:** inline-edit.tsx:14-24 — `value: string; onSave: (newValue: string) => void | Promise<void>` — no `defaultValue`, no `onChange`/`onValueChange`.
- **Why:** Rubric F6 flags "supports `value` but not `defaultValue`" and non-input semantics using `onChange`-shaped callbacks. There's no way to use InlineEdit uncontrolled (e.g. a task title that self-manages until commit), and `onSave` conflates "commit event" with the value-change contract used elsewhere in the family (StatCard uses `onClick`, inputs use `onValueChange`).
- **Fix:** Add `defaultValue?: string` for uncontrolled use (fall back to internal state when `value` is absent). Keep `onSave` as the commit callback (its semantics are genuinely "save", not "change"), but document that it is the only change surface and that there's intentionally no per-keystroke `onChange`. If per-keystroke is ever needed, add `onValueChange`.

### [P1][H] Focus ring is JS-`focused`-driven, not `:focus-visible`; lost in forced-colors
- **Category:** a11y / state-coverage
- **Evidence:** inline-edit.tsx:166 `outline-hidden` + inline-edit.tsx:171 `focused && '... ring-1 ring-accent-7'`. The ring is applied from React `focused` state (set in `handleFocus`, inline-edit.tsx:65-79), so it shows on ANY focus (mouse, programmatic) — the opposite of `:focus-visible`, which the DS uses to show a ring only for keyboard focus.
- **Why:** Removing the native outline (`outline-hidden`) and replacing it with a color ring means: (a) the ring paints even on mouse click (visual noise the DS avoids elsewhere), and (b) `ring-*` is a box-shadow-based ring that disappears under `forced-colors: active` with no `forced-color-adjust`/outline fallback. Rubric H: "focus ring removed without `:focus-visible` replacement; lost in forced-colors."
- **Fix:** Prefer the DS `focus-ring` utility / a real `:focus-visible` outline on the editable span instead of a JS-state ring, and add a `forced-colors:` outline fallback so the edit affordance survives high-contrast mode. If the accent-7 ring is deliberate as an "editing" indicator (not a focus ring), keep it but ALSO retain a `:focus-visible` outline for keyboard users.

### [P1][H] Edit affordance (pencil) is hover-only — invisible to keyboard/touch users
- **Category:** a11y / state-coverage
- **Evidence:** inline-edit.tsx:181-183 — `opacity-0 group-hover:opacity-100`. The pencil only appears on pointer hover; there is no `group-focus-within:opacity-100`.
- **Why:** A keyboard user tabbing to the textbox, or a touch user (no hover), gets no visual cue that the text is editable. The whole affordance depends on hover. Rubric H requires focus-visible coverage; this is a discoverability gap for non-pointer input.
- **Fix:** Add `group-focus-within:opacity-100` (and consider a persistent low-opacity hint or `group-focus-within` reveal) so the pencil shows on focus, not just hover.

### [P2][M3] No reduced-motion consideration for the CSS transitions
- **Category:** motion
- **Evidence:** inline-edit.tsx:169 `transition-colors duration-fast-01`, inline-edit.tsx:182 `transition-opacity duration-fast-01`. These are plain CSS transitions with no `motion-reduce:` guard.
- **Why:** Rubric M3: "animation with no `prefers-reduced-motion` guard." The framer-based components use `withReducedMotion`/MotionConfig, but CSS transitions here rely entirely on a global `@media (prefers-reduced-motion)` reset existing in tokens. If no global reset zeroes transition-duration, these animate regardless of the user preference.
- **Fix:** Confirm a global `prefers-reduced-motion` transition reset exists in `base.css`/`animations.css`; if not, add `motion-reduce:transition-none` to the two transition classes. Low blast radius (70ms color/opacity), hence P2 not P1.

### [P2][state-coverage] Story/test set omits forced-colors, RTL, reduced-motion, and disabled-vs-saving states
- **Category:** state-coverage
- **Evidence:** inline-edit.stories.tsx has Default/BodyText/WithPlaceholder/AsyncSave/ReadOnly/MaxLength; no forced-colors, RTL, or reduced-motion story. Test file (inline-edit.test.tsx) covers value/placeholder/readOnly/saving/keyboard/aria but not focus-ring-in-forced-colors or the pencil-on-focus behavior.
- **Why:** The Card bar demands the applicable state matrix be shown. contentEditable + a custom ring is exactly the kind of thing that breaks silently in forced-colors; nothing demonstrates it survives.
- **Fix:** Add stories for forced-colors and (once fixed) focus-visible affordance; add a saving-state story (spinner + disabled edit) — currently `saving` is only covered in tests, never shown.

### [P2][a11y] `role="textbox"` lacks `aria-multiline` and never announces save/revert
- **Category:** a11y
- **Evidence:** inline-edit.tsx:151 `role={readOnly ? undefined : 'textbox'}`; commit at inline-edit.tsx:81-106 and revert at inline-edit.tsx:108-113 change text with no `aria-live` region.
- **Why:** A single-line editor should set `aria-multiline="false"` for correct SR semantics. On async save success/failure (including the silent revert-on-error at inline-edit.tsx:99-102), nothing is announced — a screen-reader user gets no feedback that a save failed and the value reverted. Rubric H: "async with no `aria-live`."
- **Fix:** Add `aria-multiline="false"` to the textbox; add a visually-hidden `aria-live="polite"` region (or `role="status"`) that announces "Saved" / "Save failed, reverted" on commit resolution.

### [P2][structural-tell] `document.execCommand('insertText')` is deprecated
- **Category:** structural-tell / a11y
- **Evidence:** inline-edit.tsx:141-145 `handlePaste` → `document.execCommand('insertText', false, text)`.
- **Why:** `execCommand` is deprecated (MDN) and behaves inconsistently across browsers; it's a common quick-fix reach for contentEditable paste sanitization. It works today but is fragile and not future-proof.
- **Fix:** Insert the plain-text via a Range/Selection API (`selection.getRangeAt(0)` → `range.deleteContents()` + `range.insertNode(textNode)` + collapse), or accept the paste and re-sanitize in `onInput`. Keep behavior (strip rich content) but off the deprecated API.

### [P3][types] `textClassName` escape hatch instead of typed size/typography surface
- **Category:** types / composability
- **Evidence:** inline-edit.tsx:19 `textClassName?: string` documented as `'text-ds-lg font-semibold'`; stories pass raw class strings (inline-edit.stories.tsx:19,39, etc.).
- **Why:** Typography is threaded through an untyped className string rather than a `size`/typography variant axis like the rest of the family. It works (and is legitimately flexible), but every consumer re-specifies the same DS text tokens by hand — mild drift risk and no canonical `size` axis (G3 territory, but it's a deliberate escape hatch so only P3).
- **Fix:** Optional: add a `size`/`as` typography axis (e.g. maps to `text-ds-*`) for the common cases while keeping `textClassName` for overrides. Non-urgent.

### [P3][a11y] contentEditable value-sync effect can clobber IME/composition
- **Category:** a11y / correctness
- **Evidence:** inline-edit.tsx:59-63 — effect writes `editRef.current.textContent = value` whenever `value` changes and not focused; commit path writes `textContent` directly during editing (inline-edit.tsx:91,101).
- **Why:** Directly setting `textContent` on a contentEditable is a known source of cursor-jump and IME-composition breakage for CJK/complex input. Guarded by `!focused` here (good), but the `handleInput` maxLength truncation (inline-edit.tsx:125-137) rewrites `textContent` mid-edit, which can drop an in-progress composition. Edge case, hence P3.
- **Fix:** Guard the maxLength rewrite behind a composition check (`onCompositionStart`/`End`) so it doesn't fire mid-IME.

## Composability gaps
- **No uncontrolled mode (`defaultValue`)** — controlled-only; can't drop in for a self-managing field (F6).
- **No `asChild` / polymorphism** — the editable element is a hardcoded `<span>` inside a `<div>` wrapper; a consumer can't make the editor a heading element or compose the wrapper (F2). Low priority since the visual is controlled by `textClassName`, but there's no way to change the semantic element.
- **Not composed from a base primitive** — reasonable here (it's a leaf contentEditable, nothing to compose), so F5 is N/A. Noted so synthesis doesn't flag it.
- **`onSave` is the only value surface** — no separate `onValueChange`; acceptable given "save on commit" semantics, but worth an explicit doc note that there is intentionally no per-keystroke change event.

## Motion gaps
- **No reduced-motion guard on the two CSS transitions** (M3) — relies on a global reset that may or may not exist; add `motion-reduce:transition-none` or confirm the global.
- **No entrance/exit or feedback motion on state changes** (M4, minor) — the switch idle→focused→saving is instant except for color/opacity; the spinner just appears. This is arguably correct restraint for an inline editor (no bounce, no elastic — good, M1 clean), but there's no crossfade between the pencil and the spinner, so the swap is abrupt. Optional polish, not a tell.
- **Positive:** no bounce/elastic default (M1 clean), no animated layout props (M5 clean), timing uses DS `duration-fast-01` tokens (M2 clean).

## Polish plan (ordered steps to reach the finish bar)
1. Fix the focus model: replace the JS-`focused` `ring-1 ring-accent-7` + `outline-hidden` with a `:focus-visible` DS focus ring on the editable span, and add a `forced-colors:` outline fallback. Keep an "editing" background/ring if desired, but don't let it be the only focus indicator. (P1, a11y)
2. Reveal the pencil on `group-focus-within`, not just `group-hover`, so keyboard/touch users see the affordance. (P1, a11y)
3. Add `defaultValue` for an uncontrolled mode; document `onSave` as the sole commit surface (no `onChange` by design). (P1, composability)
4. Replace `document.execCommand('insertText')` with a Selection/Range insert. (P2, structural-tell)
5. Add `aria-multiline="false"` + an `aria-live` status region that announces save/revert (especially the silent error-revert). (P2, a11y)
6. Confirm/add reduced-motion handling for the CSS transitions. (P2, motion)
7. Add stories: saving-state, forced-colors, focus-visible affordance, RTL. (P2, state-coverage)
8. (Optional) crossfade pencil↔spinner; optional typography `size` axis. (P3)

## Clean (rubric dims that pass)
- **V1 accent rail:** none — no colored left/top stripe.
- **V2 double edge:** clean — focused state uses ring only; idle uses bg hover only; no border+shadow combo.
- **V3 gradient text / V6 blob-glass-glow:** none.
- **V4 default framework palette:** uses semantic tokens (`accent-7`, `surface-fg`, `surface-fg-subtle`, `surface-raised-hover`) — no raw indigo/violet/slate.
- **V5 emoji as icon:** none — real `IconPencil` via the Icon API; Spinner for saving.
- **V7 rounded-everything:** uses `rounded-control-inner` token, not `rounded-2xl/3xl`.
- **G2 re-rolled tokens:** clean — spacing (`gap-ds-02`, `-mx-ds-01`, `px-ds-01`), radius, and durations (`duration-fast-01`) are all tokens; no hardcoded px/hex/dead-TW4 utilities.
- **G1 surface:** N/A — inline text editor, not a card; no surface-level violation.
- **M1/M2/M5:** motion is restrained and token-timed; no bounce, uniform-only, or layout-prop animation.
- **E1–E8 verbal tells:** JSDoc/doc/comments are direct and specific ("the text IS the editor", Notion/Linear/Figma reference) — no em-dash tic as connector, no AI vocabulary, no meta-hedging, no filler openers.
- **a11y labeling:** genuinely thoughtful — `aria-label`/`aria-labelledby` intercepted and forwarded to the `role="textbox"` span (not the wrapper), with placeholder fallback; covered by tests and axe-clean.
- **Types:** no `any`, no `React.FC`, proper `forwardRef<HTMLDivElement>` + `displayName`; props exported.
- **Tests + docs parity:** test suite is thorough (keyboard, readOnly, saving, aria, axe) and uses `describeConformance`; doc prop table matches source.
