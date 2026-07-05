# ui/alert — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:2

Alert is in good shape: canonical `variant`/`color`/`size` axes, semantic tokens throughout, no accent rail, no gradient, no raw palette, `role="alert"`, focus-visible ring on the dismiss button, exit animation via `AnimatePresence`. The notable gaps are a **doc-vs-source drift** (docs advertise an `icon` override prop that does not exist), a few **verbal tells** in the doc/JSDoc copy, an `any` in the icon-component map, and two small polish gaps (no entrance feedback motion, hardcoded title element resets that don't reuse Card's slot model).

## Findings

### [P1][J] Doc advertises an `icon` override prop that does not exist
- **Category:** docs / types
- **Evidence:** `docs/components/ui/alert.md:27` — `Pass a custom \`icon\` prop to override.`; also `:36` — `Icon is auto-selected by color ...`. Source `AlertProps` (`alert.tsx:103-113`) declares only `title?` and `onDismiss?` — there is **no** `icon` prop. Icon is hardcoded via `ALERT_ICONS[color]` (`alert.tsx:58-64,117`).
- **Why:** Source wins (CLAUDE.md rule). A consumer following the doc passes `icon=...`, it silently lands in `...props` and is spread onto the `motion.div` as an unknown attribute — no override happens. False API.
- **Fix:** Either (a) delete the "override" sentence from the doc + the implied override in the gotcha, or (b) actually add an `icon?: IconInput` slot/prop and wire it through `ALERT_ICONS` fallback. Given Alert's "flat, simple API" stance, (a) is the lighter fix; if overriding is genuinely wanted, ship a real `icon` prop and add a story/test.

### [P1][E2/E1] Contrastive-negation + em-dash tics in doc/JSDoc copy
- **Category:** verbal-tell
- **Evidence:** `alert.md:26` — `**Flat, not compound** — unlike Dialog/Card`; `:33` — `NOT a compound component — use title prop, NOT <AlertTitle>`; `:30` — `**Not for transient messages** — use Toast`. JSDoc `alert.tsx:84` — `Alert vs Banner: Alert is inline ... Banner is a full-width ...` (em-dash connectors recur across the JSDoc).
- **Why:** E2 (contrastive negation "not X, it's Y") and E1 (em-dash as stylistic connector) are AI-prose tells. The doc leans on "not X" framing repeatedly.
- **Fix:** State directly: "Alert has no sub-components; use the `title` prop for the heading and `children` for the body." Replace stylistic `—` with periods or restructure. Keep the genuine "Alert vs Banner / Toast" guidance but phrase positively.

### [P2][E6] Engagement-bait JSDoc closer
- **Category:** verbal-tell
- **Evidence:** `alert.tsx:101` — `// These are just a few ways — feel free to combine props creatively!`
- **Why:** E6/E5 engagement-bait closer ("feel free to…") + em-dash. Reads as chatbot filler in a public API doc comment.
- **Note:** This exact line also ships in the exemplars (`card.tsx:110`, `stat-card.tsx:63`), so it's a house pattern the rubric author may not have caught on Card. Flagging for the family, not just Alert — worth a sweep.
- **Fix:** Drop the line system-wide, or replace with a substantive "See Storybook for more examples." pointer.

### [P2][I] `any` in the icon-component map type
- **Category:** types
- **Evidence:** `alert.tsx:58` — `const ALERT_ICONS: Record<string, React.ForwardRefExoticComponent<any>>`.
- **Why:** `any` props leak through the lookup. The map is also keyed by `string` rather than the color union, so `ALERT_ICONS[color ?? 'info']` isn't type-checked against the actual color set, and an out-of-range key would be `undefined` at runtime with no compile error.
- **Fix:** `Record<NonNullable<AlertProps['color']>, React.ComponentType<{ size?: ... }>>` (or reuse the project's `IconType`/`TablerIcon` type). Narrows the key and kills the `any`.

### [P2][M4] No entrance feedback motion (mount is inert)
- **Category:** motion / state-coverage
- **Evidence:** `alert.tsx:134-135` — `initial={{ opacity: 1, y: 0 }} animate={{ opacity: 1, y: 0 }}` (identical) while `exit={{ opacity: 0, y: -8 }}` animates. The component pays the `AnimatePresence` + `motion.div` cost but only animates exit, not enter.
- **Why:** An alert that appears in response to an event (save failed, session expiring) is exactly the case where a small entrance (fade + slight slide-in) is meaningful feedback. Card/StatCard animate their entrances; Alert mounts hard. Asymmetric (animate-out-only) is a minor finish gap, not a bug.
- **Fix:** If entrance is deliberately suppressed (to avoid jank when many alerts mount), document that intent in the JSDoc. Otherwise mirror the exit: `initial={{ opacity: 0, y: -8 }}` with `springs.snappy`, and let `MotionProvider`'s `reducedMotion` zero it out.

### [P3][M3] Exit spring not self-guarded for reduced-motion (relies on consumer MotionProvider)
- **Category:** motion
- **Evidence:** `alert.tsx:136-137` — `exit={{ opacity: 0, y: -8 }} transition={springs.snappy}`. No local `useReducedMotion` guard.
- **Why:** Reduced-motion is honored only if the consumer wraps the app in `<MotionProvider>` / `<MotionConfig reducedMotion="user">` (`motion/motion-provider.tsx:39`). Same model as Card/StatCard, so this matches the house bar — but an unwrapped consumer gets the slide-out regardless of OS preference.
- **Fix:** Acceptable as-is given the documented MotionProvider contract. If hardening: `useReducedMotion()` to collapse `y` to `0`, consistent with `shell/notification-center.tsx` which does guard locally.

### [P3][F5] Title/element resets re-rolled instead of composing Card's slot model
- **Category:** composability
- **Evidence:** `alert.tsx:142-157` hand-rolls icon + title `<p>` + body `<div>` with bespoke `text-ds-*`/`mb-ds-01` spacing per size. Card centralizes the gap model (`card.tsx:14-60`) and slot margin-resets (`[&>:first-child]:mt-0`).
- **Why:** Not a defect — Alert is intentionally flat (documented `alert.md:26`) and shouldn't become compound. But the per-size `textClass`/`titleClass` ternaries (`alert.tsx:126-127`) and manual `mb-ds-01` are the kind of ad-hoc spacing the gap model exists to prevent. Note `titleClass` for `md` and `lg` both resolve to `text-ds-md`/`text-ds-lg` while body `textClass` md and lg are both `text-ds-md` — a latent inconsistency (size `lg` keeps body at `md`).
- **Fix:** Low priority. Consider deriving the size→text map from a single record rather than nested ternaries; verify the `lg` body text size is intended to stay `text-ds-md`.

## Composability gaps
- **No `icon` slot/prop** despite docs claiming one (see P1[J]). Auto-icon-by-color is a fine default, but the override the docs promise is missing — decide: document the absence, or ship the slot.
- **Flat by design (OK).** No `<AlertTitle>`/`<AlertDescription>` is a deliberate, documented choice to avoid composition traps — not an F1/F4 violation.
- **No `asChild`** — correct; Alert is a terminal content block, not a polymorphic wrapper.
- **`onDismiss` is fine** — it's a callback, not content-in-a-corner. The × button is internal chrome, not a bespoke content prop.
- **No controlled/uncontrolled visibility prop (F6, minor).** Visibility is purely internal (`isVisible` state). A consumer can't programmatically re-show or control the dismissed state without remounting. Acceptable for an alert; flagging only for completeness.

## Motion gaps
- Mount is inert: `initial` === `animate` (M4) — only exit animates. Add a symmetric entrance or document the suppression.
- Exit spring relies on consumer `MotionProvider` for reduced-motion (M3) — matches house bar, not a local guard.
- Timing/easing are correct: `springs.snappy` is the right micro-interaction token; dismiss button uses `transition-colors duration-fast-01` + `active:scale-95`. No bounce-by-default (M1 clean), no layout-prop animation (M5 clean — animates `opacity`/`y` transform only).

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the doc drift (P1):** remove the "custom `icon` prop to override" claim from `alert.md:27` and `:36`, OR add a real `icon?: IconInput` prop, wire it as the `ALERT_ICONS` fallback, and add a story + test.
2. **Scrub verbal tells (P1/P2):** rewrite the "not compound / NOT a compound" contrastive-negation lines and stylistic em-dashes in `alert.md` and the JSDoc; remove the "feel free to combine props creatively!" closer (sweep Card + StatCard too).
3. **Tighten types (P2):** replace `Record<string, ...ForwardRefExoticComponent<any>>` with a color-union-keyed, non-`any` icon-component type.
4. **Add entrance motion (P2):** mirror the exit (`initial opacity:0, y:-8` → `animate y:0`) or document why mount is intentionally inert.
5. **Optional (P3):** collapse the per-size `textClass`/`titleClass` ternaries into one record and confirm the `lg` body text size; consider a local `useReducedMotion` guard for parity with `notification-center`.

## Clean (rubric dims that pass)
- **V1 accent rail:** none. No `border-l-4`/`border-t-2`+color stripe. Full semantic `border-*-7` is a legitimate edge, not a rail.
- **V2 double-edge:** clean — `subtle`/`outline` use border with no shadow; `solid` uses `border-transparent`. No border+shadow combo. (Alert has no `shadow-*` at all.)
- **V3 gradient text / V6 blob-glass-glow / V7 rounded-everything / V8 pill spam:** none. Single `rounded-surface`, `rounded-control-inner` on the button. No gradients, no glass, no glow.
- **V4 framework palette:** none — only semantic tokens (`info-3`, `success-9`, `accent-9`, `surface-*`). No `indigo`/`violet`/`slate`/hex.
- **V5 emoji-as-icon:** none — real Tabler icons via the `<Icon>` API in source, story, and doc.
- **G1 surface:** Alert is inline in-flow (not a card/overlay); uses `bg-{color}-3` / `bg-surface-raised` / transparent appropriately. Not a surface-1 violation.
- **G2 tokens:** all spacing/radius/color/duration via `ds`/semantic tokens; no raw px/hex, no dead TW3 utilities (`bg-gradient-to-*`, `w-[--var]`, bare `shadow`).
- **G3 variant axis:** canonical `variant` (subtle/solid/outline), `color` (info/success/warning/error/neutral), `size` (sm/md/lg). No `filled`/`primary`/`destructive` (the deprecated `filled` was removed in 0.38, doc'd).
- **H state coverage / a11y:** `role="alert"`; dismiss is a real `<button type="button">` with `aria-label`, `focus-visible:ring-2`, hover + `active:scale-95`, and a `min-h-ds-xs min-w-ds-xs` touch target. Solid-variant body-contrast bug is explicitly handled (`alert.tsx:145-153` comment + `variant !== 'solid'` guard). Conformance test covers all variant/size/color combos; tests cover role, title, dismiss-present/absent + callback timing.
- **I types (mostly):** `forwardRef` + `displayName` present; `AlertProps` extends `Omit<HTMLAttributes, 'color'>` to resolve the CVA `color` clash; props exported. Only the internal `any` (P2 above) blemishes it.
- **J stories:** public component has stories (Info/Success/Warning/Error/WithoutTitle/Dismissible/Sizes/AllVariants) with a `play` test on Dismissible. Tagged `stable`.
