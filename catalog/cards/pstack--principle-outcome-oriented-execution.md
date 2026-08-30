---
id: pstack/principle-outcome-oriented-execution
src: raw_source/pstack/principle-outcome-oriented-execution/SKILL.md
sha: 4c2ed4695b4ca15ea5a98468c13bfe5de97f16df
status: active
mechanism: optimise for the verifiable end state rather than preserving smooth intermediate states
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle]
---

Keeping every intermediate step fully stable often creates temporary compatibility code that becomes long-lived debt. So converge on the target architecture and prove correctness at explicit verification boundaries instead.

**Intermediate breakage is acceptable when it is planned, scoped and reversible** - all three qualifiers doing real work. Guardrails keep it honest: use it for planned rewrites and migrations with explicit phase boundaries, declare up front where temporary breakage is acceptable, keep high-signal checks on actively touched areas while migrating, and require full static and runtime verification at plan completion.

Worth carding as the deliberate counterweight to sequence-verifiable-units, which insists every unit ends green. The two are not contradictory but they trade against each other, and a semantic layer covering migration work has to say which applies when - the answer being whether the intermediate states are ones anyone else has to live in.
