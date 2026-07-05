# ui/link — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:1

A genuinely lean, well-built primitive: `asChild` via Slot, `forwardRef`, `displayName`, real focus-visible ring with offset, reduced text-decoration-only hover (not a heavy underline reflex), token-bound durations/easing, no CVA-axis bloat, no AI visual tells. It is NOT slop. The gaps are finish-bar gaps, not giveaways: it bypasses the design system's own dedicated `--color-link*` tokens (drift + a forced-colors a11y hole), has no external-link affordance, and motion is a hover transition with no reduced-motion guard.

## Findings

### [P1][G4] Bypasses the system's dedicated `--color-link*` semantic tokens
- **Category:** drift / vocabulary
- **Evidence:** link.tsx:21 — `'text-accent-11 underline ... hover:text-accent-12'`; vs tokens/semantic.css:245 `--color-link: var(--color-accent-11)` / :246 `--color-link-hover: var(--color-accent-12)` / :247 `--color-link-visited: var(--purple-11)`
- **Why:** There is a purpose-built link color vocabulary (`text-link` / `hover:text-link-hover` / `text-link-visited`) and the canonical link component re-points to the raw `accent-11/12` it aliases — so any future re-tuning of link color via the token won't reach the component, and `:visited` styling that the token system anticipates is never wired up.
- **Fix:** Use `text-link` + `hover:text-link-hover` (and consider `visited:text-link-visited`). It resolves to the same value today but restores the single source of truth.

### [P1][H] Forced-colors: hardcoded accent breaks the system-link mapping
- **Category:** a11y / state-coverage
- **Evidence:** link.tsx:21 uses `text-accent-11`; tokens/semantic.css:780-782 (inside the `forced-colors` block) maps `--color-link: LinkText`, `--color-link-visited: VisitedText`, while `--color-accent-11` collapses to `CanvasText`. The component never opts into the link mapping.
- **Why:** In Windows High Contrast / forced-colors the link renders as `CanvasText` — indistinguishable from body text — instead of the system `LinkText`. The decoration is also `decoration-transparent` until hover, so in forced-colors a non-hovered link has no color AND no underline. The token system already solved this; the component opts out.
- **Fix:** Switch the color to `text-link`/`hover:text-link-hover` (consumes the forced-colors mapping). Additionally consider a non-transparent underline in forced-colors, or rely on the system to force link decoration.

### [P2][M3] Hover/active transition with no reduced-motion guard
- **Category:** motion
- **Evidence:** link.tsx:22 — `transition-[color,text-decoration-color,opacity] duration-fast-01 ease-productive-standard`; no `motion-reduce:` variant anywhere.
- **Why:** A short color/opacity transition is mild, but the rubric (M3) wants every shipped animation to respect `prefers-reduced-motion`. Most other DS components route through MotionConfig/framer; this raw CSS transition doesn't.
- **Fix:** Add `motion-reduce:transition-none` (or confirm a global `motion-reduce` base rule already zeroes transitions — if so, document that and this is Clean).

### [P2][state] No external-link affordance / `target="_blank"` safety
- **Category:** state-coverage / a11y
- **Evidence:** link.tsx:8-29 — no `external` handling; story ExternalLink (link.stories.tsx:44-51) hand-writes `target="_blank" rel="noopener noreferrer"` and there's no auto `rel` or "opens in new tab" affordance. llms-full.txt:2872 gotchas don't mention rel safety.
- **Why:** Card-bar finish for a Link includes the external-link case: an icon affordance (↗) and/or auto-applying `rel="noopener noreferrer"` + an sr-only "(opens in new tab)" when `target="_blank"`. Leaving it entirely to the consumer is a polish gap, and consumers routinely forget the `rel` security attr.
- **Fix:** Optional `external?: boolean` (or detect `target="_blank"`) that appends `rel="noopener noreferrer"`, renders a trailing external icon, and adds an sr-only "opens in new tab". Keep it opt-in to avoid surprising layout.

### [P2][docs/J] Doc omits `inline` default rendering nuance + visited/external states
- **Category:** docs
- **Evidence:** llms-full.txt:2852-2858 lists `inline`/`asChild` only; no mention of focus-ring, visited color, or external-link handling; story set (link.stories.tsx) covers default/inline/block/external but not focus-visible, disabled-ish, or RTL.
- **Why:** Below the Card bar's "stories + docs demonstrate state coverage." No focus-visible story, no visited demo, no reduced-motion note.
- **Fix:** Add a focus-visible story (or note global a11y test covers it) and document the link-token color + external pattern once it lands.

### [P3][types] `LinkProps` is exported but the `inline`/`asChild` combo isn't constrained
- **Category:** types
- **Evidence:** link.tsx:8-11 — fine as-is; minor: `asChild` + an `inline` class still applies `inline`/`block` to the Slot child, which may already carry display.
- **Why:** With `asChild`, forcing `inline`/`block` onto the merged child can override the child's intended display. Edge case, low impact.
- **Fix:** Consider skipping the `inline ? 'inline' : 'block'` class when `asChild` is true, or document that the child controls display.

## Composability gaps
- None significant. `asChild`/Slot is present (F2 satisfied), the component is a thin styled primitive with no bespoke corner-props (F1 clean), prop count is 2 + native anchor attrs (F3 clean). It does not need to compose a base primitive — it IS the base link primitive (F5 N/A).
- Minor: no `external` slot/affordance (covered above as a state gap rather than a composability gap).

## Motion gaps
- M3: no explicit `prefers-reduced-motion` guard on the color/decoration/opacity transition (link.tsx:22).
- M4 (clean): hover + active feedback motion IS present (`hover:decoration-current`, `hover:text-accent-12`, `active:opacity-80`) — good micro-feedback.
- M5 (clean): transitions only `color`/`text-decoration-color`/`opacity` — no layout-prop animation.
- M1/M2 (clean): no bounce/elastic; single intentional fast duration is appropriate for a text link.

## Polish plan (ordered steps to reach the finish bar)
1. Repoint color to the dedicated tokens: `text-link hover:text-link-hover` (fixes G4 drift + the forced-colors a11y hole in one change). Optionally add `visited:text-link-visited`.
2. Add `motion-reduce:transition-none` (or confirm + document a global reduced-motion base rule).
3. Add opt-in external-link handling: `external` prop (or `target="_blank"` detection) → auto `rel="noopener noreferrer"` + trailing ↗ icon + sr-only "opens in new tab".
4. Guard the `inline/block` class behind `!asChild` so a polymorphic child keeps its own display.
5. Add a focus-visible story and a visited/external story; update llms-full.txt Link section + make-kit guide to reflect link tokens and external pattern.

## Clean (rubric dims that pass)
- **V1–V8 (visual tells):** none. No accent rail, no double edge, no gradient text, no raw indigo/violet (uses semantic `accent`), no emoji, no blob/glass/glow, no rounded-everything (uses `rounded-control-inner` token for the focus ring only), no pill spam.
- **V9 (font):** uses inherited/type tokens, no hardcoded Inter/Geist.
- **E1–E8 (verbal):** JSDoc is minimal; docs prose is direct, no AI vocabulary or em-dash tic in the component source.
- **F1/F2/F3/F5/F6:** composable; `asChild` present; lean prop surface; controlled/uncontrolled N/A for a stateless link.
- **G1 (surface):** N/A — inline text element, no surface.
- **G2 (tokens):** durations/easing/radius all token-bound (`duration-fast-01`, `ease-productive-standard`, `rounded-control-inner`) — only the color choice is the drift (flagged G4).
- **G3 (variant axis):** no off-taxonomy axes; `inline` is a legit boolean, not a mis-shaped `variant`.
- **H (a11y, partial):** real `focus-visible:ring-2 ... ring-offset-2` with `focus-visible:outline-hidden` fallback; renders a real `<a>` with `href`; keyboard-native. (Forced-colors color is the one hole, flagged above.)
- **I (types):** proper `forwardRef<HTMLAnchorElement>`, `displayName`, exported `LinkProps`, no `any`, extends `AnchorHTMLAttributes`.
- **Tests:** conformance + asChild + inline/block + href passthrough covered.
