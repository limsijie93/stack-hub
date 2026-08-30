# 0006 — supersession: stack-hub is authoritative, and the gate that replaced

Date: 2026-08-30. Reverses decision #10 of the original design.

## What changed

The original plan chose **"coexist in lab, replace at core"**: keep the upstream plugin
installed while a stack-hub skill is in lab, run both on real work, and uninstall the upstream
at promotion. Promotion was defined as *"a deletion you can defend"*.

That is now reversed. **Where stack-hub ships a skill covering a concept, that skill is the
current version.** No coexistence, no A/B.

## Why the A/B could not have worked

The reasoning that produced #10 sounded good and was wrong in a specific way: two skills
describing the same job **compete for the same trigger**, and Claude Code resolves that on
description phrasing, not on quality.

So the "comparison" would not have compared anything. Whichever description happened to match
the user's wording would fire, the other would stay silent, and the outcome would be read as
evidence about the skills. It is a coin toss whose result you cannot see — worse than no
experiment, because it produces a number.

The `grilling` collision flagged in 0005 was the first concrete instance, and noticing it is
what surfaced the flaw in the general rule rather than just that case.

## The gate that replaced criterion 4

The old gate's criterion 4 — *"you are willing to uninstall the upstream plugin it
supersedes"* — was explicitly called "the real gate" in two documents. Making supersession
immediate makes it vacuous: the upstream is already gone before the skill has been used once.

Replaced with: **it auto-routed at least once without you naming it.**

This is the right replacement because once the upstream is uninstalled, the remaining open
question is whether the **description works**. A skill that only ever fires when invoked
explicitly has a description problem rather than a content problem, and the fix is to tune the
description, not to promote it. `reflect` names this diagnosis directly: *"the skill exists but
did not trigger"* is its own category of defect, distinct from the skill being wrong.

It is also falsifiable in the way the old criterion was, which is the property worth
preserving: either you watched it fire on its own, or you did not.

## Supersession is data, not memory

A new optional `supersedes:` frontmatter field, `<installed-plugin>:<skill>`:

```yaml
supersedes:
  - mattpocock-skills:grilling
  - mattpocock-skills:grill-me
  - mattpocock-skills:grill-with-docs
```

`scripts/validate.mjs` checks the format, because a malformed entry silently supersedes
nothing and leaves a competing skill installed — precisely the outcome the field exists to
prevent. Verified: a bad entry fails the build.

**Declared only where the stack-hub skill does the whole job.** Drawing one rule from an
upstream is not supersession — `evidence-discipline` takes the red-capable-loop rule from
`diagnosing-bugs` and declares nothing, because the six-phase diagnosis loop is untouched and
that skill remains useful.

Current supersessions, all against the only installed upstream:

| stack-hub skill | supersedes |
|---|---|
| `grilling` | `mattpocock-skills:` `grilling`, `grill-me`, `grill-with-docs` |
| `tdd` | `mattpocock-skills:tdd` |
| `resolving-merge-conflicts` | `mattpocock-skills:resolving-merge-conflicts` |
| `session-continuity` | `mattpocock-skills:handoff` |

pstack is not installed as a plugin (it is a Cursor plugin), so nothing supersedes it.

## A parser bug this surfaced

`- mattpocock-skills:grilling` parsed as the **map** `{mattpocock-skills: grilling}` rather
than the string. In real YAML a colon opens a mapping only when followed by whitespace or end
of line, so `- a:b` is the scalar `"a:b"`. `yaml-lite`'s list parser accepted any colon.

Fixed to require `:(\s|$)`, which is spec-correct and would have mis-parsed any future
colon-bearing scalar the same way. Regression-tested against maps, plain scalars, and flow
lists; all 96 validate checks and the drift check still pass.

## Sequencing

Uninstall an upstream plugin only **after** stack-hub is installed and the covering skill is
present. Nothing is merged yet and the marketplace has not been added, so uninstalling
`mattpocock-skills` today would leave no `grilling` at all. The declarations are ready; the
uninstall waits.
