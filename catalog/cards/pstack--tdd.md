---
id: pstack/tdd
src: raw_source/pstack/tdd/SKILL.md
sha: 7d923bd705e4727b0bc9a378ca0928cc825035de
status: active
mechanism: write a failing regression test first, but only when a cheap practical test path already exists, and say so explicitly when it does not
human_in_loop: false
subject: codebase
cost: low
landmines: []
concepts: [tdd, evidence-discipline]
---

A bug-fix-shaped TDD skill, and a useful counterweight to mattpocock's. Where that one is the reference for what makes a test worth keeping, this one is mostly about **when not to write the test**: skip when the path would need broad harness setup, brittle mocks, slow end-to-end infrastructure, production-only state, vague reproduction steps, or large unrelated fixture churn.

The strongest rule is 'prefer no new test over a bad test', with a bad test defined concretely - mostly tests mocks, encodes current implementation details, depends on timing or global state, needs expensive infrastructure for a small fix, or would be deleted immediately after proving the fix. Crucially it does **not** let you silently skip: explain why a failing test is impractical *before* fixing, then choose the closest executable check available (a targeted script, a manual reproduction command, browser automation, a log assertion). And the final response must report **evidence, not outcome** - name the failing-before check and the failure it produced, name the passing-after run, and if failing-before evidence could not be demonstrated, say why. Also good: confirm the test fails *for the intended reason*, since a test failing for an unrelated reason is not a red test.
