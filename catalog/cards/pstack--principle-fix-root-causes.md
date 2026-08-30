---
id: pstack/principle-fix-root-causes
src: raw_source/pstack/principle-fix-root-causes/SKILL.md
sha: 5b3b7916c961c231e7ce1430cd93541204ec0ec0
status: active
mechanism: trace every symptom to its root cause and fix it there rather than adding guards
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle, debugging]
---

Symptom fixes accumulate, each workaround making the system harder to reason about while the real bug remains. Reproduce first, because if you cannot reproduce it you cannot verify the fix. Ask why until you hit the root cause. Resist adding guards - a nil check to silence a crash is a symptom fix.

Two rules stand out. **If a workaround needs a paragraph-long comment to justify it, the code is wrong** - fix the code, not the comment. That is a concrete, checkable tell rather than an exhortation. And **check for the pattern, not just the instance**: grep for the same shape and fix all of them.

The restart-bug corollary is genuinely useful and rarely written down: **code does not change between runs, state does.** When something fails after a restart, suspect stale persistent state first - config files, caches, lock files, serialized state - and if clearing a state file restores behaviour, the fix is state validation.
