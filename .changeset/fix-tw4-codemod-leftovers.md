---
'@devalok/shilp-sutra': patch
---

**Fix TW4 codemod regressions (resolves [#30](https://github.com/devalok-design/shilp-sutra/issues/30)).**

The TW 3→4 migration in 0.34.0 left several class-name artifacts that slipped past our gates. 0.36.1 repairs all of them and adds pre-publish-audit coverage so the same class of bug can't ship again.

- **RichChatInput + RichTextEditor (`#30`, runtime-breaking):** `[[&_mark]:rounded-sm_mark]:rounded-xs` — a garbled nested arbitrary variant — was emitted as invalid CSS by the codemod and crashed Turbopack on every page load for TW4 consumers. Replaced with the intended `[&_mark]:rounded-xs`.
- **BarChart, LineChart, Stepper (silent a11y regression):** `focus-visible:outline-none` escaped the rename to `outline-hidden`. In TW4, `outline-none` also strips the outline under `forced-colors: active`, which meant the 0.36.0 forced-colors feature had **no focus indicator** on these components in Windows high-contrast mode. Now all three use `outline-hidden` and focus renders correctly under forced-colors.
- **SegmentedControl (silent visual shift):** `shadow-sm` in TW4 renders as TW3's bare `shadow` (one step larger). Migrated to `shadow-raised` for semantic consistency.
- **Stepper:** `flex-shrink-0` → `shrink-0` (TW4 spelling).
- **Sidebar menu button:** three `:!size-8` / `:!p-ds-03` / `:!p-0` used TW3's leading-`!` important prefix; now use TW4's trailing `class!` form.

**Process hardening** — the `pre-publish-audit.mjs` script now includes a **Tailwind 4 Migration Hygiene** section:

- **HARD GATES**: fails publish on doubled-bracket arbitrary variants (`[[&_x]:class_x]:class` — the exact pattern from #30) or any stray `outline-none`.
- **ADVISORIES**: warns on `rounded-sm` / `shadow-sm` / `blur-sm` / `backdrop-blur-sm` (silently-shifted meaning in TW4), TW3 `flex-shrink-*` / `flex-grow-*`, and TW3 `:!prefix` important syntax.

`.github/workflows/release.yml` also gains `workflow_dispatch` so future publish re-runs don't require a throwaway commit.
