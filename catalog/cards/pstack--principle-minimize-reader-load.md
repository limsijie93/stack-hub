---
id: pstack/principle-minimize-reader-load
src: raw_source/pstack/principle-minimize-reader-load/SKILL.md
sha: 1c5e18c332438ccd5e47f108ec28872e85e82501
status: active
mechanism: track two independent axes - layers to trace and state to hold - and guard both
human_in_loop: false
subject: codebase
cost: low
landmines: ["cross-references a sibling principle by relative path"]
concepts: [principle, design-vocabulary]
---

Maintainability defined as the work a reader must do, measured on two axes: **layers to trace** (indirections between question and answer) and **state to hold** (hidden or mutable context kept in the head). The insistence that these are *independent* is the insight - a flat file with 50 globals can be as hard to reason about as a six-layer adapter stack, so optimising one while ignoring the other achieves nothing. LOC and cyclomatic complexity are named as mere proxies.

Practical moves: collapse layers that do not earn their keep - wrappers with one caller, adapters with no second implementation, indirection for a future that never came. **Make adjacent layers change the abstraction**; a layer repeating the same methods and arguments adds reader load without compression. Shrink state scope in an explicit order - pure functions over mutations, locals over fields, fields over module state, module state over globals - and derive instead of sync.

The gate before adding anything: does this reduce reader load somewhere else by at least as much? And the test: can a new reader answer 'where does X come from' and 'what can change X' in under 30 seconds?
