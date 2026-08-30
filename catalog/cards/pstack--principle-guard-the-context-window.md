---
id: pstack/principle-guard-the-context-window
src: raw_source/pstack/principle-guard-the-context-window/SKILL.md
sha: 0862757bbb63e314f13f18528c25db85d0901078
status: active
mechanism: treat context as finite and non-renewable within a session; route large payloads to subagents
human_in_loop: false
subject: session
cost: low
landmines: []
concepts: [principle, context-management]
---

The framing does the work: unlike compute or time, **context spent inside a session cannot be reclaimed**, and overflow degrades reasoning quality and creates compression artifacts before it halts progress.

Four moves. Isolate large payloads - route verbose outputs, screenshots and large documents to subagents so the main context gets summaries, not raw data. Do not read what you will not use. Size phases and cap scope with file limits and turn budgets, accounting for mechanism costs.

The fourth is the non-obvious one and cuts against naive minimisation: **keep frequently used content inline.** Templates and references used on every invocation belong in the skill file rather than separate files that cost a read each time. Progressive disclosure has a break-even point, and this names it.
