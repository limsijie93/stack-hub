---
id: mattpocock/engineering/tdd
src: raw_source/mattpocock/engineering/tdd/SKILL.md
sha: 8fc086710806190ee7c4baa32089cb877a75736a
status: active
mechanism: red-green loop constrained by pre-agreed seams and three named anti-patterns
human_in_loop: true
subject: codebase
cost: low
landmines: ["sidecar references tests.md and mocking.md", "defers to codebase-design skill by name"]
concepts: [tdd]
---

Not the loop itself but the reference that makes the loop produce tests worth keeping. Tests verify behaviour through public interfaces and live at *seams*, and the strongest rule is that no test is written at an unconfirmed seam - write down the seams under test and agree them with the user first, because you cannot test everything and agreeing up front is how effort lands on critical paths.

The three anti-patterns are precisely drawn. **Implementation-coupled**, whose tell is that the test breaks on refactor when behaviour has not changed. **Tautological**, where the assertion recomputes the expected value the way the code does, so it passes by construction and can never disagree with the code - expected values must come from an independent source. **Horizontal slicing**, writing all tests then all implementation, which verifies imagined behaviour and commits to test structure before understanding the implementation; work in vertical slices, each test a tracer bullet responding to what the last cycle taught. Also notable: refactoring is explicitly *not* part of the loop and belongs to review.
