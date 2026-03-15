# Designer Onboarding — Claude Code + shilp-sutra

**Date:** 2026-03-16
**Status:** Approved
**Goal:** Onboard 3 UI/UX designers (Goutham, Yogin, Amal) into contributing to shilp-sutra using Claude Code as their coding interface.

## Context

The shilp-sutra design system has strong foundations — 77 UI components, 28 composed components, comprehensive tokens, Storybook coverage, and automated guardrails. The bottleneck is visual polish at scale: one person can't manually verify and refine every component. Three talented designers can — if they have a way to translate their design eye into code.

None of the designers write code. Claude Code is their coding interface. They describe changes in design language, Claude Code implements, they verify visually in Storybook, and iterate until it's right.

## The Designer Workflow Loop

```
 1. Pick an assigned component
 2. Open Claude Code in VS Code / AntiGravity
 3. Study the component in Storybook — understand existing variants, tokens, spacing, states
 4. Describe the polish needed in design language:
    "The hover state needs more contrast, use the existing surface-3 token, match how Button does it"
 5. Claude Code writes the code + updates the story
 6. Run Storybook → visually verify
 7. Iterate: "too tight", "clip here", "wrong radius", "doesn't match Badge"
 8. When it looks right → Claude Code commits + pushes to feature branch
 9. Share Storybook screenshot with the team
10. Mudit does final visual verification
11. Merge to main → included in next publish
```

**Key principles:**
- **Polish, not invent.** shilp-sutra already has a strong design language. The job is to refine and perfect what's there, using existing tokens and patterns. New things only when there's a genuine gap.
- **Storybook is the interface.** Designers never need to read code. They describe, they see, they iterate.
- **Mudit is the gatekeeper.** Nothing hits main without his visual sign-off.
- **Contributors get credit.** Every commit includes Co-Authored-By for the designer.

## Component Assignment — Specialize, then Rotate

### Phase 1: Specialize (Week 1-2)

Each designer owns a visual domain. They go deep, build confidence with Claude Code, and develop an eye for their component family.

| Designer | Domain | Components |
|----------|--------|------------|
| Goutham | Display & Identity | Avatar, Badge, Chip, Tag, Skeleton, Spinner, Progress |
| Yogin | Forms & Inputs | Input, Textarea, Select, Checkbox, Radio, Switch, Toggle, Slider, NumberInput |
| Amal | Containers & Feedback | Card, Alert, Banner, Toast, Dialog, Sheet, Tabs, Accordion |

### Phase 2: Cross-pollinate (Week 3-4)

Rotate domains. Fresh eyes catch what the previous designer missed.

| Designer | Domain |
|----------|--------|
| Goutham | Forms & Inputs |
| Yogin | Containers & Feedback |
| Amal | Display & Identity |

### Phase 3: Free-pick (Week 5+)

Everyone is comfortable across the system. Pick from the open task board based on interest or priority.

## CLAUDE.md Setup — User-level Project Files

Each designer gets a **personal CLAUDE.md** that lives on their machine at:

```
~/.claude/projects/<project-path>/CLAUDE.md
```

This layers on top of the shared repo CLAUDE.md. It is NOT checked into the repo — it's personal to each designer.

**The repo CLAUDE.md (shared)** contains:
- Surface layering rules, module boundaries, publishing gates
- Universal conventions that apply to everyone

**The personal CLAUDE.md (per-designer)** contains:
- Role context: "You are working with a UI/UX designer who does not write code"
- Translation rules: think in design language, not code language
- Assigned components (updated each phase)
- Workflow rules: always update stories, run typecheck/tests before commit, never publish
- Scope limits: what they can and cannot touch
- Co-Authored-By line with their name/email
- Escape hatch: "If stuck, describe the problem and ask Mudit"

Seed files for all three designers are provided alongside this document.

## Guardrails

### Automated (already exist)
- `pnpm typecheck` — catches broken props, wrong types
- `pnpm test` — catches regressions in behavior and a11y
- `pnpm build` + `post-build-audit.mjs` — catches surface layering violations
- Pre-publish audit — designers can't accidentally publish

### Process-level
- **Feature branches only.** main requires Mudit's review.
- **Claude Code runs typecheck + tests before every commit.** Encoded as a hard rule in their CLAUDE.md.
- **Small PRs.** One component at a time. Easy to review, easy to revert.
- **Sharing sessions.** Designers present before/after screenshots to the team.

### When things go wrong
- Claude Code goes off the rails → CLAUDE.md scoping limits blast radius, tests catch regressions, PR review catches the rest
- Designer gets stuck → escape hatch in CLAUDE.md: ask Mudit
- Merge conflicts → unlikely (separate component domains), but Mudit resolves if needed

## Group Intro Session (30 min)

**Before anyone starts — a single live demo session in VS Code / AntiGravity.**

| Time | Topic |
|------|-------|
| 5 min | What is Claude Code? Live terminal demo. |
| 10 min | Live polish: pick a small component, show the full loop (describe → build → Storybook → iterate → commit). Show vague vs specific prompting. |
| 5 min | Show guardrails: break something on purpose, show typecheck/tests catching it. "You can't break anything permanently." |
| 5 min | Walk through their personal CLAUDE.md. Show assigned components in Storybook. Show how to start a session. |
| 5 min | Q&A |

**After the session:** Each designer does their first small task solo (Mudit available on Slack). First PR from each is the graduation moment.

## Contributors Tracking

Two mechanisms:

1. **Git-native:** Every commit includes `Co-Authored-By: Name <email>`. GitHub shows their faces on PRs and the contributor graph automatically.
2. **CONTRIBUTORS.md:** A file in the repo listing each contributor and their domain/contributions. Visible recognition.

## Success Criteria

**Week 2:** Each designer has shipped at least 2-3 merged PRs. They can run the full loop (describe → verify → commit) independently.

**Week 4:** Rotation complete. Each designer has touched 2 domains. Cross-pollination sessions have caught at least a few inconsistencies.

**Week 6+:** Designers are self-directed. The visual polish backlog is shrinking. shilp-sutra components feel noticeably more refined.
