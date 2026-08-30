---
name: fan-out-review
description: Spawn several independent reviewers over a diff, a transcript, or a document and synthesise one verdict. Use for "fan out review", "adversarial review", "multi-model review", "challenge this", "tear this apart", "find blind spots", "what did I miss", or reviewing work you do not yet trust. Never auto-applies changes.
maturity: lab
upstream:
  - src: pstack/interrogate@11fb2fbe44ab3fb531bc35cc6a4e7d06c8472264
    took: independent reviewers over one artefact, consensus as confidence signal, lead-judgment buckets, agreement map, never auto-apply
    rejected: ~/.cursor/rules/pstack-models.mdc, hardcoded cross-vendor model slugs, references/ sidecar prompts, Cursor subagent_type and readonly flags
  - src: pstack/reflect@a0e50f7eeb993559744a7a8b44b7c4f8a432d92d
    took: distinct review lenses per reviewer, structural-enforcement check, "it exists but did not trigger" as a description problem, approval before any edit
    rejected: ~/.cursor transcript globbing, hand-off to Cursor built-in create-skill, fixed three-lens table
  - src: pstack/no-comments@a14bdda050e71788638733d3b7c342be7f7a2523
    took: a claimed constraint is an unencoded invariant - offer to encode it, then delete the comment
    rejected: subagent_type "Comment Sicko" (pstack-specific named agent), slash-name invocations of /architect, /how, /why
  - src: pstack/swarm@b7e61ec7bc46629930582a50f12a6b9f1f28a368
    took: declare the selection rule before spawning, every brief stands alone, proceed at N-1 on dropout
    rejected: environment "cloud" and cloud_base_branch, per-role model config file
---

# fan-out-review

Spawn several independent reviewers over one artefact and return a single synthesised
verdict. You are the lead reviewer, not a neutral aggregator.

**Never auto-apply anything.** The deliverable is a verdict the user acts on.

## The honest caveat about model diversity

Upstream, this technique rests on fanning out across *vendors* — the claim being that
adversarial signal comes from model diversity rather than assigned personas, because
different vendors have genuinely different blind spots.

Here you have one vendor's family (`opus`, `sonnet`, `haiku`, `fable`). Model diversity
is real but narrower, so **do not lean on it alone**. Compensate by making the *lenses*
independent as well: give each reviewer a different question, not the same prompt on a
different model. Vary both axes and treat agreement as a weaker signal than upstream
does — two Claude models agreeing is closer to one opinion than two.

Say this out loud in the verdict when consensus is doing heavy lifting.

## Step 1 — scope and intent

Identify the artefact: a diff (`git diff main...HEAD`), specific files, a document, or
the session transcript. If the user pointed at something, use that.

Then state the intent in one paragraph, before spawning anything — drawn from the user's
message, commit messages, the PR description, or the code. Reviewers challenge whether
the work *achieves* the intent, not whether the intent is right. If you cannot state the
intent, ask; a fan-out against a guessed intent produces confident noise.

## Step 2 — declare the rule before you spawn

Decide and write down, before any reviewer exists:

- **Lenses.** One per reviewer, each a genuinely different question (below).
- **How findings will be selected.** Consensus-weighted, everything ranked, or act-on-only.
- **What "done" means** for this review.

Declaring after the results are in means rationalising them. This is the single most
important discipline in the skill.

## Step 3 — fan out

Launch all reviewers in **one message, multiple `Agent` calls**, so they run
concurrently. Vary lens and model together:

| Lens | The question it asks | Suggested `model` |
|---|---|---|
| Correctness | What is actually broken? Wrong logic, bad edge cases, race conditions, unhandled failure. | `opus` |
| Blast radius | What does this break *elsewhere*? Wire formats, DB columns, feature flags, callers three hops out. | `opus` |
| Simplification | What is here that need not be? Redundant abstraction, dead paths, cheaper shapes. | `sonnet` |
| Adversarial | Ignore the intent. Assume this is wrong and argue why. What did the author want to be true? | `fable` |

Use `subagent_type: "Explore"` for read-only reviewers, or `"general-purpose"` when a
reviewer must run code to check something. Scale the set to the work: two lenses for a
small diff, four or more for something wide. Adding a fifth reviewer on a lens you
already have buys almost nothing.

Every brief must stand alone — the subagent shares none of your context. Include the
intent, the artefact or how to obtain it, the lens, and the required output shape.
Forbid file writes; you apply changes, not them.

If a reviewer drops out, proceed at N-1 and say so in the verdict.

## Step 4 — synthesise

Parse every finding. Deduplicate across reviewers, noting who raised each. Separate:

- **Consensus** — raised independently by 2+ reviewers. Highest signal, with the caveat above.
- **Lone findings** — worth reading, weighted lower.
- **Disagreements** — one reviewer asserts what another denies. Often the most
  informative result in the whole run; do not average it away.

## Step 5 — lead judgment

Reviewers saw a slice. You have the goal, the constraints, the timeline, and which
trade-offs were already settled. Use that context aggressively. Sort every finding:

- **Act on** — real correctness, security or maintainability issues. Would block a PR.
- **Consider** — legitimate, but you are unsure it is worth the cost right now.
- **Noted** — valid, not actionable. Context-dependent or premature.
- **Dismissed** — wrong, nitpicky, or missing context. Say briefly why.

Show the dismissals. Hiding them hides your judgment, and the user cannot overrule what
they cannot see.

### The structural-enforcement check

Before finalising **Act on**: any finding that a lint rule, type, test, or CI check would
enforce more reliably than a human remembering it does not belong in a review verdict.
Move it to **Encode** and name the cheapest mechanism.

This extends to comments. A comment asserting a constraint — "do not remove", "must stay
in sync with X" — is an unencoded invariant. Offer the cheapest type, assertion, test or
lint that makes it real; if the user approves, encode it and delete the comment. A
constraint nobody can enforce is a wish.

## Output

```
### Intent
<the paragraph from Step 1>

### Reviewers
<lens, model, finding count — one line each; note any dropouts>

### Act on
<each: what, who raised it, why it matters, file:line>

### Consider
<each: what, who raised it, the trade-off>

### Encode
<each: the invariant, and the cheapest mechanism that enforces it>

### Noted
<brief list>

### Dismissed
<each with a one-line rationale>

### Agreement map
<where reviewers agreed, where they diverged, and what that pattern suggests —
including whether consensus here is load-bearing given single-vendor diversity>
```

Stop there. Ask before applying anything.
