---
id: pstack/swarm
src: raw_source/pstack/swarm/SKILL.md
sha: b7e61ec7bc46629930582a50f12a6b9f1f28a368
status: active
mechanism: fan out N parallel cloud workers over slices or racing briefs, drain, aggregate into one report
human_in_loop: false
subject: task output
cost: high
landmines: ["reads ~/.cursor/rules/pstack-models.mdc", "environment: cloud / cloud_base_branch are Cursor-specific", "hardcoded model slugs", "subagent_type: generalPurpose"]
concepts: [fan-out-generate]
---

The generic fan-out primitive underneath arena. Frame a done predicate, choose a shape (partition into slices, race N workers on identical briefs, or mix), spawn, drain, aggregate into one report. Workers report PASS / ISSUES / BLOCKED with evidence.

Worth stealing: the selection rule - first pass, rank all, or best-of - must be declared *before* spawning, which stops the aggregation being rationalised after seeing the results. Every brief must stand alone, since a worker shares none of the parent's context. And dropouts are handled by proceeding with N-1 and noting it rather than blocking, which keeps the fan-out from being hostage to its slowest arm. Mostly a coordination pattern rather than a technique; its value here is as the shared skeleton that arena, reflect and interrogate all specialise.
