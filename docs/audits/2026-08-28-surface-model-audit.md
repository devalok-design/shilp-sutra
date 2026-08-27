# Surface-model audit — 2026-08-28

**Question asked:** is the surface system properly applied across the DS?
**Answer: no.** 205 `.tsx` files scanned across `ui/`, `composed/`, `shell/`, `ai/`.
Roughly 60 sites fail, and they cluster into **four root causes plus four flat
bugs** — not sixty independent mistakes.

Every ratio below is computed (OKLab → sRGB, translucent tokens composited onto
their real ground), not estimated. Reference values:

| token | light | dark |
|---|---|---|
| `surface-base` | `#ffffff` | `#0a0a0a` |
| `surface-panel` / `-overlay` | `#ffffff` | `#181818` |
| `surface-panel-hover` | `#f5f5f5` | `#262626` |
| `surface-panel-active` | `#e8e8e8` | `#343434` |
| `surface-sunken` | `#eeeeee` | `#0a0a0a` |

---

## R1 — `base` == `panel` == `overlay` in light, so structural differentiators are no-ops

CLAUDE.md documents this trap for *interaction states*. It bites *structural*
differentiators exactly as hard, and the ESLint rule cannot see the
JS-conditional or lookup-map forms.

| site | what it is | light | dark |
|---|---|---|---|
| `ui/table.tsx:49` | `striped` zebra rows | **1.00:1 — does not stripe** | 1.11:1 |
| `ui/progress.tsx:32` | the track/groove | **1.00:1 — no groove** | 1.00:1 on panel |
| `composed/schedule-view.tsx:78` | `neutral` event tone | **1.00:1** | **1.00:1** |
| `ui/rich-text-editor.tsx:58,59` | `code`/`pre` inside a panel box | **1.00:1** | **1.00:1** |
| `ui/data-table-context.tsx:101,107` | pinned column | 1.00:1 | 1.11:1 inverted |
| `ui/data-table-body.tsx:176,192` | expanded-row "recess" | **1.00:1** | 1.11:1 |
| `ui/table.tsx:89` | `TableFooter` | 1.00:1 | 1.11:1 |
| `ui/textarea.tsx:22`, `ui/input.tsx:23` | `read-only` fill | 1.00:1 on a card | 1.00:1 on a card |
| `composed/content-card.tsx:13` | `default` variant | **1.00:1, no border, no shadow** | 1.00:1 nested |
| `ai/conversation.tsx:114,122` | message bubbles | **1.00:1** | 1.00:1 on a panel |
| `ui/surface.tsx:19` | `flat`, `bordered` defaults false | **1.00:1** | 1.00:1 on a card |
| `ui/sidebar.tsx:411` | `SidebarInput` + `shadow-none` | **1.00:1** | 1.11:1 |
| `ui/stepper.tsx:162`, `composed/notification-center.tsx:381` | pending marker, empty-state circle | 1.00:1 | 1.00:1 on a card |

Plus the whole **`RichChatInput` composer family**: the composer is painted
`bg-surface-panel-hover`, and its children paint their *hover and toggled*
states with that same token — `chat-toolbar.tsx:80`, `rich-chat-input.tsx:882,898`,
`reply-banner.tsx:45`, `audio-player.tsx:169`. **1.00:1 in both themes.** Bold-is-on
is signalled only by text colour. `audio-player.tsx:169` is the sharpest: visible
at rest, *vanishes on hover*.

Two places prove the DS knows better and diverged from itself:
- `data-table-header.tsx:33` has a comment choosing `surface-panel` for exactly this reason — then `getPinnedCellStyle` 60 lines away does the forbidden thing.
- `markdown-viewer.tsx:99,200` uses `surface-sunken` for code blocks (1.16:1 / 1.11:1) while `rich-text-editor.tsx` uses `surface-panel` (1.00:1). Same job, same directory.

---

## R2 — `shadow-raised*` never got the dark-mode ring fix

`--shadow-edge-ring` is deliberately flipped in `.dark` to `oklch(1 0 0 / 0.12)`,
a **white** ring, with the comment: *"Dark: a light ring, since drop shadows
barely read on dark."*

`--shadow-md-internal` and `--shadow-lg-internal` lead with it. Those are
`shadow-floating` and `shadow-overlay` — so **every overlay (Popover, Select,
Sheet, Tooltip, Toast, DropdownMenu, nav-menu) is fine in dark**, ~1.41:1 ring on
a panel.

`--shadow-xs-internal` and `--shadow-sm-internal` hardcode their own
`oklch(var(--shadow-color) / …)` ring and never reference the var. Those are
`shadow-raised` and `shadow-raised-hover`. In dark that ring is near-black:
**1.00–1.03:1.** The fix was applied to half the family.

`--shadow-segment` (ring-less by design) and `--shadow-kbd` (no
`--shadow-strength` at all, 1.02:1 in dark) have the same gap.

Consequences where the shadow is the *only* edge:

| site | light | dark |
|---|---|---|
| `ui/sidebar.tsx:319` `variant="floating"` | fill 1.00:1, ring 1.08:1 | **fill 1.00:1, ring 1.00:1 — no boundary at all** |
| `ui/card.tsx:37` `elevated` | ring 1.08:1 | **1.01:1 — less visible than `default`** |
| `ui/autocomplete.tsx:260` | the only popover not using `shadow-floating` | 1.01:1 on a card |
| `ui/menubar.tsx:73` | 1.08:1 | 1.01:1, 1.00:1 fill on a card |
| `command-palette` / `command-bar` kbd caps ×9 | 1.25:1 | 1.02:1 |

---

## R3 — every `*-2` and `*-1` step sits BELOW `surface-panel` in dark

Dark `surface-panel` is L 0.207. `accent-2` is L 0.17, `accent-1` L 0.11. But
`panel-hover` is L 0.267. So a selection painted with step 1–2 goes **darker**
while hover goes **lighter** — the selected item reads weaker than a merely
hovered one, in the opposite direction.

| site | selected | hovered |
|---|---|---|
| `ui/sidebar.tsx:578` active nav item | **1.03:1** | 1.30:1 |
| `composed/master-detail.tsx:218` | **1.03:1** | 1.30:1 |
| `composed/multi-select-popover.tsx:217` | 1.08:1 darker | 1.17:1 lighter |
| `composed/notification-center.tsx:179` unread | **1.03:1 in light** | 1.15:1 darker |
| `ui/combobox.tsx:544` highlight | 1.10:1 | — (no ring, no text change) |
| `ui/autocomplete.tsx:280` highlight | 1.25:1 | **1.04:1 dark** |
| `ui/toggle.tsx:29` pressed (neutral) | **1.00:1 vs hover — identical token** | — |
| `composed/schedule-view.tsx:261,73` | 1.08:1 darker | — |
| `ui/stat-card.tsx:403`, `ai/blocks/block-shell.tsx:34` | 1.06–1.08:1 darker | — |
| `composed/diff.tsx:321,329` add/remove rows | 1.22–1.24:1 | **1.04–1.06:1** |

Related, and separately nasty: **`tree-view/tree-item.tsx:134,137` — hover
erases selection.** `hover:bg-surface-panel-hover` is specificity (0,2,0); the
JS-conditional `isSelected && 'bg-accent-3'` compiles to (0,1,0). Hover wins
unconditionally. `table.tsx:111` solves this with `data-[state=selected]:hover:…`;
tree-view has no equivalent.

**Eight list surfaces where keyboard-selected and mouse-hovered are the same
token** (Δ 0.00), so you cannot tell what Enter will pick: `command-palette.tsx:443`,
`command-bar.tsx:675`, `emoji-picker.tsx:114`, `multi-select-popover.tsx:215`,
`slash-command.tsx:123`, `emoji-suggestion.tsx:64`, `mention-suggestion.tsx:54`,
`rich-text-editor.tsx:96`.

---

## R4 — components that opted out of the tiers entirely

`ui/segmented-control.tsx` paints with bespoke `--color-segment-track` /
`--color-segment-thumb`, so it never gets the light↔dark neutral swap.

| ground | light | dark |
|---|---|---|
| on a panel | 1.081:1, thumb lighter ✓ | **1.028:1, thumb DARKER** |
| on a card | — | **1.03:1, inverted** |

`ui/tabs.tsx:279` reproduces it with different tokens: pill `bg-surface-overlay`
on `bg-segment-track` — **1.04:1 in dark, pill darker than its own track.**
Its fallback is `shadow-raised`, which is R2, so it fails too.

Candidate fixes (measured), dark on a panel:

```
D  track = black 35% over panel (#0f0f0f), thumb = neutral-4 (#343434)  → 1.548:1
E  track = neutral-1 (#0a0a0a),            thumb = neutral-4 (#343434)  → 1.598:1
A  thumb = neutral-4 only, track unchanged                              → 1.197:1  still weak
```

---

## Flat bugs

**B1 — `border-card` and `border-card-strong` are the same colour.**
`--color-surface-border-card: var(--color-surface-border)` at `semantic.css:198`
*and* `:664`, which is exactly what `border-card-strong` uses. Both compute
`#e8e8e8` (1.22:1) light, `#2f2f2f` (1.33:1) dark. The comment above it claims
"one step up from the faint `border-card` mix." ~13 call sites reached for a
heavier edge and got the same hairline.

**B2 — `ui/sidebar.tsx:311` renders a near-white rule down the app.**
`group-data-[side=left]:border-r` with no border-colour utility anywhere in that
`cn()`. TW4 preflight is `border: 0 solid`, leaving border-color at
`currentColor`; the sidebar root sets `text-surface-fg`. Result:

| | rendered | intended (`surface-border`) |
|---|---|---|
| light | **12.69:1** | 1.23:1 |
| dark | **15.44:1** | 1.47:1 |

Verified as the **only** bare-border site in 205 files.

**B3 — `utilities.css:337` states the border tiers backwards.**
> *"Card edge … (NOT interactive controls, which use `border-surface-border/-strong` for WCAG 1.4.11 contrast)"*

That is inverted. `surface-border*` is the **decorative** family;
`surface-border-interactive*` is the **control** family that carries 1.4.11. The
comment instructs the opposite, and ~19 controls across `composed/` and `ui/`
followed it — leaving ~1.1–1.3 of available contrast unused
(`border-strong` 1.38/1.63 vs `interactive-strong` 2.67/2.69).

Six of those pair it with a **no-op interaction state** — `hover:`/`focus-within:`
resolving to the same colour as the resting border, Δ 0.00:
`date-picker.tsx:133/134`, `date-range-picker.tsx:207/208`,
`date-time-picker.tsx:209,219/220`, `time-picker.tsx:183/184`,
`file-attachment.tsx:22`, `rich-text-editor.tsx:871/872`.

**B4 — `docs/deviations.md` `SURFACE-BASE-GROUND` is stale and probably resolved.**
It records the light canvas as `neutral-2` / `#f5f5f5` and off-brand.
`semantic.css:169` now maps `--color-surface-base` to `neutral-0` = `#ffffff`,
which *is* an approved Setu ground. Per the register's own rule, a fixed
deviation is **deleted**, not edited.

---

## Cutout rings that hardcode a ground they don't control

`ring-surface-base` / `ring-surface-panel` work by *matching* the ground, so they
break when the component is placed on a different tier. In light they're right by
coincidence (`base == panel`).

- `composed/activity-feed.tsx:154,242` — `ring-surface-base` on a card in dark = **1.11:1 black donut** around every status dot.
- `ui/avatar.tsx:180,222,231`, `badge-indicator.tsx:67`, `dot.tsx:142` — `ring-surface-panel` on a page in dark = 1.11:1 grey halo.

`avatar-group.tsx:49-54` solves this correctly by exposing `borderColor` as a prop.

---

## Clean

- **Zero** deprecated `bg|text|border|ring-surface-1..4` or `surface-chrome` in all 205 files.
- Overlay separation is correct and consistent in both themes (see R2).
- Control borders on `radio`, `select`, `number-input`, `textarea`, `toggle`, `split-button`, `button`, `input` use `surface-border-interactive` — the right tier.
- `AppShell` inset arrangements measure symmetrically (1.16:1 light / 1.11:1 dark).

## Corrections made during the audit

One subagent reported that `shadow-floating`/`shadow-overlay` "carry no ring
layer at all" and filed ~15 sites as edgeless overlays. That is **wrong** — both
resolve through `--shadow-edge-ring`, which *is* dark-corrected. Those findings
were discarded. Verified by reading `semantic.css:471-472` and `:557-566`.

A bare-border scan initially flagged 22 sites; 21 set their colour in a sibling
string of the same `cn()`. Only `sidebar.tsx:311` is real.

## Not verified independently

Passed through from subagent measurement without my own recomputation: the
per-site ratios in R3 other than the segmented control, the `diff.tsx` numbers,
and the composer-family containment analysis.
