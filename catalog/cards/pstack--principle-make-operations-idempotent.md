---
id: pstack/principle-make-operations-idempotent
src: raw_source/pstack/principle-make-operations-idempotent/SKILL.md
sha: a0834247ca99b09c11441747717a8034d4c22d7c
status: active
mechanism: design state-mutating operations to converge regardless of how often they run or where they start
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle]
---

Every state-mutating operation should answer two questions: what happens if this runs twice, and what happens if the previous run crashed halfway. The justification is operational - commands and lifecycle operations run where crashes, restarts and retries are normal, so if partial state changes the next run's outcome, **every restart becomes a debugging session**.

The patterns are concrete: convergent startup that scans for existing state, cleans stale artifacts and adopts live sessions; content-based cleanup comparing by content equivalence rather than creation order; self-healing locks with stale-lock detection; scheduling where failed work respawns cleanly.

The test is a three-question checklist ending in a single decision rule: if any answer is 'it depends on what state was left behind', the operation needs a reconciliation step. That is a crisp, mechanical trigger rather than a judgement call.
