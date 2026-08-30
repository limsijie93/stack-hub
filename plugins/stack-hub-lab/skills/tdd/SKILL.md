---
name: tdd
description: Decide whether a test is worth writing, where it goes, and what makes it good. Use for TDD, "test first", "red-green", "write a failing test", "add a regression test", or before fixing a bug where a test might lock the fix down. Covers when NOT to write one, which is the more common answer.
maturity: lab
supersedes:
  - mattpocock-skills:tdd
upstream:
  - src: mattpocock/engineering/tdd@8fc086710806190ee7c4baa32089cb877a75736a
    took: no test at an unconfirmed seam, the three anti-patterns (implementation-coupled, tautological, horizontal slicing), vertical slices as tracer bullets, refactoring is not part of the loop
    rejected: sidecar tests.md and mocking.md references, the codebase-design skill dependency (seam vocabulary inlined instead)
  - src: pstack/tdd@7d923bd705e4727b0bc9a378ca0928cc825035de
    took: when not to write a test at all, "prefer no new test over a bad test" with a concrete definition of bad, never skip silently, confirm the test fails for the intended reason, the guardrails against bending tests to a wrong implementation
    rejected: the evidence-reporting contract, which evidence-discipline already owns
---

# tdd

Two questions, in order: **should this test exist**, and **where does it go**. The red→green
loop is the easy part; these are what make the test worth keeping.

## Is a test worth writing here?

Default to yes when a cheap, honest check exists. Skip when getting one would need broad
harness setup, brittle mocks, slow end-to-end infrastructure, production-only state, vague
reproduction steps, or large unrelated fixture churn.

**Prefer no new test over a bad test.** A bad test:

- mostly exercises mocks rather than the code,
- encodes current implementation details rather than intended behaviour,
- depends on timing or unrelated global state,
- needs expensive infrastructure for a small fix,
- would be deleted immediately after proving the fix.

**Never skip silently.** If you decide against a test, say so *before* making the change, say
why, and name the closest executable check you will use instead — a targeted script, a
reproduction command, a log assertion, a focused integration check. A skipped test that is
announced is a decision; one that is not is a gap nobody knows about.

## Where the test goes: seams

A **seam** is the public boundary you test at — the interface where you can observe behaviour
without reaching inside. Tests live at seams, never against internals.

**No test at an unconfirmed seam.** Before writing anything, write down the seams under test
and confirm them. You cannot test everything, and agreeing the seams up front is how the
effort lands on critical paths and complex logic instead of on every edge case. Ask plainly:
what is the public interface here, and which seams should we test?

Prefer an existing seam to a new one, and the highest seam that still reaches the behaviour.
Fewer seams is better.

**If no correct seam exists, that is itself the finding.** A test at a seam too shallow to
reach the real bug pattern gives false confidence, which is worse than no test. Say so rather
than writing the shallow one.

## The three anti-patterns

- **Implementation-coupled.** Mocks internal collaborators, tests private methods, or verifies
  through a side channel — querying the database instead of going through the interface. *The
  tell: the test breaks when you refactor but behaviour has not changed.*
- **Tautological.** The assertion recomputes the expected value the way the code does —
  `expect(add(a,b)).toBe(a+b)`, a snapshot derived by hand the same way, a constant asserted
  equal to itself. It passes by construction and can never disagree with the code. Expected
  values must come from an independent source: a known-good literal, a worked example, the spec.
- **Horizontal slicing.** All the tests first, then all the implementation. Bulk tests verify
  *imagined* behaviour — you test the shape of things, the tests go insensitive to real
  changes, and you commit to test structure before understanding the implementation.

Work in **vertical slices** instead: one test → one minimal implementation → repeat. Each test
is a tracer bullet that responds to what the last cycle taught you.

## The loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Do not
  anticipate future tests or add speculative features.
- **Confirm it fails for the intended reason.** A test that fails for an unrelated reason is
  not red — it is broken. Fix the test or the reproduction before touching the implementation.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to review, not to red→green.

## Guardrails

- Do not change a test merely to match a wrong implementation.
- Do not weaken an existing assertion unless the expected behaviour genuinely changed, and say
  why.
- Keep a regression test focused on its bug. No broad fixture churn, no unrelated coverage.
- If a bug is flaky, make the test deterministic where you can, and name the signal being
  locked down.
- If a bug exposes a wider class of failures, land the focused regression path first, then
  consider sibling coverage.

## Reporting

Report the evidence, not the outcome — name the failing-before check and the failure it
produced, then the passing-after run. If you could not demonstrate failing-before evidence,
say why and name the check you used instead.

The `evidence-discipline` skill owns that contract in full, including the rung ladder and the
three verdicts. Use it for the report rather than restating it here.
