---
id: mattpocock/engineering/codebase-design
src: raw_source/mattpocock/engineering/codebase-design/SKILL.md
sha: 3f63c8146dd2604b419c929e9876b90c30d410e9
status: active
mechanism: a fixed vocabulary for designing deep modules, plus tests for whether a seam or abstraction has earned its place
human_in_loop: false
subject: codebase
cost: low
landmines: ["sidecar references DEEPENING.md and DESIGN-IT-TWICE.md"]
concepts: [design-vocabulary]
---

A shared glossary for module design, insisting the terms are used exactly: Module, Interface, Implementation, Depth, Seam, Adapter, Leverage, Locality. It explicitly bans substitutes - not component, not service, not API, not boundary - on the grounds that consistent language is the entire point.

The sharp parts are the tests, not the glossary. **The deletion test**: imagine deleting the module; if complexity vanishes it was a pass-through, if complexity reappears across N callers it was earning its keep. **One adapter means a hypothetical seam, two means a real one** - do not introduce a seam unless something actually varies across it. **The interface is the test surface**: if you want to test past the interface, the module is the wrong shape. Also valuable is the explicit *rejected framings* section, which names Ousterhout's implementation-lines-to-interface-lines ratio and rejects it for rewarding padded implementations. Recording rejected definitions inside the vocabulary itself is a pattern worth copying.
