---
id: pstack/principle-sequence-verifiable-units
src: raw_source/pstack/principle-sequence-verifiable-units/SKILL.md
sha: 737480800564d634347afdcef25dd48851e9f2eb
status: active
mechanism: order work as small units each ending in a check, and stack the delivery so the sequence proves itself
human_in_loop: false
subject: plan
cost: low
landmines: ["cross-references sibling principle skills by name"]
concepts: [principle, evidence-discipline, work-decomposition]
---

Runs at two altitudes, which is what makes it more than a testing rule.

**Execution.** In a sweep or migration, verify each change before starting the next, never batching edits and verifying once at the end. Each unit is a before/after bracket: known-good state, one change, run the check, proceed. Rebase onto clean trunk first so every check measures against the real baseline. And when a lever does the edits, the per-unit check is nearly free, so run it anyway.

**Delivery.** Stack commits and PRs in the order that proves the work. The canonical shape is the failing test first, then the fix on top, so a reviewer watches it go red then green. Other orders: a subtraction before the reshape, a baseline capture before the treatment, the scaffold before the feature. Each commit lands on its own and **the sequence reads as an argument**.

The why is well put: a break caught at the unit that caused it is cheap to localise; caught after a batch it is buried and you have already built on a broken base. Turning 'trust me' into 'watch it go red, then green' is the same move build-the-lever makes for tooling.
