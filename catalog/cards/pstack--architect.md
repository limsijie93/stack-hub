---
id: pstack/architect
src: raw_source/pstack/architect/SKILL.md
sha: 9c5dd1b5ab5d068fbacc60ed48d6603af0c237c3
status: active
mechanism: ground in the existing system, sketch two structurally distinct designs via fan-out, synthesise, implement against the sketch, scrap it when friction repeats
human_in_loop: false
subject: codebase
cost: high
landmines: ["reads configured architect runners and hardcoded model slugs", "sidecar references runner-prompt, rationale-template, design-red-flags", "invokes how, why, arena, interrogate by skill name", "cites six pstack principle-* skills"]
concepts: [architecture-review, design-vocabulary]
---

Five phases: ground the problem by tracing the systems the new code touches, sketch designs via parallel candidates, optionally checkpoint, implement against the sketch as a contract, and scrap when the architecture is wrong.

**Design it twice** is the rule: at least two *structurally distinct* candidates before synthesis even when the first looks sufficient - whole-shape alternatives, not point fixes inside one shape. The caller's usage is written first and the type sketch derived from it, which is a good ordering discipline. Deviations during implementation are explicitly signal to surface rather than friction to absorb silently: if a function needs a parameter the sketch did not anticipate, ask whether the sketch was wrong, the requirement was missed, or the implementation is overreaching.

Best of all is Phase E's scrap criteria, which insist the signal is a **pattern, not single instances**, and then name the tells concretely: the same shape of workaround recurring across unrelated code, multiple edge cases all needing special-case branches, types needing escape hatches to compile, the 'we need a lock' reflex when the sketch said state was not shared, callers having to know the abstraction's internal rules. Plus the caution that complexity in the data is not complexity in the design, and a few hard cases do not condemn an architecture. When you do scrap: re-ground first so implementation lessons enter as inputs rather than vibes, and subtract before adding so the new sketch starts smaller than the old.
