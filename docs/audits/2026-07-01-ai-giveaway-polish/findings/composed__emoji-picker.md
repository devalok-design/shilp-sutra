# composed/emoji-picker — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:2

This is a thin wrapper around `@emoji-mart/react` (lazy-loaded) + a Popover variant. Most of the rendered surface is emoji-mart's own DOM, not ours, which limits both the tell surface and our control. The wrapper code itself is clean of hard AI tells (no accent rail, no gradient text, no framework palette, no glassmorphism). The real gaps are motion (no reduced-motion guard), re-rolled hardcoded px dimensions, a controlled/uncontrolled gap on the Popover, and stale docs.

## Findings

### [P1][M3] Entrance animations have no reduced-motion guard
- **Category:** motion
- **Evidence:** emoji-picker.tsx:111-117 — `<motion.div key="picker" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={springs.snappy}>`; skeleton branch lines 100-106 also animate opacity.
- **Why:** Both the skeleton→picker crossfade and the `scale: 0.95→1` pop-in run unconditionally; no `useReducedMotion()` / `withReducedMotion()` even though the helper exists in the same motion lib (`motion.ts:58`). A reduced-motion user gets the scale pop on every open.
- **Fix:** Gate the `initial`/`transition` via `useReducedMotion()` and fall back to `withReducedMotion(springs.snappy)` (or `initial={false}`), matching the system motion contract. Cheap because the helper already exists.

### [P1][F6] EmojiPickerPopover has no controlled `open`/`onOpenChange` pass-through
- **Category:** composability
- **Evidence:** emoji-picker.tsx:154 `const [open, setOpen] = React.useState(false)` then `<Popover open={open} onOpenChange={setOpen}>` (line 162). No `open`/`defaultOpen`/`onOpenChange` props on `EmojiPickerPopoverProps` (lines 40-44).
- **Why:** The popover is locked to internal-only state. A consumer who wants to open it programmatically (e.g. from a toolbar action, or close it on a route change) can't — the underlying Popover supports it but the wrapper swallows it. This is the F6 controlled/uncontrolled gap: it offers neither controlled `open` nor `defaultOpen`.
- **Fix:** Add optional `open?`, `defaultOpen?`, `onOpenChange?` to `EmojiPickerPopoverProps` and forward them to `<Popover>`; keep the auto-close-on-select by calling the consumer's `onOpenChange(false)` inside `handleSelect`.

### [P2][G2] Hardcoded pixel dimensions instead of tokens
- **Category:** drift
- **Evidence:** emoji-picker.tsx:108 `<Skeleton className="h-[435px] w-[352px] rounded-surface" />` and the Suspense fallback line 121 repeats `h-[435px] w-[352px]`.
- **Why:** `435px`/`352px` are raw arbitrary values duplicated in two places to match emoji-mart's intrinsic panel size. They're not bound to a `--spacing-ds-*`/size token and drift if emoji-mart's default dimensions change. (This is a soft G2 — the numbers mirror a third-party panel size, not our own scale, so a token wouldn't fully fit — but the duplication is the real smell.)
- **Fix:** Extract to a single named constant (e.g. `const PICKER_SIZE = 'h-[435px] w-[352px]'`) used by both the skeleton and the fallback so they can't drift apart; add a comment noting the source (emoji-mart default panel size).

### [P2][M2] Skeleton and picker share one identical transition (`springs.snappy`)
- **Category:** motion
- **Evidence:** emoji-picker.tsx:105 (`transition={springs.snappy}` on skeleton) and line 114 (`transition={springs.snappy}` on picker), inside an `AnimatePresence mode="wait"`.
- **Why:** Enter and the crossfade between two visually different states (loading shimmer vs. populated grid) use the same spring with no enter/exit differentiation. Minor — `mode="wait"` sequences them — but there's no exit transition tuning, so the loading→ready swap can feel abrupt for a ~200KB lazy chunk.
- **Fix:** Optional — a slightly longer fade-out on the skeleton (tween) and the scale-in only on the picker reads more intentional. Low priority.

### [P2][H] No focus management / aria-busy on the loading state
- **Category:** state-coverage / a11y
- **Evidence:** emoji-picker.tsx:99-109 skeleton branch renders a `<Skeleton>` with no `aria-busy`/`aria-live`; the populated picker mounts later with no focus move to the search input.
- **Why:** A screen-reader / keyboard user opening the popover lands during the async skeleton phase with no busy announcement, and when the grid arrives focus is not moved into it (emoji-mart manages internal nav but the mount transition isn't announced). The `loading`-with-no-`aria-busy` pattern is exactly what the rubric's H row flags.
- **Fix:** Add `aria-busy={!isReady}` and `role="status"` (or `aria-live="polite"`) to the wrapper, and consider focusing the picker's search field on ready. emoji-mart owns most a11y but the loading boundary is ours.

### [P2][J] llms-full.txt props table omits the `set` prop
- **Category:** docs
- **Evidence:** Source declares `set?: EmojiSet` (emoji-picker.tsx:29) as a first-class prop; llms-full.txt:5476-5481 lists `onSelect/theme/previewPosition/skinTonePosition/className` but NOT `set` in the EmojiPicker props block — it only appears prose-side at line 5510. The Defaults block (5492-5493) also omits `set="native"`.
- **Why:** Docs-parity drift: a public prop is missing from the structured props table an agent reads first. Source wins (rubric J).
- **Fix:** Add `set: "native" | "apple" | "google" | "twitter" | "facebook"` to the EmojiPicker props block and `set="native"` to the Defaults line.

### [P3][V5] Doc + story examples use a raw 😀 emoji as the trigger glyph
- **Category:** visual-tell
- **Evidence:** llms-full.txt:5498 `<Button variant="ghost" size="icon-sm">😀</Button>` and 5507 "Typical pairing is an icon-only IconButton with a 😀 label." Story `emoji-picker.stories.tsx:34-36` uses a text `Button` label ("Pick an emoji") — clean — but the doc steers consumers to an emoji-as-icon trigger.
- **Why:** Borderline. For an emoji *picker* a 😀 trigger is arguably semantically legitimate (it literally indicates "insert emoji"), unlike decorative 🚀/✨ bullets the rubric bans. But it's still an emoji standing in for an icon slot in our canonical doc example, which reads as the AI emoji-as-icon reflex to a reader skimming examples.
- **Fix:** Prefer a real lucide icon (e.g. `<IconMoodSmile />` via our Icon API) as the documented trigger; mention the emoji glyph as an alternative if desired. Low priority — defensible as-is.

### [P3][docs] Story `onSelect` handlers use `console.log`
- **Category:** docs
- **Evidence:** emoji-picker.stories.tsx:20-22, 56 `onSelect: (emoji) => console.log('Selected emoji:', emoji.native)`.
- **Why:** Minor — `console.log` in a story handler is a common stand-in but reads as scaffolding rather than a Storybook `action()` arg. Not an AI tell, just unpolished demo wiring.
- **Fix:** Use `fn()`/`action('onSelect')` from `@storybook/test` so selections show in the Actions panel instead of the browser console.

## Composability gaps
- **F6 (P1):** `EmojiPickerPopover` is internal-state-only — no `open`/`defaultOpen`/`onOpenChange` forwarding to the underlying `<Popover>`. Can't be driven programmatically.
- **F2 (minor):** `EmojiPicker` (inline) doesn't forward a `ref` and isn't `forwardRef` — it's a plain function component (`function EmojiPicker(...)` line 78). For a leaf wrapper this is low-impact, but it diverges from the Card-bar pattern where every public component forwards a ref. `displayName` is set (line 182) on a non-forwardRef component, which is slightly odd.
- **No `asChild` needed** — the Popover trigger already uses `PopoverTrigger asChild` (line 163), so trigger polymorphism is handled correctly. Good.
- The two-export split (inline `EmojiPicker` + `EmojiPickerPopover` composing it) is the right shape — the Popover variant genuinely composes the inline one rather than re-rolling. Clean.

## Motion gaps
- **M3 (P1):** No `prefers-reduced-motion` guard on either the skeleton crossfade or the `scale: 0.95→1` picker pop-in, despite `withReducedMotion()`/`useReducedMotion` being available in the same lib.
- **M2 (P2):** Skeleton and picker share one identical `springs.snappy` with no enter/exit differentiation across a visually distinct loading→ready swap.
- No M1 bounce-by-default issue — `springs.snappy` (damping 30) does not overshoot. Good.
- No M5 — animates `opacity`/`scale` (transform), not layout props. Good.

## Polish plan (ordered steps to reach the finish bar)
1. **M3:** Wrap the two `motion.div` transitions in `useReducedMotion()`; fall back to `withReducedMotion(springs.snappy)` or `initial={false}` when reduced motion is set.
2. **F6:** Add `open`/`defaultOpen`/`onOpenChange` to `EmojiPickerPopoverProps`, forward to `<Popover>`, keep auto-close-on-select via the forwarded handler.
3. **H/a11y:** Add `aria-busy={!isReady}` + `role="status"` to the loading wrapper; focus the picker search input on ready.
4. **G2:** Extract the duplicated `h-[435px] w-[352px]` to one constant shared by skeleton + fallback, with a comment citing emoji-mart's panel size.
5. **J:** Add the `set` prop (and its `native` default) to the llms-full.txt props/Defaults blocks.
6. **F2 (optional):** Convert `EmojiPicker` to `forwardRef` for consistency with the family.
7. **V5/docs (optional):** Swap the documented 😀 trigger glyph for a lucide `IconMoodSmile`; switch story handlers to `action()`.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. **V2 double-edge:** none (Popover content is `border-none bg-transparent shadow-none`, line 166 — defers entirely to emoji-mart's own panel). **V3 gradient text:** none. **V4 framework palette:** none — no raw indigo/violet/slate. **V6 blob/glass/glow:** none. **V7 rounded-everything:** uses `rounded-surface` token, not `rounded-2xl/3xl`. **V8 pill spam:** none.
- **V9-V15 reflexes:** none — no hardcoded Inter/Geist, no decorative numbering, no eyebrow kickers, no all-caps emphasis, no AI imagery.
- **E1-E8 verbal:** JSDoc/doc copy is direct and factual (e.g. "dynamic switching is not supported (emoji-mart limitation)") — no em-dash tic as connector, no AI vocabulary, no hedging, no chatbot artifacts.
- **G1 surface:** Popover content is correctly an overlay (surface-1 family via Popover); no card-on-surface-1 violation. **G3 variant-axis:** props are clean string-union enums (`set`/`theme`/`previewPosition`/`skinTonePosition`/`align`), no `filled`/`primary`/`small` drift.
- **I types:** no `any` in the public surface (`data`/loader use `unknown`, deliberately, with explanatory comment lines 56-66); `EmojiData`/`EmojiSet`/prop interfaces are exported and typed; no `React.FC`; no `color?: string`.
- **F2 trigger:** `PopoverTrigger asChild` is used correctly for trigger polymorphism.
- Skeleton placeholder is a legitimate loading affordance (not flagged as a gradient/shimmer tell per rubric).
