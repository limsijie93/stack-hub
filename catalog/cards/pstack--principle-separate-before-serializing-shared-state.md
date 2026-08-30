---
id: pstack/principle-separate-before-serializing-shared-state
src: raw_source/pstack/principle-separate-before-serializing-shared-state/SKILL.md
sha: 523591e0a1bda493598292358bd2142277fdbd19
status: active
mechanism: first eliminate the shared write target; only serialize structurally when sharing is a real invariant
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [principle]
---

Three ordered steps: identify shared mutable state, **default to eliminating the shared write target**, and only when one shared target is a genuine invariant, serialize access structurally - lockfiles, sequential phases, single-writer actor, atomic compare-and-swap.

The framing question is the sharp one: do these actors need one canonical object, or are they publishing independent facts? If independent, give each its own file, key, branch or state directory and merge only at the read boundary. The worked example lands it - two workers writing their own field into one `state.json` is still shared mutation, whereas `indexer-state.json` plus `metrics-state.json` is not. Splitting the file, not locking it, is the fix.

And the closing instruction inverts the usual reflex: **treat 'we need a lock' as a design smell to check, not as the default answer.** Also blunt about why conventions fail here - telling agents or goroutines to take turns does not work; instructions are not concurrency control.
