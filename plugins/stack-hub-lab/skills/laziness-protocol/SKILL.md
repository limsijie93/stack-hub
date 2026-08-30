---
name: laziness-protocol
description: Aim for the most result with the least code. Use when refactoring, when a diff is growing, when tempted to add an abstraction, layer, wrapper or parameter, when asked to thread a new value through types or pipelines, or for "simplify this", "is this over-engineered", "can this be smaller".
maturity: lab
upstream:
  - src: pstack/principle-laziness-protocol@16bbb97426d1bbcbf957c032f0629a96a4709753
    took: the whole rule, substantially verbatim - borrow the maintainer's fatigue, the six moves, the prime directive
    changed: description rewritten around triggering moments; added a "when this does not apply" section, which upstream lacks and without which the rule argues against every necessary abstraction; kept the agent-facing premise explicit rather than generalising it away
    rejected: nothing
---

# Laziness protocol

**Writing code is cheap for you, which makes over-engineering easy.** Counter it by
borrowing a human maintainer's fatigue.

That premise is deliberately agent-facing and should stay that way. The reason this rule
exists is not that simplicity is virtuous in the abstract — it is that the usual economic
brake on writing more code does not apply to you, so it has to be reimposed on purpose.

## The moves

- **Prefer deletion.** Asked to refactor or improve, look for removals before additions.
- **Keep the call hierarchy flat.** If answering a question requires tracing more than about
  three files or layers, flatten it. *A rich interface hiding substantial work is not a deep
  call chain* — depth of behaviour is fine, depth of indirection is not.
- **Consolidate decisions.** Do not repeat the same choice in several places. Put it behind
  one source of truth and pass the result as a simple flag.
- **Minimise the diff.** The smallest change that solves the problem. Fewer lines beat
  "elegant" boilerplate.
- **Question the threading.** If a task asks you to pass a new signal through types, schemas
  and pipelines, stop and look for a more direct path. Long threading is usually a sign the
  value is being computed in the wrong place.
- **Sweat the small leaks.** Remove tiny pass-throughs, representation leaks and duplicated
  choices before they spread. Small leaks compound into permanent coordination costs.

## Prime directive

If a human developer would find the code exhausting to maintain, it is a bad solution.

## When this does not apply

This rule argues for less. It is wrong when less is not actually simpler:

- **A real invariant needs a real structure.** Collapsing a state machine into three booleans
  is fewer lines and more complexity. Fewer lines is a proxy, not the goal.
- **A seam with two real implementations has earned itself.** The rule targets speculative
  indirection, not necessary variation.
- **Duplication that is about to diverge** should stay duplicated. Consolidating two things
  that are drifting apart creates a shared abstraction neither caller wants.
- **Deleting to hit a line count** is not laziness, it is vandalism. The directive is about
  the maintainer's experience, not the diff's size.
