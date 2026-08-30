---
id: pstack/principle-foundational-thinking
src: raw_source/pstack/principle-foundational-thinking/SKILL.md
sha: 3fcc57b3a54dea965e245dad966cab423f768b11
status: active
mechanism: get the data shape right before writing logic, and do first whatever every later phase benefits from
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle, design-vocabulary]
---

Splits decisions into two kinds: **structural decisions protect option value, code-level decisions protect simplicity**, with over-engineering reframed as a premature decision that closes doors.

**Data structures first.** Get the shape right before the logic, because the right shape makes downstream code obvious. The economic argument is the memorable bit: a data-structure change late is a rewrite; early, it is often a one-line diff.

**Scaffold first**, with a usable test: 'does every subsequent phase benefit from this existing?' CI, linting, test infrastructure and shared types qualify. Sequence for option value - setup before features, tests before fixes.

At code level it pushes back on over-abstraction: DRY the structure, not every line; three similar statements still beat a premature abstraction; test behaviour and edge cases, not line counts. And it orders itself against its neighbour - subtraction comes before scaffolding, so remove dead weight first, then lay foundations.
