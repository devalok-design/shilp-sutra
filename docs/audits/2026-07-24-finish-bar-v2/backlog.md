# Finish-Bar v2 — Ranked Backlog (full DS, 125 components)

Systemic items first (fix once, DS-wide), then per-component below-bar work.
Full per-component gap lists live in `findings/<layer>__<name>.md`.

## 🔴 P0 — systemic sweeps (do first, highest leverage)
- **S1 reduced-motion**: self-guard motion (default `MotionConfig reducedMotion="user"` in the motion primitive, or wire `useReducedMotion` per component) + lint rule. Touches most animated components.
- **S2 dead `border-card-strong`**: sweep 11 files → `border-card` (verify vs compiled CSS first).
- **shell/bottom-navbar a11y**: hand-rolled dialog has no focus-trap/scroll-lock/return-focus/aria-modal → compose DS Sheet. Real a11y defect in primary mobile nav.

## 🟠 P1 — below-bar components (13, mostly composition fixes)
- composed/content-card — duplicates Card; deprecate→compose (delete next major).
- composed/bulk-action-bar — compose React-Aria-style toolbar; keyboard + roles.
- composed/avatar-group — compose Avatar; overflow +N; a11y group semantics.
- composed/loading-skeleton + composed/page-skeletons — compose ui/skeleton; unify shimmer (S6).
- composed/error-boundary — match react-error-boundary (reset keys, fallback render prop).
- composed/master-detail — list-detail a11y + keyboard (React Aria class).
- composed/priority-indicator — **rebuild**: compose Dot/Badge; token colors.
- ui/autocomplete — **rebuild**: async + virtualization (Base UI/React Aria).
- ui/file-upload — drag-drop a11y, progress, error states.
- ui/data-table-bulk-actions + ui/data-table-pagination — a11y + token cleanup (also carry S2).

## 🟡 P1 — doc↔source drift (S3, cheap + agent-facing)
- ui/search-input (Escape-to-clear not wired; controlled-only clear), ui/slider (false FormField claim), shell/command-registry (phantom API + false isAdmin), shell/app-command-palette (stale props + role-case example), composed/simple-tooltip (false provider claim), composed/rich-chat-input (wrong onSubmit sig).

## 🟡 P2 — targeted, per-component (from findings)
- ui/switch — RTL thumb direction + reduced-motion (one refactor).
- ui/tabs, ui/select, ui/stepper, ui/radio, ui/stat-card — reduced-motion guards (S1 covers).
- ui/split-button — derive from buttonVariants (S6); owned-menu semantics + loading.
- ui/skeleton — sub-components compose base; unify shimmer (S6).
- ui/spinner — reduced-motion path drops onComplete (contract break).
- ui/table — forced-colors fallback for selected-row tint.
- ui/icon-button, shell/sidebar — 44px touch targets; sidebar nav landmark.
- ui/separator — remove dead `variant` control + prop (past its 0.45 removal).
- shell/notification-preferences — accessible names on row Switch/Select.
- ui/context-menu / ui/menubar — reduce Radix-twin drift.

## 🟢 P3 — polish / adoption ideas (see per-finding "Cross-DS adoption ideas")
- Async + virtualization across combobox/member-picker/multi-select-popover/command-palette (Base UI / cmdk / react-virtual).
- Message actions + streaming text in ai/conversation (Vercel AI SDK / assistant-ui).
- Per-block error boundary + streaming in ai/block-renderer.
- Marks/output/thumb-labels on ui/slider (React Aria).

## Sequencing
1. P0 sweeps (S1 + S2) — one branch each, DS-wide.
2. bottom-navbar a11y rebuild.
3. below-bar 13, worst-first (batch composition fixes — S6).
4. doc-drift batch (S3) — one PR per layer.
5. Fold S4 (tests) + S5 (magic-numbers) into every touch; widen the gates.

## Note on scope
114/125 are **polish**, not rebuild — the DS is fundamentally sound. This is a
finish-and-consistency program, not a redesign. Recommend NOT mass-rebuilding;
sweep the systemic issues, fix the 13 below-bar, protect the 9 leaders.
