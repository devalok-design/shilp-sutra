# Finish-Bar v2 Audit (2026-07-24)

Best-in-market, read-only audit of shilp-sutra components against a 14-axis
rubric — including new axes the prior audits lacked: **motion (Emil)**, state
coverage, content/theming resilience, system cohesion, craft, perceived
performance, **market benchmark**, and **cross-DS adoption ideas**.

Rubric + method: `skills/finish-bar-audit/SKILL.md` (run via the
`finish-bar-audit` skill).

## Status
- **COMPLETE — all 125 components** (ui 82, composed 30, shell 8, ai 5). See `scorecard.md`.
- Method: `finish-bar-audit` skill + a bounded read-only subagent fan-out (one auditor/component).

## Files
- `scorecard.md` — one row/component: finish /5, market verdict, rebuild rec.
- `backlog.md` — all gaps ranked P0→P3, incl. systemic (DS-wide) items.
- `by-dimension.md` — which *axes* are systemically weak.
- `findings/<layer>__<name>.md` — full per-component scorecard + adoption ideas.

## Headline (full DS)
Median **3/5** — shippable with real gaps; **nothing broken** (0 below 2/5). 49
components (39%) at/above bar (4–5); **9 LEAD** their market peer. 13 sit at 2/5;
4 flagged for structural rebuild. **114/125 are "polish", not rebuild** — the DS
is fundamentally sound; this is a finish-and-consistency program, not a redesign.

Top **systemic** levers (fix once, DS-wide): reduced-motion not self-guarded
(S1), dead `border-card-strong` class (S2, 11 files), doc↔source drift that
misinforms AI agents (S3), test-coverage holes (S4), and composition duplication
(S6 — the main driver of the 2/5 cluster). See `by-dimension.md`.
