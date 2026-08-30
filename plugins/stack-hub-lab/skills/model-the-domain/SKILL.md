---
name: model-the-domain
description: Encode the domain in a data structure instead of scattering it across conditionals. Use when writing stateful logic, when code branches a lot or repeats a shape assumption, when adding one more case to an if/else chain, or when two booleans must be kept in sync. Also for "should this be a state machine", "how should I model this", or reviewing code that keeps growing branches.
maturity: lab
upstream:
  - src: pstack/principle-model-the-domain@b2f6449498505a866592493ff3f3a10cfdd8ce5c
    took: the whole rule, substantially verbatim - the structure list, the do-not-force-it restraint, the tells
    changed: description rewritten around the moments it should fire rather than a topic label; added an explicit "when this does not apply" section; promoted the tells to their own section since they are the checkable part; dropped the sibling principle cross-reference
    rejected: nothing
---

# Model the domain

Encode the real domain in a data structure instead of scattering it across conditionals.

Scattered booleans, repeated shape assumptions and branching spread across files are
accidental complexity. A structure that matches the domain makes invalid states
unrepresentable and **deletes branches**. Choosing it at write time is cheap; recovering it
later reads as a refactor and gets deferred indefinitely.

## Reach for structures like these

- A **state machine** instead of scattered booleans, phases, or lifecycle checks.
- A **typed object** instead of loose parameters or repeated shape assumptions.
- A **map, registry, lookup table, or discriminated union** instead of branching spread
  across files.
- A **reducer or command/event model** instead of ad hoc state mutations.
- A module organised around **one body of domain knowledge**, rather than a sequence such as
  load → validate → transform → save. *Execution order is not ownership.*
- A small **module boundary** that gathers repeated behaviour, ownership, or invariants.
- A **queue, cache, index, graph, or normalised collection** where the access pattern calls
  for it.

When none of these fits, work out what the code must never allow and how the data actually
gets read, then find the structure that encodes exactly that. The list covers common cases,
not all of them.

## The tells that you skipped this

These are checkable, which is what makes them worth more than the advice:

- A new feature grows an existing `if`/`else` chain by one more branch.
- A second boolean appears that must stay in sync with the first.
- **Temporal decomposition** — modules named for phases, repeating the same domain rules at
  each step.
- You can write a comment explaining which combinations of fields are valid.

## When this does not apply

Do not force an abstraction:

- The current shape is already clear, local, and unlikely to grow. Prefer boring code.
- The abstraction would add indirection **without** removing branches, duplicated rules,
  invalid states, or lifecycle risk. That trade is a loss.
- The data is genuinely irregular. Complexity in the data is not complexity in the design,
  and a structure that fights the data is worse than conditionals that match it.

Three similar statements still beat a premature abstraction.
