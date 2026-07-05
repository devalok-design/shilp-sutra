# composed/rich-text-editor — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:4 P2:6 P3:2

Scope: `RichTextEditor` + `RichTextViewer` in `packages/core/src/composed/rich-text-editor.tsx`, plus its `.test.tsx`, `.stories.tsx`, and `docs/components/composed/rich-text-editor.md`.

Bottom line: no hard AI visual tells (no accent rail on the container, no gradient text, no framework palette, single edge). The gaps are Card-bar finish: an unmemoized inline `ToolbarButton` that re-rolls Button/IconButton instead of composing them, raw arbitrary pixel values instead of tokens, thin state/motion coverage (no reduced-motion, no focus-visible ring on toolbar buttons, no disabled/error/RTL demos), a controlled/uncontrolled content quirk, and a couple of verbal tells in the doc.

## Findings

### [P1][F5] ToolbarButton re-rolls Button/IconButton instead of composing the base primitive
- **Category:** composability
- **Evidence:** rich-text-editor.tsx:76-103 — `function ToolbarButton(...) { return (<button type="button" ... className={cn('inline-flex h-ds-xs-plus w-ds-xs-plus items-center justify-center rounded-control transition-colors ...', 'hover:bg-surface-raised-hover', 'disabled:pointer-events-none disabled:opacity-action-disabled', isActive ? 'bg-surface-raised-hover text-accent-11' : 'text-surface-fg-subtle')}>`
- **Why:** This is the StatCard-vs-Card drift risk: a bespoke icon-button re-implements hover/disabled/active/size/radius that `IconButton` (variant="ghost", isActive/aria-pressed) already owns. Any future change to ghost-button hover, disabled opacity, or focus ring won't reach this toolbar.
- **Fix:** Render the toolbar buttons through the existing `IconButton` (ghost variant, size, `aria-pressed`, `title`) instead of a hand-rolled `<button>`; keep the `isActive` → tinted-bg mapping via `IconButton`'s selected/aria-pressed styling.

### [P1][H] Toolbar buttons remove focus affordance — no focus-visible ring
- **Category:** a11y / state-coverage
- **Evidence:** rich-text-editor.tsx:91-98 — button className has `hover:bg-surface-raised-hover` and active/disabled styles but **no `focus-visible:` ring** and no `focus-ring` utility. The editable content region also strips focus: rich-text-editor.tsx:564 `'focus:outline-hidden'`.
- **Why:** Keyboard users tabbing through the formatting toolbar get no visible focus indicator (the whole point of `:focus-visible`). `outline-hidden` on the content area is acceptable because the box shows `focus-within`, but the toolbar buttons have nothing. This is a WCAG 2.4.7 gap and a hard rubric item ("focus ring removed without :focus-visible replacement").
- **Fix:** Add the DS `focus-ring` / `focus-visible:` treatment to `ToolbarButton` (free if you switch to `IconButton` per F5). Verify it survives `forced-colors`.

### [P1][F6] content is documented as effectively write-once; controlled/uncontrolled contract is muddy
- **Category:** composability / types
- **Evidence:** rich-text-editor.tsx:403 JSDoc `Initial HTML content. Updates are NOT reactive — use onChange for controlled state.` but rich-text-editor.tsx:594-599 an effect *does* sync `content` back in (`editor.commands.setContent(content, { emitUpdate: false })`). The prop is neither a clean `defaultValue` (uncontrolled) nor a clean `value` (controlled) — it's a half-controlled hybrid with a guard ref.
- **Why:** Rubric F6 (controlled/uncontrolled gap). The doc says "not reactive," the code says "reactive but guarded" — a consumer can't tell which contract they're getting, and there's no `defaultContent` for the genuinely-uncontrolled case. `onChange` on a rich-text surface should also arguably be `onValueChange` (non-input semantics), though `onChange(html)` is defensible here.
- **Fix:** Pick one contract and name it: either `defaultContent` (uncontrolled, set once) + `content`/`onChange` (controlled, always synced), and make the JSDoc match the effect. Remove the "NOT reactive" line since the effect contradicts it.

### [P1][G2] Raw arbitrary pixel values instead of DS tokens
- **Category:** drift
- **Evidence:**
  - rich-text-editor.tsx:565 `'min-h-[120px] px-ds-04 py-ds-04'` — the min-height is a raw px literal.
  - rich-text-editor.tsx:160 `w-[240px]` on the link input; rich-text-editor.tsx:172 `h-[16px]` on the toolbar divider.
  - rich-text-editor.tsx:365 `h-[350px] w-[352px]` emoji-picker fallback box; rich-text-editor.tsx:60 `[&_mark]:px-[2px]`; rich-text-editor.tsx:65 `[&_.mention]:py-[1px]`.
- **Why:** Rubric G2 — hardcoded px instead of `--spacing-ds-*` / size tokens. The `1px`/`2px` hairline values are borderline-fine, but `120px`, `240px`, `350×352`, `16px` are layout sizes that should ride the spacing/size scale for consistency with the rest of the system.
- **Fix:** Map to the nearest `ds` spacing/size tokens (e.g. divider height, input width, min body height, picker fallback dimensions). Keep sub-pixel hairlines if no token exists, but comment why.

### [P2][H] No disabled / error / RTL / forced-colors / reduced-motion coverage in stories or tests
- **Category:** state-coverage
- **Evidence:** rich-text-editor.stories.tsx has Default, WithContent, ReadOnly, upload, mentions, viewer variants — but no story for a disabled editor, an invalid/error state, RTL (`dir="rtl"` — the align icons and `before:float-left` placeholder would need to mirror), forced-colors, or reduced-motion. Tests (rich-text-editor.test.tsx:15-73) cover render + toolbar whitelist only.
- **Why:** Rubric H requires the applicable state matrix be demonstrated. An editor is directional (align-left/right icons, LTR placeholder float) and RTL is unhandled/undemonstrated. `onChange` is never actually asserted to fire (test at :34 only checks the toolbar renders).
- **Fix:** Add RTL and reduced-motion stories; add a test that types into the editor and asserts `onChange` fires with HTML. Verify align icons mirror under `dir="rtl"`.

### [P2][M3] No prefers-reduced-motion consideration for the animated affordances
- **Category:** motion
- **Evidence:** rich-text-editor.tsx:92 `transition-colors duration-fast-01`, :637-638 `transition-colors ease-productive-standard focus-within:border-...`. The `emptyEditorClass` and toolbar transitions are CSS-only and small, so this is low-severity — but there is no reduced-motion guard anywhere, and the component doesn't wire through the DS motion system at all.
- **Why:** Rubric M3. Color transitions are cheap so this is minor, but the component ships zero reduced-motion awareness; if any richer motion is added later there's no pattern in place.
- **Fix:** Low priority. If keeping CSS transitions, they're fine; document that motion is intentionally minimal. If adding entrance motion (e.g. emoji picker open), guard it with the DS reduced-motion pattern.

### [P2][M4] Emoji picker and link popover appear/disappear with no entrance/exit motion
- **Category:** motion
- **Evidence:** rich-text-editor.tsx:606-634 emoji picker is a raw conditional (`{showEmojiPicker && (<div ...>`) with no `AnimatePresence`/transition; rich-text-editor.tsx:147-166 link input popover (`{showInput && (<form ...>`) likewise hard-toggles.
- **Why:** Rubric M4 (missing feedback motion on overlays). These are popover-class surfaces (`z-popover`, `shadow-raised-hover`) that pop in with no fade/scale — inconsistent with the DS overlay motion elsewhere.
- **Fix:** Wrap both in the DS overlay entrance/exit motion (fade + small scale/translate), reduced-motion-guarded.

### [P2][F1] onImageClick / onFileClick / onEmojiClick are internal callbacks; no slot for custom toolbar actions
- **Category:** composability
- **Evidence:** rich-text-editor.tsx:175-181 `Toolbar` takes fixed `onImageClick/onFileClick/onEmojiClick`; the toolbar is fully internal with a `toolbar?: ToolbarItem[]` whitelist (rich-text-editor.tsx:415) but no way to inject a custom button/slot.
- **Why:** Rubric F1 — a consumer who wants a custom formatting action (e.g. "insert template") has no slot; they can only hide built-ins. The whitelist is a subtractive-only API.
- **Why not higher:** The whitelist covers the common case and this is a large managed surface, so a full slot API is a real feature, not a quick fix.
- **Fix:** Consider a `toolbarExtras`/`renderToolbarEnd` slot or exposing the `editor` via a render prop so consumers can add buttons that share `ToolbarButton` styling.

### [P2][G1] Editor container uses bg-surface-raised (surface-2); layering rule lists input controls as surface-1
- **Category:** drift
- **Evidence:** rich-text-editor.tsx:637 `'overflow-hidden rounded-surface border border-surface-border-strong bg-surface-raised'`. The CLAUDE.md layering rule routes "input controls" to `surface-1`, panels/editors to `surface-2`.
- **Why:** Ambiguous by the rule — a rich-text editor is both an input control and a panel-like editor container. It currently reads as a panel (surface-2 + border). Flagging for a deliberate decision, not asserting it's wrong.
- **Fix:** Decide intentionally: if it's a form field, `bg-surface-1`; if it's an editor panel, keep `surface-raised` and, if needed, add it to `SURFACE1_ALLOWLIST` rationale. Also note the code/pre blocks inside (`[&_code]:bg-surface-raised`, `[&_pre]:bg-surface-raised`, rich-text-editor.tsx:56-57) sit ON a `surface-raised` box — same-level surface-on-surface gives weak contrast; consider `surface-2`/sunken for inline code so it reads as inset.

### [P2][E3/E1] Verbal tells in the component doc
- **Category:** verbal-tell / docs
- **Evidence:** docs/components/composed/rich-text-editor.md:52 `no @tiptap/* install needed`; :51 `so round-trip display matches the editor`; and the em-dash-as-connector tic throughout, e.g. :51 `Two exports — editor + viewer`, :54 `Image upload:` ... `HTML bloats fast`, :57 `Pairs with MarkdownViewer — many teams use...`. Also stories use an em-dash in on-screen copy: rich-text-editor.stories.tsx:140 `This is a blockquote — great for callouts or quotes.`
- **Why:** Rubric E1 (em-dash as stylistic connector) appears repeatedly in the doc's prose. No E3 buzzword-salad, but the em-dash tic is the AI-writing giveaway here.
- **Fix:** Replace connector em-dashes with periods/colons/restructured sentences. Keep en-dash only for numeric ranges.

### [P2][H] Link URL input strips its focus outline with no visible replacement
- **Category:** a11y / state-coverage
- **Evidence:** rich-text-editor.tsx:160 `'... focus:border-accent-7 focus:outline-hidden'` — outline removed; the only focus signal is a border color change to `accent-7`, which can vanish under forced-colors.
- **Why:** Border-color-only focus is weak and forced-colors-fragile.
- **Fix:** Use the DS input focus-ring treatment (ring + border) so focus survives forced-colors; align with how the DS Input handles focus.

### [P3][G3] `variant="solid"` on the Apply button is fine, but `stroke="bold"` on inline-format icons is a bespoke per-icon override
- **Category:** vocabulary
- **Evidence:** rich-text-editor.tsx:225,229,... `<Icon icon={IconBold} size="sm" stroke="bold" />` on bold/italic/underline/strike/highlight/headings/lists, but NOT on link/image/file/hr/align/emoji/undo/redo icons.
- **Why:** Inconsistent icon weight across the same toolbar — half the buttons use `stroke="bold"`, half don't, with no rule. Reads slightly arbitrary.
- **Fix:** Pick one stroke weight for the whole toolbar (or a deliberate rule, e.g. "text-formatting = bold stroke, actions = regular") and document it.

### [P3][J] Doc prop table omits emojiSet and the editable/RTL nuances
- **Category:** docs
- **Evidence:** docs/components/composed/rich-text-editor.md:11-24 lists content/placeholder/onChange/className/editable/uploads/mentions/toolbar but **omits `emojiSet`** (rich-text-editor.tsx:423-424, `@default 'native'`), even though the Changes section (:68) says it was added in v0.33.0.
- **Why:** Rubric J — doc prop table stale vs source.
- **Fix:** Add `emojiSet?: EmojiSet` to the prop table.

## Composability gaps
- `ToolbarButton` (rich-text-editor.tsx:76) is a private re-roll of a ghost `IconButton` — hover/active/disabled/size/radius duplicated instead of composed (F5). This is the single biggest Card-bar miss.
- Toolbar is subtractive-only (`toolbar` whitelist) with no additive slot for custom actions; `editor` instance is not exposed via ref or render prop, so consumers can't extend behavior without forking (F1).
- `content` contract is a half-controlled hybrid whose JSDoc ("NOT reactive") contradicts the sync effect; no `defaultContent` for a clean uncontrolled mode (F6).
- The Card-family surface vocabulary isn't shared: the editor hand-builds its bordered box (`border ... bg-surface-raised`) rather than composing `<Card variant="outline">`, which already owns "visible edge, no shadow." Wrapping in Card would centralize the surface/edge decision (F5).

## Motion gaps
- No `prefers-reduced-motion` awareness anywhere; component is not wired to the DS motion system (M3). Low impact today (CSS color transitions only).
- Emoji picker (rich-text-editor.tsx:606) and link popover (rich-text-editor.tsx:147) hard-toggle with no entrance/exit — inconsistent with DS overlay motion (M4).
- No hover/press feedback beyond a color swap on toolbar buttons; acceptable but minimal.

## Polish plan (ordered steps to reach the finish bar)
1. Replace `ToolbarButton`'s hand-rolled `<button>` with the DS `IconButton` (ghost, `aria-pressed`, `size`, `title`), inheriting hover/disabled/**focus-visible ring**. Kills F5 + the toolbar focus gap in one move.
2. Give the link URL `<input>` and the editable content region a DS focus-ring treatment (keep `outline-hidden` only where `focus-within` on the box already signals focus).
3. Tokenize the raw px values (`min-h-[120px]`, `w-[240px]`, `h-[16px]`, `h-[350px] w-[352px]`) to `--spacing-ds-*`/size tokens; keep hairline `1px`/`2px` with a comment.
4. Resolve the `content` contract: add `defaultContent` for uncontrolled, make controlled `content` genuinely reactive, fix the JSDoc; consider `onValueChange` alias.
5. Wrap emoji picker + link popover in DS overlay entrance/exit motion, reduced-motion-guarded. Add a reduced-motion + RTL story; add a real `onChange`-fires test.
6. Decide the surface level deliberately (surface-1 field vs surface-2 panel) and make inline `code`/`pre` visibly inset rather than same-surface.
7. Normalize toolbar icon stroke weight; add `emojiSet` to the doc prop table; strip connector em-dashes from the doc and blockquote demo copy.

## Clean (rubric dims that pass)
- **V1 accent rail:** No colored left/top stripe on the editor container. (Blockquote `border-l-[3px] border-accent-6` at :59 is standard in-prose blockquote styling bound to a semantic token — a choice, not a card rail.)
- **V2 double edge:** Editor box is `border + bg-surface-raised` with **no** shadow (:637) — single edge. Clean.
- **V3 gradient text:** None.
- **V4 framework palette:** Colors are all semantic tokens (`accent-11`, `warning-3`, `surface-*`) — no indigo/violet/slate raw palette.
- **V5 emoji-as-icon:** All toolbar/UI icons are Tabler via the DS `Icon` API; emoji only appear as genuine editor content (the emoji-picker feature), not as an icon system.
- **V6 blob/glass/glow:** None. `shadow-raised-hover` on popovers is a real elevation token.
- **V7 rounded-everything:** Uses `rounded-surface`/`rounded-control`/`rounded-control-inner`/`rounded-pill` vocabulary, not `rounded-3xl`.
- **G3 variant taxonomy:** `Button variant="solid"`, `Icon size="sm"` use canonical axes.
- **Types:** `forwardRef` + `displayName` on both exports; props extend the right element attrs; no `any` in the public surface; `ToolbarItem`/`MentionItem` exported and typed.
- **SSR:** `immediatelyRender: false` + `if (!editor) return null` guard both editor and viewer.
- **Security:** Link/image protocol validation (`validate`, `rel="noopener noreferrer"`) — a real hardening choice, not slop.
