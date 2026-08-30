---
id: pstack/principle-subtract-before-you-add
src: raw_source/pstack/principle-subtract-before-you-add/SKILL.md
sha: 1666d2617dbc9cf107ecb52aac30b6ffbcc1159b
status: active
mechanism: remove complexity first so the next addition lands on a simpler base
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle]
---

Adding to a complex system compounds complexity. Removing first cuts surface area, reveals the essential structure, and usually makes the next design obvious. Sequence removal before construction; cut before you polish.

The most useful specific: **out-of-spec features drag validators behind them.** Persistence, retry-on-startup and schema migration each need guards to defend their inputs, so a speculative feature costs more than itself - it imports a defensive perimeter. That is a concrete mechanism for why speculative generality is expensive, rather than an aesthetic objection.

Other rules: design for observed usage rather than speculative edge cases, no validators or parsers beyond what the spec demands, and when a reference has no novel content delete it rather than leaving a stub. The standing instruction - leave the design slightly simpler and more capable behind the same or smaller surface than you found it - is a better formulation of the boy-scout rule because it names the surface as the thing that must not grow.
