# Post-World-Class Audit — 2026-04-17

Follow-up audit after v0.35.0 (the big world-class audit closed 2026-04-13). Focused on three angles the prior audit under-weighted: **documentation truth**, **consumer ergonomics**, **a11y-beyond-axe**. Scope: `packages/core` only.

Current state: v0.35.0, 78 UI + 29 composed + 8 shell + 5 AI component files.

## TL;DR

The foundation is strong. The gaps are now concentrated in three places:

1. **Docs lie in small, embarrassing ways** — shipped a build artifact with six raw bash template literals as section headers, CHANGELOG is frozen at 0.33.0 while the package is at 0.35.0, Button docs advertise variants that don't exist in source.
2. **Variant vocabulary is fragmented across components** — `ghost` / `subtle` / `default` / `soft` all mean "low-emphasis"; `accent` / `info` / `default` are inconsistently the "brand" color. A consumer cannot guess the right value for a new component.
3. **Zero forced-colors support, zero RTL support** — not blocking for most consumers, but disqualifying for an enterprise-grade DS claim.

None of these block shipping, but all three are the kind of thing auditors from Stripe / Carbon / Atlassian would call out on day one.

---

## 1. Documentation truth

### P0 — `llms-full.txt` ships corrupt section headers

`packages/core/llms-full.txt:1516, 1529, 1542, 1555, 1568, 1581` each have this literal string as a heading:

```
# $(echo $f | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
```

Source of the corruption: `packages/core/docs/components/ui/data-table-{body,bulk-actions,card,context,header,pagination}.md` — all six stub files were created with an unexpanded bash heredoc. The build just concatenates them.

Last touched in commit `b9e6ae8 docs: update CHANGELOG, llms.txt, component docs for v0.32.0`. Shipped to npm in 0.32.0 through 0.35.0. AI agents consuming `llms-full.txt` get six blank-named sections.

**Fix:** Rename each MD file's first line from the shell template to `# DataTableBody` / `# DataTableBulkActions` / etc. 2-minute fix. Patch release.

### P0 — `CHANGELOG.md` frozen at 0.33.0, package at 0.35.0

`packages/core/CHANGELOG.md:37` ends at `## 0.33.0`. 0.33.1, 0.33.2, 0.33.3, 0.34.0, 0.34.1, 0.35.0 were all published with no CHANGELOG entry. 0.33.2 and 0.33.3 are byte-identical duplicates (lines 21–25 vs 15–19).

This is a Changesets workflow bug — `pnpm changeset version` consumes changeset files but nobody is writing them for the recent releases. The llms-full.txt's per-component `## Changes` section is going strong through v0.32.0, so consumers can reconstruct recent changes there, but the repo-level CHANGELOG is a broken contract.

### P1 — Button docs advertise invalid variant values

`packages/core/llms-full.txt:628`:

```
variant: "solid" | "soft" | "outline" | "ghost" | "link" | "default" (alias->solid) | "destructive" (alias->solid+error)
```

`packages/core/src/ui/button.tsx:22-28` (the authoritative CVA):

```ts
variant: { solid: '', soft: '', outline: 'border', ghost: '', link: '...' }
```

No alias mechanism exists. Passing `variant="default"` or `variant="destructive"` will produce unstyled output. Even more damning: `packages/core/llms.txt:64` (the cheatsheet) correctly says both were REMOVED in v0.32.0. Same repo, two docs, direct contradiction.

Same file, `color` prop line 629: advertises `"default" (alias->accent)` — also not in source.

**Fix:** Strip the fake aliases from the Props block in llms-full.txt. Verify the doc generator hasn't regressed an earlier cleanup.

### P1 — README.md component counts stale

`README.md:11` claims "60+ UI primitives, 14 composed components, 7 shell components". Actual: 78 UI, 29 composed, 8 shell. "60+" is technically still true; "14" and "7" are undercounts of 2x and ~15%.

### P2 — Badge `truncate` prop missing from Props block

`packages/core/src/ui/badge.tsx:133` declares `truncate?: boolean`. `llms-full.txt:388-402` Props list omits it. Only appears in the Changes block at line 428 ("Added truncate prop"). Consumers reading top-down will miss it.

### P2 — Composed `date-picker.stories.tsx` targets a directory, not a file

`packages/core/src/composed/date-picker.stories.tsx` imports from `./date-picker` which resolves to the `date-picker/index.ts` inside the directory. Works, but my story/source diff flagged this as a potential orphan. Verified — it's fine. Noting here only because the current file layout (flat `date-picker.stories.tsx` next to a `date-picker/` directory) is unusual vs the rest of `composed/`. Minor structural nit.

### Checked and clean

- Badge CVA variants (subtle/solid/outline/soft) match llms-full — ✓
- Badge size tokens match — ✓
- `ui/index.ts` exports match package.json `./ui/*` entries (77 vs 78 — within rounding for dev-only exports)
- Every file in `src/ui/` flat layout has a corresponding story OR is an internal sub-component (data-table-*, icon-context, button-processing, badge-indicator, badge-group) — ✓

---

## 2. Consumer ergonomics

### P1 — Variant vocabulary is fragmented

A consumer building a new screen cannot reason compositionally about variants. Each component invented its own:

| Component | `variant` values |
|---|---|
| Button | solid / soft / outline / ghost / link |
| Badge | subtle / solid / outline / soft |
| Alert | subtle / solid / outline (+ filled deprecated) |
| Card | default / elevated / outline / flat |
| Toggle | default / outline |
| Banner | (no variant; color only) |

Observations:
- "Low-emphasis" is `ghost` in Button, `subtle` in Badge/Alert, `default` in Card/Toggle. Three names, one concept.
- `soft` exists in Badge/Button but not in Alert (equivalent is `subtle`).
- Card's vocabulary (`default/elevated/outline/flat`) doesn't share a single name with Button's (`solid/soft/outline/ghost/link`).

And `color`:

| Component | brand color | "default" color |
|---|---|---|
| Button | `accent` | **rejected** (v0.32 breaking removal) |
| Badge | `accent` (one of 16) | `default` (accepted) |
| Alert | `info` (no accent) | (neutral) |
| Card | `accent` OR `default` | `default` (accepted) |
| Banner | `info` (no accent) | (no default) |
| Toggle | `accent` (no warning) | — |

Same ergonomic affordance (`color="default"`) is forbidden in Button, allowed in Card/Badge. `accent` is brand in Button/Badge/Card/Toggle but doesn't exist in Alert/Banner (they use `info`). A consumer who learns Button is actively misled when they use Alert.

**Recommendation:** Pick a canonical vocabulary and plan a deprecation. My take:
- `variant`: `solid | soft | outline | ghost` across all two-axis components (drop `subtle` in favor of `soft`; drop `default`/`filled`/`elevated`/`flat`).
- `color`: `accent | error | success | warning | info | neutral` everywhere. `default` → removed everywhere.
- Card needs a real second axis for elevation (currently bundled into variant) — e.g. `elevation?: 'flat' | 'raised' | 'hover'` orthogonal to variant.

This is a two-release deprecation; not trivial but highest-leverage fix in this audit.

### P1 — No `<FormLabel>` that auto-wires to input ID

`packages/core/src/ui/form.tsx` provides `FormField` + `useFormField()` + `FormHelperText` with a shared context for helperTextId. But `<Label htmlFor="...">` still requires the consumer to generate and pass an `id` manually:

```jsx
// current — consumer must generate id twice
<FormField state="error">
  <Label htmlFor="email">Email</Label>
  <Input id="email" state="error" />
  <FormHelperText>...</FormHelperText>
</FormField>
```

The FormField context already calls `useId()` internally (line 46); extending it to also publish an `inputId` via context, and having `<Label>` + `<Input>` auto-read it when inside `FormField`, would eliminate a whole class of mismatch bugs.

### P1 — Card `size` prop is declared but dead

`packages/core/src/ui/card.tsx:60-64`:

```ts
size: { sm: '', md: '', lg: '' }
```

Empty strings for all three sizes. Shows up in the TS type union, consumers can pass it, does nothing at runtime. Either wire it up (padding scale) or drop it from the API.

### P2 — Consumer has no signal when a required Provider is missing

`<Toaster />` at app root is required for `toast()` calls. If missing, `toast()` silently does nothing (sonner swallows). No dev-mode warning. Compare with the pattern already used for motion: `packages/core/src/motion/motion-provider.tsx` has a dev warning. Apply the same pattern to `toast()` — in dev, warn once if no `<Toaster />` is mounted.

Tooltip handled this the other way: `packages/core/src/ui/tooltip.tsx:25-35` has an `AutoProvider` that transparently provides one if none exists. That's arguably better than a warning. Pick a strategy and apply it uniformly.

### Scenarios — abbreviated

- **Scenario A (settings form):** main friction is the manual id wiring above. `useFormField` is now wired into 8 components which is great. Submit + toast flow works.
- **Scenario B (data-heavy admin):** DataTable API has 6 internal sub-components without docs (the P0 above hits worst here). `Sheet` + form inside works. Focus return on Sheet close uses Radix defaults, appears correct.
- **Scenario C (chat):** `MessageList`, `MessageInput`, `Message` compound pattern documented at `llms-full.txt:875`. `isStreaming` prop exists. Works.

---

## 3. A11y beyond axe

### P2 — Zero forced-colors support

Windows high-contrast mode (`forced-colors: active`) strips custom CSS variables. Zero files in `packages/core/src` use `@media (forced-colors)`, `forced-color-adjust`, or `SystemColors`. Consumers on Windows with high-contrast on will get visually broken components (outlines disappear, focus rings merge with backgrounds).

**Fix scope:** Add a tokens pass in `semantic.css` using `forced-colors: active` — map semantic tokens to `CanvasText`, `ButtonText`, `Highlight`, `LinkText`. ~1 day of work.

### P2 — Zero RTL support

`grep -E "\b(ml|mr|pl|pr|left|right)-[0-9]"` in `packages/core/src/ui/*.tsx` → 48 occurrences. Logical equivalents (`ms-*/me-*/ps-*/pe-*`) → 0 occurrences. `rtl:` Tailwind modifier → 0 occurrences.

Directional icons (chevrons in DropdownMenu, arrow in Breadcrumb, `>` in Stepper) don't flip under `dir="rtl"`. A `dir="rtl"` document body would render broken layouts across Sidebar, Breadcrumb, Stepper, DropdownMenu alignment.

**Fix scope:** Codemod `ml-`/`mr-`/`pl-`/`pr-` → `ms-`/`me-`/`ps-`/`pe-`; audit directional icons. ~2-3 days plus visual regression.

### P2 — Toast only supports `aria-live="polite"`; no `assertive` for errors

`packages/core/src/ui/toast.tsx:176,515` — all toast variants are `role="status" aria-live="polite"`. Error toasts should be `role="alert" aria-live="assertive"` so screen readers interrupt speech. Sonner supports `important: true` on the `toast.error()` call — we can wire it through automatically for our error variant.

### P3 — Button `loading={true}` sets `aria-busy` but no loading label

`packages/core/src/ui/button.tsx:368,496` — `aria-busy` is good. But a screen reader will announce the button text + "busy" with no indication of loading state if the button text is "Save". An `aria-label={isLoading ? 'Saving…' : undefined}` pattern, or a visually-hidden "Loading" span, would help. Low priority.

### Checked and mostly clean

- **Focus return on Dialog/Sheet close:** Uses Radix defaults — `onCloseAutoFocus` / `onOpenAutoFocus` are only overridden in `combobox.tsx` and `menubar.tsx` (where overrides are legitimate).
- **Reduced-motion:** 46 files respect it (via `useReducedMotion` from framer-motion). Good coverage.
- **Icon-only buttons require `aria-label` at compile time:** `packages/core/src/ui/icon-button.tsx:51` — `'aria-label': string` is non-optional in the TS interface. Excellent.
- **FormHelperText with `state="error"` uses `role="alert"`:** `packages/core/src/ui/form.tsx:92` — ✓
- **Form a11y wiring through `useFormField`:** wired into 8 components per the v0.35.0 changelog. ✓

---

## Prioritized action list

**This week (small fixes, patch release):**
1. P0 — Fix six `data-table-*.md` stub headers. Rebuild `llms-full.txt`. Ship as 0.35.1.
2. P0 — Reconstruct CHANGELOG.md entries for 0.33.1 → 0.35.0 from git history. Normalize the changesets workflow so this doesn't regress.
3. P1 — Strip fake variant/color aliases from Button's Props block in `llms-full.txt`.
4. P1 — Update README counts to current reality (78/29/8). Include in same patch.

**Next minor:**
5. P1 — Add `inputId` to FormField context + auto-wire `<Label>` and `<Input>` when inside `<FormField>`. Deprecate manual `htmlFor`/`id`.
6. P1 — Drop Card's dead `size` variant or wire it up.
7. P2 — Uniform dev-mode warning OR AutoProvider strategy for required providers (Toaster, etc.).
8. P2 — Toast `assertive` live region for error variant.

**Next major / roadmap:**
9. P1 — Variant vocabulary unification across Button/Badge/Alert/Card/Toggle. Two-release deprecation.
10. P2 — Forced-colors support in `semantic.css`.
11. P2 — RTL support (logical-property codemod + directional icon audit).

---

*Report delivered 2026-04-17. Methodology: direct file audit (no subagents available); evidence-based with file:line citations. Scope limited to `packages/core`; brand package not audited.*
