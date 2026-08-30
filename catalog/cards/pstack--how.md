---
id: pstack/how
src: raw_source/pstack/how/SKILL.md
sha: c156b76aefd1b6ca11c3c4685b5efc38391a97c6
status: active
mechanism: scale exploration to question complexity - single pass for simple, parallel explorers plus a synthesiser for complex - then optionally spawn multi-model architectural critics
human_in_loop: false
subject: codebase
cost: medium
landmines: ["hardcoded model slugs and configured how-explorer/how-critics lists", "subagent_type: generalPurpose and readonly flags", "sidecar references explorer-prompt, explainer-prompt, critic-prompt, critique-rubric"]
concepts: [codebase-explanation, fan-out-review]
---

Answers 'how does X work' at the level of a senior engineer onboarding onto a subsystem - a working mental model, explicitly not annotated source code.

The best idea is **assess complexity before choosing the approach**, with a stated bias: simple questions skip the explorer agents entirely and run one pass, complex ones decompose into 2-4 parallel exploration angles that are distinct slices so explorers do not duplicate work, and 'when in doubt, lean simple - you can always spawn explorers if the explainer hits a wall'. Very few fan-out skills in either stack bother to say when *not* to fan out.

Other transferable pieces: if the scope is ambiguous, state your best-guess interpretation and proceed rather than asking, letting the user redirect. Explorers must read actual code rather than guessing from file names, and stop only when they can describe the full path from input to output without hand-waving any step. The output format is a fixed five-part shape - Overview, Key Concepts, How It Works, Where Things Live, Gotchas - where Gotchas explicitly captures historical context explaining why something looks weird. In critique mode, the explanation must come first and stand on its own, so someone who only wants to understand the system does not have to wade through criticism.
