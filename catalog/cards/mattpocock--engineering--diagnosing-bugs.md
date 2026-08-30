---
id: mattpocock/engineering/diagnosing-bugs
src: raw_source/mattpocock/engineering/diagnosing-bugs/SKILL.md
sha: 061c25a524acaa93d4534e9e08a793c0a5fe45fd
status: active
mechanism: six phases gated on building a tight, red-capable feedback loop before any hypothesis is allowed
human_in_loop: true
subject: codebase
cost: medium
landmines: ["references scripts/hitl-loop.template.sh, a .sh sidecar not vendored", "assumes CONTEXT.md and docs/adr conventions"]
concepts: [debugging, evidence-discipline]
---

A debugging discipline whose whole weight sits on Phase 1: build a pass/fail signal that goes red on *this* bug. The skill states plainly that everything after it is mechanical, and forbids proceeding to hypotheses without a named command that has already been run at least once and is red-capable, deterministic, fast and agent-runnable. 'If you catch yourself reading code to build a theory before this command exists, stop.'

Strong specifics worth stealing: ten ranked ways to construct a loop, from failing test through replayed trace, throwaway harness, property/fuzz loop and bisection harness down to a human-in-the-loop bash script as last resort. Treating the loop as a product to be tightened - faster, sharper signal, more deterministic - with the observation that a 30-second flaky loop is barely better than none while a 2-second deterministic one is a superpower. For non-deterministic bugs the goal is explicitly a *higher reproduction rate*, not a clean repro. And tagging every debug log with a unique prefix like [DEBUG-a4f2] so cleanup is one grep. Also good: if no correct seam exists for the regression test, that absence is itself the finding, not a reason to write a shallow test that gives false confidence.
