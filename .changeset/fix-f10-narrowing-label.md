---
"@devalok/shilp-sutra": patch
---

docs: correct the F-10 Icon API "non-breaking" label — it is a narrowing for `React.ReactNode` props

The 0.40.0 changelog + `MIGRATION.md` described F-10 (Icon API unification) as **"Non-breaking. Type widening only. Every call site that compiled before keeps compiling."** That is wrong for the 14 components whose `icon` prop was previously `React.ReactNode`.

`IconInput` is `React.ReactElement | React.ComponentType<{ className?; size? }> | null | undefined` — it **excludes** `string`, `number`, and iterables that `React.ReactNode` allows. So for any component that was on `ReactNode`, 0.40.0 is a type **narrowing**, not a widening. A consumer who stores icons in a `Record<string, React.ReactNode>` map or a `icon?: React.ReactNode` field and passes them to `CommandItem.icon`, `ActivityItem.icon`, or `Chat.Message.Avatar` fails `tsc` on 0.40.0 even though the runtime JSX is valid.

Reported by the karm-v2 consumer agent (devalok-design/shilp-sutra#61) — 3 call sites broke. Build-time only, no runtime impact, trivial fix (retype the icon source to `React.ReactElement`), but the "non-breaking" label let an initial low-risk assessment form before the break was discovered.

This patch corrects the wording in `MIGRATION.md → v0.40.0` and `llms.txt` to "mostly non-breaking, one narrowing" with the exact retype fix and affected props. No code change.
