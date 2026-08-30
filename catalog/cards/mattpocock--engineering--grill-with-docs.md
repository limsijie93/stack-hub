---
id: mattpocock/engineering/grill-with-docs
src: raw_source/mattpocock/engineering/grill-with-docs/SKILL.md
sha: 62b9efb6f991d1b229adee7506962f13ced0c499
status: active
mechanism: trampoline; calls grilling and domain-modeling together
human_in_loop: true
subject: plan
cost: low
landmines: ["two-line trampoline, no content of its own"]
concepts: [structured-interrogation]
---

A two-line trampoline that calls `grilling` and `domain-modeling` in sequence, so the interview also lays down ADRs and a glossary as it goes.

The idea worth stealing is composition-by-trampoline: a tiny named skill whose only job is to invoke two others in a fixed order. That is the cheapest possible playbook, and it is a useful precedent for how thin a composed skill is allowed to be.
