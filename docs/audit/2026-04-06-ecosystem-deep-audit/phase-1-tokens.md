# Phase 1: Token Contrast Audit

**Generated**: 2026-04-06
**Method**: OKLCH -> OKLab -> Linear sRGB -> WCAG 2.1 relative luminance -> contrast ratio
**Thresholds**: Normal text >= 4.5:1 | Large text/buttons >= 3:1 | UI components (WCAG 1.4.11) >= 3:1

## Executive Summary

- **Light mode**: 71 pairings tested, **21 failures** (all border/UI component contrast)
- **Dark mode**: 71 pairings tested, **26 failures** (6 button text + 20 border/UI)
- **Dark mode parity gaps**: 87 semantic tokens missing `.dark` overrides (all safe -- primitives change)
- **Broken references**: 4 (shadow aliases -- false positives, not color tokens)
- **Missing fg tokens**: 0
- **Orphaned primitives**: 83 (many are expected -- full 12-step scales, only subsets used semantically)

### Critical Findings

1. **ALL step-7 on step-3 border pairings fail** in both modes (~2.1-2.6:1 vs 3:1 required). This is a systemic issue in the 12-step scale design: the L gap between step 3 (0.93) and step 7 (0.70) only yields ~2.2:1.
2. **ALL surface border tokens fail** against surface backgrounds in both modes. `--color-surface-border` (step 5) on `--color-surface-base` (step 2) is only 1.50:1.
3. **Dark mode button text (fg on -9) fails for ALL status colors**. The dark `-fg` token resolves to `--neutral-12` (L=0.88) but dark step-9 is L=0.63, giving only ~2.3-2.7:1.

---

## Light Mode Contrast Matrix

| Foreground | Background | OKLCH FG | OKLCH BG | Ratio | Threshold | Result |
|---|---|---|---|---|---|---|
| `--color-surface-fg` | `--color-surface-base` | oklch(0.32 0.004 350) | oklch(0.97 0.001 350) | 11.65:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg` | `--color-surface-raised` | oklch(0.32 0.004 350) | oklch(0.99 0.000 350) | 12.35:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg-muted` | `--color-surface-base` | oklch(0.43 0.007 350) | oklch(0.97 0.001 350) | 7.46:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg-muted` | `--color-surface-raised` | oklch(0.43 0.007 350) | oklch(0.99 0.000 350) | 7.91:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg-subtle` | `--color-surface-base` | oklch(0.62 0.009 350) | oklch(0.97 0.001 350) | 3.35:1 | 3:1 (UI) | PASS |
| `--color-surface-fg-subtle` | `--color-surface-raised` | oklch(0.62 0.009 350) | oklch(0.99 0.000 350) | 3.55:1 | 3:1 (UI) | PASS |
| `--color-surface-fg-disabled` | `--color-surface-base` | oklch(0.62 0.009 350) | oklch(0.97 0.001 350) | 3.35:1 | N/A (disabled) | EXEMPT |
| `--color-surface-fg-disabled` | `--color-surface-raised` | oklch(0.62 0.009 350) | oklch(0.99 0.000 350) | 3.55:1 | N/A (disabled) | EXEMPT |
| `--color-surface-inverted-fg` | `--color-surface-inverted` | oklch(0.99 0.000 350) | oklch(0.32 0.004 350) | 12.35:1 | 4.5:1 (normal) | PASS |
| `--color-accent-fg` | `--color-accent-9` | oklch(0.99 0.000 350) | oklch(0.55 0.19 360) | 5.24:1 | 3:1 (large) | PASS |
| `--color-accent-11` | `--color-accent-2` | oklch(0.43 0.14 360) | oklch(0.97 0.015 360) | 7.99:1 | 4.5:1 (normal) | PASS |
| `--color-accent-11` | `--color-accent-3` | oklch(0.43 0.14 360) | oklch(0.93 0.035 360) | 7.04:1 | 4.5:1 (normal) | PASS |
| `--color-accent-12` | `--color-surface-base` | oklch(0.32 0.08 360) | oklch(0.97 0.001 350) | 12.08:1 | 4.5:1 (normal) | PASS |
| `--color-accent-12` | `--color-surface-raised` | oklch(0.32 0.08 360) | oklch(0.99 0.000 350) | 12.80:1 | 4.5:1 (normal) | PASS |
| `--color-secondary-fg` | `--color-secondary-9` | oklch(0.99 0.000 350) | oklch(0.55 0.12 300) | 4.95:1 | 3:1 (large) | PASS |
| `--color-secondary-11` | `--color-secondary-2` | oklch(0.43 0.088 300) | oklch(0.97 0.010 300) | 7.69:1 | 4.5:1 (normal) | PASS |
| `--color-secondary-11` | `--color-secondary-3` | oklch(0.43 0.088 300) | oklch(0.93 0.022 300) | 6.80:1 | 4.5:1 (normal) | PASS |
| `--color-error-fg` | `--color-error-9` | oklch(0.99 0.000 350) | oklch(0.55 0.18 25) | 5.17:1 | 3:1 (large) | PASS |
| `--color-error-11` | `--color-error-2` | oklch(0.43 0.133 25) | oklch(0.97 0.014 25) | 7.92:1 | 4.5:1 (normal) | PASS |
| `--color-error-11` | `--color-error-3` | oklch(0.43 0.133 25) | oklch(0.93 0.033 25) | 6.98:1 | 4.5:1 (normal) | PASS |
| `--color-error-11` | `--color-surface-base` | oklch(0.43 0.133 25) | oklch(0.97 0.001 350) | 7.95:1 | 4.5:1 (normal) | PASS |
| `--color-error-11` | `--color-surface-raised` | oklch(0.43 0.133 25) | oklch(0.99 0.000 350) | 8.43:1 | 4.5:1 (normal) | PASS |
| `--color-success-fg` | `--color-success-9` | oklch(0.99 0.000 350) | oklch(0.55 0.14 145) | 4.44:1 | 3:1 (large) | PASS |
| `--color-success-11` | `--color-success-2` | oklch(0.43 0.103 145) | oklch(0.97 0.011 145) | 7.13:1 | 4.5:1 (normal) | PASS |
| `--color-success-11` | `--color-success-3` | oklch(0.43 0.103 145) | oklch(0.93 0.026 145) | 6.36:1 | 4.5:1 (normal) | PASS |
| `--color-success-11` | `--color-surface-base` | oklch(0.43 0.103 145) | oklch(0.97 0.001 350) | 7.10:1 | 4.5:1 (normal) | PASS |
| `--color-success-11` | `--color-surface-raised` | oklch(0.43 0.103 145) | oklch(0.99 0.000 350) | 7.53:1 | 4.5:1 (normal) | PASS |
| `--color-warning-fg` | `--color-warning-9` | oklch(0.25 0.01 55) | oklch(0.78 0.16 65) | 7.74:1 | 3:1 (large) | PASS |
| `--color-warning-11` | `--color-warning-2` | oklch(0.42 0.12 55) | oklch(0.96 0.04 70) | 7.72:1 | 4.5:1 (normal) | PASS |
| `--color-warning-11` | `--color-warning-3` | oklch(0.42 0.12 55) | oklch(0.92 0.08 70) | 6.73:1 | 4.5:1 (normal) | PASS |
| `--color-warning-11` | `--color-surface-base` | oklch(0.42 0.12 55) | oklch(0.97 0.001 350) | 8.06:1 | 4.5:1 (normal) | PASS |
| `--color-warning-11` | `--color-surface-raised` | oklch(0.42 0.12 55) | oklch(0.99 0.000 350) | 8.55:1 | 4.5:1 (normal) | PASS |
| `--color-info-fg` | `--color-info-9` | oklch(0.99 0.000 350) | oklch(0.55 0.12 240) | 4.64:1 | 3:1 (large) | PASS |
| `--color-info-11` | `--color-info-2` | oklch(0.43 0.088 240) | oklch(0.97 0.010 240) | 7.35:1 | 4.5:1 (normal) | PASS |
| `--color-info-11` | `--color-info-3` | oklch(0.43 0.088 240) | oklch(0.93 0.022 240) | 6.54:1 | 4.5:1 (normal) | PASS |
| `--color-info-11` | `--color-surface-base` | oklch(0.43 0.088 240) | oklch(0.97 0.001 350) | 7.34:1 | 4.5:1 (normal) | PASS |
| `--color-info-11` | `--color-surface-raised` | oklch(0.43 0.088 240) | oklch(0.99 0.000 350) | 7.78:1 | 4.5:1 (normal) | PASS |
| `--teal-11` | `--teal-3` | oklch(0.43 0.074 175) | oklch(0.93 0.018 175) | 6.38:1 | 4.5:1 (normal) | PASS |
| `--amber-11` | `--amber-3` | oklch(0.43 0.088 70) | oklch(0.93 0.022 70) | 6.71:1 | 4.5:1 (normal) | PASS |
| `--slate-11` | `--slate-3` | oklch(0.43 0.030 260) | oklch(0.93 0.007 260) | 6.60:1 | 4.5:1 (normal) | PASS |
| `--indigo-11` | `--indigo-3` | oklch(0.43 0.103 275) | oklch(0.93 0.026 275) | 6.75:1 | 4.5:1 (normal) | PASS |
| `--cyan-11` | `--cyan-3` | oklch(0.43 0.074 210) | oklch(0.93 0.018 210) | 6.43:1 | 4.5:1 (normal) | PASS |
| `--orange-11` | `--orange-3` | oklch(0.43 0.103 50) | oklch(0.93 0.026 50) | 6.82:1 | 4.5:1 (normal) | PASS |
| `--emerald-11` | `--emerald-3` | oklch(0.43 0.088 160) | oklch(0.93 0.022 160) | 6.36:1 | 4.5:1 (normal) | PASS |
| `--teal-7` | `--teal-3` | oklch(0.70 0.074 175) | oklch(0.93 0.018 175) | **2.11:1** | 3:1 (UI) | **FAIL** |
| `--amber-7` | `--amber-3` | oklch(0.70 0.088 70) | oklch(0.93 0.022 70) | **2.20:1** | 3:1 (UI) | **FAIL** |
| `--slate-7` | `--slate-3` | oklch(0.70 0.030 260) | oklch(0.93 0.007 260) | **2.17:1** | 3:1 (UI) | **FAIL** |
| `--indigo-7` | `--indigo-3` | oklch(0.70 0.103 275) | oklch(0.93 0.026 275) | **2.20:1** | 3:1 (UI) | **FAIL** |
| `--cyan-7` | `--cyan-3` | oklch(0.70 0.074 210) | oklch(0.93 0.018 210) | **2.13:1** | 3:1 (UI) | **FAIL** |
| `--orange-7` | `--orange-3` | oklch(0.70 0.103 50) | oklch(0.93 0.026 50) | **2.23:1** | 3:1 (UI) | **FAIL** |
| `--emerald-7` | `--emerald-3` | oklch(0.70 0.088 160) | oklch(0.93 0.022 160) | **2.11:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border` | `--color-surface-base` | oklch(0.84 0.004 350) | oklch(0.97 0.001 350) | **1.50:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border` | `--color-surface-raised` | oklch(0.84 0.004 350) | oklch(0.99 0.000 350) | **1.59:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-strong` | `--color-surface-base` | oklch(0.78 0.005 350) | oklch(0.97 0.001 350) | **1.84:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-strong` | `--color-surface-raised` | oklch(0.78 0.005 350) | oklch(0.99 0.000 350) | **1.95:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-subtle` | `--color-surface-base` | oklch(0.89 0.003 350) | oklch(0.97 0.001 350) | **1.28:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-subtle` | `--color-surface-raised` | oklch(0.89 0.003 350) | oklch(0.99 0.000 350) | **1.35:1** | 3:1 (UI) | **FAIL** |
| `--color-error-7` | `--color-error-2` | oklch(0.70 0.133 25) | oklch(0.97 0.014 25) | **2.58:1** | 3:1 (UI) | **FAIL** |
| `--color-error-7` | `--color-error-3` | oklch(0.70 0.133 25) | oklch(0.93 0.033 25) | **2.28:1** | 3:1 (UI) | **FAIL** |
| `--color-success-7` | `--color-success-2` | oklch(0.70 0.103 145) | oklch(0.97 0.011 145) | **2.36:1** | 3:1 (UI) | **FAIL** |
| `--color-success-7` | `--color-success-3` | oklch(0.70 0.103 145) | oklch(0.93 0.026 145) | **2.11:1** | 3:1 (UI) | **FAIL** |
| `--color-warning-7` | `--color-warning-2` | oklch(0.75 0.17 65) | oklch(0.96 0.04 70) | **2.03:1** | 3:1 (UI) | **FAIL** |
| `--color-warning-7` | `--color-warning-3` | oklch(0.75 0.17 65) | oklch(0.92 0.08 70) | **1.77:1** | 3:1 (UI) | **FAIL** |
| `--color-info-7` | `--color-info-2` | oklch(0.70 0.088 240) | oklch(0.97 0.010 240) | **2.42:1** | 3:1 (UI) | **FAIL** |
| `--color-info-7` | `--color-info-3` | oklch(0.70 0.088 240) | oklch(0.93 0.022 240) | **2.15:1** | 3:1 (UI) | **FAIL** |
| `--color-accent-9` | `--color-surface-base` | oklch(0.55 0.19 360) | oklch(0.97 0.001 350) | 4.94:1 | 3:1 (UI) | PASS |
| `--color-accent-9` | `--color-surface-raised` | oklch(0.55 0.19 360) | oklch(0.99 0.000 350) | 5.24:1 | 3:1 (UI) | PASS |
| `--color-error-9` | `--color-surface-base` | oklch(0.55 0.18 25) | oklch(0.97 0.001 350) | 4.87:1 | 3:1 (UI) | PASS |
| `--color-error-9` | `--color-surface-raised` | oklch(0.55 0.18 25) | oklch(0.99 0.000 350) | 5.17:1 | 3:1 (UI) | PASS |
| `--color-success-9` | `--color-surface-base` | oklch(0.55 0.14 145) | oklch(0.97 0.001 350) | 4.19:1 | 3:1 (UI) | PASS |
| `--color-success-9` | `--color-surface-raised` | oklch(0.55 0.14 145) | oklch(0.99 0.000 350) | 4.44:1 | 3:1 (UI) | PASS |

### Light Mode Failures (21)

All failures are in the **border/UI component** category (WCAG 1.4.11, 3:1 threshold):

**Surface borders** (most severe -- ratios as low as 1.28:1):
- `--color-surface-border-subtle` on surfaces: 1.28-1.35:1
- `--color-surface-border` on surfaces: 1.50-1.59:1
- `--color-surface-border-strong` on surfaces: 1.84-1.95:1

**Status borders** (step-7 on step-2/3):
- Error-7 on error-2/3: 2.28-2.58:1
- Success-7 on success-2/3: 2.11-2.36:1
- Warning-7 on warning-2/3: 1.77-2.03:1
- Info-7 on info-2/3: 2.15-2.42:1

**Category borders** (step-7 on step-3):
- All 7 category scales: 2.11-2.23:1

---

## Dark Mode Contrast Matrix

| Foreground | Background | OKLCH FG | OKLCH BG | Ratio | Threshold | Result |
|---|---|---|---|---|---|---|
| `--color-surface-fg` | `--color-surface-base` | oklch(0.88 0.002 350) | oklch(0.11 0.000 350) | 14.24:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg` | `--color-surface-raised` | oklch(0.88 0.002 350) | oklch(0.17 0.001 350) | 13.31:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg-muted` | `--color-surface-base` | oklch(0.76 0.006 350) | oklch(0.11 0.000 350) | 9.50:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg-muted` | `--color-surface-raised` | oklch(0.76 0.006 350) | oklch(0.17 0.001 350) | 8.88:1 | 4.5:1 (normal) | PASS |
| `--color-surface-fg-subtle` | `--color-surface-base` | oklch(0.53 0.009 350) | oklch(0.11 0.000 350) | 3.86:1 | 3:1 (UI) | PASS |
| `--color-surface-fg-subtle` | `--color-surface-raised` | oklch(0.53 0.009 350) | oklch(0.17 0.001 350) | 3.61:1 | 3:1 (UI) | PASS |
| `--color-surface-fg-disabled` | `--color-surface-base` | oklch(0.53 0.009 350) | oklch(0.11 0.000 350) | 3.86:1 | N/A (disabled) | EXEMPT |
| `--color-surface-fg-disabled` | `--color-surface-raised` | oklch(0.53 0.009 350) | oklch(0.17 0.001 350) | 3.61:1 | N/A (disabled) | EXEMPT |
| `--color-surface-inverted-fg` | `--color-surface-inverted` | oklch(0.11 0.000 350) | oklch(0.88 0.002 350) | 14.24:1 | 4.5:1 (normal) | PASS |
| `--color-accent-fg` | `--color-accent-9` | oklch(0.88 0.002 350) | oklch(0.63 0.209 360) | **2.72:1** | 3:1 (large) | **FAIL** |
| `--color-accent-11` | `--color-accent-2` | oklch(0.76 0.13 360) | oklch(0.17 0.015 360) | 8.41:1 | 4.5:1 (normal) | PASS |
| `--color-accent-11` | `--color-accent-3` | oklch(0.76 0.13 360) | oklch(0.23 0.04 360) | 7.50:1 | 4.5:1 (normal) | PASS |
| `--color-accent-12` | `--color-surface-base` | oklch(0.88 0.05 360) | oklch(0.11 0.000 350) | 13.96:1 | 4.5:1 (normal) | PASS |
| `--color-accent-12` | `--color-surface-raised` | oklch(0.88 0.05 360) | oklch(0.17 0.001 350) | 13.05:1 | 4.5:1 (normal) | PASS |
| `--color-secondary-fg` | `--color-secondary-9` | oklch(0.88 0.002 350) | oklch(0.63 0.132 300) | **2.56:1** | 3:1 (large) | **FAIL** |
| `--color-secondary-11` | `--color-secondary-2` | oklch(0.76 0.082 300) | oklch(0.17 0.010 300) | 8.70:1 | 4.5:1 (normal) | PASS |
| `--color-secondary-11` | `--color-secondary-3` | oklch(0.76 0.082 300) | oklch(0.23 0.025 300) | 7.72:1 | 4.5:1 (normal) | PASS |
| `--color-error-fg` | `--color-error-9` | oklch(0.88 0.002 350) | oklch(0.63 0.198 25) | **2.68:1** | 3:1 (large) | **FAIL** |
| `--color-error-11` | `--color-error-2` | oklch(0.76 0.123 25) | oklch(0.17 0.014 25) | 8.49:1 | 4.5:1 (normal) | PASS |
| `--color-error-11` | `--color-error-3` | oklch(0.76 0.123 25) | oklch(0.23 0.038 25) | 7.56:1 | 4.5:1 (normal) | PASS |
| `--color-error-11` | `--color-surface-base` | oklch(0.76 0.123 25) | oklch(0.11 0.000 350) | 9.06:1 | 4.5:1 (normal) | PASS |
| `--color-error-11` | `--color-surface-raised` | oklch(0.76 0.123 25) | oklch(0.17 0.001 350) | 8.47:1 | 4.5:1 (normal) | PASS |
| `--color-success-fg` | `--color-success-9` | oklch(0.88 0.002 350) | oklch(0.63 0.154 145) | **2.29:1** | 3:1 (large) | **FAIL** |
| `--color-success-11` | `--color-success-2` | oklch(0.76 0.096 145) | oklch(0.17 0.011 145) | 9.21:1 | 4.5:1 (normal) | PASS |
| `--color-success-11` | `--color-success-3` | oklch(0.76 0.096 145) | oklch(0.23 0.030 145) | 8.09:1 | 4.5:1 (normal) | PASS |
| `--color-success-11` | `--color-surface-base` | oklch(0.76 0.096 145) | oklch(0.11 0.000 350) | 9.87:1 | 4.5:1 (normal) | PASS |
| `--color-success-11` | `--color-surface-raised` | oklch(0.76 0.096 145) | oklch(0.17 0.001 350) | 9.23:1 | 4.5:1 (normal) | PASS |
| `--color-warning-fg` | `--color-warning-9` | oklch(0.88 0.002 350) | oklch(0.72 0.17 65) | **1.79:1** | 3:1 (large) | **FAIL** |
| `--color-warning-11` | `--color-warning-2` | oklch(0.82 0.11 65) | oklch(0.18 0.02 65) | 10.57:1 | 4.5:1 (normal) | PASS |
| `--color-warning-11` | `--color-warning-3` | oklch(0.82 0.11 65) | oklch(0.25 0.045 65) | 9.05:1 | 4.5:1 (normal) | PASS |
| `--color-warning-11` | `--color-surface-base` | oklch(0.82 0.11 65) | oklch(0.11 0.000 350) | 11.48:1 | 4.5:1 (normal) | PASS |
| `--color-warning-11` | `--color-surface-raised` | oklch(0.82 0.11 65) | oklch(0.17 0.001 350) | 10.73:1 | 4.5:1 (normal) | PASS |
| `--color-info-fg` | `--color-info-9` | oklch(0.88 0.002 350) | oklch(0.63 0.132 240) | **2.40:1** | 3:1 (large) | **FAIL** |
| `--color-info-11` | `--color-info-2` | oklch(0.76 0.082 240) | oklch(0.17 0.010 240) | 9.01:1 | 4.5:1 (normal) | PASS |
| `--color-info-11` | `--color-info-3` | oklch(0.76 0.082 240) | oklch(0.23 0.025 240) | 7.94:1 | 4.5:1 (normal) | PASS |
| `--color-info-11` | `--color-surface-base` | oklch(0.76 0.082 240) | oklch(0.11 0.000 350) | 9.64:1 | 4.5:1 (normal) | PASS |
| `--color-info-11` | `--color-surface-raised` | oklch(0.76 0.082 240) | oklch(0.17 0.001 350) | 9.02:1 | 4.5:1 (normal) | PASS |
| `--teal-11` | `--teal-3` | oklch(0.76 0.068 175) | oklch(0.23 0.021 175) | 8.05:1 | 4.5:1 (normal) | PASS |
| `--amber-11` | `--amber-3` | oklch(0.76 0.082 70) | oklch(0.23 0.025 70) | 7.79:1 | 4.5:1 (normal) | PASS |
| `--slate-11` | `--slate-3` | oklch(0.76 0.027 260) | oklch(0.23 0.008 260) | 7.87:1 | 4.5:1 (normal) | PASS |
| `--indigo-11` | `--indigo-3` | oklch(0.76 0.096 275) | oklch(0.23 0.030 275) | 7.78:1 | 4.5:1 (normal) | PASS |
| `--cyan-11` | `--cyan-3` | oklch(0.76 0.068 210) | oklch(0.23 0.021 210) | 8.01:1 | 4.5:1 (normal) | PASS |
| `--orange-11` | `--orange-3` | oklch(0.76 0.096 50) | oklch(0.23 0.030 50) | 7.70:1 | 4.5:1 (normal) | PASS |
| `--emerald-11` | `--emerald-3` | oklch(0.76 0.082 160) | oklch(0.23 0.025 160) | 8.08:1 | 4.5:1 (normal) | PASS |
| `--teal-7` | `--teal-3` | oklch(0.44 0.068 175) | oklch(0.23 0.021 175) | **2.24:1** | 3:1 (UI) | **FAIL** |
| `--amber-7` | `--amber-3` | oklch(0.44 0.082 70) | oklch(0.23 0.025 70) | **2.14:1** | 3:1 (UI) | **FAIL** |
| `--slate-7` | `--slate-3` | oklch(0.44 0.027 260) | oklch(0.23 0.008 260) | **2.17:1** | 3:1 (UI) | **FAIL** |
| `--indigo-7` | `--indigo-3` | oklch(0.44 0.096 275) | oklch(0.23 0.030 275) | **2.13:1** | 3:1 (UI) | **FAIL** |
| `--cyan-7` | `--cyan-3` | oklch(0.44 0.068 210) | oklch(0.23 0.021 210) | **2.23:1** | 3:1 (UI) | **FAIL** |
| `--orange-7` | `--orange-3` | oklch(0.44 0.096 50) | oklch(0.23 0.030 50) | **2.11:1** | 3:1 (UI) | **FAIL** |
| `--emerald-7` | `--emerald-3` | oklch(0.44 0.082 160) | oklch(0.23 0.025 160) | **2.25:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border` | `--color-surface-base` | oklch(0.23 0.002 350) | oklch(0.11 0.000 350) | **1.21:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border` | `--color-surface-raised` | oklch(0.23 0.002 350) | oklch(0.17 0.001 350) | **1.13:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-strong` | `--color-surface-base` | oklch(0.29 0.003 350) | oklch(0.11 0.000 350) | **1.45:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-strong` | `--color-surface-raised` | oklch(0.29 0.003 350) | oklch(0.17 0.001 350) | **1.35:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-subtle` | `--color-surface-base` | oklch(0.17 0.001 350) | oklch(0.11 0.000 350) | **1.07:1** | 3:1 (UI) | **FAIL** |
| `--color-surface-border-subtle` | `--color-surface-raised` | oklch(0.17 0.001 350) | oklch(0.17 0.001 350) | **1.00:1** | 3:1 (UI) | **FAIL** |
| `--color-error-7` | `--color-error-2` | oklch(0.44 0.123 25) | oklch(0.17 0.014 25) | **2.32:1** | 3:1 (UI) | **FAIL** |
| `--color-error-7` | `--color-error-3` | oklch(0.44 0.123 25) | oklch(0.23 0.038 25) | **2.06:1** | 3:1 (UI) | **FAIL** |
| `--color-success-7` | `--color-success-2` | oklch(0.44 0.096 145) | oklch(0.17 0.011 145) | **2.56:1** | 3:1 (UI) | **FAIL** |
| `--color-success-7` | `--color-success-3` | oklch(0.44 0.096 145) | oklch(0.23 0.030 145) | **2.25:1** | 3:1 (UI) | **FAIL** |
| `--color-warning-7` | `--color-warning-2` | oklch(0.50 0.13 65) | oklch(0.18 0.02 65) | 3.04:1 | 3:1 (UI) | PASS |
| `--color-warning-7` | `--color-warning-3` | oklch(0.50 0.13 65) | oklch(0.25 0.045 65) | **2.60:1** | 3:1 (UI) | **FAIL** |
| `--color-info-7` | `--color-info-2` | oklch(0.44 0.082 240) | oklch(0.17 0.010 240) | **2.49:1** | 3:1 (UI) | **FAIL** |
| `--color-info-7` | `--color-info-3` | oklch(0.44 0.082 240) | oklch(0.23 0.025 240) | **2.19:1** | 3:1 (UI) | **FAIL** |
| `--color-accent-9` | `--color-surface-base` | oklch(0.63 0.209 360) | oklch(0.11 0.000 350) | 5.24:1 | 3:1 (UI) | PASS |
| `--color-accent-9` | `--color-surface-raised` | oklch(0.63 0.209 360) | oklch(0.17 0.001 350) | 4.90:1 | 3:1 (UI) | PASS |
| `--color-error-9` | `--color-surface-base` | oklch(0.63 0.198 25) | oklch(0.11 0.000 350) | 5.31:1 | 3:1 (UI) | PASS |
| `--color-error-9` | `--color-surface-raised` | oklch(0.63 0.198 25) | oklch(0.17 0.001 350) | 4.97:1 | 3:1 (UI) | PASS |
| `--color-success-9` | `--color-surface-base` | oklch(0.63 0.154 145) | oklch(0.11 0.000 350) | 6.22:1 | 3:1 (UI) | PASS |
| `--color-success-9` | `--color-surface-raised` | oklch(0.63 0.154 145) | oklch(0.17 0.001 350) | 5.81:1 | 3:1 (UI) | PASS |

### Dark Mode Failures (26)

**Button text on solid fills (NEW dark-only issue -- 6 failures)**:
- `--color-accent-fg` on `--color-accent-9`: **2.72:1** (need 3:1)
- `--color-secondary-fg` on `--color-secondary-9`: **2.56:1** (need 3:1)
- `--color-error-fg` on `--color-error-9`: **2.68:1** (need 3:1)
- `--color-success-fg` on `--color-success-9`: **2.29:1** (need 3:1)
- `--color-warning-fg` on `--color-warning-9`: **1.79:1** (need 3:1)
- `--color-info-fg` on `--color-info-9`: **2.40:1** (need 3:1)

Root cause: Dark mode sets `--color-*-fg: var(--neutral-12)` which resolves to L=0.88, and dark step-9 is L=0.63. Both are relatively bright, so contrast is poor. Light mode works because light `-fg` is L=0.99 and light step-9 is L=0.55 (wider gap).

**Surface borders** (same systemic issue as light, worse in dark):
- `--color-surface-border-subtle` on `--color-surface-raised`: **1.00:1** (identical!)
- `--color-surface-border-subtle` on `--color-surface-base`: **1.07:1**
- `--color-surface-border` on `--color-surface-raised`: **1.13:1**
- `--color-surface-border` on `--color-surface-base`: **1.21:1**
- `--color-surface-border-strong` on `--color-surface-raised`: **1.35:1**
- `--color-surface-border-strong` on `--color-surface-base`: **1.45:1**

**Status + category borders**: same pattern as light mode (20 failures).

---

## Dark Mode Parity Gaps

87 semantic tokens defined in `:root` have **no `.dark` override** in semantic.css. However, **all 87 are safe** because they reference primitive tokens (e.g., `var(--pink-9)`) that DO change in the `.dark` block of primitives.css.

The semantic `.dark` block only overrides tokens that need different PRIMITIVE mappings in dark mode (e.g., `--color-accent-fg` changes from `var(--neutral-1)` to `var(--neutral-12)`). Tokens that just pass through to a primitive (like `--color-accent-9: var(--pink-9)`) correctly inherit dark values when `--pink-9` changes.

**No action needed** -- the two-layer architecture handles this correctly.

Notable: the following tokens that DO get explicit `.dark` overrides in semantic.css:
- `--color-accent-fg`, `--color-secondary-fg`, `--color-error-fg`, `--color-success-fg`, `--color-info-fg` (flip to dark text)
- `--color-warning-fg` (flip to `--neutral-12`)
- `--color-warning-2` through `--color-warning-11` (re-mapped to dark amber-bright)
- `--color-surface-base`, `--color-surface-raised`, `--color-surface-border*`, `--color-surface-overlay`
- `--color-skeleton-*`
- `--color-overlay`
- Various shadow and glow tokens

---

## Naming Consistency

### Broken References (semantic -> non-existent primitive)

4 false positives -- these are shadow aliases referencing other shadows (not color tokens):
- `--shadow-raised` -> `--shadow-xs` (valid shadow alias)
- `--shadow-raised-hover` -> `--shadow-sm` (valid shadow alias)
- `--shadow-floating` -> `--shadow-md` (valid shadow alias)
- `--shadow-overlay` -> `--shadow-lg` (valid shadow alias)

The parser only tracked oklch primitives, not shadow definitions. **No actual broken color references.**

### Missing fg Tokens

None -- every `--color-*-9` semantic token has a corresponding `--color-*-fg`.

### Orphaned Primitives (never referenced by any semantic token)

83 orphaned primitives across all color scales. This is largely expected behavior:

**Full 12-step scales define steps 1-12, but semantic tokens only use specific subsets.**

Steps typically unreferenced semantically:
- **Step 1** (app background): Only `--neutral-1` is used (via `--color-surface-raised`)
- **Steps 4-6, 8**: Intermediate states, used directly by component code rather than semantic tokens
- **Step 10**: Solid hover, used directly
- **Step 12**: High-contrast text, only referenced for a few scales

Fully orphaned scales (no semantic tokens at all):
- **`--yellow-*`**: ALL 12 steps are orphaned. Yellow has no semantic or category mapping.

Scales with heavy orphaning (many steps unreferenced):
- `--amber-*`: Only steps 3, 7, 9, 11 used (via category tokens)
- `--slate-*`: Only steps 3, 7, 9, 11 used (via category tokens)
- `--cyan-*`, `--indigo-*`, `--orange-*`, `--emerald-*`, `--teal-*`: Same pattern

---

## Recommendations

### P0: Dark Mode Button Text (6 failures)

**Issue**: `--color-*-fg` resolves to `--neutral-12` (L=0.88) in dark mode, but dark step-9 fills are L=0.63. The L gap (0.25) is too small.

**Fix options**:
1. **Use dark neutral-1 (L=0.11) as fg in dark mode** -- dark text on bright fills. This is what light mode does (L=0.99 text on L=0.55 fill). Would give ~5:1+ contrast.
2. **Boost dark step-9 lightness** to create more gap with L=0.88 fg. Would need step-9 at ~L=0.50 or lower (currently 0.63).
3. **Per-status fg tokens** -- e.g., `--color-warning-fg: oklch(0.15 0.01 55)` in dark mode (very dark text on bright amber).

**Recommendation**: Option 1 is simplest. Change dark fg tokens back to `var(--neutral-1)` (dark mode neutral-1 = L=0.11 = very dark). This gives dark text on bright colored fills, matching the light mode pattern of contrasting text. BUT -- this reverses the current design intent where dark mode uses light text. You may want to instead darken step-9 in dark mode (option 2).

### P1: Surface Border Contrast (systemic, both modes)

**Issue**: All surface border tokens (step 5, 6, 4) have insufficient contrast against surface backgrounds (step 2, 1). The L gap between these steps is only 0.05-0.13, producing 1.0-1.95:1 ratios.

**Context**: This may be intentional -- many modern design systems (Linear, Stripe) use low-contrast borders for visual subtlety, relying on shadow/elevation to create card boundaries rather than borders. WCAG 1.4.11 technically requires 3:1 for "visual information required to identify UI components", which could be argued doesn't apply to decorative borders.

**If fixing is desired**:
- `--color-surface-border` should use step 7 (L=0.70) instead of step 5 (L=0.84) in light
- `--color-surface-border-strong` should use step 8 (L=0.62) instead of step 6 (L=0.78)
- Dark mode needs similarly stronger steps

**Recommendation**: Document the design rationale. If borders are purely decorative (cards use shadows + raised surfaces for separation), this is defensible. If borders are the primary visual boundary of form inputs, this needs fixing for WCAG 1.4.11.

### P1: Step-7 on Step-3 Border Contrast (systemic, both modes)

**Issue**: The 12-step scale design produces only ~2.1-2.3:1 contrast between step 7 (L=0.70) and step 3 (L=0.93). This is a mathematical consequence of the L values chosen.

**Fix**: Either darken step 7 (to ~L=0.60) or lighten step 3 (to ~L=0.96) to achieve 3:1. However, changing these globally would ripple through the entire design system.

**Alternative**: Use step 8 (L=0.62) instead of step 7 for borders on step-3 backgrounds. Step-8 on step-3 would give ~3.1:1 in light mode.

### P2: Orphaned Yellow Scale

The entire `--yellow-*` scale (12 tokens) has no semantic mapping. Either:
- Add `--color-category-yellow-*` tokens if this scale is intended for category use
- Remove the scale from primitives.css to reduce dead code

### P2: Orphaned Primitive Steps

Many intermediate steps (4, 5, 6, 8, 10) exist in primitives but have no semantic mapping. This is fine if components reference them directly, but verify that is actually the case. Otherwise, the semantic layer is incomplete.
