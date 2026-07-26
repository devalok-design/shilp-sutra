# @devalok/shilp-sutra

## 0.55.0

### Minor Changes

- [#238](https://github.com/devalok-design/shilp-sutra/pull/238) [`52cf405`](https://github.com/devalok-design/shilp-sutra/commit/52cf4059a61345c5a8c0f2d943fa3f8ca0b1ea0f) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix three faults that made the published type declarations unusable for anyone type-checking them, and drop three dependencies that were never needed.

  Reported by a consumer who installed 0.54.0 and hit "a ton of TS errors from your package's `.d.ts` file". Reproduced exactly: one `import { Button } from '@devalok/shilp-sutra/ui'` produced **78 errors**.

  All three faults were invisible on the most common consumer config (`moduleResolution: "bundler"` + `skipLibCheck: true`), which is why they shipped. They appear the moment a consumer turns on declaration checking.

  **`"use client"` no longer emitted into `.d.ts`** — 209 of 284 published declaration files began with a `"use client"` prologue. A `.d.ts` is an ambient context, so that is a statement, and every one was `error TS1036: Statements are not allowed in ambient contexts`. The directive is a bundler/RSC runtime concern, read off the `.js` module graph; declarations are erased before anything runs. `inject-use-client.mjs` now skips `.d.ts` and strips any stale directive.

  **No more undeclared type imports** — `split-button.d.ts` referenced `@floating-ui/dom` and seven files referenced `@tiptap/core` / `@tiptap/react` / `@tiptap/suggestion`, none of them declared anywhere: `error TS2307: Cannot find module`. The cause was a rule that only held for runtime — a module is a consumer peer _iff_ the build externalizes it. Rollup bundles TipTap's JavaScript, but TypeScript's declaration emitter does not bundle third-party types, so the bare specifier survived into our `.d.ts` with nothing declaring it.

  - `@floating-ui/dom`'s `Placement` is now inlined as `SplitButtonPlacement` (same twelve members, also exported) — no install, no leak.
  - `@tiptap/core`, `@tiptap/react` and `@tiptap/suggestion` are now **optional, types-only peers**. The runtime stays bundled; install them as devDependencies only if you import `RichTextEditor` / `RichChatInput` and want the editor object typed. `derive-peer-map.mjs` understands this category, so `preflight` and the recipe tables say "types only" rather than implying a runtime need.

  **Relative imports in `.d.ts` now carry explicit `.js` extensions** — 234 extensionless specifiers broke `moduleResolution: "node16" | "nodenext"` (TS2834/TS2835). Directory specifiers resolve to `/index.js`. A new `fix-dts-extensions.mjs` post-build step handles this.

  **Three dependencies removed — no consumer action required.** `diff`, `frimousse` and `@emoji-mart/data` were declared as runtime dependencies while already being fully bundled into `dist`, so every consumer installed packages they also received a copy of. Nothing resolves them at runtime and nothing references them in the types. Dependencies drop from seven to four; the remaining four are all genuinely required — `class-variance-authority` and `clsx` appear in our published types, `tw-animate-css` is resolved by your CSS build, and `use-sync-external-store` is an externalized TipTap transitive.

  **Two more faults, found only under pnpm.** All of the above was verified with npm, which hoists dependencies flat and auto-installs peers — so an undeclared package still resolves and a forgotten peer still appears. Re-running the same verification under pnpm's isolated layout surfaced two further problems, both of which ship in 0.54.0 today:

  - **`@tiptap/pm` was missing from the peer set.** TipTap's own declarations import `@tiptap/pm/state` and TipTap declares `@tiptap/pm` as _its_ peer, so `pnpm add -D @tiptap/react` still left six `TS2307` errors from inside TipTap. This is not derivable from our imports — the requirement lives in the peer's types — so `derive-peer-map.mjs` gains an explicit companion map.
  - **Two 0-byte emitted modules** (`dist/ui/toast-types.js`, `dist/ai/types.js`). A types-only entry has no runtime content, so the bundler emits an empty file while `exports` still advertises a runtime path. An empty file gives Node's module-type detection nothing to read, and under pnpm's symlinks that ambiguity throws `ERR_REQUIRE_CYCLE_MODULE` on import. A new `fix-empty-modules.mjs` gives them an `export {}` body.

  **Five gates added, so this class cannot ship again.** The 45 existing gates all passed on the broken release because our own consumer smoke test set `skipLibCheck: true` — the exact setting that hides it — and installed npm-style.

  - `scripts/audit-dts.mjs` — no directive prologue, no undeclared bare specifier, no extensionless relative specifier, no 0-byte emitted module.
  - `scripts/consumer-strict-install.mjs` — pnpm with hoisting disabled and auto-install-peers off, importing all 150 subpath exports and checking both types and runtime. This is the gate that found the two faults above.
  - `attw` (pinned, not `npx @latest`) in the pre-publish audit, ignoring only the two by-design rules — ESM-only, and node10's inability to read `exports`.
  - The smoke consumer now runs with `skipLibCheck: false`.
  - The smoke consumer type-checks across `bundler` × `nodenext` × `skipLibCheck` on/off.

  Verified against a packed tarball: 150/150 subpaths type-check clean under pnpm at `skipLibCheck: false` and 150/150 import cleanly at runtime; all four tsconfig combinations report zero errors; `attw`'s `InternalResolutionError` count goes from 301 to 0. Also verified React 18, `require(esm)` on Node 22.12+, a real Tailwind 4 build emitting every DS utility, and an end-to-end Vite app that builds, server-renders, and passes 13 browser interaction checks with no console errors.

  Two behaviours are documented rather than changed, in `docs/recipes/troubleshoot.md`: legacy `moduleResolution: "node"` cannot resolve our subpaths (it predates `exports`), and the package is ESM-only, so CommonJS callers need a dynamic import.

## 0.54.0

<!-- breaking-summary:start -->

> ### ⚠️ Breaking in 0.54.0
>
> - remove(shell)!: `AppSidebar` removed — compose the `Sidebar` primitives or the `sidebar-app` preset
>
> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.

<!-- breaking-summary:end -->

### Minor Changes

- [#226](https://github.com/devalok-design/shilp-sutra/pull/226) [`461c9bf`](https://github.com/devalok-design/shilp-sutra/commit/461c9bf7adebfc864188444f5fe2aa6b164de93e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(avatar-group): a11y + motion polish (finish-bar-v2 audit)

  Public API unchanged (one additive prop: `label`). Fixes the two P0s that pinned
  the audit score plus P1/P2 cleanups.

  - **a11y (P0):** each avatar is now a focusable `<button>` with the `focus-ring`
    util + `aria-label`, so member names are reachable by keyboard/AT (they were on
    non-focusable `<div>`s → hover-only). Empty `users` renders nothing instead of a
    focusable "0 team members" group.
  - **motion (P0):** the hover/focus spread + peer-dim are driven by framer
    (`animate={{ x }}`) so `MotionConfig` / `prefers-reduced-motion` governs them —
    no positional animation under reduced-motion.
  - **motion (P1):** avatars and the `+N` badge animate the spread **together** on DS
    spring/duration tokens (avatars used to snap while `+N` glided; off-token
    `duration-300 ease-out` removed).
  - **compose (P1):** the `+N` badge is an `<Avatar>` + `<AvatarFallback>` now,
    deleting the duplicate `avatarSizeVariants` CVA + text-size map.
  - **fix (P1):** the dead indicator ternary is resolved — `admin` dot is
    `bg-warning-9` (matches the docs), `lead` stays accent.
  - **P2:** `max` clamped ≥ 1; ring-offset follows `borderColor` (no seam on a
    `surface-base` blend); `Record` maps tightened to the `AvatarSize`/`AvatarRing` unions.

- [#227](https://github.com/devalok-design/shilp-sutra/pull/227) [`bbbb578`](https://github.com/devalok-design/shilp-sutra/commit/bbbb578e7a7db421e00c962217020d0cfd3e9477) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(bulk-action-bar): ARIA toolbar keyboard model + a11y + composability (audit)

  Non-breaking (additive props). Fixes the P0 keyboard trap + P1/P2 gaps.

  - **a11y (P0):** roving `tabIndex` now sits on the real `<Button>`s, not a wrapper
    `<div>`, so keyboard users can **activate** actions (Enter/Space), not just move
    the ring past them. Single tab stop with Arrow/Home/End roving across ALL controls
    (Select-all, actions, Clear) per the ARIA Toolbar model. Locked by a new
    arrow-then-Enter regression test.
  - **a11y (P1):** inline confirmation is `role="group"` + `aria-live="assertive"`;
    focus moves to Confirm on open and restores to the action on Cancel/Escape.
  - **RTL (P1):** logical positioning (`start-1/2`) + Arrow Left/Right mirrored under
    `dir="rtl"`.
  - **api (P1):** `forwardRef` + spreads `HTMLAttributes`; action `color` widened to
    the full Button union (`accent | error | success | warning | info | neutral`) —
    was 2 of 6. New additive `loading` per-action pending spinner.
  - **motion (P2):** `springs.smooth` for the slide + `useReducedMotion` guard
    (opacity-only under `prefers-reduced-motion`).
  - **docs:** prop table corrected to match source (`icon = IconInput`, full color
    union, `totalCount`/`onSelectAll`/`loading`/confirm props).

- [#217](https://github.com/devalok-design/shilp-sutra/pull/217) [`3bdd137`](https://github.com/devalok-design/shilp-sutra/commit/3bdd137d7342c5ee08b42c1cc62415a2d2181e62) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(combobox): trigger is now `div[role=combobox]`, not a `<button>` — fixes invalid nested buttons in multi-select

  In multi-select mode the trigger rendered selected chips whose remove-`×` are
  `<button>`s **inside** the trigger `<button>`. A button cannot legally contain a
  button — the browser silently splits the DOM (mangling pill layout), the remove
  click can be swallowed, and screen readers misreport what's actionable.

  The trigger is now a `<div role="combobox" tabindex="0">` — the W3C
  select-only-combobox pattern (the same structure MUI, eBay MIND, and React Aria
  use). Chip remove-buttons are now legally nested, layout is stable, and the
  remove affordance is reliably clickable. Single-select is visually and
  behaviourally unchanged.

  **Potentially breaking:**
  - The forwarded `ref` type changes from `HTMLButtonElement` to `HTMLDivElement`.
    A consumer typing the ref as `HTMLButtonElement` will need to update it to
    `HTMLDivElement`. `.focus()` etc. are unaffected.
  - Disabled state is now conveyed via `aria-disabled` + `tabindex="-1"` (a div has
    no `:disabled`). A test asserting `toBeDisabled()` on the trigger should assert
    `aria-disabled="true"` instead. Keyboard open (Enter / Space / ArrowDown) and
    Radix's disabled-blocking are preserved.

- [#229](https://github.com/devalok-design/shilp-sutra/pull/229) [`67c80cf`](https://github.com/devalok-design/shilp-sutra/commit/67c80cfff2233d10e136a9b9a368903f281cabbc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(error-boundary): alert a11y + boundary contract parity (audit)

  All additive (non-breaking).

  - **a11y (P0):** the message region is `role="alert"` (assertive live region) — screen
    readers announce the error when it appears (there was no live region; the axe tests
    passed only because axe can't detect a _missing_ one). Focus moves to the recovery
    button when `ErrorBoundary` swaps in (`autoFocusReset`).
  - **security (P1):** the raw `error.message` is gated behind development — production
    shows the friendly status-mapped copy (no internal-detail leak); the real message
    stays in the dev-only stack block.
  - **api (P1):** `ErrorBoundary` now implements `componentDidCatch` → `onError(error, info)`
    (wire Sentry/logging), and `ErrorDisplay` gains an `actions` slot for a secondary
    recovery action (default "Try Again" only when absent).
  - **api (P2):** `resetKeys` — the boundary auto-recovers when a dependency changes
    (react-error-boundary parity); the `fallback` render-prop now receives a guaranteed
    `onReset`.
  - **visual (P1/P2):** dead `border-card-strong` → `border-card`; `min-h-[60vh]` gated
    behind a `fullPage` prop (default true) so inline boundaries don't force viewport height.
  - **docs:** documented the full `ErrorBoundary` API + the new props.

- [#230](https://github.com/devalok-design/shilp-sutra/pull/230) [`6efb64d`](https://github.com/devalok-design/shilp-sutra/commit/6efb64d7707a6bbc6c6016b0b961bc6249914123) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(master-detail): a11y naming/live region + selection ownership (audit)

  Additive (non-breaking — controlled `selected` + explicit `active` still work).

  - **a11y (P0):** the `listbox` now has an accessible name via a `label` prop
    (`aria-label`) — it was a nameless listbox to screen readers. The detail pane is a
    `role="region"` `aria-live="polite"` region, so AT users are told the detail changed
    when the selection swaps (was a silent swap).
  - **api (P1):** selection ownership — put `value` on each `MasterDetail.ListItem` and
    `onSelect` / `defaultSelected` on the root; `active` + `aria-selected` derive from
    context automatically. No more hand-wiring `active={id === sel}` **and** `onClick` on
    every row (the DS `value`/`onSelect` model). Controlled `selected` is unchanged.
  - **motion (P2):** the mobile detail slide is gated behind `useReducedMotion`
    (opacity-only / instant under `prefers-reduced-motion`).
  - **RTL (P2):** list divider `border-r` → `border-e`; the mobile back arrow mirrors
    under `dir="rtl"`.
  - **cleanup:** removed the dead `itemCount` context; roving `activeIndex` derives from
    `value` or an explicit `active`.

  Follow-ups noted (not in this change): `asChild`/`href` rows, typeahead, per-item disabled.

- [#221](https://github.com/devalok-design/shilp-sutra/pull/221) [`1596a6f`](https://github.com/devalok-design/shilp-sutra/commit/1596a6fb0edbd8d9db1413c90ec0d59e5d7e22c0) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - remove(shell)!: `AppSidebar` removed — compose the `Sidebar` primitives or the `sidebar-app` preset

  **BREAKING (beta 0.x).** The config-driven `AppSidebar` shell wrapper is removed,
  along with its config types (`AppSidebarProps`, `NavGroup`, `NavItem`,
  `NavSubItem`, `SidebarUser`, `SidebarPromo`, `SidebarFooterConfig`) and the
  `@devalok/shilp-sutra/shell/sidebar` subpath export.

  **Why.** The `Sidebar` primitives (`@devalok/shilp-sutra/ui/sidebar`) are already
  fully composable — logo, grouped nav, collapsible sub-items, badges, group
  actions, user footer. The wrapper only re-expressed those primitives through a
  data-shape config, and every new pattern meant a new config prop. We're moving to
  the shadcn model: **compose the primitives, or copy a preset and own it.**

  **Migration.**
  - Fastest: `npx shadcn@latest add @devalok/sidebar-app`, then replace
    `<AppSidebar navGroups={…} user={…} currentPath={…} />` with the pasted
    `<SidebarApp/>` and wire your router `Link` + active path. Preset gallery:
    https://shilp-sutra.devalok.in/presets (also `sidebar-projects`,
    `sidebar-client`, `sidebar-minimal`).
  - Or compose `@devalok/shilp-sutra/ui/sidebar` directly.

  The `Sidebar` **primitives are unchanged** — only the wrapper on top of them is
  gone. See BREAKING.json (0.54.0) + MIGRATION.md for the full symbol list.

- [#228](https://github.com/devalok-design/shilp-sutra/pull/228) [`42b3b50`](https://github.com/devalok-design/shilp-sutra/commit/42b3b50acf08770b1d73833fe248c78e2d04ecbc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(skeletons): unify shimmer (S6) + a11y status region (audit)

  `loading-skeleton` (Card/Table/Board/List) + `page-skeletons` (Dashboard/ProjectList/
  TaskDetail). Non-breaking (additive `label` prop).

  - **shimmer unify (S6, P0):** dropped every `bg-surface-raised-hover` fill override —
    all bars now inherit the base `Skeleton`'s `skeleton-base`, so the system shimmers
    from ONE source and bars no longer disappear in forced-colors (Windows HCM).
  - **a11y (P0):** each root is a `role="status"` + `aria-busy` region with an sr-only
    label (loading was silent to AT — every child `Skeleton` is `aria-hidden`). New
    optional `label` prop.
  - **state (P1):** count props (`rows`/`columns`/`cardsPerColumn`) clamped with
    `Math.max(0, floor(...))` — `rows={-1}` / `NaN` can't throw a `RangeError`.
  - **motion (P1):** removed the inert `animationDelay` (it sat on non-animated wrapper
    divs and never fired).
  - **cohesion (P1):** shells use `border-card` + `rounded-surface` (Card's vocabulary)
    rather than `border-card-strong` / `rounded-overlay-lg` (Dialog radius);
    page-skeletons' misleading `shimmer` fill constant removed.
  - **docs:** page-skeletons no longer falsely claims it's "Built on LoadingSkeleton".

### Patch Changes

- [#231](https://github.com/devalok-design/shilp-sutra/pull/231) [`5f054fd`](https://github.com/devalok-design/shilp-sutra/commit/5f054fd3adb6a0245d06cbff6e5df31f8106b4b2) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(file-upload): focus-visible ring + motion hygiene (audit)

  No API change — a11y + motion fixes.

  - **a11y (P0):** the keyboard-operable `role="button"` drop zone now has the DS
    `focus-ring` — a `div[role=button]` gets no usable UA focus outline, so keyboard
    users had no visible focus (WCAG 2.4.7).
  - **a11y (P1):** the disabled drop zone is `tabIndex={-1}` (leaves the tab order) to
    match its `aria-disabled` — it was still focusable while disabled.
  - **motion (P1):** the progress bar animates `scaleX` on a full-width child
    (`transform-origin: left`) instead of `width` — compositor-only and honored by
    `prefers-reduced-motion` (a `width` animation slips past `MotionConfig`).
  - **motion (P1):** removed the default 5-keyframe error shake; the alert now fades/
    slides in calmly.
  - **visual (P2):** the drop zone rests on `bg-surface-base` and tints on hover — the
    hover token was being used at rest; adds real hover feedback.

  Follow-up (not in this change): compose the compact variant on `<Button>`.

- [#223](https://github.com/devalok-design/shilp-sutra/pull/223) [`a0c4c73`](https://github.com/devalok-design/shilp-sutra/commit/a0c4c7306fe6124ba3a60a26dd91f5ec2d4a5b8a) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix(docs): correct doc↔source drift in 6 components (finish-bar-v2 audit S3)

  Six shipped docs made claims the source contradicts — actively misleading AI
  agents and consumers. Corrected against source (source is truth):

  - **rich-chat-input** (P0): prop table was materially wrong — `onSubmit` is
    `(message: RichChatInputMessage) => void` (not `(html, plainText)`); removed the
    non-existent `maxRows`; added the `inline` variant + `charCountDisplay`,
    `content`, `onVoiceRecord`, `onTranscribe`, `maxDuration`, `replyTo`,
    `actionButton`, `emojiSet`, `onSchedule`, `sendOptions`; fixed `ChatToolbarItem`
    (no `attach`; adds `blockquote`/`link`); documented `RichChatInputMessage`.
  - **slider**: doc claimed Slider does NOT consume FormField — it does (a11y wiring:
    aria-invalid/describedby/required); reworded to "consumes for a11y, no visual
    validation treatment."
  - **search-input**: removed the false "Escape auto-clears via type=search" claim
    (never wired); added the shipped `xs` size (was `sm|md|lg`).
  - **command-registry**: `icon` is `IconInput` (not `ReactNode`); the pages/adminPages
    split is organizational, NOT access control — clarified the component enforces
    nothing (authorize on the server). Fixed the shell Introduction table's phantom
    "register/unregister/search" API to the real contract.
  - **app-command-palette**: role detection is case-sensitive (`'Admin'`/`'SuperAdmin'`);
    fixed the example's `role: 'admin'` and documented the footgun.
  - **simple-tooltip**: it always mounts its own `TooltipProvider` and does NOT inherit
    an ancestor's `delayDuration` (doc claimed it "respects it if present").

  Docs-only; no runtime or type changes.

- [#234](https://github.com/devalok-design/shilp-sutra/pull/234) [`670c275`](https://github.com/devalok-design/shilp-sutra/commit/670c275df9a8d5f274a0ad9e85c4b618bbba7977) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix: P2 audit sweep — notification-preferences a11y names + split-button doc accuracy

  - **notification-preferences (P1 a11y):** the per-row mute `Switch` and min-tier
    `Select` now have accessible names (`aria-label`) — every row's inline controls
    announced their value with no "what" (WCAG 4.1.2). Names include the channel +
    project (e.g. "Mute In-App for Karm V2").
  - **split-button (docs):** corrected the Composability section — it falsely claimed
    SplitButton _inherits_ Button's variant/color/size vocabulary and `ButtonGroup`
    context (it re-implements styling locally and ignores group context). Dropped the
    stale "arrow-key nav planned for 0.45.0" changelog line.

  Deferred (bigger/riskier, noted for a future pass): derive split-button's half styling
  from `buttonVariants` (layout-sensitive), and de-duplicate the context-menu/menubar
  Radix-twin plumbing.

- [#232](https://github.com/devalok-design/shilp-sutra/pull/232) [`03b32e4`](https://github.com/devalok-design/shilp-sutra/commit/03b32e443058c91024ee00f6afda00d92c5efbe9) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix: P2 audit sweep — spinner reduced-motion contract, icon-button touch target, separator stories

  - **spinner (P1):** `onComplete` now fires under `prefers-reduced-motion`. The static
    success/error paths render without an `onAnimationComplete`, so the documented
    `onComplete` callback was silently dropped for reduced-motion users — a flow that
    advances on the success tick would stall. It now fires from an effect when the final
    state mounts, regardless of motion preference.
  - **icon-button (P1):** `sm` (32px) and `md` (40px) icon buttons now carry the
    `touch-target` util — an invisible ≥44px press region (visual size unchanged) so
    keyboard/touch targets meet WCAG 2.5.5. `lg` (48px) already cleared it. JSDoc
    taxonomy corrected (adds `soft`; real color axis).
  - **separator:** dropped the dead `variant` radio control from Storybook (the prop is a
    no-op since 0.45.0; the control advertised a feature that does nothing). The prop's
    removal itself is a breaking change deferred to the next major.

- [#233](https://github.com/devalok-design/shilp-sutra/pull/233) [`113695d`](https://github.com/devalok-design/shilp-sutra/commit/113695d5438ddf691e3d0728244f5d57c4f3c600) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - fix: P2 audit sweep — switch RTL + reduced-motion, table forced-colors selection

  - **switch (P1):** the thumb now travels toward the inline-end — mirrored under
    `dir="rtl"` (it previously slid the wrong way in RTL). The thumb spring +
    press-scale are gated behind `useReducedMotion` (instant, no scale under
    `prefers-reduced-motion`).
  - **table (P1):** the selected-row tint (`accent-3`) gets a `forced-colors:outline`
    fallback so selection survives Windows High-Contrast Mode (the tint collapses to
    Canvas with no cue otherwise).

## 0.53.0

### Minor Changes

- [#186](https://github.com/devalok-design/shilp-sutra/pull/186) [`ce3fd1b`](https://github.com/devalok-design/shilp-sutra/commit/ce3fd1ba94f523644ba781997138f547386e6c1e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Autocomplete rebuild (finish-bar).** Re-parented onto the DS `Input` primitive instead of a hand-rolled `<input>`, closing the composition drift and a painted-error gap, and adding the capabilities that put it at market parity.

  - **Composes `Input`** — inherits `size`, error/`state` painting, read-only, hover, and FormField auto-consumption. (Previously re-rolled the field: `ring-offset`/`focus-visible` drift from `Input`, hardcoded height, and it read FormField `error` but never painted it.)
  - **Uncontrolled mode** — new `defaultValue`.
  - **`size` / `state`** forwarded to the field.
  - **Async** — new `isLoading` + `loadingText` (spinner in the field and the listbox).
  - **`renderOption`** slot for custom option content; default now **bolds the matched substring** in each option.
  - Dropped a keystroke-frequency stagger animation, a dead cleanup effect, and copy-pasted AI-filler JSDoc. Option labels truncate. Dropdown fade is reduced-motion gated.
  - Doc corrected (it DOES auto-consume FormField, via Input).

  Non-breaking: the `value` object API + `onValueChange` are unchanged; new props are additive.

- [#184](https://github.com/devalok-design/shilp-sutra/pull/184) [`2ed13fd`](https://github.com/devalok-design/shilp-sutra/commit/2ed13fd1874f5d5e45ba8fa48afffa961c990c87) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **BottomNavbar rebuild (finish-bar).** The overflow "More" menu is now the DS `Sheet` (`side="bottom"`) instead of a hand-rolled `role="dialog"`, so it inherits focus trap, scroll lock, return-focus, `aria-modal`, and `aria-haspopup`/`aria-controls` trigger wiring — closing a real accessibility gap in primary mobile navigation.

  - **Role gating (new):** `BottomNavItem` gains `roles?: string[]` (visible only when `user.role` matches) and `canView?: (user) => boolean` (arbitrary logic, wins over `roles`). The previously-inert `user` prop now drives this. Non-breaking — items with neither field are always visible.
  - **`indicator` (new):** default **`pill`** (Material-3 tonal pill behind the icon), plus `underline`, `tint` (whole-cell), and `none` (no shape — pair with `activeIcon` for the iOS filled look). The active indicator **animates** — a shared-element (`layoutId`) that slides to the selected item and fades in on first appearance.
  - **`labelVisibility` (new):** `'always'` (default) or `'selected'` (labels only for the active item, for narrow viewports).
  - **`activeIcon` (new):** a per-item filled/alternate icon shown while the route is active (falls back to `icon`) — the iOS/Material filled-when-selected affordance. Icon lozenge padding tightened so icon-only items (e.g. `labelVisibility="selected"`) read less airy.
  - Composes `Badge` for notification counts (was re-rolled); Sheet's built-in close replaces the sub-44px hand-rolled one.
  - Label truncation + logical (RTL-safe) properties; overflow grid adapts to item count instead of a fixed 4 columns.
  - Notification-badge `zoom-in` animation is now reduced-motion gated.
  - Restored test coverage (RTL + vitest-axe: active state, badges, role gating, More-sheet open/close).

- [#185](https://github.com/devalok-design/shilp-sutra/pull/185) [`f088c92`](https://github.com/devalok-design/shilp-sutra/commit/f088c92d0f5653952431e721c9f610d220011d98) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **PriorityIndicator rebuild (finish-bar).** Recomposed on the `Badge` primitive instead of a bespoke re-rolled chip, fixing two P0s (unguarded infinite motion + no compact accessible name) and the radius/motion drift from `Badge`.

  - **Severity by weight, not motion.** URGENT is now a solid `Badge` (static, high-contrast) so the top tier reads at a glance. The perpetual scale-pulse is **removed** (it was unguarded infinite motion — WCAG 2.2.2 Pause/Stop/Hide). No animation at all now.
  - **Real compact a11y.** Icon-only chips carry `role="img"` + `aria-label` (was a mouse-only `title` on a `<div>`).
  - **New `iconOnly`** replaces the dead `display` CVA axis (both its branches emitted empty strings). `display` is kept as a **deprecated alias** (`'compact'` → icon-only).
  - **New `children`** overrides the label for i18n / custom copy.
  - Unknown `priority` values now fall back to MEDIUM instead of throwing.
  - Doc corrected (LOW = slate, not success; not server-safe).

  Note: because it now composes `Badge`, the rendered element (and forwarded `ref`) is a `span` rather than a `div`, and the chip uses `Badge`'s pill radius. Behavioral API (`priority`) is unchanged.

- [#187](https://github.com/devalok-design/shilp-sutra/pull/187) [`bd929e0`](https://github.com/devalok-design/shilp-sutra/commit/bd929e0a71a6a876b467a4832ae2ae3831f8ea45) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **ScheduleView rebuild (finish-bar).** Fixes the P0 a11y flood, the overlapping-event illegibility, the stale now-line, and the surface/border regression.

  - **No more phantom tab stops.** Slots are focusable/keyboard-navigable only when `onSlotClick` is set; otherwise they're inert grid lines. A read-only week view previously exposed ~140 sequential tab stops. Interactive slots now use **roving tabindex + Arrow/Home/End** navigation (RTL-aware) — one tab stop into the widget.
  - **Overlapping events** partition into side-by-side columns (greedy interval colouring) instead of stacking on top of each other.
  - **Live now-line** — ticks every minute and scrolls into view on mount (was frozen at mount time).
  - **Surface fix** — shell uses the `surface-2` card tier + `rounded-surface` + a real border (was `surface-raised` + the dead `border-card-strong` class).
  - **RTL** — logical properties throughout; now-dot centered via transform.
  - **New props:** `selectedEventId` (rings the active event), `renderEvent` (custom event body), `header` (toolbar slot), `emptyState`, `height`.

  Non-breaking: `view`/`date`/`events`/`onEventClick`/`onSlotClick` unchanged; new props additive.

  Scope note: full ARIA grid-matrix semantics (`role="grid"` with row/column indices) were intentionally not adopted — the component stays a labelled `region` with keyboard-navigable slots, which is honest and lint-clean rather than a partial/broken grid.

### Patch Changes

- [#182](https://github.com/devalok-design/shilp-sutra/pull/182) [`c441b72`](https://github.com/devalok-design/shilp-sutra/commit/c441b720868ccd85f21edf157954fd036e6fd2e1) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Two DS-wide fixes from the finish-bar audit:

  - **Reduced motion respected without a provider.** `useMotion()` now falls back to the OS `prefers-reduced-motion` setting when no `<MotionProvider>` is mounted (previously the context default hardcoded `reducedMotion: false`, so components ignored the preference unless a provider wrapped them). Every shilp-sutra component that gates animation on `useMotion().reducedMotion` now honors reduced motion out of the box; a provider remains an explicit override.

  - **`border-card-strong` is now a real utility.** It was referenced by ~11 components (kbd caps, code blocks, skeleton/panel outlines, chips) but never defined — the border fell back to `currentColor`. Added `@utility border-card-strong` mapping to the dark-mode-aware `--color-surface-border`, restoring the intended hairline.

## 0.52.0

### Minor Changes

- [#176](https://github.com/devalok-design/shilp-sutra/pull/176) [`a0107f0`](https://github.com/devalok-design/shilp-sutra/commit/a0107f0a7ea420d20da0bfb2d95544933083d86b) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Dogfood fixes: Button `info` color, Icon `style` passthrough, ColorInput hex draft, SearchInput centering, recipe/type drift.

  Addresses agent-filed feedback ([#174](https://github.com/devalok-design/shilp-sutra/issues/174), [#173](https://github.com/devalok-design/shilp-sutra/issues/173), [#143](https://github.com/devalok-design/shilp-sutra/issues/143), [#142](https://github.com/devalok-design/shilp-sutra/issues/142)):

  - **Button** — add `info` to the `color` prop (and `processingColor`). The semantic-intent set is now aligned with Card: `accent · error · success · warning · info · neutral`, so a single intent token can tint a Button + Card + Badge set. Type **widening**, non-breaking. Category hues (`teal`, `amber`, …) remain Badge-only by design — see the new color support matrix in `make-kit/foundations/color.md`. `info` is fully wired through the Button family: `ButtonGroup` dividers, `SplitButton` (both halves + divider + outline border), and the processing marching-ants overlay — previously any `color` outside the old five silently fell back to `accent` in those maps.
  - **Icon** — forwards a `style` prop to the rendered icon (all render paths: static, animated, draw, loading), so decorative `opacity`/`transform` no longer needs a wrapper `<span>`. New optional prop; non-breaking.
  - **ColorInput** — the hex field now keeps a local draft so in-progress (<6 char) typing isn't clobbered by the committed color; commits at 6 chars, discards an incomplete value cleanly on blur/close. Removes the need for consumer `pnpm patch`es. ([#142](https://github.com/devalok-design/shilp-sutra/issues/142))
  - **SearchInput** — the clear (✕) button is now vertically centered in the input; the animated wrapper was uncentered and sat a few px high. ([#143](https://github.com/devalok-design/shilp-sutra/issues/143))
  - **Docs** — fixed `useColorMode()` and `IconProvider`/`Icon size` examples that drifted from the shipped types across setup-vite / setup-remix / server-components recipes (both `skill/references` and `docs/recipes` copies) and the make-kit (`setup.md`, `foundations/dark-mode.md`, `foundations/icons.md`). `useColorMode` returns `{ colorMode, setColorMode, toggleColorMode }`; icon size is a tier (`"sm"`), never a pixel number. ([#173](https://github.com/devalok-design/shilp-sutra/issues/173))

- [#175](https://github.com/devalok-design/shilp-sutra/pull/175) [`39b593e`](https://github.com/devalok-design/shilp-sutra/commit/39b593edc830434e4f192f9f84801f32d59d09b0) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Auto-discover the docs MCP on install.

  On install the package now writes a project-scoped `.mcp.json` declaring the hosted docs MCP (`https://shilp-sutra.devalok.in/mcp`), so an AI coding agent (Claude Code / Cursor / Codex) discovers it right after `install` and the client prompts to approve it — no manual wiring. The write runs even on piped / non-TTY installs (exactly when an agent runs the install), unlike the human-facing welcome banner.

  Safety: additive merge (never clobbers other servers or an existing `shilp-sutra` entry), skips CI and dev installs, write-once via sentinel (a user who deletes `.mcp.json` is not re-nagged), never throws, and opt-out via `SHILP_SUTRA_NO_MCP=1` (or the existing `SHILP_SUTRA_NO_WELCOME=1`).

  `AGENTS.md` also now gives the one-line manual wire — `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp` — for agents that read the docs instead.

- [#178](https://github.com/devalok-design/shilp-sutra/pull/178) [`22a49a8`](https://github.com/devalok-design/shilp-sutra/commit/22a49a8c37de70d9b7243ec2defd8de846cde7f0) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **SegmentedControl visual rebuild.** Reconstructed to match the modern segmented-control pattern (iOS / shadcn / Radix), fixing the muddy "edge-soup" look (a bordered + inset-shadowed track under a ring-carrying pill thumb).

  - **Rounded-rect, not full pill** — track `rounded-ds-lg`, thumb `rounded-ds-md` (inner radius sits tighter inside the track).
  - **Single edge treatment** — track is a translucent recess (`--color-segment-track`) with no border and no inset shadow; the thumb defines its own edge with one ring-less soft shadow (`--shadow-segment`). New tokens added to `semantic.css`.
  - **Dark-mode fix** — elevation inverts in dark (faint lighter track fill), so the groove reads on near-black surfaces where a "sunken" darker track vanished.
  - **`fullWidth` prop (new)** — segments split the container equally instead of hugging content; use for full-width toggles and view switchers.
  - **Motion** — crisp bounce-free thumb glide (~300ms, reduced-motion aware) plus a `motion-safe` press-scale on each segment for tactile feedback.
  - **Canonical controlled/uncontrolled API (new)** — `value` / `defaultValue` / `onValueChange`, matching Tabs/ToggleGroup. Uncontrolled mode works with `defaultValue` (falls back to the first option).
  - **44px touch targets** — each segment now meets the WCAG touch minimum (`touch-target`) while keeping its dense visual height.
  - **Option `text` widened `string` → `ReactNode`** and made optional — segments can hold a count badge/custom node, or be icon-only.
  - **Icon-only segments** — set `ariaLabel` per option for the accessible name when `text` is omitted.
  - **RTL** — Arrow-key navigation tracks reading order (ArrowLeft → next, ArrowRight → previous) in a right-to-left context.
  - **Deprecated aliases** — `variant="default"` → `"soft"`, `selectedId` → `value`, `onSelect` → `onValueChange`. All old names still accepted at runtime; update call sites (removed in a future major).

  New tokens: `--color-segment-track`, `--color-segment-thumb`, `--shadow-segment`.

## 0.51.0

### Minor Changes

- [#171](https://github.com/devalok-design/shilp-sutra/pull/171) [`f273c89`](https://github.com/devalok-design/shilp-sutra/commit/f273c89ba947796c4b7c1fd18d26eab19cf0b159) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Card `default` variant is now **tonal** — depth from a surface-tone shift plus a whisper `border-card` hairline, no drop shadow. Previously `default` led with `shadow-raised`. This aligns the base `Card` primitive with the tonal card-edge direction the rest of the DS adopted in 0.50.0 (Setu `tonal-elevation`: depth from tone, not a shadow).

  **Visual change, not an API change.** No props, types, DOM structure, or ARIA changed — a `<Card>` with no `variant` now renders with a tonal hairline instead of a shadow. Cards that want the old floated look should pass `variant="elevated"` (shadow, no border). `outline` (strong border) and `flat` (no edge) are unchanged. `StatCard` inherits this via its delegated `variant`.

## 0.50.0

### Minor Changes

- [#168](https://github.com/devalok-design/shilp-sutra/pull/168) [`1ff5ded`](https://github.com/devalok-design/shilp-sutra/commit/1ff5ded2d56b6af4ecb3b53af47b8f5482d32f66) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Setu-requested components + DS-wide anti-slop pass.

  **New / enhanced components**
  - **`Diff`** (`./composed/diff`) — version-compare viewer wrapping jsdiff: inline / split / structured `fields` (JSON) modes, word-level intra-line highlights, collapse-unchanged, per-hunk accept/reject for review flows, and a compound API (`Diff.Root` / `Diff.Summary` / `Diff.Body` / `Diff.ColumnLabels`, `useDiff`).
  - **`RichTextEditor`** — new `format="markdown"` (bidirectional Markdown via `@tiptap/markdown`), slot composition (`RichTextEditor.Provider` / `.Toolbar` / `.Content`, `useRichTextEditor`), and a built-in source-view toggle (`sourceToggle`, controllable `sourceMode`/`onSourceModeChange`, `.SourceToggle` slot).
  - **`RadarChart`** — supports up to ~16 axes (auto radial labels + truncation past ~10), `target` benchmark ring, `onAxisClick` drill-down, and `axisDescriptions` hover tooltips.

  **Anti-slop DS pass (non-breaking)**
  - Typography migrated from size-only `text-ds-*` to the semantic ramp (`text-body-*` / `text-heading-*` / `text-label-*` / `text-caption`); heading weights now semibold (was regular).
  - New `--color-surface-border-card` token + `border-card` utility — a faint card-edge hairline applied to panel components (interactive-control edges keep their WCAG-contrast border).
  - Fixed `cn`/tailwind-merge to register the ramp utilities as `font-size` (they previously collided with text-colour utilities).

### Patch Changes

- [#166](https://github.com/devalok-design/shilp-sutra/pull/166) [`60c6ec9`](https://github.com/devalok-design/shilp-sutra/commit/60c6ec91712ca1fb5228b51f0b2c8888d3f2512c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix Themer output silently dropping the pasted brand override, and harden the agent theming contract.

  - **Themer CSS output no longer emits a nested `/* */` comment in its header.** CSS comments do not nest, so the inner `*/` closed the header early and the stray `*/` corrupted the `:root{}` block right after it — the entire accent ramp + radius override was silently dropped at build (a warning only, exit 0), so the fetched brand color never applied. Masked whenever the chosen color happened to match the package default.
  - **AGENTS.md theming recipe is explicit about the contract.** The `result.json` endpoint accepts only `archetype` or numeric `hue`/`chroma` — there is no `hex`/`color` param, and passing one is silently ignored (you get the default theme, wrong color, no error). The recipe now tells agents to convert a hex to OKLCH first, sanity-check the echoed `hue`/`chroma`, and verify the accent actually changed.
  - **`verify_setup` now flags nested CSS comments** so a dropped override is caught before it ships instead of failing silently.

## 0.49.5

### Patch Changes

- [#160](https://github.com/devalok-design/shilp-sutra/pull/160) [`595d0f8`](https://github.com/devalok-design/shilp-sutra/commit/595d0f88806b3ac8ec65e56b3aed63085ba918c0) Thanks [@rudraksharma016](https://github.com/rudraksharma016)! - Fix FormField/Label auto-association for every field control. Previously only `Input` adopted the `inputId` that `FormField` generates and `Label` points its `htmlFor` at, so `Textarea`, `Select`, `NumberInput`, `Combobox`, `Autocomplete`, and `ColorInput` rendered a `<label for>` targeting a non-existent element — leaving the control with no accessible name in the documented `<FormField><Label/><Control/></FormField>` pattern (WCAG 4.1.2 / 3.3.2).

  Each control now adopts `id = props.id ?? fieldCtx.inputId` on its labelable element (explicit `id` still wins), and `Combobox`/`ColorInput` let the visible `<Label>` provide the accessible name when inside a `FormField` instead of overriding it with the placeholder. `SearchInput` inherits the fix via `Input`. No public prop changes.

## 0.49.4

### Patch Changes

- [#156](https://github.com/devalok-design/shilp-sutra/pull/156) [`66341af`](https://github.com/devalok-design/shilp-sutra/commit/66341af8204cc7734a4a298bcea8c7ddf1121901) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Dependency maintenance: raise the `use-sync-external-store` floor to `^1.6.0` and refresh dev/peer toolchain (framer-motion 12.42, @tiptap 3.28, tailwind 4.3, vite 8.1, vitest 4.1.10, @typescript-eslint 8.65, storybook 10.5, date-fns 4.4). No API or behavior changes; peer-dependency ranges are unchanged.

## 0.49.3

### Patch Changes

- [#148](https://github.com/devalok-design/shilp-sutra/pull/148) [`876c410`](https://github.com/devalok-design/shilp-sutra/commit/876c4105e24e4afbd8d08f9b1bd11a3024ca2287) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix a runtime crash in consumer production builds caused by a minify-hoisting collision in the bundled Radix primitives (issue [#146](https://github.com/devalok-design/shilp-sutra/issues/146)).

  The shipped `dist/_chunks/primitives.js` contained a **block-scoped function declaration** inside the `usePointerDownOutside` handler (vendored `react-dismissable-layer`). Our own minifier gave that function the same mangled identifier as the `isPointerInsideReactTreeRef` ref. Under block scoping this is fine, but when a consumer's build downlevels the chunk, Annex-B semantics hoist the block-level function declaration to a function-scoped `var`, shadowing the ref for the whole handler — so the guard read `!ref.current` resolves to the hoisted-undefined function and throws `TypeError: Cannot read properties of undefined (reading 'current')` from a `document` pointerdown listener. Symptom: outside-click dismiss stops closing overlays (Dialog/Sheet/DropdownMenu/Popover/Select/etc.), producing rage-clicks. Reproduced across esbuild and terser; consumers could not fix it from their own config.

  Fix: emit the affected handlers as non-hoisting `const` arrows instead of block-level function declarations, in `react-dismissable-layer` and — defensively, same hazard class — `react-focus-scope`. Arrows are never Annex-B hoisted, so no consumer downlevel can alias them to a ref. Verified: the pre-fix minified shape throws the exact `[#146](https://github.com/devalok-design/shilp-sutra/issues/146)` error under sloppy/downlevel execution; the post-fix shape runs clean, and the rebuilt chunk gives the inner handler a distinct identifier after downlevel.

  No public API change.

## 0.49.2

### Patch Changes

- [#144](https://github.com/devalok-design/shilp-sutra/pull/144) [`bc3925e`](https://github.com/devalok-design/shilp-sutra/commit/bc3925e41b76c2c95f82d5359fead0daf21423d4) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - De-slop audit polish — removes AI-generated design "tells" flagged by an adversarial pass over the whole system (tokens + all components). No public API removed; two additive opt-in props added.

  **Reliability (the important one): content is now visible by default.** Several components started at `opacity: 0` and only appeared once a Framer entrance fired — so a backgrounded tab, a hydration stall, or a throttled animation engine could render them blank. Most alarming was `StatCard`'s primary value. Content no longer depends on an animation completing.
  - `StatCard`: new **`reveal?: boolean`** prop (default `false`). Off = value/label/progress render statically (content-safe). On = a subtle settle that never hides content. The old always-on roll-up (which strand-hid the number inside `overflow-hidden`) is gone.
  - `EmptyState`, `ActivityFeed`, chat `Message`, AI `Conversation` / `BlockRenderer` / stat-row: entrance reveals no longer gate opacity (pure fades → static; slides keep the slide, drop the opacity gating).
  - `Avatar` image no longer starts transparent.

  **Glow / bloom removal.**
  - `Button`: solid variants no longer bloom a colored `shadow-brand`/`shadow-error/success/warning` halo on hover. Kept the tonal `shadow-raised` base and the fill-deepen.
  - `Dot`: `pulse` now animates a contained fade on the dot itself instead of an expanding `animate-ping` glow ring.
  - `DevadootIcon`: removed the blurred-shape-copy glow layer (kept the gradient fill and shimmer).
  - `CommandBar`: removed the `blur(8px)` outer-glow copy behind the processing border (kept the animated border).

  **Motion polish.**
  - Removed hover-grow (`hover:scale-*`) on Combobox clear button, Slider thumb (kept the active/grab scale), ScheduleView event tiles, and AvatarGroup. `BottomNavbar` tap feedback is a press-shrink, not a lift.
  - `EmptyState` icon is a bare mark now (dropped the filled tile and the infinite bob).

  **Behavior change (minor, opt-out → opt-in):** `Badge` status dot no longer pulses by default. New **`dotPulse?: boolean`** prop (default `false`) restores it. A badge dot that previously pulsed will render static unless `dotPulse` is set.

## 0.49.1

### Patch Changes

- [#140](https://github.com/devalok-design/shilp-sutra/pull/140) [`7c9e498`](https://github.com/devalok-design/shilp-sutra/commit/7c9e498be000b30240901759b83da38b11c18bce) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix a build failure in Next.js/Turbopack (App Router / RSC) consumers.

  `0.49.0` shipped `dist/_chunks/primitives.js` with an internal cross-chunk
  export aliased to the JavaScript reserved word `in` (`export { Mo as in }`).
  That is legal ESM, but Next.js turns every export of a `"use client"` module
  into a `const` binding when generating its RSC client-reference proxy —
  emitting the illegal `export const in = …` and failing the consumer's
  `next build` with `Expected ident`.

  The reserved word came from the bundler minifying internal export names into a
  short base-N pool that includes reserved words. Set
  `rollupOptions.output.minifyInternalExports: false` so internal export aliases
  stay readable, valid identifiers. No public API change.

  Fixes [#139](https://github.com/devalok-design/shilp-sutra/issues/139).

## 0.49.0

### Minor Changes

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **`Breadcrumb` is now server-safe**, and `PageHeader` composes it.

  `Breadcrumb`'s only client dependency was the `Icon` component (its chevron/dots glyphs). Those are now inline SVGs, so `Breadcrumb` renders in a React Server Component with no `"use client"` boundary — import it directly in server components. API and markup are unchanged.

  `PageHeader` (itself server-safe) previously hand-rolled its breadcrumb trail (inline chevron SVG + raw `<a>`/`<span>`). It now composes the real `Breadcrumb` / `BreadcrumbList` / `BreadcrumbItem` / `BreadcrumbLink` / `BreadcrumbPage` / `BreadcrumbSeparator` — one breadcrumb implementation instead of two — while staying server-safe. `PageHeader`'s API is unchanged; the trail's colours now match the `Breadcrumb` component (links `surface-fg-muted` → `surface-fg` on hover; current page `surface-fg`).

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Added `Dot` — a composable status/indicator dot primitive** (`@devalok/shilp-sutra/ui/dot`), and consolidated the existing dots onto it.

  `Dot` is the shared low-level indicator: intent-coloured (`accent`/`success`/`warning`/`error`/`info`/`neutral`, plus `current` to inherit text colour), `size` (`xs`–`lg`), `variant` (`filled`/`ring`/`off` — `off` = faint fill + light border for inactive), a `withBorder` contrast ring (for busy/coloured backgrounds), `pulse` with `pulseSpeed` (slow/normal/fast), and an optional `label` with `labelPosition` (start/end) that makes it an announced `role="status"` (bare dots are decorative/`aria-hidden`). API informed by Chakra `Status.Indicator`, Ant `Badge status`, Mantine `Indicator`.

  Now used everywhere a dot appears, so there's one dot to style/animate:
  - **StatusBadge** now composes `<Badge variant="soft">` + `<Dot>` instead of re-styling its own pill (the leading dot is a static `<Dot>`, not a pulsing one — correct for settled statuses).
  - **StatusDot** is now a thin health-vocabulary wrapper over `<Dot>`.
  - **Badge**'s `dot` prop renders `<Dot color="current" pulse>` inside its entrance animation.
  - **Avatar**'s presence status dot renders `<Dot withBorder>` (colour from status; the wrapper keeps the online breathe + positioning + a11y). Internal only — Avatar's `status` API is unchanged; `offline` is now `neutral`-toned.

  **BREAKING (breaking-minor):**
  - `statusBadgeVariants` CVA export removed from `composed/status-badge` (StatusBadge composes Badge + Dot; no standalone CVA). Style via `<Badge>`/`<Dot>` props or `className`.
  - **`StatusDot` removed — merged into `Dot`.** Its states are now Dot prop-combos (the new `off` variant covers `inactive`): `healthy`→`<Dot color="success" pulse>`, `warning`→`<Dot color="warning">`, `critical`→`<Dot color="error">`, `neutral`→`<Dot color="neutral">`, `inactive`→`<Dot color="neutral" variant="off">`.

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **BREAKING (breaking-minor) — Progress redesigned as a compound component.**

  `Progress` is now a compound built for composition (structure after Ark UI / Chakra; multi-segment bars after Mantine), while the smart `<Progress value={70} />` form still covers the common cases.
  - New parts: `Progress.Root`, `Progress.Track`, `Progress.Indicator`, `Progress.Segment`, `Progress.Label`, `Progress.Value` (also exported as `ProgressRoot` … `ProgressValue`).
  - New props on the smart form: `label`, `max`, `segments` (multi-segment/multi-colour bars), `trackClassName`.
  - `Progress.Track` is the accessible progressbar; name it with `aria-label` or a `Progress.Label` + `aria-labelledby`.

  **Migrate:**
  - `showLabel` → `showValue`: `<Progress value={42} showLabel />` → `<Progress value={42} showValue />`
  - `color="default"` → `color="accent"` (or drop it — `accent` is the default). The type is now `"accent" | "success" | "warning" | "error"`.

  `StatCard`'s internal progress bar now composes `Progress` (keeping StatCard's own 90/70 thresholds); the toast upload bar uses `color="accent"`.

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Three consumer-reported fixes (all filed via the MCP `report_issue` tool).

  **Added — `ResponsiveModal` (composed).** One overlay that is a centered Dialog on desktop (md+) and a partial, content-height bottom sheet on mobile (<768px), built on the same accessible dialog primitive as `Dialog`/`Sheet`. Compound API: `ResponsiveModal` / `Trigger` / `Content` / `Background` / `Header` / `Title` / `Description` / `Body` / `Footer` / `Close`. Owns the parts consumers kept hand-rolling: a pinned header/footer, an internal scroll body (capped 85dvh desktop / 90dvh mobile), an optional full-bleed background slot painted at `-z-10` (with the close button correctly stacked above it), drag-to-dismiss on mobile, and optional iOS-style `snapPoints`. Prefer it over `DialogContent responsive`, whose mobile form is a full-screen takeover that leaves dead space under short content ([#115](https://github.com/devalok-design/shilp-sutra/issues/115)).

  **Fixed — `PageHeader` action overflow on mobile.** The `actions` slot was `shrink-0` inside a non-wrapping row, so a header with 2+ buttons overflowed a phone viewport and forced the page to pan sideways. The header row now wraps and the actions cluster drops onto its own line on narrow screens (pure CSS, still server-safe). Desktop layout is unchanged ([#133](https://github.com/devalok-design/shilp-sutra/issues/133)).

  **Fixed — mcp-manifest mis-attributed compound subcomponent props to the root.** The manifest emitter flattened the whole `## Props` section onto the root component, ignoring `### Subpart` headings — so a `numeric` prop belonging to `TableCell`/`TableHead`, an `href` belonging to `TableRowLink`, etc. all read as props of `<Table>`. An agent trusting the manifest wrote `<Table numeric>` / `<TableRow href>` and hit TS2322. Props under a `### Subpart` heading are now emitted under `subComponents[Name].props`, keyed by the owning subcomponent, across all 27 multi-part component docs. Manifest format bumped to 1.2.0 (additive); the hosted docs MCP `get_component` surfaces the new `subComponents` block ([#132](https://github.com/devalok-design/shilp-sutra/issues/132)).

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **ScheduleView cleanup.**
  - **BREAKING (breaking-minor):** the `ScheduleEvent.color` value `"primary"` was renamed `"accent"` to match the DS colour vocabulary used everywhere else. Migrate `{ color: 'primary' }` → `{ color: 'accent' }` (it was also the default, so untyped events are unaffected).
  - **a11y:** the time-slot cells and event blocks now show a focus-visible ring (they had hover states but no keyboard-focus indicator).
  - The hand-rolled current-time indicator dot now uses the shared `<Dot color="error" pulse>` (drops a bespoke scale-bounce animation).

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **BREAKING (breaking-minor) — unified validation state across all form controls.**

  Every form control now takes one prop, `state`, of one type — `FieldState = "default" | "error" | "warning" | "success"` (exported from `@devalok/shilp-sutra/ui`). Previously the same concept was spelled three different ways: `state` (Input/Textarea/NumberInput), `color` (Select), and an `error: boolean` (Checkbox/Switch). Radio and Combobox had no explicit prop at all. Precedence is consistent everywhere: an explicit `state` prop wins over `FormField` context.

  **Migrate:**
  - `<Checkbox error />` → `<Checkbox state="error" />`
  - `<Switch error />` → `<Switch state="error" />` (Switch's `color` prop is unchanged — it's the ON-track tint, not validation)
  - `<SelectTrigger color="error" />` → `<SelectTrigger state="error" />` (also `color="success" | "warning"` → `state=`)
  - `selectTriggerVariants({ color })` → `selectTriggerVariants({ state })` (the CVA axis was renamed)

  **Also in this change (additive, non-breaking):**
  - Checkbox/Switch/Radio gain `warning` + `success` tints (previously error-only).
  - Radio (`RadioGroup`) and Combobox gain an explicit `state` prop; both now also inherit validation state from `FormField` context (Select does too now — previously manual-only). Combobox renders a validation border for the first time.
  - New shared type `FieldState` + internal `resolveFieldState()` helper (`ui/lib/field-state`) — single precedence rule, replaces the per-component copies.
  - `InputState` and `NumberInputState` remain as `@deprecated` aliases of `FieldState`; no type-import breakage.

### Patch Changes

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Internal: extracted the controlled/uncontrolled open-state machine that was hand-copied across six overlays (`Dialog`, `Popover`, `Sheet`, `Tooltip`, `DropdownMenu`, `DropdownMenuSub`) into a single shared hook, `useControllableOpen` (`ui/lib/use-controllable-open`). No API or behavior change — one fix site instead of six.

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Token hygiene: replaced hand-typed pixel sizing with the equivalent `--spacing-ds-*`
  tokens across `src/ui` + `src/composed` (76 occurrences — e.g. `h-[16px]` → `h-ds-05`,
  `w-[64px]` → `w-ds-10`, `h-[1px]` → `h-px`). Rendered sizes are unchanged. Pixel
  values with no token on the scale (component-specific dimensions, off-scale layout
  sizes) are left as-is.

  Added a gate — `check-arbitrary-sizing` (a new pre-publish-audit gate + `pnpm
check:sizing`, wired into `verify`) — that flags any future `[Npx]` height/width
  whose value has a spacing token, so this doesn't drift back. Internal only; no
  consumer-facing API change.

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Our own composed components now follow the house soft-over-outline rule:
  `ConfirmDialog`'s Cancel button and `ErrorBoundary`'s "Try Again" button use
  `variant="soft"` instead of `variant="outline"`. `ConfirmDialog`'s confirm
  button now uses `Button`'s built-in `loading` prop (spinner + `aria-busy`)
  instead of swapping its label to "Processing…". No API changes.

- [#134](https://github.com/devalok-design/shilp-sutra/pull/134) [`df40f8f`](https://github.com/devalok-design/shilp-sutra/commit/df40f8f7a184c5486bfb1644b13feeb7396d504c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Added a dedicated `surface-chrome` surface tier for app chrome. `TopBar`,
  `Sidebar` (+ its variants), and `BottomNavbar` now paint `bg-surface-chrome`
  instead of `bg-surface-raised`, so chrome's surface is an explicit, independently
  tunable decision (the Carbon/Atlassian/Ant model) rather than coupled to the card
  surface. It's valued equal to `raised` (light `neutral-1` / dark `neutral-2`) —
  **zero visual change** — but can now diverge without affecting cards. Resolves the
  CLAUDE.md-vs-code surface-tier mismatch (audit finding [#7](https://github.com/devalok-design/shilp-sutra/issues/7)); the surface rule is
  updated accordingly.

## 0.48.0

### Minor Changes

- [#130](https://github.com/devalok-design/shilp-sutra/pull/130) [`ab68ecc`](https://github.com/devalok-design/shilp-sutra/commit/ab68ecc3a71bd6075e71c5b1ccf911f39afbccb7) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Emoji picker migrated to **frimousse** (native-only) and an install-"just works" accuracy pass across the optional-peer surface.

  **Breaking — emoji picker (frimousse migration).** The picker no longer supports non-native art styles (apple/google/twitter/facebook); everyone sees their own platform's native emoji. `@emoji-mart/react` still declares `peer react "^16.8 || ^17 || ^18"`, so React-19 consumers using `EmojiPicker`/`RichChatInput`/`RichTextEditor` previously hit a hard `ERESOLVE` on install — frimousse is React 18/19 native.
  - `set` / `theme` / `previewPosition` / `skinTonePosition` (EmojiPicker) and `emojiSet` (RichChatInput/RichTextEditor) are now **deprecated no-ops**; `EmojiSet` is retained for source compatibility.
  - Removed: the `emojiDataLoaders` export. Narrowed: `EmojiNodeAttrs` → `{ id, native }`; `EmojiSuggestionItem` (no `x`/`y`); `createEmojiSuggestion()` now takes no argument.
  - **Zero new peers:** frimousse and `@emoji-mart/data` (dataset for `:shortcode:` search — pure JSON, no React peer) are now **bundled** into a lazy `emoji` chunk. The emoji feature needs no consumer install and no `--legacy-peer-deps`. `@tiptap/*` was already bundled (it never needed to be a peer).
  - **Added:** the picker now has a built-in footer (hovered-emoji preview + skin-tone selector) and a new `emojibaseUrl` prop to self-host the emoji dataset (removes the runtime jsdelivr CDN dependency for strict-CSP / offline consumers).

  **Fixed — optional-peer / recipe accuracy.** The recipe `§2a` tables drifted from what components actually import. Now generated from source truth (each component's imports × the build's externalized set):
  - Added the missing peers: `sonner` (Toaster/Toast), `remark-gfm` (MarkdownViewer), `date-fns` (ScheduleView), `@tanstack/react-table` (DataTableToolbar).
  - Removed phantom install instructions for bundled deps (`@tiptap/*`, `@emoji-mart/*`) and trimmed `charts` to the 4 d3 packages it directly imports.
  - Recipes now warn that on **Vite 8 / Rolldown a missing peer does not fail the build** — it ships a bundle that throws `Could not resolve "…"` at runtime. Fixed the Vite recipe's `App.tsx` default-export mismatch and the stale TanStack detection row in the recipe index.

  No changes to non-emoji component APIs.

## 0.47.0

### Minor Changes

- [`4f20827`](https://github.com/devalok-design/shilp-sutra/commit/4f20827dcf9b9185c2b2078da1a26b83b5419d6f) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Add machine-readable optional-peer data and route AI agents through the MCP setup journey.
  - **`peers` field in `mcp-manifest.json`** — each component that imports an optional peer dependency (data-table, charts, date-picker, rich-text-editor, input-otp, file-preview, markdown-viewer) now carries a structured `peers: [...]` array, mirroring the recipe optional-peer table. Previously this lived only as prose in `gotchas`. The manifest emitter cross-checks the map against the gotchas so it can't silently drift, and the schema documents the field.
  - **AGENTS.md** — new "Setting up in a new project" section that routes agents through `detect_framework → get_setup → preflight → validate_snippet → verify_setup`, plus the hosted MCP URL so agents connect the live docs server instead of reading the frozen `node_modules` copy.
  - **Postinstall banner** — points at the live MCP (`https://shilp-sutra.devalok.in/mcp`) as the primary AI-agent assist; component count made evergreen.

  The hosted MCP server gains four setup-journey tools (`preflight`, `validate_snippet`, `detect_framework`, `verify_setup`) that read this data — they close the peer-dep cliff, silent TW4 dead-class, wrong-recipe, and mis-wired-config traps that break agent-driven installs. No consumer API change; the manifest addition is additive.

### Patch Changes

- [`a63a216`](https://github.com/devalok-design/shilp-sutra/commit/a63a216d12fd2c3ef067d2ed632c1e29a9c09527) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Rewrite the TanStack Start install recipe for the current Vite-plugin setup. The old recipe targeted the retired Vinxi era (`@tanstack/start`, `app.config.ts`, `@tanstack/start/config`) — that package is frozen at 1.120.x while the framework moved to `@tanstack/react-start` (1.168+) with a `vite.config.ts` `tanstackStart()` plugin, `src/routes/__root.tsx` using `createRootRoute` + `HeadContent`/`Scripts`, and CSS wired via a `?url` stylesheet in the root `head`. A consumer following the old recipe on current TanStack Start would hit a wall.

- [`c4e9b2f`](https://github.com/devalok-design/shilp-sutra/commit/c4e9b2fb857a301aa9047380fdd54d0f0ec98054) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Point the npm `homepage` field at the marketing site (`https://shilp-sutra.devalok.in`) instead of the Storybook build. The marketing site is the better first landing for npmjs.com visitors — it carries install commands, the Themer, and links out to Storybook and the docs.

## 0.46.0

### Minor Changes

- [#116](https://github.com/devalok-design/shilp-sutra/pull/116) [`7346724`](https://github.com/devalok-design/shilp-sutra/commit/7346724ba98d8030f42eaa354db50f066401f719) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Add Manrope as the display/heading face and make the design system own the heading font.

  **What changed**
  - Ships `Manrope-Variable.woff2` (OFL, latin variable, weights 200–800) with an `@font-face` declaration in `typography.css`.
  - `--font-display` moves from `"Inter", system-ui, sans-serif` to `"Manrope", "Inter", system-ui, sans-serif`.
  - The DS now binds the display face to headings, which it previously did not do:
    - `base.css` sets `font-family: var(--font-display)` on bare `h1`–`h6` (inside `@layer base`).
    - The `text-heading-{2xl…xs}` utilities now set `font-family: var(--font-display)`.
    - The `Text` component's `heading-*` variants now carry `font-display`.

  **Why**

  Until now `--font-display` was an orphan token — no shipped component or utility consumed it, so `<h1>` inherited the body face (Inter). Each consumer app wired its own heading font by hand. This makes Manrope the single DS-level default so heading typography is consistent across products without per-app wiring.

  **Behavioral change (read before upgrading)**

  Headings that previously rendered in Inter (the body default) now render in Manrope. This is a visible change, not an API change.
  - Apps that already set their own heading `font-family` in **unlayered** CSS (e.g. `app/globals.css` styling `h1–h6`, or a `next/font` variable applied to headings) are unaffected — their rule wins over the DS `@layer base` default. They opt into Manrope by removing that local wiring.
  - Ranade is **unchanged**: it remains `--font-accent` (the brand-moment face) and continues to drive `.prose-devsabha`. Body copy stays Inter.

  Manrope has no italic axis; italic display text falls back per the `@font-face` stack.

- [#111](https://github.com/devalok-design/shilp-sutra/pull/111) [`1f40f8b`](https://github.com/devalok-design/shilp-sutra/commit/1f40f8b6a3a7a59f18f49606c373a07e495bedeb) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Add `Surface` — the low-level elevated container primitive.

  Every mature design system ships one (MUI `Paper`, Carbon `Tile`, Chakra/Polaris `Box`) and builds its semantic Card on top; shilp-sutra had only the opinionated `Card` (gap-model padding, slots), so ~29 components hand-rolled `bg-surface-raised … shadow-raised` because there was nothing lighter to compose. `Surface` fills that gap.

  ```tsx
  import { Surface } from '@devalok/shilp-sutra/ui/surface'

  <Surface elevation="raised" padding="md">…</Surface>
  <Surface elevation="flat" bordered padding="sm">…</Surface>   // on-page tile
  <Surface asChild elevation="raised"><a href="/x">…</a></Surface>
  ```

  - `elevation`: `flat | raised | floating | overlay` (binds a surface-bg token to a shadow token)
  - `padding`: `none | sm | md | lg` (simple all-side — not Card's gap model)
  - `radius`: `none | control | surface | overlay | pill`
  - `bordered`: border-led edge; dev-warns if combined with a shadowed elevation (the double-edge anti-pattern)
  - `asChild`: render as the child element via Slot

  Server-safe. Additive only — no existing component changed. (Follow-ups: refactor `Card` to compose `Surface`, and migrate the hand-rolled surfaces.)

### Patch Changes

- [#110](https://github.com/devalok-design/shilp-sutra/pull/110) [`568db07`](https://github.com/devalok-design/shilp-sutra/commit/568db07b55f446d4bb7d00eaca4516bc1c137d9c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Round eight hard-coded font-sizes in Message and VideoPreview up to DS type-scale tokens (v0.44 followups item E). Chat sender name and message/edit bodies move `text-[13px]` → `text-ds-md` (14px); the chat timestamp and the video-preview timecode + playback-rate button move `text-[11px]` → `text-ds-sm` (12px).

  Rationale: peer systems closest to our use (Atlassian, IBM Carbon) hold a 12px legibility floor and carry no 11/13px step — chat body is primary reading text, so it takes the canonical `ds-md` body step rather than shrinking. Token utilities set font-size only in TW4, so line-heights are unchanged.

  Visible effect: chat text reads slightly roomier. The `badge-indicator` count pill intentionally keeps its 11px value — a decorative numeral in a fixed 18px pill, not body text, so the text floor doesn't apply. Non-breaking (no API change).

- [#110](https://github.com/devalok-design/shilp-sutra/pull/110) [`6d28c1c`](https://github.com/devalok-design/shilp-sutra/commit/6d28c1c672760c507e40e1d6d550d5fab902c5e5) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Motion compliance pass (anti-convergence v1.1 motion rules / locked decision B "settle, don't bounce").
  - **Reduced-motion guards (2):** the avatar online-status dot and the deadline-indicator overdue/critical state animate a continuous opacity pulse (`repeat: Infinity`). These are non-transform loops that framer's global `MotionConfig reducedMotion="user"` cannot stop, so they now self-guard with `useReducedMotion()` — reduced-motion users get the static variant (colour still signals status/urgency). No change for everyone else.
  - **Spring-overshoot retunes (6):** resting-state indicators that popped with `springs.bouncy` (ζ≈0.53, visible overshoot) now settle — radio dot and filter count → `springs.snappy`; count badge, avatar badge, and stat-card delta → `springs.smooth` (matching the delta's sibling, which was already smooth); multi-select selection check → `springs.snappy`.

  Deliberate-moment pops (toast completion icons, upload-success check, devadoot celebration) and gesture-following springs (segmented-control slider, attachment-strip layout) keep `bouncy` — the rule's allowed exceptions. Non-breaking (no API change).

- [#110](https://github.com/devalok-design/shilp-sutra/pull/110) [`cee32cf`](https://github.com/devalok-design/shilp-sutra/commit/cee32cf3f6e0c4b40775d422ea8c8d7702809ceb) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Compose base primitives instead of hand-rolling them (W6 compose-don't-re-roll).
  - **StatCard** loading state: three `bg-skeleton-base animate-pulse` divs → `<Skeleton>`.
  - **Avatar** loading state: hand-rolled placeholder that also used the wrong token (`bg-surface-raised-hover`); now `<Skeleton>` with the correct `bg-skeleton-base`. (Both Skeleton composes are visually identical — Skeleton defaults to the same `pulse` — and now inherit `motion-reduce:animate-none`.)
  - **DataTableToolbar** column/density/export controls: hand-rolled `<button>`s → `<Button variant="outline" color="neutral" size="sm">`. Standardizes on the real Button (correct hover token, focus ring, active state); horizontal padding steps from `px-ds-03` to Button's `px-ds-04`.

  Non-breaking (no API change).

## 0.45.1

### Patch Changes

- [#102](https://github.com/devalok-design/shilp-sutra/pull/102) [`4bcb70f`](https://github.com/devalok-design/shilp-sutra/commit/4bcb70f7fb3b4883f1338c36aaa82ea9a5da4437) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Fix five reported bugs:
  - **`ui/table-row-link` subpath now exported** ([#101](https://github.com/devalok-design/shilp-sutra/issues/101)). The `TableRowLink` dist file shipped in 0.45.0 but was missing from the `exports` map, so the documented `@devalok/shilp-sutra/ui/table-row-link` import threw `ERR_PACKAGE_PATH_NOT_EXPORTED`. Added the entry.
  - **`Message highlight="mention"` is visible again** ([#99](https://github.com/devalok-design/shilp-sutra/issues/99)). In 0.45.0 the mention row-tint was intentionally dropped in favor of the in-content `@token` — but the token styling only existed on the editor, never on the read-only `Message`, so mentions rendered flat. `Message` now styles in-content `.mention` tokens (accent tint), matching the editor. The row stays flat by design; use the styled `@token` for standout. Mention-token styling is now shared via a single `MENTION_TOKEN_CLASS` across the editor, chat input, and Message to prevent drift.
  - **`RichChatInput` mention callbacks no longer go stale** ([#92](https://github.com/devalok-design/shilp-sutra/issues/92)). `onMentionSelect` was captured once in the memoized extensions and never refreshed; it's now read through a live ref, matching the existing `enterBehaviorRef` pattern. The same fix was applied to the `mentions` list and `onMentionSearch` resolver (same stale-closure class), so swapping them mid-session now takes effect.
  - **`VideoPreview` keyboard rate shortcuts track the current rate** ([#91](https://github.com/devalok-design/shilp-sutra/issues/91)). `>` / `<` cycled from the mount-time rate (always 1×) because the keydown handler closed over stale state; playback rate is now read through a live ref.
  - **`Stepper` now has unit-test coverage** ([#93](https://github.com/devalok-design/shilp-sutra/issues/93)). Added the missing `stepper.test.tsx` (conformance + state derivation + `onStepClick` + `StepperContent`).

## 0.45.0

### Minor Changes

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`f5385b3`](https://github.com/devalok-design/shilp-sutra/commit/f5385b385a149167cf05f7a14d9f1991ed37ef0c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - AI docs overhaul: hosted MCP live, mcp-manifest.json ships, llms-full.txt/llms-quick.txt removed (BREAKING for doc-path consumers)
  - **NEW hosted MCP at `https://shilp-sutra.devalok.in/mcp`** — six read-only tools (`find_component`, `get_component`, `get_tokens`, `get_setup`, `upgrade`, `search_docs`). Every tool takes a `version` param; pass your installed version for version-exact props/tokens/migration answers. Connect: `claude mcp add --transport http shilp-sutra https://shilp-sutra.devalok.in/mcp`. Docs are served from published npm tarballs, so this release (0.45.0) is the coverage floor; `upgrade(from, to)` accepts older `from` versions as the migration path in.
  - **NEW `mcp-manifest.json`** at the package root — machine-readable component/token reference (122 components, 709 props, 281 tokens; react-docgen prop shape; schema in `mcp-manifest.schema.json`). The MCP's data source and the preferred structured read for agents without it.
  - **`llms.txt` is now a ~2.5K-token router** (llmstxt.org format): what exists + where to get detail. Prop tables and examples no longer live in it.
  - **REMOVED `llms-full.txt` and `llms-quick.txt`.** Fallback chain for MCP-less agents: `llms.txt` router → `docs/components/<tier>/<name>.md` (~3K tokens per component) → `mcp-manifest.json`. Tooling reading the removed paths must switch. See MIGRATION.md.
  - AGENTS.md, the bundled Agent Skill, and recipes updated to the MCP-first priority order. Composition data (compound parts, composes-with relations, contexts, anti-patterns) now parses from doc Composability sections into the manifest (grammar: `docs/specs/mcp-manifest-standard.md`).

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`9439e83`](https://github.com/devalok-design/shilp-sutra/commit/9439e83f8fb168f68596cce8bddd9480fae37871) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Card spacing becomes one CSS variable; CardBleed + horizontal cards; StatCard size axis; padding-fight cleanups

  **Card (`ui/card`):**
  - The `size` axis now assigns `--card-spacing` / `--card-gap` CSS variables; the container, all slots, `CardAction` corner insets, and the new `CardBleed` negations read the same pair. Rendered spacing is unchanged (sm 16/8, md 20/12, lg 24/16). `CardSizeContext` and the per-size class lookup maps are gone — slots work by CSS inheritance. Retune any card with a single override: `className="[--card-spacing:var(--spacing-ds-07)]"`.
  - **Added `<CardBleed side>`** (`x` | `top` | `bottom` | `y` | `all`) — full-bleed escape hatch that negates `--card-spacing`, the shilp-sutra equivalent of Radix Themes' `Inset` / Polaris `Bleed`. `top`/`bottom` inherit the card radius for cover media; `x` escapes a slot's inset for edge-to-edge bands. Direct children of Card are already full-width — don't use `x`/`all` there.
  - **Added `orientation="horizontal"` + `<CardSection>`** — sanctioned horizontal media card: the root becomes a padding-less row, the media pane owns the left edge, and `CardSection` re-establishes the py/gap rhythm from the same variables.
  - **Added** dev-only warning when Card receives bare text or textual elements (`<p>`, `<span>`, headings…) as direct children — the [#1](https://github.com/devalok-design/shilp-sutra/issues/1) "card padding looks broken" footgun (direct children get no horizontal inset by design).

  Compat: rendered pixels are identical; consumer `className` overrides on slots keep winning via tw-merge. Only CSS targeting the old literal classes (`px-ds-05b` on slots, `top-ds-05b` on CardAction) needs to move to the variables.

  **StatCard (`ui/stat-card`):**
  - **Added `size` prop** (`sm | md | lg`, delegated to Card). `sm` tightens padding to 16px and steps the value down to `text-ds-2xl` — for dense KPI rows and narrow stat grids.
  - Internal rhythm is now flex gap instead of stacked margins; `footer` renders behind a full-width rule instead of an inset `border-t`; loading skeleton gets `aria-busy`.

  **Padding-fight cleanups:** `NotificationPreferences` header no longer double-gaps (stale `pb-ds-04` removed); `DataTableCards` mobile rows compose `<Card size="sm">` instead of a hand-rolled 12px bordered box; Card stories/JSDoc and the make-kit spacing/surfaces guides no longer model `p-*` overrides on Card.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`13e6f5a`](https://github.com/devalok-design/shilp-sutra/commit/13e6f5a78f96a72f39ae82b00c5c591b0318be74) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Table: restore row separators, fix invisible hover, variable-driven density, card-edge alignment

  The original shadcn port had lost TableRow's `border-b` (rows rendered as an unseparated slab) and mis-mapped `hover:bg-muted/50` to `hover:bg-surface-raised` — the card background, so row hover was invisible on any table inside a Card. Fixed, plus a density pass benchmarked against Radix Themes / Carbon / Polaris / Mantine / MUI:
  - **Rows** regain a hairline separator (`border-surface-border-subtle`); hover is `surface-raised-hover`; selected stays `accent-3`.
  - **`density` prop on Table** (`compact | standard | comfortable`) sets `--table-py` → rows ≈ 29 / 37 / 45px (was 29 / 53 / 85 via DataTable's per-cell classes). Header height tracks density instead of a fixed 40px. DataTable forwards its existing `density` state; per-cell `cellPadding` context threading is gone.
  - **Edge alignment:** cells are `px-ds-04` interior; first/last cells read `--table-edge`, which inherits `--card-spacing` inside a Card — table columns line up with the card's header/footer slots. Standalone tables fall back to 12px.
  - **Header** drops to `text-ds-sm` medium muted — quieter than the data, per the cross-system consensus.
  - **`striped` prop** — opt-in zebra (faintest surface step); hairlines remain the default.
  - **Sweep:** sort-button + expander hover tokens fixed; expanded row is a `surface-base` recess; sticky header bg is `surface-raised`; raw `h-24` empty states replaced with `py-ds-07`.
  - **DataTableCards** (mobile) now `variant="outline"` — a phone screen of stacked shadow cards accumulates lift (make-kit dense-list rule).

  Visible default change: standard rows tighten from ~53px to ~37px.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`638fc28`](https://github.com/devalok-design/shilp-sutra/commit/638fc28000aa3c15bb16e1e920f146dda83ca37a) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Table structural features: TableRowLink, TableRowActions, numeric cells, animated + accessible row expansion
  - **`TableRowLink`** (`ui/table-row-link`) — whole-row navigation as a **real anchor**: cmd/ctrl+click, middle-click, and "open in new tab" work, and screen readers announce a link — none of which `onClick`-on-row gives. Stretch pseudo-element is anchored to the cell (Safari ignores `position:relative` on `<tr>`) and clipped by the table root's new `overflow-x-clip`. Keyboard focus draws a row-level ring (`has-[[data-slot=row-link]:focus-visible]` on TableRow). `stretch={false}` = title-only link that keeps row text selectable.
  - **`TableRowActions`** — action cluster revealed on row hover with the full a11y contract: opacity reveal (never `display:none`) so buttons stay permanently tabbable, `:focus-within` reveals on keyboard entry, always visible on touch (`pointer-coarse`), and a `persist` prop for always-visible mode. Reveal animates with `duration-fast-01 ease-productive-standard`.
  - **`numeric`** boolean on `TableCell`/`TableHead` — right-align + tabular figures in one prop.
  - **Row expansion (DataTable)** — `aria-expanded` now on the toggle button (was missing), visually-hidden header for the expand column, chevron rotation on motion tokens, and the expanded row animates open/closed (height + opacity, `springs.smooth`) with a `useReducedMotion` self-guard; virtualized tables keep the instant reveal.

### Patch Changes

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - ColorInput: replace the default preset palette. The old presets were the raw Tailwind-500 set (`#6366F1` indigo, `#8B5CF6` violet, `#3B82F6` blue, …) — the "AI framework-default palette" tell, mislabeled "color-blind accessible." New presets are derived from the design system's own OKLCH brand scales (led by red, not indigo/violet), so they read as one intentional family. Story/doc examples updated off the raw Tailwind hexes.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - FilePreview: the video seek, volume, and audio scrub controls are now keyboard-accessible. They were plain `<div role="slider">` with pointer handlers only — no keyboard, no forced-colors support (a WCAG break). They now compose a shared `MediaSlider` built on the Radix Slider primitive (Arrow / Home / End, focus ring, high-contrast), styled slim with a hover/focus-reveal thumb (white on the dark video overlay, accent on light). Users can now also drag to seek, not just click. (The audio bar's mouse-only hover-time tooltip was removed.)

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Separator: deprecate the `variant` prop and its `gradient` / `gradient-left` / `gradient-right` values. They were decorative (our anti-convergence layer flags decorative dividers) and never actually rendered in production — the class interpolated a runtime value (`linear-gradient(${deg}…)`) that the Tailwind 4 scanner can't emit, so it shipped as `bg-transparent`. Separator now always renders a solid hairline. The `variant` prop still type-checks (renders solid) and is removed in 0.45.0.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - SplitButton: the dropdown is now keyboard-accessible. It previously rendered a hand-rolled floating panel (`role="menu"`, positioned with `@floating-ui/dom`) that had no focus management, no arrow/Escape handling, and no focus return — keyboard and screen-reader users couldn't operate it (a broken ARIA contract). It now composes the DS **Popover** primitive: focus moves into the panel on open, Escape and outside-click dismiss, focus returns to the trigger, and on mobile it opens as a bottom sheet. The `dropdownContent` / `open` / `onOpenChange` / `placement` API is unchanged (the trigger now reports `aria-haspopup="dialog"`). Full menu semantics with arrow-key item navigation (via DropdownMenu) are planned for 0.45.0.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`9e92db4`](https://github.com/devalok-design/shilp-sutra/commit/9e92db489bded38dedca06a721c9d175f15e2ee5) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Table: footer + selected-hover fixes, rich-cell recipes
  - **TableFooter** background was `color-mix(surface-raised 50%)` — invisible on cards (same mis-mapped shadcn `muted/50` family as the row-hover bug). Now a `surface-base` band with a top hairline.
  - **Selected+hover** rows get an explicit step (`data-[state=selected]:hover:bg-accent-4`) — previously the hover and selected classes tied on specificity and stylesheet order decided.
  - **Cell recipes** documented in `table.md` + new `RichCells` / `SelectedRows` stories: user cell (avatar + truncating two-line identity — comfortable density only, per the industry two-line rule), tag group with `+N` overflow, money cells (consistent decimals; negatives never color-only), qualitative-numbers-stay-left, muted em-dash for empty values. Density→avatar mapping: compact = text only, standard = `xs`, comfortable = `xs`/`sm`.

- [#95](https://github.com/devalok-design/shilp-sutra/pull/95) [`c3287fe`](https://github.com/devalok-design/shilp-sutra/commit/c3287fe8a6de108adefee1690e5294ae6aed58fc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Remove the residual colored accent-rail tell from Toast, AI blocks, Schedule-view, and Chat mentions — extending the v0.44.0 Card decision (a colored side-stripe on a surface is the single most recognizable AI-generated-UI tell). Status/emphasis is now carried by the DS's own subtle surface (`bg-{status}-2`) plus a typed icon, dot, or token.
  - **Toast/Toaster:** the colored left rail is off by default; status is carried by the typed icon + the status-colored timer bar, and error toasts gain a faint `bg-error-2` surface tint. Opt back into the rail with `toast.error(msg, { showAccent: true })`.
  - **AI blocks:** low-confidence blocks now render a faint `bg-warning-2` wash + a "Low confidence" chip (via a shared `BlockShell`) instead of a warning left rail.
  - **Schedule-view:** calendar events drop the `border-l-[3px]` rail in favor of a solid category dot before the title (color-blind-safe, survives forced-colors).
  - **Chat:** `highlight="mention"` no longer tints/rails the message row — the mention is carried by the in-content `@`-token; a `data-highlight` attribute remains as a styling hook.

## 0.44.1

### Patch Changes

- [#89](https://github.com/devalok-design/shilp-sutra/pull/89) [`1760ba6`](https://github.com/devalok-design/shilp-sutra/commit/1760ba661179b44e07f6993dc3991a7788a5f06c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Add the missing `./ui/truncated-text` subpath export.

  0.44.0 shipped the new `TruncatedText` primitive in `dist/` and re-exported it
  from the package root (`@devalok/shilp-sutra` and `@devalok/shilp-sutra/ui`), but
  the granular subpath was never added to `package.json#exports`. As a result:

  ```ts
  import { TruncatedText } from '@devalok/shilp-sutra/ui/truncated-text'
  // -> Module not found, before 0.44.1
  ```

  Root-barrel imports were unaffected and continue to work. This patch restores
  parity with every other `./ui/*` component.

  To prevent recurrence, `pre-publish-audit.mjs` now gates on every flat
  `src/ui/*.tsx` component having a matching `./ui/<name>` subpath export (or an
  explicit barrel-only allowlist entry). The SSR smoke test iterates the exports
  map, so it now also imports `truncated-text` — closing the gap that let this slip.

## 0.44.0

<!-- breaking-summary:start -->

> ### ⚠️ Breaking in 0.44.0
>
> - `Card`: removed `accent` / `accentColor` (the colored edge-bar) — use `<CardAction>` for corner content or `color` for a tinted border.
> - `StatCard`: `surface` → `variant` (`raised`→`default`, `flat`→`outline`); now composes `<Card>`.
> - `ContentCard` deprecated — compose `Card` + slots directly (still ships; removal in a later minor).
>
> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.

<!-- breaking-summary:end -->

### Minor Changes

- [#87](https://github.com/devalok-design/shilp-sutra/pull/87) [`7abf33d`](https://github.com/devalok-design/shilp-sutra/commit/7abf33d26c04871e5cf8dc1c74be6b8892451bca) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Card system overhaul: gap-model padding, composable corner slots, a truncation primitive, and an anti-convergence sweep.

  **Breaking**
  - `Card`: removed `accent` / `accentColor` (the decorative colored edge-bar). Use `<CardAction>` for corner content or `color` for a tinted border. A colored rail on a bordered, shadowed card is an AI tell (make-kit rule [#6](https://github.com/devalok-design/shilp-sutra/issues/6)).
  - `StatCard`: renamed `surface` → `variant`, widened to a 4-way scale (`default` | `elevated` | `outline` | `flat`). StatCard now composes `<Card>`, so surface/padding/elevation live in one place. `surface="raised"` → `variant="default"`, `surface="flat"` → `variant="outline"`.
  - `ContentCard` deprecated (`@deprecated` JSDoc) — compose `Card` + `CardHeader`/`CardContent`/`CardAction` directly. Still ships; removal in a later minor.

  **Added**
  - `<CardAction>` — composable corner slot (4 placements, size-aware inset, optional `tuck` to align an icon button's glyph to the content edge). `Card` is now `relative` to anchor it.
  - `StatCard` `deltaPlacement="block" | "inline"` — inline rides the value's baseline for compact dashboards.
  - `<TruncatedText>` — text primitive with `end` / `clamp` / `middle` truncation and overflow-aware tooltip recovery (tooltip only when actually clipped; full string is always the accessible name). Applied across ~25 file/email/user-text/nav sites.
  - `--text-ds-2xs` (9px) micro-type token.

  **Changed (no migration)**
  - `Card` uses a gap-model layout — the container owns vertical padding + inter-slot gap; slots own only horizontal padding, so adding/removing a slot can't unbalance the bottom edge.
  - Replaced colored left-rails with tinted rows in `master-detail`, chat mention highlights, and sidebar active state (anti-convergence).
  - 12 hand-rolled button sites now compose `<Button>`; chat inline-edit composes `<Textarea>`.
  - Long filenames/emails/user names/nav labels truncate with recovery instead of wrapping or silently clipping. Re-baseline Chromatic if you snapshot the DS.

## 0.43.0

<!-- breaking-summary:start -->

> ### ⚠️ Breaking in 0.43.0
>
> - Anti-convergence surface & elevation pass — components no longer stack a visible border and a drop shadow on the same element (the DS's own make-kit Guidelines rule [#6](https://github.com/devalok-design/shilp-sutra/issues/6): the shadow tokens already carry a 1px ring).
>
> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.

<!-- breaking-summary:end -->

### Minor Changes

- [#82](https://github.com/devalok-design/shilp-sutra/pull/82) [`02d3826`](https://github.com/devalok-design/shilp-sutra/commit/02d3826fc82aff75a8f2a592b35cf38ff2aeec95) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Anti-convergence surface & elevation pass — components no longer stack a visible border and a drop shadow on the same element (the DS's own make-kit Guidelines rule [#6](https://github.com/devalok-design/shilp-sutra/issues/6): the shadow tokens already carry a 1px ring).

  **Breaking: `StatCard` `accent` prop removed.** The colored left-rail (`accent="success" | "error" | …`) is gone (it was the single most recognizable AI design tell — an accent rail on a rounded, shadowed card). Replace with the new accent system, or drop it (the `delta` already carries trend direction + colour):

  ```diff
  - <StatCard label="Revenue" value="$48k" accent="success" />
  + <StatCard label="Revenue" value="$48k" accentStyle="tint" />
  + <StatCard label="Revenue" value="$48k" icon={<IconCurrencyDollar />} accentStyle="icon" />
  ```

  **New — `StatCard` surface, accent & motion (all composable, all opt-in):**
  - `surface="raised" | "flat"` (default `raised`) — elevation-led (ring-in-shadow, no border) or border-led (border, no shadow).
  - `accentStyle="none" | "icon" | "tint"` (default `none`) + `iconFill="soft" | "solid"`.
  - `flash` + `flashSpeed` — opt-in entrance animation: a toned state glyph (`'up' | 'down' | 'goal' | 'record' | 'alert' | 'live'`, or `{ tone, icon }`) flashes, then settles to the metric's `icon`. Gated by `prefers-reduced-motion`.

  **New — `StatFlash` component.** The state→identity flash primitive used by StatCard's `flash`, exported standalone for use in list rows, badges, etc. Composable speed (`speed` preset + `holdMs` / `settleTransition` / `flashTransition` overrides).

  **Visual changes (non-breaking):**
  - Overlays (Dialog, AlertDialog, Popover, HoverCard, Dropdown/Context/Menubar menus, Select, Combobox, Autocomplete, NavigationMenu, Toast, ColorInput picker, SplitButton menu, DataTable bulk actions, floating Sidebar) drop their explicit `border`; the shadow's own ring carries the edge. `--shadow-floating` / `--shadow-overlay` ring strengthened (0.04 → 0.09); dark mode uses a light ring via the new `--shadow-edge-ring` token.
  - `Card` `default` / `elevated` are now ring-in-shadow (no border). Use `variant="outline"` for a border-led card.
  - `StatCard` base no longer stacks border + shadow.
  - `InputOTP` cells are border-led (dropped the redundant `shadow-raised`).

## 0.42.1

### Patch Changes

- [#80](https://github.com/devalok-design/shilp-sutra/pull/80) [`fb73847`](https://github.com/devalok-design/shilp-sutra/commit/fb73847bbea2ac496ec36f1552c93f621e4887c6) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Document the Figma Make kit shipped in 0.42.0:
  - `llms.txt` — new "NEW (v0.42.0)" entry pointing to `make-kit/` + the consumer setup walkthrough.
  - `AGENTS.md` — new "Figma Make" section so coding agents route users to the kit setup page when they ask about Figma Make.
  - README — Make-kit badge + section linking to https://shilp-sutra.devalok.in/figma-make.

  No code change. Tarball gains ~1 KB of docs.

## 0.42.0

### Minor Changes

- [#77](https://github.com/devalok-design/shilp-sutra/pull/77) [`c564477`](https://github.com/devalok-design/shilp-sutra/commit/c564477b247ffffef8e2ccb19660db694f49c219) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Ship Figma Make kit guidelines. New `make-kit/` directory in the published tarball at `node_modules/@devalok/shilp-sutra/make-kit/` containing:
  - `Guidelines.md` — top-level entry, product character + mandatory rules.
  - `setup.md` — install + provider tree + Vite config.
  - `foundations/` — 7 files (color, typography, spacing, surfaces, radius, motion, dark-mode, icons).
  - `components/overview.md` — catalog + decision trees across actions / inputs / overlays / feedback / nav / layout / data display.
  - `components/{button,card,input,dialog,badge,select,tabs,toast,form,table,dropdown-menu,popover,text,stack,icon}.md` — 15 component deep guides.

  Authored for Figma Make to consume when registering this package as a Make kit (per https://developers.figma.com/docs/code/bring-your-design-system-package/). Use these files as paste-in content when configuring the kit in Figma Make.

  New subpath exports: `@devalok/shilp-sutra/make-kit` → `Guidelines.md`, `@devalok/shilp-sutra/make-kit/*` → individual files.

  Smoke-tested in a fresh Vite 8 + React 19 + TW4 + framer-motion 12 app — build green, dev server clean, DS utilities emit. shilp-sutra is Figma Make kit eligible as of this release.

## 0.41.0

### Minor Changes

- [#72](https://github.com/devalok-design/shilp-sutra/pull/72) [`1bb9bd9`](https://github.com/devalok-design/shilp-sutra/commit/1bb9bd9bd6fb84672d0258c43233cf15907b86aa) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(release): ship a machine-readable `BREAKING.json` manifest

  Closes the structured-data half of devalok-design/shilp-sutra#62. AI agents and migration tooling can now answer "what breaks between X and Y?" programmatically instead of parsing CHANGELOG prose.

  ### What ships
  - **`packages/core/BREAKING.json`** — manifest of every breaking change per version, categorised: `moved` (import-path change), `narrowed` (prop type accepts less), `removed`, `renamed`, `notes`. Populated with the full 0.40.0 data: all 27 barrel→subpath moves + the 17-component Icon API narrowing (`React.ReactNode` → `IconInput`), with peer-dep and eslint-rule cross-refs on each move.
  - **`packages/core/BREAKING.schema.json`** — canonical JSON Schema for the manifest. Editors auto-validate via `$schema`.
  - **Two new subpath exports** — `@devalok/shilp-sutra/BREAKING.json` and `@devalok/shilp-sutra/BREAKING.schema.json`. Consumers can `import manifest from '@devalok/shilp-sutra/BREAKING.json'`.
  - **Tarball ships both files** (added to `files[]`).

  ### What the publish mechanism enforces
  - **New pre-publish-audit gate** (`scripts/validate-breaking-manifest.mjs`) — runs as part of every release:
    - manifest structurally valid (required fields, allowed fields, array shapes)
    - every `moved.to` path resolves against the current `package.json#exports` (catches stale manifest entries pointing at non-existent subpaths)
    - **discipline check:** if the current version's CHANGELOG section contains a breaking signal (`feat!` / `**Breaking.`) AND the manifest has no entry for that version → audit fails. Mirrors the `/publish-release` narrowing-is-breaking checklist with tooling teeth.

  ### Consumer usage

  ```js
  import manifest from '@devalok/shilp-sutra/BREAKING.json'

  const fromV = '0.39.0'
  const toV = '0.40.0'
  // Versions between fromV+1 and toV
  const breaksInRange = Object.entries(manifest.versions).filter(
    ([v]) => v > fromV && v <= toV,
  )
  // breaksInRange.flatMap(([_, e]) => e.moved) → every import-path change to apply
  // breaksInRange.flatMap(([_, e]) => e.narrowed) → every type narrowing to inspect
  ```

  Recipes (`docs/recipes/upgrading.md`), `AGENTS.md`, `llms.txt`, and `llms-quick.txt` now route agents at the manifest first, prose second.

  ### Why minor, not patch

  New tarball-shipped file + two new subpath exports = new public API surface. Per `CONTRIBUTING.md → Versioning`, any new public surface is a real semver event → minor under 0.x.

  ### What this does NOT cover
  - The `migrate` CLI from [#62](https://github.com/devalok-design/shilp-sutra/issues/62) item [#5](https://github.com/devalok-design/shilp-sutra/issues/5) — deferred. The eslint plugin's `migration` preset already does the mechanical autofixes; a CLI wrapper that reads `BREAKING.json` is a future build.
  - Backfill of pre-0.40.0 breaking changes — added on demand, not retroactively (per the existing codemod policy).

### Patch Changes

- [#48](https://github.com/devalok-design/shilp-sutra/pull/48) [`513ea40`](https://github.com/devalok-design/shilp-sutra/commit/513ea408dbbc57c020c0777d60cf1c8b860120c3) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - docs(recipes): fix Next.js App Router cold-install friction surfaced by dogfood test

  A cold-install dogfood test against `pnpm create next-app@latest` on Next 16.2.6 + Turbopack + React 19.2 + pnpm 10.30 (2026-05-25) surfaced seven friction points in `install-next-app-router.md`. Recipe still worked end-to-end, but every friction point was a place an AI agent could trip naively. This release updates the recipe.

  ### What changed
  - **Added "Tested on" matrix** at the top of the recipe so agents know the exact stack we last verified against.
  - **`src/app/globals.css` is now listed as the priority-1 location** for the global CSS file (Next 14+ default; was priority-2 in the old recipe).
  - **§ 4b now explicitly tells agents to replace the entire scaffold `globals.css`**, not just append. The scaffold writes `:root` color vars, an `@theme inline` block linked to Geist font vars, a `prefers-color-scheme` block, and a `body { font-family: Arial }` block — any of which can silently override shilp-sutra tokens.
  - **§ 5 calls out Turbopack** as the Next 16 default and confirms `transpilePackages` is respected.
  - **§ 3 PostCSS step rewritten** to say "verify or create" — Next 14+ scaffolds the correct file. Agents were burning cycles re-creating it.
  - **§ 6 layout.tsx replacement now explicitly lists the scaffold lines to remove** — `next/font/google` Geist imports, the `${geistSans.variable}` className on `<html>`, and the `min-h-full flex flex-col` className on `<body>`. Naive agents kept the Geist imports running alongside shilp-sutra's fonts.
  - **§ 7 page.tsx replacement notes the scaffold's existing Vercel marketing layout** so agents know they're replacing real content.
  - **§ 8 gotchas adds three new entries**:
    - Scaffold's `body { font-family: Arial }` wins the cascade over shilp-sutra fonts if kept (most common silent break).
    - Auto-generated `pnpm-workspace.yaml` from pnpm 10+ — harmless standalone, broken inside a monorepo.
    - Auto-generated `AGENTS.md` from `create-next-app` uses `<!-- BEGIN:nextjs-agent-rules -->` markers; shilp-sutra's use `<!-- BEGIN:shilp-sutra-agent-rules -->` — they coexist, but worth knowing.

  ### Why patch, not minor

  Recipe content updates that clarify existing setup do not widen public API surface. They make the same recipe land successfully on more environments. No new exports, no behavior change, no new dependency.

## 0.40.1

### Patch Changes

- [#64](https://github.com/devalok-design/shilp-sutra/pull/64) [`9c91ca6`](https://github.com/devalok-design/shilp-sutra/commit/9c91ca6d804e97c96bdcf74c2303ad6469c73446) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - docs: correct the F-10 Icon API "non-breaking" label — it is a narrowing for `React.ReactNode` props

  The 0.40.0 changelog + `MIGRATION.md` described F-10 (Icon API unification) as **"Non-breaking. Type widening only. Every call site that compiled before keeps compiling."** That is wrong for the 14 components whose `icon` prop was previously `React.ReactNode`.

  `IconInput` is `React.ReactElement | React.ComponentType<{ className?; size? }> | null | undefined` — it **excludes** `string`, `number`, and iterables that `React.ReactNode` allows. So for any component that was on `ReactNode`, 0.40.0 is a type **narrowing**, not a widening. A consumer who stores icons in a `Record<string, React.ReactNode>` map or a `icon?: React.ReactNode` field and passes them to `CommandItem.icon`, `ActivityItem.icon`, or `Chat.Message.Avatar` fails `tsc` on 0.40.0 even though the runtime JSX is valid.

  Reported by the karm-v2 consumer agent (devalok-design/shilp-sutra#61) — 3 call sites broke. Build-time only, no runtime impact, trivial fix (retype the icon source to `React.ReactElement`), but the "non-breaking" label let an initial low-risk assessment form before the break was discovered.

  This patch corrects the wording in `MIGRATION.md → v0.40.0` and `llms.txt` to "mostly non-breaking, one narrowing" with the exact retype fix and affected props. No code change.

## 0.40.0

<!-- breaking-summary:start -->

> ### ⚠️ Breaking in 0.40.0
>
> - feat!: barrel peer-cliff cleanup — remove 12 hard-peer re-exports from `/ui`, `/composed`, `/ai`, `/ai/blocks` barrels
>
> See [`MIGRATION.md`](../../MIGRATION.md) and `docs/recipes/upgrading.md` before bumping.

<!-- breaking-summary:end -->

### Minor Changes

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`eb20cc0`](https://github.com/devalok-design/shilp-sutra/commit/eb20cc097cc09ed8bec7bd206acf9a86d2eed906) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: F-10 — Icon API unification across 22 components (single `IconInput` type)

  **Non-breaking.** Type widening only. Every call site that compiled before keeps compiling.

  ## Why

  Before this release the design system had **6 distinct prop type signatures for the same conceptual "icon"** across 22+ icon-accepting components: `React.ReactElement`, `React.ReactNode`, `React.ReactNode | ComponentType<{className}>`, `ComponentType<{className}>`, `IconProps['icon']`, and (in Toast internals) `ForwardRefExoticComponent<any>`. Consumers had to memorize per-component conventions. Stories drifted. Five separate `iconSizeMap` declarations cropped up across component sources. Dual-detect logic was duplicated in EmptyState + StatCard. Twenty-three of twenty-five components silently ignored size context.

  ## What changed

  ### Foundation (new exports)

  ```ts
  import type { IconInput } from '@devalok/shilp-sutra/ui/lib/icon-input'
  import { normalizeIcon } from '@devalok/shilp-sutra/ui/lib/normalize-icon'

  type IconInput =
    | React.ReactElement
    | React.ComponentType<{ className?: string; size?: number | string }>
    | null
    | undefined

  function normalizeIcon(
    input: IconInput,
    fallbackSize?: IconSize,
  ): React.ReactNode
  ```

  `normalizeIcon` passes React elements through, wraps Tabler-shaped forwardRef refs in `<Icon icon={…} />` (so they participate in `IconContext`), and renders plain function components directly. Falls through to `null` for `null`/`undefined`. 16 vitest tests cover all branches + the type compatibility surface.

  ### Consumer-facing API: every icon prop accepts all four shapes

  ```tsx
  <Button startIcon={<Icon icon={IconPlus} />}>OK</Button>   // canonical
  <Button startIcon={<IconPlus />}>OK</Button>                // raw Tabler element
  <Button startIcon={IconPlus}>OK</Button>                    // component ref
  <Button startIcon={<span>+</span>}>OK</Button>              // custom node
  ```

  ### 22 components migrated

  | Layer          | Components                                                                                                                                                                                                           |
  | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | ui (P1)        | Button, IconButton                                                                                                                                                                                                   |
  | ui leaf (P2)   | Badge, Combobox, SegmentedControl, Stepper, StatCard, TreeItem (TreeNode.icon), OAuthButton (icon + linkedIcon)                                                                                                      |
  | chat + ai (P3) | Chat.Message.Avatar, Chat.Message.Action, Chat.SystemMessage, AIConversation (agent.icon), AICommandProvider (agent.icon), CommandBar (item.icon)                                                                    |
  | composed (P4)  | EmptyState (kill dual-detect), BulkActionBar (loosen from IconProps['icon']), ActivityFeed, CommandPalette                                                                                                           |
  | shell (P5)     | TopBar (UserMenuItem + TopBar.IconButton), Sidebar (NavItem + NavSubItem + footer.promo — three sites collapsed to one), BottomNavbar, AppCommandPalette (SearchResult.icon), CommandRegistry (CommandPageItem.icon) |

  ### Internals collapsed
  - 5 duplicate `iconSizeMap` declarations across Badge/Combobox/EmptyState/StatCard/etc. → one shared `<IconProvider size={token}>` pattern at each call site
  - 2 duplicate dual-detect branches (`isValidElement(icon) || '$$typeof' in icon`) → one shared `normalizeIcon()` helper
  - `React.createElement(icon, {className})` workarounds across EmptyState/StatCard → call through `normalizeIcon`

  ### Strict-to-loose newly-accepted call sites
  - `SegmentedControl options[*].icon` previously rejected `<IconX />` instantiated elements (only accepted bare component refs)
  - `BulkActionBar actions[*].icon` previously rejected non-Tabler nodes
  - `Chat.Message.Action.icon` previously required `IconProps['icon']` strict Tabler shape
  - All three now accept `IconInput`

  ### Tests
  - 16 new tests in `src/ui/__tests__/normalize-icon.test.tsx` covering all four input shapes, IconProvider context propagation, type compatibility, and the `React.isValidElement` vs forwardRef vs plain-function-component decision tree.
  - `src/composed/empty-state.test.tsx` rewritten to assert px-rendered sizing via `IconProvider` (the new contract) instead of className-based sizing (the old leak).

  ### Not in this patch
  - **Toast internal icons** (`TOAST_TYPE_CONFIG.icon`) keep their sonner ForwardRefExoticComponent shape. Internal config, not a consumer prop — out of scope.
  - **Stories cleanup** (remove `className="h-4 w-4"` overrides from `.stories.tsx`) — voluntary, behavior unchanged.
  - **`pre-publish-audit` Icon API gate** — deferred. The current test coverage + typecheck catches regressions for now.

  ## Closes
  - tbf-tracker F-10 (Icon API consistency) — full scope. Promoted from "accept both at edges" to deep three-layer unification (type alias + normalizer + per-component IconProvider).

  ## Migration checklist for consumers
  1. **Nothing required.** All existing call sites continue to compile.
  2. **Voluntary cleanup:** delete `className="h-4 w-4"` (or similar) overrides on icon prop usages — `IconProvider` now sizes correctly via context.
  3. **New API in your own wrappers:** import `IconInput` + `normalizeIcon` for components that accept icons-like props.

  See `MIGRATION.md → v0.40.0` for the full per-component before/after.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`a2596bd`](https://github.com/devalok-design/shilp-sutra/commit/a2596bdb206502ac5dc868ca1fd764b77006ef6c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: F-18 `llms-quick.txt` + F-10 P7 stories cleanup + F-10 P8 Icon API audit gate + StatusBadge migration

  Three small wins finishing Wave 5.

  ## F-18 — `llms-quick.txt` ships in the npm tarball

  New file `packages/core/llms-quick.txt` (~4.5K tokens, 247 lines). Strict slice of `llms.txt` covering setup, peer-cliff matrix, hard constraints, Icon API contract, import-path cheatsheet, two-axis variant system, shadcn-difference table, top 30 components quick-ref, server-safe list, and the 13-symptom troubleshoot index. Fits in one Read call on every major AI agent (Claude Code, Cursor, Codex, Aider) without truncation.

  `AGENTS.md` updated to route agents to `llms-quick.txt` first, then `llms.txt` (~27K tokens), then `llms-full.txt` (~140K tokens) on demand.

  New pre-publish-audit gate `llms-quick.txt ≤ 15K tokens (≈60KB)` blocks future drift — if the slice creeps past the budget, the file loses its read-in-one-shot value and the audit forces a re-trim.

  ## F-10 P7 — stories cleanup

  Removed redundant `className="h-4 w-4"` icon overrides from stories that serve as docs:
  - `combobox.stories.tsx` — five `icon: <IconUser className="h-4 w-4" />` patterns simplified to `icon: <IconUser />`. `IconProvider` now sizes the icon from Combobox's size context, no className needed.
  - `Introduction.mdx` — Tabler icons section rewritten to teach the canonical `<Icon icon={X} />` shape + the IconInput contract (all four shapes work), replacing the old `<IconX className="h-4 w-4" />` recommendation.

  `toggle.stories.tsx`, `toggle-group.stories.tsx`, and other `.stories.tsx` files with `className="h-4 w-4"` were left alone — they pass icons as children (not as props), where className is the right escape hatch.

  ## F-10 P8 — pre-publish-audit Icon API gate

  New gate `Icon-prop components import normalize-icon`. Scans `src/{ui,composed,shell,ai}/**/*.{ts,tsx}` for any component declaring `icon`, `startIcon`, `endIcon`, `leftIcon`, or `rightIcon` as a prop. Requires that the file imports `normalize-icon` OR appears on an explicit allowlist.

  Allowlist (13 entries) covers:
  - Internal sonner pass-through (`toast.tsx`)
  - Type-only exports that don't render (`use-tree.ts`, `command-registry.tsx`, `ai-command-provider.tsx`)
  - Components forwarding icon props to another component that normalizes (`bulk-action-bar.tsx` → Button, `app-command-palette.tsx` → CommandPalette)
  - Internal Tabler config dicts (`error-boundary.tsx`, `priority-indicator.tsx`)
  - TipTap extension components with deliberately distinct shapes (`slash-command.tsx`, `rich-chat-input.tsx` ChatToolbarItem)
  - The `Icon` component itself and `IconButton` (routes through Button)

  Future component additions with an icon-shaped prop fail audit until either migrated or allowlisted with a reviewable comment.

  ## Plus — StatusBadge missed in Wave 5, migrated

  The audit gate caught `composed/status-badge.tsx` declaring `icon?: React.ReactNode` without going through `normalize-icon`. Migrated. `StatusBadge.icon` now takes `IconInput`; the trailing icon slot wraps in `<IconProvider size="xs">{normalizeIcon(icon)}</IconProvider>`. Consumer-facing call sites unchanged.

  ## Closes
  - tbf-tracker F-18 (`llms-quick.txt` for AI-agent read-cap fit)
  - tbf-tracker F-10 P7 (stories cleanup, voluntary surface)
  - tbf-tracker F-10 P8 (audit gate against drift)

  ## Skipped intentionally
  - **CLI (F-15)** — analysis showed ~25% of consumers benefit; the same engineering hours invested in F-18 / better recipes / Themer integration ship higher-leverage wins. Tracked for re-evaluation in 6 months once we have install telemetry.

  Wave 5 complete: F-10 (Icon API), F-11 (ESLint plugin), F-18 (quick file), F-22 (Toaster runtime warn) → subsumed by F-11's `prefer-per-component-import`, F-23 (TW3→TW4 codemod) → subsumed by F-11's autofix rules. F-15 (init CLI) deferred.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`4c2b111`](https://github.com/devalok-design/shilp-sutra/commit/4c2b111174762b50d9a3c146c8c062bf0af0605c) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(ui): add `OAuthButton` — brand-aware social/login buttons

  A purpose-built component for "Sign in with X" flows that previously had to be
  hand-assembled from `Button + IconBrandGoogle`. The Tabler-glyph approach had
  no shared copy convention across providers, no per-provider loading state, and
  no row pattern. This component bakes in the conventions that matter for
  conversion (brand colours, "Last used" hint, helper copy, iconOnly rows,
  linked-state for settings pages).

  New exports from `@devalok/shilp-sutra/ui/oauth-button`:
  - `OAuthButton` — composes on `Button`, inherits async/loading/sizes.
    - 13 providers: `google` `apple` `github` `microsoft` `x` `linkedin`
      `facebook` `discord` `slack` `gitlab` `sso` `email` `passkey`
    - `intent`: `continue` (default) / `signin` / `signup` drives the label.
    - `appearance`: `brand` (provider colour) / `outline` (DS neutral) /
      `dark` (unified Apple-style across all providers).
    - `icon` — drop in a brand-multicolour SVG to replace the default glyph.
    - `iconOnly` — square button with provider name kept in `aria-label`.
    - `compact` — short label (`"Google"` not `"Continue with Google"`).
      `aria-label` keeps the long form for screen readers. Good under an
      explicit "Or sign in with" divider.
    - `lastUsed` — inline right-edge pill rendered inside the button. The
      stronger conversion pattern is to combine this with `OAuthGroup`'s
      `reorderLastUsedFirst`, which promotes the provider to position 0.
    - `helperText` — reassurance copy below.
    - `data-provider` attribute for analytics.
    - **Dark-mode uniformity:** every brand appearance lands on the same DS
      surface in dark mode — brand identity comes from the glyph, not the
      background — so rows stay visually coherent.
  - `OAuthGroup` — stacked layout wrapper with consistent spacing.
    Optional `reorderLastUsedFirst` pulls a `lastUsed` child to position 0
    (Stripe-style ordering — a stronger conversion lever than a visual badge).
  - `OAuthDivider` — `or`-style horizontal rule between OAuth and email form.
  - `OAuthConnectionRow` — settings-page row representing a linked provider
    with Disconnect / (re-)Connect action.

  Default glyphs are sourced from `@tabler/icons-react` (already a peer dep).
  Pass `icon={<YourBrandSvg />}` to replace any glyph — useful when you want a
  provider's official multicolour mark from their own brand-guidelines page.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`da368f0`](https://github.com/devalok-design/shilp-sutra/commit/da368f01bd62480a0a6896f1bad4b09f9d8d12ea) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat!: barrel peer-cliff cleanup — remove 12 hard-peer re-exports from `/ui`, `/composed`, `/ai`, `/ai/blocks` barrels

  **Breaking.** Twelve symbols that statically `import` optional peer dependencies have been removed from their parent barrels. Every symbol remains fully available via its per-component subpath. Search-and-replace migration is one line per symbol; full table in `MIGRATION.md` under `v0.40.0 — Barrel peer-cliff cleanup`.

  ## Why

  `peerDependenciesMeta.<peer>.optional = true` was a lie at the bundler level: barrels statically re-exported components whose source files contained top-level `import 'sonner'`, `import 'date-fns'`, `import { OTPInput } from 'input-otp'`, `import { useEditor } from '@tiptap/react'`, etc. Fresh consumer doing `import { Text } from '@devalok/shilp-sutra/ui'` without those peers installed → `Module not found: Can't resolve '<peer>'` at `next build` / `vite build` / `astro build`. Surfaced repeatedly across `tbf-tracker` (F-02), `hiring-platform`, and karm-v2.

  Tree-shaking can't drop a static import if the resolver fails first. Lazy-importing moves the failure to runtime, which is worse. Removing the barrel re-export is the only fix.

  ## What moved

  | Symbol family                                                                                                                                         | Old barrel          | New per-component subpath                                     | Peer pulled                                                       |
  | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
  | `InputOTP*`                                                                                                                                           | `/ui`               | `/ui/input-otp`                                               | `input-otp`                                                       |
  | `toast`, `formatFileSize`, `Toast*`                                                                                                                   | `/ui`               | `/ui/toast`                                                   | `sonner`                                                          |
  | `Toaster`, `ToasterProps`                                                                                                                             | `/ui`               | `/ui/toaster`                                                 | `sonner`                                                          |
  | `DatePicker`, `DateRangePicker`, `DateTimePicker`, `TimePicker`, `CalendarGrid`, `MonthPicker`, `YearPicker`, `Presets`, `useCalendar` + all `*Props` | `/composed`         | `/composed/date-picker`                                       | `date-fns`                                                        |
  | `EmojiPicker`, `EmojiPickerPopover` + types                                                                                                           | `/composed`         | `/composed/emoji-picker`                                      | `@emoji-mart/data`, `@emoji-mart/react`                           |
  | `EmojiNode`, `EmojiNodeAttrs`                                                                                                                         | `/composed`         | `/composed/extensions/emoji-node` (**new subpath in 0.40.0**) | `@tiptap/*`                                                       |
  | `createEmojiSuggestion`                                                                                                                               | `/composed`         | `/composed/extensions/emoji-suggestion` (**new subpath**)     | `@tiptap/*`                                                       |
  | `FilePreview` + types                                                                                                                                 | `/composed`         | `/composed/file-preview`                                      | `react-pdf`, `react-zoom-pan-pinch`                               |
  | `MarkdownViewer` + types                                                                                                                              | `/composed`         | `/composed/markdown-viewer`                                   | `react-markdown`, `react-syntax-highlighter`, `remark-gfm`        |
  | `RichChatInput`, `AudioPlayer`, `AudioWaveform`, `useVoiceRecorder` + types                                                                           | `/composed`         | `/composed/rich-chat-input`                                   | `@tiptap/*`                                                       |
  | `RichTextEditor`, `RichTextViewer` + types                                                                                                            | `/composed`         | `/composed/rich-text-editor`                                  | `@tiptap/*`                                                       |
  | `BlockRenderer`, `BlockRendererProps`                                                                                                                 | `/ai`               | `/ai/block-renderer`                                          | `react-markdown`, `remark-gfm` (transitive via Text/Error blocks) |
  | `ErrorBlock`                                                                                                                                          | `/ai`, `/ai/blocks` | `/ai/blocks/error` (**new subpath**)                          | `react-markdown`, `remark-gfm`                                    |
  | `TextBlock`                                                                                                                                           | `/ai`, `/ai/blocks` | `/ai/blocks/text` (**new subpath**)                           | `react-markdown`, `remark-gfm`                                    |

  Seven other AI blocks (`BlockTable`, `ConfirmBlock`, `DividerBlock`, `InfoBlock`, `LoadingBlock`, `StatRowBlock`, `SuccessBlock`) are peer-cliff-free and stay in both `/ai` and `/ai/blocks` barrels.

  ## Per-chart subpaths added (non-breaking)

  New: `/ui/charts/area-chart`, `/ui/charts/bar-chart`, `/ui/charts/chart-container`, `/ui/charts/gauge-chart`, `/ui/charts/line-chart`, `/ui/charts/pie-chart`, `/ui/charts/radar-chart`, `/ui/charts/sparkline`. The `/ui/charts` barrel still works and still pulls all 9 d3-\* peers. Per-chart subpath pulls only the d3-\* peers that specific chart needs — `BarChart` = `d3-scale` + `d3-axis` + `d3-selection`; `PieChart`/`RadarChart` = `d3-shape` only. Documented in `llms.txt` as the preferred form for d3-conscious consumers.

  ## Build / packaging
  - `packages/core/vite.config.ts` — 8 new chart entries + 4 new ai/composed peer-cliff entries added to `explicitEntries`.
  - `packages/core/package.json#exports` — 12 new subpath entries (4 newly-added per-cliff + 8 per-chart).
  - No change to `peerDependenciesMeta` — peers stay `optional`. The lie was elsewhere.

  ## What didn't change
  - Component APIs, prop signatures, types, runtime behavior, default styles, accessibility.
  - Per-component subpaths that already existed in 0.39.x — consumers already importing per-component need zero changes.
  - Stories, tests, internal DS imports — all use relative paths, none were ever affected.

  ## Impact
  - `tbf-tracker` (fresh-consumer audit, 18 findings) — closes F-02 (`input-otp` cliff) + F-03 (per-chart subpaths). Other findings tracked separately.
  - `hiring-platform` — closes F-22 (silent sonner peer) docs angle; runtime warning still scheduled for Wave 4.
  - `karm-v2` 0.37→0.40 upgrade — uses `DatePicker`, `toast`, `Toaster`, `MarkdownViewer`, `RichTextEditor`. Estimated 80-120 line touchpoints; mostly one-line `from '@devalok/shilp-sutra/composed'` → `'@devalok/shilp-sutra/composed/date-picker'` etc. Migration recipe in MIGRATION.md.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`5605a76`](https://github.com/devalok-design/shilp-sutra/commit/5605a760663f6d4dfaf69d7c8d7aaf0b0240cb2a) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: polymorphic types for `Text`, `Stack`, `Container` — element-specific attrs now typecheck

  Components with an `as` prop now widen their accepted props based on the
  rendered element. Previously the `as` prop accepted any element at runtime
  but TypeScript only allowed props of the default element (`<p>` for `Text`,
  `<div>` for `Stack` + `Container`).

  ## Before

  ```tsx
  import { Text } from '@devalok/shilp-sutra/ui/text'

  // Runtime: works. TypeScript: ERROR.
  ;<Text as="label" htmlFor="email">
    Email
  </Text>
  //                ^^^^^^^ Property 'htmlFor' does not exist on type
  //                        '... & Omit<ComponentPropsWithRef<"p">, ...>'.
  //                        Did you mean 'for'?
  ```

  Same shape for `<Stack as="ul" role="list">`, `<Container as="main" aria-label>`.

  ## After

  All `as`-prop components now use a polymorphic type signature that preserves
  the generic across the call site. Element-specific attrs (`htmlFor` on
  `<label>`, `href`/`target` on `<a>`, `aria-label` on `<nav>`, etc.) typecheck
  correctly.

  ```tsx
  <Text as="label" htmlFor="email">Email</Text>      // OK
  <Text as="a" href="/x" target="_blank">link</Text> // OK
  <Stack as="ul" role="list">items</Stack>           // OK
  <Stack as="nav" aria-label="primary">items</Stack> // OK
  <Container as="main" aria-label="main">…</Container> // OK
  ```

  Default behavior unchanged — `<Text>`, `<Stack>`, `<Container>` without `as`
  keep their original element + accept original attrs.

  ## Why not just use the generic at the impl?

  `React.forwardRef` can't keep a generic parameter live across its return
  type — at the call site, `T` would be erased to the default. Fix is the
  standard polymorphic-component cast pattern (Radix, Mantine, Chakra all use
  the same shape):

  ```ts
  type TextComponent = <T extends React.ElementType = 'p'>(
    props: TextProps<T> & { ref?: React.ComponentPropsWithRef<T>['ref'] }
  ) => React.ReactElement | null

  const TextImpl = React.forwardRef<HTMLElement, TextProps>(...)
  const Text = TextImpl as unknown as TextComponent
  ```

  Runtime: identical. Types: strictly wider.

  ## Files
  - `packages/core/src/ui/text.tsx` — `TextComponent` cast added; `as?: React.ElementType` → `as?: T`.
  - `packages/core/src/ui/stack.tsx` — `StackComponent` cast added.
  - `packages/core/src/ui/container.tsx` — `ContainerComponent` cast added.
  - `packages/core/src/ui/__tests__/polymorphic-types.test.tsx` — new
    11-test typetest suite using Vitest's `expectTypeOf` covering `<label>`,
    `<a>`, `<nav>`, `<ul>`, `<main>`, `<section>`. Includes a
    `@ts-expect-error` regression check that `htmlFor` on `<p>` (the default
    for `<Text>`) still errors — we widen, we don't break.

  ## Breaking

  None. Strictly accepts more valid code. Existing code that typechecks today
  keeps typechecking.

  ## Closes
  - tbf-tracker F-01 — `<Text as="label" htmlFor="...">` and
    `<Stack as="ul">` now typecheck.

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`7eb7799`](https://github.com/devalok-design/shilp-sutra/commit/7eb77993cd4e12437b8fab75ca4fc73a752b3cfc) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: Wave 4 — agent-friendly install experience

  Three changes that make the package easier to onboard for both human developers and AI coding agents (Codex, Cursor, Copilot, Aider, Claude Code, Windsurf, …):

  ## AGENTS.md ships inside the npm tarball

  The repo-root `AGENTS.md` is now copied into the package at publish time and is available to consumers at `node_modules/@devalok/shilp-sutra/AGENTS.md`. The 25+ tools that auto-discover `AGENTS.md` from a project root (Codex, Cursor, Copilot, Aider, Windsurf, Devin, Jules, Gemini CLI, Zed, Warp, JetBrains Junie, …) will now also find ours alongside the recipes.

  AGENTS.md is reframed as purely consumer-facing: "how to use shilp-sutra in a downstream app". Maintainer-internal docs (build pipeline, audit gates, internal patterns) stay in the repo-root `CLAUDE.md` and are not shipped.

  > Anthropic Claude Code doesn't auto-load AGENTS.md yet — symlink it (`ln -s AGENTS.md CLAUDE.md`) or copy the contents into your own CLAUDE.md so the same rules apply.

  Files: `packages/core/package.json#files` now includes `AGENTS.md`; `packages/core/scripts/copy-root-docs.mjs` copies repo-root AGENTS.md → `packages/core/AGENTS.md` at build time (gitignored, identical to the existing MIGRATION.md flow).

  ## `agents` field per npm-agentskills convention

  `packages/core/package.json` now declares an `agents` field per the [npm-agentskills](https://github.com/onmax/npm-agentskills) spec:

  ```json
  {
    "agents": {
      "skills": [{ "name": "shilp-sutra", "path": "./skill" }]
    }
  }
  ```

  Consumers running `pnpm dlx @codemcp/agentskills export` (or `pnpm dlx agentskills export --target claude`) will auto-discover the bundled skill and copy it into `.claude/skills/`, `.cursor/skills/`, `.github/skills/`, etc. No package-specific install command needed — opt into the emerging cross-tool convention.

  The existing manual paths (`cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra` and the curl installer) still work and are documented as fallbacks in the README.

  ## Pretty postinstall welcome banner

  `packages/core/scripts/welcome.mjs` (new) prints a Devalok-branded ASCII-lotus + setup hint when consumers install the package for the first time per major.minor:

  ```
  ╭───────────────────────────────────────────────────────────────╮
  │         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                 │
  │         ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠟⠹⣧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀                 │
  │              … (13-row Braille lotus) …                       │
  │                                                               │
  │   ✦  @devalok/shilp-sutra  0.40.0                             │
  │      Tailwind 4 design system · 110+ components · RSC-safe    │
  │                                                               │
  │   ▸ Setup recipe (pick your framework):                       │
  │     node_modules/@devalok/shilp-sutra/docs/recipes/           │
  │                                                               │
  │   ▸ Theme it in 30 seconds:                                   │
  │     https://shilp-sutra.devalok.in/themer                     │
  │                                                               │
  │   ▸ Wire your AI agent (Claude Code / Cursor / Codex):        │
  │     cp -r node_modules/@devalok/shilp-sutra/skill \           │
  │        ~/.claude/skills/shilp-sutra                           │
  │                                                               │
  │   Disable this banner: SHILP_SUTRA_NO_WELCOME=1               │
  │                                                               │
  │   Built by Devalok · devalok.in                               │
  ╰───────────────────────────────────────────────────────────────╯
  ```

  ### Safety guards (all silent failures, never throws)
  - `process.env.CI` set → silent
  - `process.env.SHILP_SUTRA_NO_WELCOME=1` → opt-out
  - `process.env.NO_COLOR` → strip ANSI
  - `process.stdout.isTTY === false` → silent (piped builds, Docker)
  - `npm_config_loglevel === 'silent'` → silent
  - `INIT_CWD` absent OR inside the package itself → silent (dev install)
  - Sentinel `node_modules/.shilp-sutra-welcomed` carries the version → re-fires only on version change
  - Terminal narrower than 70 cols / shorter than 28 rows → falls back to 6-line compact banner
  - Try/catch wraps everything → consumer install can never break because of this script

  ### Preview mode for maintainers

  `node packages/core/scripts/welcome.mjs --preview` (or `--compact`) bypasses all guards. Used to verify rendering before publish.

  ### Note for pnpm consumers

  Modern `pnpm` blocks postinstall scripts on dependencies by default for supply-chain safety. First-time pnpm consumers will see:

  ```
  WARN  postinstall scripts blocked — run `pnpm approve-builds` to allow
  ```

  …then the banner appears on the next install. `npm`/`yarn`/`bun` consumers see it immediately. This is the modern pnpm contract — same shape as `esbuild`, `sharp`, `husky`, etc.

  ## Updated troubleshoot.md

  New symptom entry: `Cannot find module 'sonner' / 'input-otp' / 'date-fns' / '@tiptap/react' / …`. Table maps each Wave-2 peer-cliff component to the install command. Counts ticked: 13 symptoms total (was 12).

  `<Toaster />`'s JSDoc also gained an ⚠ peer-required callout — IDE hover shows the `pnpm add sonner` hint inline.

  ## What this patch does NOT include
  - **F-22 runtime warning when Toaster mounts without sonner** — not achievable. `toaster.tsx` static-imports sonner, so if the peer is missing the file never loads and runtime code never runs. Replaced with louder JSDoc + the new troubleshoot table above.
  - **Consumer AGENTS.md mutation (F-17)** — deferred to Wave 5 init CLI. No file mutation in postinstall.

  ## Closes
  - tbf-tracker F-08a (ship AGENTS.md in tarball)
  - tbf-tracker F-08b (postinstall hint — implemented as pretty banner)
  - tbf-tracker F-16 (skill discoverability — via npm-agentskills convention)
  - hiring-platform F-22 (sonner peer surface — JSDoc + troubleshoot, runtime warn not possible)

### Patch Changes

- [#57](https://github.com/devalok-design/shilp-sutra/pull/57) [`f63e869`](https://github.com/devalok-design/shilp-sutra/commit/f63e8698f325ae7ecfef600c538f686092716d67) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - docs(recipes/llms/skill/AGENTS): close docs drift surfaced by three downstream consumer audits

  Three independent consumer audits against 0.39.0 landed in the last 48 hours
  (`tbf-tracker`, `hiring-platform`, `karm-v2` [#44](https://github.com/devalok-design/shilp-sutra/issues/44)). None reported runtime or
  type bugs — every finding was a documentation gap, a stale claim, or an AI
  agent following a doc rule that produced no-op churn. This patch fixes the
  documentation-only subset. No component code, types, runtime behavior, peer
  deps, or exports changed — safe to install over 0.39.0 with zero consumer
  edits.

  **Recipes** (`packages/core/docs/recipes/`)
  - All six install recipes (Next App Router, Next Pages, Vite, Astro, Remix,
    TanStack Start) now carry a `2a. Optional peer dependencies` table with
    exact `pnpm add` commands for `d3-*` (charts), `@tanstack/react-table` +
    `@tanstack/react-virtual` (DataTable), `date-fns` (date pickers), `@tiptap/*`
    (RichTextEditor), `input-otp`, `react-pdf` + `react-zoom-pan-pinch`
    (FilePreview), `react-markdown` + `react-syntax-highlighter`
    (MarkdownViewer), `@tabler/icons-react`. The README's "Optional Peer
    Dependencies" section existed but the per-framework recipes never linked
    to it — AI agents following the recipe linearly only discovered missing
    peers at the first `next build` failure.
  - `install-next-app-router.md` §1 — dropped stale "OR `pages/` exists with
    only `_app`/`_document`" clause. `create-next-app@16+` no longer scaffolds
    `pages/` for App Router projects.
  - `install-next-app-router.md` §8 — `p-3` vs `p-ds-03` rule reworded. DS
    spacing tokens (`p-ds-04`) and TW4 numeric scale (`p-4`) coexist by design
    per `tokens/semantic.css:68` — both are valid. The previous "use p-ds-04,
    not p-4" framing was pushing consumers (and their AI agents) into
    churn-PR territory. Explicitly say "do NOT mass-codemod" now.

  **`llms.txt`** (`packages/core/llms.txt`)
  - New "IMPORT PATH CHEATSHEET" section enumerating the exact subpath for
    every component whose import path is NOT the kebab-case of its name
    (`FormField` → `ui/form`, `AppSidebar` → `shell/sidebar`, charts barrel,
    date-picker family, AI primitives, motion primitives, hooks). Fresh AI
    agents no longer have to guess and hit a TS error before learning the
    truth.
  - `IconButton` entry rewritten to make the `icon=` prop vs `children`
    constraint loud: type omits `children` deliberately, raw
    `<IconButton><Icon /></IconButton>` is a TS error, correct form is
    `<IconButton icon={<Icon icon={X} />} aria-label="…" />`. Surfaced by
    hiring-platform's "discovery cost: I tried `children` first" note.
  - `toast` entry rewritten to spell out the positional signature
    `toast.success(message, options?)`. Previously implied object-first API
    (Mantine / Chakra-style), which hiring-platform reporter assumed and got
    wrong. Concrete examples for `success`, `error` with `description`,
    `promise`, `upload`. Reminder that calls without a mounted `<Toaster />`
    are no-ops.

  **Root docs**
  - `README.md`: troubleshoot.md tagline `8 most common breakages` → `12 most
common` (file actually has 12 `## Symptom:` headers).
  - `AGENTS.md`: line 64 "barrel will fail in RSC contexts" rewritten. With
    all peers installed Next 16 honours each per-file `"use client"` and the
    barrel works in RSC — what it does fail on is the peer-dep cliff
    (`input-otp` in `src/ui/index.ts:49`, etc.). New wording covers both:
    "Per-component imports keep RSC fast AND avoid peer-dep cliffs … the
    barrel forces hard peers to be installed AND inflates the client bundle.
    Existing barrel usage is not an emergency." Closes karm-v2 [#44](https://github.com/devalok-design/shilp-sutra/issues/44) sub-A.
  - `AGENTS.md`: line 65 "Use `p-ds-04`, not `p-4`" rewritten — explicit
    coexistence stance, "do NOT mass-codemod". Matches the design intent in
    `tokens/semantic.css:68`. Closes karm-v2 [#44](https://github.com/devalok-design/shilp-sutra/issues/44) sub-B.
  - `AGENTS.md`: troubleshoot tagline → "twelve most common breakages" with
    matching list (Tailwind tokens, framer-motion duplicates,
    `transpilePackages`, CSS import order, dark mode, RSC errors, font 404s,
    hydration, missing optional peer deps, bare `shadow`, missing
    `<Toaster />`, Storybook MCP 404).

  **Agent Skill** (`skills/shilp-sutra/SKILL.md` + bundled
  `packages/core/skill/SKILL.md`)
  - `metadata.version` `0.38.0` → `0.39.0` to match shipped package version.
    Skill had drifted one release behind.
  - Description "eight most common breakages" → "twelve most common".
  - New `scripts/sync-skill-version.mjs` chained into `pnpm version-packages`
    (`changeset version && node scripts/sync-skill-version.mjs`). Future
    changeset bumps now auto-update both skill source and bundled copy.

  **CI gate** (`scripts/pre-publish-audit.mjs`)
  - New gate: `skill/SKILL.md metadata.version matches
packages/core/package.json#version`. Checks both
    `skills/shilp-sutra/SKILL.md` (source) and `packages/core/skill/SKILL.md`
    (build artifact). Blocks future drift recurrence.

  **Investigated, no code change needed**
  - `hiring-platform` reported "Button height is more than Input height in
    comparable sizes". Verified via Playwright @2x against fresh storybook
    build: heights identical at every size (xs=28, sm=32, md=40, lg=48) and
    border-radii identical (`rounded-control` = 6px everywhere). Both
    components use the same `h-ds-*` and `rounded-control` semantic role
    tokens — confirmed across source, fresh build, and pixel measurements.
    Original observation was against a stale local storybook-static built
    before commit `e698df94` (shape-presets radius unification). Closed
    without code change.

  **What this patch does NOT cover** (tracked for 0.40.0 / 0.41.0)
  - Build / packaging: F-02 (barrel `input-otp` static-export drop), F-03
    (per-chart d3 split) → Wave 2.
  - Type system: F-01 (polymorphic Text/Stack generic loss) → Wave 3.
  - Agent integration: F-08a/b (ship AGENTS.md in tarball, postinstall hint,
    optional managed-block injection into consumer AGENTS.md), F-22
    (`<Toaster />` runtime warning when sonner missing) → Wave 4.
  - DX tooling: F-10 (icon API consistency), F-11 (eslint plugin — now
    open-question per F-19 coexistence stance), F-15 (init CLI), F-18
    (`llms-quick.txt` split), F-23 (TW3→TW4 codemod) → Wave 5.

  Each remaining finding will be its own changeset.

## 0.39.0

### Minor Changes

- [#46](https://github.com/devalok-design/shilp-sutra/pull/46) [`df0589c`](https://github.com/devalok-design/shilp-sutra/commit/df0589c186b0f671d4dd84e60029e97340f1899e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(skill): ship as an [Agent Skill](https://agentskills.io)

  Adds a bundled Anthropic Agent Skill at `skills/shilp-sutra/` (and inside the npm tarball at `node_modules/@devalok/shilp-sutra/skill/`) so AI coding agents — Claude Code, Cursor, Codex, Aider, and anything else that speaks the Agent Skills open standard — can load shilp-sutra's setup playbooks, component API, theming cookbook, RSC import patterns, and troubleshoot tree on demand.

  **Why:** Consumers reported that the design system was hard to onboard onto — you had to drill into each Storybook section to discover what was available, and there was no single drop-in for AI agents. The skill is one install away from full coverage:

  ```bash
  curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash
  ```

  **Layout:**
  - `skills/shilp-sutra/SKILL.md` — entry, navigation, hard constraints (~135 lines)
  - `skills/shilp-sutra/references/` — bundled cheatsheet (`components.md`), full reference (`components-full.md`), six setup playbooks, brand customization, RSC matrix, troubleshoot tree
  - `skills/shilp-sutra/install.sh` — one-liner installer (sparse fetch from GitHub)
  - `skills/shilp-sutra/README.md` — marketplace listing for skills.sh-style directories
  - `skills/shilp-sutra/LICENSE` — MIT

  **Single source of truth:** `scripts/build-skill.mjs` regenerates `skills/shilp-sutra/references/` from `packages/core/llms.txt`, `packages/core/llms-full.txt`, and `packages/core/docs/recipes/*.md`. The pre-publish audit gates on drift (`build-skill.mjs --check`) and on spec compliance (name format, description ≤1024 chars, body ≤500 lines per [agentskills.io](https://agentskills.io/specification)), so the skill cannot ship out of sync.

  **npm tarball:** `packages/core/scripts/copy-skill.mjs` runs in the post-build pipeline and copies the skill tree into `packages/core/skill/`. Declared in `files[]`, so `cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra` works after any `pnpm add @devalok/shilp-sutra`.

  **No runtime changes.** Package exports, peer deps, and CSS/component APIs are unchanged.

- [#46](https://github.com/devalok-design/shilp-sutra/pull/46) [`df0589c`](https://github.com/devalok-design/shilp-sutra/commit/df0589c186b0f671d4dd84e60029e97340f1899e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat(tokens, ui): semantic radius roles + `[data-shape]` shape presets

  **Why:** Roundness is a brand axis (sharp = technical, rounded = consumer). Until now consumers could nudge individual `--radius-ds-*` primitives, but the components themselves baked in ad-hoc per-size radii — Button md (10px) was rounder than Button sm (6px), Input lg (10px) was rounder than Button lg (16px) at the same height, SegmentedControl's "pill" wasn't actually pill, Tooltip drifted from the rest of the overlay tier. This release makes radius role-based and consumer-customizable in one shot.

  **What's new:**
  1. **Eight semantic radius role tokens** in `packages/core/src/tokens/semantic.css` — `--radius-control`, `--radius-control-inner`, `--radius-surface`, `--radius-overlay-sm`, `--radius-overlay`, `--radius-overlay-lg`, `--radius-pill`, `--radius-bubble`. Components reference these, never the primitive `--radius-ds-*` scale.
  2. **Three shape presets** via `[data-shape]` attribute — set on `<html>` or any subtree:
     - `sharp` — 2/4/6 px (technical, dev-tool feel — Vercel/Linear/terminal)
     - `slightly-rounded` (the default if no attribute is set) — 6/10/16 px (modern SaaS — shadcn/Stripe)
     - `rounded` — 10/16/24 px (friendly, consumer — iOS/Notion)
  3. **Per-token overrides still work.** Consumers can override any role token globally or scoped:
     ```css
     :root {
       --radius-control: 4px;
     }
     .checkout {
       --radius-control: 8px;
       --radius-surface: 20px;
     }
     ```
  4. **Pre-publish audit gate.** `pre-publish-audit.mjs` now fails publish if any `rounded-ds-*` or bare `rounded-full` leaks back into `src/ui/**/*.tsx`. Use the role tokens. The gate is scoped to `src/ui/` only; `composed/` and `shell/` migration is the next release.

  **Breaking visual changes (no API breaks):** all changes are class-name swaps in the source; component prop APIs are unchanged. But consumers WILL see these on upgrade:

  | Component                | Before                | After                                | Why                                                     |
  | ------------------------ | --------------------- | ------------------------------------ | ------------------------------------------------------- |
  | Button md                | 10px                  | 6px                                  | Killed per-size radius scaling — same role, same radius |
  | Button lg                | 16px                  | 6px                                  | Same as above                                           |
  | Button icon-lg           | 10px                  | 6px                                  | Same as above                                           |
  | Input lg                 | 10px                  | 6px                                  | Now matches Button lg (was inconsistent)                |
  | Tabs trigger (contained) | 10px                  | 6px                                  | Now matches Button (was inconsistent)                   |
  | SegmentedControl item    | 10px                  | 9999px                               | Renamed pill is now actually pill                       |
  | Menubar trigger          | 2px                   | 6px                                  | Now matches DropdownMenu item (was inconsistent)        |
  | Autocomplete listbox     | 6px                   | 10px                                 | Now matches Popover/DropdownMenu (was inconsistent)     |
  | ChatMessage bubble       | rounded-ds-2xl (24px) | rounded-bubble (24px → preset-aware) |
  | Everything else          | unchanged             |

  **If you preferred the chunkier old look:** set `data-shape="rounded"` on your app root to get the v0.38-era feel back for big controls. Or override `--radius-control: 10px` to keep that one value at the old size.

  **Migration:**

  ```diff
  - <html lang="en">
  + <html lang="en" data-shape="slightly-rounded">  <!-- optional, this is the default -->
  ```

  To go sharp:

  ```diff
  - <html lang="en">
  + <html lang="en" data-shape="sharp">
  ```

  **Files touched:** semantic.css (tokens + 3 preset blocks), 100+ source files migrated across `src/ui/`, `src/composed/`, `src/shell/`, `src/ai/`, `src/motion/` (~480 replacements via `scripts/migrate-radius-roles.mjs`), 7 component tests updated to match new class names, `apps/site/` fully migrated and now sets `data-shape="slightly-rounded"` on `<html>`, pre-publish-audit.mjs gate covers the whole package, customize-brand.md recipe rewritten, new Storybook story `Foundations/Shape Presets`.

  **Coverage:** complete adoption across the published package. Token showcase stories (`forced-colors.stories.tsx`, `FoundationsShowcase.tsx`) are intentionally allowlisted — they demonstrate the primitive scale and must continue to render at fixed values.

- [#46](https://github.com/devalok-design/shilp-sutra/pull/46) [`df0589c`](https://github.com/devalok-design/shilp-sutra/commit/df0589c186b0f671d4dd84e60029e97340f1899e) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - feat: public-launch release — Agent Skill + marketing site

  **Agent Skill (`@devalok/shilp-sutra`):** a fully bundled [Agent Skills](https://agentskills.io)-compatible skill ships in the npm tarball at `node_modules/@devalok/shilp-sutra/skill/` and in the repo at `skills/shilp-sutra/`. AI coding agents — Claude Code, Cursor, Codex, Aider, and any other tool that speaks the open standard — can install once and load setup playbooks, component APIs, theming patterns, and troubleshooting on demand:

  ```bash
  # Personal install
  curl -fsSL https://raw.githubusercontent.com/devalok-design/shilp-sutra/main/skills/shilp-sutra/install.sh | bash

  # Or, after installing the package:
  cp -r node_modules/@devalok/shilp-sutra/skill ~/.claude/skills/shilp-sutra
  ```

  The skill is **built from** the package's own documentation (`llms.txt`, `llms-full.txt`, `docs/recipes/`) by `scripts/build-skill.mjs`. Pre-publish audit gates on drift (`build-skill.mjs --check`) and on spec compliance (name format, description ≤1024 chars, body ≤500 lines per [agentskills.io](https://agentskills.io/specification)), so the skill cannot ship out of sync.

  **Marketing + docs site (shilp-sutra.devalok.in):** a Next.js 15 + Tailwind 4 site eats its own dog food — built entirely from shilp-sutra components. Hosted on Railway. Includes:
  - Landing page with framework-aware install snippets and the Agent Skill one-liner front-and-centre
  - `/components` — browseable index of all 119 components, parsed from `docs/components/*.md`, grouped by layer (UI primitives / composed / shell), with search and filter
  - `/docs/[slug]` — rendered recipes from `packages/core/docs/recipes/` (single source of truth — site reads the same files that ship in the tarball)
  - Dark mode, OKLCH brand tokens, framer-motion animations
  - Storybook stays at `devalok-design.github.io/shilp-sutra` for now; will move to a subpath in v2

  **No runtime changes to the package.** Component APIs, peer deps, and CSS unchanged. This release is additive: skill bundle + new docs surface.

  **Site repo layout:**

  ```
  apps/site/                  # Next 15 marketing/docs site (deploys to Railway)
  skills/shilp-sutra/         # Anthropic-format Agent Skill (ships in npm tarball as skill/)
  scripts/build-skill.mjs     # regenerates skill/references/ from source
  packages/core/scripts/copy-skill.mjs  # copies skill into packages/core/skill/ at build
  railway.toml                # Docker build config for the site service
  ```

## 0.38.0

### Minor Changes

- [#41](https://github.com/devalok-design/shilp-sutra/pull/41) [`db68ada`](https://github.com/devalok-design/shilp-sutra/commit/db68ada99bb33ca95c9a3cc050ed918536816b2b) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **v0.38.0 — Deprecation sweep (8 breaking removals)**

  Removes all APIs deprecated since v0.29.0–v0.37.0. Migrate using the [v0.38 migration guide](https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md#v0380--deprecation-sweep).

  > **Note on bump magnitude:** these are breaking changes shipped as a `minor` bump per the pre-1.0 semver convention codified in [`CONTRIBUTING.md` § Versioning & Breaking Changes](https://github.com/devalok-design/shilp-sutra/blob/main/CONTRIBUTING.md#versioning--breaking-changes). Once we hit 1.0, equivalent removals will require a `major` bump.

  **Breaking changes:**
  - `Alert`: removed `variant="filled"` → use `variant="solid"`
  - `Banner`: removed `action` prop → use `actions`
  - `Input`: removed `startIcon` / `endIcon` props → use `startSection` / `endSection`
  - `Input`: removed `inputVariants` export → use `inputWrapperVariants`
  - `SegmentedControl`: removed `variant="accent"` → use `variant="solid"`
  - `ResponsiveOverlay`: removed component → use `Dialog` or `Sheet` directly
  - `./tailwind` export: removed (was a no-op stub since 0.37.0) → use CSS-first setup
  - `./hooks/use-toast` export: removed → import `toast` from `@devalok/shilp-sutra`

  **Dependency bumps (no consumer API changes):**
  - TipTap `^3.22.3` → `^3.22.5`
  - `@tabler/icons-react` `^3.41.1` → `^3.42.0`

- [#41](https://github.com/devalok-design/shilp-sutra/pull/41) [`db68ada`](https://github.com/devalok-design/shilp-sutra/commit/db68ada99bb33ca95c9a3cc050ed918536816b2b) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Doc-driven AI-agent setup for public release**

  Ships a complete recipes catalog + governance baseline so any AI coding agent (Claude Code, Cursor, Copilot, Codex, Aider) can install and configure shilp-sutra in any consumer project just by reading the bundled docs.

  **Added:**
  - **`AGENTS.md`** at the repo root — Next.js convention. Tells agents to read `llms.txt` + `docs/recipes/` before writing code, with managed `<!-- BEGIN/END:shilp-sutra-agent-rules -->` markers so consumers can layer their own notes without conflict.
  - **`packages/core/docs/recipes/`** ships in the npm package (added to `files`). Reachable from a consumer's `node_modules/@devalok/shilp-sutra/docs/recipes/` with no network round-trip:
    - `index.md` — recipe catalog with framework picker
    - `install-next-app-router.md` — full step-by-step for Next.js 13+ App Router
    - `install-next-pages.md` — Next.js Pages Router
    - `install-vite.md` — Vite + React (also covers React Router)
    - `install-astro.md` — Astro with React islands
    - `install-remix.md` — Remix v2 + Vite
    - `install-tanstack-start.md` — TanStack Start
    - `customize-brand.md` — token override cookbook (color, radius, font, spacing, dark-mode pairings, forced-colors, per-route theming)
    - `server-components.md` — full RSC-safety matrix per layer + import patterns
    - `troubleshoot.md` — decision tree for the 8 most common breakages
  - **`SECURITY.md`** — vulnerability disclosure policy with severity-based timelines and provenance verification instructions. Reports route to `shilp-sutra@devalok.in`.
  - **`CODE_OF_CONDUCT.md`** — Contributor Covenant 2.1 adoption.
  - **`.github/CODEOWNERS`** — review routing to `@devalok-design/shilp-sutra` for high-blast-radius paths (release.yml, pre-publish-audit.mjs, tokens, AI docs).
  - **`.github/ISSUE_TEMPLATE/`** — three GitHub form templates (bug-report, feature-request, ai-agent-feedback) plus a `config.yml` with contact links to SECURITY.md, troubleshoot.md, Storybook, and AGENTS.md.
  - **`packages/core` package.json metadata** — `keywords` (24 SEO terms), `author`, `homepage`, `bugs`. Improves npm discovery.
  - **`packages/brand` package.json metadata** — same hygiene fields.
  - **README.md badges** — npm version, monthly downloads, minzip bundle size, license, sigstore provenance, Storybook, AGENTS.md.
  - **CONTRIBUTING.md "Versioning & Breaking Changes" section** — codifies semver discipline (patch / minor / pre-1.0-major handling), the deprecation policy (one-minor-window before removal, runtime warning + JSDoc + CHANGELOG entry), the changeset requirement for any tarball-shipped surface change, and the explicit list of what counts as public API.

  **Changed:**
  - **`packages/core/llms.txt`** — adds a "QUICK SETUP (AI agents — start here)" block immediately after the intro, pointing agents to the framework-specific recipe in `docs/recipes/`. Existing setup playbook content unchanged below.
  - **`README.md`** — adds a "Setup recipes (per framework)" section linking to all six install recipes plus customization and troubleshooting guides. Removes the stale `@devalok/shilp-sutra/tailwind` package-export row (the JS preset was removed in 0.38). Replaces the package description's "Tailwind preset" suffix with "Tailwind 4 CSS-first tokens".

  **Why minor (not patch):**

  The `files` array now ships `docs/recipes/` to consumers. Existing patch-level changesets only ship code or documentation already in `dist/`; this is the first time a top-level docs tree is part of the npm tarball, which is a meaningful surface change for tooling that scans installed packages.

  **Out of scope:**
  - The `shilp-sutra-cli` init/doctor/info package — deferred until doc-driven setup proves insufficient (see project plan: doc-driven first, CLI second).
  - Marketing/docs site, starter-template repos, per-component bundle-size budgets, public a11y conformance page. Tracked separately for later phases.

  **For consumers:**

  No code changes required. Existing apps continue to work. To opt into the AI-agent contract, add a root `AGENTS.md` to your project — see `node_modules/@devalok/shilp-sutra/llms.txt` for the suggested content (or copy this repo's `AGENTS.md` and adapt).

  **For maintainers:**

  The `CODEOWNERS` file routes reviews to the `@devalok-design/shilp-sutra` GitHub team (<https://github.com/orgs/devalok-design/teams/shilp-sutra>). Vulnerability reports go to `shilp-sutra@devalok.in` (set up as an alias to the maintainer inbox).

## 0.37.1

### Patch Changes

- [`b9103ec`](https://github.com/devalok-design/shilp-sutra/commit/b9103ec07f7733060265280517fd52e8c93f3e53) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **docs:** comprehensive sweep of every component doc — Composability sections, prop accuracy, and a new publish gate that prevents drift.

  Most of the work is in `docs/components/**/*.md` (which ships in the npm bundle via the `files` array) and `llms-full.txt` (the compiled AI-agent reference, also shipped). No component APIs change.

  **What changed for consumers:**
  - **Every one of the 119 component docs now has a `## Composability` section** — covers required providers, context cascade, sibling/companion components, alternatives, router/framework integration. AI agents reading `llms-full.txt` get richer guidance on how pieces fit together, not just props + defaults.
  - **Prop accuracy fixes on 11 components:** Alert (added `size`, documented `solid` variant), Card (added `color` / `size` / `accent` / `accentColor`), Combobox (`size`), NumberInput (`size` + `state`), Select (`variant` + `color`, size expanded to `xs`), Sidebar (SidebarMenuButton's `variant` / `size` / `isActive` / `tooltip` / `asChild`), Slider (`size` + `color`), Tabs (TabsList `size` + `orientation`), Text (full variant list enumerated), Textarea (`xs` size), Toggle (`color`). These props existed in source but weren't documented — consumers had to read the `.tsx` to find them.
  - **Composability deepening** on 26 context-heavy components — Card (size cascade), ButtonGroup (position-aware radius, focus isolation), Form (FormField auto-consumption by Input/Textarea/NumberInput/InputOTP; explicit for Checkbox/Radio/Switch/Slider), Icon (IconProvider cascade), Sidebar (SidebarProvider state model + three-provider setup), DataTable (server vs client mode switching), etc.
  - **InputOTP** — Props section finally lists `maxLength`, `value`, `onChange`, `onComplete`, `pattern`, `state`, `size` (was "standard input-otp props"). Documented the InputOTPSizeContext cascade.

  **New publish gate:** `scripts/audit-component-docs.mjs --check` runs in `pre-publish-audit.mjs`. Fails the publish on any HIGH drift between a component's CVA source and its Props-section axes. Medium flags (TS-only props the script can't see) stay advisory.

- [`b9103ec`](https://github.com/devalok-design/shilp-sutra/commit/b9103ec07f7733060265280517fd52e8c93f3e53) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **fix(InlineEdit):** forward `aria-label` / `aria-labelledby` to the `role="textbox"` span.

  InlineEdit renders `role="textbox"` on an inner span but previously spread all props to the outer wrapper `<div>` — so any `aria-label` consumers passed never reached the element that actually needed the accessible name. axe flagged it as "ARIA input fields must have an accessible name"; the existing a11y test even had a rule-disable workaround for this.

  **Fix:**
  - Intercept `aria-label` and `aria-labelledby` from props before spreading to the wrapper; apply them to the textbox span.
  - Fall back to `placeholder` as the aria-label when neither is provided — screen readers always get a meaningful name.
  - Skip entirely in `readOnly` mode (no `role="textbox"` to label).

  **Migration:** no breaking changes. Consumers already passing `aria-label` will now see it on the correct element; consumers relying on the previous (broken) behavior had nothing to rely on — the label was silently dropped.

  Discovered during the `describeConformance` adoption audit (2026-04-21).

## 0.37.0

### Minor Changes

- [`bb1b680`](https://github.com/devalok-design/shilp-sutra/commit/bb1b680c6daf90e7a53c2be78a0cdff2d1fad8e1) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore every utility-class mapping dropped in the TW3 JS-preset → TW4 @theme migration. This fixes visible regressions in Avatar (collapsed to text), StatusDot, Badge, Alert, SplitButton, Accordion, Collapsible, Progress, Spinner, Stepper, and any component using `w-ds-*` / `h-ds-*` sizing, `bg-neutral-*`, `bg-surface-1..4`, step-6 status colors, `animate-accordion-*` / `animate-collapsible-*` / `animate-popover-*` / `animate-timer-bar` / `animate-shake`, `border-focus`, `opacity-action-*`, `max-w-layout*`, or `bg-gradient-brand*`.

  **Root cause:** the old TW3 preset (514 lines of `theme.extend` mapping) was deleted during the TW4 migration. Its replacement — TW4 `@theme` CSS variables — only emits utilities for tokens in namespaces TW4 knows about (`--color-*`, `--spacing-*`, `--text-*`, etc.). Any preset entry whose mapping didn't fit a TW4 namespace was silently lost; the `var()` still exists in `:root` but no utility class is generated. TW4 silently drops unknown utilities, so typecheck/lint/tests/build/smoke all pass while visual output is broken.

  **What's restored:**
  - `--color-neutral-{1..12}` aliased into @theme (enables `bg-neutral-*`, `border-neutral-*`)
  - `--color-surface-{1,2,3,4}` aliased for CLAUDE.md surface-layering rule (`bg-surface-1..4`)
  - `--color-{error,success,warning,info}-6` added (SplitButton soft, StatusDot)
  - `--amber-bright-6` primitive added (was missing entirely — warning step-6 would resolve to empty)
  - `--color-overlay` + `--color-disabled` promoted from internal :root into @theme (`bg-overlay`, `bg-disabled`, `text-disabled`)
  - `--spacing-ds-{xs,xs-plus,sm,sm-plus,md,lg,xl}` added — named component sizes driving `w-ds-*` / `h-ds-*` / `min-w-ds-*` / `min-h-ds-*` (fixes Avatar, Button, Input collapse)
  - `--spacing-ico-{sm,md,lg,xl}` added — icon sizes
  - Responsive layout spacing `--spacing-{page-x,page-y,section-gap,card-gap,stack-gap}` corrected (media overrides had `-ds-` prefix but @theme had bare)
  - `@utility` blocks for `border-ds-{sm,md,lg}`, `border-focus`, `opacity-action-{hover,selected,disabled,focus,active}`, `max-w-layout`, `max-w-layout-body`, `bg-gradient-brand`, `bg-gradient-brand-dark`
  - 12 custom `--animate-*` keyframes + timings ported from old preset to tokens/animations.css (accordion-down/up, collapsible-down/up, progress-indeterminate, skeleton-shimmer, caret-blink, timer-bar, popover-in/out, processing-ants-ambient/working/urgent/march/svg, shake)
  - `tw-animate-css ^1.4.0` added to `dependencies` and `@import`ed in shilp-sutra.css (provides `animate-in`, `fade-in-*`, `zoom-*`, `slide-*-from-*` for Radix enter/exit animations)
  - Missing `./ui/split-button` subpath export added to package.json

  **Regression gate:** new `scripts/audit-compiled-css.mjs` runs AFTER the consumer smoke and verifies every DS utility-class pattern referenced in `packages/core/src/**` emits a rule in the compiled consumer CSS. The expanded smoke-consumer page now renders every primitive (Avatar, StatusDot, Badge, Alert, Accordion, Collapsible, Progress, Spinner, SplitButton, Stepper, form controls), so the audit exercises the full class surface. Wired into `release.yml` as a publish-blocking step for both Turbopack and Webpack variants. If a future refactor drops another token mapping, this gate fails the publish.

  Full audit log: `docs/audits/2026-04-20-0.37-token-gap.md`.

  **Consumer impact:** no-code upgrade from 0.37.0-next.1 to 0.37.0-next.2. Visual regressions in Avatar, animations, and any other affected component are fixed on upgrade.

- [#33](https://github.com/devalok-design/shilp-sutra/pull/33) [`e1f24dd`](https://github.com/devalok-design/shilp-sutra/commit/e1f24ddd285db13bbe275dc2ebef04a773a2152d) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Tailwind 4 CSS-first migration. Setup-only breaking release — component APIs are unchanged. See [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration) for the full guide.

  ### BREAKING
  - **JS preset removed.** `tailwind.config.ts` with `presets: [shilpSutra]` no longer works. Tokens ship as TW4 `@theme` CSS via a single import:

    ```css
    @import 'tailwindcss';
    @import '@devalok/shilp-sutra/css';
    ```

    The old `./tailwind` export is a deprecated no-op stub that logs a dev-mode `console.warn`; scheduled for removal in 0.38.

  - **`framer-motion` is now a required peerDependency** (`^12.0.0`). Module-scoped React contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) break silently when two copies resolve — making framer-motion a peer forces the consumer to control the version and pnpm to dedupe. Install: `pnpm add framer-motion`.
  - **`sonner` is now an optional peerDependency** (`^2.0.0`). Install only if you render `<Toaster />`: `pnpm add sonner`.
  - **`tailwindcss` peer tightened to `^4.0.0`** (was `^3.4.0 || ^4.0.0`). 0.37 is TW4-only.
  - **`use-sync-external-store` moved to `dependencies`** (from optional peer). Auto-installed transitively; no consumer action needed.
  - **Source class modernization** — our source migrated; consumers whose own code uses TW3-era patterns should update:
    - `w-[--var]` → `w-(--var)`
    - `theme(spacing.N)` → literal value
    - `bg-gradient-to-*` → `bg-linear-to-*`
    - bare `shadow` → explicit (e.g., `shadow-raised`)
  - **Token namespaces:** spacing is `--spacing-ds-*` (generates `p-ds-03`), typography is `--text-ds-*` / `--leading-ds-*`. Z-layers (`z-popover`, etc.) and named durations (`duration-fast-01`) are generated via `@utility` blocks since TW4 has no `--z-*` / `--duration-*` auto-namespaces.
  - **Dark mode:** `@custom-variant dark (&:where(.dark *));` — identical behavior to TW3's `darkMode: 'class'`.

  ### Added
  - New export `@devalok/shilp-sutra/css` — the single consumer entry for TW4 setup.
  - New token files at `packages/core/src/tokens/`: `shilp-sutra.css`, `utilities.css`, `variants.css`, `base.css`, `animations.css`.
  - Next 15 + Webpack smoke consumer at `tests/smoke-consumer-next15/` — complements the existing Next 16 + Turbopack variant. Both wired into the release workflow.
  - MIGRATION.md at repo root — new v0.37 section with before/after globals, collision examples, dark-mode sanity check, framer-motion single-copy verification, troubleshooting table.
  - 10 council-gated pre-publish audit checks: peer-vs-dep correctness, tailwindcss peer range, `exports` types-first ordering, bare `shadow` detection, MIGRATION.md presence + 0.37 section, README TW3 residue, dist Node-builtin leak, Next 15 smoke fixture presence.
  - Chromatic visual-regression gate in release.yml (runs pre-RC, blocks on undiffed visual changes).
  - Rollback drill procedure in `docs/rollback.md`.

  ### Changed
  - Build externalization: `framer-motion` and `sonner` are now external (were chunked). Eliminates duplicate-copy risk.
  - `engines.node` floor dropped. Phase 0 spike made the `process.getBuiltinModule` bridge unnecessary.
  - `publishConfig.provenance: true` — every 0.37 publish carries an SLSA attestation visible on npmjs.com.
  - `.github/workflows/release.yml` wired to OIDC trusted publishing and gated on `pre-publish-audit.mjs` + `consumer-smoke-test.mjs` + Chromatic.

  ### Removed
  - Repo-root `tailwind.config.ts`.
  - `docs/MIGRATION.md` (moved to repo root).
  - `rolldown-runtime` CJS bridge patch in `inject-use-client.mjs` (Phase 0 eliminated the need).

### Patch Changes

- [`d4dbbee`](https://github.com/devalok-design/shilp-sutra/commit/d4dbbeecfe57ec20d75d0b082265831af3cd9050) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore the full animation utility surface that was silently dropped in 0.37.0-next.0.

  **The bug:** when the JS preset was removed during the TW4 migration, two things went missing:
  1. **`tailwindcss-animate` utilities** (`animate-in`, `animate-out`, `fade-in-0`, `zoom-in-75/95`, `slide-in-from-top/bottom/left`, `slide-out-to-*`, etc.) — used by every Radix primitive (Dialog, Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu, AlertDialog, Sheet, Toast, etc.) for enter/exit animations. Without them, overlays snap in/out with no motion. Avatar's fade-in on image load also goes silent.
  2. **Custom DS animations** (`animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `animate-progress-indeterminate`, `animate-skeleton-shimmer`, `animate-caret-blink`, `animate-timer-bar`, `animate-popover-in`/`-out`, `animate-processing-ants-*`) — their `@keyframes` + `@theme --animate-*` entries existed in the old preset but weren't ported to `tokens/animations.css` during the migration.

  **The fix:**
  - Added `tw-animate-css ^1.4.0` to core `dependencies` (TW4-native rewrite of tailwindcss-animate by the same author).
  - `@import "tw-animate-css"` in `tokens/shilp-sutra.css` so consumers get the full `animate-in`/`fade-*`/`slide-*`/`zoom-*` surface automatically.
  - Ported all 11 custom DS keyframes + `@theme --animate-*` entries from the deleted preset to `tokens/animations.css`. Each references the same timing + easing the preset used (`var(--duration-slow-02)`, `var(--ease-productive-standard)`, etc.), so the motion character is identical to 0.36.

  **Verification:** consumer smoke test (Next 16 + Turbopack) now compiles `animate-in`, `animate-skeleton-shimmer`, `animate-progress-indeterminate`, `animate-caret-blink`, `slide-in-from-bottom`, `zoom-in-75`, and peers into the generated CSS. Previously all of these emitted zero rules.

  **Consumer impact:** existing `animate-*` class names work again without any code change. If you're on `0.37.0-next.0` and seeing broken avatars / motion, upgrading to `0.37.0-next.1` is a no-code fix.

## 0.37.0-next.1

### Minor Changes

- [`bb1b680`](https://github.com/devalok-design/shilp-sutra/commit/bb1b680c6daf90e7a53c2be78a0cdff2d1fad8e1) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore every utility-class mapping dropped in the TW3 JS-preset → TW4 @theme migration. This fixes visible regressions in Avatar (collapsed to text), StatusDot, Badge, Alert, SplitButton, Accordion, Collapsible, Progress, Spinner, Stepper, and any component using `w-ds-*` / `h-ds-*` sizing, `bg-neutral-*`, `bg-surface-1..4`, step-6 status colors, `animate-accordion-*` / `animate-collapsible-*` / `animate-popover-*` / `animate-timer-bar` / `animate-shake`, `border-focus`, `opacity-action-*`, `max-w-layout*`, or `bg-gradient-brand*`.

  **Root cause:** the old TW3 preset (514 lines of `theme.extend` mapping) was deleted during the TW4 migration. Its replacement — TW4 `@theme` CSS variables — only emits utilities for tokens in namespaces TW4 knows about (`--color-*`, `--spacing-*`, `--text-*`, etc.). Any preset entry whose mapping didn't fit a TW4 namespace was silently lost; the `var()` still exists in `:root` but no utility class is generated. TW4 silently drops unknown utilities, so typecheck/lint/tests/build/smoke all pass while visual output is broken.

  **What's restored:**
  - `--color-neutral-{1..12}` aliased into @theme (enables `bg-neutral-*`, `border-neutral-*`)
  - `--color-surface-{1,2,3,4}` aliased for CLAUDE.md surface-layering rule (`bg-surface-1..4`)
  - `--color-{error,success,warning,info}-6` added (SplitButton soft, StatusDot)
  - `--amber-bright-6` primitive added (was missing entirely — warning step-6 would resolve to empty)
  - `--color-overlay` + `--color-disabled` promoted from internal :root into @theme (`bg-overlay`, `bg-disabled`, `text-disabled`)
  - `--spacing-ds-{xs,xs-plus,sm,sm-plus,md,lg,xl}` added — named component sizes driving `w-ds-*` / `h-ds-*` / `min-w-ds-*` / `min-h-ds-*` (fixes Avatar, Button, Input collapse)
  - `--spacing-ico-{sm,md,lg,xl}` added — icon sizes
  - Responsive layout spacing `--spacing-{page-x,page-y,section-gap,card-gap,stack-gap}` corrected (media overrides had `-ds-` prefix but @theme had bare)
  - `@utility` blocks for `border-ds-{sm,md,lg}`, `border-focus`, `opacity-action-{hover,selected,disabled,focus,active}`, `max-w-layout`, `max-w-layout-body`, `bg-gradient-brand`, `bg-gradient-brand-dark`
  - 12 custom `--animate-*` keyframes + timings ported from old preset to tokens/animations.css (accordion-down/up, collapsible-down/up, progress-indeterminate, skeleton-shimmer, caret-blink, timer-bar, popover-in/out, processing-ants-ambient/working/urgent/march/svg, shake)
  - `tw-animate-css ^1.4.0` added to `dependencies` and `@import`ed in shilp-sutra.css (provides `animate-in`, `fade-in-*`, `zoom-*`, `slide-*-from-*` for Radix enter/exit animations)
  - Missing `./ui/split-button` subpath export added to package.json

  **Regression gate:** new `scripts/audit-compiled-css.mjs` runs AFTER the consumer smoke and verifies every DS utility-class pattern referenced in `packages/core/src/**` emits a rule in the compiled consumer CSS. The expanded smoke-consumer page now renders every primitive (Avatar, StatusDot, Badge, Alert, Accordion, Collapsible, Progress, Spinner, SplitButton, Stepper, form controls), so the audit exercises the full class surface. Wired into `release.yml` as a publish-blocking step for both Turbopack and Webpack variants. If a future refactor drops another token mapping, this gate fails the publish.

  Full audit log: `docs/audits/2026-04-20-0.37-token-gap.md`.

  **Consumer impact:** no-code upgrade from 0.37.0-next.1 to 0.37.0-next.2. Visual regressions in Avatar, animations, and any other affected component are fixed on upgrade.

### Patch Changes

- [`d4dbbee`](https://github.com/devalok-design/shilp-sutra/commit/d4dbbeecfe57ec20d75d0b082265831af3cd9050) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Restore the full animation utility surface that was silently dropped in 0.37.0-next.0.

  **The bug:** when the JS preset was removed during the TW4 migration, two things went missing:
  1. **`tailwindcss-animate` utilities** (`animate-in`, `animate-out`, `fade-in-0`, `zoom-in-75/95`, `slide-in-from-top/bottom/left`, `slide-out-to-*`, etc.) — used by every Radix primitive (Dialog, Popover, Tooltip, HoverCard, Select, DropdownMenu, ContextMenu, AlertDialog, Sheet, Toast, etc.) for enter/exit animations. Without them, overlays snap in/out with no motion. Avatar's fade-in on image load also goes silent.
  2. **Custom DS animations** (`animate-accordion-down`/`-up`, `animate-collapsible-down`/`-up`, `animate-progress-indeterminate`, `animate-skeleton-shimmer`, `animate-caret-blink`, `animate-timer-bar`, `animate-popover-in`/`-out`, `animate-processing-ants-*`) — their `@keyframes` + `@theme --animate-*` entries existed in the old preset but weren't ported to `tokens/animations.css` during the migration.

  **The fix:**
  - Added `tw-animate-css ^1.4.0` to core `dependencies` (TW4-native rewrite of tailwindcss-animate by the same author).
  - `@import "tw-animate-css"` in `tokens/shilp-sutra.css` so consumers get the full `animate-in`/`fade-*`/`slide-*`/`zoom-*` surface automatically.
  - Ported all 11 custom DS keyframes + `@theme --animate-*` entries from the deleted preset to `tokens/animations.css`. Each references the same timing + easing the preset used (`var(--duration-slow-02)`, `var(--ease-productive-standard)`, etc.), so the motion character is identical to 0.36.

  **Verification:** consumer smoke test (Next 16 + Turbopack) now compiles `animate-in`, `animate-skeleton-shimmer`, `animate-progress-indeterminate`, `animate-caret-blink`, `slide-in-from-bottom`, `zoom-in-75`, and peers into the generated CSS. Previously all of these emitted zero rules.

  **Consumer impact:** existing `animate-*` class names work again without any code change. If you're on `0.37.0-next.0` and seeing broken avatars / motion, upgrading to `0.37.0-next.1` is a no-code fix.

## 0.37.0-next.0

### Minor Changes

- [#33](https://github.com/devalok-design/shilp-sutra/pull/33) [`e1f24dd`](https://github.com/devalok-design/shilp-sutra/commit/e1f24ddd285db13bbe275dc2ebef04a773a2152d) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - Tailwind 4 CSS-first migration. Setup-only breaking release — component APIs are unchanged. See [MIGRATION.md](./MIGRATION.md#v0370--tailwind-4-css-first-migration) for the full guide.

  ### BREAKING
  - **JS preset removed.** `tailwind.config.ts` with `presets: [shilpSutra]` no longer works. Tokens ship as TW4 `@theme` CSS via a single import:

    ```css
    @import 'tailwindcss';
    @import '@devalok/shilp-sutra/css';
    ```

    The old `./tailwind` export is a deprecated no-op stub that logs a dev-mode `console.warn`; scheduled for removal in 0.38.

  - **`framer-motion` is now a required peerDependency** (`^12.0.0`). Module-scoped React contexts (`MotionConfig`, `LayoutGroup`, `AnimatePresence`) break silently when two copies resolve — making framer-motion a peer forces the consumer to control the version and pnpm to dedupe. Install: `pnpm add framer-motion`.
  - **`sonner` is now an optional peerDependency** (`^2.0.0`). Install only if you render `<Toaster />`: `pnpm add sonner`.
  - **`tailwindcss` peer tightened to `^4.0.0`** (was `^3.4.0 || ^4.0.0`). 0.37 is TW4-only.
  - **`use-sync-external-store` moved to `dependencies`** (from optional peer). Auto-installed transitively; no consumer action needed.
  - **Source class modernization** — our source migrated; consumers whose own code uses TW3-era patterns should update:
    - `w-[--var]` → `w-(--var)`
    - `theme(spacing.N)` → literal value
    - `bg-gradient-to-*` → `bg-linear-to-*`
    - bare `shadow` → explicit (e.g., `shadow-raised`)
  - **Token namespaces:** spacing is `--spacing-ds-*` (generates `p-ds-03`), typography is `--text-ds-*` / `--leading-ds-*`. Z-layers (`z-popover`, etc.) and named durations (`duration-fast-01`) are generated via `@utility` blocks since TW4 has no `--z-*` / `--duration-*` auto-namespaces.
  - **Dark mode:** `@custom-variant dark (&:where(.dark *));` — identical behavior to TW3's `darkMode: 'class'`.

  ### Added
  - New export `@devalok/shilp-sutra/css` — the single consumer entry for TW4 setup.
  - New token files at `packages/core/src/tokens/`: `shilp-sutra.css`, `utilities.css`, `variants.css`, `base.css`, `animations.css`.
  - Next 15 + Webpack smoke consumer at `tests/smoke-consumer-next15/` — complements the existing Next 16 + Turbopack variant. Both wired into the release workflow.
  - MIGRATION.md at repo root — new v0.37 section with before/after globals, collision examples, dark-mode sanity check, framer-motion single-copy verification, troubleshooting table.
  - 10 council-gated pre-publish audit checks: peer-vs-dep correctness, tailwindcss peer range, `exports` types-first ordering, bare `shadow` detection, MIGRATION.md presence + 0.37 section, README TW3 residue, dist Node-builtin leak, Next 15 smoke fixture presence.
  - Chromatic visual-regression gate in release.yml (runs pre-RC, blocks on undiffed visual changes).
  - Rollback drill procedure in `docs/rollback.md`.

  ### Changed
  - Build externalization: `framer-motion` and `sonner` are now external (were chunked). Eliminates duplicate-copy risk.
  - `engines.node` floor dropped. Phase 0 spike made the `process.getBuiltinModule` bridge unnecessary.
  - `publishConfig.provenance: true` — every 0.37 publish carries an SLSA attestation visible on npmjs.com.
  - `.github/workflows/release.yml` wired to OIDC trusted publishing and gated on `pre-publish-audit.mjs` + `consumer-smoke-test.mjs` + Chromatic.

  ### Removed
  - Repo-root `tailwind.config.ts`.
  - `docs/MIGRATION.md` (moved to repo root).
  - `rolldown-runtime` CJS bridge patch in `inject-use-client.mjs` (Phase 0 eliminated the need).

## 0.36.1

### Patch Changes

- [#31](https://github.com/devalok-design/shilp-sutra/pull/31) [`daad9c4`](https://github.com/devalok-design/shilp-sutra/commit/daad9c4d89afdc9165edb05d3caf9c59116e2207) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Fix TW4 codemod regressions (resolves [#30](https://github.com/devalok-design/shilp-sutra/issues/30)).**

  The TW 3→4 migration in 0.34.0 left several class-name artifacts that slipped past our gates. 0.36.1 repairs all of them and adds pre-publish-audit coverage so the same class of bug can't ship again.
  - **RichChatInput + RichTextEditor (`[#30](https://github.com/devalok-design/shilp-sutra/issues/30)`, runtime-breaking):** `[[&_mark]:rounded-sm_mark]:rounded-xs` — a garbled nested arbitrary variant — was emitted as invalid CSS by the codemod and crashed Turbopack on every page load for TW4 consumers. Replaced with the intended `[&_mark]:rounded-xs`.
  - **BarChart, LineChart, Stepper (silent a11y regression):** `focus-visible:outline-none` escaped the rename to `outline-hidden`. In TW4, `outline-none` also strips the outline under `forced-colors: active`, which meant the 0.36.0 forced-colors feature had **no focus indicator** on these components in Windows high-contrast mode. Now all three use `outline-hidden` and focus renders correctly under forced-colors.
  - **SegmentedControl (silent visual shift):** `shadow-sm` in TW4 renders as TW3's bare `shadow` (one step larger). Migrated to `shadow-raised` for semantic consistency.
  - **Stepper:** `flex-shrink-0` → `shrink-0` (TW4 spelling).
  - **Sidebar menu button:** three `:!size-8` / `:!p-ds-03` / `:!p-0` used TW3's leading-`!` important prefix; now use TW4's trailing `class!` form.

  **Process hardening** — the `pre-publish-audit.mjs` script now includes a **Tailwind 4 Migration Hygiene** section:
  - **HARD GATES**: fails publish on doubled-bracket arbitrary variants (`[[&_x]:class_x]:class` — the exact pattern from [#30](https://github.com/devalok-design/shilp-sutra/issues/30)) or any stray `outline-none`.
  - **ADVISORIES**: warns on `rounded-sm` / `shadow-sm` / `blur-sm` / `backdrop-blur-sm` (silently-shifted meaning in TW4), TW3 `flex-shrink-*` / `flex-grow-*`, and TW3 `:!prefix` important syntax.

  `.github/workflows/release.yml` also gains `workflow_dispatch` so future publish re-runs don't require a throwaway commit.

## 0.36.0

### Minor Changes

- [#26](https://github.com/devalok-design/shilp-sutra/pull/26) [`e61fd3c`](https://github.com/devalok-design/shilp-sutra/commit/e61fd3c0118714d5424379eaf7af733731d3fcc6) Thanks [@Mudit-Lal](https://github.com/Mudit-Lal)! - **Forced-colors (Windows high-contrast) support.** Added `@media (forced-colors: active)` block in `semantic.css` that maps every semantic color token to system keywords (Canvas, CanvasText, Highlight, HighlightText, LinkText, GrayText, Mark, ButtonText, VisitedText). Applies to both light and dark themes — forced-colors is orthogonal to theme. Also adds belt-and-suspenders focus-ring outline (Highlight) and forced visible borders on interactive elements so ghost/link buttons remain perceivable. Decorative grain (`[data-grain]`) is hidden, skeleton shimmer freezes. Zero runtime impact when forced-colors is inactive.

  **FormField auto-wires Label + Input ids.** `FormField` now publishes an `inputId` via context. `Label` reads `htmlFor` from it, `Input` reads `id` from it, unless either is explicitly set on the child. Eliminates manual id-juggling and a whole class of Label-input mismatch bugs.

  **Toast error variants announce assertively.** `toast.error()` now renders `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` so screen readers interrupt speech on errors. Other toast types remain `role="status"` + `aria-live="polite"`. Upload toasts go assertive only when a file fails.

  **Dev-mode warning for missing `<Toaster />`.** `toast()` called without a mounted `Toaster` now logs a one-time console warning pointing to the fix. Production-silent.

  **Button processing ants no longer drift outside the button.** The marching-ant overlay was sizing its SVG + rect against the wrapper via `calc(100% - 2px)`, which could diverge from the button's actual rendered size during width transitions and async-feedback icon swaps — producing a visible gap between the button edge and the ants' outline. Now measured directly from `btnEl.offsetWidth/offsetHeight` with a ResizeObserver keeping it locked.

  **Alert solid-variant body-text legibility.** Fixed two compounding bugs: body text was hardcoded to `text-surface-fg-muted` (grey), overriding the CVA's foreground on solid variants; and solid compound variants all used `text-accent-fg` instead of the matching per-color `-fg` token. Warning in particular was silently broken — white-on-amber fails contrast, dark-text-on-amber is the right pairing. Now uses per-color `text-{info|success|warning|error}-fg` on solid/filled variants, and skips the muted body override there.

  **Per-color `-fg` tokens on non-accent status backgrounds.** Button async success/error states, BottomNavbar notification badge, and TopBar item badge now use `text-error-fg` / `text-success-fg` instead of `text-accent-fg`. No visible change today (all `-fg` tokens resolve to the same near-white), but brand-swap-safe — an override of `--color-accent-fg` won't silently mis-color error badges.

  **vitest testTimeout 15s → 30s.** Sequential-file execution plus accumulated jsdom pressure on tiptap + axe tests at the tail of a full run was grazing the 15s wall. Isolated runs finish under 1s; real regressions still hit the new ceiling.

  **Documentation cleanup.** Fixed six `data-table-*.md` stub files that shipped literal bash template headers to `llms-full.txt` (`# $(echo $f | sed ...)`). Reconstructed `packages/core/CHANGELOG.md` entries for 0.33.x–0.35.0 (was frozen at 0.33.0). Removed fake Button `variant="default"` / `"destructive"` aliases from the llms Props block (removed in 0.32.0). Updated README component counts (60+/14/7 → 78/29/8 + AI tier) and tech stack. Added Badge `truncate` prop to docs.

  **Design preference codified.** `variant="soft"` is now the Devalok default over `variant="outline"` for non-primary Button actions. Captured in CLAUDE.md, llms.txt, and llms-full.txt.

  **Forced-colors verification story.** New `Foundations → Forced Colors → Component Matrix` in Storybook with a solid-bg legibility sub-section showing every status color × every component (Button, Badge, BadgeIndicator, counter pills, checkables) side-by-side.

  **CI: bundle budget excludes sourcemaps.** The 5MB bundle-size gate was measuring `dist` including `.map` files (~5.4MB of sourcemaps alone). Now measures runtime JS + CSS + types only, reporting sourcemaps separately for transparency.

> See the root [CHANGELOG.md](../../CHANGELOG.md) for detailed per-release notes.
> This file is the Changesets-generated summary shipped alongside releases.

## 0.35.0

### Minor Changes

- World-Class Audit wave 1–5: dark-mode contrast fix, responsive clamp() typography, letter spacing, surface-fg-subtle darkening, size/color axes on Combobox/NumberInput/Slider/InputOTP/Toggle, Tabs `orientation="vertical"`, Stepper `onStepClick`, AlertDialog `responsive`, Chart keyboard a11y + `ariaDescription`, typography composite utilities (text-heading-xl/text-body-md/etc.), layout/link/duration tokens, `useFormField` wired into 8 components, Autocomplete portal, NotificationCenter mobile Sheet, 136+ new tests + coverage thresholds.

### Breaking

- `MessageList` prop `isLoadingMore` → `loadingMore`.
- `AppCommandPalette` Karm defaults removed — use `CommandRegistryProvider`.
- `NumberInput` shape: pill → rounded rectangle.
- `Alert.variant="filled"` deprecated → use `"solid"` (alias still works).
- `SegmentedControl.variant="accent"` deprecated → use `"solid"` (alias still works).
- `@floating-ui/dom`, `@tiptap/*`, `prosemirror-state` now bundled (moved to devDeps).

## 0.34.1

### Patch Changes

- Upgrade Vite 7 → 8 (Rolldown bundler) + @vitejs/plugin-react 6 (Oxc). SSR safety patch for Rolldown CJS interop.

## 0.34.0

### Minor Changes

- Tailwind CSS 4, TypeScript 6, ESLint 10, tailwind-merge 3.5, react-zoom-pan-pinch 4 — full toolchain upgrade

## 0.33.2

### Patch Changes

- Upgrade TypeScript 6.0.2, ESLint 10, typescript-eslint 8.58.1, react-zoom-pan-pinch 4 (peer dep)

## 0.33.1

### Patch Changes

- Bump all safe patch/minor dependencies: React 19.2.5, Storybook 10.3.5, Vitest 4.1.4, framer-motion 12.38, @floating-ui/dom 1.7.6, @tabler/icons-react 3.41.1, esbuild 0.28, jsdom 29, and more

## 0.33.0

### Minor Changes

- Custom EmojiNode with spritesheet rendering, SplitButton component, schedule send, ButtonGroup rebuild, RichChatInput v2 enhancements, TipTap v3 upgrade
