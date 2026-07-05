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
