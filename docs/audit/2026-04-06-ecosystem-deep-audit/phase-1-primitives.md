# Phase 1: Vendored Primitives Audit

## Vendored Version

- **Source**: radix-ui/primitives (https://github.com/radix-ui/primitives)
- **Commit**: 22473d16404bfd446305db5b6c9308aece99fdec (main branch)
- **Vendored date**: 2026-03-01
- **License**: MIT

Key package versions at time of vendoring:
- react-accordion: 1.2.3
- react-alert-dialog: 1.1.15
- react-dialog: 1.1.6
- react-dropdown-menu: 2.1.6
- react-select: 2.1.6
- react-tabs: 1.1.3
- react-tooltip: 1.1.8

## APG Compliance Matrix

| Primitive | APG Pattern | Compliant? | Issues |
|---|---|---|---|
| react-accordion | Accordion | YES | Full compliance: Up/Down arrows with wrapping, Home/End, Enter/Space toggle via native button, `aria-expanded`, `aria-controls`, `role="region"`, `aria-labelledby`, horizontal orientation with Left/Right + RTL support |
| react-alert-dialog | Alert Dialog | YES | `role="alertdialog"`, `modal: true` forced, overlay click prevented (`onPointerDownOutside: event.preventDefault()`), focus trap via FocusScope, Escape close via DismissableLayer, auto-focus to Cancel button, `aria-describedby` warning |
| react-checkbox | Checkbox | YES | `role="checkbox"`, `aria-checked` with `"mixed"` tristate support, `type="button"` renders as button (Space/Enter activate natively), Enter explicitly prevented to avoid form submission, hidden `<input type="checkbox">` for form integration |
| react-collapsible | Disclosure | YES | `aria-expanded`, `aria-controls`, `type="button"` (native Enter/Space), `id` on content linked to trigger's `aria-controls` |
| react-context-menu | Menu | YES | Delegates to react-menu which has arrow nav, typeahead, sub-menu Right arrow, Enter/Space selection, Home/End/PageUp/PageDown. Long-press (700ms) for touch. Context menu trigger via `onContextMenu` |
| react-dialog | Dialog Modal | YES | FocusScope with `trapped: true` + `loop: true`, Escape via DismissableLayer, `role="dialog"`, `aria-labelledby`, `aria-describedby`, `hideOthers` for aria-hidden on siblings, RemoveScroll for scroll lock, focus restore to trigger on close. Non-modal variant correctly disables focus trap |
| react-dropdown-menu | Menu Button | YES | Enter/Space/ArrowDown open, delegates to react-menu for arrow nav + typeahead + Escape close, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, focus restore to trigger on close |
| react-hover-card | (none) | PARTIAL | Keyboard alternative exists: opens on focus, closes on blur. **Issue**: All tabbable elements inside content get `tabIndex="-1"` set, making content non-interactive via keyboard. This is by design (hover cards are supplementary) but deviates from potential user expectations |
| react-label | Label | YES | Renders native `<label>` element (inherits htmlFor/wrapping behavior), click-to-focus via native behavior, double-click prevention for text selection |
| react-menubar | Menu Bar | YES | `role="menubar"`, `role="menuitem"` on triggers, `aria-haspopup="menu"`, Left/Right between menus via RovingFocusGroup, Up/Down within menus via react-menu, Enter/Space/ArrowDown open, pointer enter switches menus when one is open |
| react-navigation-menu | Navigation | YES | Arrow key nav via FocusGroup, links focusable, `aria-expanded`, `aria-controls`, `aria-current="page"` for active links, `aria-label="Main"` on nav, Tab key management within content, Escape close with focus restore |
| react-popover | Non-modal Dialog | YES | `role="dialog"`, Escape close, `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`. Non-modal: no focus trap, no `disableOutsidePointerEvents`. Modal variant: focus trap + `hideOthers` + RemoveScroll. Focus restore to trigger |
| react-progress | Progressbar | YES | `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax`, `aria-valuetext` with percentage label, indeterminate state support (valuenow=undefined) |
| react-radio-group | Radio Group | YES | `role="radiogroup"`, `role="radio"` on items, `aria-checked`, `aria-required`, `aria-orientation`, RovingFocusGroup for arrow keys with loop, auto-select on arrow key focus (click on focus when arrow key pressed), Enter prevented |
| react-select | Listbox | YES | `role="combobox"` on trigger, `role="listbox"` on content, arrow nav (Up/Down/Home/End), typeahead search, Enter/Space select, Escape close, focus trap, `hideOthers`, RemoveScroll, `aria-expanded`, `aria-controls`, `aria-autocomplete="none"`, Tab prevented inside |
| react-separator | Separator | YES | `role="separator"`, `aria-orientation` (only set for vertical, omitted for horizontal per spec), decorative mode sets `role="none"` |
| react-slider | Slider | YES | `role="slider"`, `aria-valuemin`, `aria-valuenow`, `aria-valuemax`, `aria-orientation`, `aria-label`, Arrow keys (step), Home/End (min/max), PageUp/PageDown (10x step), Shift+Arrow (10x step), multi-thumb support with auto-generated labels |
| react-switch | Switch | YES | `role="switch"`, `aria-checked`, `aria-required`, `type="button"` (native Space/Enter), hidden checkbox for form integration |
| react-tabs | Tabs | YES | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-orientation`, RovingFocusGroup for arrow keys with loop, `activationMode` prop for automatic (focus=select) or manual (Enter/Space=select), `tabIndex=0` on tabpanel |
| react-toast | Alert/Status | YES | `role="status"` with `aria-live="polite"` (background) or `aria-live="assertive"` (foreground) via ToastAnnounce, auto-dismiss with configurable duration, pause on hover/focus (`pointermove` + `focusin`), resume on leave/blur, Escape close, swipe dismiss, F8 hotkey to focus viewport, `altText` on actions for announce text |
| react-toggle | Toggle Button | YES | `aria-pressed`, `type="button"` (native Enter/Space), `data-state` for styling |
| react-toggle-group | Toolbar | YES | `role="group"`, RovingFocusGroup for arrow nav with loop, single mode uses `role="radio"` + `aria-checked` on items (correct APG pattern for single-select toggle groups) |
| react-tooltip | Tooltip | YES | Escape dismiss (via DismissableLayer), configurable delay (`delayDuration`), pointer AND focus trigger, close on scroll, close on pointer down, `aria-describedby` linking, content rendered in VisuallyHidden with `role="tooltip"` + id for screen reader association, `disableHoverableContent` option, pointer grace area for safe cursor transit |

## Focus Management

### Focus Trapping (`react-focus-scope.tsx`)

**Implementation**: Comprehensive and correct.

- **Tab/Shift+Tab wrapping**: Handled in `handleKeyDown`. When Tab on the last tabbable element, focus wraps to first (when `loop=true`). When Shift+Tab on first, wraps to last.
- **Edge case: no tabbables**: If no tabbable elements inside, prevents Tab on the container itself.
- **focusin/focusout listeners**: When `trapped=true`, document-level listeners intercept focus escaping the container and redirect it back to `lastFocusedElementRef.current`.
- **MutationObserver**: Watches for removed nodes. If the active element is removed (focus falls to body), refocuses the container. This prevents focus from escaping when content changes dynamically.
- **Focus scope stack**: `focusScopesStack` manages nested focus scopes (e.g., dialog inside dialog). When a new scope is added, the previous one is paused. When removed, the previous one resumes. This correctly handles stacked modals.
- **Auto-focus on mount**: Fires custom `AUTOFOCUS_ON_MOUNT` event. If not prevented, focuses the first tabbable candidate (links are excluded from initial auto-focus via `removeLinks`).

**Minor note**: The `removeLinks` function in auto-focus excludes `<a>` elements from receiving initial focus. This is an intentional Radix design choice (prefer buttons/inputs over links for initial focus), not an APG violation.

### Focus Restoration (`react-focus-scope.tsx`)

**Implementation**: Correct.

- On mount, `previouslyFocusedElement` is captured (`document.activeElement`).
- On unmount, fires `AUTOFOCUS_ON_UNMOUNT` event. If not prevented, restores focus to `previouslyFocusedElement` (or `document.body` as fallback).
- Uses `setTimeout(0)` for unmount focus restoration, allowing the DOM to settle before refocusing.
- Dialog primitive composes `onCloseAutoFocus` to explicitly restore focus to `triggerRef.current` (overriding the default), which is the correct pattern.

**Used by**: Dialog (modal), AlertDialog, Popover (modal), Menu (modal), Select.

### Scroll Lock

**Implementation**: Handled externally via `react-remove-scroll` (not vendored, runtime dependency).

- Dialog overlay wraps content in `<RemoveScroll allowPinchZoom>`.
- Menu modal content wraps in `<RemoveScroll>`.
- Select content wraps in `<RemoveScroll allowPinchZoom>`.
- Popover modal content wraps in `<RemoveScroll allowPinchZoom>`.
- `allowPinchZoom={true}` is set on all, which is correct for accessibility (zoom should not be blocked).
- `shards` prop used on Dialog overlay to allow scrolling within the content ref when overlay and content are siblings.

### aria-hidden on siblings (`aria-hidden` package)

**Implementation**: Handled externally via `aria-hidden` package's `hideOthers()` (not vendored, runtime dependency).

- Called in `useEffect` on mount for: Dialog (modal), Menu (modal), Popover (modal), Select content.
- Returns cleanup function that restores `aria-hidden` on unmount.
- AlertDialog delegates to Dialog (which is forced `modal: true`), so it inherits `hideOthers`.
- Non-modal variants (Dialog, Popover) correctly do NOT call `hideOthers`.

### Dismiss on Outside Interaction (`react-dismissable-layer.tsx`)

**Implementation**: Comprehensive and correct.

- **Escape key**: Uses `useEscapeKeydown` hook. Only the highest layer in the stack responds (prevents nested escapes from dismissing all layers at once).
- **Pointer down outside**: Uses `usePointerDownOutside` hook. Touch events deferred to `click` event for better mobile support. Pointer events disabled on body when `disableOutsidePointerEvents=true`, re-enabled on unmount.
- **Focus outside**: Uses `useFocusOutside` hook. Detects focus moving outside via `focusin` document listener, cross-checked with React tree via capture-phase handlers.
- **Branch support**: `DismissableLayerBranch` allows marking DOM regions that should not trigger outside-interaction dismissal (used by Toast viewport).
- **Layer stacking**: Manages a set of layers. Only the topmost layer with `disableOutsidePointerEvents` blocks pointer events on lower layers.

### Focus Guards (`react-focus-guards.tsx`)

**Implementation**: Correct.

- Inserts invisible `<span tabIndex=0>` elements at the very beginning and end of `document.body`.
- These act as "bumpers" that prevent browser focus from leaving the page when Tab/Shift+Tab reaches the edge.
- When a focus scope traps focus, these guards ensure the tab cycle stays within the document.
- Reference-counted: multiple concurrent focus scopes share the same guards, removed when count reaches zero.

### Portal Rendering (`react-portal.tsx`)

**Implementation**: Simple and correct.

- Uses `ReactDOM.createPortal` to render into `document.body` (or custom container).
- SSR safe: waits for mount via `useLayoutEffect` before rendering.
- No accessibility implications beyond what's handled by focus scope and aria-hidden.

### Presence (`react-presence.tsx`)

**Implementation**: Correct.

- State machine: `mounted` -> `unmountSuspended` (animating out) -> `unmounted`.
- Supports CSS animation-based exit transitions (waits for `animationend` before unmounting).
- Render callback pattern `children={({ present }) => ...}` allows conditional rendering while maintaining animation.
- No accessibility implications (purely visual/lifecycle).

## APG Deviations (vendored vs current APG)

### 1. Select: `role="combobox"` vs `role="listbox"` trigger

The vendored Select trigger uses `role="combobox"` with `aria-autocomplete="none"`, which follows the APG "Select-Only Combobox" pattern. The current APG (2024) actually recommends this approach for custom select widgets over the older `role="listbox"` pattern for the trigger. **This is compliant with current APG.**

### 2. Accordion: No `aria-disabled` on trigger

The Accordion trigger sets `aria-disabled` only when the item is open and the accordion is not collapsible (i.e., you cannot close the last open item). It does NOT set `aria-disabled` on non-collapsible single-accordion triggers in other states. This matches Radix's intended behavior but differs from some APG examples that use `disabled` attribute directly. **Minor: acceptable tradeoff.**

### 3. Tooltip: No `role` on content container

The visible tooltip content element does not have `role="tooltip"`. Instead, a VisuallyHidden sibling has `role="tooltip"` with the `id` that the trigger references via `aria-describedby`. This means the visible content is decorative and the screen reader gets a separate text-only version. **This is an intentional pattern** that avoids issues with rich tooltip content being announced incorrectly, but deviates from the simplest APG example. Functionally equivalent.

### 4. Menu: Tab key prevented

In Menu content, pressing Tab is explicitly prevented (`event.key === "Tab" && event.preventDefault()`). The current APG Menubar pattern says Tab should move focus out of the menu to the next focusable element in the page. Radix prevents Tab entirely, keeping focus trapped within the menu. Users must press Escape to exit. **This is a known Radix design decision** that slightly deviates from APG. The rationale is that menus should be modal-like. In practice, this rarely causes issues because Escape is well-understood.

### 5. HoverCard: Content not keyboard navigable

All tabbable elements inside HoverCard content get `tabIndex="-1"` forced on them, making the content non-interactive via keyboard. The content opens on trigger focus but is not reachable via Tab. **This is intentional** -- hover cards are meant for supplementary content only. However, the current APG notes (2024) suggest that if a popup contains interactive elements, they should be reachable. **If your hover cards contain links or buttons, consider using Popover instead.**

### 6. Toast: Uses `role="status"` not `role="alert"`

Toast announces use `role="status"` with `aria-live="assertive"` for foreground toasts and `aria-live="polite"` for background. The APG recommends `role="alert"` for urgent notifications. Radix uses `role="status"` even for foreground toasts because `role="alert"` implies `aria-live="assertive"` AND `aria-atomic="true"`, which can cause the entire toast to be re-announced on any content change. **Using `role="status"` with explicit `aria-live="assertive"` gives the same urgency without the re-announcement side effect.** This is a pragmatic deviation.

### 7. Slider: No `aria-label` fallback for single thumb

For single-thumb sliders, `getLabel()` returns `undefined`, meaning no automatic `aria-label` is generated. The consumer must provide their own `aria-label` or `aria-labelledby`. Multi-thumb sliders get automatic labels ("Minimum"/"Maximum" for 2, "Value N of M" for 3+). **APG requires all sliders to have an accessible name.** The vendored code correctly defers to the consumer but does not warn if no label is provided.

### 8. ToggleGroup (single): Uses `role="radio"` + `aria-checked`

When `type="single"`, ToggleGroupItem renders with `role="radio"` and `aria-checked` instead of `aria-pressed`. This matches the APG recommendation for single-select toggle groups (they behave like radio groups). **Compliant.**

## Recommendations

### No Critical Fixes Needed

The vendored Radix primitives are well-aligned with WAI-ARIA APG patterns. All critical accessibility infrastructure (focus trapping, focus restoration, aria-hidden, scroll lock, dismiss behavior) is correctly implemented.

### Low-Priority Improvements (for DS wrapper layer, not vendored code)

1. **Slider accessible name warning**: Consider adding a dev-mode warning in the DS `Slider` wrapper if neither `aria-label` nor `aria-labelledby` is provided.

2. **HoverCard documentation**: Document clearly that HoverCard content is intentionally non-interactive via keyboard. If consumers need interactive popups, they should use Popover.

3. **Menu Tab behavior**: Document that Tab is trapped in menus (Escape to exit). This is a known Radix behavior that consumers may not expect.

4. **Toast role guidance**: Document when to use `type="foreground"` (assertive) vs `type="background"` (polite) and explain the `role="status"` rationale.

### Do NOT Modify Vendored Code

All identified deviations are intentional Radix design decisions with sound rationale. Modifying the vendored primitives would:
- Create maintenance burden on future Radix updates
- Risk introducing regressions in well-tested code
- Break the "zero runtime dep" vendoring contract

Any behavioral adjustments should be made in the DS wrapper components (`packages/core/src/ui/` and `packages/core/src/composed/`), not in the primitives.
