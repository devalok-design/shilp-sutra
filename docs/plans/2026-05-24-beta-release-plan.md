# Beta Release Plan

> **Status:** Plan. Awaiting execution sign-off.
> **Date:** 2026-05-24
> **Author:** Mudit Lal (with Claude Opus 4.7)
> **Relationship:** Slots between Sprint 5 (marketing site) and Sprint 6 (measurement window) of [2026-05-08-public-release-roadmap.md](./2026-05-08-public-release-roadmap.md). Beta IS the signal source the measurement window was vague about.
> **Target version:** `@devalok/shilp-sutra@0.40.0` — published to `latest`, marked beta in README + announce posts. No separate dist-tag.

---

## 1. Why a beta exists

The public release roadmap jumps from "Karm-only rapid iteration" → Phase 4 (Show HN, awesome-lists, social). That's too aggressive for a single-maintainer DS with zero external consumers. We need a middle step:

- **Real signal on whether doc-driven setup actually works for non-Karm installs.** Until someone outside the team installs and reports back, the "AI agent can configure it from package name alone" hypothesis is untested.
- **Pressure-test the brand thesis ("be yourself, beautifully") with people who aren't already inside Devalok.** Site v2 lands flat or sharp — better to know before Show HN.
- **Surface the bugs we'd otherwise eat in public launch.** First 5–10 honest external installs always find something the maintainer never hit.
- **Gather the data § 7 Q4 and § 7 Q7 of the public roadmap need.** CLI go/no-go and registry-distribution decisions are both unanswered because we have no consumer evidence. Beta produces that evidence.

A beta is not a smaller launch. It is the **measurement window made concrete** with a real artifact (a version), a real audience (Indian dev community + design-system orbit), and a real exit criterion (3 external consumers, 0 P0s).

---

## 2. Definition

### 2.1 What "beta" means for shilp-sutra

| Dimension | Beta posture |
|---|---|
| **Stability claim** | "Install path is stable. APIs may still shift on minor bumps." Same SemVer rules as 0.x, plus a stronger public commitment to ship codemods for any break touching >2 components (per [Phase 1.5.2 policy](./2026-05-08-public-release-roadmap.md#phase-15--developer-tooling-ecosystem-new-track)). |
| **Distribution** | npm `latest` tag (no separate `beta` tag — see § 2.2 below). Repo public-readable on GitHub. Site v2 live at `https://shilp-sutra.devalok.in` (or chosen domain) and crawlable. |
| **Promotion** | Soft promo to Indian dev community (r/IndiaDev, ELSP slack, dev.to writeup) + 2–3 design-system orbit folks for honest critique. No Show HN, no awesome-list submissions, no Twitter launch thread. |
| **Support SLA** | Best-effort, no commitment. Triage weekly during beta. AI-agent-feedback issue template is the primary inbox. |
| **Exit** | Open-ended. Beta ends when [§ 7 exit criteria](#7-exit-criteria) are met, not on a date. |

### 2.2 Why no separate `beta` dist-tag

Per user decision 2026-05-24: nobody except Devalok consumes the package today, so the dual-tag complexity isn't earned.

- **Karm already pins exact versions in `package.json`** (verify before publish — see § 6.1 gate). It won't drift to 0.40.0 accidentally.
- **A separate `@beta` tag is a footgun for outsiders.** They'd have to know to type `@beta` to find the version we're announcing. Friction we don't need at this scale.
- **If/when adoption justifies it, a `next` tag can be introduced post-beta** for pre-release tracking of 0.41/1.0. Until then: single track.

The cost we accept: a third-party who installs `@devalok/shilp-sutra` without reading the README sees beta-quality bits. README banner + announce posts must carry the beta signal loudly enough that this is acceptable.

### 2.3 Version

**`0.40.0`**, not `0.40.0-beta.1` and not `1.0.0-beta.1`.

- Continues 0.x rapid-iteration spirit per [§ 2.2 of public roadmap](./2026-05-08-public-release-roadmap.md#22-strategic-decisions-made).
- Aligns with the "0.40+ stable" criterion already named in the public roadmap.
- `1.0.0-beta.1` would imply API freeze for the beta window. We're not ready to commit to that — the whole point of beta is to find the things that still need to move.

CHANGELOG entry frames it: *"0.40.0 — Public Beta. Installation path is stable. API surface still pre-1.0; expect minors to ship codemod when they break >2 components."*

---

## 3. Audience

Three concentric circles, opened in order:

### 3.1 Inner (week 1)

- ~10–20 hand-picked contacts: ex-colleagues, devs/designers Mudit trusts to give blunt feedback. Not a fixed list — share-kit (§ 3.5) is the distribution unit, not a named roster.
- Goal: catch the most obvious "install instructions don't work on my machine" issues before the public site is indexed.
- Distribution channel: 1:1 DM (closer contacts) + broadcast list (wider circle). NOT a group chat — feedback should land back to Mudit, not become a side-conversation.

### 3.2 Indian dev community (week 2 onward)

- r/IndiaDev post — short, links to site + repo. Frame as "made by Indian designers for a problem we kept hitting, would love brutal feedback."
- ELSP / Indian product Slack groups (Reading Group, ProductHunt India, etc. — whichever you're in).
- dev.to writeup — long-form: *"Why we built a design system that disappears into your brand."* Links to site v2 thesis.
- Optional: LinkedIn post in your voice, not Devalok-corporate.

### 3.3 Design-system orbit (week 2–3, parallel)

- 2–3 named outreach targets — people who do honest critique on Twitter/Bluesky (e.g. shadcn-orbit, Vercel DRE, Mantine maintainer). Direct message with a single ask: "spend 10 min, tell me what you'd cut."
- Not a megaphone — a critique panel.
- This is the highest-leverage feedback channel in beta. Treat it as such.

### 3.5 Share kit (the distribution unit for § 3.1)

Inner-circle isn't a hand-picked roster — it's a copy-pasteable kit Mudit sends to whoever he wants. Lives at [share-kit.md](./beta-share-kit.md) (separate doc so it can be edited without touching this plan).

Kit contents:
- 1-line pitch
- Short DM (3-line, for fast sends)
- Long DM (paragraph, for closer contacts who'll actually try it)
- r/IndiaDev post draft
- LinkedIn post draft
- dev.to longform skeleton
- Link bundle (site, repo, install one-liner, feedback links)
- "What we're asking" — explicit + scoped
- "How to give feedback" — link to issue template, SLA pointer

Each variant tells the recipient: (a) what shilp-sutra is, (b) why beta now, (c) what we want from them, (d) where to send feedback, (e) explicit no-pressure-if-busy out.

### 3.4 Off-limits during beta

- Show HN. Save for GA.
- Product Hunt. Save for GA.
- awesome-react, awesome-design-systems PRs. Save for GA.
- Generic Twitter launch thread. Save for GA.
- Newsletter sponsorships. Save for GA (if ever).

Rationale: beta exists to find bugs cheaply. Megaphone channels invert the cost ratio — every bug found there is louder.

---

## 4. Entry gates (must-do before tagging 0.40.0)

Each gate has a single "done" criterion. No gate is skippable.

| # | Gate | Done when | Owner |
|---|---|---|---|
| G1 | **Name lock** | ✅ LOCKED 2026-05-25: keep `@devalok/shilp-sutra` (scoped). Log into public-release-roadmap § 9 on next edit. | Mudit |
| G2 | **Site v2 launched** | [2026-05-24-site-v2-be-yourself.md](./2026-05-24-site-v2-be-yourself.md) Phases 1–3 shipped. Landing reads as beta-ready. Theming page works. /blocks has ≥3 entries. | Site work in progress on this branch |
| G3 | **One starter repo working end-to-end** | `shilp-sutra-starter-next` public repo. `pnpm create next-app && pnpm add @devalok/shilp-sutra && pnpm dev` produces a styled homepage on a fresh machine. Tested on Windows + macOS. Skip Vite/Astro starters for beta — Next is highest-leverage. ([Phase 2.2](./2026-05-08-public-release-roadmap.md#phase-2--starter-templates--docs-site) partial) | New |
| G4 | **AI-agent-feedback issue template tested** | At least one non-Karm install attempt completed by an AI agent (Claude or Cursor) using only the package name. Issue filed via template. Findings folded back into recipes. ([Phase 1.9 + 1.13 dogfood](./2026-05-08-public-release-roadmap.md#phase-1--ai-agent-install-loop)) | New |
| G5 | **`pre-publish-audit.mjs` clean on `main`** | 45 gates green. Includes the consumer-smoke-test on Next 15 + Next 16. | Existing infra |
| G6 | **Codemod policy in CONTRIBUTING.md** | [Phase 1.5.2](./2026-05-08-public-release-roadmap.md#phase-15--developer-tooling-ecosystem-new-track) committed. One-paragraph rule. **Superseded (2026-05-27):** the migration vehicle is the `@devalok/eslint-plugin-shilp-sutra` `migration` preset, not the originally-planned standalone `@devalok/shilp-sutra-codemods` jscodeshift repo (never built). Backfill 0.38 deprecation rule can wait until first post-beta break. | Done |
| G7 | **Storybook MCP documented in `llms.txt`** | [Phase 1.11](./2026-05-08-public-release-roadmap.md#phase-1--ai-agent-install-loop). Currently only in CLAUDE.md — agents reading `llms.txt` miss it. | New, ~30 min |
| G8 | **Public Chromatic project link in README** | [Phase 3.3](./2026-05-08-public-release-roadmap.md#phase-3--quality--discovery-hardening). Read-only project URL so external folks can browse visual baselines. | New, ~1 hour |
| G9 | **README beta banner** | First 3 lines of README announce beta + link to feedback issue template. Bold + visible. | New, ~15 min |
| G10 | **Karm version pin verified** | `karm-v2/package.json` references exact `@devalok/shilp-sutra` version (e.g. `"0.39.x"`), not `^` or `~`. If using caret, change before publishing 0.40.0. | Mudit (verify in karm-v2 repo) |
| G11 | **GitHub Discussions enabled + seeded** | Discussions tab on. Pinned "Feedback for 0.40.0 beta" thread. Discord deferred per [public roadmap § 7 Q9](./2026-05-08-public-release-roadmap.md#7-open-questions). | New, ~15 min |
| G12 | **CHANGELOG 0.40.0 section drafted** | Marks as public beta. Lists what's changed from 0.39. Restates codemod commitment. | New, ~30 min |
| G13 | **Agent feedback auto-ack Action wired** | `.github/workflows/agent-feedback-ack.yml` posts bot comment on issue-open with `ai-agent-feedback` label. Idempotent. Smoke-test with one dummy issue before publish. (See § 8.5 for spec.) | New, ~30 min |
| G14 | **PR template shipped** | `.github/pull_request_template.md` with checkboxes: closes-issue, llms.txt/recipes/AGENTS.md updated for agent-feedback fixes, codemod-if-break, changeset added. ([Public roadmap Phase 0.12](./2026-05-08-public-release-roadmap.md#phase-0--foundation-hygiene) — promoted to beta gate.) | New, ~30 min |
| G15 | **Triage label set pre-created** | All labels from § 8.4 exist in repo. Issue template `labels:` field references them. Avoids triage-stall on day 1. | New, ~30 min |
| G16 | **CONTRIBUTING.md beta-SLA section** | New `## Beta SLA` section in CONTRIBUTING.md mirroring § 8.2 table verbatim. README banner links to it. | New, ~30 min |
| G17 | **AGENTS.md updated with feedback rules** | Inside the managed BEGIN/END markers: SLA pointer, auth-tier order (MCP → gh CLI → prefilled URL), urgency definition, one-issue-per-task rule, dedup-search rule. Bumps managed-block version. | New, ~1 hr |
| G18 | **ai-agent-feedback.yml extended** | Adds required slots: human-prompt (1-line), framework + version + OS, self-classified urgency dropdown (with definitions inline). | New, ~30 min |

Gates G6–G18 are each ≤1 hour. G2 (site) and G3 (starter) are the gating-path work — multi-day each. Plan ~2–3 weeks from this doc's sign-off to tag-eligible.

---

## 5. Out of scope for beta

Explicitly deferred to GA (or later) — do not let scope creep:

- **CLI** ([Phase 1.1–1.7](./2026-05-08-public-release-roadmap.md#phase-1--ai-agent-install-loop)). Sprint 6 decision still gates. Beta IS Sprint 6.
- **Registry distribution** ([Phase 2.5](./2026-05-08-public-release-roadmap.md#phase-25--distribution--presets-exploration-new-track)). Same evidence-bar.
- **Vite + Astro starters** ([Phase 2.2](./2026-05-08-public-release-roadmap.md#phase-2--starter-templates--docs-site) remainder). Next-only for beta.
- **ESLint plugin** ([Phase 1.5.1](./2026-05-08-public-release-roadmap.md#phase-15--developer-tooling-ecosystem-new-track)). Polish, not gate.
- **Examples gallery / "Used by" / "Compare to" page** ([Phase 2.4, 2.6, 4.6](./2026-05-08-public-release-roadmap.md#phase-2--starter-templates--docs-site)). GA assets.
- **Per-component size budgets, performance benchmarks** ([Phase 3.1, 3.8](./2026-05-08-public-release-roadmap.md#phase-3--quality--discovery-hardening)). Polish.
- **Public roadmap mirror on GitHub Projects** ([Phase 3.9](./2026-05-08-public-release-roadmap.md#phase-3--quality--discovery-hardening)). Adds maintainer burden; the doc is enough for beta.
- **Demo video** ([Phase 4.3](./2026-05-08-public-release-roadmap.md#phase-4--pre-public-promo-polish)). GA asset.

If any of these turn out to be beta-blockers based on early feedback, fold them in explicitly — but the default is defer.

---

## 6. Distribution mechanics

### 6.1 Pre-publish sequence

1. Verify G10 (Karm version pin). If Karm is on caret/tilde, change to exact and merge that PR into Karm before publishing.
2. Run `pnpm changeset version` + commit. Confirm CHANGELOG matches G12 draft.
3. Run `pnpm pre-publish-audit` locally. Must be clean.
4. Tag-and-publish via existing OIDC workflow.
5. `npm dist-tags ls @devalok/shilp-sutra` — confirm `latest = 0.40.0`. No `beta` tag created.
6. Smoke install in fresh Vite + Next sandboxes (use `tests/smoke-consumer-next15/` + `tests/smoke-consumer-next16/` as templates). Manual run, not CI.

### 6.2 Announcement sequence

Day 0 (publish day): publish, update site beta banner, file the pinned Discussions thread.

Day 0 + 24h: inner-circle DMs (§ 3.1).

Day 0 + 5–7d: dev.to longform + r/IndiaDev post. Wait for inner circle to surface the first wave of bugs before broadening.

Day 0 + 10–14d: design-system orbit outreach DMs (§ 3.3).

Don't compress this. If inner circle finds bugs, fix-publish-recheck before broadening. The schedule yields to bugs.

### 6.3 README banner copy (draft)

```md
> 🚧 **Public Beta — `@devalok/shilp-sutra@0.40.0`.** Install path stable. APIs pre-1.0; breaks touching >2 components ship codemods.
> **Feedback:** [AI-agent template](./.github/ISSUE_TEMPLATE/ai-agent-feedback.yml) · [Bug report](./.github/ISSUE_TEMPLATE/bug-report.yml) · [Discussions](https://github.com/devalok-design/shilp-sutra/discussions)
> **SLA:** bot-ack immediate, urgent human-ack ≤48h, normal triage weekly Mon. [Full SLA →](./CONTRIBUTING.md#beta-sla)
```

### 6.4 dev.to / blog post angle

Not a "we shipped a beta" announcement. A thesis post: *"Why we built a design system that disappears into your brand."* The beta is the call-to-action at the end. The pillars from site v2 (be yourself, thought-through, real-scale) become the post outline. ~1500 words.

---

## 7. Exit criteria

Beta ends and GA Phase 4 begins when **all five** hold:

1. **3 external consumers with non-trivial usage.** "Non-trivial" = ≥10 components in use, ≥1 month in their repo, public proof (open-source repo, public site, or written testimonial). Matches [public roadmap § 7 Q2](./2026-05-08-public-release-roadmap.md#7-open-questions).
2. **0 unresolved P0 issues from beta feedback.** P0 = install breaks, runtime crash in mainstream framework, accessibility regression, API ambiguity that traps agents.
3. **At least one minor cycle without unplanned breakage.** Means: ship 0.41 (or 0.42, etc.) and the next minor lands without rolling back. Tests the codemod-policy commitment.
4. **CLI go/no-go decided** ([public roadmap § 7 Q4](./2026-05-08-public-release-roadmap.md#7-open-questions)). Decision logged in roadmap § 9. Trigger conditions: >50% manual triage rate OR <80% agent-success rate → build CLI before GA. Otherwise → skip indefinitely.
5. **Beta window minimum: 4 weeks.** Even if 1–3 hit faster, leaves time for surprises and the orbit-feedback critique to land.

If any criterion stalls beyond 8 weeks from publish, do a written reassessment — possibly extend beta, possibly retract and rework. Don't drift silently.

---

## 8. Feedback loop

### 8.1 Inbound channels (priority order)

1. **AI-agent-feedback issue template** — primary signal. Auto-labeled `ai-agent-feedback` + `needs-triage`. Auto-acked by bot (§ 8.5).
2. **Bug-report issue template** — for humans reporting non-agent issues.
3. **GitHub Discussions pinned thread** — "how do I…" + general feedback.
4. **DMs from orbit outreach** — highest-quality. Capture into issues/Discussions to keep public trail.
5. **r/IndiaDev + dev.to comments** — lowest signal-to-noise, free.

### 8.2 Beta SLA (mirrored verbatim in CONTRIBUTING.md per G16)

| Category | Definition | Bot ack | Human triage | Fix posture |
|---|---|---|---|---|
| **Urgent** | Install-break, runtime crash on supported framework, or security. Reproduces on documented setup. Not solvable by re-reading docs. | Immediate (auto-comment) | ≤48h best-effort | Top of queue; ETA posted in issue |
| **Normal** | API ambiguity, agent-trap, doc gap, behavior contradicting docs. | Immediate | Weekly Monday | Batched into next minor |
| **Nice-to-have** | Polish, preference, feature request. | Immediate | Weekly Monday | "If it fits" — no commitment |

**Bot ack** = automated comment via GH Action. Means "we received this." Not "a human has read it."

**Human SLA scopes triage, not fix.** Fix ETAs are issue-specific and posted in the issue after triage. We don't promise calendar-fix-times — one maintainer, real life.

**Travel/sick weeks:** SLA pauses. Pinned Discussion notice. No silent drift — public acknowledgment that the clock paused.

### 8.3 Urgency definition (for agents and humans, baked into template)

**Urgent = ALL of:**
- Reproduces on documented setup (recipe-followed install)
- Breaks: install OR initial render OR build OR security
- Not solvable by re-reading existing docs

**NOT urgent:**
- Visual preference / "looks wrong"
- Missing feature request
- Confusion about docs (= normal, doc-gap)
- Breaks only on undocumented framework or post-modification
- Already-known issue with existing workaround

Agents self-classify via dropdown in the template. Maintainer reserves the right to reclassify during triage; reclassification is the norm, not a slight.

### 8.4 Label set (pre-created per G15)

| Axis | Labels |
|---|---|
| Source | `agent-filed`, `human-filed` |
| Category | `install-break`, `runtime`, `api`, `docs`, `polish` |
| Framework | `framework:next-app`, `framework:next-pages`, `framework:vite`, `framework:astro`, `framework:remix`, `framework:tanstack`, `framework:other` |
| Urgency | `urgent`, `normal`, `nice-to-have` |
| Lifecycle | `needs-triage`, `accepted`, `in-progress`, `blocked`, `wontfix`, `duplicate` |
| Beta | `beta-feedback` |

Default issue-template labels: `ai-agent-feedback`, `needs-triage`, `beta-feedback`. Triage adds the rest.

### 8.5 Agent-filed feedback — how it actually works

**Auth path (in order of preference):**

1. **GitHub MCP available in agent's environment** → agent calls `mcp__github__create_issue` with user's auth. Cleanest.
2. **`gh` CLI configured on user's machine** → agent runs `gh issue create --template ai-agent-feedback.yml --title "..." --body "..."`. Works for Claude Code / Cursor users with terminal.
3. **Fallback: prefilled URL** → agent generates `https://github.com/devalok-design/shilp-sutra/issues/new?template=ai-agent-feedback.yml&agent=Claude+Code+2.5&package-version=0.40.0&...` with all required fields URL-encoded. Outputs URL to user, asks them to click + submit. Zero auth needed.

The prefilled-URL fallback is the unlock — GitHub Issue Forms accept `?<field-id>=value` querystrings per field. Means every agent regardless of tooling can produce a one-click issue.

**Rules baked into AGENTS.md (G17):**

- **One issue per task.** Multiple problems in one task → ONE issue listing all. Do NOT file separately per broken file.
- **Search before filing.** `gh issue list -l ai-agent-feedback -s open` or web search of `/issues?q=is:open+label:ai-agent-feedback`. Comment on near-dup instead of opening new.
- **Identity declaration.** Issue body must state: model name + version, human's original prompt (1 line), what was attempted, what failed verbatim, framework + version + OS.
- **Self-classify urgency** per § 8.3 definition. Default Normal. Don't escalate to Urgent unless ALL criteria met.
- **Solo agent action.** Agent files on behalf of human, with human's knowledge. Don't file in background — the human sees the issue link before/after submission.

**Auto-ack Action (G13 spec):**

```yaml
# .github/workflows/agent-feedback-ack.yml
name: Auto-acknowledge agent feedback
on:
  issues:
    types: [opened]
jobs:
  ack:
    if: contains(github.event.issue.labels.*.name, 'ai-agent-feedback')
    runs-on: ubuntu-latest
    permissions:
      issues: write
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            const body = `**Received** — beta feedback queue.

            Triage timing per [Beta SLA](../blob/main/CONTRIBUTING.md#beta-sla):
            - **Urgent** (install-break / runtime crash on supported setup): human response ≤48h
            - **Normal** (API / docs / agent-trap): weekly Mon triage
            - **Nice-to-have**: batched, no calendar

            Wrong category? Add label \`urgent\` or comment to reclassify.

            Beta exit criteria: [docs/plans/2026-05-24-beta-release-plan.md](../blob/main/docs/plans/2026-05-24-beta-release-plan.md#7-exit-criteria).`;
            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body
            });
```

Idempotent (only on `opened`, not `labeled`). Smoke-test with one dummy issue before publish.

**Close-the-loop on fix:**

PR template (G14) requires:
- [ ] Closes #N
- [ ] If fixing agent-filed feedback: `llms.txt` / `docs/recipes/` / `AGENTS.md` updated?
- [ ] Codemod added if break touches >2 components?
- [ ] Changeset added?

Means: every agent-reported fix updates the docs the next agent will read. Loop closes structurally, not by memory.

**Agent files, human disagrees:**

Close-with-link template comment:

> Closing — intended behavior per [doc link]. To discuss whether intended behavior *should* change, open a Discussion.

Don't relitigate per-issue. Discussion is the right venue for taste/scope debates.

### 8.6 Weekly digest (mandatory ritual)

Mondays AM. Discussions post. Template:

```md
# Beta Week N — ending YYYY-MM-DD

## Heard
- #123: [summary] (urgent / normal / nice-to-have)
- ...

## Shipped
- v0.40.X: fix for #N
- Recipe update: install-vite.md clarified peer-dep step
- ...

## Open
- #N triaged urgent, fix WIP
- ...

## Beta scoreboard
- External consumers: X / 3 target
- P0 open: X
- Days since publish: X
```

Miss 2 weeks → beta credibility tanks. Discipline > tooling.

### 8.7 What we do NOT build for beta

- No analytics, no telemetry, no install-success postinstall hook. Per [public roadmap C.4](./2026-05-08-public-release-roadmap.md#cross-cutting-continuous), telemetry decision is pending CLI.
- No CAPTCHA / honeypot / agent-rate-limiting infra. Beta volume too low. GH built-in spam controls + manual lock if abuse emerges.
- No custom feedback MCP server. The prefilled-URL fallback covers the agent-friction case. MCP-as-inbox revisited at GA+1 if issue volume + agent friction justifies it.
- No SLA-pause auto-detection. Manual pinned-Discussion notice when traveling/sick.

Issue-volume + Discussions activity is the data source. If insufficient signal, answer is more outreach (§ 3.3), not telemetry.

---

## 9. Risks (beta-specific)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Beta visibility without polish damages brand | Medium | High | Inner-circle gate before broadening (§ 6.2). README banner sets expectation. Site v2 thesis is the strong-signal asset — if it's not ready, delay beta, don't ship half. |
| Karm accidentally pulls 0.40 via caret | Medium | High | G10 gate. Pin to exact before publishing. If caret is used elsewhere in the org, audit. |
| Orbit critique is harsh and demoralizing | High | Medium | Expected. The point of beta is to absorb critique cheaply. Decide upfront: what counts as actionable, what's taste-disagreement, what's "they're wrong about our thesis." Don't pivot the thesis on a single voice. |
| r/IndiaDev post gets zero engagement | Medium | Low | Acceptable outcome. dev.to longform is the higher-leverage post; subreddit is bonus. If both flop, fall back to orbit DMs only. |
| First external install reveals a Windows-specific install break we never saw | High | Medium | G3 gate (starter tested on Windows + macOS). Inner-circle includes ≥1 Windows dev. Recovery: patch, ship 0.40.1, narrow blast radius. |
| Naming feedback during beta forces a rename | Low | High | G1 gate forces this NOW. Decision-logged means we don't relitigate mid-beta. |
| Beta drifts past 8 weeks with no exit | Medium | High | Hard reassessment trigger written into § 7. Doc must be updated weekly during beta — drift is visible. |
| The "be yourself" thesis doesn't resonate outside the founders | Medium | High | This is real-world data we can only get post-beta. If signal is "people don't care about customization at this depth," GA changes — possibly toward a sharper niche or a different headline. Better to learn in beta than after Show HN. |
| Agent spam (someone instructs their agent to flood issues) | Low | Medium | Beta volume too low to engineer against. GH per-account rate limit + spam detection + manual lock if abuse emerges. `[ai-agent]` title prefix makes filtering trivial. Don't build CAPTCHA / honeypot speculatively. |
| SLA commitment becomes a trap (travel / sick week) | High | Medium | Bot ack covers "did anyone see this." Human SLA scopes to *triage* not *fix*. Pinned Discussion notice when paused. Public acknowledgment > silent drift. |
| Agent files low-quality / wrong-category issues at high volume | Medium | Medium | Self-classification dropdown + maintainer reclassification-as-norm. Dedup-search rule in AGENTS.md. One-issue-per-task rule. If signal degrades, narrow urgency definition + add `wontfix-out-of-scope` triage label. |
| Prefilled-URL fallback URL length exceeds GitHub limits | Low | Low | GH issue forms accept ~8KB URL. Long `what broke` / `what tried` body fields could blow it. Mitigation: AGENTS.md instructs agents to truncate body fields to ~2KB each in URL mode; full content goes in via paste if needed. |

---

## 10. What this beta does NOT promise

To set expectations cleanly, both internally and in the README:

- Not promising API stability across 0.40 → 0.41.
- Not promising any specific component is feature-complete.
- Not promising support response time.
- Not promising the marketing site (`apps/site`) won't change shape.
- Not promising registry distribution, a CLI, or starters in non-Next frameworks. All deferred.

Promised:
- Install path will work on Next 15 + Next 16 + Vite. Bugs get fixed.
- Codemods will ship for any break touching >2 components.
- Public CHANGELOG, public Discussions, public issue tracker.
- Honest engagement with feedback during beta.

---

## 11. Living status (update inline)

| Gate / Phase | Status | Notes |
|---|---|---|
| G1 Name lock | ✅ LOCKED 2026-05-25 | `@devalok/shilp-sutra` (scoped) |
| G2 Site v2 | ⏳ In progress | Branch `feat/site-v1-and-skill`, plan at `2026-05-24-site-v2-be-yourself.md` |
| G3 Next starter | ❌ Not started | |
| G4 Agent-feedback dogfood | ❌ Not started | |
| G5 Pre-publish audit | ⏳ Ongoing | Last known clean: tag-of-record |
| G6 Codemod policy | ❌ Not started | ~30min |
| G7 Storybook MCP in llms.txt | ❌ Not started | ~30min |
| G8 Chromatic public link | ❌ Not started | ~1hr |
| G9 README beta banner | ❌ Draft in § 6.3 | Apply when publish-ready |
| G10 Karm version pin | ❌ Verify in karm-v2 | |
| G11 Discussions enabled | ❌ Not done | |
| G12 CHANGELOG 0.40.0 | ❌ Not drafted | |
| G13 Agent feedback auto-ack Action | ❌ Not wired | Spec in § 8.5 |
| G14 PR template | ❌ Not shipped | Phase 0.12 promoted to beta gate |
| G15 Triage label set | ❌ Not pre-created | List in § 8.4 |
| G16 CONTRIBUTING beta-SLA section | ❌ Not added | Mirrors § 8.2 |
| G17 AGENTS.md feedback rules | ❌ Not updated | Inside managed BEGIN/END markers |
| G18 ai-agent-feedback.yml slots | ❌ Not extended | 3 new required slots: human-prompt, framework+version+OS, urgency dropdown |
| Share kit (§ 3.5) | ❌ Not drafted | Lives at `docs/plans/beta-share-kit.md` |
| Orbit outreach list | ❌ Not picked | 2–3 names; decide week 2 of beta |
| Longform post venue | ⏸️ Deferred | Decide day-5–7 of beta |
| dev.to post draft | ❌ Not started | |

Update this table inline as items move. Don't let the doc drift behind reality.

---

## 12. How this doc relates to others

- **Public release roadmap** ([2026-05-08-public-release-roadmap.md](./2026-05-08-public-release-roadmap.md)) — beta is Sprint 6 (measurement window). Update its § 6 sprint list to point here when this is approved.
- **Site v2 plan** ([2026-05-24-site-v2-be-yourself.md](./2026-05-24-site-v2-be-yourself.md)) — site v2 is gate G2 of this beta plan. Both target `0.40.0`.
- **CHANGELOG.md** — final 0.40.0 entry lives there. This doc holds the meta-decisions.
- **CONTRIBUTING.md** — codemod policy (G6) lives there. This doc references it.

---

## 13. Open questions (status 2026-05-25)

1. ✅ **Name lock** — `@devalok/shilp-sutra` (scoped). LOCKED.
2. ✅ **Inner-circle "list"** — no fixed roster; share-kit (§ 3.5) is the distribution unit. Mudit sends to whoever, kit handles framing.
3. ⏳ **Orbit-outreach list (2–3 names).** Still TBD. Decide before § 3.3 DMs go out (~week 2 of beta).
4. ✅ **Site v2 domain** — `shilp-sutra.devalok.in`. LOCKED.
5. ⏸️ **Longform post venue** — dev.to vs personal blog vs Devalok Substack. **Deferred — decide before § 6.2 day-5–7.** Bias: dev.to for beta, all three for GA.
6. ⏸️ **Beta retrospective format** — public retro post-exit? **Deferred — decide near exit-imminent.** Bias: yes, credibility asset.
