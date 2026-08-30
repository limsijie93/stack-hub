---
id: mattpocock/productivity/grill-me
src: raw_source/mattpocock/productivity/grill-me/SKILL.md
sha: 3947ff9c4ad980d14fc07fccbf659d47c114e81d
status: active
mechanism: trampoline; calls the grilling skill
human_in_loop: true
subject: plan
cost: low
landmines: ["two-line trampoline, no content of its own"]
concepts: [structured-interrogation]
---

A two-line trampoline whose entire body is an instruction to call the `grilling` skill. It exists to give the behaviour a user-invocable name with `disable-model-invocation: true`, so it fires only when explicitly asked for.

Nothing to steal except the pattern itself: a named, explicitly-invoked entry point separated from the skill that holds the actual content. Worth knowing about so it is not mistaken for a distinct technique during clustering.
