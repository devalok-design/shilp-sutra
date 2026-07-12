# Wave 2 Audit — Overlay / Interaction

> Same rubric as Wave 1 — internal DS compliance + benchmark vs shadcn/ui, Radix Themes, IBM Carbon, MUI/Material 3.
> Scope: `Dialog`, `Popover`, `Tooltip`, `DropdownMenu`, `Sheet`, `Toast`, `Combobox`, `Tabs`, `Accordion`.
> Date: 2026-07-12 · Method: source read (`packages/core/src/ui/*.tsx`) + docs/stories coverage check (all 10 incl. `toaster` present ✓).

---

## Cross-cutting findings

### W2-1 — Controlled/uncontrolled open-state is copy-pasted 6× 🔴 HIGH
`Dialog`, `Popover`, `Sheet`, `Tooltip`, `DropdownMenu`, and `DropdownMenuSub` each hand-roll the identical block:

```ts
const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
const isControlled = controlledOpen !== undefined
const open = isControlled ? controlledOpen : uncontrolledOpen
const handleOpenChange = useCallback((v) => { if (!isControlled) setX(v); onOpenChange?.(v) }, [...])
```

Plus a 7th variant in `Tabs` (value-mirroring via `useEffect`). The *reason* is legitimate — they need `open` in React state to feed `AnimatePresence` so exit animations run (Radix alone unmounts too early). But the *solution* is 6 copies of a subtle state machine. **Recommendation:** extract `useControllableOpen({ open, defaultOpen, onOpenChange })` → `{ open, setOpen, onOpenChange }` into `lib/`. One bug-fix site instead of six. This is the highest-leverage refactor in the wave.

### W2-2 — Mobile-adaptive overlays: real differentiator, applied inconsistently 🟡 MEDIUM
- `Dialog` → fills screen on `<768px` (`responsive` prop, default on)
- `Popover` → becomes a `BottomSheet` on mobile
- `Sheet` → slides from bottom + **swipe-to-dismiss** (framer drag) on mobile

**No reference DS (shadcn/RT/Carbon/MUI) auto-adapts overlays to mobile like this.** Genuine edge. *But*: `DropdownMenu` does **not** adapt — it stays a floating menu on touch (small tap targets, off-screen-clipping risk). `Tooltip` is hover-only with no documented touch story. **Recommendation:** decide the mobile contract as a system rule (which overlay classes convert to sheets) and apply it uniformly, or explicitly document why DropdownMenu is exempt.

### W2-3 — z-layer tokens: good, but Dialog and Sheet disagree 🟢 LOW
Token usage is otherwise clean (`z-popover` on Popover/DropdownMenu/Select/Combobox, `z-tooltip` on Tooltip). But:
- **Dialog** — overlay `z-overlay`, content `z-modal` (separated)
- **Sheet** — overlay `z-modal`, content `z-modal` (**same layer**)

If a Sheet and a Dialog ever stack, the layering contract differs between the two. Align Sheet's overlay to `z-overlay` to match Dialog.

### W2-4 — Inert motion wrappers (carries from Wave 1) 🟡 MEDIUM
`Accordion.Content` wraps children in `<motion.div initial={false} animate={{opacity:1}}>` — it never animates (always opacity 1; the real motion is the CSS `animate-accordion-down/up` keyframe). Same dead-weight pattern as Wave 1's `motion.textarea`. **Recommendation:** grep the wave for `motion.*` wrappers whose `initial`/`animate` are no-ops and delete them — they pull framer-motion into the render path for nothing.

### W2-5 — Surface + a11y discipline is strong ✅
- Every overlay: `bg-surface-overlay` + `shadow-floating`/`shadow-overlay`; scrims `bg-overlay`; Tooltip `bg-surface-inverted`. Correct overlay-tier tokens throughout (CLAUDE.md rule satisfied).
- `Tooltip.AutoProvider` auto-wraps a `Provider` if none is in scope — kills the classic "forgot `<TooltipProvider>`" footgun. Nice.
- `Toast` sets `role=alert`+`aria-live=assertive` for errors, `role=status`+`polite` otherwise — textbook.
- `Combobox` implements the full ARIA combobox pattern (`role=combobox`, `aria-activedescendant`, `listbox`/`option`, `aria-multiselectable`).
- Close buttons on Dialog/Sheet use `min-h-ds-xs min-w-ds-xs` token targets.

---

## Component scorecards

### 1. Dialog — Internal A− · External A
- ✅ Full compound + `DialogContentRaw` escape hatch (used by CommandPalette), forceMount+AnimatePresence for exit anim, mobile-fullscreen, tokenized spacing/close-target, `DialogTitle` a11y required (documented).
- 🟡 W2-1 open-state duplication; W2-3 z-token split differs from Sheet.
- **External:** exceeds shadcn (which uses CSS `tailwindcss-animate`, no mobile adapt) and RT (no mobile adapt). Carbon/MUI modals have no auto-mobile behavior. We lead on responsiveness.

### 2. Popover — Internal A− · External A
- ✅ Cleanest of the overlays; BottomSheet-on-mobile via shared `lib/bottom-sheet`, spring+fade, tokenized.
- 🟡 W2-1 duplication. `w-72` default width (Tailwind scale — acceptable).
- **External:** parity with shadcn/RT Popover + our mobile edge. Fine.

### 3. Tooltip — Internal A · External A
- ✅ `AutoProvider` pattern, side-based slide offsets, inverted surface, `z-tooltip`, minimal. Nothing to fix.
- 🟡 No touch/tap story (tooltips are hover-only) — a known web-platform gap, not our bug, but worth a doc note since mobile is otherwise handled everywhere.
- **External:** parity across all four; AutoProvider is a small DX win over shadcn (which makes you mount the provider).

### 4. DropdownMenu — Internal A− · External A
- ✅ Complete Radix compound: items, checkbox/radio items, sub-menus (with own animated SubContent), labels, separators, shortcut hint, `inset` prop. Full keyboard nav inherited from Radix. Tokenized.
- 🟡 W2-1 duplication (root + Sub). **Does not mobile-adapt** (W2-2). `IconCircle h-2 w-2` radio dot raw px.
- **External:** matches RT DropdownMenu / MUI Menu; sub-menu + checkbox/radio items put us ahead of shadcn's leaner default. Carbon's OverflowMenu is simpler.

### 5. Sheet — Internal A− · External A
- ✅ Built **on the Dialog primitive** (good reuse), 4-side CVA, mobile→bottom + swipe-to-dismiss (drag physics with velocity/offset threshold), grab-handle, reduced-motion aware.
- 🟡 W2-3 (overlay `z-modal` not `z-overlay`); W2-1 duplication. Drag threshold magic numbers (`0.3`, `500`, `300` fallback height) are inline literals — fine but undocumented.
- **External:** shadcn Sheet has no swipe-dismiss; RT has no Sheet (uses Dialog). MUI Drawer has no swipe by default (needs SwipeableDrawer). We're ahead on touch.

### 6. Toast — Internal A− · External A+
The most capable component in the wave; beyond every reference DS's toast/snackbar.
- ✅ Sonner-backed, but our UI adds: typed toasts (success/error/warning/info/loading/message), `promise`, `undo`, and a full **`upload`** toast (per-file progress via `Progress`, retry/remove, image-vs-file icon detection, batch summary), hover/focus-pausing self-managed dismiss timer, animated icon morphs, timer bar, correct aria-live urgency. `assertToasterMounted()` guard.
- 🟡 875 lines — by far the largest in the wave. Token leaks: `h-[2px]` timer bar, `w-16`, `max-w-[60px]`, `max-h-[140px]`, several `h-5 w-5`/`h-3.5` (X-2 from Wave 1). Uses `Date.now()` in the dismiss timer — fine at runtime (client-only), but worth knowing it's there.
- **External:** MUI Snackbar / Carbon Notification / RT (Toast via Sonner) / shadcn (Sonner) — **none** ship an upload-progress or undo toast out of the box. Clear lead. Cost is maintenance surface.

### 7. Combobox — Internal B+ · External A−
- ✅ Discriminated-union single/multi typing (no casts at call site), pill overflow ("+N more"), custom `renderOption`, full keyboard nav (arrows/home/end/enter/escape), scroll-into-view, FormField wiring, proper ARIA combobox.
- 🟡 **Hand-rolled a11y + keyboard nav (~570 lines), not on a Radix/cmdk listbox primitive.** It's done correctly today, but bespoke a11y is the kind of thing that silently drifts from spec on the next edit — highest *risk* surface in the wave even though its current grade is fine. Raw `py-[1px]/py-[2px]` pill padding (X-2).
- **External:** shadcn uses `cmdk` (battle-tested) for this; MUI `Autocomplete` is the gold standard (async load, freeSolo, grouping, virtualization) and **exceeds us** — we lack async/remote options, grouping, and virtualization (a >100-option list renders every node). RT has no combobox. Verdict: ahead of shadcn's DIY, behind MUI Autocomplete. **Recommendation:** consider rebasing on `cmdk` or Radix's forthcoming listbox to shed the bespoke-a11y risk; at minimum add option virtualization before anyone feeds it a long list.

### 8. Tabs — Internal A− · External A
- ✅ `LayoutGroup` + `layoutId` sliding indicator (underline for `line`, pill for `contained`), `color` axis (accent/neutral), `orientation` (h/v with compoundVariants), `size`, variant propagation via context (documented). Genuinely polished motion.
- 🟡 `duration-100` raw literal (line 151) — the one duration not using a token. `w-48` fixed vertical width (Tailwind scale).
- **External:** the animated indicator matches MUI's and beats shadcn (static). RT Tabs / Carbon Tabs have no shared-layout motion. Ahead on polish.

### 9. Accordion — Internal B+ · External A−
- ✅ Clean Radix wrap, chevron auto-rotate, `chevronPosition` prop, CSS keyframe height animation, tokenized.
- 🟡 W2-4 dead motion wrapper. No `variant`/`size` axis (every other Wave-2 component with visual options has one) — Accordion is style-flat.
- **External:** parity with shadcn/RT (both minimal). MUI Accordion has more (disabled, controlled expansion API, summary/details slots) — we're slightly behind MUI, ahead of nobody-else-has-more.

---

## Wave 2 grade summary

| Component | Internal | External | Top defect |
|---|---|---|---|
| Dialog | A− | A | open-state dup; z-token split vs Sheet |
| Popover | A− | A | open-state dup |
| Tooltip | A | A | no touch story |
| DropdownMenu | A− | A | doesn't mobile-adapt; open-state dup |
| Sheet | A− | A | overlay `z-modal` should be `z-overlay` |
| Toast | A− | **A+** | 875 lines; raw-px leaks |
| Combobox | **B+** | A− | hand-rolled a11y risk; no virtualization; behind MUI Autocomplete |
| Tabs | A− | A | `duration-100` raw literal |
| Accordion | **B+** | A− | dead motion wrapper; no variant/size axis |

**Wave verdict:** This wave is where the DS pulls *ahead* of shadcn and Radix Themes — mobile-adaptive overlays, swipe-dismiss sheets, and the upload/undo/promise Toast are things none of the four references ship. The debts are internal, not external: (1) the same open-state machine copied 6×, (2) two very large hand-rolled surfaces (Combobox, Toast) carrying a11y/maintenance risk, (3) mobile-adaptation applied unevenly, (4) small token/motion hygiene leaks continuing from Wave 1's X-2/X-4. The only place we're genuinely *behind* a reference is **Combobox vs MUI Autocomplete** (async, grouping, virtualization).

---

## Recommended actions (ranked)

1. **W2-1 — Extract `useControllableOpen()`** and adopt in all 6 overlays + Tabs. Pure refactor, non-breaking, kills the biggest duplication in the codebase so far.
2. **Combobox — de-risk the bespoke a11y.** Add option virtualization now; evaluate rebasing on `cmdk`/Radix listbox. It's the highest *risk* (not lowest grade) component in the wave.
3. **W2-2 — Define the mobile-overlay contract as a rule** and either make DropdownMenu conform or document the exemption.
4. **W2-4 — Delete inert motion wrappers** (Accordion, + re-check Textarea from Wave 1). Grep `initial={false}` / no-op `animate`.
5. **W2-3 — Align Sheet overlay to `z-overlay`.** One-line consistency fix.
6. **Token leaks** — Toast (`h-[2px]`, `w-16`, `max-h-[140px]`), Combobox (`py-[1px/2px]`), Tabs (`duration-100`), DropdownMenu (`h-2 w-2`). Folds into Wave 1's X-2 audit-gate work.

> Next: **Wave 3 — Data/display** (Table, DataTable, Card, StatCard, Avatar, Progress, Skeleton, Pagination). Awaiting checkpoint.
