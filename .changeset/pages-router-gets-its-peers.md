---
"@devalok/shilp-sutra": patch
---

Fix the Next.js Pages Router recipe, which told you not to install TipTap

`install-next-pages.md` carried no §2a peer table. Instead of listing peers it
pointed at the App Router recipe and summarised — and the summary said the
"rich-text editors bundle their deps — no install needed". That stopped being
true in 0.56.0, when TipTap was externalized precisely because bundling it while
also declaring it a peer gave consumers two copies of ProseMirror.

So a Pages Router consumer following our own recipe was told the opposite of
what they needed, and then hit `Module not found: Can't resolve '@tiptap/core'`
with no instruction anywhere in their recipe.

The recipe now carries the full generated table, same as the other five.

**Why the gate missed it.** `derive-peer-map --check` skipped any recipe with no
§2a table (`if (hi < 0) continue`) and then *unioned* the tables it did find, so
a peer documented in five recipes counted as documented everywhere. A recipe
that documented nothing at all was invisible twice over. Presence is now checked
per file, before the union, and a recipe without a table fails the gate.

The union itself stays — it is right that one recipe's omission is not reported
against all six. What was wrong was treating absence as agreement.

Cross-referencing another recipe is no longer acceptable for this section:
nothing verifies the far end of a link, which is exactly how this rotted.
