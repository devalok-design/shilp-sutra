# Form Infrastructure, Content & Date Picker Audit -- Phase 3, Groups C+L+Q

**Phase:** 3c + 3l + 3q
**Auditor:** Claude
**Date:** 2026-04-12

## Group C — Form Infrastructure: Overall Rating: A- (clean context architecture, useFormField gap)
## Group L — Content: Overall Rating: B (strong APIs, 7 components with zero tests)
## Group Q — Date Picker: Overall Rating: B+ (CalendarGrid strong, TimePicker keyboard gap)

---

## GROUP C — FORM INFRASTRUCTURE

| Component | Overall | Key Finding |
|-----------|---------|-------------|
| **Form/useFormField** | A- | Clean context-based ARIA wiring. BUT: Select, Combobox, DatePicker do NOT consume useFormField(). ARIA wiring gap. |
| **Label** | A | Correct Radix Label with required asterisk (aria-hidden). No issues. |
| **FormSection** | B | **No tests.** Ref not forwarded in collapsible branch. Header uses `<span>` not heading element. |

### Critical Finding: useFormField() Adoption Gap
Only Input, Textarea, NumberInput consume `useFormField()`. These do NOT: Select, Combobox, Autocomplete, DatePicker, RichTextEditor, all date-picker variants. Wrapping these in `<FormField state="error">` shows visual helper text but provides zero ARIA wiring to the actual input.
**Priority:** P0 | **Effort:** M

---

## GROUP L — CONTENT

| Component | API | A11y | Tests | Key Finding |
|-----------|-----|------|-------|-------------|
| **MarkdownViewer** | A- | B+ | **D (zero)** | No sanitization warning for allowHtml. Copy button no error handling. |
| **RichTextEditor** | A | B+ | B- | Toolbar lacks roving tabindex (20+ tab stops). Good SSR safety. |
| **RichChatInput** | A | B | **D (zero)** | 850-line component, zero tests. Three duplicate emoji pickers. window.prompt for links. |
| **FileUpload** | A | B+ | **D (zero)** | Contradictory aria-hidden + aria-label on hidden input. |
| **FilePreview** | A | B | **D (zero)** | Video disables media-has-caption. Not forwardRef. |
| **EmojiPicker** | A- | B+ | B+ | Lazy-loaded. No aria-label on container. |
| **InlineEdit** | A | B- | **D (zero)** | No aria-label on textbox. Uses deprecated execCommand. |
| **Extensions** | A | B+ | B | Suggestion popups create DOM outside React tree. |

### Systemic Issue: 7 Components With Zero Tests
RichChatInput, FileUpload, FilePreview, InlineEdit, MarkdownViewer, FormSection, date-utils — all have zero test coverage. RichChatInput at 850+ lines is the most critical gap.
**Priority:** P0 | **Effort:** L (total across all)

### Three Duplicate Emoji Pickers
EmojiPicker, RichTextEditor, and RichChatInput each have their own emoji picker implementation. Should consolidate.
**Priority:** P2 | **Effort:** M

---

## GROUP Q — DATE PICKER

| Component | API | A11y | Keyboard | Tests | Key Finding |
|-----------|-----|------|----------|-------|-------------|
| **CalendarGrid** | A | A- | A- | A | Missing aria-live for month changes. Double tab-stop bug. |
| **DatePicker** | A | A- | A- | A | Solid. Drill-down day/month/year. |
| **DateRangePicker** | A | A- | B+ | A- | Multi-month, presets sidebar. |
| **DateTimePicker** | A | B+ | B+ | A- | Uses native `<select>` for time (inconsistent with TimePicker). |
| **TimePicker** | A | B+ | **B-** | A | **No keyboard nav within columns.** Must tab through 60 buttons. |
| **MonthPicker** | A | A- | A- | A | Clean grid with arrow nav. |
| **YearPicker** | A | A- | A- | A | Clean grid with arrow nav. |
| **Presets** | A | A- | A | A | Simple, well-defined. |
| **date-utils** | B+ | — | — | **D (zero)** | Hardcoded en-IN locale. |

### Critical Finding: TimePicker Keyboard Navigation
No arrow key navigation within time columns. User must tab through every hour/minute button individually. Minute column with step=1 renders 60 buttons. Columns need role="listbox" and buttons need role="option".
**Priority:** P1 | **Effort:** M

---

## ALL FINDINGS (Priority Order)

### P0 — Must Fix

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 1 | 7 components with zero tests (RichChatInput, FileUpload, FilePreview, InlineEdit, MarkdownViewer, FormSection, date-utils) | Multiple | L |
| 2 | Select/Combobox/DatePicker don't consume useFormField() — ARIA gap | Form system | M |

### P1 — High

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 3 | TimePicker no keyboard nav within columns | TimePicker | M |
| 4 | CalendarGrid no aria-live for month changes | CalendarGrid | S |
| 5 | TimePicker columns need role="listbox"/role="option" | TimePicker | S |
| 6 | DateTimePicker uses native select (inconsistent with TimePicker) | DateTimePicker | M |
| 7 | ChatToolbar LinkButton uses window.prompt | RichChatInput | S |
| 8 | InlineEdit no aria-label on textbox | InlineEdit | S |
| 9 | CalendarGrid double tab-stop (grid div + cells) | CalendarGrid | S |
| 10 | RTE toolbar lacks roving tabindex (20+ stops) | RichTextEditor | M |

### P2 — Medium

| # | Finding | Component | Effort |
|---|---------|-----------|--------|
| 11 | Three duplicate emoji picker implementations | RTE, RichChatInput, EmojiPicker | M |
| 12 | InlineEdit uses deprecated execCommand | InlineEdit | S |
| 13 | FormSection ref not forwarded in collapsible branch | FormSection | S |
| 14 | CalendarGrid missing PageUp/PageDown | CalendarGrid | S |
| 15 | date-utils hardcodes en-IN locale | date-utils | S |
| 16 | Video preview suppresses media-has-caption | FilePreview | M |
| 17 | Suggestion popups create DOM outside React tree | Extensions | L |
| 18 | FormSection header should use semantic heading | FormSection | S |

## Top 3 Actions

1. **P0 — Write tests for 7 untested components** (L effort): RichChatInput is the most critical (850 lines, voice recording, file handling, slash commands).
2. **P0 — Wire useFormField() into Select, Combobox, DatePicker** (M effort): Currently ARIA wiring is broken for these in FormField context.
3. **P1 — Fix TimePicker keyboard navigation** (M effort): Add roving tabindex with arrow keys within columns. Add role="listbox"/role="option".
