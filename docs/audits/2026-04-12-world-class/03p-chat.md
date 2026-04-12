# Chat Components Audit -- Phase 3, Group P

**Phase:** 3p
**Auditor:** Claude
**Date:** 2026-04-12
**Components:** Message (compound), MessageInput, MessageList, SystemMessage, TypingIndicator, DateSeparator, UnreadSeparator

## Overall Rating: B (Good functionality, significant a11y gaps)

Well-structured chat component family with compound Message pattern, auto-scroll with "N new" pill, infinite scroll, and bubble/flat variants. 69 tests passing. Main gaps are accessibility (hover-only action toolbar, missing aria-labels, no axe tests) and lack of virtualization.

---

## Per-Component Summary

| Component | API | Variants | Visual | A11y | Motion | Tests | Key Finding |
|-----------|-----|----------|--------|------|--------|-------|-------------|
| **Message** | B+ | B+ (flat/bubble) | B | **C+** | B+ | A- (23 tests) | Actions toolbar hover-only — keyboard invisible |
| **MessageInput** | A- | C+ | B | **C** | **D** | A- (13 tests) | No aria-label on textarea. Zero animation. |
| **MessageList** | A- | C | B | B+ | B+ | B+ (11 tests) | role="log" + aria-live. No virtualization. |
| **SystemMessage** | B+ | B | B+ | **C** | D | B+ (6 tests) | Alert variant lacks role="alert" |
| **TypingIndicator** | B | C | B+ | **C+** | A- | B+ (5 tests) | No aria-live. Dead `image` prop. |
| **DateSeparator** | A- | C+ | A- | B | D | A- (6 tests) | No role="separator" |
| **UnreadSeparator** | B+ | C+ | B+ | B- | D | B+ (5 tests) | No role="separator" |

---

## P0 Findings (Accessibility)

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 1 | **Actions toolbar hover-only** — `opacity-0 group-hover:opacity-100`. Keyboard users can't see or access it. Add `group-focus-within:opacity-100`. | Message | XS |
| 2 | **MessageInput textarea no accessible name** — Screen readers hear "textbox" with no context. Need `aria-label`. | MessageInput | XS |
| 3 | **SystemMessage alert variant lacks role="alert"** — "Connection lost" not announced urgently. | SystemMessage | XS |
| 4 | **TypingIndicator no aria-live** — Typing state changes not announced to screen readers. | TypingIndicator | XS |
| 5 | **Reaction buttons lack descriptive aria-label** — Screen readers hear only the emoji character. | Message | S |

## P1 Findings (Quality)

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 6 | **No axe a11y tests** in any chat test file. Every other DS family has vitest-axe. | All | M |
| 7 | Hardcoded `text-[13px]`/`text-[11px]` bypass DS type scale. Should use `text-ds-xs`/`text-ds-sm`. | Message | S |
| 8 | `image` prop declared on TypingIndicator user type but never rendered. Dead prop. | TypingIndicator | XS |
| 9 | EditableBody textarea lacks `aria-label`. | Message | XS |
| 10 | AnimatePresence key warnings in stories — document key requirement. | Stories | XS |

## P2 Findings (Enhancement)

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 11 | No virtualization — performance degrades with 1000+ messages in DOM | MessageList | L |
| 12 | No WAI-ARIA feed pattern (role="feed" + role="article") | MessageList, Message | M |
| 13 | MessageInput doesn't expose ref to internal textarea | MessageInput | S |
| 14 | SystemMessage missing warning/success/info variants | SystemMessage | S |
| 15 | Separators lack role="separator" | DateSeparator, UnreadSeparator | XS |

## Cross-Checks

**Message grouping:** Supported via `grouped` prop (avatar hides, author hides). App computes grouping — correct boundary for DS.

**Virtualized list:** Not implemented. All loaded messages stay in DOM. `onLoadMore` paginates but doesn't remove offscreen items.

**Keyboard navigation:** Minimal. No arrow keys between messages. Actions toolbar is hover-only. EditableBody supports keyboard (Enter/Space/Escape).

**Scroll-to-bottom:** Well-implemented. autoScroll + "N new" floating pill + smooth scroll.

## Top 3 Actions

1. **P0 — Fix 5 accessibility violations** (all XS-S effort): Actions toolbar visibility, textarea label, alert role, aria-live, reaction labels.
2. **P1 — Add axe tests** (M effort): Every other DS component family has them.
3. **P1 — Replace hardcoded text sizes** with DS type scale tokens.
