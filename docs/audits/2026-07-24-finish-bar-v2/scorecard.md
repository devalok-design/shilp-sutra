# Finish-Bar v2 — Master Scorecard

Full-DS read-only audit against the 14-axis best-in-market rubric
(`skills/finish-bar-audit/SKILL.md`). **125 / 125 components.**

## Distribution
| Finish | Count | | Rebuild rec | Count | | Market | Count |
|---|---|---|---|---|---|---|---|
| 5/5 | 4 | | none | 7 | | LEADS | 9 |
| 4/5 | 45 | | polish | 114 | | PARITY | 77 |
| 3/5 | 63 | | rebuild | 4 | | LAGS | 39 |
| 2/5 | 13 | | | | | | |
| 0–1 | 0 | | | | | | |

**Headline:** median component is **3/5** — shippable, real gaps. Nothing is broken (0 below 2). 49 components (39%) sit at/above bar (4–5). The long tail is 13 at 2/5 needing substantial polish and 4 flagged for structural rebuild. 39 lag a market peer — almost always on async/virtualization/motion, not correctness.

## 🔴 Below bar — 2/5 (13, prioritize)
composed/avatar-group · composed/bulk-action-bar · composed/content-card · composed/error-boundary · composed/loading-skeleton · composed/master-detail · composed/page-skeletons · composed/priority-indicator · shell/bottom-navbar · ui/autocomplete · ui/data-table-bulk-actions · ui/data-table-pagination · ui/file-upload

## 🏗️ Structural rebuild recommended (4)
- **shell/bottom-navbar** (2/5) — hand-rolled `role="dialog"` overflow menu (no focus trap / scroll-lock / return-focus / aria-modal); should compose the DS Sheet. **P0 a11y.**
- **ui/autocomplete** (2/5) — lags Base UI/React Aria structurally; no async/virtualization.
- **composed/priority-indicator** (2/5) — re-rolls instead of composing; below-bar visuals.
- **composed/schedule-view** (3/5) — targeted structural work vs FullCalendar/React Aria Calendar class.

## 🏆 Market leaders — LEADS (9, protect these)
ai/devadoot-icon · ui/badge · ui/button · ui/dot · ui/icon · ui/spinner · ui/surface · ui/table · ui/table-row-link

## Full table
See `findings/<layer>__<name>.md` for each component's 14-axis scorecard, prioritized gaps, and cross-DS adoption ideas. Per-component header line = `Finish: n/5  Market: …  Rebuild: …`.

## Method
Fresh source-verified audit (CVA + tsx are truth), prior 2026-07-01 findings used as baseline, market peers per SKILL §4, 14 axes incl. motion (Emil), state coverage, content/theming resilience, cohesion, craft, perceived-perf, market benchmark, cross-DS adoption. Run via `finish-bar-audit` skill + a bounded subagent fan-out (125 read-only auditors).
