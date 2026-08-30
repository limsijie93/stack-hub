# 0002 — evidence-discipline

Date: 2026-08-30. Skill: `plugins/stack-hub-lab/skills/evidence-discipline/`.

## Why this cluster

Selected from the catalog, not from memory. Clustering the 67 active cards by `concepts`
gave `evidence-discipline` as the largest genuinely cross-vendor group (10 members, both
sources). `principle` (21) and `design-vocabulary` (9) are larger or comparable but the
first is single-vendor and the second is 5/9 pstack principles.

What makes it the right pick is not the size. **No upstream skill is about it.** The idea
is emergent: it lives in ten skills that are each nominally about something else.

| Source | Where the idea is hiding |
|---|---|
| `blast-radius` | the five-rung ladder, inside a change-impact skill |
| `principle-prove-it-works` | suspect the observation method, inside a one-page stance |
| `figure-it-out` | three verdicts, inside a playbook-design skill |
| `why` | null results as evidence, inside a code-archaeology skill |
| `show-me-your-work` | audit the record against reality, inside a logging format |
| `pstack/tdd` | report evidence not outcome, inside a bug-fix workflow |
| `diagnosing-bugs` | a check must be able to go red, inside a six-phase debugging loop |
| `create-verification-skill` | do not trust a `--dry-run` by its name, inside a generator |

Anyone using one of these gets one facet. Nobody gets the discipline. That is precisely
the gap a semantic layer is for, and it is a stronger case than `fan-out-review`, which
merged three skills that already did roughly the same job.

## The distinction

**This governs how you claim something works, not how you make it work.**

That single line is the boundary, and it is what keeps a 10-member cluster from becoming
a category:

- `tdd` (both vendors) writes the test. This grades the claim the test supports.
- `diagnosing-bugs` runs the diagnosis loop. This grades "it's fixed".
- `create-verification-skill` / `maintain-verification-skill` build and maintain the
  harness. This grades what the harness reports.
- `fan-out-review` gathers findings from reviewers. This grades any individual finding.

So the neighbours stay separate skills, and this one composes underneath them. It is a
lens, not a workflow — which is the objection raised when it was first proposed as a
candidate for skill #1, and it is still the main risk (see Open).

## What the synthesis adds

Three things no single upstream states:

1. **The ladder and the verdicts are joined.** `blast-radius` has rungs; `figure-it-out`
   has VERIFIED / NOT VERIFIED / INCONCLUSIVE. Neither references the other. Joined, the
   verdict is defined *by* the rung reached — VERIFIED means rung 4 or 5 — so "verified"
   stops being a feeling.
2. **A pass is a claim too.** `prove-it-works` says suspect the observation method when
   verification *fails*; `figure-it-out` says suspect it when something passes *too
   easily*. Put together, the rule generalises: a green result is the claim least likely
   to be examined, so know what would have made it red.
3. **Self-reports are named as the top risk.** Scattered across three upstreams as
   asides. Elevated here, because a confident summary of work that did not happen is
   indistinguishable from one that did — and in this environment nearly all delegated
   work reports back as prose.

## Rejected

- **Absorbing `tdd`.** Both vendors have one and they are complementary, but they are
  about constructing a test. Boundary above.
- **Absorbing `show-me-your-work`'s TSV format.** The audit *principle* transfers; the
  file format, its template and `scripts/log.sh` are a logging convention that belongs in
  its own skill if it is ever wanted.
- **`why`'s seven-category coverage map.** Excellent, but it is a research-breadth
  mechanism, not an evidence-grading one. It belongs with a `research` concept.
- **The mandatory different-model-family reviewer** from `show-me-your-work`. Sound in
  principle, but the same single-vendor caveat that `fan-out-review` already documents
  applies, and a hard requirement here would be unsatisfiable.

## Landmines ported

| Upstream | Became |
|---|---|
| `/how`, `/why`, `/arena`, `/unslop` invoked by slash name | Dropped; no cross-skill invocation. |
| Base branch assumed to be `main` | Dropped; scope is whatever the claim is about. |
| Cursor MCP enumeration, `mcps/` directory | Dropped with `why`'s coverage map. |
| Hardcoded model slugs, `readonly` vs agent mode | Dropped. |
| `references/*.md` sidecars (`why`, `show-me-your-work`) | Inlined; `raw_source/` does not ship. |
| `scripts/log.sh`, `decision-log-template.tsv` | Dropped with the TSV format. |
| `~/.cursor` transcript paths | Dropped; "audit against what actually happened". |
| `hitl-loop.template.sh`, `CONTEXT.md`/`docs/adr` | Dropped with the diagnosis loop. |
| Citations of seven `principle-*` skills by name | Dropped; the content is inlined instead. |

## Open

- **Routing.** This is a lens, not a task, so the description leans on the moments it
  should fire — about to claim something works, reporting delegated work, a check passing
  too easily — rather than on a noun. If it does not auto-trigger in practice, the fix is
  description tuning, not content (`reflect`'s diagnosis: "the skill exists but did not
  trigger" is a description problem).
- **Overlap with `fan-out-review`'s Act on / Consider / Noted / Dismissed.** Different
  axes — that sorts findings by importance, this grades them by support — but if they
  read as redundant in use, one should cite the other rather than both drifting.
- Promotion still needs three real uses. Both lab skills are unproven.
