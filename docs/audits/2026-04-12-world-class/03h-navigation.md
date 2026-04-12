# Navigation & Layout Audit -- Phase 3, Groups H+I

**Phase:** 3h + 3i
**Auditor:** Claude
**Date:** 2026-04-12

## Group H — Navigation: Overall Rating: B+ (Tabs strong, variant gaps across group)
## Group I — Layout: Overall Rating: B+ (Stack solid, Container needs responsive padding)

---

## Group H Key Findings

| Component | Overall | Key Finding |
|-----------|---------|-------------|
| **Tabs** | A- | No `orientation` prop — vertical tabs impossible |
| **Breadcrumb** | B+ | No size variant. Clean a11y (follows WAI-ARIA exactly) |
| **Pagination** | A- | Excellent `generatePagination` utility. No size/compact variants |
| **NavigationMenu** | B | Zero variant axes. Triplicated MutationObserver boilerplate. Only 1 story |
| **Menubar** | B+ | Full compound API. No responsive handling (desktop-only) |
| **Stepper** | B+ | Animated connector fill. Steps not clickable — can't navigate back |

## Group I Key Findings

| Component | Overall | Key Finding |
|-----------|---------|-------------|
| **Stack** | B+ | @server-safe. DS token gap enforcement. No responsive gap prop |
| **Container** | B | Fixed `px-ds-05` not responsive. Only 3 maxWidth presets |
| **Separator** | A- | 4 gradient variants. Bug: gradient direction broken on vertical |
| **AspectRatio** | B- | Thin wrapper. No named ratio presets |
| **Accordion** | B+ | Clean a11y. No size axis. Missing keyboard nav tests |
| **Collapsible** | B | Minimal — behavior primitive only. No variants |
| **MasterDetail** | B+ | Good responsive switching. `masterWidth` accepts raw CSS not tokens |

---

## P1 Findings

| # | Component | Finding | Priority | Effort |
|---|-----------|---------|----------|--------|
| 1 | Tabs | No `orientation` prop — vertical tabs impossible, no ArrowUp/Down | **P1** | M |
| 2 | Separator | Gradient variants hardcode `90deg` — broken on vertical | **P1** | S |
| 3 | Container | Fixed `px-ds-05` padding not responsive | **P1** | S |
| 4 | Stepper | Steps not clickable/focusable — can't navigate back | **P1** | M |

## P2 Findings

| # | Component | Finding | Priority | Effort |
|---|-----------|---------|----------|--------|
| 5 | Breadcrumb | No size variant | P2 | S |
| 6 | Pagination | No size/compact variant for mobile | P2 | M |
| 7 | NavigationMenu | Zero variant axes | P2 | M |
| 8 | NavigationMenu | Triplicated MutationObserver — extract to shared hook | P2 | S |
| 9 | Menubar | No responsive handling (desktop-only) | P2 | L |
| 10 | Stepper | Missing size and color axes | P2 | M |
| 11 | Accordion | No size variant | P2 | S |
| 12 | Stack | No responsive gap/direction props | P2 | M |
| 13 | Container | Only 3 maxWidth presets | P2 | S |
| 14 | MasterDetail | `masterWidth` accepts raw CSS not DS tokens | P2 | S |

## Cross-Check: Active State — Consistent
Active states use `accent-9`/`accent-11` across Tabs, Pagination, MasterDetail. NavigationMenu lacks persistent active state (gap).

## Cross-Check: Keyboard Nav — Mostly Correct
Tabs: Arrow Left/Right (but no Up/Down for vertical). MasterDetail: comprehensive custom keyboard. Accordion: tested but missing explicit ArrowDown/Up test. Stepper: not interactive at all.

## Cross-Check: Spacing Token Usage — Good
Stack maps all gaps to `gap-ds-*`. Accordion uses `py-ds-05`. Container: `px-ds-05` (correct token, but not responsive). MasterDetail: `masterWidth='280px'` is raw CSS.
