---
id: pstack/principle-type-system-discipline
src: raw_source/pstack/principle-type-system-discipline/SKILL.md
sha: 192a1255709e105cd055543b058b9e1bf66d84e1
status: active
mechanism: use the type checker as a proof assistant to define errors and special cases out of existence
human_in_loop: false
subject: codebase
cost: low
landmines: ["defers to typescript-best-practices and two sibling principles by name"]
concepts: [principle, type-discipline]
---

Language-agnostic, with syntax grounded elsewhere. The premise: prefer defining errors and special cases out of existence over proliferating handlers, since a case the types let you ignore becomes a runtime failure the compiler could have stopped.

The strongest pattern is **types are constructions, not restrictions** - build the type up from the values you want rather than carving them out of a looser type with checks. A non-empty list is a head plus a rest, not a list with a length check. A valid time range is a start plus a duration, not two timestamps you must keep ordered. The invariant that seems to need a refinement type is usually a construction away, and no representation is privileged.

Equally good is **strengthen a type only where partiality appears**, then stop. A runtime assertion or 'should never happen' throw marks where a type is too weak; push that check into the type and go no further, because the type system's job is to track the cases each use site must handle, not to describe data as precisely as possible - extra precision costs reuse and ceremony and buys no safety. `sum` of an empty list is 0 so it takes the plain list; `head` has no answer so it demands the non-empty one.

Two checkable tests close it: 'can I write a comment explaining when this combination of fields is valid?' means the type is too loose, and two arguments sharing a primitive type but meaning different things should be branded. Plus the line worth quoting: the cast you bury today is the postmortem you write next week.
