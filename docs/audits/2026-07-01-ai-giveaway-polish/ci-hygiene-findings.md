# CI / workflow hygiene — why this session was painful

What actually cost us time + caused the flaky/round-trip feel, with root cause + fix. Ordered by impact. (Analysis only — CI changes need their own PR + e2e test per the HARD RULE "test release/CI workflow changes before merge.")

## 1. CI is one serial job, slowest-step-first — the #1 pain ⛔
`ci.yml` runs a single job: install → **build (slow)** → typecheck → lint → **props** → test (~6min) → SSR → bundle → playwright install → storybook browser.
- **Why it hurt:** the cheap checks (lint ~15s, props ~2s) run *after* the slow build. A 2-second lint typo makes you wait through the full build first. And the job stops at the first failure, so each fix reveals the *next* gate on a fresh full cycle. That's exactly our lint → props → (…) round-trips — each one a full build+wait.
- **Fix:**
  - **Split into parallel jobs:** `static` (typecheck + lint + props + format) · `test` · `build+ssr+bundle` · `storybook`. Fail fast, run concurrently.
  - **Reorder within a job:** lint + props + format do NOT need `dist` — run them *before* build. (The build-first comment is only about *site* typecheck resolving `dist` subpaths; core lint/props/typecheck don't need it.) Split core-typecheck (no build) from site-typecheck (needs build).

## 2. No local pre-push parity — we push to discover failures 🟠 ✅ PARTIALLY FIXED
There is no single command mirroring CI, and **no husky/lint-staged**. I (and any dev) ran partial checks (`eslint <file>`, not `pnpm lint`; never `lint:props`), so whole-repo gates only failed in CI. This was the single root cause of all three CI failures this session (lint, props-export, browser stories).
- **DONE:** added `pnpm verify` (root package.json) = `build && typecheck && lint && lint:props && test && ssr-smoke && test:storybook:ci` — the exact CI gate sequence. Running this once locally would have caught all three failures before the first push.
- **STILL TODO:** a husky `pre-push` hook to run the fast subset automatically. Held off here because adding husky = new devDep + lockfile change + a `prepare` hook that runs during CI's `--frozen-lockfile` install (footgun) — not worth bolting onto a release PR. Do as its own small PR.

## 3. `test` script footgun 🟡
`test` = `pnpm -r test` → `vitest run`. So `pnpm test run` passes `"run"` as a **filename filter** → runs ~nothing (bit me once — "8 tests passed" instead of 2190).
- **Fix:** rename or document; `pnpm test` already implies `run`. A `verify` script sidesteps it.

## 4. Test suite is slow: 306s = 62% of CI — ROOT CAUSE FOUND 🔴 (biggest lever)
Real CI timings (run 28744103970): total ~490s. **Test (unit) = 306s (62%)**, build 67s, browser stories 53s, typecheck 20s, lint 11s, rest ~33s.

**Root cause:** `packages/core/vitest.config.ts` sets **`fileParallelism: false`** — all 166 test files run **sequentially on one core** while the CI runner's other cores sit idle. The comment explains why: `vitest-axe` / `axe-core` uses a **global singleton** ("Axe is already running") that collides under concurrent files. So parallelism was globally disabled to work around an axe-only constraint. Import cost (~111s of the local 380s) is amplified because nothing is shared/parallelized across files.

**EXPERIMENT RESULT (2026-07-01):** tried `fileParallelism: true` + `pool: 'forks'`. Findings:
- ✅ Forks DO avoid the axe singleton — zero "Axe is already running" across 4 full runs (separate processes = separate axe globals). So the *stated* reason for serializing is solvable.
- ✅ ~halved local wall-clock: **380s → ~205s**.
- ❌ BUT exposed a **load-dependent flake**: `emoji-picker.test.tsx` failed **1 of 3** full-parallel runs, while passing **every** time in isolation (4/4). Root cause: async `waitFor` slipping under fork CPU contention, not a real bug. Almost certainly more such latent flakes lurk.
- **Verdict: reverted.** A ~1/3-flaky suite is strictly worse than a slow-but-stable one on a shared release pipeline. Kept `fileParallelism: false`.

**Fixes (in order of leverage) — as a dedicated follow-up PR, NOT the release:**
- **Harden the load-sensitive tests first** (emoji-picker + sweep for others: raise/await timers, avoid real-time `waitFor` races), THEN re-enable parallelism, ideally with a **capped `maxForks`** (e.g. 4) to bound contention, and **validate over 10+ runs** before trusting it.
- Alternative axe isolation if forks still prove unstable: (a) dedicated `vitest-axe` project running serial, rest parallel; (b) per-test mutex around axe; (c) move a11y to `@axe-core/playwright` in the already-separate browser-stories project.
- **Shard** the unit suite across N GitHub matrix runners (`--shard=1/4` …) — independent of the axe fix, near-linear speedup.
- **Cache** (see #5) so unchanged code doesn't re-test at all.
- The `testTimeout: 30_000` (up from 5s) is itself a symptom — the config comment admits axe tests only trip the budget "at the tail of a full run under accumulated jsdom pressure," i.e. *because* everything is serialized. Fixing parallelism likely lets this drop back toward default.

## 5. No build/test caching 🟡
Only pnpm-store is cached (`setup-node cache: pnpm`). No turbo/nx → every run rebuilds + retests from scratch even for doc-only changes.
- **Fix:** either add **Turborepo** (cache build/test/lint by input hash) or GitHub Actions cache for `dist` + vitest cache. For doc-only PRs this alone would cut most runs to seconds.

## 6. jsdom log noise 🟢
Every test run spams `Not implemented: getContext / matchMedia / scrollTo`. Not failures, but clutters output and can hide real errors.
- **Fix:** stub these in the vitest setup (already mock ResizeObserver/matchMedia per memory — extend to `HTMLCanvasElement.getContext`, `scrollTo`).

## 7. Chromatic config churn (this session, concurrent) 🟢
A commit (`08a842aa`, not from this workstream) appeared mid-session gating chromatic snapshots behind a `visual-review` label → chromatic now **SKIPPED** on PRs. If chromatic is a *required* status in branch protection, that would block merges; if not required, fine. Confirm branch-protection required checks = just `ci`.

## 8. ROOT PROCESS ISSUE: two agents, one working tree 🟠
The biggest "flakiness" source wasn't CI — it was **two Claude sessions sharing one checkout** (cards + ai-giveaway). Symptoms this session: the foreign `card.tsx` typecheck error blocking my local typecheck for hours, `notification-preferences` edited by both, `llms-full.txt` regenerated across both, a stray commit appearing on my branch, and the cards' `TableCellBaseProps` barrel miss only surfacing in the *combined* CI.
- **Fix:** give each agent its own **`git worktree`** (separate dirs, shared repo) so file lanes are physically isolated and each commits/pushes/CI-checks independently. Eliminates the entanglement class entirely.

---

## Priority
1. Split/reorder CI jobs (#1) + add `verify` + husky pre-push (#2) — kills the round-trips.
2. `git worktree` per agent (#8) — kills the entanglement.
3. Test-import speedup (#4) + caching (#5) — kills the wait.
4. jsdom stubs (#6), test-script rename (#3), chromatic-gate confirm (#7) — polish.

---

# MCP CI review (2026-07-05, post-0.45.0 — `packages/mcp-server` + manifest now in the pipeline)

Read `ci.yml`, `release.yml`, `packages/mcp-server/{package.json,railway.toml}`, `pnpm-workspace.yaml`, and the manifest gates. Findings by severity.

## M1 🔴 Mixed PRs give the MCP server ZERO validation
`ci.yml` gates the MCP smoke behind `if mcp_only == 'true'` and the DS pipeline behind `if mcp_only != 'true'`. mcp-server has **no build/typecheck/test/lint scripts**, so the DS pipeline's `pnpm -r` steps skip it. Net: a PR touching **both** core and mcp-server (mcp_only=false) runs the DS pipeline (which skips mcp-server) **and** skips the smoke → the mcp-server code is never exercised. Only *mcp-only* PRs get the 30s smoke.
- **Fix:** run the MCP smoke whenever `packages/mcp-server/**` changed (mcp-only OR mixed), not only when mcp-only. Change the smoke `if:` to a "mcp changed at all" flag (add a second `git diff` grep). Better: give mcp-server a real `lint`/`typecheck`/`test` so `pnpm -r` covers it like every other package.

## M2 🟠 mcp-manifest.json (12K lines) is committed AND build-regenerated → diff churn + guaranteed merge conflicts
`packages/core/mcp-manifest.json` is git-tracked, ships in `files[]`, AND is regenerated by `post-build` + `version-packages`. Every component change rewrites it; two workstreams touching components = a 12,321-line merge conflict (this session already hit manifest/llms regen collisions). The publish IS protected (pre-publish-audit gate "mcp-manifest.json valid + stamped with current version" runs `--check` after Build regenerates it; version-packages regenerates it too).
- **Fix options:** (a) gitignore it and generate-only (build/publish artifact — like dist), dropping it from the committed tree; consumers still get it in the tarball. OR (b) keep committed but add a CI gate that fails if the committed copy ≠ freshly-generated (so it can't rot), accepting the churn. (a) removes the conflict class entirely; (b) matches the historical llms-full stamped-docs rot fix. Recommend (a).

## M3 🟠 Release pipeline runs full ~10min for mcp-server-only pushes to main
`release.yml` `paths-ignore` lists only `apps/site/**`. An mcp-server-only push to main triggers the whole build→test→audit→CSS→chromatic pipeline. changesets no-ops (mcp-server is `private: true`, no changeset) so nothing publishes — but ~10min + a Chromatic run burn for nothing.
- **Fix:** add `packages/mcp-server/**` to `paths-ignore` (mcp-server deploys via Railway, never via npm — same rationale as apps/site). Caveat: a *mixed* push (core + mcp) still runs release correctly since paths-ignore only skips when ALL changed paths match.

## M4 🟡 mcp-server deploy is ungated Railway auto-deploy; no core↔mcp contract gate
mcp-server has no deploy workflow — Railway auto-deploys on main push via `packages/mcp-server/railway.toml` (Dockerfile build, `/health` healthcheck, restart-on-failure ×3). The server reads docs from **published npm tarballs at runtime** (dep `tar`), so new DS versions need no redeploy — good. But: (1) the only pre-merge check is the 30s smoke, which per M1 doesn't run on mixed PRs; (2) there's no integration gate that the deployed server can parse a NEW `mcp-manifest.json` schema — if core bumps the manifest shape, the running (old) server can choke with no CI signal. Healthcheck catches hard-down, not parse regressions.
- **Fix:** ensure the smoke fetches + parses the actual current manifest/tarball shape (schema contract test), and run it on any mcp OR manifest-schema change. Consider a lightweight post-deploy `/health`+one-tool probe.

## M5 🟢 Confirmations (working as intended)
- mcp-server `private: true` → changesets correctly never tries to npm-publish it. ✓
- Its deps (@modelcontextprotocol/sdk, tar, zod) are in the workspace lockfile; `--frozen-lockfile` install covers it. ✓
- Pre-publish-audit has real manifest gates (valid + version-stamped + `--check`), and Build regenerates before the audit in release.yml, so a published tarball's manifest is always fresh. ✓
- llms.txt router token-cap gate + per-component docs fallback chain exist. ✓

## Priority
M1 (mixed-PR MCP hole) → M2 (manifest churn/conflicts) → M3 (wasted release runs) → M4 (deploy/contract gate). All are separate small PRs, each e2e-tested per the "test CI/release changes before merge" HARD RULE.

---

## MCP CI fixes — SHIPPED on branch `fix/mcp-ci-hardening` (2026-07-06)
One PR, all four:
- **M1** ✅ `ci.yml`: added `mcp_changed` scope flag (matches `packages/mcp-server/**` + the manifest generator + `mcp-manifest.schema.json`); the MCP smoke now runs on mixed PRs too (was mcp-only). Verified: scope logic across 4 scenarios (mcp-only / mixed / core-only / manifest-gen) resolves correctly; smoke 12/12 locally.
- **M2** ✅ gitignored `packages/core/mcp-manifest.json` (packages/core/.gitignore, matching the existing generated-artifact convention `/AGENTS.md` `/skill/`) + `git rm --cached`. Kills the 12K-line churn + conflict class. Still ships — verified `npm pack --dry-run` includes it (467.6kB) via the `files[]` allowlist (npm allowlist wins over .gitignore). Freshness guaranteed: `release.yml` Build regenerates before publish + pre-publish-audit gates (`--check` + version-stamp); with it generated-not-committed, a stale committed copy is now *impossible*.
- **M3** ✅ `release.yml`: added `packages/mcp-server/**` to `paths-ignore` (mcp-only pushes no longer burn the ~10min publish pipeline; mixed pushes still run it).
- **M4** ✅ (largely by M1): the smoke IS the core↔MCP contract test — in local mode it serves `packages/core` and exercises all 6 tools against the real manifest. M1 makes it run whenever the contract can change (server, generator, or schema). Residual optional follow-up: a post-Railway-deploy `/health`+one-tool probe (not built — new deploy workflow, out of scope).

**Rollout caveat:** `ci.yml` is exercised by this PR's own run; `release.yml`'s paths-ignore change only takes effect on the next real push to main (can't be fully e2e-tested pre-merge — per the HARD RULE, watch the first post-merge release).
