# shell/sidebar — audit
**Finish score:** 3/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:5 P2:6 P3:3

Scope: `packages/core/src/shell/sidebar.tsx` (the `AppSidebar` application component). Its underlying primitive `packages/core/src/ui/sidebar.tsx` is a separate audit unit; findings below only touch the primitive where `AppSidebar`'s composition of it produces a tell. Co-located files: `sidebar.test.tsx`, `sidebar.stories.tsx`, `docs/components/shell/sidebar.md` — all present.

This unit is notably better than average on the highest-severity visual tells: the accent-rail was **deliberately killed** (line 200-201 comment explicitly rejects the doubled-accent stripe). Active = tint + accent text + weight. That's the Card-bar move. What keeps it off the bar is composability (config-object props instead of slots, a hand-rolled promo card that should compose `<Card>`, hand-rolled inline SVG icons instead of the Icon API), a surface-vocabulary question, and thin state/test coverage.

## Findings

### [P1][F5] Promo banner hand-rolls a Card surface instead of composing `<Card>`
- **Category:** composability
- **Evidence:** shell/sidebar.tsx:473 — `<div className="relative rounded-surface bg-surface-raised p-ds-04 shadow-raised">`
- **Why:** This is exactly the re-rolled-surface drift StatCard fixed by composing `<Card>` — a rounded, padded, shadowed surface built by hand, so it can drift from the Card radius/elevation/padding vocabulary the moment either side changes.
- **Fix:** Render the promo as `<Card variant="default" size="sm">` (or `flat`) with `<CardContent>` / `<CardAction placement="top-right">` for the dismiss button. The dismiss `X` maps cleanly onto `<CardAction tuck>`.

### [P1][F1] Config-object props where slots/compound belong (`footer`, `footer.promo`, `promo.action`)
- **Category:** composability
- **Evidence:** shell/sidebar.tsx:89-109 (`SidebarPromo`, `SidebarFooterConfig`) + 100-109; render at 467-539. `promo.action?: { label; href?; onClick? }` (line 95) is a fixed shape that re-implements Button's API.
- **Why:** `footer={{ promo: { action: { label, href, onClick } } }}` is a bespoke mini-DSL that duplicates `<Button>` / `<Card>` composition inside a prop object. A consumer who wants a second promo action, a different button variant, or an icon on the button has no path — they must fall back to `footer.slot` and rebuild everything. Card-bar answer is slots.
- **Fix:** Keep `footer.slot` / `preFooterSlot` as the composable path and demote `promo`/`links`/`version` to convenience helpers, OR expose `AppSidebar.Footer` / `AppSidebar.Promo` compound parts. At minimum let `promo.action` accept a `ReactNode` so a consumer can pass their own `<Button>`.

### [P1][G2] Hand-rolled inline SVG icons instead of the Icon API
- **Category:** drift
- **Evidence:** shell/sidebar.tsx:147-164 (`ChevronRight`) and 166-184 (`CloseIcon`) — full inline `<svg>` with hardcoded `width="16" height="16"`, `strokeWidth="2"`.
- **Why:** The whole system routes icons through `Icon` / `normalizeIcon` / `IconProvider` (used elsewhere in this very file, lines 254, 320, 486) and ships `@tabler/icons-react` (`IconChevronRight`, `IconX` exist). Two bespoke SVGs with hardcoded px bypass the icon-size tokens (`h-ico-*`) and the icon vocabulary — a re-rolled-token tell and a maintenance island.
- **Fix:** `import { IconChevronRight, IconX } from '@tabler/icons-react'` and render via `<Icon icon={IconChevronRight} size="sm" />`. Removes ~40 lines and the hardcoded dimensions.

### [P1][H] No axe/a11y assertion on the primary rendered sidebar
- **Category:** a11y
- **Evidence:** shell/sidebar.test.tsx — the only `axe()` call is inside `describe('F1 — preFooterClassName')` (line 401-409); the default sidebar, the collapsible-children tree, the badge/promo/footer variants are never axe-checked.
- **Why:** The component ships nested interactive controls (parent link + chevron toggle button in the same row, line 237-268), a dismiss button, and badges positioned over links — the highest-risk a11y surface — with no axe coverage. `nested-interactive` / focus-order regressions would pass CI.
- **Fix:** Add an axe pass over the `AllFeatures`-equivalent tree (collapsible children + promo + badges + group action) to the test file.

### [P1][J] `footerLinks` documented as deprecated but source has no `@deprecated` tag or dev warning
- **Category:** docs
- **Evidence:** JSDoc at shell/sidebar.tsx:121 reads `/** Footer links rendered at the bottom of the sidebar */` (no `@deprecated`); the doc (`sidebar.md:12`, `:65`, `:97`) and the runtime precedence logic (line 467, 540) treat it as deprecated in favor of `footer.links`.
- **Why:** Deprecation lives only in prose docs. TS/IDE users get no strikethrough, and there's no dev-time `console.warn`. Violates the "@deprecated without dev warning" docs-parity gate.
- **Fix:** Add `@deprecated Use \`footer.links\` instead.` to the prop's JSDoc and a one-shot dev warning when `footerLinks` is passed without `footer`.

### [P2][G1/G4] Surface-vocabulary question: root + promo both `bg-surface-raised`; shell chrome rule says surface-1
- **Category:** drift / vocabulary
- **Evidence:** root at shell/sidebar.tsx:372 `bg-surface-raised`; promo at :473 `bg-surface-raised`; the underlying primitive's own `<aside>` is also `bg-surface-raised` (ui/sidebar.tsx:319). CLAUDE.md surface rule: `surface-1 → shell chrome (Sidebar, TopBar)`.
- **Why:** Two issues. (1) The MANDATORY layering rule assigns shell chrome to surface-1, but AppSidebar paints surface-2 (`raised`). The doc changelog (v0.19.0) says this was a deliberate elevation for hierarchy — so this is likely a *documented choice*, not a reflex — but it should be in `SURFACE1_ALLOWLIST` with a comment, or reconciled with the rule. (2) The promo card sits on the same `surface-raised` tint as its parent, so only the shadow separates them (a same-tint-on-same-tint card). Composing `<Card>` (F5) would resolve this by giving the promo the correct on-surface level.
- **Fix:** Confirm the surface-2 sidebar is allowlisted/intentional (cross-check `pre-publish-audit.mjs`); switch the promo to `<Card>` so its surface reads as one step off the chrome, not identical.

### [P2][H] No disabled / loading / empty-nav state exposed through `AppSidebar`
- **Category:** state-coverage
- **Evidence:** `NavItem` (shell/sidebar.tsx:59-72) has no `disabled` field; `AppSidebar` has no `loading` prop. The primitive ships `SidebarMenuSkeleton` (ui/sidebar.tsx:723) and `disabled:`/`aria-disabled:` styles (ui/sidebar.tsx:578) but AppSidebar surfaces neither. `navGroups = []` renders an empty `<SidebarContent>` with no empty-state affordance.
- **Why:** Card-bar demands full state coverage. A data-driven nav that can't express a disabled item or a loading skeleton, and renders nothing on empty data, is incomplete for an app shell where nav often loads async.
- **Fix:** Add `disabled?: boolean` to `NavItem` (forward to `SidebarMenuButton`'s existing `aria-disabled` path); add a `loading?: boolean` prop that renders `SidebarMenuSkeleton` rows; optionally an `emptyState?: ReactNode`.

### [P2][M4] Nav-item entrance/active feedback depends entirely on the primitive's `layoutId` indicator, which has no reduced-motion guard
- **Category:** motion
- **Evidence:** `AppSidebar` adds only CSS `transition-colors` (shell/sidebar.tsx:193, 202). The animated active pill is the primitive's `motion.span layoutId="sidebar-active-indicator"` (ui/sidebar.tsx:636-640) with `transition={springs.smooth}` and **no** `useReducedMotion` gate — while the same primitive file *does* guard its swipe drag (ui/sidebar.tsx:186, 198).
- **Why:** With reduced-motion set, the active indicator still slides between items. Inconsistent with the file's own reduced-motion handling. (Belongs to the ui/sidebar unit, but it is the motion a consumer sees when using AppSidebar, so flagging the composition.)
- **Fix:** In `SidebarMenuButton`, gate the `layoutId` slide behind `useReducedMotion()` (fall back to instant/opacity), matching the swipe-wrapper pattern already in the file.

### [P2][H] Nested interactive controls in one row (parent link + chevron button) — keyboard/tab order untested
- **Category:** a11y
- **Evidence:** shell/sidebar.tsx:237-268 — a `<Link>` (via `SidebarMenuButton asChild`) and a sibling `<button>` chevron both live inside the same `SidebarMenuItem` row; the badge (`SidebarMenuBadge`) is also absolutely positioned in the row.
- **Why:** Two focusable controls stacked in a row is a legitimate pattern but a common a11y footgun (focus order, overlap, target size). Tests assert the chevron *exists* and *toggles* (test lines 307-343) but never assert tab order or that the badge/chevron don't overlap the link's hit area.
- **Fix:** Add a keyboard-nav test (tab from link → chevron) and confirm both meet touch-target; consider `SidebarMenuAction` (the primitive's purpose-built slot, ui/sidebar.tsx:673) instead of a bespoke absolutely-positioned button.

### [P2][V13] Story `WithCustomLogo` demos a raw pink→coral gradient swatch as the logo default pattern
- **Category:** visual-tell
- **Evidence:** sidebar.stories.tsx:166-169 — `background: 'linear-gradient(135deg, #D33163, #ff6b6b)'` on a 28×28 rounded square used as the example logo mark.
- **Why:** Hardcoded hex gradient (not a brand token) shipped in the canonical logo example reads as the AI "gradient blob logo" tell to anyone browsing Storybook, and models the wrong pattern for consumers. `#D33163` is the brand pink but `#ff6b6b` is an arbitrary coral, and neither is a token.
- **Fix:** Use the real brand mark from `@devalok/shilp-sutra-brand`, or a solid `bg-accent-9` square. Don't demo a two-stop hex gradient as the logo pattern.

### [P2][docs] Doc "Defaults: None" is inaccurate; prop table omits `navItemRadius`
- **Category:** docs
- **Evidence:** `sidebar.md:27-28` says `## Defaults / None`, but source defaults `currentPath = '/'` (line 336) and `navItemRadius` default `'md'` (line 137-140). `navItemRadius` is entirely absent from the doc's Props section (`sidebar.md:7-19`).
- **Why:** Docs-parity gap — a public prop (`navItemRadius`) is undocumented and stated defaults are wrong. Source wins.
- **Fix:** Add `navItemRadius?: 'sm' | 'md' | 'lg' | 'pill'` (default `'md'`) to the prop table and correct the Defaults section (`currentPath` defaults to `'/'`).

### [P3][F1] `logo` default renders a hardcoded `"Logo"` placeholder string
- **Category:** composability / structural-tell
- **Evidence:** shell/sidebar.tsx:378-382 — `{logo ?? (<span …>Logo</span>)}`.
- **Why:** Shipping a literal `"Logo"` placeholder as the default is filler that will leak into a real app if the consumer forgets the prop. Minor, but it's an unfilled-placeholder smell.
- **Fix:** Render nothing (or `null`) when no `logo` is provided, or make `logo` required.

### [P3][G3] `navItemRadius` is a bespoke, non-canonical axis
- **Category:** vocabulary
- **Evidence:** shell/sidebar.tsx:140, 194-199 — a 4-value radius axis (`sm|md|lg|pill`) wired to a CSS var.
- **Why:** Reasonable and well-documented (sets `--ds-sidebar-item-radius`, overridable via className), so this is a *choice* not a reflex — but it introduces a component-local radius vocabulary that doesn't map to the system's `--radius-ds-*` names 1:1. Low priority.
- **Fix:** None required; consider aligning the value names to the radius token scale if a broader convention emerges.

### [P3][I] `NavItem.badge` / render types fine, but `renderItem` return `ReactNode | null` conflates "no override" with "render nothing"
- **Category:** types
- **Evidence:** shell/sidebar.tsx:132 — `renderItem?: (item, defaultRender) => React.ReactNode | null`; logic at 440-445 uses `null` to mean "use default."
- **Why:** `null` is overloaded: it's both a valid React render (render nothing) and the sentinel for "fall through to default." A consumer who genuinely wants to hide an item can't — returning `null` re-renders the default.
- **Fix:** Use an explicit sentinel (e.g. return `undefined` = fall through, `null` = render nothing) or a documented `false` for hide. Document whichever you pick.

## Composability gaps
- Promo banner re-rolls a Card surface (`rounded-surface bg-surface-raised shadow-raised`) instead of composing `<Card>` / `<CardAction>` — the StatCard drift (F5).
- `footer` / `footer.promo` / `promo.action` are config-object mini-DSLs that duplicate `<Card>` and `<Button>` APIs; no slot path for a second action, custom button variant, or promo icon placement beyond the fixed shape.
- Two hand-rolled inline SVG icons bypass the Icon API and its size tokens.
- The primitive already ships `SidebarMenuAction` (a purpose-built row-action slot) and `SidebarMenuSkeleton` (loading), but AppSidebar re-implements the chevron as a bespoke absolutely-positioned button and never exposes loading.
- `renderItem` render-prop is the only per-item escape hatch; there is no compound (`AppSidebar.Item`) path, so all composition funnels through data props.

## Motion gaps
- The active-indicator slide (`layoutId="sidebar-active-indicator"`, `springs.smooth`) in the primitive has no `useReducedMotion` guard, while the same file guards its swipe drag — inconsistent reduced-motion handling that a consumer sees through AppSidebar (M3/M4).
- AppSidebar itself adds only `transition-colors` on nav items and `transition-transform` on the chevron rotation — correct and restrained (no bounce/elastic default). No entrance stagger on nav groups, which is fine (restraint), not a gap.
- No hover/press micro-feedback beyond color on the promo dismiss button and footer links — acceptable but minimal.

## Polish plan (ordered steps to reach the finish bar)
1. Replace the hand-rolled promo `<div>` with `<Card variant="flat|default" size="sm">` + `<CardContent>` + `<CardAction tuck>` for dismiss (fixes F5 + the same-tint-on-same-tint surface issue).
2. Swap the two inline SVGs for `<Icon icon={IconChevronRight/IconX} size="sm" />` from tabler; delete `ChevronRight`/`CloseIcon` (fixes G2, removes hardcoded px).
3. Mark `footerLinks` `@deprecated` in JSDoc + add a one-shot dev warning (fixes J).
4. Reconcile the surface level: add the sidebar to `SURFACE1_ALLOWLIST` with the "deliberate elevation for hierarchy (v0.19.0)" rationale, or move to surface-1 (fixes G1 bookkeeping).
5. Add `disabled?` to `NavItem`, a `loading?` prop rendering `SidebarMenuSkeleton`, and an `emptyState?` — then show each in a story (fixes H state coverage).
6. Gate the primitive's `layoutId` active-indicator behind `useReducedMotion()` (fixes M3/M4).
7. Add an axe pass over the full-featured tree (collapsible + promo + badge + group action) and a keyboard tab-order test for the link+chevron row (fixes H a11y).
8. Fix the doc: document `navItemRadius`, correct the "Defaults: None" line (fixes docs parity).
9. Replace the gradient-swatch logo in `WithCustomLogo` with a solid/brand mark (fixes V13 in the story).
10. Make the `logo` default render nothing instead of `"Logo"`; clarify `renderItem`'s null semantics (P3 polish).

## Clean (rubric dims that pass)
- **V1 accent rail — explicitly killed.** Lines 200-201 comment rejects the doubled-accent stripe; active state = `bg-accent-2 text-accent-11 font-medium` (tint + color + weight). This is the Card-bar move.
- **V3 gradient text / metric gradient** — none.
- **V4 default framework palette** — no `indigo/violet/slate` as brand; uses semantic `accent`/`surface`/`success` tokens throughout.
- **V5 emoji as icons** — none in source, story, or doc.
- **V6 blob/glass/glow** — none; solid surfaces, real shadow tokens.
- **V7 rounded-everything** — deliberately tightened: nav items default to control radius (~6px) with a comment noting surface radius "read as over-rounded blobs" (line 190-191). Good judgment.
- **V8 pill-badge spam** — badges are data-driven counts, not decorative "New/Beta" spam (the `'New'` in a *test* is a value, not a shipped default).
- **E1–E8 verbal tells** — JSDoc and doc prose are direct and technical; no em-dash tic as connector, no AI vocabulary, no meta-hedging.
- **M1 bounce-by-default** — no `backOut`/overshoot on entrances; motion is restrained CSS transitions.
- **G3 variant axes** — the primitive's `variant`/`size` are canonical; AppSidebar adds only the (documented) `navItemRadius`.
- **I types (mostly)** — `forwardRef` + `displayName` present; `IconInput` typed icons (not `ReactNode` soup); no `any` in the public surface; props exported.
- **F2 asChild** — correctly used where it matters (`SidebarMenuButton asChild`, `SidebarGroupAction asChild`, `Button asChild` for the promo link) to polymorph into the framework `Link`.
- **F6 controlled/uncontrolled** — open/collapse state is owned by `SidebarProvider` (the primitive), which supports both `defaultOpen` and controlled `open`/`onOpenChange`; AppSidebar correctly stays stateless and data-driven.
