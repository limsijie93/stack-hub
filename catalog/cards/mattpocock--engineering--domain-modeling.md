---
id: mattpocock/engineering/domain-modeling
src: raw_source/mattpocock/engineering/domain-modeling/SKILL.md
sha: 9b97707e19ef1f590aada356f2b3f6bb881f91be
status: active
mechanism: actively challenge terminology during a session and write the glossary and decisions down the moment they crystallise
human_in_loop: true
subject: idea
cost: low
landmines: ["sidecar references CONTEXT-FORMAT.md and ADR-FORMAT.md", "assumes CONTEXT.md / CONTEXT-MAP.md / docs/adr layout"]
concepts: [design-vocabulary, learning-capture]
---

Builds a project's domain model as a side effect of designing: challenge terms that conflict with the existing glossary, sharpen vague words into canonical ones, invent edge-case scenarios to force precision about boundaries, and cross-check claims against what the code actually does.

Three things worth stealing. Capture inline rather than batching - update the glossary the moment a term resolves, because batched capture never happens. Create files lazily, only when there is something to write. And a genuinely useful three-part gate for whether a decision deserves an ADR: it must be hard to reverse, surprising without context, *and* the result of a real trade-off with genuine alternatives. If any of the three is missing, skip it. That gate is the best defence against ADR directories full of noise. The skill is also strict that the glossary is a glossary and nothing else - no implementation details, not a spec, not a scratchpad.
