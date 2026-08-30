---
id: pstack/principle-model-the-domain
src: raw_source/pstack/principle-model-the-domain/SKILL.md
sha: b2f6449498505a866592493ff3f3a10cfdd8ce5c
status: active
mechanism: encode the real domain in a data structure instead of scattering it across conditionals
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle, design-vocabulary, type-discipline]
---

Scattered booleans, repeated shape assumptions and branching spread across files are accidental complexity; a structure matching the domain makes invalid states unrepresentable and *deletes branches*. The timing argument is good: choosing the structure at write time is cheap, recovering it later reads as a refactor and gets deferred.

It lists the usual candidates - state machine over scattered booleans, typed object over loose parameters, registry or discriminated union over branching, reducer over ad hoc mutation - but the two best entries are the unusual ones. **A module organised around one body of domain knowledge rather than a sequence such as load, validate, transform, save**, because execution order is not ownership. And an explicit escape hatch: when none of the listed structures fits, work out what the code must never allow and how the data gets read, then find the structure that encodes exactly that.

The restraint is equally good - do not force an abstraction, prefer boring code if the shape is already clear and local, and be sceptical of abstraction that adds indirection without removing branches, duplicated rules, invalid states or lifecycle risk. **The tell that you skipped this**: a new feature grows an if/else chain by one more branch, or a second boolean must stay in sync with the first.
