# Data Display & Media/Icon Audit -- Phase 3, Groups D+E

**Phase:** 3d + 3e
**Auditor:** Claude
**Date:** 2026-04-12
**Components:** Text, Code, Card, StatCard, Badge/BadgeGroup/BadgeIndicator, StatusDot, DeadlineIndicator, PriorityIndicator, Icon, IconButton, IconGroup, IconContext, Avatar, AvatarGroup

## Overall Rating: Strong

Text, Icon, Avatar, Badge are all professional-grade. Icon's per-size stroke weight tuning is industry-leading. Badge's 13+custom color system is excellent. Avatar's deterministic fallback colors are well-engineered. Main issues are accessibility gaps in BadgeIndicator/PriorityIndicator and a color mismatch between AvatarGroup indicators and Avatar rings.

---

## Per-Component Summary

### Group D — Data Display

| Component | API | Variants | Visual | A11y | Motion | Tests | Key Finding |
|-----------|-----|----------|--------|------|--------|-------|-------------|
| **Text** | A | A (16 variants) | A | A | N/A | A | @server-safe. Excellent. |
| **Code** | A- | B (2 variants) | A- | A | N/A | A | No size axis |
| **Card** | A | A- (4x7x3) | A | B+ | A | A | No keyboard handling for interactive cards |
| **StatCard** | A | A- | A | A | A | A | Sparkline injects per-instance `<style>` |
| **Badge** | A | A (4x13+custom) | A | A- | A | A | Excellent component |
| **BadgeGroup** | A- | B+ | B+ | **B** | B | A | Missing role="group" |
| **BadgeIndicator** | A | A- | A | **B+** | A | A | Missing aria-label on count |
| **StatusDot** | A | A- | A | A | B+ | A- | Tests lack axe audit |
| **DeadlineIndicator** | A- | B | A- | **B** | B+ | A | No `<time>` element; no useReducedMotion |
| **PriorityIndicator** | B+ | B | A- | **B** | B+ | B+ | Compact mode uses title only (not a11y) |

### Group E — Media & Icons

| Component | API | Variants | Visual | A11y | Motion | Tests | Key Finding |
|-----------|-----|----------|--------|------|--------|-------|-------------|
| **Icon** | A | A (6 sizes, 3 strokes) | A | A | A | A | Per-size stroke tuning. Excellent. |
| **IconButton** | A | B+ (3 sizes) | A | **A** (required aria-label) | A | A | Missing xs size |
| **IconGroup** | A | B+ | A- | A | N/A | A | Clean |
| **IconContext** | A | A | — | — | — | B | No dedicated tests |
| **Avatar** | A | A (5x3+status+ring+badge) | A | A | A | A | Excellent |
| **AvatarGroup** | A | A- | A | A- | A- | A | Indicator lead color ≠ Avatar ring lead color |

---

## Critical Cross-Check Findings

### CC-1: StatusDot vocabulary vs everything else
StatusDot uses `healthy/critical` while Card/Badge/Alert use `success/error`. No mapping function. Consumer must manually translate.
**Priority:** P3 (would be breaking change)

### CC-2: AvatarGroup vs Avatar ring color mismatch (P1)
`lead` indicator = `bg-warning-9` in AvatarGroup, but `lead` ring = `ring-accent-7` in Avatar. Same role, two different colors. This is a bug.
**Priority:** P1 | **Effort:** S

### CC-3: Color vocabulary breadth
Badge has 13 colors + custom. Card has 7 colors. StatusDot has 5 statuses. BadgeIndicator has 5 colors. No shared superset.

---

## Findings (Priority Order)

| # | Finding | Component | Priority | Effort |
|---|---------|-----------|----------|--------|
| 1 | AvatarGroup indicator `lead`=warning-9 vs Avatar ring `lead`=accent-7 | AvatarGroup/Avatar | **P1** | S |
| 2 | BadgeGroup missing `role="group"` and `aria-label` | BadgeGroup | P2 | S |
| 3 | BadgeIndicator no `aria-label`/`role="status"` on indicator span | BadgeIndicator | P2 | S |
| 4 | DeadlineIndicator missing `useReducedMotion` for pulse | DeadlineIndicator | P2 | S |
| 5 | DeadlineIndicator should use `<time>` element with dateTime | DeadlineIndicator | P2 | S |
| 6 | PriorityIndicator compact uses `title` only (not keyboard-accessible) | PriorityIndicator | P2 | S |
| 7 | PriorityIndicator missing `useReducedMotion` for URGENT pulse | PriorityIndicator | P2 | S |
| 8 | StatusDot tests lack axe audit and ring variant coverage | StatusDot | P2 | S |
| 9 | StatCard no `size` axis for density control | StatCard | P2 | M |
| 10 | IconButton missing `xs` size | IconButton | P3 | S |
| 11 | Code no `size` axis | Code | P3 | S |
| 12 | Card lacks category colors that Badge has | Card | P3 | M |
| 13 | StatCard sparkline injects `<style>` per instance | StatCard | P3 | M |

## Top 3 Actions

1. **P1 — Fix AvatarGroup/Avatar lead role color mismatch** (S effort): Bug — same role shows different colors.
2. **P2 — Add ARIA to BadgeGroup and BadgeIndicator** (S effort): Missing role="group" and aria-label/role="status".
3. **P2 — Add useReducedMotion to DeadlineIndicator and PriorityIndicator** (S effort): Pulse animations without reduced motion check.
