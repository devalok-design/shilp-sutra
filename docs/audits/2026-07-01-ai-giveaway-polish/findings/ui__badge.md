# ui/badge — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:4 P3:3

Badge is a mature, well-structured component: single-source color map, four canonical variants, four canonical sizes, reduced-motion-guarded dot pulse, focus-visible rings, `asChild`, sensible button/span/div semantics to avoid nested buttons, grain-ready (`relative overflow-hidden isolate`). It is close to the Card bar. The real gaps are (1) a toggle that doesn't announce its pressed state, (2) the selected check-icon animating layout props with no reduced-motion guard, and a handful of polish/parity nits. No P0 AI tells.

## Findings

### [P1][H] Toggle `selected` has no `aria-pressed` (and disabled non-button has no `aria-disabled`)
- **Category:** a11y / state-coverage
- **Evidence:** badge.tsx:220-241 — outer `<Comp>` sets `role="button"`/`tabIndex` for the div case (line 240) and `disabled` only when `Comp === 'button'` (line 239); nowhere is `aria-pressed` or `aria-disabled` emitted. `selected` (line 230) is purely visual (`ring-1 ring-current/20`).
- **Why:** The `selected` prop is used as a multi-select toggle (stories `Interactive`, `RealWorld` filter chips). A screen-reader user gets a plain "button", no on/off state. Disabled span/div badges also give AT no disabled signal.
- **Fix:** When `onClick` is present, emit `aria-pressed={!!selected}`. When `disabled` on a non-`button` Comp (span/div), emit `aria-disabled={true}`. (Keep native `disabled` for the button case.)

### [P1][M5] Selected check-icon animates layout props (`width`, `marginRight`) with no reduced-motion guard
- **Category:** motion
- **Evidence:** badge.tsx:266-279 — `animate={selected ? { opacity:1, scale:1, width:'auto', marginRight:0 } : { opacity:0, scale:0.5, width:0, marginRight:-4 }}` with a tween; no `useReducedMotion()` branch (the hook is read at line 164 but only applied to the dot pulse at 257-258).
- **Why:** M5 (animating `width`/`margin` instead of transform/opacity → layout thrash) and M3 (no reduced-motion respect — the check still expands/collapses for users who asked for no motion). The dot pulse next door does guard it, so this is an inconsistency within the same file.
- **Fix:** Gate this transition on `prefersReducedMotion` (snap `duration:0` like the dot does), and prefer animating `scale`/`opacity` + a fixed-width reservation (or `transform`) over `width`/`marginRight`. At minimum honor reduced-motion.

### [P2][J] Doc prop type drifts from source (`startIcon: ReactElement | null` vs `IconInput`)
- **Category:** docs
- **Evidence:** badge.md:11-12 lists `startIcon: ReactElement | null` / `endIcon: ReactElement | null`; source types them `IconInput` (= `ReactElement | ComponentType | null | undefined`) — badge.tsx:124-125, lib/icon-input.ts:39-43.
- **Why:** Source wins (CLAUDE.md make-kit rule). The doc understates the accepted type — a consumer passing `IconPlus` (component ref) is valid but reads as unsupported.
- **Fix:** Update badge.md to `startIcon: IconInput` / `endIcon: IconInput` (or spell the union) to match source.

### [P2][G2] Hardcoded `px-2.5` / `pl-2.5` (10px) instead of a DS spacing token
- **Category:** drift
- **Evidence:** badge.tsx:60 `md: 'h-6 px-2.5 ...'`, badge.tsx:84 `lg: 'pl-2.5'` — both carry the comment `/* 10px — no exact DS token */`.
- **Why:** Raw Tailwind spacing in a token-first system (G2). It IS annotated as a deliberate gap (no exact `--spacing-ds-*` for 10px), so this is a low-severity, acknowledged exception rather than a reflex.
- **Fix:** Either add a `--spacing-ds-*` step for 10px (5×2px cadence) and use it, or accept the annotated exception. Not urgent.

### [P2][H] `circle` count badges expose no accessible value
- **Category:** a11y / state-coverage
- **Evidence:** badge.tsx:232 `circle && 'justify-center px-0 aspect-square'`; stories use `<Badge circle variant="solid" color="error">3</Badge>` (badge.stories.tsx:249-252). The "3" is the only signal and there's no `aria-label`/`role="status"`.
- **Why:** A bare numeric count pill ("3", "99") with no context reads as a stray number to AT. (The dedicated `BadgeIndicator` handles count semantics; standalone `circle` count badges don't.)
- **Fix:** Document that consumers should add an `aria-label` for count circles, or let `circle` opt into a `role="status"`/`aria-label` pattern. At least note it in the doc Gotchas.

### [P2][M2] Interactive hover/press uses bespoke per-edge durations rather than the motion scale
- **Category:** motion
- **Evidence:** badge.tsx:229 — `duration-moderate-01 ... hover:duration-fast-02 ... active:duration-[0ms]` plus `hover:brightness-[0.97] active:scale-[0.95] active:brightness-[0.92]`.
- **Why:** This is actually thoughtful asymmetric timing (fast in, instant press, slower settle) — not a robotic-uniform tell. Flagged only as P2 for the magic `active:duration-[0ms]` arbitrary value and brightness magic numbers (`0.97`/`0.92`) that aren't tokens; consistent with the system but bypasses the duration vocabulary on the press edge.
- **Fix:** Optional — fine as-is. If tightening, route the press through a `duration-fast-01`-style token instead of `[0ms]`, and consider a tokenized press treatment.

### [P3][G2] Story uses non-existent `text-text-secondary` utility
- **Category:** drift (story only)
- **Evidence:** badge.stories.tsx:504, 559, 577 — `className="... text-text-secondary"`; grep finds no such token (the real muted token is `text-surface-fg-muted`/`-subtle`, used elsewhere in the same file).
- **Why:** Dead utility class in stories — renders as unstyled (inherits). Not shipped to consumers, but it's a copy-paste tell and the rest of the file uses the right token.
- **Fix:** Replace with `text-surface-fg-subtle` (matches the other story labels).

### [P3][F1] `dot`, `startIcon`, `endIcon`, `onDismiss` are corner-injection props rather than slots
- **Category:** composability
- **Evidence:** badge.tsx:124-127 props; rendered into fixed leading/trailing positions (lines 244-323).
- **Why:** Borderline F1. For a compact inline pill these fixed micro-slots are idiomatic and acceptable (Badge is leaf-level, not a layout container like Card). Noted for completeness, not a real gap — a `<Badge.Dismiss>` slot would be over-engineering here.
- **Fix:** None recommended. Keep props.

### [P3][I] `BadgeColor` union exported but `'custom'` mixes a sentinel into the color enum
- **Category:** types
- **Evidence:** badge.tsx:33 `type BadgeColor = keyof typeof colorMap | 'custom'`.
- **Why:** Minor — `'custom'` is a mode sentinel folded into the color axis. Works, is documented, and avoids a second prop; flagged only as a future-proofing nit (a `color="custom"` requires the `--badge-color` var or it silently renders empty via `getColorClasses` returning `''`).
- **Fix:** None required; optionally warn in dev if `color="custom"` is set without `--badge-color` resolvable. Low priority.

## Composability gaps
- Leaf-level micro-slots (`startIcon`/`endIcon`/`dot`/`onDismiss`) are props, not children — acceptable for an inline pill (F1 borderline, not a real gap).
- `asChild` present (badge.tsx:170-176) — polymorphism covered. Good.
- Compound `Badge.Indicator` / `Badge.Group` attached (badge.tsx:333-336) — those are separate audit units; Badge itself composes cleanly with them.
- Controlled/uncontrolled: `selected` is controlled-only (no `defaultSelected`), but as a toggle chip the parent always owns selection state — F6 not material here.

## Motion gaps
- **M3/M5:** selected check-icon animates `width`/`marginRight` with no reduced-motion guard (top finding) — the one real motion defect.
- **Clean:** dot entrance uses `springs.snappy`; continuous pulse correctly guarded by `prefersReducedMotion` (badge.tsx:257-258) — no bounce-by-default, reduced-motion respected.
- **M4 clean:** interactive badges have hover (brightness) + press (scale) feedback; dismiss button has hover/focus transitions.
- **M1 clean:** no `backOut`/overshoot-by-default; springs are tuned, not elastic.

## Polish plan (ordered steps to reach the finish bar)
1. Add `aria-pressed={!!selected}` on the interactive (onClick) path and `aria-disabled` on the non-button disabled path (P1, a11y).
2. Guard the selected check-icon transition with `useReducedMotion` and move off layout props (`width`/`marginRight`) toward transform/opacity (P1, motion).
3. Fix doc prop types to `IconInput` and add a count-badge `aria-label` gotcha (P2, docs/a11y).
4. Replace `text-text-secondary` with `text-surface-fg-subtle` in stories; decide on the 10px token vs keep the annotated exception (P2/P3, drift).

## Clean (rubric dims that pass)
- **V1 accent rail:** none. Borders are full `color` semantic borders, not a left/top stripe.
- **V2 double edge:** variants are mutually exclusive (subtle=border, solid/soft=border-transparent, outline=border) — no border+shadow doubling.
- **V3 gradient text:** none. Solid `text-*-11` foregrounds.
- **V4 framework palette:** `indigo`/`slate`/`cyan`/`teal`/`amber` are deliberate `category-*` brand tokens (semantic.css:252-270), bound and intentional — NOT raw Tailwind palette. Not a tell.
- **V5 emoji:** none in source, stories, or doc — real lucide/Tabler icons throughout.
- **V6 blob/glass/glow / V7 rounded-everything:** `rounded-pill` is the correct tag radius; no glassmorphism/glow.
- **V8 pill-badge spam:** N/A (this IS the badge); stories show meaningful states, not "New/Beta/AI-powered" spam.
- **E1–E8 verbal:** JSDoc + doc copy are direct and prescriptive; no em-dash tic abuse as connector beyond legitimate punctuation, no AI vocabulary, no hedging. (One playful "feel free to combine props creatively!" closer lives in *Card/StatCard* JSDoc, not Badge — Badge's JSDoc is clean.)
- **G1 surface:** Badge is inline, not a card surface — surface-layering rule N/A; backgrounds use semantic step-3/raised-hover tokens correctly.
- **G3 variant-axis:** canonical `variant` (subtle/solid/outline/soft), `size` (xs/sm/md/lg), `color` (semantic set) — on taxonomy. (`subtle` vs `soft` are both legit per the canonical set.)
- **G5 soft-vs-outline:** Badge offers both as equals; default is `subtle`, appropriate for a label (not an action). No default violation.
- **I types:** `forwardRef` + `displayName`; props typed (`IconInput`, not `any`); `Omit<…,'color'>` resolves the CVA conflict. Solid type surface.
- **H state-coverage (partial-clean):** focus-visible rings present (badge.tsx:229,312), keyboard handler for the div[role=button] case (205-214), dismiss has 24px-ish touch target for xs (314). Tests + 12 stories cover variants/sizes/interactive/dismiss/truncate/circle/grain. Gaps are the `aria-pressed`/`aria-disabled` items above.
