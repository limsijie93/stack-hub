---
id: mattpocock/productivity/handoff
src: raw_source/mattpocock/productivity/handoff/SKILL.md
sha: 2eb98a51b97bb5bac461a26ad14828eeac827909
status: active
mechanism: compact the conversation into a portable document written outside the workspace, referencing artifacts rather than restating them
human_in_loop: false
subject: session
cost: low
landmines: []
concepts: [context-handoff]
---

Writes a handoff document so a fresh agent can continue, saved to the OS temp directory rather than the workspace. Under 150 words and almost entirely constraints rather than structure.

The constraints are the value. **Do not duplicate content already captured in other artifacts** - specs, plans, ADRs, issues, commits, diffs - reference them by path or URL instead, which keeps the handoff from becoming a stale second copy of things that have their own home. **Include a suggested-skills section** naming what the next agent should invoke, so routing survives the handoff rather than being rediscovered. **Redact secrets.** And if the user said what the next session is for, tailor to that rather than summarising uniformly. Writing outside the workspace is a deliberate choice: a handoff is scaffolding, not an artifact of the project.
