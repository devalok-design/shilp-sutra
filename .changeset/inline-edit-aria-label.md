---
"@devalok/shilp-sutra": patch
---

**fix(InlineEdit):** forward `aria-label` / `aria-labelledby` to the `role="textbox"` span.

InlineEdit renders `role="textbox"` on an inner span but previously spread all props to the outer wrapper `<div>` — so any `aria-label` consumers passed never reached the element that actually needed the accessible name. axe flagged it as "ARIA input fields must have an accessible name"; the existing a11y test even had a rule-disable workaround for this.

**Fix:**

- Intercept `aria-label` and `aria-labelledby` from props before spreading to the wrapper; apply them to the textbox span.
- Fall back to `placeholder` as the aria-label when neither is provided — screen readers always get a meaningful name.
- Skip entirely in `readOnly` mode (no `role="textbox"` to label).

**Migration:** no breaking changes. Consumers already passing `aria-label` will now see it on the correct element; consumers relying on the previous (broken) behavior had nothing to rely on — the label was silently dropped.

Discovered during the `describeConformance` adoption audit (2026-04-21).
