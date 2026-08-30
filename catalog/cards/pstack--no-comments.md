---
id: pstack/no-comments
src: raw_source/pstack/no-comments/SKILL.md
sha: a14bdda050e71788638733d3b7c342be7f7a2523
status: active
mechanism: spawn a named adversarial subagent over the diff, triage its findings, fix root causes, offer to encode claimed constraints as lint or types
human_in_loop: true
subject: diff
cost: medium
landmines: ["subagent_type: 'Comment Sicko' is a pstack-specific named agent", "invokes /architect, /how, /why by slash name", "cites pstack principle-* skills"]
concepts: [code-review, fan-out-review]
---

Spawns a dedicated comment-hostile reviewer over the diff, then triages what comes back: reject scope escapes and misstated verdicts, fix the accepted findings at the root cause, and handle 'do not remove' style comments specially.

The idea worth stealing is the last step. A comment asserting a constraint is treated as an unencoded invariant: offer the cheapest type, runtime check, test or CI lint that makes the constraint real, and if approved, encode it and delete the comment. A comment is a constraint nobody could enforce, so the fix is enforcement, not deletion. Also good: 'authoring agents defend comments, defer to the fresh perspective' - an explicit acknowledgement that the author of code is the worst judge of whether its comments earn their place.
