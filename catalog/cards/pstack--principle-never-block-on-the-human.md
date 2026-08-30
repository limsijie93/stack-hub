---
id: pstack/principle-never-block-on-the-human
src: raw_source/pstack/principle-never-block-on-the-human/SKILL.md
sha: 0c55555f85d6636cc26429cc18016ffdafaff576
status: active
mechanism: proceed on reversible work and present the result, reserving questions for genuine ambiguity
human_in_loop: false
subject: session
cost: low
landmines: []
concepts: [principle, autonomy]
---

The human supervises asynchronously, so every permission pause makes them the bottleneck. Since code changes are reversible and reviewable, a wrong decision usually costs less than blocking. **Proceed, then present**: do the work and show the result rather than asking 'should I do X'.

The economics are stated crisply: code is cheap, attention is scarce. A wrong implementation costs minutes to fix; a blocked agent costs the human's attention to unblock.

What keeps this from being reckless is the boundary section. **Irreversible actions still require confirmation** - force-push, deleting production data, sending external messages. Reversible actions proceed. And product direction comes from the human even though execution should not block. That reversible/irreversible split is the reusable part, and it is the right axis: not importance, not size, but recoverability.
