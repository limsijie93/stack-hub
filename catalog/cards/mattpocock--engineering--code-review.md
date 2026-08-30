---
id: mattpocock/engineering/code-review
src: raw_source/mattpocock/engineering/code-review/SKILL.md
sha: e28d7acbf7b3bb4d7817b7eb5d9c105af03f6ec4
status: active
mechanism: two parallel sub-agents review the same diff on separate axes - repo standards versus originating spec - and the results are reported side by side, never merged
human_in_loop: false
subject: diff
cost: medium
landmines: ["requires docs/agents/issue-tracker.md written by the setup skill", "tells the user to run /setup-matt-pocock-skills when missing"]
concepts: [code-review, fan-out-review]
---

Diffs HEAD against a user-supplied fixed point (three-dot, so against the merge-base) and reviews it along two axes in parallel sub-agents: Standards (does it follow this repo's documented conventions?) and Spec (does it do what the originating issue asked?).

The central idea is that the two axes must never be merged or reranked, because a change can pass one and fail the other: correct code implementing the wrong thing passes Standards and fails Spec; the right feature written against convention does the reverse. Reporting them separately stops one masking the other, and the skill explicitly forbids picking a single winner across axes.

The second thing worth stealing is the smell baseline - twelve named Fowler smells (mysterious name, feature envy, data clumps, primitive obsession, shotgun surgery, speculative generality, middle man, refused bequest and the rest), each written as what-it-is then how-to-fix. It applies even when a repo documents nothing, but a documented repo standard always overrides it, and every smell is explicitly a labelled judgement call rather than a violation. Anything tooling already enforces is skipped.
