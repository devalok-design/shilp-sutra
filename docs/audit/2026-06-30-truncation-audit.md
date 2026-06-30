# Truncation Audit — Overflow Handling Across the Component Library

**Date:** 2026-06-30
**Scope:** `packages/core/src/**` (ui, composed, shell, ai) — excludes `.stories.tsx`, `.test.tsx`
**Method:** web research (Carbon / PatternFly / Primer / TPGi / CSS-Tricks / MDN) → rubric → 3 parallel read-only investigator sweeps (missing / broken / wrong-strategy), each finding verified against source.
**Branch:** `feat/remove-card-accent-rail`. This session is **docs/plans only** — no code changed.

---

## The rubric (what "correct" means)

Truncation is a **last resort** — prefer responsive layout / wrapping / abbreviation. When you must:

1. **Truncate only static, bounded-space text.** NEVER truncate page titles/headers, error/validation messages, or notification bodies — those must show fully.
2. **Full text must be recoverable** — `title` attr or tooltip. Truncate-with-no-recovery = silent information loss.
3. **`title` ≠ fully accessible** — it doesn't reach keyboard users. Interactive truncated items want a real tooltip. CSS truncation keeps full text in the DOM (SR-safe); JS `.slice()` truncation does NOT unless an `aria-label`/`title` carries the full string.
4. **Leave ≥4 identifying chars.**
5. **Don't truncate text containing focusable children** (links, mentions, buttons).
6. **Tooltip only on actual overflow** (`scrollWidth > clientWidth`) — else it's noise.
7. **Numbers: abbreviate, don't truncate** — a truncated number is a wrong number.
8. **The #1 bug:** `truncate` on a flex/grid child does nothing without `min-w-0` on the shrinking item (unless an explicit `max-w`/width is set).
9. **Strategy matters:** end-ellipsis destroys the tail. For filenames (extension), emails (domain), paths, hashes — **middle truncation** keeps both meaningful ends. Middle-truncation is NOT native CSS.

Sources: Carbon Overflow Content, PatternFly Truncation, Primer Truncate a11y, TPGi "Ballad of Text Overflow", CSS-Tricks Flexbox & Truncated Text, MDN line-clamp.

---

## Findings

Confidence: **confirmed** = agent read the JSX; **verify** = inferred from ancestry, needs a 1-line ancestor check before fixing.

### Class M — Missing truncation (unbounded user text would overflow/wrap)

| # | File:line | Element | Fix | Conf |
|---|---|---|---|---|
| M1 | `shell/sidebar.tsx:253,316` | nav item `item.title` | `truncate` (+ `min-w-0` row) | confirmed |
| M2 | `shell/sidebar.tsx:285` | sub-item `child.title` | `truncate` | confirmed |
| M3 | `shell/sidebar.tsx:485` | `footer.promo.text` | `line-clamp-2` | confirmed |
| M4 | `ui/breadcrumb.tsx:58,61` | page/link `label` | `truncate max-w-[..]` per crumb | confirmed |
| M5 | `ui/tabs.tsx:282` | tab label `{children}` | `truncate` (tabs must not wrap) | confirmed |
| M6 | `ui/dropdown-menu.tsx:152,290` | SubTrigger / RadioItem children | `truncate` | confirmed |
| M7 | `ui/select.tsx:214` | `SelectItem` text (trigger already `line-clamp-1` ✓) | `line-clamp-1` | confirmed |
| M8 | `ui/menubar.tsx:111,251` | SubTrigger / RadioItem children | `truncate` | confirmed |
| M9 | `composed/command-palette.tsx:459,460,464` | result label / description | label `truncate`, desc `line-clamp-1` | confirmed |
| M10 | `composed/page-header.tsx:90,94` | **subtitle only** | `line-clamp-2` | confirmed |
| M11 | `ui/combobox.tsx` (~319–370) | multi-pill overflow row | wrap or `+N` overflow | **verify** (range not fully read) |

> **Reconciled OUT (per rule #1 — do NOT truncate):** `page-header` H1 title (`:61,72,90` title), `toast.tsx:230,241` title/description. Agents flagged these as "unclamped"; that is correct behaviour, not a defect. Page titles and toasts must show fully.

### Class B1 — Broken: `truncate` on a flex/grid child missing `min-w-0`

These truncate silently (do nothing) unless the child can shrink. **Each needs a 1-line ancestor verification** — some may already work via an explicit `max-w`.

| # | File:line (truncating el) | Suspect ancestor | Conf |
|---|---|---|---|
| B1-1 | `ui/sidebar.tsx:578,642` | button + wrapper span both `flex w-full`, no `min-w-0` | verify |
| B1-2 | `ui/tree-view/tree-item.tsx:187,191` | flex row `:132` no `min-w-0` | verify |
| B1-3 | `ui/combobox.tsx:394,399` | trigger button flex, no `min-w-0` | verify |
| B1-4 | `ui/select.tsx:42` | `[&>span]:line-clamp-1`; SelectValue flex may lack `min-w-0` | verify |
| B1-5 | `composed/member-picker.tsx:78` → `multi-select-popover.tsx:232` | button `:213` flex, no `min-w-0` | verify |
| B1-6 | `composed/rich-chat-input/schedule-send.tsx:435` | row `:433` no `min-w-0` | verify |
| B1-7 | `composed/filter-bar.tsx:189` | trigger/flex ancestor no `min-w-0` | verify |

> `composed/rich-chat-input/attachment-strip.tsx:110` uses `truncate max-w-[120px]` → truncate **works** without min-w-0 (explicit max-w). Not a B1 bug. (It has other issues — see B2/W.)

### Class B2 — Broken: truncates but NO recovery (no `title`/tooltip/aria full-text)

Silent information loss — user can't read the full string.

| # | File:line | Truncated text | Conf |
|---|---|---|---|
| B2-1 | `shell/sidebar.tsx:392,395` | user name / designation | confirmed |
| B2-2 | `shell/top-bar.tsx:300` | user email | confirmed |
| B2-3 | `shell/notification-center.tsx:195,215` | notification title / project | confirmed |
| B2-4 | `composed/activity-feed.tsx:182` | item action (clickable) | confirmed |
| B2-5 | `composed/rich-chat-input/attachment-strip.tsx:110` | filename | confirmed |
| B2-6 | `composed/extensions/file-attachment.tsx:25` | filename (in a link) | confirmed |
| B2-7 | `composed/file-preview.tsx:107` | filename | confirmed |
| B2-8 | `ui/badge.tsx:289` | badge children | confirmed |

### Class W — Wrong strategy: end-truncation where MIDDLE truncation is correct

End-ellipsis destroys the identifying tail (extension / domain). No `truncateMiddle` helper exists in the repo.

| # | File:line | Text | Why middle | Conf |
|---|---|---|---|---|
| W1 | `composed/extensions/file-attachment.tsx:25` | filename | end hides `.pdf`; `report-v1`/`v2` collide | confirmed |
| W2 | `composed/rich-chat-input/attachment-strip.tsx:110` | filename | + the `max-w-[120px]` makes it worse | confirmed |
| W3 | `composed/file-preview.tsx:107` | filename | hides extension | confirmed |
| W4 | `composed/file-preview/audio-preview.tsx:163` | filename | hides extension | confirmed |
| W5 | `ui/oauth-button/oauth-button.tsx:530` | email | end hides domain | confirmed |
| W6 | `shell/top-bar.tsx:300` | email | end hides domain | confirmed |

> **Worst offenders** (appear in BOTH B2 and W — wrong strategy AND no recovery): `file-attachment.tsx:25`, `attachment-strip.tsx:110`, `file-preview.tsx:107`, `top-bar.tsx:300`.

> **Correct as-is:** `ui/inline-edit.tsx:88,129` uses JS `.slice(0, max)` — that's a form-validation hard cap (not display truncation). Leave it.

---

## Tally

- **Class M (missing):** 10 confirmed + 1 verify
- **Class B1 (min-w-0 bug):** 7 spots, all need ancestor verification
- **Class B2 (no recovery):** 8 confirmed
- **Class W (wrong strategy):** 6 confirmed (4 overlap B2)

Net: ~25 distinct fix sites, clustering in **sidebar, file-attachment/preview family, and form-control triggers (combobox/select/multi-select)**.

---

## Recommendations

The high-leverage move is **two shared primitives**, not 25 one-off edits:

### R1 — `<TruncatedText>` component (solves B2 + the recovery half of M, system-wide)
A wrapper that single-line/`line-clamp`s its text AND auto-attaches a tooltip **only when actually overflowing** (`scrollWidth > clientWidth` via ResizeObserver), with the full string as accessible name. One component, applied at the ~16 B2/M recovery sites. Fixes rule #2, #3, #6 in one place instead of sprinkling `title=`.

- Quick alternative: just add `title={fullText}` at each site. Cheaper, but fails keyboard a11y (rule #3) and shows on non-overflowing text (rule #6). Not recommended for a DS that ships a Tooltip already.

### R2 — `truncateMiddle()` helper + use it at W1–W6
```ts
// composed/lib/string-utils.ts (new) or ui/lib/
export function truncateMiddle(str: string, max: number, ellipsis = '…'): string {
  if (str.length <= max) return str
  const keep = max - ellipsis.length
  return str.slice(0, Math.ceil(keep / 2)) + ellipsis + str.slice(-Math.floor(keep / 2))
}
```
Pair every use with `title={fullString}` (or wrap in `<TruncatedText>`), because JS char-count truncation is **not responsive** and removes text from the DOM (rule #3). For variable-width containers, the CSS flexbox pseudo-element middle-truncation is the responsive alternative (more complex). For fixed-width chips (filename/email pills) the JS helper is fine.

### R3 — `min-w-0` sweep (B1)
Verify each B1 ancestor (1 line each), add `min-w-0` to the shrinking flex/grid item where confirmed. Mechanical, low risk.

### R4 — Add `truncate`/`line-clamp` at the M sites
Respecting the reconciliation: do NOT touch page-header H1 title or toast.

### R5 — Consider a guard
The truncation gaps recur because nothing enforces them. Optional: a lint rule / `pre-publish-audit` check flagging unbounded user-text spans in known list/nav components, and `truncate` without `min-w-0`/`max-w`. (Lower priority than the bypass-audit's F gate.)

### Decisions (locked 2026-06-30) — for the executing session

1. **Unify on one primitive: `<TruncatedText>`.** It handles end-truncation, `line-clamp`, middle-truncation (`mode="middle"`), AND overflow-aware recovery (tooltip only when `scrollWidth > clientWidth`, full string as accessible name). This single component subsumes R1 **and** R2 — filenames/emails use `<TruncatedText mode="middle">`, everything else uses the default. No standalone `truncateMiddle` export needed unless convenient internally.
2. **Scope: one audit-driven PR.** All ~25 sites (M + B1 + B2 + W) plus the `<TruncatedText>` primitive land together as a single tracked effort — not split into phases.
3. **R5 guard: noted, not decided.** The executing session evaluates whether to add a lint/`pre-publish-audit` rule (unbounded user-text in list/nav components; `truncate` without `min-w-0`/`max-w`). Recorded here as an option, not a commitment.
4. **Recovery mechanism (component internals): open.** The user will settle the exact recovery implementation with the executing session. The audit's position: `title`-only is insufficient for a DS (fails keyboard a11y, fires on non-overflow) — favour the overflow-aware tooltip inside `<TruncatedText>`. Not locked.

### Reminders for implementation
- **Do NOT truncate:** page-header H1 title, toast title/body (rule #1).
- **B1 rows need a 1-line ancestor check** before adding `min-w-0` — some may already work via `max-w`.
- JS char-count truncation removes text from the DOM → whatever `<TruncatedText mode="middle">` does internally, the **full string must remain the accessible name** (rule #3).
- `ui/inline-edit.tsx:88,129` `.slice()` is a validation cap, NOT display truncation — leave it.

### Handoff
File:line accurate as of 2026-06-30, branch `feat/remove-card-accent-rail`. This audit is **docs-only** — no code changed this session. The executing session implements; deconflict on any file also touched by the StatCard/Card work in flight.
