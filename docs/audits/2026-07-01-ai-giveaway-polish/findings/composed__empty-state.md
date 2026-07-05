# composed/empty-state — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:3 P2:4 P3:2

## Findings

### [P1][M1] Perpetual floating/bobbing icon animation by default
- **Category:** motion
- **Evidence:** empty-state.tsx:83-84 — `animate={reducedMotion ? {} : { y: [0, -4, 0] }}` / `transition={reducedMotion ? {} : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}`
- **Why:** A never-ending decorative bob on the icon is a textbook AI-slop motion tell — motion with no meaning, looping forever, drawing the eye to an empty screen. StatCard/Card only use motion for entrance/feedback that *means* something (value slide-up, hover-lift); nothing loops idly.
- **Fix:** Drop the infinite `y` loop. If you want life on the icon, do a one-shot entrance (fade + small scale-in via `springs.snappy`) that settles, consistent with StatCard's icon chip mount (`initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}}`).

### [P1][M3] Text-block entrance not guarded by reduced-motion
- **Category:** motion
- **Evidence:** empty-state.tsx:89-93 — title/description wrapper `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, ...tweens.fade }}` with no `reducedMotion` branch (only the icon float at line 83-84 is guarded).
- **Why:** The component calls `useReducedMotion()` but applies it to only one of two animations. Under reduced-motion the delayed fade-in still runs, so content flashes in late for users who asked for no motion.
- **Fix:** Gate the text entrance on `reducedMotion` too (skip `initial`/`delay`, or use `withReducedMotion(tweens.fade)` from `lib/motion`). Or wrap the whole thing in `MotionConfig reducedMotion="user"` and let it cascade.

### [P1][G2] Hardcoded arbitrary max-width instead of a token
- **Category:** drift
- **Evidence:** empty-state.tsx:90 — `className="flex max-w-[280px] flex-col gap-ds-02"`
- **Why:** Raw `280px` arbitrary value; the system's rule is tokens not literals. Also an odd off-cadence number that reads as a hand-tuned magic value.
- **Fix:** Use a spacing/size token or a `max-w-*` from the scale (e.g. a `--container-*` / `max-w-xs` equivalent), or expose it via a documented prop. At minimum move it to a named token so the measure is intentional and reusable.

### [P2][G1] Icon chip uses `bg-surface-raised` — invisible on a raised card
- **Category:** drift
- **Evidence:** empty-state.tsx:79-82 — chip `'flex items-center justify-center rounded-overlay-lg bg-surface-raised text-surface-fg-subtle'`
- **Why:** EmptyState is documented to sit *inside* Cards / DataTables (doc lines 33-34: "compact mode for embedding inside Cards"). Cards are `bg-surface-raised`. A `bg-surface-raised` chip on a `bg-surface-raised` card is the same colour — the chip disappears, so the container is decorative dead weight in the most common placement. On the page (`surface-1`) it also barely differs.
- **Fix:** Use a step that contrasts against the parent surface — `bg-surface-sunken` or `bg-surface-2`/`surface-3` per the layering scale, so the chip reads on both page and card. Or drop the chip background entirely and let the glyph stand alone.

### [P2][F1] `action` as a single bespoke prop rather than a slot
- **Category:** composability
- **Evidence:** empty-state.tsx:47,115 — `action?: React.ReactNode` rendered as `{action && <div className="mt-ds-02">{action}</div>}`; doc line 35 tells consumers to hand-roll `a div + flex with gap` for multi-action.
- **Why:** The Card bar composes via named slot sub-components (`CardFooter`, `CardAction`). A single `action` node is fine for one button, but the doc explicitly punts multi-action back to the consumer building their own flex row — the composability gap StatCard/Card avoid.
- **Fix:** Either keep `action` (acceptable single slot) but have it lay out multiple children with the DS footer gap (`flex items-center gap-ds-03 justify-center`), or expose an `EmptyStateActions` slot mirroring `CardFooter` so button rows get consistent spacing for free.

### [P2][H] Heading level hardcoded to `<h3>` — no way to fix document outline
- **Category:** a11y
- **Evidence:** empty-state.tsx:95 — `<h3 className={...}>{title}</h3>`
- **Why:** An empty state can appear at many outline depths (page-level empty screen vs. a widget inside a card). A fixed `h3` produces skipped/repeated heading levels depending on context, an a11y outline hazard.
- **Fix:** Add a `titleAs`/`headingLevel` prop (or accept `as`) defaulting to `h3`, or render a `role="heading"` with configurable `aria-level`. Cheap and removes the outline footgun.

### [P2][state-coverage] Story/doc actions bypass the DS Button
- **Category:** state-coverage
- **Evidence:** empty-state.stories.tsx:41-56, 81-96, 105-134, 169-183 — every `action` is a raw `<button style={{ ...inline... }}>` with hardcoded `background: '#D33163'`, `padding`, `borderRadius`; the doc example (empty-state.md:24) does use `<Button>`.
- **Why:** Stories are a publish gate and the reference for consumers. Modelling the action slot with hand-styled buttons (raw hex, inline styles) instead of `<Button>`/`variant="soft"` teaches the wrong pattern and hides real hover/press/focus states. Per CLAUDE.md the secondary action should default to `variant="soft"`.
- **Fix:** Replace inline-styled buttons in stories with the DS `<Button>` (primary + `variant="soft"` for secondary), so the slot demonstrates real component states.

### [P3][E6] Placeholder-looking button label in a story
- **Category:** verbal-tell
- **Evidence:** empty-state.stories.tsx:117 — button text renders the literal string `IconUpload` (clearly a leftover meant to be an upload icon).
- **Why:** Reads as an unfilled placeholder / copy-paste artifact shipped into a story.
- **Fix:** Render an actual upload icon + label ("Upload") or remove the button.

### [P3][docs] Doc prop table lists the pre-0.41 icon type, not `IconInput`
- **Category:** docs
- **Evidence:** empty-state.md:14 — `icon: ReactNode | ComponentType<{ className?: string }>`; source uses `IconInput` (`ReactElement | ComponentType<{ className?; size? }> | null | undefined`) from `lib/icon-input.ts`.
- **Why:** Minor drift from source; the canonical type is `IconInput`. Not load-bearing but inconsistent with the 0.41 unification.
- **Fix:** State `icon: IconInput` in the doc (link the shared type) rather than re-spelling a stale union.

## Composability gaps
- `action` slot handles one node well but the doc offloads multi-action layout to the consumer (empty-state.md:35). No `EmptyStateActions`/footer-style slot with DS gap. (F1)
- No `asChild`/polymorphism on the root or title; title heading level is fixed `h3` (not composable into arbitrary outline depth). (F2/H)
- It correctly does NOT re-roll a card surface (root is transparent flex) — good; it's a content pattern, not a surface. No F5 violation. The only surface it paints is the icon chip, which then collides with the raised card it's meant to live in (G1).
- Icon prop is properly typed `IconInput` and normalized via `normalizeIcon` — composability here is clean.

## Motion gaps
- Infinite decorative bob on the icon (M1) — the standout motion tell; loops forever with no meaning.
- Reduced-motion applied to the float but NOT to the text fade/delay (M3) — partial coverage.
- Timing is otherwise reasonable (`tweens.fade`, `delay: 0.2`) and tokenized; no bounce/backOut on entrance, no animated layout props. Once M1/M3 are fixed, motion is close to the bar.
- No hover/press feedback — but EmptyState isn't itself interactive (the action button owns feedback), so M4 does not apply to the root.

## Polish plan (ordered steps to reach the finish bar)
1. Kill the infinite icon bob (M1). Replace with a one-shot entrance (fade + slight scale-in, `springs.snappy`) matching StatCard's icon-chip mount, and let it settle.
2. Extend `useReducedMotion()` to the text-block entrance (M3) — skip delay/initial under reduced motion, or wrap in `MotionConfig`.
3. Fix the icon-chip surface (G1): switch `bg-surface-raised` → a contrasting step (`bg-surface-sunken` / surface-2) so the chip reads inside Cards, its documented home.
4. Replace `max-w-[280px]` with a token or documented prop (G2).
5. Make the title heading level configurable (`titleAs`/`aria-level`, default `h3`) (H).
6. Rework stories to use the DS `<Button>` (primary + `variant="soft"`), remove the `#D33163` inline-styled buttons and the `IconUpload` placeholder label (state-coverage, E6).
7. Update the doc prop table to `icon: IconInput` (docs).

## Clean (rubric dims that pass)
- **V1 accent rail:** none. Root is a transparent centered flex block — no left/top colored stripe.
- **V2 double edge:** none — no border+shadow on the container; the chip has neither border nor shadow.
- **V3 gradient text / V4 framework palette:** none in source. Title/description are solid `text-surface-fg`/`text-surface-fg-subtle`. (Raw `#D33163` appears only in stories, and it's the brand pink, not indigo.)
- **V5 emoji-as-icon:** none — real Tabler icons + the Devalok chakra fallback (a brand glyph, legitimate default). SVG fallback is `aria-hidden`.
- **V6 blob/glass/glow, V7 rounded-everything, V8 pill spam:** none.
- **V9 safe-face font:** uses `font-sans` + `--text-ds-*` tokens, no hardcoded Inter/Geist.
- **G3 variant-axis drift:** n/a — no `variant`/`color` axes; `compact` boolean + `iconSize` (sm/md/lg) are on-taxonomy.
- **I types:** `forwardRef` + `displayName` present; ref typed `HTMLDivElement`; `icon` typed `IconInput` (no `any`, no stringly enums). Clean.
- **J stories/tests:** story exists (publish gate met), tests cover title/description/action/icon variants/iconSize sizing/className merge + `describeConformance`. Solid coverage.
- **E verbal tells (source/JSDoc):** clean — no em-dash tics, AI vocabulary, or hedging in component source.
