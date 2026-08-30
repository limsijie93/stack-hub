---
id: pstack/principle-build-the-lever
src: raw_source/pstack/principle-build-the-lever/SKILL.md
sha: 8ba6740bd3bd9b2e582080bce0917cc4a7293d2f
status: active
mechanism: when work is non-trivial, build the tool that does it rather than doing it by hand
human_in_loop: false
subject: task output
cost: low
landmines: ["cross-references sibling principle skills by relative path"]
concepts: [principle, automation, evidence-discipline]
---

Two payoffs are named, and the second is the interesting one. Throughput: a codemod or script does the work the same way every time and reruns for free. **Confidence**: the tool is one artifact a reviewer can read and rerun, whereas hand-done changes can only be re-verified by redoing them. 'A deterministic script turns trust me into run this.'

The procedure is good: do the first unit by hand to learn the recipe, then build the tool, then prove it by rerunning on that unit and diffing against your hand-done version. **A deterministic lever beats fan-out** - if the tool can process every unit in one pass, run it rather than fanning out delegates to hand-apply what a script could do. When you do fan out, write the lever as a skill every delegate reads, holding the recipe, verification contract and do-not-touch fences in one artifact, kept outside their write scope so they cannot edit the contract.

Sharpest line: **applying this principle produces a file** - if you cited it and there is no script in the diff, you did not apply it. The bar is triviality, not repetition; a one-off still earns a lever when the lever is what makes the work checkable.
