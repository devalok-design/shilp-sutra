# Design: Cross-Repo AI Agent Feedback Protocol

**Date:** 2026-03-07
**Purpose:** Enable Karm and shilp-sutra AI agents to communicate directly via GitHub Issues, removing the human from the translation loop.

---

## Overview

A GitHub Issues-based protocol where AI agents on Karm and shilp-sutra exchange feedback and notices via labeled issues on each other's repos. The human stays in the decision loop (approving fixes, migrations) but is removed from the translation loop (describing problems, relaying responses).

## Labels

| Repo | Label | Purpose |
|------|-------|---------|
| `devalok-design/shilp-sutra` | `karm-ai-agent-feedback` | Karm agent files issues here when it hits DS problems |
| `devalok-design/karm` | `shilp-sutra-ai-agent-feedback` | Shilp-sutra agent files notices here (deprecations, migrations, guidance) |

## Issue Formats

### Karm -> shilp-sutra (Feedback)

```markdown
Title: [Feedback] <short summary>

## Context
- Component(s): <names>
- Package version: @devalok/shilp-sutra@X.Y.Z
- Karm page/feature: <where this came up>

## Type
<!-- one of: bug | missing-feature | api-friction | docs-gap | breaking-change -->

## Description
<what happened, what was expected>

## Code Example
<!-- minimal reproduction or usage attempt -->

## Severity
<!-- P0 (blocking) | P1 (workaround exists) | P2 (nice to have) | P3 (suggestion) -->
```

### shilp-sutra -> Karm (DS Notice)

```markdown
Title: [DS Notice] <short summary>

## Type
<!-- one of: deprecation | migration-required | new-feature | usage-guidance -->

## Affects
- Component(s): <names>
- Current version: @devalok/shilp-sutra@X.Y.Z
- Target version: <if applicable>

## Description
<what's changing or what we noticed>

## Action Required
<!-- before -> after migration code, or recommended usage -->

## Timeline
<!-- immediate | next-minor | next-major -->
```

## Triggers

### shilp-sutra agent

| Trigger | Action |
|---------|--------|
| `/check-karm-feedback` or "check for karm feedback" | Read open `karm-ai-agent-feedback` issues on this repo. Triage each against the actual codebase. Present findings. **Wait for human approval before fixing or closing.** |
| `/send-karm-notice` or "send a notice to karm about X" | File an issue on the Karm repo with `shilp-sutra-ai-agent-feedback` label using the DS Notice format. |

Neither action happens automatically. The human must invoke the trigger.

### Karm agent

| Trigger | Action |
|---------|--------|
| **Automatic** — whenever it encounters a DS issue during work | File an issue on `devalok/shilp-sutra` with `karm-ai-agent-feedback` label using the Feedback format. Fire and forget — continue working with a workaround if possible. |
| `/check-ds-notices` or "check for design system notices" | Read open `shilp-sutra-ai-agent-feedback` issues on own repo. Present findings. **Wait for human approval before applying migrations or closing.** |

The Karm agent auto-files feedback (no trigger needed) but never auto-applies incoming notices.

## Flow

```
Karm agent hits problem
    |
    v
Auto-files issue on devalok/shilp-sutra [karm-ai-agent-feedback]
    |
    v
Human tells shilp-sutra agent: /check-karm-feedback
    |
    v
shilp-sutra agent triages, presents findings, waits for approval
    |
    v
Human approves -> agent fixes, comments on issue, closes it
    |
    v
If migration needed: human tells shilp-sutra agent /send-karm-notice
    |
    v
Issue filed on Karm repo [shilp-sutra-ai-agent-feedback]
    |
    v
Human tells Karm agent: /check-ds-notices
    |
    v
Karm agent reads, presents, waits for approval to apply
```

## CLAUDE.md Instructions

### For shilp-sutra repo

```markdown
## Consumer AI Agent Feedback Protocol

This repo receives feedback from AI agents working on consumer apps (e.g., Karm).
Feedback arrives as GitHub Issues labeled `karm-ai-agent-feedback`.

**You do NOT check or act on these automatically.** Only act when triggered:

- `/check-karm-feedback` — Read all open issues labeled `karm-ai-agent-feedback` on
  this repo. For each issue: investigate against the actual codebase, summarize findings,
  and present to the user. Do NOT fix, comment, or close until the user approves.

- `/send-karm-notice` — File an issue on `devalok-design/karm` with label
  `shilp-sutra-ai-agent-feedback` using the DS Notice format (see
  docs/plans/2026-03-07-ai-agent-feedback-protocol-design.md for the template).
```

### For Karm repo

```markdown
## Design System Feedback Protocol

When you encounter issues with any `@devalok/shilp-sutra*` package
(wrong types, missing exports, API friction, undocumented behavior, breaking changes):

1. **Auto-file feedback** — Immediately file a GitHub Issue on `devalok-design/shilp-sutra`
   with label `karm-ai-agent-feedback`. Use this format:
   - Title: `[Feedback] <short summary>`
   - Body: Context (component, package version, page/feature), Type
     (bug/missing-feature/api-friction/docs-gap/breaking-change), Description,
     Code Example, Severity (P0/P1/P2/P3)
   - Then continue working — use a workaround if possible, don't block on a response.

2. **Do NOT work around DS bugs silently** — always file the issue so the DS team can
   fix it at the source.

3. **Check for DS notices** — only when triggered:
   - `/check-ds-notices` — Read open issues labeled `shilp-sutra-ai-agent-feedback`
     on this repo. Present findings to the user. Do NOT apply migrations or close
     issues until the user approves.
```

## Implementation Checklist

1. Create `karm-ai-agent-feedback` label on `devalok-design/shilp-sutra` repo
2. Create `shilp-sutra-ai-agent-feedback` label on `devalok-design/karm` repo
3. Add CLAUDE.md instructions to shilp-sutra repo
4. Provide CLAUDE.md instructions to Karm team for their repo
