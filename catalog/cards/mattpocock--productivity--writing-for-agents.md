---
id: mattpocock/productivity/writing-for-agents
src: raw_source/mattpocock/productivity/writing-for-agents/SKILL.md
sha: a37608daf6e835e767deecfb498facecaaba82ba
status: active
mechanism: a reference for authoring any agent-consumed document: what to inline, what to disclose behind a pointer, and how wording changes behaviour
human_in_loop: false
subject: skill
cost: low
landmines: ["sidecar references SKILL-MECHANICS.md"]
concepts: [skill-authoring]
---

The best skill-authoring reference in either stack, and the one most worth mining. **Context pointers**: a skill description and an AGENTS.md line naming a doc are the same object - a reference that encodes the condition for reaching material. The pointer's *wording*, not its target, decides when and how reliably the agent reaches it, so a must-have target behind a weak pointer is a variance bug; sharpen the wording before inlining.

**The two loads**: context load is what always-loaded material costs the agent's window every turn; cognitive load is what it costs the human deciding which document to reach for. Cognitive load is explicitly *not* to be minimised - it is the price of human agency, spent where judgement matters.

**The information hierarchy** ranks material by how immediately it is needed - in-file step, in-file reference, disclosed reference - and progressive disclosure is the move down it, with branching as the cleanest test: inline what every branch needs, disclose what only some reach. **Completion criteria** have two properties, clarity (can the agent tell done from not-done?) and demand (how much it requires), with premature completion as the failure and the fix being to sharpen the bound before hiding later steps.

**Leading words** are compact concepts already in pretraining - tight, red, tracer bullet, fog of war - repeated as a token, never as a sentence, so they recruit priors for free; coining your own costs definition tokens a pretrained word gives away. **Negation** is the failure mode beside it: prohibition drags the forbidden behaviour into context and makes it more available, so prompt the positive. And the pruning discipline: single source of truth, the environment is a source of truth too so a document restating it is a cache, hunt no-ops sentence by sentence with the model-relative test of whether the line changes behaviour versus the default, and delete whole sentences rather than trimming words.
