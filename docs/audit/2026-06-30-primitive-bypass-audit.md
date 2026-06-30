# Primitive-Bypass Audit — Composition & Token Anti-Patterns

**Date:** 2026-06-30
**Scope:** `packages/core/src/**` (ui, composed, shell, ai) — excludes `.stories.tsx`, `.test.tsx`
**Trigger:** StatCard found to hand-roll `Card`'s surface contract instead of composing `Card`, and to have silently drifted during the recent anti-convergence / accent-rail passes (#82, #84).
**Method:** grep sweep + 4 read-only investigator passes, each finding verified against source.

---

## The anti-pattern (what StatCard is an instance of)

A higher-level component **reimplements a base primitive's contract by hand instead of composing the base component**. Recognised names:

- **Primitive bypass / reinventing the primitive** — the umbrella for this audit.
- **Copy-paste inheritance** — base's classes/CVA duplicated into a sibling.
- **Divergent / parallel implementation** — two sources of truth for one concept → they drift.
- **SSOT / DRY violation** — the root principle violated.
- **Token bypass** — the token-layer sibling (hardcoded value where a token exists).

**Why it bites:** when the base's contract changes (Card's surface treatment changed in #82/#84), every hand-rolled copy silently drifts. There is no compile error — only visual divergence found later by eye. This is exactly how StatCard ended up wrong.

---

## Findings — verified

Confidence: **confirmed** = read by primary + verified by a second pass; **likely** = read once, judgment clear; **API-gap** = real bypass but the base can't currently express the need.

### Class A — `Card` bypass (composition)

| # | File:line | Confidence | Evidence |
|---|---|---|---|
| A1 | `ui/stat-card.tsx:241,397,408` | confirmed | hand-rolls `rounded-surface bg-surface-raised` + manual shadow/border in 3 branches (loading, base, link). **Already being fixed by another session.** |
| A2 | `composed/content-card.tsx:7` | confirmed — **worst** | defines own `contentCardVariants` CVA duplicating Card's `default`/`outline`/`ghost` surface strings verbatim. Two Cards, two sources of truth. |
| A3 | `ui/data-table-card.tsx:37` | confirmed | mobile card rows hand-roll `rounded-surface border border-surface-border bg-surface-raised`. |

> **Ruled LEGIT (not bypass):** `ui/oauth-button/oauth-button.tsx:518` `OAuthConnectionRow` — atomic settings-list row, not a section container; Card's sub-component model doesn't apply.

### Class B — `Button` / `IconButton` bypass (composition)

12 instances, heavily concentrated in the rich-chat-input family.

| # | File:line | Should be | Evidence |
|---|---|---|---|
| B1 | `composed/rich-chat-input/audio-player.tsx:136` | `Button size="icon-md" variant="solid"` | `inline-flex h-8 w-8 rounded-pill bg-accent-9 hover:bg-accent-10 active:scale-95` |
| B2 | `composed/rich-chat-input/schedule-send.tsx:131` | `ToggleGroup` / `ButtonGroup` | AM/PM paired toggle, hand-rolled selected states |
| B3 | `composed/rich-chat-input/schedule-send.tsx:285` | `Button variant="ghost" size="icon-xs"` | close icon, `hover:bg-surface-raised-hover` |
| B4 | `composed/rich-chat-input/schedule-send.tsx:321` | `Button variant="ghost" fullWidth` | preset row button |
| B5 | `composed/rich-chat-input/schedule-send.tsx:332` | `Button variant="ghost" fullWidth` | date-picker trigger |
| B6 | `composed/rich-chat-input/schedule-send.tsx:341` | `Button variant="ghost" fullWidth` | dialog trigger |
| B7 | `composed/rich-chat-input/schedule-send.tsx:439` | `Button variant="soft" size="icon-xs"` | edit icon, `hover:bg-accent-3` |
| B8 | `composed/rich-chat-input/schedule-send.tsx:448` | `Button variant="soft" size="icon-xs"` | clear icon, `hover:bg-accent-3` |
| B9 | `composed/rich-text-editor.tsx:161` | `Button variant="solid" size="sm"` | apply/submit, `bg-accent-9 hover:bg-accent-10` |
| B10 | `shell/notification-center.tsx:236` | `Button variant="solid" size="sm"` | primary action, `bg-accent-9 hover:bg-accent-10` |
| B11 | `shell/sidebar.tsx:491` | `Button asChild` + Link | promo link, `bg-accent-9 hover:bg-accent-10` |
| B12 | `shell/sidebar.tsx:497` | `Button variant="solid" size="sm"` | promo button |

### Class C — `Input` / `Textarea` bypass (composition)

| # | File:line | Should be | Evidence |
|---|---|---|---|
| C1 | `ui/chat/message.tsx:348` | `Textarea` + className override | inline-edit textarea matches `textareaVariants` exactly (`focus-visible:ring-accent-9`); only the `text-[13px]` diverges |
| C2 | `composed/rich-chat-input/schedule-send.tsx:104` | `Select` / `Input` | hour/minute selects hand-roll `focus-visible:ring-2 ring-accent-9` |

### Class D — `Badge` bypass / **API gap**

| # | File:line | Status | Evidence |
|---|---|---|---|
| D1 | `ui/oauth-button/oauth-button.tsx:310` | API gap | `defaultBadge` needs a 9px corner pill; Badge's smallest size (`xs`) is 12px + min-height. Badge **cannot** express this today. Either accept as documented exception or add a smaller Badge size. |

### Class E — Token bypass: **missing micro-typography scale** (one root cause)

26 magic-value hits. Investigator ruled **no semantic-skipping** (DS is disciplined there) and most spacing one-offs justified. The real signal is a **missing type scale below `text-ds-xs` (10px)**:

- `text-[13px]` ×5 — `ui/chat/message.tsx:247,267,341,348,361`
- `text-[11px]` — `chat/message.tsx:250`, `badge-indicator.tsx:68`
- `text-[9px]` — `avatar.tsx:84`, `oauth-button.tsx:310`
- `text-[10px]` — `avatar.tsx:234`, `color-swatch.tsx:105`
- sub-4px spacing (`px-1`, `px-1.5`, `px-2.5`) — `avatar.tsx:234`, `badge.tsx:60`, `badge-indicator.tsx:68`, `color-swatch.tsx:105`, `oauth-button.tsx:310` — minor

**Excluded legit:** `color-input.tsx`, `color-swatch.tsx` (dynamic user colors), `devadoot-icon.tsx`, `devalok-grain.tsx` (brand visual identity), `charts/*` (data-driven), hairline borders / icon-internal SVG sizing.

### Class F — Meta: no automated guard

`scripts/pre-publish-audit.mjs` enforces **surface levels** (`SURFACE1_ALLOWLIST`) and shadow-token hygiene — but has **no gate for primitive bypass**. Nothing catches "component hand-rolls `bg-accent-9 hover:bg-accent-10` instead of `<Button>`." That is why B1–B12 accumulated unnoticed.

---

## What was NOT found (scope is bounded)

- No copy-paste CVA duplication beyond A2 (ContentCard).
- No wrapper-adds-nothing components.
- No semantic-token skipping (primitive palette used where semantic exists).
- Button-bypass is **not** in `ui/` — it's all in `composed/` + `shell/` + chat. The ui/ primitives are clean.

---

## Recommendations

> Status: **partial approval — 2026-06-30.** A2 and Class B pending a visual review (artifact built for the user to decide). The rest are ruled.

### Locked decisions

| Issue | Decision | Notes |
|---|---|---|
| **A1 StatCard** | Compose `Card`. | **Owned by another session** — coordinate, watch for the flat-border mismatch (Card `flat`=no border vs StatCard `flat`=border). |
| **A3 DataTableCards** | Approved: compose `Card variant="outline"` for rows. | Internal, low risk, non-breaking. |
| **C1 message textarea** | Approved: compose `<Textarea>` + className override for the 13px. | Non-breaking. |
| **C2 schedule-send selects** | Approved: compose `Select`/`Input`. | Non-breaking. |
| **D1 Badge corner pill** | **Accept as documented exception.** | Add `// intentional: corner pill below Badge's xs` comment. Do NOT add a sub-`xs` Badge size for one call site. |
| **E micro-typography** | **APPROVED — full micro-scale.** Add `--text-ds-2xs` (13px), `--text-ds-3xs` (11px), `--text-ds-4xs` (9px) to the type scale. | Additive, non-breaking. Then replace `text-[13px]`/`[11px]`/`[9px]` magic values (message.tsx ×5, avatar, badge-indicator, oauth, color-swatch) with the tokens. |
| **F automated guard** | **Noted for the executing session** — not built here. | Recommended: add a primitive-bypass gate to `scripts/pre-publish-audit.mjs` (flag Button signature `bg-accent-9 hover:bg-accent-10` and Card signature `rounded-surface bg-surface-raised` in non-overlay components, with an allowlist). Highest leverage for preventing recurrence. The session doing the fixes should evaluate + implement. |

### Pending decisions (visual review in progress)

- **A2 ContentCard** — options: (a) compose Card internally [recommended, non-breaking], (b) merge + deprecate [breaking], (c) leave. Awaiting user ruling.
- **Class B (12 button bypasses)** — options: (a) refactor all 12 [recommended; B2 AM/PM → ToggleGroup], (b) high-visibility subset first, (c) defer. Awaiting user ruling.

### For the executing session (handoff note)

All findings above are verified against source (file:line accurate as of 2026-06-30, branch `feat/remove-card-accent-rail`). This audit session is **docs/plans only** — no code was changed here. Use this doc as the work list. A1 (StatCard) is already in flight elsewhere; deconflict before touching `stat-card.tsx`.
