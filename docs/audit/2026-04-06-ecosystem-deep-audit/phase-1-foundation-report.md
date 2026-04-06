# Phase 1: Foundation Audit — Executive Summary

**Date:** 2026-04-06
**Auditor:** Claude Code (parallel subagent-driven)

## Overall Assessment

The foundation is **structurally sound** but has **critical dark-mode contrast issues** and several medium-priority gaps in build gates and token utilities.

| Area | Verdict | Critical Issues | Medium Issues |
|------|---------|----------------|---------------|
| Token Contrast | **NEEDS FIX** | 6 dark-mode button text failures, 1 invisible border | 21 border contrast failures (1.4.11) |
| Vendored Primitives | **PASS** | 0 | 4 documentation-only items |
| Build Pipeline | **MOSTLY PASS** | 0 | 5 missing pre-publish gates, outdated comment |
| Tailwind Preset | **MOSTLY PASS** | 0 | Dead fontVariantNumeric, hardcoded values |

---

## P0: Critical (Must Fix Before Next Release)

### 1. Dark Mode Button Text Contrast Failure
**Location:** `packages/core/src/tokens/semantic.css` — `.dark {}` block
**Issue:** Dark mode sets `--color-*-fg` (accent, error, success, info, secondary) to `var(--neutral-12)` which is L=0.88 (bright). Step-9 backgrounds in dark mode are L=0.55-0.63 (also bright). Result: contrast ratios of 1.79-2.72:1 — far below the 4.5:1 minimum for button text.
**Fix:** Either revert dark fg tokens to `var(--neutral-1)` (dark text on bright buttons) or darken step-9 backgrounds significantly.

### 2. Dark Mode Invisible Border
**Location:** `packages/core/src/tokens/semantic.css`
**Issue:** `--color-surface-border-subtle` on `--color-surface-raised` = **1.00:1 contrast** (literally the same color in dark mode).
**Fix:** Adjust dark mode `--color-surface-border-subtle` to use a visibly different step.

---

## P1: Important (Fix in Current Cycle)

### 3. Surface Border Contrast (WCAG 1.4.11)
21 border-on-background pairings fail the 3:1 UI component ratio in light mode, 26 in dark mode. Systemic issue: step-5/6/7 borders on step-1/2/3 backgrounds are too close in lightness.
**Fix:** Use step-7 or step-8 for borders instead of step-5/6, or document as intentionally decorative (WCAG allows this if borders are not the sole visual cue).

### 4. Pre-Publish Gate Gaps
- No stories existence check (despite being a "hard rule")
- No export map validation gate
- `SURFACE1_ALLOWLIST` documented but never implemented in audit script
- No brand package gate
- No bundle size tracking

### 5. Framer-Motion Comment
`vite.config.ts:129` says framer-motion is "only loaded by Spinner and future animation components." Actually imported by **84 files**. The comment is misleading and could cause bad chunking decisions.

---

## P2: Low Priority (Improve When Convenient)

### 6. Dead Tailwind Config
`fontVariantNumeric` in preset.ts does nothing — Tailwind has no such theme key. Move to `addUtilities` plugin.

### 7. Hardcoded Values
- `rgba(0,0,0,0.1)` kbd shadow duplicated 11x across `command-bar.tsx` and `command-palette.tsx` — extract to `--shadow-kbd` token
- Brand hex colors in `devadoot-icon.tsx` and `command-bar.tsx` bypass token system
- Focus-ring plugin hardcodes `2px`/`4px` instead of using `--border-focus-width`/`--border-focus-offset` tokens

### 8. Pure-Type Files Get "use client"
`ui/toast-types.ts` and `ai/types.ts` get unnecessary `"use client"` injection. Harmless but semantically wrong.

### 9. Orphaned Yellow Scale
The entire `--yellow-*` primitive scale is unreferenced (replaced by `--amber-bright-*` for warnings).

---

## Detailed Reports

- [Token Contrast Audit](phase-1-tokens.md) — 71 pairings x 2 modes, full contrast matrix
- [Vendored Primitives Audit](phase-1-primitives.md) — 23 primitives checked against APG
- [Build Pipeline Audit](phase-1-build.md) — use-client, SSR, exports, chunks, gates
- [Tailwind Preset Audit](phase-1-tailwind.md) — token mapping, hardcoded values, CJS/ESM
