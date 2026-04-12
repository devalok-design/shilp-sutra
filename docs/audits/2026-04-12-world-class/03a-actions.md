# Action Components Audit -- Phase 3, Group A

**Phase:** 3a
**Auditor:** Claude
**Date:** 2026-04-12
**Components:** Button, ButtonGroup, ButtonProcessing, SplitButton, Toggle, ToggleGroup, SegmentedControl, Link, IconButton

## Overall Rating: Strong (Button excellent, secondary actions need work)

Button is genuinely one of the best implementations in a design system — two-axis variant system, async state machine, processing animation, Linear-tier polish. The gaps are in secondary action components: Toggle/ToggleGroup lack color axis and have inconsistent motion, SplitButton is untested, Link is minimal.

---

## Per-Component Ratings

| Component | API | Variants | Visual | Dark | A11y | Responsive | Motion | Bundle | Tests | Stories |
|-----------|-----|----------|--------|------|------|------------|--------|--------|-------|---------|
| **Button** | 9 | 10 | 9 | 9 | 8 | 7 | 10 | 7 | 8 | Yes |
| **ButtonGroup** | 9 | 8 | 8 | 8 | 9 | 7 | — | 8 | 7 | Yes |
| **ButtonProcessing** | 7 | — | 9 | — | — | — | 9 | 6 | 5 | Yes |
| **SplitButton** | 7 | 6 | 8 | 8 | 7 | 5 | 6 | 6 | **2** | Yes |
| **Toggle** | 6 | 5 | 6 | 8 | 9 | 6 | 7 | 6 | 9 | Yes |
| **ToggleGroup** | 7 | 5 | 5 | 8 | 9 | 6 | **4** | 6 | 9 | Yes |
| **SegmentedControl** | 8 | 6 | 9 | 8 | 9 | 5 | 9 | 7 | **2** | Yes |
| **Link** | 6 | **3** | 7 | 7 | 6 | 5 | 3 | 10 | **2** | Yes |
| **IconButton** | 9 | 8 | — | — | **10** | — | — | — | 9 | Yes |

---

## Cross-Check Results

### Variant Vocabulary Fragmentation (P1)

| Component | variant values | color values |
|-----------|---------------|-------------|
| Button | solid/soft/outline/ghost/link | accent/error/success/warning/neutral |
| SplitButton | solid/soft/outline (missing ghost/link) | accent/error/success/warning/neutral |
| Toggle | default/outline | **none (hardcoded accent)** |
| ToggleGroup | default/outline | **none** |
| SegmentedControl | default/accent | **none** |
| Link | **none** | **none** |
| IconButton | inherits Button | inherits Button |

**Severe fragmentation.** Only Button and SplitButton share the color axis.

### Size Scale Gaps

SplitButton missing `lg`. Toggle/ToggleGroup/SegmentedControl missing `xs`. Link has no size axis.

### Focus Ring Inconsistency

Button/Toggle/SegmentedControl: `ring-2 ring-accent-9 ring-offset-2`. SplitButton: `ring-inset` (acceptable for attached). Link: **missing ring-offset** (clips text).

### Disabled Treatment

Only Button has `cursor-not-allowed` + `saturate-[0.3]`. Others just do opacity + pointer-events-none.

### Motion/Tap Feedback

Button: rich `active:scale-[0.95]` + brightness + saturate. ToggleGroupItem: **zero motion** (Toggle has it, ToggleGroupItem doesn't). SplitButton: **zero tap feedback**. Major inconsistency.

---

## Findings

| # | Finding | Component | Priority | Effort |
|---|---------|-----------|----------|--------|
| 1 | No tests for SplitButton | SplitButton | **P0** | M |
| 2 | No tests for SegmentedControl | SegmentedControl | **P0** | M |
| 3 | No tests for Link | Link | **P0** | S |
| 4 | ToggleGroupItem has no tap animation | ToggleGroup | P1 | S |
| 5 | SplitButton has no tap feedback | SplitButton | P1 | S |
| 6 | Toggle/ToggleGroup missing color axis | Toggle, ToggleGroup | P1 | M |
| 7 | Link missing ring-offset-2 | Link | P1 | S |
| 8 | SplitButton missing `lg` size | SplitButton | P2 | S |
| 9 | SplitButton missing loading state | SplitButton | P2 | M |
| 10 | Disabled treatment inconsistency | SplitButton, Toggle, SC | P2 | S |
| 11 | Link has no variant/color/size system | Link | P2 | M |
| 12 | Link has no disabled state | Link | P2 | S |
| 13 | SegmentedControl missing fullWidth/orientation | SegmentedControl | P2 | M |
| 14 | Button doesn't default type="button" | Button | P2 | S |
| 15 | IconButton missing xs size | IconButton | P2 | S |
| 16 | ButtonProcessing duplicates useReducedMotion | ButtonProcessing | P3 | S |
| 17 | SplitButton duplicates variant styling | SplitButton | P3 | L |
| 18 | No async feedback announcement | Button | P3 | S |
| 19 | Button wrapper span always rendered | Button | P3 | M |
| 20 | SegmentedControl no color axis | SegmentedControl | P3 | M |

## Top 3 Actions

1. **P0 — Write tests for SplitButton, SegmentedControl, Link** (publish gates)
2. **P1 — Add tap feedback to ToggleGroupItem and SplitButton** (users notice inconsistency)
3. **P1 — Add color axis to Toggle/ToggleGroup** (blocks error/success toggle use cases)
