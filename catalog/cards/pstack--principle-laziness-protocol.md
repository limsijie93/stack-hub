---
id: pstack/principle-laziness-protocol
src: raw_source/pstack/principle-laziness-protocol/SKILL.md
sha: 16bbb97426d1bbcbf957c032f0629a96a4709753
status: active
mechanism: borrow a human maintainer's fatigue as the constraint, since writing code is cheap for an agent
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle]
---

The premise is the best part: **writing code is cheap for you, which makes over-engineering easy**, so counter it by borrowing a human maintainer's fatigue. A principle explicitly designed around an agent's failure mode rather than a human's.

Concrete rules: prefer deletion, and when asked to refactor look for removals before additions. Maintain a flat call hierarchy, with a real threshold - if answering a question requires tracing more than three files or layers, flatten it - and a careful exception: a rich interface that hides substantial work is not a deep call chain. Consolidate decisions behind one source of truth and pass the result as a simple flag. Minimise the diff. **Question the threading**: if a task asks you to pass a new signal through types, schemas and pipelines, stop and look for a more direct path.

Prime directive: if a human developer would find the code exhausting to maintain, it is a bad solution.
