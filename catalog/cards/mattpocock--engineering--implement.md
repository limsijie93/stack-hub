---
id: mattpocock/engineering/implement
src: raw_source/mattpocock/engineering/implement/SKILL.md
sha: 7a0b11f5f4fe9505ea5c7983c3083ba1bf754f69
status: active
mechanism: trampoline; chains tdd, then typecheck and test loops, then code-review, then commit
human_in_loop: false
subject: codebase
cost: low
landmines: ["invokes /tdd and /code-review by slash name", "commits to the current branch unconditionally"]
concepts: [playbook]
---

A seven-line playbook: implement from the spec or tickets, use TDD at pre-agreed seams, typecheck and run single test files regularly with the full suite once at the end, then run code review, then commit.

The value is as a precedent for how thin a legitimate playbook can be - it holds no technique of its own, only ordering and cadence. Worth noting as the clearest example in either stack of a skill whose entire content is sequencing. The unconditional commit at the end is the one thing not to copy.
