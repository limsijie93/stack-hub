---
id: pstack/arena
src: raw_source/pstack/arena/SKILL.md
sha: 59a167432ba97dc349cffa379ee851b8b700c960
status: active
mechanism: fan out N candidates on the same prompt, cross-judge with a separate model, pick a base, graft the best parts of the losers in by hand, verify
human_in_loop: false
subject: task output
cost: high
landmines: ["reads ~/.cursor/rules/pstack-models.mdc", "hardcoded model slugs", "cites pstack principle-* skills by name", "assumes git worktrees or /tmp scratch paths"]
concepts: [fan-out-generate, synthesis]
---

Six phases: frame the prompt and rubric, fan out N candidates, cross-judge on a different model family, pick a base by rubric rather than feel, graft the best of the losers into it by hand, verify. Generation, not review - the fan-out produces candidate artifacts and the value comes from merging them.

The strongest ideas: the rubric is derived *before* spawning, and the candidates never see it, so the picker has a tool the candidates could not game. Grafting is done by hand rather than pasted, so the result stays coherent under one mental model. And the two degenerate outcomes are named with different remedies - if candidates converge, that is agreement and you ship the consensus with no graft; if they wildly diverge, the framing was under-specified, so reframe and re-run rather than averaging. Recording what was rejected is called out as the highest-signal part of the record.
