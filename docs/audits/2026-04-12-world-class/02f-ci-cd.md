# Phase 2f: CI/CD Pipeline Audit

**Phase:** 2f
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Adequate (Strong pipeline, gaps in automation safety)

7-step CI gate is comprehensive (typecheck, lint, test, build, bundle check, props export check, Storybook browser tests). But SSR smoke test is missing from CI, automated publish via Changesets skips pre-publish-audit gates, and branch protection is unverifiable.

---

## Findings

### 1. Pipeline Completeness
**Rating:** Strong
CI runs: checkout -> pnpm setup -> node 22 -> typecheck -> lint -> check-props-exports -> test -> build -> bundle size (5MB budget) -> Playwright Storybook tests. Storybook deploy duplicates CI checks (redundant but safe).

**Missing:** SSR smoke test (exists as pre-publish gate but not in CI), Prettier/format check (exists as script but not in workflow), deprecated token check.
**Priority:** P0 (SSR smoke test in CI) | **Effort:** S

### 2. PR Checks
**Rating:** Strong
7 gates on every PR. Storybook browser tests add real rendering verification. Gap: unclear if configured as required GitHub status checks.
**Priority:** P1 (verify required checks) | **Effort:** S

### 3. Changesets Integration
**Rating:** Adequate
Properly configured with GitHub changelog, public access, auto version PRs. Gap: release workflow does NOT run typecheck/lint/test before publish — trusts CI. Race condition if CI hasn't completed when version PR merged.
**Priority:** P1 | **Effort:** S

### 4. Bundle Size Tracking
**Rating:** Adequate
5MB total dist budget via `du -sb`. No per-entry-point budgets, no PR comments, no trend tracking.
**Priority:** P2 | **Effort:** M

### 5. Visual Regression in CI
**Rating:** Adequate
Chromatic on PRs + main push with TurboSnap. But `exitZeroOnChanges: true` means visual changes don't block merge. Informational only.
**Priority:** P2 | **Effort:** S (change to blocking when ready)

### 6. Publish Automation
**Rating:** Adequate
Two tracks: Changesets (automated, skips pre-publish-audit) + /publish-release skill (manual, full audit). Automated path could publish what manual would block.
**Priority:** P0 (add critical gates to Changesets publish) | **Effort:** S

### 7. Branch Protection
**Rating:** Gap
Not verifiable from codebase. Must confirm: required status checks, review requirements, force-push disabled.
**Priority:** P1 | **Effort:** S

---

## Summary Table

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | Pipeline completeness | **Strong** | P0 (SSR smoke) | S |
| 2 | PR checks | **Strong** | P1 | S |
| 3 | Changesets | **Adequate** | P1 | S |
| 4 | Bundle size tracking | **Adequate** | P2 | M |
| 5 | Visual regression | **Adequate** | P2 | S |
| 6 | Publish automation | **Adequate** | P0 | S |
| 7 | Branch protection | **Gap** | P1 | S |

## Top 3 Actions

1. **P0 — Add SSR smoke test to CI:** Wire `node packages/core/scripts/ssr-smoke-test.mjs` into ci.yml. Already built, just not wired.
2. **P0 — Add pre-publish gates to Changesets publish:** At minimum SSR smoke + deprecated tokens.
3. **P1 — Verify branch protection:** Confirm required status checks and force-push disabled.
