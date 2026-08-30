---
id: mattpocock/engineering/resolving-merge-conflicts
src: raw_source/mattpocock/engineering/resolving-merge-conflicts/SKILL.md
sha: bfb7e5606e231e6808979f623fce76a9aad4b71c
status: active
mechanism: recover the intent behind each conflicting side from its primary sources, resolve preserving both intents, never abort
human_in_loop: false
subject: diff
cost: low
landmines: []
concepts: [merge-resolution]
---

Five steps for an in-progress merge or rebase: read the current state, find the primary sources for each conflict (commit messages, PRs, original issues) to understand deeply why each change was made, resolve each hunk preserving both intents where possible, run the project's automated checks, finish the merge.

The load-bearing idea is that a conflict is a collision of *intents*, not of text, so the resolution step is gated on having recovered both intents from their original sources first. Three rules make it concrete: where intents are genuinely incompatible, pick the one matching the merge's stated goal and note the trade-off; never invent new behaviour while resolving; and always resolve, never --abort. Short, and none of it is tool-specific.
