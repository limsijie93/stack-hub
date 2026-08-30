---
id: pstack/principle-redesign-from-first-principles
src: raw_source/pstack/principle-redesign-from-first-principles/SKILL.md
sha: 6a8cf256d69d0d5f2ce4b57795f2794c41c8e5a0
status: active
mechanism: integrate a change by redesigning as if the requirement had been there from day one
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle, design-vocabulary]
---

Do not bolt a new requirement onto the existing design. Read all affected files and understand the current design holistically, then ask what you would build if writing from scratch *with* this requirement, and propagate the change through every reference - types, docs, examples, rationale sections.

The operative line is the target state: the result should look like what would have been built if the requirement had been known on day one. That is a checkable bar, unlike 'refactor thoughtfully'.

The closing rule prevents it becoming an excuse for a rewrite: **think about the redesign holistically, then deliver it incrementally.** Holistic thinking, incremental delivery - which is exactly how it composes with sequence-verifiable-units rather than fighting it.
