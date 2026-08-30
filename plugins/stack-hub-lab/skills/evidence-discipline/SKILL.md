---
name: evidence-discipline
description: Grade how strongly a claim is actually supported before asserting it. Use when about to say something works, is safe, is fixed, or is done; when reporting results of delegated or background work; when a check passes suspiciously easily; or for "prove it", "how do you know", "are you sure", "is that verified". Applies to your own claims first.
maturity: lab
upstream:
  - src: pstack/blast-radius@4b24c77e102955af19ae60aa10af642f69eaa8ba
    took: the five-rung evidence ladder, naming the rung each claim reached, "find the one fact it is safe because of", a plausible writeup reads as convincing whether or not it is true
    rejected: slash-name invocations of /how /why /arena /unslop, assumption of a base branch named main, the diff-only framing
  - src: pstack/principle-prove-it-works@088c412cc38eb37442914a71d9e05bc6ee430a1b
    took: check the real thing not a proxy, suspect the observation method before the system, trust artifacts not self-reports
    rejected: nothing material
  - src: pstack/figure-it-out@6ffc04db212737584aac966c69c53836757fa545
    took: three verdicts with INCONCLUSIVE not counting as a pass, "when something passes too easily suspect the observation method", a blank screenshot passes a lazy gate, fix the gate in its own change rather than routing around it
    rejected: the surrounding playbook-design phases, citations of seven principle-* skills by name
  - src: pstack/why@c34bc86b6aec4e48dafa19c4f4d25f5989e9689d
    took: null results are first-class evidence, skipping a source needs written justification, hedge on purpose and never rewrite hedges to sound authoritative, separate what we found from what we infer, no shortcut by code-reading
    rejected: Cursor MCP enumeration and mcps/ directory, hardcoded model slugs, readonly-vs-agent-mode semantics, references/ sidecar prompts
  - src: pstack/show-me-your-work@8a9c731acf5bb7ad789e10ec7c5af6970dce1176
    took: evidence is a pointer not prose, audit the claims against what actually happened, "fix the log, not the story"
    rejected: the TSV format and its template, scripts/log.sh, ~/.cursor transcript paths, the mandatory different-model-family reviewer
  - src: pstack/tdd@7d923bd705e4727b0bc9a378ca0928cc825035de
    took: report the evidence rather than the outcome, name the failing-before check and the failure it produced, say why when the evidence could not be obtained
    rejected: the bug-fix workflow itself, which stays in a tdd skill
  - src: pstack/create-verification-skill@f869e26122991252373d5b8f6357e5b9ff195a00
    took: verify what a dry-run actually skips by observing rather than trusting its name, capture the action and the resulting state rather than only the final screen
    rejected: the generator, .cursor/skills paths, the feature-map structure
  - src: mattpocock/engineering/diagnosing-bugs@061c25a524acaa93d4534e9e08a793c0a5fe45fd
    took: a check is only real if it can go red on this specific thing, and the tight/deterministic/fast/unattended bar for it
    rejected: the six-phase diagnosis loop, hitl-loop.template.sh, CONTEXT.md and docs/adr assumptions
---

# evidence-discipline

Grade how strongly a claim is supported, then say so. This governs **how you claim
something works** — not how you make it work. Writing the test, fixing the bug, building
the harness are other skills' jobs; this one grades what they hand back, starting with
your own.

The failure it exists to prevent: **a writeup that sounds right reads as convincing
whether or not it is true.** Fluent prose is not evidence, and it is indistinguishable
from evidence at a glance.

## The ladder

For every claim you are about to make, get it as far down this list as is cheap, then
**name where it stopped**.

| Rung | What it means | Worth |
|---|---|---|
| 1 | You said so. | Nothing on its own. |
| 2 | You pointed at it — a real `file:line`, a config value, the library's own source. | Weak. |
| 3 | You showed the bad case cannot happen — walked the path step by step and it does not reach. | Moderate. |
| 4 | You ran it — a command, script or test exercising the real thing, that **fails loud if you are wrong**. | Strong. |
| 5 | You reproduced it in the running system. | Strongest. |

Two rules make the ladder mean anything:

- **Never round up.** Anything below rung 4 is stated as unproven, in those words. Not
  "should be fine", not "verified" with a rung-2 basis. A claim reported one rung above
  its evidence is worse than no claim, because it spends credibility it did not earn.
- **Rung 4 is usually one small script.** It is not a large investment: import the same
  library the system ships and call the exact function you are worried about. If getting
  to rung 4 looks expensive, that is usually a sign the claim is bigger than it needs to be.

## Find the one fact

Most claims rest on a single load-bearing fact. "This is safe because this call only
drops already-dead entries and does nothing else." Find that fact and prove *it*, rather
than enumerating everything that could go wrong. If it holds, most of the worry dies at
once; if it does not, the list of maybes was never the problem.

Spend the effort there. A long list of low-rung observations is worth less than one fact
at rung 4.

## Verdicts

When reporting a check, use exactly one of three:

- **VERIFIED** — reached rung 4 or 5, and the check could have failed.
- **NOT VERIFIED** — it failed, or the evidence contradicts the claim.
- **INCONCLUSIVE** — the check did not settle it.

**INCONCLUSIVE is not a pass.** It is the honest verdict when a check ran and told you
nothing, and it must never be reported as success. Most damage here comes from
inconclusive results quietly rounding to green.

## When a check passes, suspect the check

A pass is a claim too, and it is the one least likely to be examined.

- **Suspect the observation method before the system.** When verification fails, the
  check is at least as likely to be broken as the thing checked. Establish the check can
  go red before trusting it green.
- **A check that cannot fail proves nothing.** A blank screenshot passes a lazy gate. A
  test asserting the code does what the code does passes by construction. Before trusting
  a green result, know what would have made it red.
- **If it passed suspiciously easily, it probably did not run.** Wrong path, skipped
  suite, cached result, guard clause returning early.
- **Do not trust a name.** A flag called `--dry-run` is a claim, not a fact — check what
  it actually skips by observing files, network and state. Verify the action *and* the
  resulting state, not only the final screen.
- **When the gate itself is wrong, fix the gate in its own change** rather than routing
  around it or loosening it to pass.

## Delegated and background work

Anything that reports back to you is a self-report, not an artifact. Subagents,
background jobs and tools return **what they intended, not always what happened**.

So: read the artifact. `git diff` and `git status` rather than "I made the change"; the
file contents rather than "I updated the config"; the actual command output rather than a
summary of it. This is the single highest-yield rule here, because a confident summary of
work that did not happen is completely indistinguishable from one that did.

## Gaps are findings

- **A null result is evidence.** "Searched the issue tracker for the threshold and found
  no ticket" is a real finding — it says the decision was not ticketed. Report it rather
  than dropping it.
- **Name what you did not check**, and why. A gap you declare is information; a gap you
  leave silent reads as coverage you did not have.
- **Hedge on purpose.** When evidence is indirect, the language should show it — "appears
  to", "likely", "suggests". These are findings, not padding: do not tighten them later to
  sound more authoritative. That edit is the failure this skill exists to prevent.
- **Do not infer intent from shape.** Code tells you what it does, rarely why it exists.
  "It handles the null case because it checks for null" is mechanics restated, not a reason.

## Reporting

Report evidence, not outcome. Separate what you established from what you are inferring,
and keep evidence as a **pointer, not prose** — a command, a `file:line`, a commit, an
artifact path. If it takes a paragraph, it is an argument rather than evidence.

```
CLAIM      <the claim, one line>
VERDICT    VERIFIED | NOT VERIFIED | INCONCLUSIVE
RUNG       n — <what you actually did>
EVIDENCE   <command, file:line, commit, or artifact path>

INFERRED   <claims resting on indirect evidence, hedged, with the chain shown>
UNPROVEN   <claims below rung 4, named as such>
NOT CHECKED <what you did not look at, and why>
```

When you cannot get evidence at all, say so plainly and give the closest thing you did
get. "I could not reproduce this; here is what I ran and what it showed" is a useful
report. Silence on the point is not.

Finally: if the record and the story disagree, **fix the story.** A tidy account of work
that did not happen that way is the thing this whole skill is against.
